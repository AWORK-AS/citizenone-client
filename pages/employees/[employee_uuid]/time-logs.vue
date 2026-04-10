<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('employees.timeLogs') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('employees.timeLogs') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/employees">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesUserEmployeeTabs />

                <div class="mt-10 space-y-5">
                    <div class="flex items-center justify-between">
                        <div>
                            <button class="flex items-center gap-x-1 text-sm text-primary group"
                                @click="state.modal.isFilterTimeLogsOpen = true">
                                <Icon name="ic:outline-filter-list"
                                    class="text-primary w-6 h-6 group-hover:text-primary-700" />
                                <span class="group-hover:text-primary-700">
                                    {{ $t('filter') }}
                                </span>
                            </button>
                        </div>
                        <div class="flex flex-wrap items-center justify-end gap-3">
                            <FormButton buttonStyle="action" class="rounded-lg" @click="viewInterventionHours">
                                <Icon name="ph:clock" class="h-4 w-4" aria-hidden="true" />
                                {{ $t('timeLogs.interventionHours') }}
                            </FormButton>
                            <FormButton buttonStyle="action" class="rounded-lg"
                                @click="state.modal.isAddNewTimeLogOpen = true">
                                <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                {{ isAdmin(userStore.getUser?.roles) ?
                                    $t('timeLogs.newTimeLog') :
                                    $t('timeLogs.requestNewTimeLog') }}
                            </FormButton>
                            <FormButton buttonStyle="action" class="rounded-lg"
                                @click="state.modal.isDownloadTimeLogsOpen = true">
                                <Icon name="ph:download" class="h-4 w-4" aria-hidden="true" />
                                {{ $t('timeLogs.download.download') }}
                            </FormButton>
                        </div>
                    </div>
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.logs" :isLoading="state.isTableLoading"
                            :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.logs?.data?.length === 0))">
                                <tr v-for="(log, index) in state.logs?.data" :key="index">
                                    <td width="20%">
                                        <span class="truncate">
                                            {{ formatDateTimeToReadable(log?.created_at) }}
                                        </span>
                                    </td>
                                    <td width="20%">
                                        <span class="truncate" v-if="log?.date_time_start">
                                            {{ formatDateTimeToReadable(log?.date_time_start) }}
                                        </span>
                                    </td>
                                    <td width="20%">
                                        <span class="truncate" v-if="log?.date_time_end">
                                            {{ formatDateTimeToReadable(log?.date_time_end) }}
                                        </span>
                                    </td>
                                    <td width="10%">
                                        <Badge type="primary" class="w-fit truncate"
                                            v-if="log?.status === 'cancelled_by_citizen'">
                                            <p class="text-xxs">
                                                {{ $t('timeLogs.table.status.cancelledByCitizen') }}
                                            </p>
                                        </Badge>
                                        <Badge type="primary" class="w-fit truncate"
                                            v-if="log?.status === 'cancelled_by_employee'">
                                            <p class="text-xxs">
                                                {{ $t('timeLogs.table.status.cancelledByEmployee') }}
                                            </p>
                                        </Badge>
                                        <Badge type="primary" class="w-fit truncate" v-if="log?.status === 'completed'">
                                            <p class="text-xxs">
                                                {{ $t('timeLogs.table.status.completed') }}
                                            </p>
                                        </Badge>
                                    </td>
                                    <td width="15%">
                                        <span>{{ log?.remarks }}</span>
                                    </td>
                                    <td width="5%">
                                        <span>{{ log?.time_summary }}</span>
                                    </td>
                                    <td width="10%">
                                        <Badge type="active" class="w-fit" v-if="log?.request_status === 'approved'">
                                            <p class="text-xxs">{{ $t('timeLogs.table.requestStatus.approved') }}</p>
                                        </Badge>
                                        <Badge type="inactive" class="w-fit"
                                            v-else-if="log?.request_status === 'declined'">
                                            <p class="text-xxs">{{ $t('timeLogs.table.requestStatus.declined') }}</p>
                                        </Badge>
                                        <Badge type="pending" class="w-fit"
                                            v-else-if="log?.request_status === 'pending'">
                                            <p class="text-xxs">{{ $t('timeLogs.table.requestStatus.pending') }}</p>
                                        </Badge>
                                    </td>
                                    <td width="10%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="confirmTimeLogApproval(log)"
                                                v-if="log?.request_status === 'pending' && isAdmin(userStore.getUser?.roles)">
                                                <Icon name="ph:check" class="size-4" />
                                                {{ $t('timeLogs.table.actions.approve') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                                @click="confirmTimeLogDecline(log)"
                                                v-if="log?.request_status === 'pending' && isAdmin(userStore.getUser?.roles)">
                                                <Icon name="ph:x" class="size-4" />
                                                {{ $t('timeLogs.table.actions.decline') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="viewTimeLog(log)">
                                                <Icon name="ph:eye" class="size-4" />
                                                {{ $t('timeLogs.table.actions.view') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="editTimeLog(log)" v-if="log?.is_editable">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('timeLogs.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                                @click="confirmTimeLogDeletion(log)" v-if="log?.is_deletable">
                                                <Icon name="heroicons:trash" class="size-4" />
                                                {{ $t('timeLogs.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.logs" @previous="previous" @next="next" />
                </div>
            </div>
            <ModulesUserTimeRegistrationModalFilter :isModalOpen="state.modal.isFilterTimeLogsOpen"
                @close="state.modal.isFilterTimeLogsOpen = false" @setFilter="setFilter" />
            <ModulesUserTimeRegistrationModalDownload :isModalOpen="state.modal.isDownloadTimeLogsOpen"
                @close="state.modal.isDownloadTimeLogsOpen = false" />
            <ModulesUserTimeRegistrationModalNew :isModalOpen="state.modal.isAddNewTimeLogOpen"
                @close="state.modal.isAddNewTimeLogOpen = false" @refreshTimeLogs="fetchTimeLogs" />
            <ModulesUserTimeRegistrationModalEdit :isModalOpen="state.modal.isEditTimeLogOpen"
                :selectedTimeLog="state.selectedTimeLog" @close="state.modal.isEditTimeLogOpen = false"
                @refreshTimeLogs="fetchTimeLogs" />
            <ModulesUserSettingsTimeLogsInterventionHoursEmployeeModal v-if="employeeUuid"
                :employeeUuid="employeeUuid.toString()" :isModalOpen="state.modal.isInterventionHoursOpen"
                @close="state.modal.isInterventionHoursOpen = false" />
            <ModulesUserTimeRegistrationModalViewLog :isModalOpen="state.modal.isViewTimeLogOpen"
                :selectedTimeLog="state.selectedTimeLog" @close="state.modal.isViewTimeLogOpen = false" />
            <DialogConfirmation :isModalOpen="state.modal.isDeleteTimeLogConfirmationOpen"
                :message="`${$t('timeLogs.table.confirmation.deleteTimeLogConfirmation')}?`"
                @close="state.modal.isDeleteTimeLogConfirmationOpen = false" @confirm="deleteTimeLog" />
            <DialogConfirmation :isModalOpen="state.modal.isApproveTimeLogConfirmationOpen"
                :message="`${$t('timeLogs.table.confirmation.approveTimeLogConfirmation')}?`"
                @close="state.modal.isApproveTimeLogConfirmationOpen = false" @confirm="approveTimeLog" />
            <DialogConfirmation :isModalOpen="state.modal.isDeclineTimeLogConfirmationOpen"
                :message="`${$t('timeLogs.table.confirmation.declineTimeLogConfirmation')}?`"
                @close="state.modal.isDeclineTimeLogConfirmationOpen = false" @confirm="declineTimeLog" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { timeLogService } from '@/components/api/user/TimeLogService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatDateTimeToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
const userStore = useUserStore() as any
const router = useRouter()
const employeeUuid = router?.currentRoute?.value?.params?.employee_uuid
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'employees.employees',
        translate: true,
        href: '/employees',
    },
    {
        name: 'employees.timeLogs',
        translate: true,
        href: `/employees/${employeeUuid}/time-logs`,
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'timeLogs.table.createdAt', isTranslateName: true, sorter: true, key: 'created_at' },
        { name: 'timeLogs.table.dateTimeStart', isTranslateName: true, sorter: true, key: 'date_time_start' },
        { name: 'timeLogs.table.dateTimeEnd', isTranslateName: true, sorter: true, key: 'date_time_end' },
        { name: 'timeLogs.table.status.status', isTranslateName: true, sorter: true, key: 'status' },
        { name: 'timeLogs.table.remarks', isTranslateName: true, },
        { name: 'timeLogs.table.summary', isTranslateName: true, },
        { name: 'timeLogs.table.requestStatus.requestStatus', isTranslateName: true, },
        { name: '' },
    ],
    error: {} as Error,
    filter: {
        statuses: []
    },
    isTableLoading: false,
    logs: [] as any,
    modal: {
        isAddNewTimeLogOpen: false,
        isApproveTimeLogConfirmationOpen: false,
        isDeclineTimeLogConfirmationOpen: false,
        isDeleteTimeLogConfirmationOpen: false,
        isDownloadTimeLogsOpen: false,
        isEditTimeLogOpen: false,
        isFilterTimeLogsOpen: false,
        isInterventionHoursOpen: false,
        isViewTimeLogOpen: false
    },
    selectedTimeLog: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchTimeLogs()
})

async function fetchTimeLogs() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
        } as any
        if (state.filter.statuses?.length > 0) {
            params.statuses = Array(state.filter.statuses)
        }
        const response = await timeLogService.getEmployeeTimeLogs(employeeUuid, params)
        if (response) {
            state.logs = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchTimeLogs()
}

function next() {
    currentTablePage++
    fetchTimeLogs()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchTimeLogs()
}

function isAdmin(roles: any) {
    return roles && roles.some((role: any) => role.name === 'Admin')
}

function editTimeLog(log: any) {
    state.selectedTimeLog = log
    state.modal.isEditTimeLogOpen = true
}

function confirmTimeLogDeletion(log: any) {
    state.selectedTimeLog = log
    state.modal.isDeleteTimeLogConfirmationOpen = true
}

async function deleteTimeLog() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await timeLogService.deleteTimeLog(state.selectedTimeLog.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchTimeLogs()
            successAlert(`${t('alert.success')}!`, `${t('timeLogs.table.alert.timeLogSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function confirmTimeLogApproval(log: any) {
    state.selectedTimeLog = log
    state.modal.isApproveTimeLogConfirmationOpen = true
}

function confirmTimeLogDecline(log: any) {
    state.selectedTimeLog = log
    state.modal.isDeclineTimeLogConfirmationOpen = true
}

async function approveTimeLog() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await timeLogService.approveTimeLogRequest(state.selectedTimeLog.uuid)
        if (response?.data) {
            fetchTimeLogs()
            successAlert(`${t('alert.success')}!`, `${t('timeLogs.table.alert.timeLogSuccessfullyApproved')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

async function declineTimeLog() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await timeLogService.declineTimeLogRequest(state.selectedTimeLog.uuid)
        if (response?.data) {
            fetchTimeLogs()
            successAlert(`${t('alert.success')}!`, `${t('timeLogs.table.alert.timeLogSuccessfullyDeclined')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function setFilter(filter: any) {
    state.filter.statuses = filter.statuses
    fetchTimeLogs()
}

function viewInterventionHours() {
    state.modal.isInterventionHoursOpen = true
}

function viewTimeLog(log: any) {
    state.selectedTimeLog = log
    state.modal.isViewTimeLogOpen = true
}
</script>