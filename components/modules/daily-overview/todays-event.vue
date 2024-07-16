<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <h3 class="text-sm font-medium">{{ $t('dailyOverview.dailyEvents') }}</h3>
        <div class="divide-y divide-gray-100 text-sm">
            <li v-for="(myCalendarEvent, index) in state.myCalendarEvents?.data" :key="index"
                class="relative flex space-x-6 py-6 xl:static">
                <div class="flex-auto">
                    <div class="flex items-center gap-x-2">
                        <dt class="flex items-center">
                            <span class="sr-only">Title</span>
                            <Icon name="ph:clipboard" class="h-4 w-4 text-gray-400" aria-hidden="true" />
                        </dt>
                        <dd class="font-semibold text-gray-900 xl:pr-0">
                            {{ myCalendarEvent?.title }}
                        </dd>
                    </div>
                    <div class="flex gap-x-2">
                        <dt class="flex mt-1">
                            <span class="sr-only">Description</span>
                            <Icon name="heroicons:bars-3-bottom-left" class="h-4 w-4 text-gray-400"
                                aria-hidden="true" />
                        </dt>
                        <dd class="text-gray-900 xl:pr-0">
                            {{ myCalendarEvent?.description }}
                        </dd>
                    </div>
                    <dl class="text-gray-500">
                        <div class="flex items-center space-x-3 text-xs">
                            <dt class="flex items-center">
                                <span class="sr-only">Date</span>
                                <Icon name="ph:calendar" class="h-4 w-4 text-gray-400" aria-hidden="true" />
                            </dt>
                            <dd>
                                <time :datetime="myCalendarEvent.datetime">
                                    {{ formatDateTimeToReadable(myCalendarEvent.date_time_start) }}
                                    -
                                    {{ formatDateTimeToReadable(myCalendarEvent.date_time_end) }}
                                </time>
                            </dd>
                        </div>
                    </dl>
                </div>
            </li>
        </div>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import moment from 'moment'
import { myCalendarService } from '@/components/api/MyCalendarService'

const state = reactive({
    isPageLoading: false,
    myCalendarEvents: [],
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
        if (response.data) {
            state.myCalendarEvents = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function formatDateTimeToReadable(datetime: string) {
    return moment(datetime).format('DD. MMM YYYY HH:mm')
}
</script>