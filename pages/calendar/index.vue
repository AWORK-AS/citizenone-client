<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('events.calendar') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('events.calendar') }}</template>
            <template #guided-tour>
                <Tooltip :text="$t('guidedTour')" @click="openGuidedTour()">
                    <Icon name="ph:question" class="size-6 cursor-pointer text-gray-700" aria-hidden="true" />
                </Tooltip>
            </template>

            <ModulesUserCalendarTabs v-if="userStore.getUser?.has_booking_app_access" />

            <div :class="[
                userStore.getUser?.has_booking_app_access && 'mt-8',
                'flex justify-end items-center mb-5 gap-x-2'
            ]">
                <Menu as="div" class="relative inline-block text-left z-20">
                    <div>
                        <MenuButton>
                            <FormButton buttonStyle="action" class="rounded-lg">
                                <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                {{ $t('events.newEvent') }}
                            </FormButton>
                        </MenuButton>
                    </div>

                    <transition enter-active-class="transition duration-100 ease-out"
                        enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
                        leave-active-class="transition duration-75 ease-in"
                        leave-from-class="transform scale-100 opacity-100"
                        leave-to-class="transform scale-95 opacity-0">
                        <MenuItems
                            class="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                            <div class="px-1 py-1">
                                <MenuItem v-slot="{ active }" @click="state.modal.isAddEventForMyselfOpen = true">
                                <button :class="[
                                    active && 'bg-gray-100',
                                    'group flex w-full items-center rounded-md px-2 py-2.5 text-sm',
                                ]">
                                    <Icon name="ph:user" class="mr-2 h-5 w-5" aria-hidden="true" />
                                    {{ $t('events.myself') }}
                                </button>
                                </MenuItem>
                                <MenuItem v-slot="{ active }" @click="state.modal.isAddEventForEmployeeOpen = true">
                                <button :class="[
                                    active && 'bg-gray-100',
                                    'group flex w-full items-center rounded-md px-2 py-2.5 text-sm',
                                ]">
                                    <Icon name="ph:users-three" class="mr-2 h-5 w-5" aria-hidden="true" />
                                    {{ $t('events.employees') }}
                                </button>
                                </MenuItem>
                                <MenuItem v-slot="{ active }" @click="state.modal.isAddEventForCitizenOpen = true">
                                <button :class="[
                                    active && 'bg-gray-100',
                                    'group flex w-full items-center rounded-md px-2 py-2.5 text-sm',
                                ]">
                                    <Icon name="heroicons:user-group" class="mr-2 h-5 w-5" aria-hidden="true" />
                                    {{ $t('events.citizens') }}
                                </button>
                                </MenuItem>
                            </div>
                        </MenuItems>
                    </transition>
                </Menu>
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
                    <ModulesUserMyCalendarDefaultView :myCalendarEvents="state.myCalendarEvents"
                        @changeMonthYear="changeMonthYear" @editMyCalendarEvent="editMyCalendarEvent"
                        @openEventDeletionModal="state.modal.isDeleteScheduleOpen = true"
                        @deleteMyCalendarEvent="deleteMyCalendarEvent" v-if="state.calendarView === 'default'" />
                    <ModulesUserMyCalendarWeekView :myCalendarEvents="state.myCalendarEvents"
                        @changeDatePerWeek="changeDatePerWeek" @editMyCalendarEvent="editMyCalendarEvent"
                        v-if="state.calendarView === 'week'" />
                    <ModulesUserMyCalendarMonthView :myCalendarEvents="state.myCalendarEvents"
                        @changeMonthYear="changeMonthYear" @editMyCalendarEvent="editMyCalendarEvent"
                        v-if="state.calendarView === 'month'" />
                </LoadingSpinner>
            </div>

            <ModulesUserMyCalendarMyselfModalNew :isModalOpen="state.modal.isAddEventForMyselfOpen"
                @close="state.modal.isAddEventForMyselfOpen = false" @refreshSchedules="fetchMyCalendarEvents" />
            <ModulesUserMyCalendarCitizenModalNew :isModalOpen="state.modal.isAddEventForCitizenOpen"
                @close="state.modal.isAddEventForCitizenOpen = false" @refreshSchedules="fetchMyCalendarEvents" />
            <ModulesUserMyCalendarEmployeeModalNew :isModalOpen="state.modal.isAddEventForEmployeeOpen"
                @close="state.modal.isAddEventForEmployeeOpen = false" @refreshSchedules="fetchMyCalendarEvents" />
            <ModulesUserMyCalendarModalEdit :isModalOpen="state.modal.isEditEventOpen"
                :selectedSchedule="state.selectedSchedule" @close="state.modal.isEditEventOpen = false"
                @deleteMyCalendarEvent="deleteMyCalendarEvent" @refreshSchedules="fetchMyCalendarEvents" />

            <ModulesUserGuidedTourModalCalendar v-if="state.modal.isGuidedTourCalendarOpen"
                :isModalOpen="state.modal.isGuidedTourCalendarOpen" :isGuidedTour="false"
                @close="state.modal.isGuidedTourCalendarOpen = false" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { citizenService } from '@/components/api/user/CitizenService'
