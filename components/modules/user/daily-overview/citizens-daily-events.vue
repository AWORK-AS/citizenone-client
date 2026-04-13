<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <div class="p-5" v-if="state.citizenCalendarEvents?.data?.length === 0">
            <div
                class="border-2 border-gray-300 border-dashed rounded-md flex items-center justify-center min-h-80 max-h-80 text-sm mt-2">
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
        </div>
        <div class="text-sm space-y-2 divide-y overflow-scroll min-h-96 max-h-96 px-5 py-4" v-else>
            <div v-for="(event, index) in state.citizenCalendarEvents?.data" :key="index" class="py-3">
                <div class="space-y-1">
                    <p class="text-base font-semibold text-gray-700 xl:pr-0">
                        {{ event?.title }}
                    </p>
                    <div class="flex gap-x-2">
                        <dt class="flex mt-1">
                            <span class="sr-only">Description</span>
                            <Icon name="heroicons:bars-3-bottom-left" class="h-4 w-4 text-gray-400"
                                aria-hidden="true" />
                        </dt>
                        <dd class="text-gray-900 xl:pr-0">
                            {{ event?.description }}
                        </dd>
                    </div>
                    <div class="flex gap-x-2 text-xs text-gray-500" v-if="event?.unit?.name">
                        <p>
                            {{ $t('units.unit') }}:
                        </p>
                        <p>
                            {{ event?.unit?.name }}
                        </p>
                    </div>
                    <div class="me-auto max-w-full">
                        <div class="flex items-center gap-x-2 text-xs ">
                            <div class="flex items-center">
                                <span class="sr-only">Date</span>
                                <Icon name="ph:calendar" class="h-4 w-4 text-gray-400" aria-hidden="true" />
                            </div>
                            <div class="">
                                <p>
                                    {{ formatDateTimeToReadable(event?.date_time_start ?? moment()) }}
                                    -
                                    {{ formatDateTimeToReadable(event?.date_time_end ?? moment()) }}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="text-xxs flex flex-wrap gap-1 mt-1" v-if="event?.calendar_tags?.length > 0">
                        <span v-for="(calendarTag, index) in event?.calendar_tags" :key=index
                            class="p-1 text-white rounded-md" :style="{ backgroundColor: calendarTag?.color }">
                            {{ calendarTag?.tag }}
                        </span>
                    </div>
                    <div class="text-gray-500 text-xxs mt-1">
                        <p>{{ $t('events.eventOwner') }}:</p>
                        <div class="flex flex-wrap gap-1 mt-1">
                            <div v-for="(owner, index) in event.calendar_owners" :key="index"
                                class="bg-primary text-xxs p-1 text-white rounded-md">
                                {{ owner?.owner?.firstname }} {{ (owner?.owner?.lastname ?? '') }}
                            </div>
                        </div>
                    </div>
                    <div class="text-gray-500 text-xxs mt-1" v-if="event.calendar_users?.length > 0">
                        <p>{{ $t('events.invitees') }}:</p>
                        <div class="flex flex-wrap gap-1 mt-1">
                            <div v-for="(invitee, index) in event.calendar_users" :key="index"
                                class="bg-primary text-xxs p-1 text-white rounded-md">
                                {{ invitee?.user?.firstname }} {{ (invitee?.user?.lastname ?? '') }}
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
import { dailyOverviewService } from '@/components/api/user/DailyOverviewService'
import { useDepartmentStore } from '@/store/department'
import type { Error } from '@/types'

const props = defineProps({
    dateRange: {
        type: Object,
        required: false,
    },
})

const departmentStore = useDepartmentStore()
const { formatDateTimeToReadable } = useDatetimeFormatter()

const state = reactive({
    isPageLoading: false,
    citizenCalendarEvents: [] as any,
    error: {} as Error,
})

watch(() => props.dateRange, () => {
    fetchCitizenCalendarEvents()
}, { deep: true })

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

        if (props.dateRange) {
            params.end_date = props.dateRange.end_date
            params.start_date = props.dateRange.start_date
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