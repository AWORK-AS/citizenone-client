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

            <div class="mt-5 space-y-5">
                <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />
                <FullCalendar :options="state.calendarOptions" />
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesDutyScheduleDefaultView :dutySchedules="state.dutySchedules" @changeDate="changeDate"
                        @editDutySchedule="editDutySchedule" />
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
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'

interface User {
    uuid: string
}

interface Schedule {
    id: string
    uuid: string
    title: string
    description: string
    date_time_start: string
    date_time_end: string
    is_private: boolean
    user: User
}

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
    calendarOptions: {
        headerToolbar: {
            start: string
            center: string
            end: string
        }
        height: number
        plugins: any[]
        initialView: string
        events: CalendarEvent[]
        eventClick?: (info: any) => void
    }
    dutySchedules: any[],
    error: ErrorState | null
    isPageLoading: boolean
    modal: ModalState
    selectedDate: string
    selectedSchedule: CalendarEvent
}

const runtimeConfig = useRuntimeConfig()

const state = reactive<State>({
    calendarOptions: {
        events: [],
        headerToolbar: {
            start: 'dayGridMonth,timeGridWeek,listWeek', // will normally be on the left. if RTL, will be on the right
            center: 'title',
            end: 'today prev,next' // will normally be on the right. if RTL, will be on the left
        },
        height: 700,
        initialView: 'dayGridMonth',
        plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin],
        eventClick: handleEventClick,
    },
    dutySchedules: [],
    error: null,
    isPageLoading: false,
    modal: {
        isAddEventOpen: false,
        isEditEventOpen: false
    },
    selectedDate: '',
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
    state.calendarOptions.events = []
    try {
        const params = {
            date: {
                end_date: state.selectedDate,
                start_date: state.selectedDate,
            }
        }
        const response = await dutyScheduleService.getDutySchedules(params)
        if (response.data) {
            state.dutySchedules = response
            response.data.forEach((schedule: Schedule) => {
                state.calendarOptions.events.push({
                    id: schedule.id,
                    uuid: schedule.uuid,
                    title: schedule.title,
                    description: schedule.description,
                    start: schedule.date_time_start,
                    end: schedule.date_time_end,
                    is_private: schedule.is_private,
                    user_uuid: schedule?.user?.uuid,
                })
            })
        }
    } catch (error: any) {
        state.error = { message: error.message }
    }
    state.isPageLoading = false
}

function changeDate(date: any) {
    state.selectedDate = date
    fetchDutySchedules()
}

function editDutySchedule(selectedDutySchedule: any) {
    state.selectedSchedule.id = selectedDutySchedule.id
    state.selectedSchedule.uuid = selectedDutySchedule.uuid
    state.selectedSchedule.title = selectedDutySchedule.title
    state.selectedSchedule.description = selectedDutySchedule.description
    state.selectedSchedule.start = selectedDutySchedule.date_time_start
    state.selectedSchedule.end = selectedDutySchedule.date_time_end
    state.selectedSchedule.is_private = selectedDutySchedule.is_private ? true : false
    state.selectedSchedule.user_uuid = selectedDutySchedule.user.uuid
    state.modal.isEditEventOpen = true
}

function handleEventClick(info: any) {
    state.selectedSchedule.id = info.event.id
    state.selectedSchedule.uuid = info.event.extendedProps.uuid
    state.selectedSchedule.title = info.event.title
    state.selectedSchedule.description = info.event.extendedProps.description
    state.selectedSchedule.start = info.event.start
    state.selectedSchedule.end = info.event.end
    state.selectedSchedule.is_private = info.event.extendedProps.is_private ? true : false
    state.selectedSchedule.user_uuid = info.event.extendedProps.user_uuid
    state.modal.isEditEventOpen = true
}
</script>