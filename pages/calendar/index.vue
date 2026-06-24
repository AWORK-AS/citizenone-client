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
                <Tooltip :text="$t('guidedTour')" position="left" @click="openGuidedTour()">
                    <Icon name="ph:question" class="size-6 cursor-pointer text-gray-700" aria-hidden="true" />
                </Tooltip>
            </template>

            <ModulesUserCalendarTabs v-if="userStore.getUser?.has_booking_app_access" />

            <div :class="[
                userStore.getUser?.has_booking_app_access && 'mt-8',
                'flex justify-end items-center mb-5 gap-x-2'
            ]">
                <FormButton buttonStyle="action" @click="state.modal.isCompletionStatisticsOpen = true">
                    <Icon name="ph:chart-bar" class="h-4 w-4" aria-hidden="true" />
                    {{ $t('events.completionStatistics.title') }}
                </FormButton>
                <Menu as="div" class="relative inline-block text-left z-20">
                    <div>
                        <MenuButton>
                            <FormButton buttonStyle="action">
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
                <FormButton buttonStyle="action" @click="subscribe">
                    <Icon name="ph:bell-ringing" class="h-4 w-4" aria-hidden="true" />
                    {{ $t('events.subscribe.label') }}
                </FormButton>
            </div>

            <div class="grid lg:grid-cols-6 gap-3">
                <div class="flex items-center gap-x-4 lg:col-span-3">
                    <button class="flex items-center gap-x-1 text-sm text-primary group"
                        @click="state.modal.isFilterCalendarOpen = true">
                        <Icon name="ic:outline-filter-list" class="text-primary w-6 h-6 group-hover:text-primary-700" />
                        <span class="group-hover:text-primary-700">
                            {{ $t('filter') }}
                        </span>
                    </button>
                    <div class="flex items-center gap-x-2">
                        <FormSwitch :value="state.showShifts"
                            @toggleSwitch="state.showShifts = !state.showShifts" />
                        <span class="inline-flex items-center gap-x-1 text-sm text-gray-700">
                            <Icon name="ph:briefcase" class="h-4 w-4 text-indigo-600" aria-hidden="true" />
                            {{ $t('events.showShifts') }}
                        </span>
                    </div>
                </div>
                <div class="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 items-center gap-x-3">
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
                    <div>
                        <FormLabel for="employee_group_uuid" :label="$t('calendar.employeeGroups')" />:
                        <FormSelectMultiple id="employee_group_uuid" name="employee_group_uuid"
                            :options="state.options.employeeGroups" v-model="state.formCalendar.employee_group_uuid"
                            @change="changeEmployeeGroupUuid" />
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
                        @deleteMyCalendarEvent="deleteMyCalendarEvent"
                        @markEventAsStatus="handleMarkEventAsStatus"
                        @createJournalFromEvent="handleCreateJournalFromEvent"
                        @createEventForDate="openCreateEventChooser"
                        v-if="state.calendarView === 'default'" />
                    <ModulesUserMyCalendarWeekView :myCalendarEvents="state.myCalendarEvents"
                        @changeDatePerWeek="changeDatePerWeek" @editMyCalendarEvent="editMyCalendarEvent"
                        @markEventAsStatus="handleMarkEventAsStatus"
                        @createJournalFromEvent="handleCreateJournalFromEvent"
                        v-if="state.calendarView === 'week'" />
                    <ModulesUserMyCalendarMonthView :myCalendarEvents="state.myCalendarEvents"
                        @changeMonthYear="changeMonthYear" @editMyCalendarEvent="editMyCalendarEvent"
                        @markEventAsStatus="handleMarkEventAsStatus"
                        @createJournalFromEvent="handleCreateJournalFromEvent"
                        v-if="state.calendarView === 'month'" />
                </LoadingSpinner>
            </div>

            <ModulesUserCitizenCalendarModalFilter :isModalOpen="state.modal.isFilterCalendarOpen"
                @close="state.modal.isFilterCalendarOpen = false" @setFilter="setFilter" />
            <ModulesUserMyCalendarMyselfModalNew :isModalOpen="state.modal.isAddEventForMyselfOpen"
                :selectedDate="state.selectedEventDate"
                @close="state.modal.isAddEventForMyselfOpen = false" @refreshSchedules="fetchMyCalendarEvents" />
            <ModulesUserMyCalendarCitizenModalNew :isModalOpen="state.modal.isAddEventForCitizenOpen"
                :selectedDate="state.selectedEventDate"
                @close="state.modal.isAddEventForCitizenOpen = false" @refreshSchedules="fetchMyCalendarEvents" />
            <ModulesUserMyCalendarEmployeeModalNew :isModalOpen="state.modal.isAddEventForEmployeeOpen"
                :selectedDate="state.selectedEventDate"
                @close="state.modal.isAddEventForEmployeeOpen = false" @refreshSchedules="fetchMyCalendarEvents" />

            <Modal size="xs" :title="$t('events.newEvent')" :show="state.modal.isCreateEventChooserOpen"
                @close="state.modal.isCreateEventChooserOpen = false">
                <template #modal-body>
                    <p class="text-sm text-slate-600">{{ $t('events.chooseEventType') }}</p>
                    <div class="mt-3 space-y-2">
                        <button type="button" @click="openCreateModal('myself')"
                            class="flex w-full items-center gap-x-2 rounded-md border border-gray-200 px-3 py-2.5 text-sm hover:bg-gray-50">
                            <Icon name="ph:user" class="h-5 w-5 text-primary" />
                            {{ $t('events.myself') }}
                        </button>
                        <button type="button" @click="openCreateModal('employee')"
                            class="flex w-full items-center gap-x-2 rounded-md border border-gray-200 px-3 py-2.5 text-sm hover:bg-gray-50">
                            <Icon name="ph:users-three" class="h-5 w-5 text-primary" />
                            {{ $t('events.employees') }}
                        </button>
                        <button type="button" @click="openCreateModal('citizen')"
                            class="flex w-full items-center gap-x-2 rounded-md border border-gray-200 px-3 py-2.5 text-sm hover:bg-gray-50">
                            <Icon name="heroicons:user-group" class="h-5 w-5 text-primary" />
                            {{ $t('events.citizens') }}
                        </button>
                    </div>
                </template>
            </Modal>
            <ModulesUserMyCalendarModalEdit :isModalOpen="state.modal.isEditEventOpen"
                :selectedSchedule="state.selectedSchedule" @close="state.modal.isEditEventOpen = false"
                @deleteMyCalendarEvent="deleteMyCalendarEvent" @refreshSchedules="fetchMyCalendarEvents" />

            <ModulesUserGuidedTourModalCalendar v-if="state.modal.isGuidedTourCalendarOpen"
                :isModalOpen="state.modal.isGuidedTourCalendarOpen" :isGuidedTour="false"
                @close="state.modal.isGuidedTourCalendarOpen = false" />

            <ModulesUserMyCalendarModalSubscribe :isModalOpen="state.modal.isSubscribeOpen"
                @close="state.modal.isSubscribeOpen = false" />

            <ModulesUserMyCalendarModalEventJournalPrompt :isModalOpen="state.modal.isEventJournalPromptOpen"
                @close="state.modal.isEventJournalPromptOpen = false"
                @yes="handleJournalPromptYes"
                @no="state.modal.isEventJournalPromptOpen = false" />

            <ModulesUserMyCalendarModalCreateJournal :isModalOpen="state.modal.isCreateEventJournalOpen"
                :selectedEvent="state.selectedSchedule"
                @close="state.modal.isCreateEventJournalOpen = false"
                @journalCreated="fetchMyCalendarEvents" />

            <ModulesUserMyCalendarModalCompletionStatistics :isModalOpen="state.modal.isCompletionStatisticsOpen"
                @close="state.modal.isCompletionStatisticsOpen = false" />
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
import { employeeGroupService } from '~/components/api/user/EmployeeGroupService'
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
    error: {} as Error,
    filter: {
        tags_uuid: [] as any,
    },
    formCalendar: {
        citizens_uuid: [],
        users_uuid: employeeUuid ? [employeeUuid] : [],
        employee_group_uuid: [] as any,
    },
    isPageLoading: false,
    showShifts: false,
    modal: {
        isAddEventForMyselfOpen: false,
        isAddEventForCitizenOpen: false,
        isAddEventForEmployeeOpen: false,
        isDeleteScheduleOpen: false,
        isEditEventOpen: false,
        isGuidedTourCalendarOpen: false,
        isFilterCalendarOpen: false,
        isSubscribeOpen: false,
        isEventJournalPromptOpen: false,
        isCreateEventJournalOpen: false,
        isCompletionStatisticsOpen: false,
        isCreateEventChooserOpen: false,
    },
    selectedEventDate: '',
    pendingEventStatus: '' as 'completed' | 'not_completed' | '',
    myCalendarEvents: [] as any,
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
        is_recurring: false,
        recurring_until: '',
        recurring_rules: {} as any,
        recurring: {
            is_recurring: false,
            recurring: '',
            recurring_until: '',
            frequency: '',
            every: '',
            weekly_on: [] as any[],
            monthly_on_the_enabled: false,
            monthly_each: [] as any[],
            monthly_on_the_sequence: '',
            monthly_on_the_day: '',
            yearly_in_months: [] as any[],
            yearly_on_the_enabled: false,
            yearly_on_the_sequence: '',
            yearly_on_the_day: '',
            is_apply_to_all: false,
        },
    },
    options: {
        citizens: [] as any,
        users: [] as any,
        employeeGroups: [] as any,
    }
})

