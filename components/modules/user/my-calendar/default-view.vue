<template>
    <div class="motion-safe:animate-fade-in">
        <div class="lg:grid lg:grid-cols-12 lg:gap-x-12">
            <!-- Mini month picker -->
            <div class="py-4 lg:col-start-9 lg:col-end-13 lg:row-start-1">
                <div class="rounded-2xl bg-white p-4 ring-1 ring-gray-200 shadow-sm">
                    <div class="flex items-center justify-between">
                        <h3 class="text-sm font-semibold text-gray-900">
                            <span v-if="month === 'January'">{{ $t('calendar.month.January') }}</span>
                            <span v-if="month === 'February'">{{ $t('calendar.month.February') }}</span>
                            <span v-if="month === 'March'">{{ $t('calendar.month.March') }}</span>
                            <span v-if="month === 'April'">{{ $t('calendar.month.April') }}</span>
                            <span v-if="month === 'May'">{{ $t('calendar.month.May') }}</span>
                            <span v-if="month === 'June'">{{ $t('calendar.month.June') }}</span>
                            <span v-if="month === 'July'">{{ $t('calendar.month.July') }}</span>
                            <span v-if="month === 'August'">{{ $t('calendar.month.August') }}</span>
                            <span v-if="month === 'September'">{{ $t('calendar.month.September') }}</span>
                            <span v-if="month === 'October'">{{ $t('calendar.month.October') }}</span>
                            <span v-if="month === 'November'">{{ $t('calendar.month.November') }}</span>
                            <span v-if="month === 'December'">{{ $t('calendar.month.December') }}</span>
                            {{ year }}
                        </h3>
                        <div class="inline-flex items-center rounded-full border border-gray-200 bg-white shadow-sm">
                            <button type="button" @click="previousMonth"
                                class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-l-full text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors">
                                <span class="sr-only">Previous month</span>
                                <Icon name="heroicons:chevron-left" class="h-4 w-4" aria-hidden="true" />
                            </button>
                            <span class="h-3.5 w-px bg-gray-200"></span>
                            <button type="button" @click="nextMonth"
                                class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-r-full text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors">
                                <span class="sr-only">Next month</span>
                                <Icon name="heroicons:chevron-right" class="h-4 w-4" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                    <div class="mt-4 grid grid-cols-7 text-[11px] font-semibold uppercase tracking-wide leading-6 text-gray-400">
                        <div class="text-center">{{ $t('calendar.week.oneLetter.Monday') }}</div>
                        <div class="text-center">{{ $t('calendar.week.oneLetter.Tuesday') }}</div>
                        <div class="text-center">{{ $t('calendar.week.oneLetter.Wednesday') }}</div>
                        <div class="text-center">{{ $t('calendar.week.oneLetter.Thursday') }}</div>
                        <div class="text-center">{{ $t('calendar.week.oneLetter.Friday') }}</div>
                        <div class="text-center">{{ $t('calendar.week.oneLetter.Saturday') }}</div>
                        <div class="text-center">{{ $t('calendar.week.oneLetter.Sunday') }}</div>
                    </div>
                    <div class="mt-1 grid grid-cols-7 text-sm">
                        <div v-for="(day, dayIdx) in days" :key="day.date" class="py-0.5" @click="selectDay(day)">
                            <button type="button" :class="[
                                day.isSelected && day.isToday && 'bg-tertiary text-white',
                                day.isSelected && !day.isToday && 'bg-primary text-white',
                                !day.isSelected && day.isToday && 'text-tertiary',
                                !day.isSelected && !day.isToday && day.isCurrentMonth && 'text-gray-900',
                                !day.isSelected && !day.isToday && !day.isCurrentMonth && 'text-gray-300',
                                !day.isSelected && 'hover:bg-gray-100',
                                (day.isSelected || day.isToday) && 'font-semibold',
                                'relative mx-auto flex h-8 w-8 items-center justify-center rounded-full transition-colors'
                            ]">
                                <time :datetime="day.date">{{ day.date.split('-').pop().replace(/^0/, '') }}</time>
                                <span class="absolute bottom-1 h-1 w-1 rounded-full"
                                    :class="day.isSelected ? 'bg-white' : 'bg-tertiary'"
                                    v-if="hasSchedule(day)" />
                            </button>
                        </div>
                    </div>
                </div>
                <div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 px-1 text-xs text-gray-500">
                    <div class="flex items-center gap-x-1.5">
                        <span class="h-2 w-2 rounded-full bg-primary"></span>
                        <span>{{ $t('events.myself') }}</span>
                    </div>
                    <div class="flex items-center gap-x-1.5">
                        <span class="h-2 w-2 rounded-full bg-green-600"></span>
                        <span>{{ $t('events.employees') }}</span>
                    </div>
                    <div class="flex items-center gap-x-1.5">
                        <span class="h-2 w-2 rounded-full bg-amber-500"></span>
                        <span>{{ $t('events.citizens') }}</span>
                    </div>
                    <div class="flex items-center gap-x-1.5">
                        <span class="h-2 w-2 rounded-full bg-secondary"></span>
                        <span>{{ $t('events.holidays') }}</span>
                    </div>
                </div>
            </div>

            <!-- Agenda for selected day -->
            <div class="lg:col-span-8 lg:col-start-1 lg:row-start-1">
                <div class="flex items-center justify-between border-b border-gray-100 pb-3 pt-4">
                    <div class="flex items-baseline gap-x-2">
                        <h3 class="text-lg font-semibold tracking-tight text-gray-900">
                            {{ formatDateToReadable(state.selectedDate) }}
                        </h3>
                        <span v-if="state.filteredCalendarEvents.length" class="text-sm text-gray-400">
                            {{ state.filteredCalendarEvents.length === 1 ? $t('calendar.view.oneEvent') : $t('calendar.view.eventsCount', { count: state.filteredCalendarEvents.length }) }}
                        </span>
                    </div>
                    <button type="button" @click="createEventForSelectedDate"
                        class="inline-flex items-center gap-x-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors">
                        <Icon name="ph:plus" class="h-4 w-4" />
                        {{ $t('events.newEvent') }}
                    </button>
                </div>

                <p v-if="state.filteredCalendarEvents?.length < 1 && state.filteredCalendarHolidays?.length < 1"
                    class="flex flex-col items-center gap-y-2 py-24 text-center text-sm text-gray-400">
                    <Icon name="ph:calendar-blank" class="h-8 w-8 text-gray-300" />
                    {{ $t('events.noEventFound') }}
                </p>

                <ol class="mt-2 divide-y divide-gray-100">
                    <li v-for="(holiday, index) in state.filteredCalendarHolidays" :key="'h' + index"
                        class="flex gap-x-3 py-3">
                        <div class="w-14 flex-none" />
                        <span class="w-1 flex-none self-stretch rounded-full bg-secondary"></span>
                        <div class="min-w-0 flex-1">
                            <h4 class="font-semibold text-gray-900">{{ holiday?.name }}</h4>
                            <p class="text-xs text-gray-400">{{ $t('events.holidays') }}</p>
                        </div>
                    </li>

                    <li v-for="(myCalendarEvent, index) in state.filteredCalendarEvents" :key="index"
                        class="group/event -mx-2 flex gap-x-3 rounded-lg px-2 py-3 transition-colors"
                        :class="isNow(myCalendarEvent) && 'bg-red-50/60'">
                        <!-- time column -->
                        <div class="w-14 flex-none pt-0.5 text-right">
                            <p class="text-[13px] font-semibold tabular-nums text-gray-900">
                                {{ moment(myCalendarEvent.date_time_start).format('HH:mm') }}
                            </p>
                            <p class="text-[11px] tabular-nums text-gray-400">
                                {{ moment(myCalendarEvent.date_time_end).format('HH:mm') }}
                            </p>
                        </div>
                        <!-- color rail -->
                        <span class="w-1 flex-none self-stretch rounded-full" :class="[
                            isNow(myCalendarEvent) ? 'bg-red-500' : [
                                myCalendarEvent?.is_shift && 'bg-indigo-500',
                                !myCalendarEvent?.is_shift && myCalendarEvent?.type === 'citizens' && 'bg-amber-500',
                                !myCalendarEvent?.is_shift && myCalendarEvent?.type === 'employees' && 'bg-green-600',
                                !myCalendarEvent?.is_shift && myCalendarEvent?.type === 'my_self' && 'bg-primary',
                            ],
                        ]"></span>
                        <!-- body -->
                        <div class="min-w-0 flex-1">
                            <div class="flex items-center gap-x-2">
                                <Icon v-if="myCalendarEvent?.is_shift" name="ph:briefcase"
                                    class="h-4 w-4 flex-none text-indigo-500" />
                                <h4 class="truncate font-semibold text-gray-900"
                                    :class="myCalendarEvent?.completion_status === 'completed' && 'text-gray-400 line-through'">
                                    {{ myCalendarEvent?.title }}
                                </h4>
                                <span v-if="isNow(myCalendarEvent)"
                                    class="inline-flex flex-none items-center gap-x-1 rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
                                    <span class="h-1.5 w-1.5 rounded-full bg-white motion-safe:animate-pulse"></span>{{ $t('calendar.view.now') }}
                                </span>
                                <span v-if="myCalendarEvent?.is_shift"
                                    class="inline-flex items-center gap-x-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-medium text-indigo-700">
                                    {{ $t('events.shiftLabel') }}
                                </span>
                                <span v-else-if="myCalendarEvent?.completion_status === 'completed'"
                                    class="inline-flex items-center gap-x-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-700">
                                    <Icon name="ph:check-circle" class="h-3.5 w-3.5" />
                                    {{ $t('events.status.completed') }}
                                </span>
                                <span v-else-if="isOverdue(myCalendarEvent)"
                                    class="inline-flex items-center gap-x-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                                    <Icon name="ph:warning-circle" class="h-3.5 w-3.5" />
                                    {{ $t('calendar.view.overdue') }}
                                </span>
                                <span v-else-if="myCalendarEvent?.completion_status === 'not_completed'"
                                    class="inline-flex items-center gap-x-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700">
                                    <Icon name="ph:x-circle" class="h-3.5 w-3.5" />
                                    {{ $t('events.status.notCompleted') }}
                                </span>
                            </div>

                            <p v-if="myCalendarEvent?.description" class="mt-0.5 truncate text-sm text-gray-600">
                                {{ myCalendarEvent?.description }}
                            </p>

                            <div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                                <span v-if="myCalendarEvent?.unit?.name" class="inline-flex items-center gap-x-1">
                                    <Icon name="ph:map-pin" class="h-3.5 w-3.5 text-gray-400" />
                                    {{ myCalendarEvent?.unit?.name }}
                                </span>
                                <span v-if="myCalendarEvent?.employee" class="inline-flex items-center gap-x-1">
                                    <Icon name="ph:user" class="h-3.5 w-3.5 text-gray-400" />
                                    {{ myCalendarEvent?.employee }}
                                </span>
                                <span v-if="myCalendarEvent?.calendar_owners?.length"
                                    class="inline-flex items-center gap-x-1">
                                    <Icon name="ph:user-circle" class="h-3.5 w-3.5 text-gray-400" />
                                    {{ myCalendarEvent.calendar_owners.map((o) => `${o?.owner?.firstname ?? ''} ${o?.owner?.lastname ?? ''}`.trim()).filter(Boolean).join(', ') }}
                                </span>
                                <span v-if="myCalendarEvent?.citizens?.length" class="inline-flex items-center gap-x-1">
                                    <Icon name="ph:users-three" class="h-3.5 w-3.5 text-gray-400" />
                                    {{ myCalendarEvent.citizens.map((c) => c.name).join(', ') }}
                                </span>
                            </div>

                            <div v-if="myCalendarEvent.calendar_users?.length > 0"
                                class="mt-1 flex items-center gap-x-1 text-xs text-gray-500">
                                <Icon name="ph:users" class="h-3.5 w-3.5 text-gray-400" />
                                <span class="truncate">
                                    {{ myCalendarEvent.calendar_users.slice(0, 3).map((i) => `${i?.user?.firstname ?? ''} ${i?.user?.lastname ?? ''}`.trim()).filter(Boolean).join(', ') }}
                                </span>
                                <button @click="showAllInvitees(myCalendarEvent)"
                                    class="text-primary hover:text-primary-700"
                                    v-if="myCalendarEvent.calendar_users?.length > 3">
                                    +{{ myCalendarEvent.calendar_users.length - 3 }}
                                </button>
                            </div>

                            <div v-if="myCalendarEvent.calendar_tags?.length > 0" class="mt-1.5 flex flex-wrap gap-1">
                                <span v-for="(calendarTag, ti) in myCalendarEvent.calendar_tags" :key="ti"
                                    class="rounded-md px-1.5 py-0.5 text-[10px] font-medium text-white"
                                    :style="{ backgroundColor: calendarTag?.color }">
                                    {{ calendarTag?.tag }}
                                </span>
                            </div>

                            <div class="mt-2 flex items-center gap-x-3">
                                <a v-if="myCalendarEvent?.meeting_url" :href="myCalendarEvent.meeting_url"
                                    target="_blank" rel="noopener"
                                    class="inline-flex items-center gap-x-1.5 rounded-full bg-tertiary px-3 py-1 text-xs font-medium text-white hover:bg-tertiary-800">
                                    <Icon name="ph:video-camera" class="h-4 w-4" />
                                    {{ $t('events.onlineMeeting.join') }}
                                </a>
                                <span v-if="myCalendarEvent?.journal_uuid"
                                    class="inline-flex items-center gap-x-1 text-xs text-primary">
                                    <Icon name="ph:notebook" class="h-3.5 w-3.5" />
                                    {{ $t('events.viewJournalNote') }}
                                </span>
                            </div>
                        </div>

                        <!-- actions -->
                        <Menu v-if="!myCalendarEvent?.is_shift" as="div" class="relative flex-none self-start">
                            <MenuButton
                                class="-m-1 flex items-center rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                                <span class="sr-only">Open options</span>
                                <Icon name="heroicons:ellipsis-horizontal" class="h-5 w-5" aria-hidden="true" />
                            </MenuButton>
                            <transition enter-active-class="transition ease-out duration-100"
                                enter-from-class="transform opacity-0 scale-95"
                                enter-to-class="transform opacity-100 scale-100"
                                leave-active-class="transition ease-in duration-75"
                                leave-from-class="transform opacity-100 scale-100"
                                leave-to-class="transform opacity-0 scale-95">
                                <MenuItems
                                    class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    <div class="py-1">
                                        <MenuItem v-slot="{ active }">
                                        <a href="#"
                                            :class="[active && 'bg-gray-100', 'text-gray-700', 'flex items-center gap-x-1.5 px-4 py-2 text-sm']"
                                            @click="editMyCalendarEvent(myCalendarEvent)">
                                            <Icon name="ph:pencil-simple" class="h-4 w-4" />
                                            {{ $t('calendar.edit') }}
                                        </a>
                                        </MenuItem>
                                        <MenuItem v-slot="{ active }">
                                        <a href="#"
                                            :class="[active && 'bg-gray-100', 'text-red-600', 'flex items-center gap-x-1.5 px-4 py-2 text-sm']"
                                            @click="deleteEventConfirmation(myCalendarEvent)">
                                            <Icon name="ph:trash" class="h-4 w-4" />
                                            {{ $t('calendar.delete') }}
                                        </a>
                                        </MenuItem>
                                        <template v-if="myCalendarEvent?.completion_status !== 'completed'">
                                            <MenuItem v-slot="{ active }">
                                            <a href="#"
                                                :class="[active && 'bg-gray-100', 'text-green-700', 'flex items-center gap-x-1.5 px-4 py-2 text-sm']"
                                                @click="markEventAsStatus(myCalendarEvent, 'completed')">
                                                <Icon name="ph:check-circle" class="h-4 w-4" />
                                                {{ $t('events.markAsCompleted') }}
                                            </a>
                                            </MenuItem>
                                        </template>
                                        <template v-if="myCalendarEvent?.completion_status !== 'not_completed'">
                                            <MenuItem v-slot="{ active }">
                                            <a href="#"
                                                :class="[active && 'bg-gray-100', 'text-red-700', 'flex items-center gap-x-1.5 px-4 py-2 text-sm']"
                                                @click="markEventAsStatus(myCalendarEvent, 'not_completed')">
                                                <Icon name="ph:x-circle" class="h-4 w-4" />
                                                {{ $t('events.markAsNotCompleted') }}
                                            </a>
                                            </MenuItem>
                                        </template>
                                        <template v-if="myCalendarEvent?.type === 'citizens'">
                                            <MenuItem v-slot="{ active }">
                                            <a href="#"
                                                :class="[active && 'bg-gray-100', 'text-gray-700', 'flex items-center gap-x-1.5 px-4 py-2 text-sm']"
                                                @click="openCreateJournal(myCalendarEvent)">
                                                <Icon name="ph:notebook" class="h-4 w-4" />
                                                {{ $t('events.createJournalNote') }}
                                            </a>
                                            </MenuItem>
                                        </template>
                                    </div>
                                </MenuItems>
                            </transition>
                        </Menu>
                    </li>
                </ol>
            </div>
        </div>
        <ModulesUserMyCalendarModalShowAllInvitees :isModalOpen="state.modal.isShowAllInviteesOpen"
            :invitees="state.selectedSchedule?.calendar_users" @close="state.modal.isShowAllInviteesOpen = false"
            v-if="state.modal.isShowAllInviteesOpen" />
        <DialogConfirmation :isModalOpen="state.modal.isDeleteScheduleOpen"
            :message="$t('events.confirmation.deleteConfirmation') + '?'"
            @close="state.modal.isDeleteScheduleOpen = false" @confirm="deleteMyCalendarEvent" />
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { useUserStore } from '@/store/user'

