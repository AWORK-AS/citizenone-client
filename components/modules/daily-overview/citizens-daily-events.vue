<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <h3 class="text-primary text-base font-medium py-2">
            {{ $t('dailyOverview.citizensDailyEvents') }}
        </h3>

        <div class="flex items-center justify-center h-80 text-sm mt-10"
            v-if="state.citizenCalendarEvents?.data?.length === 0">
            {{ $t('dailyOverview.noEventsForToday') }}
        </div>
        <div class="bg-white shadow-md rounded-md border-l-8 border-secondary mt-2 text-sm space-y-2 divide-y overflow-scroll min-h-96 max-h-96 pr-5 pt-6 pb-6 pl-6 mr-1"
            v-else>
            <div v-for="(myCalendarEvent, index) in state.citizenCalendarEvents?.data" :key="index" class="py-2">
                <div class="space-y-2">
                    <p class="text-base font-semibold text-gray-700 xl:pr-0">
                        {{ myCalendarEvent?.title }}
                    </p>
                    <div class="text-gray-700 xl:pr-0 text-xs line-clamp-2">
                        {{ myCalendarEvent?.description }}
                    </div>
                    <div class="me-auto max-w-full">
                        <div class="flex items-center gap-x-2 text-xs ">
                            <div class="flex items-center">
                                <span class="sr-only">Time</span>
                                <Icon name="ph:clock" class="h-4 w-4 text-gray-700" aria-hidden="true" />
                            </div>
                            <div>
                                <p>
                                    {{ formatTimeToReadable(myCalendarEvent.date_time_start) }}
                                    -
                                    {{ formatTimeToReadable(myCalendarEvent.date_time_end) }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import moment from 'moment'
import { dailyOverviewService } from '@/components/api/DailyOverviewService'
import type { CalendarEventResponse, Error } from '@/types'

const state = reactive({
    isPageLoading: false,
    citizenCalendarEvents: {} as CalendarEventResponse,
    error: {} as Error,
})

onMounted(() => {
    fetchCitizenCalendarEvents()
})

async function fetchCitizenCalendarEvents() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await dailyOverviewService.getCitizenDailyEvents()
        if (response) {
            state.citizenCalendarEvents = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function formatTimeToReadable(datetime: string) {
    return moment(datetime).format('HH:mm')
}
</script>