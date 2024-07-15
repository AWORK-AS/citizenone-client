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
            <div class="mt-5 space-y-5">
                <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />
                <FullCalendar :options="state.calendarOptions" />
            </div>
            <ModulesCalendarModalNew :isModalOpen="state.modal.isAddEventOpen"
                @close="state.modal.isAddEventOpen = false" @refreshSchedules="fetchSchedules" />
            <ModulesCalendarModalEdit :isModalOpen="state.modal.isEditEventOpen"
                :selectedSchedule="state.selectedSchedule" @close="state.modal.isEditEventOpen = false"
                @refreshSchedules="fetchSchedules" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { scheduleService } from '@/components/api/ScheduleService'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'

interface Schedule {
    id: string
    uuid: string
    title: string
    description: string
    date_time_start: string
    date_time_end: string
    is_private: boolean
    citizen_user_uuid: object
}

interface CalendarEvent {
    id: string
    uuid: string
    title: string
    description: string
    start: string
    end: string
    is_private: boolean
    citizen_user_uuid: object
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
    error: ErrorState | null
    isPageLoading: boolean
    modal: ModalState
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
    error: null,
    isPageLoading: false,
    modal: {
        isAddEventOpen: false,
        isEditEventOpen: false
    },
    selectedSchedule: {
        id: '',
        uuid: '',
        title: '',
        description: '',
        start: '',
        end: '',
        is_private: false,
        citizen_user_uuid: [],
    }
})

onMounted(() => {
    fetchSchedules()
})

async function fetchSchedules() {
    state.isPageLoading = true
    try {
        const response = await scheduleService.getSchedules()
        if (response.data) {
            response.data.forEach((schedule: Schedule) => {
                state.calendarOptions.events.push({
                    id: schedule.id,
                    uuid: schedule.uuid,
                    title: schedule.title,
                    description: schedule.description,
                    start: schedule.date_time_start,
                    end: schedule.date_time_end,
                    is_private: schedule.is_private,
                    citizen_user_uuid: schedule.citizen_user_uuid,
                })
            })
        }
    } catch (error: any) {
        state.error = { message: error.message }
    }
    state.isPageLoading = false
}

function handleEventClick(info: any) {
    state.selectedSchedule.id = info.event.id
    state.selectedSchedule.uuid = info.event.extendedProps.uuid
    state.selectedSchedule.title = info.event.title
    state.selectedSchedule.description = info.event.extendedProps.description
    state.selectedSchedule.start = info.event.start
    state.selectedSchedule.end = info.event.end
    state.selectedSchedule.is_private = info.event.extendedProps.is_private ? true : false
    state.modal.isEditEventOpen = true
}
</script>