import { myCalendarService } from '@/components/api/user/MyCalendarService'
import { userService } from '@/components/api/user/UserService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { useCalendarStore } from '@/store/calendar'
import { useDepartmentStore } from '@/store/department'
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'
// import { saveAs } from 'file-saver'

const runtimeConfig = useRuntimeConfig()
const router = useRouter()
const departmentStore = useDepartmentStore()
const calendarStore = useCalendarStore()
const language = useI18n()
const userStore = useUserStore() as any
const { successAlert } = useAlert()
const { t } = useI18n()
const employeeUuid = router?.currentRoute?.value?.query?.employee_uuid
const breadcrumbLinks = [
    {
        name: 'events.calendar',
        translate: true,
        href: '/calendar',
    },
]

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
        isAddEventForMyselfOpen: false,
        isAddEventForCitizenOpen: false,
        isAddEventForEmployeeOpen: false,
        isDeleteScheduleOpen: false,
        isEditEventOpen: false,
        isGuidedTourCalendarOpen: false,
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
        unit_uuid: '',
        is_private: false,
        calendar_tags: [],
    },
    options: {
        citizens: [] as any,
        users: [] as any,
    }
})

onMounted(() => {
    fetchAllCitizens()
    fetchAllUsers()
    if (calendarStore.getCalendarView === 'default') {
        state.calendarView = 'default'
        const firstDayOfMonth = moment().startOf('month').format('Y-M-D')
        const lastDayOfMonth = moment().endOf('month').format('Y-M-D')
        state.selectedDate = {
            end_date: lastDayOfMonth,
            start_date: firstDayOfMonth,
        }
    } else if (calendarStore.getCalendarView === 'week') {
        state.calendarView = 'week'
        const firstDayOfWeek = moment().startOf('isoWeek').format('Y-M-D')
        const lastDayOfWeek = moment().endOf('isoWeek').format('Y-M-D')
        state.selectedDate = {
            end_date: lastDayOfWeek,
            start_date: firstDayOfWeek,
        }
    } else if (calendarStore.getCalendarView === 'month') {
        state.calendarView = 'month'
        const firstDayOfMonth = moment().startOf('month').format('Y-M-D')
        const lastDayOfMonth = moment().endOf('month').format('Y-M-D')
        state.selectedDate = {
            end_date: lastDayOfMonth,
            start_date: firstDayOfMonth,
        }
    }
    fetchMyCalendarEvents()
})

watch(() => language.locale.value, () => {
    fetchAllCitizens()
    fetchAllUsers()
})

watch(() => departmentStore.getSelectedDepartmentName, (newValue: any) => {
    if (newValue != null) {
        fetchMyCalendarEvents()
    }
})

function openGuidedTour() {
    state.modal.isGuidedTourCalendarOpen = true
}

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
        } else {
            params.date = {
                start_date: moment().format('Y-M-D'),
                end_date: moment().format('Y-M-D'),
            }
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
        calendarStore.setCalendarView(viewStyle)
        state.selectedDate = {
            end_date: moment().endOf('month').format('Y-M-D'),
            start_date: moment().startOf('month').format('Y-M-D'),
        }
        state.selectedYear = ''
        state.selectedMonth = ''
        if (viewStyle === 'week') {
            const firstDayOfWeek = moment().startOf('isoWeek').format('Y-M-D')
            const lastDayOfWeek = moment().endOf('isoWeek').format('Y-M-D')
            state.selectedDate = {
                end_date: lastDayOfWeek,
                start_date: firstDayOfWeek,
            }
        } else if (viewStyle === 'month') {
            const firstDayOfMonth = moment().startOf('month').format('Y-M-D')
            const lastDayOfMonth = moment().endOf('month').format('Y-M-D')
            state.selectedDate = {
                end_date: lastDayOfMonth,
                start_date: firstDayOfMonth,
            }
        }
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
    state.selectedSchedule.unit_uuid = selectedCalendarEvent.unit?.uuid ?? ''
    state.selectedSchedule.is_private = selectedCalendarEvent.is_private ? true : false
    state.selectedSchedule.calendar_tags = selectedCalendarEvent.calendar_tags ?? []
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
            // saveAs(file, 'my-schedule.ics')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>