<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>

                    {{ customPagesStore.getCustomPagesName?.dutySchedules }}
                    -
                    {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb>
                    <template #custom-link>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400"
                                aria-hidden="true" />
                            <button @click="navigateTo('/schedules')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ customPagesStore.getCustomPagesName?.dutySchedules }}
                            </button>
                        </div>
                    </template>
                </Breadcrumb>
            </template>

            <template #guided-tour>
                <div class="flex flex-wrap items-center gap-3">
                    <button @click="state.modal.isShowAllShiftTypes = !state.modal.isShowAllShiftTypes"
                        class="text-primary text-sm hover:text-primary-700">
                        {{ $t('dutySchedules.showTheDistributionOfShiftTypes') }}
                    </button>
                    <FormButton buttonStyle="action" class="rounded-lg" @click="navigateTo('/schedules/draft')"
                        v-if="isAdmin(userStore.getUser?.role)">
                        <Icon name="ph:note" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('dutySchedules.draft.pageTitle') }}
                    </FormButton>
                    <FormButton buttonStyle="action" class="rounded-lg" @click="state.modal.isDownloadOpen = true">
                        <Icon name="ph:download" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('dutySchedules.download.download') }}
                    </FormButton>
                    <FormButton buttonStyle="action" class="rounded-lg" @click="openZenegySyncModal">
                        <Icon name="ph:arrows-clockwise" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('dutySchedules.zenegy_sync') }}
                    </FormButton>
                    <Tooltip :text="$t('dutySchedules.activityLogs')" @click="openDutySchedulesActivityLogs()">
                        <Icon name="ph:clock-counter-clockwise" class="size-6 cursor-pointer text-gray-700"
                            aria-hidden="true" />
                    </Tooltip>
                    <Tooltip :text="$t('guidedTour')" @click="openGuidedTour()">
                        <Icon name="ph:question" class="size-6 cursor-pointer text-gray-700" aria-hidden="true" />
                    </Tooltip>
                </div>
            </template>

            <!-- <div class="flex items-center gap-x-3">
                <FormButton :buttonStyle="state.calendarView === 'default' ? 'primary' : ''"
                    @click="setCalendarView('default')" class="rounded-md">
                    {{ $t('calendar.view.defaultView') }}
                </FormButton>
                <FormButton :buttonStyle="state.calendarView === 'week' ? 'primary' : ''"
                    @click="setCalendarView('week')" class="rounded-md">
                    {{ $t('calendar.view.weekView') }}
                </FormButton>
                <FormButton :buttonStyle="state.calendarView === 'month' ? 'primary' : ''"
                    @click="setCalendarView('month')" class="rounded-md">
                    {{ $t('calendar.view.monthView') }}
                </FormButton>
            </div> -->

            <div class="-mt-4 space-y-5">
                <ModulesUserDutyScheduleWeekView ref="weekViewRef" v-if="state.calendarView === 'week'"
                    @setDutyScheduleCurrentDate="setDutyScheduleCurrentDate" />
            </div>

            <ModulesUserDutyScheduleModalShiftTypes :isModalOpen="state.modal.isShowAllShiftTypes"
                @close="state.modal.isShowAllShiftTypes = false" />
            <ModulesUserDutyScheduleActivityLogsModalHistory :isModalOpen="state.modal.isActivityLogsOpen"
                @close="state.modal.isActivityLogsOpen = false" />
            <ModulesUserGuidedTourModalDutySchedule v-if="state.modal.isGuidedTourDutyScheduleOpen"
                :isModalOpen="state.modal.isGuidedTourDutyScheduleOpen" :isGuidedTour="false"
                @close="state.modal.isGuidedTourDutyScheduleOpen = false" />
        </NuxtLayout>
        <ModulesUserDutyScheduleModalDownload :isModalOpen="state.modal.isDownloadOpen"
            :selectedDate="state.selectedDate" @close="state.modal.isDownloadOpen = false" />

        <Modal size="sm" :title="$t('dutySchedules.zenegy_sync')" :show="state.modal.isZenegySyncOpen"
            @close="state.modal.isZenegySyncOpen = false">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isSyncing">
                    <div class="space-y-4">
                        <p class="text-sm text-gray-600">
                            {{ $t('dutySchedules.zenegy_sync_department_message') }}
                        </p>
                        <div class="space-y-1">
                            <FormLabel for="zenegy_department_uuid"
                                :label="customPagesStore.getCustomPagesName?.department ?? $t('department.department')" />
                            <FormSelect id="zenegy_department_uuid" name="zenegy_department_uuid"
                                :placeholder="customPagesStore.getCustomPagesName?.department ?? $t('department.department')"
                                :options="state.departmentOptions" v-model="state.selectedDepartmentUuid" />
                        </div>
                        <div class="grid grid-cols-2 gap-3 mt-4">
                            <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                                @click="state.modal.isZenegySyncOpen = false">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="primary" class="rounded-md"
                                :disabled="!state.selectedDepartmentUuid" @click="syncZenegyEmployees">
                                {{ $t('dutySchedules.zenegy_sync') }}
                            </FormButton>
                        </div>
                    </div>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useUserStore } from '@/store/user'
