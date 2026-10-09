<template>
    <div class="card" data-testid="on-duty-widget" :data-loading="state.isPageLoading">
        <div class="card-header">
            <div class="flex items-center gap-x-2">
                <Icon name="ph:users-three" class="h-5 w-5 text-primary" />
                <h3 class="text-sm font-semibold text-slate-900">
                    {{ $t('overview.onDuty.title') }}
                </h3>
                <span v-if="data" class="badge badge-blue" data-testid="on-duty-count">{{ data.on_duty_count }}</span>
            </div>
            <div class="flex items-center gap-x-1">
                <button type="button" class="rounded p-1 text-slate-500 hover:bg-slate-100"
                    :title="$t('overview.previousDay')" data-testid="on-duty-prev" @click="shiftDay(-1)">
                    <Icon name="ph:caret-left" class="h-4 w-4" />
                </button>
                <button type="button" class="min-w-[5.5rem] rounded px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                    :title="$t('overview.onDuty.goToToday')" data-testid="on-duty-day" @click="goToToday">
                    {{ dayLabel }}
                </button>
                <button type="button" class="rounded p-1 text-slate-500 hover:bg-slate-100"
                    :title="$t('overview.nextDay')" data-testid="on-duty-next" @click="shiftDay(1)">
                    <Icon name="ph:caret-right" class="h-4 w-4" />
                </button>
            </div>
        </div>

        <!-- Whole company or the department picked in the header -->
        <div v-if="selectedDepartmentName" class="flex px-5 pt-4" data-testid="on-duty-scope">
            <div class="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-medium">
                <button type="button" class="rounded-md px-3 py-1.5 transition-colors"
                    :class="state.scope === 'department' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
                    data-testid="on-duty-scope-department" @click="setScope('department')">
                    {{ selectedDepartmentName }}
                </button>
                <button type="button" class="rounded-md px-3 py-1.5 transition-colors"
                    :class="state.scope === 'company' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
                    data-testid="on-duty-scope-company" @click="setScope('company')">
                    {{ $t('overview.onDuty.wholeCompany') }}
                </button>
            </div>
        </div>

        <LoadingSpinner :isActive="state.isPageLoading">
            <Alert type="danger" :text="state?.error?.message"
                v-if="state.error?.message && state.error.message.length > 0" />

            <template v-if="data && !state.error?.message">
                <div class="flex flex-wrap gap-2 px-5 pt-4 text-xs" data-testid="on-duty-summary">
                    <span class="badge badge-green">{{ $t('overview.onDuty.onDutyCount', { count: data.on_duty_count }) }}</span>
                    <span v-if="data.is_today" class="badge badge-blue">{{ $t('overview.onDuty.workingNowCount', { count: data.working_now_count }) }}</span>
                    <span v-if="data.absent_count > 0" class="badge badge-gray">{{ $t('overview.onDuty.absentCount', { count: data.absent_count }) }}</span>
                </div>

                <p v-if="data.groups.length === 0" class="px-5 py-6 text-sm text-slate-500" data-testid="on-duty-empty">
                    {{ $t('overview.onDuty.none') }}
                </p>

                <div v-else class="max-h-[30rem] overflow-y-auto px-5 pb-4">
                    <section v-for="group in data.groups" :key="group.department?.uuid ?? 'none'" class="mt-4"
                        data-testid="on-duty-group">
                        <div class="flex items-center justify-between border-b border-slate-100 pb-1.5">
                            <h4 class="flex items-center gap-x-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                                <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: group.department?.color || '#94a3b8' }" />
                                {{ group.department?.name ?? $t('overview.nextShift.noDepartment') }}
                            </h4>
                            <span class="text-xs text-slate-500">
                                {{ $t('overview.onDuty.onDutyCount', { count: group.on_duty_count }) }}<template v-if="group.absent_count > 0">
                                    · {{ $t('overview.onDuty.absentCount', { count: group.absent_count }) }}</template>
                            </span>
                        </div>

                        <ul class="divide-y divide-slate-50">
                            <li v-for="employee in group.employees" :key="employee.uuid"
                                class="flex items-center justify-between gap-x-3 py-2"
                                :class="{ 'opacity-60': employee.is_absent }" data-testid="on-duty-employee">
                                <div class="flex min-w-0 items-center gap-x-3">
                                    <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/5 text-xs font-semibold text-primary">
                                        {{ initials(employee.name) }}
                                    </span>
                                    <div class="min-w-0">
                                        <p class="truncate text-sm font-medium text-slate-900">{{ employee.name }}</p>
                                        <p v-if="employee.job_title" class="truncate text-xs text-slate-500">{{ employee.job_title }}</p>
                                    </div>
                                </div>
                                <div class="flex shrink-0 flex-col items-end gap-y-1">
                                    <span v-if="employee.is_absent" class="badge badge-gray" data-testid="on-duty-absent">
                                        {{ $t('overview.onDuty.absent') }}
                                    </span>
                                    <template v-else>
                                        <div v-for="shift in workShifts(employee)" :key="shift.uuid"
                                            class="flex items-center gap-x-2 text-xs text-slate-700">
                                            <span v-if="shift.is_now" class="badge badge-green" data-testid="on-duty-now">
                                                {{ $t('overview.onDuty.now') }}
                                            </span>
                                            <span class="inline-flex items-center gap-x-1.5" :title="shift.shift_name || ''">
                                                <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: shift.shift_color || '#94a3b8' }" />
                                                <span class="font-semibold tabular-nums">{{ timeRange(shift) }}</span>
                                            </span>
                                        </div>
                                    </template>
                                </div>
                            </li>
                        </ul>
                    </section>
                </div>

                <p v-if="data.visibility !== 'all'" class="px-5 pb-3 text-xs text-slate-400" data-testid="on-duty-visibility">
                    {{ data.visibility === 'self' ? $t('overview.onDuty.onlyYou') : $t('overview.onDuty.onlyYourDepartments') }}
                </p>
            </template>

            <div class="flex justify-end border-t border-slate-100 px-5 py-3">
                <button type="button" class="text-xs font-medium text-primary hover:underline" @click="navigateTo('/schedules')">
                    {{ $t('overview.nextShift.viewSchedule') }}
                </button>
            </div>
        </LoadingSpinner>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useI18n } from 'vue-i18n'
