<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>Calendar - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #header>Calendar</template>
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
import { reactive, onMounted } from 'vue'

interface Schedule {
    id: string
    uuid: string
    title: string
    date_time_start: string
    date_time_end: string
}

interface CalendarEvent {
    id: string
    uuid: string
    title: string
    start: string
    end: string
}

interface ErrorState {
    message?: string
}

interface ModalState {
    isAddEventOpen: boolean
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
    }
    error: ErrorState | null
    isPageLoading: boolean
    modal: ModalState
}

const runtimeConfig = useRuntimeConfig()

const state = reactive<State>({
    calendarOptions: {
        headerToolbar: {
            start: 'dayGridMonth,timeGridWeek,listWeek', // will normally be on the left. if RTL, will be on the right
            center: 'title',
            end: 'today prev,next' // will normally be on the right. if RTL, will be on the left
        },
        height: 700,
        plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin],
        initialView: 'dayGridMonth',
        events: []
    },
    error: null,
    isPageLoading: false,
    modal: {
        isAddEventOpen: false,
    },
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
                console.log('schedule', schedule)
                state.calendarOptions.events.push({
                    id: schedule.id,
                    uuid: schedule.uuid,
                    title: schedule.title,
                    start: schedule.date_time_start,
                    end: schedule.date_time_end
                })
            })
        }
    } catch (error: any) {
        state.error = { message: error.message }
    }
    state.isPageLoading = false
}
</script>
