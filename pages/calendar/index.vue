<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('events.myCalendar') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('events.myCalendar') }}</template>

            <div class="flex justify-end items-center mb-5 gap-x-2">
                <FormButton buttonStyle="action" class="rounded-lg" @click="state.modal.isAddEventOpen = true">
                    <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                    {{ $t('events.newEvent') }}
                </FormButton>
                <!-- <FormButton buttonStyle="action" class="rounded-lg" @click="subscribe">
                    <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                    {{ $t('events.subscribe') }}
                </FormButton> -->
            </div>

            <div class="grid lg:grid-cols-6 gap-3">
                <div class="flex items-center gap-x-3 lg:col-span-3">
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
                <div class="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 items-center gap-x-3">
                    <div>
                        <FormLabel for="citizens_uuid" :label="$t('calendar.citizens')" />:
                        <FormSelectMultiple id="citizens_uuid" name="citizens_uuid" :options="state.options.citizens"
                            v-model="state.formCalendar.citizens_uuid" @change="changeCitizensUuid" />
                    </div>
                    <div>
                        <FormLabel for="users_uuid" :label="$t('calendar.employees')" />:
                        <FormSelectMultiple id="users_uuid" name="users_uuid" :options="state.options.users"
                            v-model="state.formCalendar.users_uuid" @change="changeUsersUuid" />
                    </div>
                </div>
            </div>

            <div class="mt-5 space-y-5">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesMyCalendarDefaultView :myCalendarEvents="state.myCalendarEvents" @changeDate="changeDate"
                        @editMyCalendarEvent="editMyCalendarEvent"
                        @openEventDeletionModal="state.modal.isDeleteScheduleOpen = true"
                        @deleteMyCalendarEvent="deleteMyCalendarEvent" v-if="state.calendarView === 'default'" />
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
                @deleteMyCalendarEvent="deleteMyCalendarEvent" @refreshSchedules="fetchMyCalendarEvents" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { citizenService } from '@/components/api/CitizenService'
import { myCalendarService } from '@/components/api/MyCalendarService'
import { userService } from '@/components/api/UserService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { useDepartmentStore } from '@/store/department'
import type { Error } from '@/types'
import { saveAs } from 'file-saver'

const runtimeConfig = useRuntimeConfig()
const router = useRouter()
const departmentStore = useDepartmentStore()
const { successAlert } = useAlert()
const { t } = useI18n()
const employeeUuid = router?.currentRoute?.value?.query?.employee_uuid

const state = reactive({
    calendarView: 'default',
    myCalendarEvents: [] as any,
    error: {} as Error,
    formCalendar: {
        citizens_uuid: [],
        users_uuid: employeeUuid ? [employeeUuid] : [],
    },
    isPageLoading: false,
    modal: {
        isAddEventOpen: false,
        isDeleteScheduleOpen: false,
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
    },
    options: {
        citizens: [] as any,
        users: [] as any,
    }
})

onMounted(() => {
    fetchAllCitizens()
    fetchAllUsers()
    fetchMyCalendarEvents()
})

watch(() => departmentStore.getSelectedDepartmentName, (newValue: any) => {
    if (newValue != null) {
        fetchMyCalendarEvents()
    }
})

async function fetchAllCitizens() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await citizenService.getAllCitizens()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (user: any) => options.push({
                    value: user?.uuid,
                    label: user?.firstname + " " + user?.lastname,
                })
            )
            state.options.citizens = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchAllUsers() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await userService.getAllUsers()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (user: any) => options.push({
                    value: user?.uuid,
                    label: user?.firstname + " " + user?.lastname,
                })
            )
            state.options.users = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function changeCitizensUuid(citizensUuid: any) {
    if (citizensUuid) {
        state.formCalendar.citizens_uuid = citizensUuid
    } else {
        state.formCalendar.citizens_uuid = []
    }
    fetchMyCalendarEvents()
}

function changeUsersUuid(usersUuid: any) {
    if (usersUuid) {
        state.formCalendar.users_uuid = usersUuid
    } else {
        state.formCalendar.users_uuid = []
    }
    fetchMyCalendarEvents()
}

async function fetchMyCalendarEvents() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params: any = {}
        params.department = departmentStore.getSelectedDepartmentName
        if (state.selectedDate.start_date && state.selectedDate.end_date) {
            params.date = state.selectedDate
        }
        if (state.selectedYear) {
            params.year = state.selectedYear
        }
        if (state.selectedMonth !== '') {
            params.month = (state.selectedMonth + 1)
        }
        if (state.formCalendar.citizens_uuid) {
            params.citizen_uuid = Array(state.formCalendar.citizens_uuid)
        }
        if (state.formCalendar.users_uuid) {
            params.employee_uuid = Array(state.formCalendar.users_uuid)
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

async function deleteMyCalendarEvent(selectedCalendarEvent: any) {
    state.error = {}
    state.isPageLoading = true
    state.modal.isEditEventOpen = false
    try {
        const scheduleUuid = selectedCalendarEvent?.uuid
        const response = await myCalendarService.deleteSchedule(scheduleUuid)
        if (response) {
            fetchMyCalendarEvents()
            successAlert(`${t('alert.success')}!`, `${t('events.alert.successfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function subscribe() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await myCalendarService.downloadCalendar()
        if (response) {
            var file = new File([response], "my-schedule.ics")
            saveAs(file, 'my-schedule.ics')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>