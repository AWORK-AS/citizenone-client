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
                <Tooltip :text="$t('calendar.shortcuts.newEvent')" position="top">
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
                                <MenuItem v-slot="{ active }" @click="state.newEventPresetDate = ''; state.modal.isAddEventForMyselfOpen = true">
                                <button :class="[
                                    active && 'bg-gray-100',
                                    'group flex w-full items-center rounded-md px-2 py-2.5 text-sm',
                                ]">
                                    <Icon name="ph:user" class="mr-2 h-5 w-5" aria-hidden="true" />
                                    {{ $t('events.myself') }}
                                </button>
                                </MenuItem>
                                <MenuItem v-slot="{ active }" @click="state.newEventPresetDate = ''; state.modal.isAddEventForEmployeeOpen = true">
                                <button :class="[
                                    active && 'bg-gray-100',
                                    'group flex w-full items-center rounded-md px-2 py-2.5 text-sm',
                                ]">
                                    <Icon name="ph:users-three" class="mr-2 h-5 w-5" aria-hidden="true" />
                                    {{ $t('events.employees') }}
                                </button>
                                </MenuItem>
                                <MenuItem v-slot="{ active }" @click="state.newEventPresetDate = ''; state.modal.isAddEventForCitizenOpen = true">
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
                </Tooltip>
                <FormButton buttonStyle="action" @click="subscribe">
                    <Icon name="ph:bell-ringing" class="h-4 w-4" aria-hidden="true" />
                    {{ $t('events.subscribe.label') }}
                </FormButton>
            </div>

            <div class="grid lg:grid-cols-6 gap-3">
                <div class="flex items-center gap-x-4 lg:col-span-3">
                    <div class="inline-flex items-center gap-x-0.5 rounded-lg bg-gray-100 p-0.5">
                        <Tooltip v-for="opt in viewOptions" :key="opt.value" position="bottom"
                            :text="$t('calendar.shortcuts.view', { view: $t(opt.label), key: opt.key })">
                            <button type="button"
                                @click="selectView(opt.value)" :class="[
                                    state.calendarView === opt.value
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-800',
                                    'rounded-md px-4 py-1.5 text-xs font-semibold transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50'
                                ]">
                                {{ $t(opt.label) }}
                            </button>
                        </Tooltip>
                    </div>
                    <button v-if="state.options.calendarTags.length" class="flex items-center gap-x-1 text-sm text-primary group"
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
                <div class="lg:col-span-3 flex justify-start lg:justify-end">
                    <Menu as="div" class="relative inline-block text-left">
                        <MenuButton
                            class="inline-flex items-center gap-x-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                            <Icon name="ph:funnel" class="h-4 w-4 text-gray-500" aria-hidden="true" />
                            {{ $t('calendar.participants') }}
                            <span v-if="activeParticipantFilterCount > 0"
                                class="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-white">
                                {{ activeParticipantFilterCount }}
                            </span>
                        </MenuButton>
                        <transition enter-active-class="transition duration-100 ease-out"
                            enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
                            leave-active-class="transition duration-75 ease-in"
                            leave-from-class="transform scale-100 opacity-100"
                            leave-to-class="transform scale-95 opacity-0">
                            <MenuItems
                                class="absolute right-0 z-20 mt-2 w-80 origin-top-right space-y-3 rounded-lg bg-white p-4 shadow-lg ring-1 ring-black/5 focus:outline-none">
                                <div @click.stop>
                                    <FormLabel for="citizens_uuid" :label="$t('calendar.citizens')" />
                                    <FormSelectMultiple id="citizens_uuid" name="citizens_uuid"
                                        :options="state.options.citizens" v-model="state.formCalendar.citizens_uuid"
                                        @change="changeCitizensUuid" />
                                </div>
                                <div @click.stop>
                                    <FormLabel for="users_uuid" :label="$t('calendar.employees')" />
                                    <FormSelectMultiple id="users_uuid" name="users_uuid" :options="state.options.users"
                                        v-model="state.formCalendar.users_uuid" @change="changeUsersUuid" />
                                </div>
                                <div @click.stop>
                                    <FormLabel for="employee_group_uuid" :label="$t('calendar.employeeGroups')" />
                                    <FormSelectMultiple id="employee_group_uuid" name="employee_group_uuid"
                                        :options="state.options.employeeGroups"
                                        v-model="state.formCalendar.employee_group_uuid"
                                        @change="changeEmployeeGroupUuid" />
                                </div>
                            </MenuItems>
                        </transition>
                    </Menu>
                </div>
                <!-- What is narrowing the calendar right now, removable one by one:
                     a filter left on (a tag after a department switch hides the
                     filter button) used to make the calendar look half empty. -->
                <div v-if="activeFilterChips.length" class="lg:col-span-6 flex flex-wrap items-center gap-2"
                    :aria-label="$t('calendar.filters.active')">
                    <span v-for="chip in activeFilterChips" :key="`${chip.kind}-${chip.uuid}`"
                        class="inline-flex items-center gap-x-1 rounded-full bg-primary/10 py-0.5 pl-2.5 pr-1 text-xs font-medium text-primary">
                        <Icon :name="chip.icon" class="h-3.5 w-3.5" aria-hidden="true" />
                        {{ chip.label }}
                        <Tooltip :text="$t('calendar.filters.remove', { label: chip.label })" position="top">
                            <button type="button" :aria-label="$t('calendar.filters.remove', { label: chip.label })"
                                class="flex h-4 w-4 items-center justify-center rounded-full hover:bg-primary/20"
                                @click="removeFilterChip(chip)">
                                <Icon name="ph:x" class="h-3 w-3" aria-hidden="true" />
                            </button>
                        </Tooltip>
                    </span>
                    <Tooltip :text="$t('calendar.filters.clearHelp')" position="top">
                        <button type="button" class="text-xs font-medium text-gray-500 underline-offset-2 hover:text-gray-800 hover:underline"
                            @click="clearAllFilters">
                            {{ $t('calendar.filters.clear') }}
                        </button>
                    </Tooltip>
                </div>
            </div>

            <div class="mt-5 space-y-5">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <!-- A failed load says so, in place of the grid: an empty
                     calendar with no explanation reads as "everything is gone". -->
                <div v-if="state.eventsLoadFailed && !state.isEventsLoading" role="alert"
                    class="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-12 text-center">
                    <Icon name="ph:calendar-x" class="mb-4 h-12 w-12 text-gray-400" aria-hidden="true" />
                    <p class="text-base font-semibold text-gray-900">{{ $t('events.loadFailed.title') }}</p>
                    <p class="mt-1 max-w-md text-sm text-gray-500">{{ $t('events.loadFailed.message') }}</p>
                    <Tooltip :text="$t('events.loadFailed.retryHelp')" position="bottom" class="mt-6">
                        <FormButton buttonStyle="action" @click="fetchMyCalendarEvents">
                            <Icon name="ph:arrow-clockwise" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('events.loadFailed.retry') }}
                        </FormButton>
                    </Tooltip>
                </div>
                <LoadingSpinner v-else :isActive="state.isEventsLoading || state.isPageLoading">
                    <ModulesUserMyCalendarDefaultView :myCalendarEvents="state.myCalendarEvents"
                        @changeMonthYear="changeMonthYear" @editMyCalendarEvent="editMyCalendarEvent"
                        @openEventDeletionModal="state.modal.isDeleteScheduleOpen = true"
                        @deleteMyCalendarEvent="deleteMyCalendarEvent"
                        @markEventAsStatus="handleMarkEventAsStatus"
                        @createJournalFromEvent="handleCreateJournalFromEvent"
                        @createEventForDate="openCreateEventModal"
                        v-if="state.calendarView === 'default'" />
                    <ModulesUserMyCalendarWeekView :myCalendarEvents="state.myCalendarEvents"
                        @changeDatePerWeek="changeDatePerWeek" @editMyCalendarEvent="editMyCalendarEvent"
                        @deleteMyCalendarEvent="deleteMyCalendarEvent"
                        @markEventAsStatus="handleMarkEventAsStatus"
                        @createJournalFromEvent="handleCreateJournalFromEvent"
                        @createEvent="openCreateEventModal"
                        v-if="state.calendarView === 'week'" />
                    <ModulesUserMyCalendarMonthView :myCalendarEvents="state.myCalendarEvents"
                        @changeMonthYear="changeMonthYear" @editMyCalendarEvent="editMyCalendarEvent"
                        @deleteMyCalendarEvent="deleteMyCalendarEvent"
                        @markEventAsStatus="handleMarkEventAsStatus"
                        @createJournalFromEvent="handleCreateJournalFromEvent"
                        @createEvent="openCreateEventModal"
                        v-if="state.calendarView === 'month'" />
                </LoadingSpinner>
            </div>

            <ModulesUserCitizenCalendarModalFilter :isModalOpen="state.modal.isFilterCalendarOpen"
                @close="state.modal.isFilterCalendarOpen = false" @setFilter="setFilter" />
            <ModulesUserMyCalendarMyselfModalNew :isModalOpen="state.modal.isAddEventForMyselfOpen"
                :selectedDate="state.newEventPresetDate"
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
import { calendarTagService } from '@/components/api/user/CalendarTagService'
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
    // The events have their own flag: the citizen, employee and group lists
    // load beside them and used to clear the shared one first, so the grid
    // showed empty with no spinner while the events were still on their way.
    isEventsLoading: false,
    eventsLoadFailed: false,
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
    },
    pendingEventStatus: '' as 'completed' | 'not_completed' | '',
    newEventPresetDate: '',
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
        calendarTags: [] as any,
    }
})

