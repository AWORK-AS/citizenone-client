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
                    <FormButton v-if="state.isZenegyConnected" buttonStyle="action" class="rounded-lg" @click="openZenegySyncModal">
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

        <Modal size="md" :title="$t('dutySchedules.zenegy_sync')" :show="state.modal.isZenegySyncOpen"
            @close="state.modal.isZenegySyncOpen = false">
            <template #modal-body>
                <div>
                    <!-- Tabs -->
                    <div class="flex gap-2 border-b border-gray-200 pb-3 mb-4">
                        <button type="button"
                            :class="[state.syncModalTab === 'sync' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200', 'rounded-md px-4 py-1.5 text-sm font-medium transition-colors']"
                            @click="state.syncModalTab = 'sync'">
                            {{ $t('dutySchedules.zenegy_tab_sync') }}
                        </button>
                        <button type="button"
                            :class="[state.syncModalTab === 'archive' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200', 'rounded-md px-4 py-1.5 text-sm font-medium transition-colors']"
                            @click="switchToArchiveTab">
                            {{ $t('dutySchedules.zenegy_tab_archive') }}
                        </button>
                    </div>

                    <!-- Sync Tab -->
                    <LoadingSpinner v-if="state.syncModalTab === 'sync'" :isActive="state.isSyncing">
                        <div class="space-y-4">
                            <!-- Saved presets -->
                            <div v-if="presetOptions.length > 0" class="space-y-1">
                                <FormLabel :label="$t('dutySchedules.zenegy_saved_presets')" />
                                <div class="flex items-center gap-2">
                                    <div class="flex-1">
                                        <FormSelect
                                            :placeholder="$t('dutySchedules.zenegy_preset_placeholder')"
                                            :options="presetOptions" v-model="state.selectedPreset"
                                            @update:modelValue="loadPreset" />
                                    </div>
                                    <button v-if="state.selectedPreset !== null" type="button"
                                        class="shrink-0 rounded-md p-2 text-gray-400 hover:text-red-500"
                                        @click="deletePreset(state.selectedPreset)">
                                        <Icon name="ph:trash" class="h-5 w-5" aria-hidden="true" />
                                    </button>
                                </div>
                            </div>

                            <!-- Employee selection -->
                            <div class="space-y-2">
                                <FormLabel :label="$t('dutySchedules.zenegy_select_employees')" />
                                <LoadingSpinner :isActive="state.isLoadingEmployees">
                                    <div v-if="state.zenegyEmployees.length > 0">
                                        <div class="flex w-fit cursor-pointer items-center gap-x-2 border-b border-gray-200 pb-2 text-sm font-medium"
                                            @click="toggleSelectAllEmployees">
                                            <FormCheckbox :value="state.selectAllEmployees" />
                                            <span>{{ $t('dutySchedules.zenegy_select_all') }}</span>
                                            <span class="text-gray-400">({{ selectedEmployeeCount }}/{{
                                                state.zenegyEmployees.length }})</span>
                                        </div>
                                        <div class="mt-2 max-h-60 space-y-1 overflow-y-auto">
                                            <div v-for="(employee, index) in state.zenegyEmployees"
                                                :key="employee.id"
                                                class="flex w-fit cursor-pointer items-center gap-x-2 text-sm"
                                                @click="toggleEmployeeSelection(index)">
                                                <FormCheckbox :value="employee.selected" />
                                                <span>{{ employee.name }}</span>
                                                <span v-if="employee.email" class="text-xs text-gray-400">{{
                                                    employee.email }}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p v-else-if="!state.isLoadingEmployees" class="text-sm text-gray-500">
                                        {{ $t('dutySchedules.zenegy_no_employees') }}
                                    </p>
                                </LoadingSpinner>
                            </div>

                            <!-- Department selection -->
                            <div class="space-y-1">
                                <FormLabel for="zenegy_department_uuid"
                                    :label="customPagesStore.getCustomPagesName?.department ?? $t('department.department')" />
                                <FormSelect id="zenegy_department_uuid" name="zenegy_department_uuid"
                                    :placeholder="customPagesStore.getCustomPagesName?.department ?? $t('department.department')"
                                    :options="state.departmentOptions" v-model="state.selectedDepartmentUuid" />
                            </div>

                            <!-- Save preset -->
                            <div class="border-t border-gray-200 pt-3">
                                <button v-if="!state.isSavePresetOpen" type="button"
                                    class="flex items-center gap-x-1 text-sm text-gray-500 hover:text-gray-700"
                                    @click="state.isSavePresetOpen = true">
                                    <Icon name="ph:floppy-disk" class="h-4 w-4" aria-hidden="true" />
                                    {{ $t('dutySchedules.zenegy_save_preset') }}
                                </button>
                                <div v-else class="flex items-center gap-2">
                                    <input v-model="state.presetName" type="text"
                                        :placeholder="$t('dutySchedules.zenegy_preset_name')"
                                        class="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                                    <FormButton type="button" buttonStyle="action" class="shrink-0 rounded-md"
                                        :disabled="!state.presetName.trim()" @click="savePreset">
                                        {{ $t('dutySchedules.zenegy_preset_save') }}
                                    </FormButton>
                                    <button type="button"
                                        class="shrink-0 text-sm text-gray-400 hover:text-gray-600"
                                        @click="state.isSavePresetOpen = false; state.presetName = ''">
                                        {{ $t('cancel') }}
                                    </button>
                                </div>
                            </div>

                            <!-- Sync action buttons -->
                            <div class="grid grid-cols-2 gap-3 mt-4">
                                <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                                    @click="state.modal.isZenegySyncOpen = false">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="button" buttonStyle="primary" class="rounded-md"
                                    :disabled="!state.selectedDepartmentUuid || selectedEmployeeCount === 0"
                                    @click="syncZenegyEmployees">
                                    {{ $t('dutySchedules.zenegy_sync') }}
                                </FormButton>
                            </div>
                        </div>
                    </LoadingSpinner>

                    <!-- Archive Tab -->
                    <LoadingSpinner v-if="state.syncModalTab === 'archive'" :isActive="state.isArchiving">
                        <div class="space-y-4">
                            <p class="text-sm text-gray-600">
                                {{ $t('dutySchedules.zenegy_archive_description') }}
                            </p>

                            <!-- Employee list -->
                            <div class="space-y-2">
                                <div v-if="state.archiveEmployees.length > 0">
                                    <div class="flex w-fit cursor-pointer items-center gap-x-2 border-b border-gray-200 pb-2 text-sm font-medium"
                                        @click="toggleSelectAllArchiveEmployees">
                                        <FormCheckbox :value="state.selectAllArchiveEmployees" />
                                        <span>{{ $t('dutySchedules.zenegy_select_all') }}</span>
                                        <span class="text-gray-400">({{ selectedArchiveCount }}/{{
                                            state.archiveEmployees.length }})</span>
                                    </div>
                                    <div class="mt-2 max-h-60 space-y-1 overflow-y-auto">
                                        <div v-for="(employee, index) in state.archiveEmployees"
                                            :key="employee.id"
                                            class="flex w-fit cursor-pointer items-center gap-x-2 text-sm"
                                            @click="toggleArchiveEmployeeSelection(index)">
                                            <FormCheckbox :value="employee.selected" />
                                            <span>{{ employee.name }}</span>
                                            <span v-if="employee.email" class="text-xs text-gray-400">{{
                                                employee.email }}</span>
                                        </div>
                                    </div>
                                </div>
                                <p v-else class="text-sm text-gray-500">
                                    {{ $t('dutySchedules.zenegy_no_employees') }}
                                </p>
                            </div>

                            <!-- Archive action buttons -->
                            <div v-if="state.confirmArchive" class="rounded-md bg-red-50 border border-red-200 p-3 mt-4">
                                <p class="text-sm text-red-700 mb-3">{{ $t('dutySchedules.zenegy_archive_confirm') }}</p>
                                <div class="grid grid-cols-2 gap-3">
                                    <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                                        @click="state.confirmArchive = false">
                                        {{ $t('cancel') }}
                                    </FormButton>
                                    <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                        @click="archiveSelectedEmployees">
                                        {{ $t('confirm') }}
                                    </FormButton>
                                </div>
                            </div>
                            <div v-else class="grid grid-cols-2 gap-3 mt-4">
                                <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                                    @click="state.modal.isZenegySyncOpen = false">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                    :disabled="selectedArchiveCount === 0" @click="state.confirmArchive = true">
                                    {{ $t('dutySchedules.zenegy_archive_employees') }} ({{ selectedArchiveCount
                                    }})
                                </FormButton>
                            </div>
                        </div>
                    </LoadingSpinner>
                </div>
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
import { employeeService } from '@/components/api/user/EmployeeService'
import { useDepartmentStore } from '@/store/department'
import { useZenegySyncStore } from '@/store/zenegy-sync'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'

