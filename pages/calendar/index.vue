<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('schedules.myCalendar') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('schedules.myCalendar') }}</template>

            <div class="flex justify-end items-center mb-5">
                <FormButton buttonStyle="action" class="rounded-lg" @click="state.modal.isAddEventOpen = true">
                    <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                    {{ $t('schedules.newSchedule') }}
                </FormButton>
            </div>

            <div class="flex items-center gap-x-3">
                <FormButton :buttonStyle="state.calendarView === 'default' ? 'primary' : ''"
                    @click="setCalendarView('default')" class="rounded-md">
                    {{ $t('calendar.view.defaultView') }}
                </FormButton>
                <FormButton :buttonStyle="state.calendarView === 'week' ? 'primary' : ''"
                    @click="setCalendarView('week')" class="rounded-md">
                    {{ $t('calendar.view.weekView') }}
                </FormButton>
                <FormButton :buttonStyle="state.calendarView === 'month' ? 'primary' : ''"
                    @click="setCalendarView('month')" class="rounded-md">
                    {{ $t('calendar.view.monthView') }}
                </FormButton>
            </div>

            <div class="mt-5 space-y-5">
                <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesMyCalendarDefaultView :myCalendarEvents="state.myCalendarEvents" @changeDate="changeDate"
                        @editMyCalendarEvent="editMyCalendarEvent" v-if="state.calendarView === 'default'" />
                    <ModulesMyCalendarWeekView :myCalendarEvents="state.myCalendarEvents"
                        @changeDatePerWeek="changeDatePerWeek" @editMyCalendarEvent="editMyCalendarEvent"
                        v-if="state.calendarView === 'week'" />
                    <ModulesMyCalendarMonthView :myCalendarEvents="state.myCalendarEvents"
                        @changeMonthYear="changeMonthYear" @editMyCalendarEvent="editMyCalendarEvent"
                        v-if="state.calendarView === 'month'" />
                </LoadingSpinner>
            </div>
            <ModulesMyCalendarModalNew :isModalOpen="state.modal.isAddEventOpen"
                @close="state.modal.isAddEventOpen = false" @refreshSchedules="fetchMyCalendarEvents" />
            <ModulesMyCalendarModalEdit :isModalOpen="state.modal.isEditEventOpen"
                :selectedSchedule="state.selectedSchedule" @close="state.modal.isEditEventOpen = false"
                @refreshSchedules="fetchMyCalendarEvents" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { myCalendarService } from '@/components/api/MyCalendarService'

interface CalendarEvent {
    id: string
    uuid: string
    title: string
    description: string
    start: string
    end: string
    is_private: boolean
}

interface ErrorState {
    message?: string
}

interface ModalState {
    isAddEventOpen: boolean
    isEditEventOpen: boolean
}

interface State {
    calendarView: string
    myCalendarEvents: any[],
    error: ErrorState | null
    isPageLoading: boolean
    modal: ModalState
    selectedDate: object
    selectedYear: string
    selectedMonth: string
    selectedSchedule: CalendarEvent
}

const runtimeConfig = useRuntimeConfig()

const state = reactive<State>({
    calendarView: 'default',
    myCalendarEvents: [],
    error: null,
    isPageLoading: false,
    modal: {
        isAddEventOpen: false,
        isEditEventOpen: false
    },
    selectedDate: {
        end_date: '',
        start_date: '',
    },
    selectedYear: '',
    selectedMonth: '',
    selectedSchedule: {
        id: '',
        uuid: '',
        title: '',
        description: '',
        start: '',
        end: '',
        is_private: false,
    }
})

onMounted(() => {
    fetchMyCalendarEvents()
})

async function fetchMyCalendarEvents() {
    state.isPageLoading = true
    try {
        const params: any = {}
        if (state.selectedDate.start_date && state.selectedDate.end_date) {
            params.date = state.selectedDate
        }
        if (state.selectedYear) {
            params.year = state.selectedYear
        }
        if (state.selectedMonth !== '') {
            params.month = (state.selectedMonth + 1)
        }

        const response = await myCalendarService.getSchedules(params)
        if (response.data) {
            state.myCalendarEvents = response
        }
    } catch (error: any) {
        state.error = { message: error.message }
    }
    state.isPageLoading = false
}

function setCalendarView(viewStyle: any) {
    if (state.calendarView !== viewStyle) {
        state.calendarView = viewStyle
        state.selectedDate = {
            end_date: '',
            start_date: '',
        }
        state.selectedYear = ''
        state.selectedMonth = ''
        fetchMyCalendarEvents()
    }
}

function changeDate(date: any) {
    state.selectedYear = ''
    state.selectedMonth = ''
    state.selectedDate = {
        end_date: date,
        start_date: date,
    }
    fetchMyCalendarEvents()
}

function changeDatePerWeek(date: any) {
    state.selectedYear = ''
    state.selectedMonth = ''
    state.selectedDate = {
        end_date: date[1],
        start_date: date[0],
    }
    fetchMyCalendarEvents()
}

function changeMonthYear(year: any, month: any) {
    state.selectedDate = {
        end_date: '',
        start_date: '',
    }
    state.selectedYear = year
    state.selectedMonth = month
    fetchMyCalendarEvents()
}

function editMyCalendarEvent(selectedCalendarEvent: any) {
    state.selectedSchedule.uuid = selectedCalendarEvent.uuid
    state.selectedSchedule.title = selectedCalendarEvent.title
    state.selectedSchedule.description = selectedCalendarEvent.description
    state.selectedSchedule.start = selectedCalendarEvent.date_time_start
    state.selectedSchedule.end = selectedCalendarEvent.date_time_end
    state.selectedSchedule.is_private = selectedCalendarEvent.is_private ? true : false
    state.modal.isEditEventOpen = true
}
</script>