<template>
    <Head>
        <Title>{{ $t('dutySchedules.shareDutySchedule.dutySchedule') }}</Title>
    </Head>

    <div class="min-h-screen bg-white p-3 text-gray-900">
        <!-- The API answers a wrong, switched-off and expired code alike, so the
             visitor gets the likely reasons rather than the actual one. -->
        <div v-if="state.isUnavailable" role="status"
            class="mx-auto mt-8 max-w-md rounded-xl bg-gray-50 px-6 py-6 ring-1 ring-gray-200">
            <div class="flex items-start gap-x-3">
                <span class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-primary">
                    <Icon name="ph:calendar-x" class="h-5 w-5" aria-hidden="true" />
                </span>
                <div class="text-sm text-gray-600">
                    <p class="text-base font-semibold text-gray-900">
                        {{ $t('dutySchedules.shareDutySchedule.embed.unavailable') }}
                    </p>
                    <p class="mt-2">{{ $t('dutySchedules.shareDutySchedule.embed.unavailableHelp') }}</p>
                    <ul class="mt-1 list-disc space-y-0.5 pl-5">
                        <li>{{ $t('dutySchedules.shareDutySchedule.embed.unavailableReasonOff') }}</li>
                        <li>{{ $t('dutySchedules.shareDutySchedule.embed.unavailableReasonNewCode') }}</li>
                        <li>{{ $t('dutySchedules.shareDutySchedule.embed.unavailableReasonExpired') }}</li>
                    </ul>
                    <p class="mt-3">{{ $t('dutySchedules.shareDutySchedule.embed.unavailableContact') }}</p>
                </div>
            </div>
        </div>

        <template v-else>
            <header class="mb-2 flex flex-wrap items-center justify-between gap-2 py-1">
                <div class="rounded-lg bg-blue-50 px-3 py-1 ring-1 ring-blue-200">
                    <h1 class="text-center text-sm font-semibold leading-6 text-gray-900">
                        {{ $t(`calendar.month.${monthKey}`) }} {{ weekStart.format('YYYY') }}
                    </h1>
                </div>
                <div class="flex items-center gap-1.5">
                    <button type="button" @click="goToWeek(moment())" :disabled="isCurrentWeek"
                        class="whitespace-nowrap rounded-md px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-blue-50 hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-50">
                        {{ $t('goToToday') }}
                    </button>
                    <div class="flex h-8 items-center overflow-hidden rounded-lg bg-white ring-1 ring-gray-200">
                        <button type="button" @click="goToWeek(weekStart.clone().subtract(1, 'week'))"
                            :disabled="isCurrentWeek" :aria-label="$t('dutySchedules.shareDutySchedule.embed.previousWeek')"
                            class="flex h-8 w-8 items-center justify-center text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50">
                            <Icon name="heroicons:chevron-left" class="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <span class="whitespace-nowrap border-x border-gray-200 px-3 text-xs tabular-nums text-gray-600">
                            {{ weekRangeLabel }}
                        </span>
                        <button type="button" @click="goToWeek(weekStart.clone().add(1, 'week'))"
                            :aria-label="$t('dutySchedules.shareDutySchedule.embed.nextWeek')"
                            class="flex h-8 w-8 items-center justify-center text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600">
                            <Icon name="heroicons:chevron-right" class="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </header>

            <div ref="scrollerRef" class="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-200 transition-opacity"
                :class="state.isLoading && 'opacity-60'" :aria-busy="state.isLoading">
                <div class="w-max min-w-full" role="table">
                    <div class="embed-grid border-b border-gray-100" role="row">
                        <div class="sticky left-0 z-10 flex items-center border-r border-gray-100 bg-gray-50 px-3 py-3"
                            role="columnheader">
                            <p class="whitespace-nowrap text-sm font-bold text-blue-600 sm:text-base">
                                {{ $t('dutySchedules.week') }} {{ weekStart.isoWeek() }}
                            </p>
                        </div>
                        <div v-for="day in weekDays" :key="day.date" role="columnheader" :data-today="day.isToday || undefined" :class="[
                            day.isToday ? 'border-x-2 border-t-2 border-blue-400 bg-blue-50' : 'border-0.5',
                            'flex items-center justify-center gap-x-1 py-3 text-sm'
                        ]">
                            {{ $t(`calendar.week.short.${day.weekdayKey}`) }}
                            <span class="font-semibold text-gray-900">{{ day.dayOfMonth }}</span>
                        </div>
                    </div>

                    <div v-for="(employee, employeeIndex) in state.employees" :key="employeeIndex"
                        class="embed-grid" role="row">
                        <div class="sticky left-0 z-10 border-b border-r border-gray-100 bg-gray-50 px-3 py-3"
                            role="rowheader">
                            <div class="flex min-w-0 items-center gap-x-2">
                                <span aria-hidden="true"
                                    class="hidden h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 sm:flex border-blue-300 bg-blue-50 text-xs font-semibold text-primary shadow-md ring-2 ring-white sm:h-11 sm:w-11 sm:text-sm">
                                    {{ initials(employee.name) }}
                                </span>
                                <div class="min-w-0">
                                    <p class="truncate text-xs font-medium sm:text-sm">{{ employee.name }}</p>
                                    <p class="truncate text-xxs text-gray-500 sm:text-xs" v-if="employee.job_title">
                                        {{ employee.job_title }}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div v-for="day in weekDays" :key="day.date" role="cell" :class="[
                            day.isToday ? 'border-x-2 border-blue-400 bg-blue-50/40' : 'border-0.5',
                            'space-y-2 p-2'
                        ]">
                            <div v-for="(shift, shiftIndex) in shiftsOn(employee, day.date)" :key="shiftIndex"
                                :class="[
                                    shift.is_absence ? 'bg-gray-100 text-gray-600 ring-1 ring-gray-200' : 'text-white',
                                    'shift-card rounded-xl shadow-sm'
                                ]" :style="!shift.is_absence ? { backgroundColor: shift.color || '#0f4c75' } : {}">
                                <div class="shift-times flex items-center gap-x-1 gap-y-1 px-2 pb-1.5 pt-2 text-sm font-bold leading-none tracking-tight tabular-nums">
                                    <span>{{ shift.start_time }}</span>
                                    <Icon name="ph:arrow-right" aria-hidden="true" :class="[
                                        shift.is_absence ? 'text-gray-400' : 'text-white/70',
                                        'shift-arrow h-3 w-3 flex-shrink-0'
                                    ]" />
                                    <span :class="shift.is_absence ? 'text-gray-500' : 'text-white/90'">{{ shift.end_time }}</span>
                                </div>
                                <div :class="[shift.is_absence ? 'border-gray-200' : 'border-white/20', 'mx-2 mb-1 border-t']" />
                                <div class="space-y-0.5 px-2 pb-1.5 text-[10px] font-medium leading-tight">
                                    <span v-if="shiftHours(shift) !== null"
                                        :class="[shift.is_absence ? 'text-gray-500' : 'text-white/80', 'flex items-center gap-1']">
                                        <Icon name="ph:clock" class="h-3 w-3 flex-shrink-0 opacity-70" aria-hidden="true" />
                                        {{ shiftHours(shift) }}
                                    </span>
                                    <span v-else-if="spanLabel(shift)"
                                        :class="[shift.is_absence ? 'bg-gray-200' : 'bg-white/20', 'inline-block rounded-full px-2 py-0.5']">
                                        {{ spanLabel(shift) }}
                                    </span>
                                    <p class="line-clamp-2 hyphens-auto break-words" :title="shiftLabel(shift)">
                                        {{ shiftLabel(shift) }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <p v-if="!state.isLoading && state.employees.length > 0 && !hasAnyShifts"
                        class="px-3 py-6 text-center text-sm text-gray-500">
                        {{ $t('dutySchedules.shareDutySchedule.embed.noShifts') }}
                    </p>
                </div>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
// Chrome-less by design: no layout, no navigation, nothing that needs a
// signed-in user. This page is what a company puts in an <iframe> on its own
// website (snippet from the "Embed" button on a shared duty schedule), so it
// is allowed to be framed by any site - see server/middleware/embed-framing.ts.
// It deliberately talks to the API with a bare $fetch instead of
// BaseAPIService: that one reads the session token from localStorage and acts
// on 401s, neither of which belongs inside someone else's website.
//
// It borrows the look of the in-app week view (components/modules/user/
// duty-schedule/week-view.vue) but none of its controls, and it shows the
// clock length of a shift rather than the weighted hours staff see in-app.
import moment from 'moment'
import { useI18n } from 'vue-i18n'

definePageMeta({
    layout: false,
})

interface EmbedShift {
    date: string
    start_time: string
    end_time: string
    span_position: 'single' | 'start' | 'middle' | 'end' | null
    is_absence: boolean
    label: string | null
    color: string | null
}

interface EmbedEmployee {
    name: string
    job_title: string | null
    shifts: EmbedShift[]
}

const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const { t, locale } = useI18n()

const embedToken = route.params.embedToken as string
const requestedLocale = route.query.locale as string
const appLocale = ['dk', 'en', 'no', 'sv'].includes(requestedLocale) ? requestedLocale : 'dk'
locale.value = appLocale

// The app's locale codes are not language tags; dk is Danish, no is Bokmål.
const numberLocale = ({ dk: 'da', en: 'en', no: 'nb', sv: 'sv' } as Record<string, string>)[appLocale]

const state = reactive({
    employees: [] as EmbedEmployee[],
    isLoading: false,
    isUnavailable: false,
    weekStart: moment().startOf('isoWeek').format('YYYY-MM-DD'),
})

const weekStart = computed(() => moment(state.weekStart))
const isCurrentWeek = computed(() => weekStart.value.isSame(moment(), 'isoWeek'))

// The translation keys are the English month names.
const monthKey = computed(() => weekStart.value.clone().locale('en').format('MMMM'))

const weekDays = computed(() => {
    const keys = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    return keys.map((weekdayKey, index) => {
        const day = weekStart.value.clone().add(index, 'day')
        return {
            date: day.format('YYYY-MM-DD'),
            dayOfMonth: day.date(),
            isToday: day.isSame(moment(), 'day'),
            weekdayKey,
        }
    })
})

const weekRangeLabel = computed(() => {
    const end = weekStart.value.clone().endOf('isoWeek')
    return `${weekStart.value.format('DD.MM')} – ${end.format('DD.MM.YYYY')}`
})

const hasAnyShifts = computed(() => state.employees.some((employee) => employee.shifts.length > 0))

function shiftsOn(employee: EmbedEmployee, date: string) {
    return employee.shifts.filter((shift) => shift.date === date)
}

function initials(name: string) {
    const parts = name.trim().split(/\s+/)
    return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

function minutesOf(time: string) {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
}

// Clock length of a shift that sits within one day. A row that is one piece
// of a shift past midnight gets the span badge instead: its own piece would be
// a misleading number, and the whole shift may run outside this week.
function shiftHours(shift: EmbedShift) {
    if (shift.is_absence || (shift.span_position && shift.span_position !== 'single')) return null

    let minutes = minutesOf(shift.end_time) - minutesOf(shift.start_time)
    if (minutes <= 0) minutes += 24 * 60

    return (minutes / 60).toLocaleString(numberLocale, { maximumFractionDigits: 2 })
}

function spanLabel(shift: EmbedShift) {
    if (shift.span_position === 'start') return t('dutySchedules.shiftSpan.start')
    if (shift.span_position === 'middle') return t('dutySchedules.shiftSpan.middle')
    if (shift.span_position === 'end') return t('dutySchedules.shiftSpan.end')
    return null
}

function shiftLabel(shift: EmbedShift) {
    return shift.is_absence ? t('dutySchedules.shareDutySchedule.embed.absent') : (shift.label ?? '')
}

function goToWeek(date: moment.Moment) {
    const start = date.clone().startOf('isoWeek')
    // History is not part of the embed; the API refuses it too.
    if (start.isBefore(moment().startOf('isoWeek'))) return
    state.weekStart = start.format('YYYY-MM-DD')
    fetchSchedule()
}

const scrollerRef = ref<HTMLElement | null>(null)

// On a phone the week does not fit and the table scrolls sideways. Open it on
// today's column rather than on a Monday that may already be over.
async function scrollToToday() {
    await nextTick()
    const scroller = scrollerRef.value
    const today = scroller?.querySelector<HTMLElement>('[data-today]')
    const names = scroller?.querySelector<HTMLElement>('[role=columnheader]')
    if (!scroller || !today || !names || scroller.scrollWidth <= scroller.clientWidth) return
    const fromLeft = today.getBoundingClientRect().left - scroller.getBoundingClientRect().left + scroller.scrollLeft
    scroller.scrollLeft = fromLeft - names.offsetWidth
}

let latestRequest = 0

async function fetchSchedule() {
    const request = ++latestRequest
    state.isLoading = true
    try {
        const response: any = await $fetch(`${runtimeConfig.public.apiBaseURL}/public/duty-schedule-embed/${embedToken}`, {
            headers: { Accept: 'application/json' },
            query: {
                date_start: weekStart.value.format('YYYY-MM-DD'),
                date_end: weekStart.value.clone().endOf('isoWeek').format('YYYY-MM-DD'),
                locale: appLocale,
            },
        })
        // Clicking through weeks quickly must not let an older answer win.
        if (request !== latestRequest) return
        state.employees = response?.data ?? []
        scrollToToday()
    } catch (error: any) {
        if (request !== latestRequest) return
        if (error?.response?.status === 404) {
            state.isUnavailable = true
        }
    }
    state.isLoading = false
}

onMounted(() => {
    fetchSchedule()
})
</script>

<style scoped>
/* A fixed name column and day columns that share the rest. Below the minimum
   the table scrolls sideways under the sticky names. */
.embed-grid {
    display: grid;
    grid-template-columns: 11rem repeat(7, minmax(4.75rem, 1fr));
}

@media (max-width: 640px) {
    .embed-grid {
        grid-template-columns: 7.5rem repeat(7, minmax(4.75rem, 1fr));
    }
}

/* The card reads "10:00 → 18:00" when there is room and stacks the two
   times when the customer's iframe makes the day columns narrow. */
.shift-card {
    container-type: inline-size;
}

@container (max-width: 6.5rem) {
    .shift-times {
        flex-direction: column;
        align-items: flex-start;
    }

    .shift-arrow {
        display: none;
    }
}
</style>