const runtimeConfig = useRuntimeConfig()
const customPagesStore = useCustomPagesStore() as any
const userStore = useUserStore() as any
const departmentStore = useDepartmentStore() as any
const zenegySyncStore = useZenegySyncStore() as any
const { successAlert, errorAlert } = useAlert()
const { t } = useI18n()
const weekViewRef = ref()

const state = reactive({
    calendarView: 'week',
    archiveEmployees: [] as Array<{ id: any; name: string; email: string; selected: boolean }>,
    departmentOptions: [] as Array<{ value: string; label: string }>,
    isArchiving: false,
    isLoadingEmployees: false,
    isSyncing: false,
    isZenegyConnected: false,
    selectAllArchiveEmployees: false,
    syncModalTab: 'sync' as 'sync' | 'archive',
    modal: {
        isActivityLogsOpen: false,
        isDownloadOpen: false,
        isGuidedTourDutyScheduleOpen: false,
        isShowAllShiftTypes: false,
        isZenegySyncOpen: false,
    },
    confirmArchive: false,
    isSavePresetOpen: false,
    presetName: '' as string,
    selectAllEmployees: true,
    selectedDate: moment().format('YYYY-MM-DD'),
    selectedDepartmentUuid: '' as string,
    selectedPreset: null as number | null,
    zenegyEmployees: [] as Array<{ id: any; name: string; email: string; selected: boolean }>,
    zenegyEmployeesRaw: [] as any[],
})