onMounted(() => {
    fetchAllCitizens()
    fetchAllUsers()
    fetchAllEmployeeGroups()
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
    fetchAllEmployeeGroups()
})

watch(() => state.showShifts, () => {
    fetchMyCalendarEvents()
})

watch(() => departmentStore.getSelectedDepartmentName, (newValue: any) => {
    if (newValue != null) {
        fetchAllCitizens()
        fetchAllUsers()
        fetchAllEmployeeGroups()
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
        const params = {
            department: departmentStore.getSelectedDepartmentName
        }
        const response = await citizenService.getAllCitizens(params)
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (citizen: any) => options.push({
                    value: citizen?.uuid,
                    label: citizen?.firstname + " " + (citizen?.lastname ?? ''),
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
        const params = {
            department: departmentStore.getSelectedDepartmentName
        }
        const response = await userService.getAllUsers(params)
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (user: any) => options.push({
                    value: user?.uuid,
                    label: user?.firstname + " " + (user?.lastname ?? ''),
                })
            )
            state.options.users = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchAllEmployeeGroups() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            department: departmentStore.getSelectedDepartmentName
        }
        const response = await employeeGroupService.getEmployeeGroups(params)
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (employeeGroup: any) => options.push({
                    value: employeeGroup?.uuid,
                    label: employeeGroup?.name,
                })
            )
            state.options.employeeGroups = options
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

function changeEmployeeGroupUuid(employeeGroupUuid: any) {
    if (employeeGroupUuid) {
        state.formCalendar.employee_group_uuid = [...employeeGroupUuid]
    } else {
        state.formCalendar.employee_group_uuid = []
    }
    fetchMyCalendarEvents()
}

async function fetchMyCalendarEvents() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {} as any
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
        if (state.formCalendar.employee_group_uuid) {
            params.employee_group_uuid = Array(state.formCalendar.employee_group_uuid)
        }

        if (state.filter.tags_uuid) {
            params.tags_uuid = JSON.stringify(state.filter.tags_uuid)
        }

        const response = await myCalendarService.getSchedules(params)
        if (response.data) {
            state.myCalendarEvents = response
        }

        if (state.showShifts) {
            const shiftsResponse = await myCalendarService.getCalendarShifts(params)
            if (shiftsResponse?.data?.length && state.myCalendarEvents?.data) {
                const shifts = shiftsResponse.data.map((shift: any) => ({
                    ...shift,
                    is_shift: true,
                }))
                state.myCalendarEvents = {
                    ...state.myCalendarEvents,
                    data: [...state.myCalendarEvents.data, ...shifts],
                }
            }
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
    state.selectedSchedule = selectedCalendarEvent
    state.modal.isEditEventOpen = true
}

async function deleteMyCalendarEvent(selectedCalendarEvent: any, isDeleteFuture: boolean) {
    state.error = {}
    state.isPageLoading = true
    state.modal.isEditEventOpen = false
    try {
        const scheduleUuid = selectedCalendarEvent?.uuid
        const response = await myCalendarService.deleteSchedule(scheduleUuid, { is_delete_future: isDeleteFuture })
        if (response) {
            fetchMyCalendarEvents()
            successAlert(`${t('alert.success')}!`, `${t('events.alert.successfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function subscribe() {
    state.modal.isSubscribeOpen = true
}

async function handleMarkEventAsStatus(selectedCalendarEvent: any, status: 'completed' | 'not_completed') {
    state.error = {}
    state.isPageLoading = true
    state.selectedSchedule = selectedCalendarEvent
    try {
        const response = await myCalendarService.updateEventStatus(selectedCalendarEvent?.uuid, { status })
        if (response?.data) {
            fetchMyCalendarEvents()
            successAlert(`${t('alert.success')}!`, `${t('events.alert.statusSuccessfullyUpdated')}.`)
            if (selectedCalendarEvent?.type === 'citizens') {
                state.modal.isEventJournalPromptOpen = true
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function handleCreateJournalFromEvent(selectedCalendarEvent: any) {
    state.selectedSchedule = selectedCalendarEvent
    state.modal.isCreateEventJournalOpen = true
}

function handleJournalPromptYes() {
    state.modal.isCreateEventJournalOpen = true
}

function setFilter(filter: any) {
    setCalendarView(filter.selectedView.title)
    state.filter.tags_uuid = filter.tags
    fetchMyCalendarEvents()
}

function openCreateEventChooser(date: string) {
    state.selectedEventDate = date
    state.modal.isCreateEventChooserOpen = true
}

function openCreateModal(type: 'myself' | 'employee' | 'citizen') {
    state.modal.isCreateEventChooserOpen = false
    if (type === 'myself') {
        state.modal.isAddEventForMyselfOpen = true
    } else if (type === 'employee') {
        state.modal.isAddEventForEmployeeOpen = true
    } else {
        state.modal.isAddEventForCitizenOpen = true
    }
}
</script>