const { formatDateToReadable, formatDateTimeToReadable } = useDatetimeFormatter()
const props = defineProps({
    myCalendarEvents: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['changeMonthYear', 'editMyCalendarEvent', 'deleteMyCalendarEvent', 'markEventAsStatus', 'createJournalFromEvent', 'createEventForDate'])
const userStore = useUserStore() as any

const currentMonth = ref(moment().startOf('month'))
const month = ref(currentMonth.value.format('MMMM'))
const year = ref(currentMonth.value.format('YYYY'))
const days = ref(generateDays(currentMonth.value))

const state = reactive({
    filteredCalendarEvents: [] as any,
    filteredCalendarHolidays: [] as any,
    modal: {
        isDeleteScheduleOpen: false,
        isShowAllInviteesOpen: false,
    },
    selectedDate: moment().format('YYYY-MM-DD'),
    selectedSchedule: {} as any,
})

watch(() => props.myCalendarEvents, (myCalendarEvents: any) => {
    if (myCalendarEvents) {
        filterBasedOnSelectedDate()
    }
})

watch(() => state.selectedDate, (newSelectedDate: any) => {
    if (newSelectedDate) {
        const selectedDate = moment(newSelectedDate, 'YYYY-MM-DD')
        currentMonth.value = selectedDate.clone().startOf('month')
        month.value = currentMonth.value.format('MMMM')
        year.value = currentMonth.value.format('YYYY')
        emit('changeMonthYear', year.value, currentMonth.value.month())
    }
})

function generateDays(month: any) {
    const startOfMonth = month.clone().startOf('month').startOf('isoWeek')
    const endOfMonth = month.clone().endOf('month').endOf('isoWeek')
    const date = startOfMonth.clone().subtract(1, 'day')
    const days = []

    while (date.isBefore(endOfMonth, 'day')) {
        days.push({
            date: date.add(1, 'day').format('YYYY-MM-DD'),
            isCurrentMonth: date.isSame(month, 'month'),
            isToday: date.isSame(moment(), 'day'),
            isSelected: date.isSame(moment(), 'day'),
        })
    }

    return days
}

function previousMonth() {
    currentMonth.value = currentMonth.value.clone().subtract(1, 'month')
    month.value = currentMonth.value.format('MMMM')
    year.value = currentMonth.value.format('YYYY')
    days.value = generateDays(currentMonth.value)
    emit('changeMonthYear', year.value, currentMonth.value.month())
    state.selectedDate = moment(state.selectedDate).subtract(1, 'month').format('YYYY-MM-DD')
}

function setToday() {
    const today = moment()
    currentMonth.value = today.clone().startOf('month')
    month.value = currentMonth.value.format('MMMM')
    year.value = currentMonth.value.format('YYYY')
    days.value = generateDays(currentMonth.value)
    state.selectedDate = today.format('YYYY-MM-DD')
    emit('changeMonthYear', year.value, currentMonth.value.month())
}

function nextMonth() {
    currentMonth.value = currentMonth.value.clone().add(1, 'month')
    month.value = currentMonth.value.format('MMMM')
    year.value = currentMonth.value.format('YYYY')
    days.value = generateDays(currentMonth.value)
    emit('changeMonthYear', year.value, currentMonth.value.month())
    state.selectedDate = moment(state.selectedDate).add(1, 'month').format('YYYY-MM-DD')
}

function selectDay(selectedDay: any) {
    days.value = days.value.map(day => ({
        ...day,
        isSelected: day.date === selectedDay.date,
    }))
    state.selectedDate = selectedDay.date
    filterBasedOnSelectedDate()
}

function createEventForSelectedDate() {
    emit('createEventForDate', state.selectedDate)
}

function isNow(event: any) {
    if (!event?.date_time_start || !event?.date_time_end) return false
    return moment().isBetween(moment(event.date_time_start), moment(event.date_time_end), null, '[)')
}

function isOverdue(event: any) {
    if (!event || event.completion_status === 'completed' || event.is_shift) return false
    return !isNow(event) && moment(event.date_time_end).isBefore(moment())
}

function hasSchedule(day: any) {
    if (props.myCalendarEvents?.data) {
        const targetDate = moment(day?.date)
        const hasSchedule = props.myCalendarEvents?.data?.some((event: any) => {
            const start = moment(event.date_time_start)
            const end = moment(event.date_time_end)
            return targetDate.isBetween(start, end, null, '[]')  // '[]' includes the boundaries
        })
        return hasSchedule
    }
    return false
}

function filterBasedOnSelectedDate() {
    if (props.myCalendarEvents?.data) {
        const targetDate = moment(state.selectedDate).format('YYYY-MM-DD')
        const filteredEvents = props.myCalendarEvents.data.filter((event: any) => {
            const start = moment(event.date_time_start).format('YYYY-MM-DD')
            const end = moment(event.date_time_end).format('YYYY-MM-DD')
            return targetDate >= start && targetDate <= end
        })
        state.filteredCalendarEvents = filteredEvents
    } else {
        state.filteredCalendarEvents = []
    }

    if (props.myCalendarEvents?.holidays) {
        const targetDate = moment(state.selectedDate).format('YYYY-MM-DD')
        const filteredHolidays = props.myCalendarEvents.holidays.filter((holiday: any) => {
            const start = moment(holiday.date).format('YYYY-MM-DD')
            const end = moment(holiday.date).format('YYYY-MM-DD')
            return targetDate >= start && targetDate <= end
        })
        state.filteredCalendarHolidays = filteredHolidays
    } else {
        state.filteredCalendarHolidays = []
    }
}

function showAllInvitees(myCalendarEven: any) {
    state.selectedSchedule = myCalendarEven
    state.modal.isShowAllInviteesOpen = true
}

function editMyCalendarEvent(myCalendarEvent: any) {
    if (myCalendarEvent?.is_shift) return
    emit('editMyCalendarEvent', myCalendarEvent)
}

function deleteEventConfirmation(myCalendarEvent: any) {
    state.selectedSchedule = myCalendarEvent
    state.modal.isDeleteScheduleOpen = true
}

function deleteMyCalendarEvent() {
    emit('deleteMyCalendarEvent', state.selectedSchedule)
    state.modal.isDeleteScheduleOpen = false
}

function markEventAsStatus(myCalendarEvent: any, status: 'completed' | 'not_completed') {
    emit('markEventAsStatus', myCalendarEvent, status)
}

function openCreateJournal(myCalendarEvent: any) {
    emit('createJournalFromEvent', myCalendarEvent)
}

function onCalKey(e: KeyboardEvent) {
    if (e.metaKey || e.ctrlKey || e.altKey) return
    const t = e.target as HTMLElement
    if (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable)) return
    if (e.key === 'ArrowLeft') { e.preventDefault(); previousMonth() }
    else if (e.key === 'ArrowRight') { e.preventDefault(); nextMonth() }
    else if (e.key === 't' || e.key === 'T') { setToday() }
}
onMounted(() => window.addEventListener('keydown', onCalKey))
onUnmounted(() => window.removeEventListener('keydown', onCalKey))
</script>