const activeParticipantFilterCount = computed(() => {
    return [
        state.formCalendar.citizens_uuid,
        state.formCalendar.users_uuid,
        state.formCalendar.employee_group_uuid,
    ].filter((selection: any) => Array.isArray(selection) && selection.length > 0).length
})

type FilterChip = { kind: 'citizen' | 'employee' | 'group' | 'tag', uuid: string, label: string, icon: string }

const activeFilterChips = computed<FilterChip[]>(() => {
    const labelOf = (options: any[], uuid: string) => options.find((o: any) => o.value === uuid)?.label ?? ''
    const chips: FilterChip[] = []
    for (const uuid of state.formCalendar.citizens_uuid as string[]) {
        chips.push({ kind: 'citizen', uuid, label: labelOf(state.options.citizens, uuid), icon: 'heroicons:user-group' })
    }
    for (const uuid of state.formCalendar.users_uuid as string[]) {
        chips.push({ kind: 'employee', uuid, label: labelOf(state.options.users, uuid), icon: 'ph:user' })
    }
    for (const uuid of state.formCalendar.employee_group_uuid as string[]) {
        chips.push({ kind: 'group', uuid, label: labelOf(state.options.employeeGroups, uuid), icon: 'ph:users-three' })
    }
    for (const uuid of (state.filter.tags_uuid ?? []) as string[]) {
        const tag = state.options.calendarTags.find((t: any) => t.uuid === uuid)
        chips.push({ kind: 'tag', uuid, label: tag?.tag ?? '', icon: 'ph:tag' })
    }
    // A selection whose option isn't loaded (yet) still narrows the calendar,
    // so it gets a chip too, under a placeholder rather than a blank.
    return chips.map(chip => ({ ...chip, label: chip.label || '…' }))
})

