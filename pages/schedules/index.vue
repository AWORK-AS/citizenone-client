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
                    <FormButton v-if="state.isZenegyConnected" buttonStyle="action" class="rounded-lg"
                        @click="openZenegySyncModal">
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

        <Modal size="lg" :title="$t('dutySchedules.zenegy_sync')" :show="state.modal.isZenegySyncOpen"
            @close="state.modal.isZenegySyncOpen = false">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isLoadingModalData || state.isSyncing">

                    <!-- Step 1: Configure -->
                    <div v-if="state.syncStep === 'configure'" class="space-y-5">

                        <!-- Date Range -->
                        <div class="space-y-1">
                            <FormLabel :label="$t('dutySchedules.zenegy_date_range')" />
                            <FormDateRangeField id="zenegy_date_range" name="zenegy_date_range"
                                :placeholder="$t('dutySchedules.zenegy_select_date_range')"
                                v-model="state.syncDateRange" />
                        </div>

                        <!-- Employee Selection -->
                        <div class="space-y-2">
                            <FormLabel :label="$t('dutySchedules.zenegy_select_employees')" />
                            <div v-if="state.scheduleEmployees.length > 0">
                                <div class="flex w-fit cursor-pointer items-center gap-x-2 border-b border-gray-200 pb-2 text-sm font-medium"
                                    @click="toggleSelectAllEmployees">
                                    <div class="relative shrink-0">
                                        <FormCheckbox :value="state.selectAllEmployees" />
                                    </div>
                                    <span>{{ $t('dutySchedules.zenegy_select_all') }}</span>
                                    <span class="text-gray-400">({{ selectedEmployeeCount }}/{{
                                        matchedEmployeeCount }})</span>
                                </div>
                                <div class="mt-2 max-h-48 space-y-1 overflow-y-auto">
                                    <div v-for="(employee, index) in state.scheduleEmployees" :key="employee.uuid"
                                        :class="['flex items-center gap-x-2 text-sm', employee.matchedZenegyUserUid ? 'cursor-pointer' : 'opacity-50']"
                                        @click="employee.matchedZenegyUserUid && toggleEmployeeSelection(index)">
                                        <div class="relative shrink-0">
                                            <FormCheckbox :value="employee.selected"
                                                :disabled="!employee.matchedZenegyUserUid" />
                                        </div>
                                        <span>{{ employee.firstname }} {{ employee.lastname }}</span>
                                        <span v-if="!employee.matchedZenegyUserUid" class="text-xs text-red-500">
                                            {{ $t('dutySchedules.zenegy_no_match') }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <p v-else class="text-sm text-gray-500">{{ $t('dutySchedules.zenegy_no_employees') }}</p>
                        </div>

                        <!-- Action Buttons -->
                        <div class="mt-4 grid grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                                @click="state.modal.isZenegySyncOpen = false">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="primary" class="rounded-md"
                                :disabled="selectedEmployeeCount === 0 || !state.syncDateRange?.length"
                                @click="fetchAndBuildShiftTypes">
                                {{ $t('next') }}
                            </FormButton>
                        </div>
                    </div>

                    <!-- Step 2: Assign Rates -->
                    <div v-else-if="state.syncStep === 'assign-rates'" class="space-y-4">
                        <p class="text-sm text-gray-600">
                            {{ $t('dutySchedules.zenegy_assign_rates_description') }}
                        </p>
                        <div class="max-h-96 space-y-3 overflow-y-auto">
                            <div v-for="emp in state.employeeShiftTypes" :key="emp.employeeUuid"
                                class="rounded-md border border-gray-200 p-3">
                                <p class="text-sm font-medium">{{ emp.employeeName }}</p>
                                <div class="mt-2 space-y-2">
                                    <div v-for="st in emp.shiftTypes" :key="st.name"
                                        class="flex items-center gap-x-3 text-sm">
                                        <span class="shrink-0">{{ st.name }}</span>
                                        <span class="text-xs text-gray-400">({{ st.shiftCount }})</span>
                                        <select v-model="st.selectedRateUid"
                                            class="ml-auto max-w-[220px] rounded border border-gray-300 px-2 py-1 text-xs">
                                            <option value="" disabled>{{ $t('dutySchedules.zenegy_select_rate') }}</option>
                                            <option v-for="rate in emp.availableRates" :key="rate.uid" :value="rate.uid">
                                                {{ rate.name }}
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="mt-4 grid grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                                @click="state.syncStep = 'configure'">
                                {{ $t('back') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="primary" class="rounded-md"
                                :disabled="!allShiftTypesAssigned"
                                @click="buildRegistrationsPreview">
                                {{ $t('dutySchedules.zenegy_review') }}
                            </FormButton>
                        </div>
                    </div>

                    <!-- Step 3: Review -->
                    <div v-else-if="state.syncStep === 'review'" class="space-y-4">
                        <p class="text-sm text-gray-600">
                            {{ $t('dutySchedules.zenegy_review_description', { count:
                                state.registrationsPreview.length }) }}
                        </p>
                        <div v-if="state.registrationsPreview.length > 0"
                            class="max-h-96 divide-y divide-gray-200 overflow-y-auto rounded-md border border-gray-200">
                            <div v-for="group in groupedRegistrations" :key="group.userUid">
                                <!-- Employee summary row -->
                                <div class="flex cursor-pointer items-center gap-x-2 px-3 py-2 hover:bg-gray-50"
                                    @click="toggleExpandEmployee(group.userUid)">
                                    <Icon name="ph:caret-right"
                                        :class="['h-4 w-4 shrink-0 transition-transform', state.expandedEmployees.has(group.userUid) ? 'rotate-90' : '']" />
                                    <span class="text-sm font-medium">{{ group.employeeName }}</span>
                                    <span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                                        {{ group.registrations.length }} {{ $t('dutySchedules.zenegy_shifts') }}
                                    </span>
                                    <span class="ml-auto text-sm text-gray-500">{{ group.totalHours }}{{ $t('dutySchedules.zenegy_hours_let') }}</span>
                                </div>
                                <!-- Expanded detail rows -->
                                <table v-if="state.expandedEmployees.has(group.userUid)" class="w-full text-sm">
                                    <tbody class="divide-y divide-gray-50">
                                        <tr v-for="(reg, i) in group.registrations" :key="i" class="bg-gray-50/50">
                                            <td class="py-1.5 pl-9 pr-3">{{ reg.date }}</td>
                                            <td class="px-3 py-1.5">{{ reg.shiftTypeName }}</td>
                                            <td class="px-3 py-1.5 text-xs text-gray-500">{{ getRateName(reg.hourPaymentRateUid) }}</td>
                                            <td class="px-3 py-1.5 text-right">{{ reg.hours }}{{ $t('dutySchedules.zenegy_hours_let') }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div v-else class="py-8 text-center text-gray-400">
                            {{ $t('dutySchedules.zenegy_no_registrations') }}
                        </div>
                        <div class="mt-4 grid grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                                @click="state.syncStep = 'assign-rates'">
                                {{ $t('back') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="primary" class="rounded-md"
                                :disabled="state.registrationsPreview.length === 0" @click="executeSyncToZenegy">
                                {{ $t('dutySchedules.zenegy_sync') }} ({{ state.registrationsPreview.length }})
                            </FormButton>
                        </div>
                    </div>

                    <!-- Step 4: Result -->
                    <div v-else-if="state.syncStep === 'result'" class="space-y-4 py-6 text-center">
                        <Icon name="ph:check-circle" class="mx-auto h-12 w-12 text-green-500" />
                        <p class="text-lg font-medium">{{ $t('dutySchedules.zenegy_sync_success') }}</p>
                        <p class="text-sm text-gray-500">
                            {{ $t('dutySchedules.zenegy_sync_result_count', { count:
                                state.registrationsPreview.length }) }}
                        </p>
                        <FormButton type="button" buttonStyle="primary" class="rounded-md"
                            @click="state.modal.isZenegySyncOpen = false">
                            {{ $t('close') }}
                        </FormButton>
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
import { useDepartmentStore } from '@/store/department'
import { zenegyService } from '@/components/api/user/ZenegyService'
import { dutyScheduleService } from '@/components/api/user/DutyScheduleService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'

const runtimeConfig = useRuntimeConfig()
const customPagesStore = useCustomPagesStore() as any
const userStore = useUserStore() as any
const departmentStore = useDepartmentStore() as any
const { successAlert, errorAlert } = useAlert()
const { t, locale } = useI18n()
const weekViewRef = ref()

const state = reactive({
    calendarView: 'week',
    isSyncing: false,
    isZenegyConnected: false,
    isLoadingModalData: false,
    modal: {
        isActivityLogsOpen: false,
        isDownloadOpen: false,
        isGuidedTourDutyScheduleOpen: false,
        isShowAllShiftTypes: false,
        isZenegySyncOpen: false,
    },
    selectedDate: moment().format('YYYY-MM-DD'),
    // Zenegy sync state
    syncStep: 'configure' as 'configure' | 'assign-rates' | 'review' | 'result',
    syncDateRange: [] as any,
    scheduleEmployees: [] as Array<{
        uuid: string; firstname: string; lastname: string;
        selected: boolean; matchedZenegyUserUid: string | null;
    }>,
    selectAllEmployees: true,
    zenegyEmployeesRaw: [] as any[],
    zenegyRatesRaw: [] as any[],
    sharedRates: [] as Array<{ uid: string; name: string }>,
    fetchedScheduleData: [] as any[],
    employeeShiftTypes: [] as Array<{
        employeeUuid: string; employeeName: string; userUid: string;
        shiftTypes: Array<{
            name: string; shiftCount: number; selectedRateUid: string;
        }>;
        availableRates: Array<{ uid: string; name: string }>;
    }>,
    registrationsPreview: [] as Array<{
        employeeName: string; date: string; shiftTypeName: string;
        from: string; to: string; hours: number;
        userUid: string; hourPaymentRateUid: string;
    }>,
    syncResult: null as any,
    expandedEmployees: new Set<string>(),
})

const selectedEmployeeCount = computed(() =>
    state.scheduleEmployees.filter(e => e.selected).length
)

const matchedEmployeeCount = computed(() =>
    state.scheduleEmployees.filter(e => e.matchedZenegyUserUid).length
)

const allShiftTypesAssigned = computed(() =>
    state.employeeShiftTypes.every(emp =>
        emp.shiftTypes.every(st => st.selectedRateUid)
    )
)

function getRateName(rateUid: string): string {
    const rate = state.zenegyRatesRaw.find((r: any) => (r.uid || r.id) === rateUid)
    if (!rate) return ''
    return `${rate.name} - ${rate.paymentPerRate} kr/t`
}

const groupedRegistrations = computed(() => {
    const groups = new Map<string, { userUid: string; employeeName: string; registrations: typeof state.registrationsPreview; totalHours: number }>()
    for (const reg of state.registrationsPreview) {
        if (!groups.has(reg.userUid)) {
            groups.set(reg.userUid, { userUid: reg.userUid, employeeName: reg.employeeName, registrations: [], totalHours: 0 })
        }
        const group = groups.get(reg.userUid)!
        group.registrations.push(reg)
        group.totalHours = Math.round((group.totalHours + reg.hours) * 100) / 100
    }
    return Array.from(groups.values())
})

function toggleExpandEmployee(userUid: string) {
    if (state.expandedEmployees.has(userUid)) {
        state.expandedEmployees.delete(userUid)
    } else {
        state.expandedEmployees.add(userUid)
    }
}

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

// --- Zenegy Sync Logic ---

function matchEmployeeToZenegy(localEmployee: any, zenegyEmployees: any[]): string | null {
    for (const ze of zenegyEmployees) {
        const zenegyUid = ze.uid || ''
        const zenegyId = String(ze.id || '')
        const zenegyUserUid = ze.user?.uid || ze.uid || ''
        const zenegyEmail = (ze.contactEmail || ze.user?.email || '').toLowerCase().trim()
        const zenegyName = (ze.name || '').toLowerCase().trim()

        // 1. Match by zenegy_uid (UUID match)
        if (localEmployee.zenegy_uid && String(localEmployee.zenegy_uid) === zenegyUid) {
            return zenegyUserUid
        }
        // 2. Match by zenegy_id (numeric ID match)
        if (localEmployee.zenegy_id && String(localEmployee.zenegy_id) === zenegyId) {
            return zenegyUserUid
        }
        // 3. Match by employee_id
        if (localEmployee.employee_id && String(localEmployee.employee_id) === zenegyId) {
            return zenegyUserUid
        }
        // 4. Email match
        const localEmail = (localEmployee.email || '').toLowerCase().trim()
        if (zenegyEmail && localEmail && zenegyEmail === localEmail) {
            return zenegyUserUid
        }
        // 5. Name match
        const localName = `${localEmployee.firstname || ''} ${localEmployee.lastname || ''}`.toLowerCase().trim()
        if (zenegyName && localName && zenegyName.length > 2 && localName.length > 2 && zenegyName === localName) {
            return zenegyUserUid
        }
    }
    return null
}

async function openZenegySyncModal() {
    state.modal.isZenegySyncOpen = true
    state.syncStep = 'configure'
    state.isLoadingModalData = true
    state.syncResult = null
    state.registrationsPreview = []
    state.expandedEmployees.clear()
    state.syncDateRange = []
    state.zenegyRatesRaw = []
    state.sharedRates = []
    state.fetchedScheduleData = []
    state.employeeShiftTypes = []

    try {
        const [zenegyEmployeesRes, zenegyRatesRes] = await Promise.all([
            zenegyService.getEmployees(),
            zenegyService.getRates(),
        ])

        // Store Zenegy employees
        state.zenegyEmployeesRaw = zenegyEmployeesRes?.employees?.data || zenegyEmployeesRes?.data || []

        // Store Zenegy rates (response shape: { rates: { value: { data: [...] } } })
        const ratesData = zenegyRatesRes?.rates?.value?.data || zenegyRatesRes?.rates?.data || zenegyRatesRes?.data || []
        state.zenegyRatesRaw = Array.isArray(ratesData) ? ratesData : []

        // Shared rates: available to all employees, non-zero payment
        state.sharedRates = state.zenegyRatesRaw
            .filter((r: any) => !r.limitUserAccess && r.paymentPerRate > 0)
            .map((r: any) => ({
                uid: r.uid || r.id || '',
                name: `${r.name}${r.number ? ` (${r.number})` : ''} - ${r.paymentPerRate} kr/t`,
            }))

        // Build employee list from schedule and match to Zenegy
        const scheduleEmployees = weekViewRef.value?.getScheduleEmployees() || []
        state.scheduleEmployees = scheduleEmployees.map((emp: any) => {
            const matched = matchEmployeeToZenegy(emp, state.zenegyEmployeesRaw)
            return {
                uuid: emp.uuid,
                firstname: emp.firstname || emp.firstName || '',
                lastname: emp.lastname || emp.lastName || '',
                selected: matched !== null,
                matchedZenegyUserUid: matched,
            }
        })
        state.selectAllEmployees = state.scheduleEmployees
            .filter(e => e.matchedZenegyUserUid)
            .every(e => e.selected)

    } catch (e: any) {
        errorAlert(t('alert.error'), e?.message || 'Failed to load Zenegy data')
    } finally {
        state.isLoadingModalData = false
    }
}

function toggleSelectAllEmployees() {
    state.selectAllEmployees = !state.selectAllEmployees
    state.scheduleEmployees
        .filter(e => e.matchedZenegyUserUid)
        .forEach(e => e.selected = state.selectAllEmployees)
}

function toggleEmployeeSelection(index: number) {
    state.scheduleEmployees[index].selected = !state.scheduleEmployees[index].selected
    state.selectAllEmployees = state.scheduleEmployees
        .filter(e => e.matchedZenegyUserUid)
        .every(e => e.selected)
}

async function fetchAndBuildShiftTypes() {
    const dateRange = state.syncDateRange
    if (!dateRange?.length || !dateRange[0] || !dateRange[1]) {
        errorAlert(t('alert.warning'), t('dutySchedules.zenegy_select_date_range'))
        return
    }

    const selectedEmployees = state.scheduleEmployees.filter(e => e.selected && e.matchedZenegyUserUid)
    if (selectedEmployees.length === 0) {
        errorAlert(t('alert.warning'), t('dutySchedules.zenegy_no_matched_employees'))
        return
    }

    state.isSyncing = true

    try {
        const startDate = dateRange[0]
        const endDate = dateRange[1]

        // Build week start dates covering the range
        const weekStarts: string[] = []
        const cursor = moment(startDate).startOf('isoWeek')
        const rangeEnd = moment(endDate)
        while (cursor.isSameOrBefore(rangeEnd)) {
            weekStarts.push(cursor.format('YYYY-MM-DD'))
            cursor.add(1, 'week')
        }

        const selectedEmployeeUuids = new Set(selectedEmployees.map(e => e.uuid))
        const employeeUidMap = new Map(selectedEmployees.map(e => [e.uuid, e.matchedZenegyUserUid]))
        const startMoment = moment(startDate)
        const endMoment = moment(endDate)

        // Fetch and store schedule data for reuse
        const allScheduleData: any[] = []
        for (const weekStart of weekStarts) {
            const weekEnd = moment(weekStart).endOf('isoWeek').format('YYYY-MM-DD')
            const response = await dutyScheduleService.getDutySchedules({
                date_start: weekStart,
                date_end: weekEnd,
                department: departmentStore.getSelectedDepartmentName,
                page_length: 500,
            })
            const employeeSchedules = response?.data || []
            if (Array.isArray(employeeSchedules)) {
                allScheduleData.push(...employeeSchedules)
            }
        }
        state.fetchedScheduleData = allScheduleData

        // Discover shift types per employee
        const empShiftMap = new Map<string, { name: string; userUid: string; shiftTypes: Map<string, number> }>()

        for (const empSchedule of allScheduleData) {
            if (!selectedEmployeeUuids.has(empSchedule.uuid)) continue
            const userUid = employeeUidMap.get(empSchedule.uuid)
            if (!userUid) continue

            const empName = `${empSchedule.firstname || ''} ${empSchedule.lastname || ''}`.trim()
            if (!empShiftMap.has(empSchedule.uuid)) {
                empShiftMap.set(empSchedule.uuid, { name: empName, userUid, shiftTypes: new Map() })
            }
            const empData = empShiftMap.get(empSchedule.uuid)!
            const days = Object.values(empSchedule.weeks || {}) as any[]

            for (const day of days) {
                if (!day?.date) continue
                const dateMoment = moment(day.date)
                if (dateMoment.isBefore(startMoment) || dateMoment.isAfter(endMoment)) continue

                for (const shift of (day.shifts || [])) {
                    const from = shift.date_time_start
                    const to = shift.date_time_end
                    if (!from || !to) continue
                    const hours = moment(to).diff(moment(from), 'hours', true)
                    if (hours <= 0) continue

                    const shiftTypeName = locale.value === 'dk'
                        ? (shift.type?.dk_name || shift.type?.en_name || t('dutySchedules.zenegy_unknown_shift'))
                        : (shift.type?.en_name || shift.type?.dk_name || t('dutySchedules.zenegy_unknown_shift'))

                    empData.shiftTypes.set(shiftTypeName, (empData.shiftTypes.get(shiftTypeName) || 0) + 1)
                }
            }
        }

        // Build employeeShiftTypes with available rates per employee
        state.employeeShiftTypes = Array.from(empShiftMap.entries())
            .filter(([_, data]) => data.shiftTypes.size > 0)
            .map(([uuid, data]) => {
                // Personal rates for this employee
                const personalRates = state.zenegyRatesRaw
                    .filter((r: any) => r.limitUserAccess && r.paymentPerRate > 0
                        && r.allowedUsers?.some((u: any) => u.uid === data.userUid))
                    .map((r: any) => ({
                        uid: r.uid || r.id || '',
                        name: `${r.name}${r.number ? ` (${r.number})` : ''} - ${r.paymentPerRate} kr/t`,
                    }))

                const availableRates = [...personalRates, ...state.sharedRates]

                // Auto-select if employee has exactly one personal rate
                const autoRateUid = personalRates.length === 1 ? personalRates[0].uid : ''

                return {
                    employeeUuid: uuid,
                    employeeName: data.name,
                    userUid: data.userUid,
                    shiftTypes: Array.from(data.shiftTypes.entries()).map(([name, count]) => ({
                        name,
                        shiftCount: count,
                        selectedRateUid: autoRateUid,
                    })),
                    availableRates,
                }
            })

        state.syncStep = 'assign-rates'
    } catch (e: any) {
        errorAlert(t('alert.error'), e?.message || 'Failed to load schedule data')
    } finally {
        state.isSyncing = false
    }
}

function buildRegistrationsPreview() {
    const dateRange = state.syncDateRange
    const startMoment = moment(dateRange[0])
    const endMoment = moment(dateRange[1])
    const selectedEmployees = state.scheduleEmployees.filter(e => e.selected && e.matchedZenegyUserUid)
    const selectedEmployeeUuids = new Set(selectedEmployees.map(e => e.uuid))
    const employeeUidMap = new Map(selectedEmployees.map(e => [e.uuid, e.matchedZenegyUserUid]))

    // Build rate lookup: "userUid::shiftTypeName" → rateUid
    const rateLookup = new Map<string, string>()
    for (const emp of state.employeeShiftTypes) {
        for (const st of emp.shiftTypes) {
            rateLookup.set(`${emp.userUid}::${st.name}`, st.selectedRateUid)
        }
    }

    const registrations: typeof state.registrationsPreview = []

    for (const empSchedule of state.fetchedScheduleData) {
        if (!selectedEmployeeUuids.has(empSchedule.uuid)) continue
        const userUid = employeeUidMap.get(empSchedule.uuid)
        if (!userUid) continue

        const empName = `${empSchedule.firstname || ''} ${empSchedule.lastname || ''}`.trim()
        const days = Object.values(empSchedule.weeks || {}) as any[]

        for (const day of days) {
            if (!day?.date) continue
            const dateMoment = moment(day.date)
            if (dateMoment.isBefore(startMoment) || dateMoment.isAfter(endMoment)) continue

            for (const shift of (day.shifts || [])) {
                const from = shift.date_time_start
                const to = shift.date_time_end
                if (!from || !to) continue

                const hours = Math.round(moment(to).diff(moment(from), 'hours', true) * 100) / 100
                if (hours <= 0) continue

                const shiftTypeName = locale.value === 'dk'
                    ? (shift.type?.dk_name || shift.type?.en_name || t('dutySchedules.zenegy_unknown_shift'))
                    : (shift.type?.en_name || shift.type?.dk_name || t('dutySchedules.zenegy_unknown_shift'))

                registrations.push({
                    employeeName: empName,
                    date: day.date,
                    shiftTypeName,
                    from,
                    to,
                    hours,
                    userUid,
                    hourPaymentRateUid: rateLookup.get(`${userUid}::${shiftTypeName}`) || '',
                })
            }
        }
    }

    state.registrationsPreview = registrations
    state.syncStep = 'review'
}

async function executeSyncToZenegy() {
    if (state.registrationsPreview.length === 0) return
    state.isSyncing = true

    try {
        const payload = state.registrationsPreview
            .filter(reg => reg.hours > 0)
            .map(reg => ({
                userUid: reg.userUid,
                date: reg.date,
                from: moment(reg.from).format('YYYY-MM-DDTHH:mm:ss'),
                to: moment(reg.to).format('YYYY-MM-DDTHH:mm:ss'),
                hours: reg.hours,
                hourPaymentRateUid: reg.hourPaymentRateUid,
            }))

        if (payload.length === 0) {
            errorAlert(t('alert.warning'), t('dutySchedules.zenegy_no_registrations'))
            state.isSyncing = false
            return
        }

        const response = await zenegyService.syncRegistrations(payload)
        state.syncResult = response
        state.syncStep = 'result'
        successAlert(`${t('alert.success')}!`, t('dutySchedules.zenegy_sync_success'))
    } catch (e: any) {
        // Error message can be in multiple places depending on how $fetch wraps it
        const rawMsg = e?.data?.message || e?.response?._data?.message || e?.message || ''
        // The message might be a JSON string, try to parse it
        let errorMsg = rawMsg
        try {
            const parsed = JSON.parse(rawMsg)
            errorMsg = parsed?.message || rawMsg
        } catch { /* not JSON, use as-is */ }
        let userMessage = t('dutySchedules.zenegy_sync_failed')

        if (errorMsg.includes('RATE_FORBIDDEN_ACCESS')) {
            userMessage = t('dutySchedules.zenegy_error_rate_forbidden')
        } else if (errorMsg.includes('REGISTRATION_INVALID_PERIOD_RANGE')) {
            userMessage = t('dutySchedules.zenegy_error_invalid_period')
        } else if (errorMsg.includes('REGISTRATION_ALREADY_EXISTS')) {
            userMessage = t('dutySchedules.zenegy_error_already_exists')
        } else if (errorMsg.includes('USER_NOT_FOUND')) {
            userMessage = t('dutySchedules.zenegy_error_user_not_found')
        }

        errorAlert(t('alert.error'), userMessage)
    } finally {
        state.isSyncing = false
    }
}
</script>