import { useCustomPagesStore } from '@/store/custom-pages'
import { zenegyService } from '@/components/api/user/ZenegyService'
import { departmentService } from '@/components/api/user/DepartmentService'
import { useDepartmentStore } from '@/store/department'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'

const runtimeConfig = useRuntimeConfig()
const customPagesStore = useCustomPagesStore() as any
const userStore = useUserStore() as any
const departmentStore = useDepartmentStore() as any
const { successAlert, errorAlert } = useAlert()
const { t } = useI18n()
const weekViewRef = ref()

const state = reactive({
    calendarView: 'week',
    departmentOptions: [] as Array<{ value: string; label: string }>,
    isSyncing: false,
    modal: {
        isActivityLogsOpen: false,
        isDownloadOpen: false,
        isGuidedTourDutyScheduleOpen: false,
        isShowAllShiftTypes: false,
        isZenegySyncOpen: false,
    },
    selectedDate: moment().format('YYYY-MM-DD'),
    selectedDepartmentUuid: '' as string,
})

function openDutySchedulesActivityLogs() {
    state.modal.isActivityLogsOpen = true
}

function openGuidedTour() {
    state.modal.isGuidedTourDutyScheduleOpen = true
}

function isAdmin(role: any) {
    return role && role === 'Admin'
}

function setDutyScheduleCurrentDate(selectedDate: any) {
    state.selectedDate = selectedDate
}

async function openZenegySyncModal() {
    state.modal.isZenegySyncOpen = true
    await fetchDepartments()
}

async function fetchDepartments() {
    try {
        const response = await departmentService.getAllDepartments({})
        if (response?.data) {
            state.departmentOptions = response.data.map((dept: any) => ({
                value: dept.uuid,
                label: dept.name,
            }))
            // Pre-select current department if one is selected
            const currentDept = departmentStore.getSelectedDepartment?.uuid
            if (currentDept && state.departmentOptions.some((opt: any) => opt.value === currentDept)) {
                state.selectedDepartmentUuid = currentDept
            }
        }
    } catch (e: any) {
        errorAlert(t('alert.error'), e?.message || 'Failed to fetch departments')
    }
}

async function syncZenegyEmployees() {
    state.isSyncing = true
    try {
        const response = await zenegyService.getEmployees()
        if (response?.success && response?.employees?.data) {
            const employees = response.employees.data
            const syncResponse = await zenegyService.syncUsers(employees, state.selectedDepartmentUuid)
            const syncData = syncResponse?.data?.data || syncResponse?.data || []
            const errors = syncData.filter((item: any) => item?.error)

            if (errors.length > 0) {
                errorAlert(
                    t('alert.warning'),
                    `${t('dutySchedules.zenegy_sync')}: ${errors.length} error(s) - ${errors.map((e: any) => e.error).join(', ')}`
                )
            } else {
                successAlert(`${t('alert.success')}!`, `${t('dutySchedules.zenegy_sync')} ${t('alert.success')}`)
            }

            state.modal.isZenegySyncOpen = false
            // Refresh duty schedule to show newly synced employees
            weekViewRef.value?.refreshSchedule()
        } else {
            throw new Error('Unexpected response from Zenegy')
        }
    } catch (e: any) {
        errorAlert(t('alert.error'), e?.message || 'Failed to sync with Zenegy')
    }
    state.isSyncing = false
}
</script>