function removeFilterChip(chip: FilterChip) {
    const without = (list: any) => (list ?? []).filter((uuid: string) => uuid !== chip.uuid)
    if (chip.kind === 'citizen') state.formCalendar.citizens_uuid = without(state.formCalendar.citizens_uuid)
    if (chip.kind === 'employee') state.formCalendar.users_uuid = without(state.formCalendar.users_uuid)
    if (chip.kind === 'group') state.formCalendar.employee_group_uuid = without(state.formCalendar.employee_group_uuid)
    if (chip.kind === 'tag') state.filter.tags_uuid = without(state.filter.tags_uuid)
    fetchMyCalendarEvents()
}

function clearAllFilters() {
    state.formCalendar.citizens_uuid = []
    state.formCalendar.users_uuid = []
    state.formCalendar.employee_group_uuid = []
    state.filter.tags_uuid = []
    fetchMyCalendarEvents()
}

onMounted(() => {
    fetchAllCitizens()
    fetchAllUsers()
    fetchAllEmployeeGroups()
    fetchCalendarTags()
    if (calendarStore.getCalendarView === 'default') {
        state.calendarView = 'default'
        state.selectedDate = monthGridRange(moment())
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
        state.selectedDate = monthGridRange(moment())
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
}

async function fetchAllUsers() {
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
}

async function fetchAllEmployeeGroups() {
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
}

async function fetchCalendarTags() {
    try {
        const response = await calendarTagService.getAllCalendarTags({
            department: departmentStore.getSelectedDepartmentName,
        })
        state.options.calendarTags = response?.data ?? []
    } catch (error) {
        state.options.calendarTags = []
    }
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

// Only the newest request may write: paging quickly through months, or
// changing a filter mid-load, let an older answer land last and show the
// wrong period (and merge one request's shifts into another's events).
let eventsRequestId = 0

async function fetchMyCalendarEvents() {
    const requestId = ++eventsRequestId
    state.isEventsLoading = true
    try {
        const params = {} as any
        params.department = departmentStore.getSelectedDepartmentName
        if (state.selectedDate.start_date && state.selectedDate.end_date) {
            params.date = JSON.stringify(state.selectedDate)
        } else {
            params.date = JSON.stringify({
                start_date: moment().format('Y-M-D'),
                end_date: moment().format('Y-M-D'),
            })
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

        const [response, shiftsResponse] = await Promise.all([
            myCalendarService.getSchedules(params),
            state.showShifts ? myCalendarService.getCalendarShifts(params) : Promise.resolve(null),
        ])
        if (requestId !== eventsRequestId) return

        const shifts = (shiftsResponse?.data ?? []).map((shift: any) => ({ ...shift, is_shift: true }))
        state.myCalendarEvents = {
            ...response,
            data: [...(response?.data ?? []), ...shifts],
        }
        state.eventsLoadFailed = false
    } catch (error: any) {
        if (requestId !== eventsRequestId) return
        // Not the previous period's events with a banner over them: say the
        // load failed and offer to retry.
        state.myCalendarEvents = { data: [], holidays: [] }
        state.eventsLoadFailed = true
    } finally {
        if (requestId === eventsRequestId) {
            state.isEventsLoading = false
        }
    }
}

const viewOptions = [
    { value: 'default', label: 'calendar.view.day', key: 'D' },
    { value: 'week', label: 'calendar.view.week', key: 'W' },
    { value: 'month', label: 'calendar.view.month', key: 'M' },
]

function selectView(viewStyle: any) {
    if (state.calendarView === viewStyle) return
    setCalendarView(viewStyle)
    fetchMyCalendarEvents()
}

function onViewKey(e: KeyboardEvent) {
    if (e.metaKey || e.ctrlKey || e.altKey) return
    const t = e.target as HTMLElement
    if (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable)) return
    if (e.key === 'd' || e.key === 'D') selectView('default')
    else if (e.key === 'u' || e.key === 'U' || e.key === 'w' || e.key === 'W') selectView('week')
    else if (e.key === 'm' || e.key === 'M') selectView('month')
    else if ((e.key === 'n' || e.key === 'N') && !anyModalOpen()) {
        e.preventDefault()
        state.newEventPresetDate = ''
        state.modal.isAddEventForMyselfOpen = true
    }
}

function anyModalOpen() {
    return Object.values(state.modal).some(Boolean)
}
onMounted(() => window.addEventListener('keydown', onViewKey))
onUnmounted(() => window.removeEventListener('keydown', onViewKey))

function setCalendarView(viewStyle: any) {
    if (state.calendarView !== viewStyle) {
        state.calendarView = viewStyle
        calendarStore.setCalendarView(viewStyle)
        state.selectedDate = monthGridRange(moment())
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
            state.selectedDate = monthGridRange(moment())
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

// Day and month views both page by month. Ask for the whole grid they draw,
// Monday before the 1st to Sunday after the last, as a date range: the shifts
// overlay only reads the range (with month/year it fell back to today), and a
// range finds events that cross into the month from the one before.
function monthGridRange(day: moment.Moment) {
    return {
        start_date: day.clone().startOf('month').startOf('isoWeek').format('Y-M-D'),
        end_date: day.clone().endOf('month').endOf('isoWeek').format('Y-M-D'),
    }
}

function changeMonthYear(year: any, month: any) {
    const range = monthGridRange(moment([Number(year), Number(month)]))
    state.selectedYear = year
    state.selectedMonth = month
    // The day view reports its month on every day click; the range is the
    // same, so there is nothing new to fetch.
    if (range.start_date === state.selectedDate.start_date && range.end_date === state.selectedDate.end_date) return
    state.selectedDate = range
    fetchMyCalendarEvents()
}

function openCreateEventModal(date: string) {
    state.newEventPresetDate = date
    state.modal.isAddEventForMyselfOpen = true
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
            successAlert(`${t('alert.success')}!`, `${t('events.alert.successfullyDeleted')}.`)
            await fetchMyCalendarEvents()
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

// Contribute commands to the global palette (⌘K).
const { setPageCommands, clearPageCommands } = useCommandPalette()
watchEffect(() => {
    const A = t('commandPalette.actions')
    setPageCommands([
        { id: 'cal-new-self', group: A, icon: 'ph:user', label: `${t('events.newEvent')} – ${t('events.myself')}`, run: () => { state.modal.isAddEventForMyselfOpen = true } },
        { id: 'cal-new-citizen', group: A, icon: 'ph:user-circle', label: `${t('events.newEvent')} – ${t('events.citizens')}`, run: () => { state.modal.isAddEventForCitizenOpen = true } },
        { id: 'cal-filter', group: A, icon: 'ic:outline-filter-list', label: t('filter'), run: () => { state.modal.isFilterCalendarOpen = true } },
    ])
})
onUnmounted(() => clearPageCommands())
</script>