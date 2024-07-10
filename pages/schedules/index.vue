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
                    @click="state.calendarView = 'default'" class="rounded-md">
                    Default View
                </FormButton>
                <FormButton :buttonStyle="state.calendarView === 'month' ? 'primary' : ''"
                    @click="state.calendarView = 'month'" class="rounded-md">
                    Month View
                </FormButton>
            </div>

            <div class="mt-5 space-y-5">
                <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesDutyScheduleDefaultView :dutySchedules="state.dutySchedules" @changeDate="changeDate"
                        @editDutySchedule="editDutySchedule" v-if="state.calendarView === 'default'" />
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
    selectedDate: string
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
    selectedDate: '',
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
        const params = {}
        if (state.selectedDate) {
            params.date = {
                end_date: state.selectedDate,
                start_date: state.selectedDate,
            }
        }
        if (state.selectedYear) {
            params.year = state.selectedYear;
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

function changeDate(date: any) {
    state.selectedYear = ''
    state.selectedMonth = ''
    state.selectedDate = date
    fetchDutySchedules()
}

function changeMonthYear(year: any, month: any) {
    state.selectedDate = ''
    state.selectedYear = year
    state.selectedMonth = month
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