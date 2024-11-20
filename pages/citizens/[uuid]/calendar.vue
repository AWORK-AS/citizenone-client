<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizens.tabs.calendar') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('citizens.tabs.calendar') }}</template>

            <div class="space-y-5">
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/citizens">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesCitizenDetailsHeader />
                <ModulesCitizenJournalTabs />

                <div>
                    <div class="mt-8 flex items-center gap-x-3">
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
                </div>

                <div class="mt-5 space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <LoadingSpinner :isActive="state.isPageLoading">
                        <ModulesCitizenCalendarDefaultView :myCalendarEvents="state.myCalendarEvents"
                            @changeDate="changeDate" @deleteMyCalendarEvent="deleteMyCalendarEvent"
                            v-if="state.calendarView === 'default'" />
                        <ModulesCitizenCalendarWeekView :myCalendarEvents="state.myCalendarEvents"
                            @changeDatePerWeek="changeDatePerWeek" v-if="state.calendarView === 'week'"
                            @viewMyCalendarEvent="viewMyCalendarEvent" />
                        <ModulesCitizenCalendarMonthView :myCalendarEvents="state.myCalendarEvents"
                            @changeMonthYear="changeMonthYear" v-if="state.calendarView === 'month'"
                            @viewMyCalendarEvent="viewMyCalendarEvent" />
                    </LoadingSpinner>
                </div>
                <ModulesCitizenCalendarModalView :isModalOpen="state.modal.isViewEventOpen"
                    :selectedSchedule="state.selectedSchedule" @close="state.modal.isViewEventOpen = false"
                    @deleteMyCalendarEvent="deleteMyCalendarEvent" @refreshSchedules="fetchMyCalendarEvents" />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { citizenService } from '@/components/api/CitizenService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
const { successAlert } = useAlert()
const { t } = useI18n()

const state = reactive({
    calendarView: 'default',
    error: {} as Error,
    isPageLoading: false,
    myCalendarEvents: [] as any,
    modal: {
        isViewEventOpen: false
    },
    selectedDate: {
        end_date: '',
        start_date: '',
    },
    selectedSchedule: {
        id: '',
        uuid: '',
        user: '',
        title: '',
        description: '',
        start: '',
        end: '',
        is_private: false,
    },
    selectedYear: '',
    selectedMonth: '',
})

onMounted(() => {
    fetchMyCalendarEvents()
})

async function fetchMyCalendarEvents() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params: any = {
            citizen_uuid: citizenUuid
        }
        if (state.selectedDate.start_date && state.selectedDate.end_date) {
            params.date = state.selectedDate
        }
        if (state.selectedYear) {
            params.year = state.selectedYear
        }
        if (state.selectedMonth !== '') {
            params.month = (state.selectedMonth + 1)
        }

        const response = await citizenService.getCitizenCalendar(params)
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

function viewMyCalendarEvent(selectedCalendarEvent: any) {
    state.selectedSchedule.uuid = selectedCalendarEvent.uuid
    state.selectedSchedule.user = selectedCalendarEvent.user
    state.selectedSchedule.title = selectedCalendarEvent.title
    state.selectedSchedule.description = selectedCalendarEvent.description
    state.selectedSchedule.start = selectedCalendarEvent.date_time_start
    state.selectedSchedule.end = selectedCalendarEvent.date_time_end
    state.selectedSchedule.is_private = selectedCalendarEvent.is_private ? true : false
    state.modal.isViewEventOpen = true
}

async function deleteMyCalendarEvent(selectedCalendarEvent: any) {
    state.error = {}
    state.isPageLoading = true
    state.modal.isViewEventOpen = false
    try {
        const scheduleUuid = selectedCalendarEvent?.uuid
        const params = {
            citizen_uuid: citizenUuid
        }
        const response = await citizenService.deleteCitizenCalendarEvent(scheduleUuid, params)
        if (response) {
            fetchMyCalendarEvents()
            successAlert(`${t('alert.success')}!`, `${t('citizens.calendar.alert.successfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>