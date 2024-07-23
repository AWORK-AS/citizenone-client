<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <h3 class="text-sm font-medium pr-6">{{ $t('dailyOverview.dailyEvents') }}</h3>
        <div class="mt-4 text-sm space-y-2 divide-y overflow-scroll min-h-44 max-h-96 pr-6">
            <div v-for="(myCalendarEvent, index) in state.myCalendarEvents?.data" :key="index" class="p-4">
                <div class="space-y-2">
                    <p class="font-semibold text-gray-700 xl:pr-0">
                        {{ myCalendarEvent?.title }}
                    </p>
                    <div class="text-gray-700 xl:pr-0 text-xs line-clamp-2">
                        {{ myCalendarEvent?.description }}
                    </div>
                    <div class="me-auto max-w-full">
                        <div class="flex items-center justify-end gap-x-2 text-xs ">
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
import { myCalendarService } from '@/components/api/MyCalendarService'
import type { CalendarEventResponse } from '@/types'

const state = reactive({
    isPageLoading: false,
    myCalendarEvents: {} as CalendarEventResponse,
    error: null,
})

onMounted(() => {
    fetchMyCalendarEvents()
})

async function fetchMyCalendarEvents() {
    state.isPageLoading = true
    try {
        const params = {
            end_date: moment(),
            start_date: moment(),
        }

        const response = await myCalendarService.getSchedules(params)
        if (response) {
            state.myCalendarEvents = response
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