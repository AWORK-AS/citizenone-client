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

                        <!-- Zenegy Rate -->
                        <div class="space-y-1" v-if="state.zenegyRates.length > 0">
                            <FormLabel :label="$t('dutySchedules.zenegy_rate')" />
                            <select v-model="state.selectedRateUid"
                                class="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                                <option value="" disabled>{{ $t('dutySchedules.zenegy_select_rate') }}</option>
                                <option v-for="rate in state.zenegyRates" :key="rate.uid" :value="rate.uid">
                                    {{ rate.name }}
                                </option>
                            </select>
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
                                        :class="['flex w-fit items-center gap-x-2 text-sm', employee.matchedZenegyUserUid ? 'cursor-pointer' : 'opacity-50']"
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
                                :disabled="selectedEmployeeCount === 0 || !state.syncDateRange?.length || !state.selectedRateUid"
                                @click="buildRegistrationsPreview">
                                {{ $t('dutySchedules.zenegy_review') }}
                            </FormButton>
                        </div>
                    </div>

                    <!-- Step 2: Review -->
                    <div v-else-if="state.syncStep === 'review'" class="space-y-4">
                        <p class="text-sm text-gray-600">
                            {{ $t('dutySchedules.zenegy_review_description', { count:
                                state.registrationsPreview.length }) }}
                        </p>
                        <div v-if="state.registrationsPreview.length > 0"
                            class="max-h-96 overflow-y-auto rounded-md border border-gray-200">
                            <table class="min-w-full divide-y divide-gray-200 text-sm">
                                <thead class="sticky top-0 bg-gray-50">
                                    <tr>
                                        <th class="px-3 py-2 text-left">{{ $t('employee.employee') }}</th>
                                        <th class="px-3 py-2 text-left">{{ $t('date') }}</th>
                                        <th class="px-3 py-2 text-left">{{ $t('dutySchedules.typeOfShift') }}</th>
                                        <th class="px-3 py-2 text-left">{{ $t('dutySchedules.zenegy_hours') }}</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-100">
                                    <tr v-for="(reg, i) in state.registrationsPreview" :key="i">
                                        <td class="px-3 py-2">{{ reg.employeeName }}</td>
                                        <td class="px-3 py-2">{{ reg.date }}</td>
                                        <td class="px-3 py-2">{{ reg.shiftTypeName }}</td>
                                        <td class="px-3 py-2">{{ reg.hours }}h</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div v-else class="py-8 text-center text-gray-400">
                            {{ $t('dutySchedules.zenegy_no_registrations') }}
                        </div>
                        <div class="mt-4 grid grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                                @click="state.syncStep = 'configure'">
                                {{ $t('back') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="primary" class="rounded-md"
                                :disabled="state.registrationsPreview.length === 0" @click="executeSyncToZenegy">
                                {{ $t('dutySchedules.zenegy_sync') }} ({{ state.registrationsPreview.length }})
                            </FormButton>
                        </div>
                    </div>

                    <!-- Step 3: Result -->
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
    syncStep: 'configure' as 'configure' | 'review' | 'result',
    syncDateRange: [] as any,
    scheduleEmployees: [] as Array<{
        uuid: string; firstname: string; lastname: string;
        selected: boolean; matchedZenegyUserUid: string | null;
    }>,
    selectAllEmployees: true,
    zenegyEmployeesRaw: [] as any[],
    zenegyRates: [] as Array<{ uid: string; name: string }>,
    selectedRateUid: '' as string,
    registrationsPreview: [] as Array<{
        employeeName: string; date: string; shiftTypeName: string;
        from: string; to: string; hours: number;
        userUid: string;
    }>,
    syncResult: null as any,
})

const selectedEmployeeCount = computed(() =>
    state.scheduleEmployees.filter(e => e.selected).length
)

const matchedEmployeeCount = computed(() =>
    state.scheduleEmployees.filter(e => e.matchedZenegyUserUid).length
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
    state.syncDateRange = []
    state.selectedRateUid = ''
    state.zenegyRates = []

    try {
        const [zenegyEmployeesRes, zenegyRatesRes] = await Promise.all([
            zenegyService.getEmployees(),
            zenegyService.getRates(),
        ])

        // Store Zenegy employees
        state.zenegyEmployeesRaw = zenegyEmployeesRes?.employees?.data || zenegyEmployeesRes?.data || []

        // Store Zenegy rates (response shape: { rates: { value: { data: [...] } } })
        const ratesData = zenegyRatesRes?.rates?.value?.data || zenegyRatesRes?.rates?.data || zenegyRatesRes?.data || []
        state.zenegyRates = (Array.isArray(ratesData) ? ratesData : []).map((r: any) => ({
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

async function buildRegistrationsPreview() {
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

        // Prepare lookup maps
        const selectedEmployeeUuids = new Set(selectedEmployees.map(e => e.uuid))
        const employeeUidMap = new Map(selectedEmployees.map(e => [e.uuid, e.matchedZenegyUserUid]))

        const registrations: typeof state.registrationsPreview = []
        const startMoment = moment(startDate)
        const endMoment = moment(endDate)

        // Fetch schedule data for each week
        for (const weekStart of weekStarts) {
            const weekEnd = moment(weekStart).endOf('isoWeek').format('YYYY-MM-DD')

            const response = await dutyScheduleService.getDutySchedules({
                date_start: weekStart,
                date_end: weekEnd,
                department: departmentStore.getSelectedDepartmentName,
                page_length: 500,
            })

            const employeeSchedules = response?.data || []
            if (!Array.isArray(employeeSchedules)) continue

            for (const empSchedule of employeeSchedules) {
                if (!selectedEmployeeUuids.has(empSchedule.uuid)) continue

                const userUid = employeeUidMap.get(empSchedule.uuid)
                if (!userUid) continue

                const empName = `${empSchedule.firstname || ''} ${empSchedule.lastname || ''}`.trim()
                const weeksObj = empSchedule.weeks || {}

                // weeks is an object keyed by day name: { monday: {...}, tuesday: {...}, ... }
                const days = Object.values(weeksObj) as any[]

                for (const day of days) {
                    const shiftDate = day?.date
                    if (!shiftDate) continue

                    const dateMoment = moment(shiftDate)
                    if (dateMoment.isBefore(startMoment) || dateMoment.isAfter(endMoment)) continue

                    for (const shift of (day.shifts || [])) {
                        const from = shift.date_time_start
                        const to = shift.date_time_end
                        if (!from || !to) continue

                        const hours = Math.round(moment(to).diff(moment(from), 'hours', true) * 100) / 100
                        if (hours <= 0) continue

                        const shiftTypeName = locale.value === 'dk'
                            ? (shift.type?.dk_name || shift.type?.en_name || '')
                            : (shift.type?.en_name || shift.type?.dk_name || '')

                        registrations.push({
                            employeeName: empName,
                            date: shiftDate,
                            shiftTypeName,
                            from,
                            to,
                            hours,
                            userUid,
                        })
                    }
                }
            }
        }

        state.registrationsPreview = registrations
        state.syncStep = 'review'
    } catch (e: any) {
        errorAlert(t('alert.error'), e?.message || 'Failed to build preview')
    } finally {
        state.isSyncing = false
    }
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
                hourPaymentRateUid: state.selectedRateUid,
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
