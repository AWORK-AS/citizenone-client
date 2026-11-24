<template>
    <!-- The employee's own week per citizen, beside the calendar: hours given,
         hours booked and what is still to place. The employee books the visits
         themself; "Plan" opens a new booking on that citizen. Only when the
         company uses hours a week and the employee has some. -->
    <section v-if="state.week?.enabled && state.week?.citizens?.length"
        class="rounded-xl bg-white ring-1 ring-gray-200 p-4" aria-labelledby="hours-panel-heading">
        <button type="button" class="flex w-full items-center gap-2 text-left" :aria-expanded="state.isOpen"
            @click="state.isOpen = !state.isOpen">
            <Icon name="ph:hourglass-medium" class="size-5 text-tertiary" aria-hidden="true" />
            <h3 id="hours-panel-heading" class="font-semibold text-gray-900">
                {{ state.week.span === 'month'
                    ? $t('calendar.hoursPanel.titleMonth', { month: monthName })
                    : $t('calendar.hoursPanel.title', { week: state.week.week_number }) }}
            </h3>
            <span class="ml-2 text-xs text-gray-500 tabular-nums">
                {{ $t('calendar.hoursPanel.summary', { planned: formatWeekHours(totals.planned, locale), given: formatWeekHours(totals.given, locale) }) }}
            </span>
            <Icon :name="state.isOpen ? 'ph:caret-up' : 'ph:caret-down'" class="ml-auto size-4 text-gray-500" aria-hidden="true" />
        </button>

        <ul v-if="state.isOpen" class="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
            <li v-for="row in state.week.citizens" :key="row.citizen_uuid" class="rounded-lg bg-gray-50 px-3 py-2">
                <div class="flex items-center justify-between gap-2">
                    <p class="min-w-0 truncate text-sm font-medium text-gray-800">
                        {{ [row.firstname, row.lastname].filter(Boolean).join(' ') }}
                    </p>
                    <button type="button"
                        class="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-25 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary-50"
                        @click="emit('plan', row.citizen_uuid)">
                        <Icon name="ph:plus" class="size-3.5" aria-hidden="true" />
                        {{ $t('calendar.hoursPanel.plan') }}
                    </button>
                </div>
                <div class="mt-1.5 flex items-center gap-2">
                    <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200" role="progressbar"
                        :aria-valuenow="planProgress(row)" aria-valuemin="0" aria-valuemax="100"
                        :aria-label="[row.firstname, row.lastname].filter(Boolean).join(' ')">
                        <div class="h-full rounded-full" :style="{ width: `${planProgress(row)}%` }" :class="{
                            'bg-red-500': planStatus(row) === 'over',
                            'bg-green-600': planStatus(row) === 'done',
                            'bg-primary': planStatus(row) === 'open',
                        }"></div>
                    </div>
                    <span class="shrink-0 text-xxs text-gray-500 tabular-nums">
                        {{ $t('calendar.hoursPanel.plannedOfGiven', { planned: formatWeekHours(row.planned_hours ?? 0, locale), given: formatWeekHours(givenHours(row), locale) }) }}
                    </span>
                </div>
                <p class="mt-1 text-xs tabular-nums" :class="{
                    'text-red-600': planStatus(row) === 'over',
                    'text-green-700': planStatus(row) === 'done',
                    'text-gray-600': planStatus(row) === 'open',
                }">
                    {{ statusText(row) }}
                </p>
                <!-- The citizen's whole grant in the span and what every employee booked on it,
                     beside the employee's own share (AW-2026-10866). -->
                <p v-if="row.citizen_given_hours !== null && row.citizen_given_hours !== undefined"
                    class="mt-0.5 text-xxs text-gray-500 tabular-nums">
                    {{ row.citizen_planned_hours !== null && row.citizen_planned_hours !== undefined
                        ? $t('calendar.hoursPanel.citizenTotal', { planned: formatWeekHours(row.citizen_planned_hours, locale), given: formatWeekHours(row.citizen_given_hours, locale) })
                        : $t('calendar.hoursPanel.citizenGrant', { given: formatWeekHours(row.citizen_given_hours, locale) }) }}
                </p>
            </li>
        </ul>
    </section>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { useI18n } from 'vue-i18n'
import { dailyOverviewService } from '@/components/api/user/DailyOverviewService'
import { formatWeekHours, givenHours, planProgress, planStatus, type CitizenWeekRow } from '@/composables/citizenWeeklyHours'

const props = defineProps({
    // Any day in the week to show (YYYY-MM-DD).
    date: {
        type: String,
        required: true,
    },
    // Bumped by the page after a booking is saved, so the panel reloads.
    refreshKey: {
        type: Number,
        default: 0,
    },
    // 'month' in the calendar's month view: the month's hours and grant instead of the week's.
    span: {
        type: String as PropType<'week' | 'month'>,
        default: 'week',
    },
})
const emit = defineEmits(['plan'])
const { t, locale } = useI18n()

const state = reactive({
    week: null as null | { enabled: boolean, span?: 'week' | 'month', week_number: number, month?: number, year?: number, citizens: CitizenWeekRow[] },
    isOpen: true,
})

const totals = computed(() => (state.week?.citizens ?? []).reduce((sum, row) => ({
    planned: sum.planned + (row.planned_hours ?? 0),
    given: sum.given + givenHours(row),
}), { planned: 0, given: 0 }))

function statusText(row: CitizenWeekRow) {
    const hours = formatWeekHours(Math.abs(row.unplanned_hours ?? 0), locale.value)
    switch (planStatus(row)) {
        case 'over':
            return t('calendar.hoursPanel.overPlanned', { hours })
        case 'done':
            return t('calendar.hoursPanel.allPlanned')
        default:
            return t('calendar.hoursPanel.toPlan', { hours })
    }
}

async function fetchWeek() {
    try {
        const response = await dailyOverviewService.getMyCitizenHours({ date: props.date, span: props.span as 'week' | 'month' })
        state.week = response?.data ?? null
    } catch {
        state.week = null
    }
}

// "november 2026" in the user's language, for the month view's heading.
const monthName = computed(() => {
    const month = state.week?.month
    const year = state.week?.year
    if (!month || !year) return ''
    const tag = locale.value === 'dk' ? 'da' : locale.value === 'no' ? 'nb' : locale.value
    try {
        return new Date(Date.UTC(year, month - 1, 15)).toLocaleDateString(tag, { month: 'long', year: 'numeric', timeZone: 'UTC' })
    } catch {
        return `${month}/${year}`
    }
})

watch(() => [props.date, props.refreshKey, props.span], fetchWeek, { immediate: true })
</script>
