<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('monthlySheet.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('monthlySheet.title') }}</template>

            <div>
                <template v-if="isManager">
                    <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/employees">
                        <Icon name="ph:arrow-left" size="20" class="text-black" />
                        <span>{{ $t('back') }}</span>
                    </NuxtLink>

                    <ModulesUserEmployeeTabs />
                </template>

                <div class="mt-10 space-y-5">
                    <div class="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p v-if="state.sheet?.employee?.name" class="text-lg font-semibold text-slate-900">
                                {{ state.sheet.employee.name }}
                            </p>
                            <p class="text-sm text-slate-500">{{ $t('monthlySheet.subtitle') }}</p>
                        </div>

                        <div class="flex flex-wrap items-center gap-3">
                            <div class="flex items-center gap-x-1" role="group" :aria-label="$t('monthlySheet.month')">
                                <FormButton type="button" buttonStyle="action" :title="$t('monthlySheet.previousMonth')"
                                    :aria-label="$t('monthlySheet.previousMonth')" data-testid="monthly-sheet-prev"
                                    @click="shiftMonth(-1)">
                                    <Icon name="ph:caret-left" class="size-4" aria-hidden="true" />
                                </FormButton>
                                <button type="button"
                                    class="min-w-[9rem] px-3 py-1.5 text-sm font-medium text-slate-900 capitalize rounded-lg hover:bg-surface-100"
                                    data-testid="monthly-sheet-month" @click="goToCurrentMonth">
                                    {{ monthLabel }}
                                </button>
                                <FormButton type="button" buttonStyle="action" :title="$t('monthlySheet.nextMonth')"
                                    :aria-label="$t('monthlySheet.nextMonth')" data-testid="monthly-sheet-next"
                                    @click="shiftMonth(1)">
                                    <Icon name="ph:caret-right" class="size-4" aria-hidden="true" />
                                </FormButton>
                            </div>

                            <div class="flex items-center gap-x-2">
                                <FormButton type="button" buttonStyle="action" :disabled="state.isDownloading || !state.sheet"
                                    data-testid="monthly-sheet-download-pdf" @click="download('pdf')">
                                    <Icon name="ph:download" class="size-4" aria-hidden="true" />
                                    {{ $t('monthlySheet.download') }} {{ $t('monthlySheet.downloadPdf') }}
                                </FormButton>
                                <FormButton type="button" buttonStyle="action" :disabled="state.isDownloading || !state.sheet"
                                    data-testid="monthly-sheet-download-xlsx" @click="download('xlsx')">
                                    <Icon name="ph:download" class="size-4" aria-hidden="true" />
                                    {{ $t('monthlySheet.download') }} {{ $t('monthlySheet.downloadExcel') }}
                                </FormButton>
                            </div>
                        </div>
                    </div>

                    <Alert type="danger" :text="state.error" v-if="state.error" />

                    <LoadingSpinner :isActive="state.isLoading" class="min-h-[12rem]">
                        <div v-if="state.sheet" class="space-y-5">
                            <!-- Month totals -->
                            <div class="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
                                <div v-for="card in cards" :key="card.key"
                                    class="rounded-xl border border-surface-200 bg-white px-4 py-3"
                                    :data-testid="`monthly-sheet-card-${card.key}`">
                                    <p class="text-xs text-slate-500">{{ card.label }}</p>
                                    <p :class="['text-xl font-semibold mt-1', card.negative ? 'text-red-600' : 'text-slate-900']">
                                        {{ card.value }}
                                    </p>
                                    <p v-if="card.hint" class="text-xs text-slate-400 mt-0.5">{{ card.hint }}</p>
                                </div>
                            </div>

                            <!-- Day table: scrolls inside its card, not the page -->
                            <div class="rounded-xl border border-surface-200 bg-white overflow-x-auto">
                                <table class="min-w-full text-sm" data-testid="monthly-sheet-table">
                                    <thead class="bg-surface-50 text-left text-xs font-semibold text-slate-600">
                                        <tr>
                                            <th class="px-3 py-2 whitespace-nowrap">{{ $t('monthlySheet.date') }}</th>
                                            <th class="px-3 py-2">{{ $t('monthlySheet.plannedShift') }}</th>
                                            <th class="px-3 py-2 text-right">{{ $t('monthlySheet.plannedHours') }}</th>
                                            <th class="px-3 py-2">{{ $t('monthlySheet.absenceColumn') }}</th>
                                            <th class="px-3 py-2">{{ $t('monthlySheet.clockedInOut') }}</th>
                                            <th class="px-3 py-2 text-right">{{ $t('monthlySheet.clockedHours') }}</th>
                                            <th class="px-3 py-2 text-right">{{ $t('monthlySheet.extra') }}</th>
                                            <th class="px-3 py-2 text-right">{{ $t('monthlySheet.difference') }}</th>
                                            <th class="px-3 py-2">{{ $t('monthlySheet.remarks') }}</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-surface-100">
                                        <tr v-for="day in state.sheet.days" :key="day.date" :data-date="day.date"
                                            :class="rowClass(day)">
                                            <td class="px-3 py-1.5 whitespace-nowrap align-top">
                                                <span class="font-medium text-slate-800 capitalize">{{ weekday(day.date) }}</span>
                                                <span class="ml-1 text-slate-600">{{ day.date.slice(8) }}</span>
                                                <p v-if="day.holiday" class="text-xs text-amber-700">{{ day.holiday }}</p>
                                            </td>
                                            <td class="px-3 py-1.5 align-top">
                                                <template v-for="(shift, index) in day.shifts" :key="index">
                                                    <p v-if="!shift.is_absence" class="whitespace-nowrap">
                                                        <span class="inline-block size-2 rounded-full mr-1.5"
                                                            :style="{ background: shift.color || '#94a3b8' }" />
                                                        {{ shift.type }} {{ shift.start }}–{{ shift.end }}<span
                                                            v-if="shift.end_next_day"> +1</span>
                                                    </p>
                                                </template>
                                            </td>
                                            <td class="px-3 py-1.5 text-right align-top whitespace-nowrap">{{ hmOrBlank(day.planned_hours) }}</td>
                                            <td class="px-3 py-1.5 align-top">
                                                <p v-for="(absence, index) in day.absence" :key="index" class="whitespace-nowrap">
                                                    <span class="inline-flex items-center gap-x-1 rounded-full px-2 py-0.5 text-xs text-slate-800"
                                                        :style="{ background: tint(absence.color), border: `1px solid ${absence.color || '#cbd5e1'}` }">
                                                        {{ absence.type }} · {{ hm(absence.hours) }}
                                                    </span>
                                                </p>
                                            </td>
                                            <td class="px-3 py-1.5 align-top">
                                                <p v-for="(log, index) in day.time_logs" :key="index" class="whitespace-nowrap"
                                                    :class="log.status === 'approved' ? 'text-slate-800' : 'text-slate-400 italic'">
                                                    {{ log.time_in }}–{{ log.time_out ?? '…' }}
                                                    <span v-if="log.status === 'approved'" class="text-slate-500">({{ hm(log.hours) }})</span>
                                                    <span v-else>({{ $t(`monthlySheet.${log.status}`) }})</span>
                                                </p>
                                            </td>
                                            <td class="px-3 py-1.5 text-right align-top whitespace-nowrap">{{ hmOrBlank(day.clocked_hours) }}</td>
                                            <td class="px-3 py-1.5 text-right align-top whitespace-nowrap">
                                                <span>{{ hmOrBlank(day.extra_hours) }}</span>
                                                <span v-if="Math.abs(day.extra_hours_pending) >= 0.005"
                                                    class="block text-xs text-slate-400 italic">
                                                    {{ $t('monthlySheet.pendingExtra', { hours: hm(day.extra_hours_pending) }) }}
                                                </span>
                                            </td>
                                            <td class="px-3 py-1.5 text-right align-top whitespace-nowrap"
                                                :class="(day.difference_hours ?? 0) < 0 ? 'text-red-600' : 'text-slate-800'">
                                                {{ day.difference_hours === null ? '' : hmOrBlank(day.difference_hours) }}
                                            </td>
                                            <td class="px-3 py-1.5 align-top text-slate-600 min-w-[10rem]">
                                                {{ remarks(day) }}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <p v-if="isEmptyMonth" class="text-sm text-slate-500" data-testid="monthly-sheet-empty">
                                {{ $t('monthlySheet.empty') }}
                            </p>

                            <!-- Absence and shift-type split -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div v-if="state.sheet.totals.absence.length"
                                    class="rounded-xl border border-surface-200 bg-white p-4">
                                    <p class="text-sm font-semibold text-slate-900 mb-2">{{ $t('monthlySheet.absenceByType') }}</p>
                                    <div v-for="(row, index) in state.sheet.totals.absence" :key="index"
                                        class="flex items-center justify-between py-1 text-sm">
                                        <span class="flex items-center gap-x-2">
                                            <span class="inline-block size-2.5 rounded-full" :style="{ background: row.color || '#94a3b8' }" />
                                            {{ row.type }} <span class="text-slate-400">({{ row.days }} {{ $t('monthlySheet.days') }})</span>
                                        </span>
                                        <span class="font-medium">{{ hm(row.hours) }}</span>
                                    </div>
                                </div>
                                <div v-if="state.sheet.totals.by_shift_type.length"
                                    class="rounded-xl border border-surface-200 bg-white p-4">
                                    <p class="text-sm font-semibold text-slate-900 mb-2">{{ $t('monthlySheet.byShiftType') }}</p>
                                    <div v-for="(row, index) in state.sheet.totals.by_shift_type" :key="index"
                                        class="flex items-center justify-between py-1 text-sm">
                                        <span class="flex items-center gap-x-2">
                                            <span class="inline-block size-2.5 rounded-full" :style="{ background: row.color || '#94a3b8' }" />
                                            {{ row.type }}
                                            <span v-if="row.pay_code" class="text-slate-400">({{ row.pay_code }})</span>
                                        </span>
                                        <span class="font-medium">{{ hm(row.hours) }}</span>
                                    </div>
                                </div>
                            </div>

                            <p class="text-xs text-slate-500">
                                {{ $t('monthlySheet.hint') }}
                                <span v-if="state.sheet.totals.is_clamped">
                                    {{ $t('monthlySheet.clampedNote', { start: state.sheet.totals.measured_start, end: state.sheet.totals.measured_end }) }}
                                </span>
                            </p>
                        </div>
                    </LoadingSpinner>
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { employeeMonthlySheetService } from '@/components/api/user/EmployeeMonthlySheetService'
import { usePermissions } from '@/composables/usePermissions'
import { useI18n } from 'vue-i18n'

const runtimeConfig = useRuntimeConfig()
const { t, locale } = useI18n()
const { isAtLeast } = usePermissions()
const router = useRouter()
const employeeUuid = router?.currentRoute?.value?.params?.employee_uuid
const isManager = computed(() => isAtLeast('Manager'))

const breadcrumbLinks = [
    {
        name: 'employees.employees',
        translate: true,
        href: '/employees',
    },
    {
        name: 'monthlySheet.title',
        translate: true,
        href: `/employees/${employeeUuid}/monthly-sheet`,
    },
]

const MONTH_FORMAT = 'YYYY-MM'

const state = reactive({
    month: moment().format(MONTH_FORMAT),
    sheet: null as any,
    isLoading: false,
    isDownloading: false,
    error: '',
})

// The app's language codes are not all BCP-47 ones.
const intlLocale = computed(() => ({ dk: 'da', no: 'nb' } as Record<string, string>)[locale.value] ?? locale.value)

const monthLabel = computed(() =>
    new Intl.DateTimeFormat(intlLocale.value, { month: 'long', year: 'numeric' }).format(moment(state.month, MONTH_FORMAT).toDate()))

function weekday(date: string): string {
    return new Intl.DateTimeFormat(intlLocale.value, { weekday: 'short' }).format(moment(date, 'YYYY-MM-DD').toDate())
}

/** 7.75 -> "7:45", and a negative one keeps its sign. */
function hm(hours: number | null | undefined): string {
    if (hours === null || hours === undefined) return ''
    const minutes = Math.round(Math.abs(hours) * 60)
    const text = `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}`
    return hours < 0 && minutes > 0 ? `-${text}` : text
}

function hmOrBlank(hours: number | null | undefined): string {
    return hours === null || hours === undefined || Math.abs(hours) < 0.005 ? '' : hm(hours)
}

/** A soft version of a shift-type colour, for badge backgrounds. */
function tint(color: string | null | undefined): string {
    return /^#[0-9a-f]{6}$/i.test(color ?? '') ? `${color}22` : '#f1f5f9'
}

function rowClass(day: any): string {
    return [
        day.is_today ? 'bg-primary-50 ring-1 ring-inset ring-primary-200' : day.holiday ? 'bg-amber-50' : day.is_weekend ? 'bg-slate-50' : '',
    ].join(' ')
}

function remarks(day: any): string {
    const parts = [...day.remarks]
    for (const additional of day.additional_hours ?? []) {
        parts.push(`${additional.time_in}–${additional.time_out} (${additional.is_approved ? '✓' : t('monthlySheet.pending')})`)
    }
    return parts.join('; ')
}

const isEmptyMonth = computed(() => !state.sheet?.days?.some((day: any) =>
    day.shifts.length || day.time_logs.length || day.extra_hours || day.extra_hours_pending))

const cards = computed(() => {
    const totals = state.sheet?.totals
    if (!totals) return []

    return [
        { key: 'planned', label: t('monthlySheet.planned'), value: hm(totals.planned_hours) },
        { key: 'worked', label: t('monthlySheet.worked'), value: hm(totals.worked_hours) },
        { key: 'clocked', label: t('monthlySheet.clocked'), value: hm(totals.clocked_hours), hint: hm(totals.difference_hours) !== '0:00' ? `${t('monthlySheet.difference')} ${hm(totals.difference_hours)}` : '' },
        { key: 'norm', label: t('monthlySheet.norm'), value: hm(totals.norm_hours) },
        ...(totals.balance_hours === null ? [] : [{ key: 'balance', label: t('monthlySheet.balance'), value: hm(totals.balance_hours), negative: totals.balance_hours < 0 }]),
        { key: 'absence', label: t('monthlySheet.absence'), value: hm(totals.absence_hours) },
        {
            key: 'extra',
            label: t('monthlySheet.extraHours'),
            value: hm(totals.extra_hours),
            hint: Math.abs(totals.extra_hours_pending) >= 0.005 ? t('monthlySheet.pendingExtra', { hours: hm(totals.extra_hours_pending) }) : '',
        },
    ] as any[]
})

// A slow answer for a month the user has already left must not overwrite the one they are looking at.
let requestCounter = 0

async function fetchSheet() {
    const current = ++requestCounter
    state.error = ''
    state.isLoading = true
    try {
        const response = await employeeMonthlySheetService.get(employeeUuid, state.month)
        if (current !== requestCounter) return
        state.sheet = response?.data ?? null
    } catch (error: any) {
        if (current !== requestCounter) return
        state.sheet = null
        state.error = error?.message || t('monthlySheet.loadError')
    }
    if (current === requestCounter) state.isLoading = false
}

function shiftMonth(delta: number) {
    state.month = moment(state.month, MONTH_FORMAT).add(delta, 'month').format(MONTH_FORMAT)
    fetchSheet()
}

function goToCurrentMonth() {
    const current = moment().format(MONTH_FORMAT)
    if (state.month === current) return
    state.month = current
    fetchSheet()
}

async function download(type: 'pdf' | 'xlsx') {
    state.error = ''
    state.isDownloading = true
    try {
        const blob = await employeeMonthlySheetService.download(employeeUuid, state.month, type)
        if (!blob) return

        const slug = (state.sheet?.employee?.name ?? 'employee').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `monthly-sheet-${slug || 'employee'}-${state.month}.${type}`
        link.click()
        setTimeout(() => URL.revokeObjectURL(url), 60000)
    } catch (error: any) {
        state.error = error?.message || t('monthlySheet.loadError')
    } finally {
        state.isDownloading = false
    }
}

onMounted(fetchSheet)
</script>
