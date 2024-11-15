<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <h3 class="text-primary text-base font-medium py-2">
            {{ $t('dailyOverview.myDailyEvents') }}
        </h3>

        <div class="bg-white shadow-md rounded-md border-l-8 border-secondary flex items-center justify-center min-h-96 max-h-96 text-sm mt-2"
            v-if="state.myCalendarEvents?.data?.length === 0">
            {{ $t('dailyOverview.noEventsForToday') }}
        </div>
        <div class="bg-white shadow-md rounded-md border-l-8 border-secondary mt-2 text-sm space-y-2 divide-y overflow-scroll min-h-96 max-h-96 pr-5 pt-4 pb-4 pl-6 mr-1"
            v-else>
            <div v-for="(myCalendarEvent, index) in state.myCalendarEvents?.data" :key="index" class="py-3">
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
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { dailyOverviewService } from '@/components/api/DailyOverviewService'
import type { CalendarEventResponse, Error } from '@/types'

const { formatTimeToReadable } = useDatetimeFormatter()

const state = reactive({
    isPageLoading: false,
    myCalendarEvents: {} as CalendarEventResponse,
    error: {} as Error,
})

onMounted(() => {
    fetchMyCalendarEvents()
})

async function fetchMyCalendarEvents() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await dailyOverviewService.getMyDailyEvents()
        if (response) {
            state.myCalendarEvents = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>