import { dailyOverviewService } from '@/components/api/user/DailyOverviewService'
import { useDepartmentStore } from '@/store/department'
import type { Error } from '@/types'

const { t } = useI18n()
const { formatDateWithWeekdayToReadable } = useDatetimeFormatter()
const departmentStore = useDepartmentStore() as any

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    date: moment().format('YYYY-MM-DD'),
    // Follows the header's department; "company" shows everyone without changing it.
    scope: 'department' as 'department' | 'company',
    onDuty: null as any,
})

let refreshTimer: ReturnType<typeof setInterval> | null = null
let requestId = 0

const data = computed(() => state.onDuty)

/** The department picked in the header, or '' for "All departments". */
const selectedDepartmentName = computed(() => {
    const uuid = departmentStore.getSelectedDepartment?.uuid
    if (!uuid || uuid === 'all-departments') return ''
    return departmentStore.getSelectedDepartmentName || ''
})

const dayLabel = computed(() => {
    const day = moment(state.date)
    if (day.isSame(moment(), 'day')) return t('overview.nextShift.today')
    if (day.isSame(moment().add(1, 'day'), 'day')) return t('overview.nextShift.tomorrow')
    if (day.isSame(moment().subtract(1, 'day'), 'day')) return t('overview.onDuty.yesterday')
    return formatDateWithWeekdayToReadable(state.date)
})

function workShifts(employee: any) {
    return employee.shifts.filter((shift: any) => !shift.is_absence)
}

/** 22:00 → 06:00, with the day it starts or ends when that is not the day shown. */
function timeRange(shift: any) {
    const start = moment(shift.start)
    const end = moment(shift.end)
    const from = shift.starts_previous_day ? `${start.format('DD.MM')} ${start.format('HH:mm')}` : start.format('HH:mm')
    const to = shift.ends_next_day ? `${end.format('DD.MM')} ${end.format('HH:mm')}` : end.format('HH:mm')
    return `${from} → ${to}`
}

function initials(name: string) {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

function shiftDay(days: number) {
    state.date = moment(state.date).add(days, 'day').format('YYYY-MM-DD')
}

function goToToday() {
    state.date = moment().format('YYYY-MM-DD')
}

function setScope(scope: 'department' | 'company') {
    state.scope = scope
}

watch(() => state.date, () => fetchOnDuty())
watch(() => state.scope, () => fetchOnDuty())
watch(selectedDepartmentName, () => {
    state.scope = 'department'
    fetchOnDuty()
})

onMounted(() => {
    fetchOnDuty()
    // "Working now" changes during the day, and the schedule may be edited meanwhile.
    refreshTimer = setInterval(() => fetchOnDuty(false), 5 * 60 * 1000)
})

onBeforeUnmount(() => {
    if (refreshTimer) clearInterval(refreshTimer)
})

async function fetchOnDuty(showSpinner = true) {
    const id = ++requestId
    state.error = {}
    if (showSpinner) state.isPageLoading = true
    try {
        const response = await dailyOverviewService.getOnDuty({
            date: state.date,
            department: state.scope === 'department' ? selectedDepartmentName.value : '',
        })
        // A slower, older answer must not overwrite the day or scope now shown.
        if (id === requestId) state.onDuty = response?.data ?? null
    } catch (error: any) {
        if (id === requestId) state.error = error
    }
    if (id === requestId) state.isPageLoading = false
}
</script>