const selectedEmployeeCount = computed(() =>
    state.zenegyEmployees.filter(emp => emp.selected).length
)

const selectedArchiveCount = computed(() =>
    state.archiveEmployees.filter(emp => emp.selected).length
)

onMounted(async () => {
    try {
        const status = await zenegyService.getZenegyStatus()
        state.isZenegyConnected = status?.connected || false
    } catch {
        state.isZenegyConnected = false
    }
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
    state.syncModalTab = 'sync'
    state.isLoadingEmployees = true
    state.zenegyEmployees = []
    state.zenegyEmployeesRaw = []
    state.selectAllEmployees = true
    state.selectedPreset = null
    state.presetName = ''
    state.isSavePresetOpen = false
    state.archiveEmployees = []
    state.selectAllArchiveEmployees = false
    await Promise.all([fetchDepartments(), fetchZenegyEmployees()])
}

async function fetchZenegyEmployees() {
    try {
        const response = await zenegyService.getEmployees()
        if (response?.success && response?.employees?.data) {
            state.zenegyEmployeesRaw = response.employees.data
            state.zenegyEmployees = response.employees.data.map((emp: any) => ({
                id: emp.id,
                name: emp.name || `${emp.first_name || emp.firstName || ''} ${emp.last_name || emp.lastName || ''}`.trim() || 'Unknown',
                email: emp.email || '',
                selected: true,
            }))
            console.log('[Zenegy] Employee data sample:', response.employees.data[0]) 
        }
    } catch (e: any) {
        errorAlert(t('alert.error'), e?.message || 'Failed to fetch Zenegy employees')
    } finally {
        state.isLoadingEmployees = false
    }
}

function toggleSelectAllEmployees() {
    state.selectAllEmployees = !state.selectAllEmployees
    state.zenegyEmployees.forEach(emp => emp.selected = state.selectAllEmployees)
}

function toggleEmployeeSelection(index: number) {
    state.zenegyEmployees[index].selected = !state.zenegyEmployees[index].selected
    state.selectAllEmployees = state.zenegyEmployees.every(emp => emp.selected)
    state.selectedPreset = null
}

const presetOptions = computed(() =>
    zenegySyncStore.getPresets.map((p: any, i: number) => ({ value: i, label: p.name }))
)

function loadPreset(presetIndex: number | null) {
    if (presetIndex === null || presetIndex === undefined) {
        state.selectedPreset = null
        return
    }
    const preset = zenegySyncStore.getPresets[presetIndex]
    if (!preset) return
    state.selectedDepartmentUuid = preset.departmentUuid
    const savedIds = new Set(preset.employeeIds)
    state.zenegyEmployees.forEach((emp: any) => {
        emp.selected = savedIds.has(emp.id)
    })
    state.selectAllEmployees = state.zenegyEmployees.every((emp: any) => emp.selected)
    state.selectedPreset = presetIndex
}

function savePreset() {
    if (!state.presetName.trim()) return
    const selectedIds = state.zenegyEmployees.filter((e: any) => e.selected).map((e: any) => e.id)
    zenegySyncStore.addPreset({
        name: state.presetName.trim(),
        employeeIds: selectedIds,
        departmentUuid: state.selectedDepartmentUuid,
    })
    state.presetName = ''
    state.isSavePresetOpen = false
    successAlert(t('alert.success') + '!', t('dutySchedules.zenegy_preset_saved'))
}

function deletePreset(index: number) {
    zenegySyncStore.removePreset(index)
    state.selectedPreset = null
    state.zenegyEmployees.forEach((emp: any) => emp.selected = true)
    state.selectAllEmployees = true
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

function switchToArchiveTab() {
    state.syncModalTab = 'archive'
    state.confirmArchive = false
    state.archiveEmployees = state.zenegyEmployees.map(emp => ({
        id: emp.id,
        name: emp.name,
        email: emp.email,
        selected: false,
    }))
    state.selectAllArchiveEmployees = false
}

function toggleSelectAllArchiveEmployees() {
    state.selectAllArchiveEmployees = !state.selectAllArchiveEmployees
    state.archiveEmployees.forEach(emp => emp.selected = state.selectAllArchiveEmployees)
}

function toggleArchiveEmployeeSelection(index: number) {
    state.archiveEmployees[index].selected = !state.archiveEmployees[index].selected
    state.selectAllArchiveEmployees = state.archiveEmployees.every(emp => emp.selected)
}

async function archiveSelectedEmployees() {
    const toArchive = state.archiveEmployees.filter(e => e.selected)
    if (toArchive.length === 0) return
    state.confirmArchive = false
    state.isArchiving = true
    try {
        // Get employees from the duty schedule (includes Zenegy-synced employees)
        const scheduleEmployees = weekViewRef.value?.getScheduleEmployees() || []

        // Also fetch from employee API as fallback
        const response = await employeeService.getEmployees({ page_length: 9999, department: departmentStore.getSelectedDepartmentName })
        const apiEmployees = response?.data || response || []

        // Merge both sources, deduplicate by uuid
        const seen = new Set<string>()
        const localEmployees: any[] = []
        for (const emp of [...scheduleEmployees, ...(Array.isArray(apiEmployees) ? apiEmployees : [])]) {
            if (emp?.uuid && !seen.has(emp.uuid)) {
                seen.add(emp.uuid)
                localEmployees.push(emp)
            }
        }

        console.log('[Archive] Schedule employees:', scheduleEmployees.length, '| API employees:', Array.isArray(apiEmployees) ? apiEmployees.length : 0, '| Merged:', localEmployees.length)
        console.log('[Archive] Local employees:', localEmployees.map((e: any) => ({
            uuid: e.uuid, name: `${e.firstname} ${e.lastname}`, email: e.email,
            employee_id: e.employee_id, zenegy_id: e.zenegy_id, zenegy_uid: e.zenegy_uid
        })))

        if (!Array.isArray(localEmployees) || localEmployees.length === 0) {
            errorAlert(t('alert.warning'), t('dutySchedules.zenegy_archive_no_match'))
            state.isArchiving = false
            return
        }

        // Match each selected Zenegy employee to a local employee
        const matched: Array<{ uuid: string; zenegyId: any }> = []
        const unmatched: string[] = []

        for (const zenegyEmp of toArchive) {
            const zenegyRaw = state.zenegyEmployeesRaw.find((r: any) => r.id === zenegyEmp.id)
            const zenegyId = String(zenegyEmp.id)
            const zenegyNumber = String(zenegyRaw?.employee_number || zenegyRaw?.employeeNumber || zenegyRaw?.number || '')
            const emailLower = zenegyEmp.email?.toLowerCase().trim()
            const nameLower = zenegyEmp.name?.toLowerCase().trim()

            const localMatch = localEmployees.find((local: any) => {
                // 1. Match by employee_id ↔ Zenegy ID or employee_number
                if (local.employee_id && (String(local.employee_id) === zenegyId || (zenegyNumber && String(local.employee_id) === zenegyNumber))) return true
                // 2. Match by zenegy_id or zenegy_uid
                if (local.zenegy_id && String(local.zenegy_id) === zenegyId) return true
                if (local.zenegy_uid && String(local.zenegy_uid) === zenegyId) return true
                // 3. Email match
                const localEmail = (local.email || '').toLowerCase().trim()
                if (emailLower && localEmail && emailLower === localEmail) return true
                // 4. Name match (exact)
                const localName = `${local.firstname || ''} ${local.lastname || ''}`.toLowerCase().trim()
                if (nameLower && localName && nameLower === localName) return true
                // 5. Name-contains match (handles middle names, ordering)
                if (nameLower && localName && nameLower.length > 2 && localName.length > 2 && (nameLower.includes(localName) || localName.includes(nameLower))) return true
                return false
            })

            if (localMatch) {
                matched.push({ uuid: localMatch.uuid, zenegyId: zenegyEmp.id })
            } else {
                unmatched.push(zenegyEmp.name)
                console.log('[Archive] No match for Zenegy employee:', zenegyEmp.name, '|', zenegyEmp.email, '| zenegyId:', zenegyId, '| zenegyNumber:', zenegyNumber)
            }
        }

        if (matched.length === 0) {
            errorAlert(t('alert.warning'), t('dutySchedules.zenegy_archive_no_match'))
            state.isArchiving = false
            return
        }

        // Delete matched employees
        const results = await Promise.allSettled(
            matched.map(emp => employeeService.deleteEmployee(emp.uuid))
        )
        const failed = results.filter(r => r.status === 'rejected')

        let message = t('dutySchedules.zenegy_archive_success')
        if (unmatched.length > 0) {
            message += ` (${unmatched.length} not found locally: ${unmatched.join(', ')})`
        }
        if (failed.length > 0) {
            errorAlert(t('alert.warning'), `${failed.length} failed to archive`)
        } else {
            successAlert(`${t('alert.success')}!`, message)
        }

        // Remove archived from list
        const archivedIds = new Set(matched.map(m => m.zenegyId))
        state.archiveEmployees = state.archiveEmployees.filter(e => !archivedIds.has(e.id))
        state.selectAllArchiveEmployees = false
        weekViewRef.value?.refreshSchedule()
    } catch (e: any) {
        errorAlert(t('alert.error'), e?.message || 'Failed to archive employees')
    }
    state.isArchiving = false
}

async function syncZenegyEmployees() {
    state.isSyncing = true
    try {
        const selectedIds = new Set(
            state.zenegyEmployees.filter(e => e.selected).map(e => e.id)
        )
        const selectedEmployees = state.zenegyEmployeesRaw.filter((emp: any) => selectedIds.has(emp.id))

        if (selectedEmployees.length === 0) {
            errorAlert(t('alert.warning'), t('dutySchedules.zenegy_no_employees'))
            state.isSyncing = false
            return
        }

        const syncResponse = await zenegyService.syncUsers(selectedEmployees, state.selectedDepartmentUuid)
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
        weekViewRef.value?.refreshSchedule()
    } catch (e: any) {
        errorAlert(t('alert.error'), e?.message || 'Failed to sync with Zenegy')
    }
    state.isSyncing = false
}
</script>