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
            <div v-for="(event, index) in state.citizenCalendarEvents?.data" :key="index" class="py-2">
                <div class="space-y-2">
                    <Badge type="primary" class="w-fit">
                        <p class="text-xs px-2">
                            {{ event?.user?.firstname + ' ' + event?.user?.lastname }}
                        </p>
                    </Badge>
                    <p class="text-xs">
                        {{ $t('dailyOverview.createdBy') }}
                        <span v-if="event?.my_calendar?.user?.firstname">
                            {{ event?.my_calendar?.user?.firstname + ' ' }}
                        </span>
                        <span v-if="event?.my_calendar?.user?.lastname">
                            {{ event?.my_calendar?.user?.lastname }}
                        </span>
                    </p>
                    <p class="text-base font-semibold text-gray-700 xl:pr-0">
                        {{ event?.my_calendar?.title }}
                    </p>
                    <div class="text-gray-700 xl:pr-0 text-xs line-clamp-2">
                        {{ event?.my_calendar?.description }}
                    </div>
                    <div class="me-auto max-w-full">
                        <div class="flex items-center gap-x-2 text-xs ">
                            <div class="flex items-center">
                                <span class="sr-only">Time</span>
                                <Icon name="ph:clock" class="h-4 w-4 text-gray-700" aria-hidden="true" />
                            </div>
                            <div>
                                <p>
                                    {{ formatTimeToReadable(event?.my_calendar?.date_time_start ?? moment()) }}
                                    -
                                    {{ formatTimeToReadable(event?.my_calendar?.date_time_end ?? moment()) }}
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
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { dailyOverviewService } from '@/components/api/DailyOverviewService'
import { useDepartmentStore } from '@/store/department'
import type { Error } from '@/types'

const props = defineProps({
    endDate: {
        type: String,
        required: false,
    },
    startDate: {
        type: String,
        required: false,
    },
})

const departmentStore = useDepartmentStore()
const { formatTimeToReadable } = useDatetimeFormatter()

const state = reactive({
    isPageLoading: false,
    citizenCalendarEvents: [] as any,
    error: {} as Error,
    searchFilter: {
        end_date: props.endDate,
        start_date: props.startDate
    }
})

watch(() => props.startDate, (date: any) => {
    if (date != null) {
        state.searchFilter.start_date = date
        fetchCitizenCalendarEvents()
    }
})

watch(() => props.endDate, (date: any) => {
    if (date != null) {
        state.searchFilter.end_date = date
        fetchCitizenCalendarEvents()
    }
})

watch(() => departmentStore.getSelectedDepartmentName, (newValue: any) => {
    if (newValue != null) {
        fetchCitizenCalendarEvents()
    }
})

onMounted(() => {
    fetchCitizenCalendarEvents()
})

async function fetchCitizenCalendarEvents() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params: any = {
            department: departmentStore.getSelectedDepartmentName
        }

        if (state.searchFilter.end_date && state.searchFilter.start_date) {
            params.date = {
                end_date: state.searchFilter.end_date,
                start_date: state.searchFilter.start_date
            }
        }
        const response = await dailyOverviewService.getCitizenDailyEvents(params)
        if (response) {
            state.citizenCalendarEvents = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>