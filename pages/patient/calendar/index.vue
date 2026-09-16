<template>
    <div>
        <NuxtLayout name="patient">

            <Head>
                <Title>{{ $t('patient.nav.calendar') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('patient.nav.calendar') }}</template>

            <div class="mt-2 space-y-5">
                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <div class="inline-flex items-center gap-x-0.5 rounded-lg bg-gray-100 p-0.5">
                    <button type="button" v-for="opt in viewOptions" :key="opt.value" @click="selectView(opt.value)"
                        :class="[
                            state.calendarView === opt.value
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-800',
                            'rounded-md px-4 py-1.5 text-xs font-semibold transition active:scale-95'
                        ]">
                        {{ $t(opt.label) }}
                    </button>
                </div>

                <LoadingSpinner :isActive="state.isLoading">
                    <ModulesUserMyCalendarDefaultView :myCalendarEvents="state.myCalendarEvents" :readOnly="true"
                        @changeMonthYear="changeMonthYear" @viewEvent="openEventDetail"
                        v-if="state.calendarView === 'default'" />
                    <ModulesUserMyCalendarWeekView :myCalendarEvents="state.myCalendarEvents" :readOnly="true"
                        @changeDatePerWeek="changeDatePerWeek" @viewEvent="openEventDetail"
                        v-if="state.calendarView === 'week'" />
                    <ModulesUserMyCalendarMonthView :myCalendarEvents="state.myCalendarEvents" :readOnly="true"
                        @changeMonthYear="changeMonthYear" @viewEvent="openEventDetail"
                        v-if="state.calendarView === 'month'" />
                </LoadingSpinner>
            </div>

            <ModulesPatientCalendarEventDetailModal :isModalOpen="state.modal.isDetailOpen" :event="state.selectedEvent"
                @close="state.modal.isDetailOpen = false" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { patientCalendarService } from '@/components/api/patient/CalendarService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()

const state = reactive({
    error: {} as Error,
    isLoading: false,
    calendarView: 'default',
    selectedDate: {
        start_date: moment().format('Y-M-D'),
        end_date: moment().format('Y-M-D'),
    },
    myCalendarEvents: { data: [], holidays: [] } as any,
    modal: { isDetailOpen: false },
    selectedEvent: null as any,
})

const viewOptions = [
    { value: 'default', label: 'calendar.view.day' },
    { value: 'week', label: 'calendar.view.week' },
    { value: 'month', label: 'calendar.view.month' },
]

onMounted(() => {
    setRangeForView(state.calendarView)
    fetchEvents()
})

function selectView(viewStyle: string) {
    if (state.calendarView === viewStyle) return
    state.calendarView = viewStyle
    setRangeForView(viewStyle)
    fetchEvents()
}

function setRangeForView(viewStyle: string) {
    if (viewStyle === 'week') {
        state.selectedDate = {
            start_date: moment().startOf('isoWeek').format('Y-M-D'),
            end_date: moment().endOf('isoWeek').format('Y-M-D'),
        }
    } else if (viewStyle === 'month') {
        state.selectedDate = {
            start_date: moment().startOf('month').startOf('isoWeek').format('Y-M-D'),
            end_date: moment().endOf('month').endOf('isoWeek').format('Y-M-D'),
        }
    } else {
        state.selectedDate = {
            start_date: moment().format('Y-M-D'),
            end_date: moment().format('Y-M-D'),
        }
    }
}

function changeMonthYear(year: any, month: any) {
    const target = moment([year, month])
    state.selectedDate = {
        start_date: target.clone().startOf('month').startOf('isoWeek').format('Y-M-D'),
        end_date: target.clone().endOf('month').endOf('isoWeek').format('Y-M-D'),
    }
    fetchEvents()
}

function changeDatePerWeek(dates: [string, string]) {
    state.selectedDate = { start_date: dates[0], end_date: dates[1] }
    fetchEvents()
}

function openEventDetail(event: any) {
    state.selectedEvent = event
    state.modal.isDetailOpen = true
}

async function fetchEvents() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await patientCalendarService.getEvents({
            start_date: state.selectedDate.start_date,
            end_date: state.selectedDate.end_date,
        })
        state.myCalendarEvents = {
            data: response?.data ?? [],
            holidays: response?.holidays ?? [],
        }
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}
</script>
