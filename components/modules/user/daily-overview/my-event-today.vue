<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <h3 class="text-primary text-base font-medium py-2">
            {{ $t('overview.calendar') }}
        </h3>

        <div class="border-2 border-gray-300 border-dashed rounded-md flex items-center justify-center min-h-96 max-h-96 text-sm mt-2"
            v-if="state.myCalendarEvents?.data?.length === 0">
            <div>
                <p>
                    {{ $t('overview.noEventsForToday') }}
                </p>
                <div class="flex items-center justify-center mt-2">
                    <button class="w-fit text-center text-primary hover:text-primary-700"
                        @click="navigateTo('/calendar')">
                        {{ $t('overview.addDailyEvents') }}
                    </button>
                </div>
            </div>
        </div>
        <div class="bg-white shadow-md rounded-md border-l-8 border-primary mt-2 text-sm divide-y overflow-scroll min-h-96 max-h-96"
            v-else>
            <div v-for="(myCalendarEvent, index) in state.myCalendarEvents?.data" :key="index" class="pl-4 pr-3 py-5">
                <div class="space-y-2">
                    <p class="text-base font-semibold text-gray-700 xl:pr-0">
                        {{ myCalendarEvent?.title }}
                    </p>
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
                    <div class="flex gap-x-2 text-xs text-gray-500" v-if="myCalendarEvent?.unit?.name">
                        <p>
                            {{ $t('units.unit') }}:
                        </p>
                        <p>
                            {{ myCalendarEvent?.unit?.name }}
                        </p>
                    </div>
                    <div class="me-auto max-w-full">
                        <div class="flex items-center gap-x-2 text-xs ">
                            <div class="flex items-center">
                                <span class="sr-only">Time</span>
                                <Icon name="ph:clock" class="h-4 w-4 text-gray-700" aria-hidden="true" />
                            </div>
                            <div>
                                <p>
                                    {{ formatDateTimeToReadable(myCalendarEvent.date_time_start) }}
                                    -
                                    {{ formatDateTimeToReadable(myCalendarEvent.date_time_end) }}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="text-xxs flex flex-wrap gap-1 mt-1" v-if="myCalendarEvent?.calendar_tags?.length > 0">
                        <span v-for="(calendarTag, index) in myCalendarEvent?.calendar_tags" :key=index
                            class="p-1 text-white rounded-md" :style="{ backgroundColor: calendarTag?.color }">
                            {{ calendarTag?.tag }}
                        </span>
                    </div>
                    <div class="text-gray-500 text-xxs mt-1">
                        <p>{{ $t('events.eventOwner') }}:</p>
                        <div class="flex flex-wrap gap-1 mt-1">
                            <div v-for="(owner, index) in myCalendarEvent.calendar_owners" :key="index"
                                class="bg-secondary text-xxs p-1 text-white rounded-md">
                                {{ owner?.owner?.firstname }} {{ owner?.owner?.lastname }}
                            </div>
                        </div>
                    </div>
                    <div class="text-gray-500 text-xxs mt-1" v-if="myCalendarEvent.calendar_users?.length > 0">
                        <p>{{ $t('events.invitees') }}:</p>
                        <div class="flex flex-wrap gap-1 mt-1">
                            <div v-for="(invitee, index) in myCalendarEvent.calendar_users" :key="index"
                                class="bg-secondary text-xxs p-1 text-white rounded-md">
                                {{ invitee?.user?.firstname }} {{ invitee?.user?.lastname }}
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
import { dailyOverviewService } from '@/components/api/user/DailyOverviewService'
import type { Error } from '@/types'

const props = defineProps({
    dateRange: {
        type: Object,
        required: false,
    },
})

const { formatDateTimeToReadable } = useDatetimeFormatter()

const state = reactive({
    isPageLoading: false,
    myCalendarEvents: [] as any,
    error: {} as Error,
})

watch(() => props.dateRange, () => {
    fetchMyCalendarEvents()
}, { deep: true })

onMounted(() => {
    fetchMyCalendarEvents()
})

async function fetchMyCalendarEvents() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params: any = {}
        if (props.dateRange) {
            params.end_date = props.dateRange.end_date
            params.start_date = props.dateRange.start_date
        }
        const response = await dailyOverviewService.getMyDailyEvents(params)
        if (response) {
            state.myCalendarEvents = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>