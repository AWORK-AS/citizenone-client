<template>
    <!-- Hours a week per citizen: what the employee is given on each citizen
         they are assigned to, what they used this week and what is left. Only
         when the company switched it on. -->
    <section v-if="state.week?.enabled" id="card-citizen-hours"
        class="rounded-xl bg-white ring-1 ring-gray-200 p-5 lg:col-span-2">
        <div class="flex flex-wrap items-center gap-2 mb-3">
            <Icon name="ph:hourglass-medium" class="size-5 text-tertiary" aria-hidden="true" />
            <h3 class="font-semibold text-gray-900">{{ $t('myDay.citizenHours.title') }}</h3>
            <div class="ml-auto flex items-center gap-1">
                <button type="button" class="flex size-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
                    :aria-label="$t('myDay.citizenHours.previousWeek')" @click="shiftWeek(-1)">
                    <Icon name="ph:caret-left" class="size-4" aria-hidden="true" />
                </button>
                <span class="min-w-24 text-center text-xs font-medium text-gray-600 tabular-nums">
                    {{ $t('myDay.citizenHours.week', { week: state.week.week_number }) }}
                </span>
                <button type="button" class="flex size-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
                    :aria-label="$t('myDay.citizenHours.nextWeek')" @click="shiftWeek(1)">
                    <Icon name="ph:caret-right" class="size-4" aria-hidden="true" />
                </button>
            </div>
        </div>

        <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />

        <LoadingSpinner :isActive="state.isLoading">
            <ul v-if="state.week.citizens?.length" class="space-y-2">
                <li v-for="row in state.week.citizens" :key="row.citizen_uuid">
                    <NuxtLink :to="`/citizens/${row.citizen_uuid}`"
                        class="block rounded-lg bg-gray-50 px-3 py-2 transition-colors hover:bg-primary-25">
                        <div class="flex items-center justify-between gap-3">
                            <p class="min-w-0 truncate text-sm font-medium text-gray-800">
                                {{ [row.firstname, row.lastname].filter(Boolean).join(' ') }}
                            </p>
                            <span class="shrink-0 text-xs font-medium tabular-nums" :class="{
                                'text-red-600': weekStatus(row) === 'over',
                                'text-green-700': weekStatus(row) === 'done',
                                'text-gray-600': weekStatus(row) === 'open',
                            }">
                                {{ statusText(row) }}
                            </span>
                        </div>
                        <div class="mt-1.5 flex items-center gap-3">
                            <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200" role="progressbar"
                                :aria-valuenow="weekProgress(row)" aria-valuemin="0" aria-valuemax="100"
                                :aria-label="[row.firstname, row.lastname].filter(Boolean).join(' ')">
                                <div class="h-full rounded-full" :style="{ width: `${weekProgress(row)}%` }" :class="{
                                    'bg-red-500': weekStatus(row) === 'over',
                                    'bg-green-600': weekStatus(row) === 'done',
                                    'bg-primary': weekStatus(row) === 'open',
                                }"></div>
                            </div>
                            <span class="shrink-0 text-xxs text-gray-500 tabular-nums">
                                {{ $t('myDay.citizenHours.usedOfGiven', {
                                    used: formatWeekHours(row.used_hours, locale),
                                    given: formatWeekHours(row.weekly_hours, locale),
                                }) }}
                            </span>
                        </div>
                    </NuxtLink>
                </li>
            </ul>
            <p v-else class="text-sm text-gray-400">{{ $t('myDay.citizenHours.none') }}</p>
        </LoadingSpinner>
    </section>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useI18n } from 'vue-i18n'
import { dailyOverviewService } from '@/components/api/user/DailyOverviewService'
import { formatWeekHours, weekProgress, weekStatus, type CitizenWeekRow } from '@/composables/citizenWeeklyHours'
import type { Error } from '@/types'

const { t, locale } = useI18n()

const state = reactive({
    date: moment().format('YYYY-MM-DD'),
    week: null as null | {
        enabled: boolean
        week_start: string
        week_end: string
        week_number: number
        citizens: CitizenWeekRow[]
    },
    isLoading: false,
    error: {} as Error,
})

onMounted(() => {
    fetchWeek()
})

function shiftWeek(weeks: number) {
    state.date = moment(state.date).add(weeks, 'weeks').format('YYYY-MM-DD')
    fetchWeek()
}

function statusText(row: CitizenWeekRow) {
    const hours = formatWeekHours(Math.abs(row.remaining_hours), locale.value)
    switch (weekStatus(row)) {
        case 'over':
            return t('myDay.citizenHours.over', { hours })
        case 'done':
            return t('myDay.citizenHours.done')
        default:
            return t('myDay.citizenHours.remaining', { hours })
    }
}

async function fetchWeek() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await dailyOverviewService.getMyCitizenHours({ date: state.date })
        state.week = response?.data ?? null
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}
</script>
