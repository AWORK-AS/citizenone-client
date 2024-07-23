<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('dutySchedules.dutySchedules') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('dutySchedules.dutySchedules') }}</template>

            <div class="flex justify-end items-center mb-5">
                <FormButton buttonStyle="action" class="rounded-lg" @click="state.modal.isAddEventOpen = true">
                    <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                    {{ $t('dutySchedules.newSchedule') }}
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
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesDutyScheduleDefaultView :dutySchedules="state.dutySchedules" @changeDate="changeDate"
                        @editDutySchedule="editDutySchedule" v-if="state.calendarView === 'default'" />
                    <ModulesDutyScheduleWeekView :dutySchedules="state.dutySchedules"
                        @changeDatePerWeek="changeDatePerWeek" @editDutySchedule="editDutySchedule"
                        v-if="state.calendarView === 'week'" />
                    <ModulesDutyScheduleMonthView :dutySchedules="state.dutySchedules"
                        @changeMonthYear="changeMonthYear" @editDutySchedule="editDutySchedule"
                        v-if="state.calendarView === 'month'" />
                </LoadingSpinner>
            </div>
            <ModulesDutyScheduleModalNew :isModalOpen="state.modal.isAddEventOpen"
                @close="state.modal.isAddEventOpen = false" @refreshSchedules="fetchDutySchedules" />
            <ModulesDutyScheduleModalEdit :isModalOpen="state.modal.isEditEventOpen"
                :selectedSchedule="state.selectedSchedule" @close="state.modal.isEditEventOpen = false"
                @refreshSchedules="fetchDutySchedules" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { dutyScheduleService } from '@/components/api/DutyScheduleService'

interface CalendarEvent {
    id: string
    uuid: string
    title: string
    description: string
    start: string
    end: string
    is_private: boolean
    user_uuid: string
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
    dutySchedules: any[],
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
    dutySchedules: [],
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
        user_uuid: '',
    }
})

onMounted(() => {
    fetchDutySchedules()
})

async function fetchDutySchedules() {
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

        const response = await dutyScheduleService.getDutySchedules(params)
        if (response.data) {
            state.dutySchedules = response
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
        fetchDutySchedules()
    }
}

function changeDate(date: any) {
    state.selectedYear = ''
    state.selectedMonth = ''
    state.selectedDate = {
        end_date: date,
        start_date: date,
    }
    fetchDutySchedules()
}

function changeDatePerWeek(date: any) {
    state.selectedYear = ''
    state.selectedMonth = ''
    state.selectedDate = {
        end_date: date[1],
        start_date: date[0],
    }
    fetchDutySchedules()
}

function changeMonthYear(year: any, month: any) {
    state.selectedDate = {
        end_date: '',
        start_date: '',
    }
    state.selectedYear = year
    state.selectedMonth = month
    fetchDutySchedules()
}

function editDutySchedule(selectedDutySchedule: any) {
    state.selectedSchedule.uuid = selectedDutySchedule.uuid
    state.selectedSchedule.title = selectedDutySchedule.title
    state.selectedSchedule.description = selectedDutySchedule.description
    state.selectedSchedule.start = selectedDutySchedule.date_time_start
    state.selectedSchedule.end = selectedDutySchedule.date_time_end
    state.selectedSchedule.is_private = selectedDutySchedule.is_private ? true : false
    state.selectedSchedule.user_uuid = selectedDutySchedule.user.uuid
    state.modal.isEditEventOpen = true
}
</script>