<template>
    <div class="motion-safe:animate-fade-in">
        <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500">
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
        <div class="mt-3 flex h-full flex-col">
            <header class="flex flex-none items-center justify-between py-4">
                <div class="flex items-baseline gap-x-2">
                <h3 class="text-2xl font-semibold tracking-tight text-gray-900">
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
                <span v-if="weekCount" class="text-sm text-gray-400">
                    {{ weekCount === 1 ? $t('calendar.view.oneEvent') : $t('calendar.view.eventsCount', { count: weekCount }) }}
                </span>
                </div>
                <div class="flex items-center gap-x-2">
                    <button type="button" @click="setToday()"
                        class="rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-medium text-gray-600 shadow-sm hover:bg-gray-50 transition-colors">
                        {{ $t('goToToday') }}
                    </button>
                    <div class="inline-flex items-center rounded-full border border-gray-200 bg-white shadow-sm">
                        <button @click="previousWeek()" type="button"
                            class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-l-full text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors">
                            <span class="sr-only">Previous week</span>
                            <Icon name="heroicons:chevron-left" class="h-4 w-4" aria-hidden="true" />
                        </button>
                        <span class="h-4 w-px bg-gray-200"></span>
                        <button @click="nextWeek()" type="button"
                            class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-r-full text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors">
                            <span class="sr-only">Next week</span>
                            <Icon name="heroicons:chevron-right" class="h-4 w-4" aria-hidden="true" />
                        </button>
                    </div>
                    <div class="hidden">
                        <FormDateField id="date" name="date" :placeholder="$t('dutySchedules.form.date')"
                            dateType="calendar" v-model="state.selectedDate" />
                    </div>
                </div>
            </header>

            <!-- Desktop: 7-day week grid -->
            <div class="hidden overflow-hidden rounded-2xl bg-white ring-1 ring-gray-200 shadow-sm lg:block">
                <div class="grid grid-cols-7 border-b border-gray-200">
                    <div v-for="day in weekDays" :key="day.date"
                        class="flex flex-col items-center gap-y-1 py-3">
                        <span class="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                            <span v-if="day.longName === 'Mon'">{{ $t('calendar.week.short.Monday') }}</span>
                            <span v-if="day.longName === 'Tue'">{{ $t('calendar.week.short.Tuesday') }}</span>
                            <span v-if="day.longName === 'Wed'">{{ $t('calendar.week.short.Wednesday') }}</span>
                            <span v-if="day.longName === 'Thu'">{{ $t('calendar.week.short.Thursday') }}</span>
                            <span v-if="day.longName === 'Fri'">{{ $t('calendar.week.short.Friday') }}</span>
                            <span v-if="day.longName === 'Sat'">{{ $t('calendar.week.short.Saturday') }}</span>
                            <span v-if="day.longName === 'Sun'">{{ $t('calendar.week.short.Sunday') }}</span>
                        </span>
                        <span
                            :class="isToday(day.fullDate)
                                ? 'flex h-8 w-8 items-center justify-center rounded-full bg-tertiary text-sm font-semibold text-white'
                                : 'flex h-8 w-8 items-center justify-center text-sm font-semibold text-gray-800'">
                            {{ day.date }}
                        </span>
                    </div>
                </div>
                <div class="grid grid-cols-7 divide-x divide-gray-100">
                    <div v-for="(events, di) in eventsByDay" :key="di"
                        class="min-h-[26rem] space-y-1.5 p-2"
                        :class="isToday(weekDays[di]?.fullDate) && 'bg-tertiary/[0.04]'">
                        <div v-for="(holiday, hi) in holidaysByDay[di]" :key="'h' + hi"
                            class="rounded-md border-l-2 border-secondary bg-secondary/10 px-2 py-1.5">
                            <p class="truncate text-[11px] font-semibold text-secondary">{{ holiday?.name }}</p>
                        </div>
                        <template v-for="myCalendarEvent in events" :key="myCalendarEvent.id">
                            <div v-if="myCalendarEvent?.is_shift"
                                class="rounded-md border-l-2 border-indigo-500 bg-indigo-50 px-2 py-1.5"
                                :title="myCalendarEvent?.title">
                                <div class="flex items-center gap-x-1">
                                    <Icon name="ph:briefcase" class="h-3 w-3 flex-none text-indigo-500" />
                                    <p class="min-w-0 flex-1 truncate text-[11px] font-semibold text-indigo-700">
                                        {{ myCalendarEvent?.title }}
                                    </p>
                                </div>
                                <p class="mt-0.5 text-[10px] tabular-nums text-indigo-400">
                                    {{ moment(myCalendarEvent.date_time_start).format('HH:mm') }} –
                                    {{ moment(myCalendarEvent.date_time_end).format('HH:mm') }}
                                </p>
                            </div>
                            <div v-else role="button" tabindex="0"
                                :aria-label="myCalendarEvent?.title"
                                class="group/event relative cursor-pointer rounded-md border-l-2 px-2 py-1.5 transition hover:-translate-y-px active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                                :class="[
                                    myCalendarEvent?.type === 'citizens' && 'border-amber-500 bg-amber-500/10 hover:bg-amber-500/[0.18]',
                                    myCalendarEvent?.type === 'employees' && 'border-green-600 bg-green-600/10 hover:bg-green-600/[0.18]',
                                    myCalendarEvent?.type === 'my_self' && 'border-primary bg-primary/10 hover:bg-primary/[0.18]',
                                    myCalendarEvent?.completion_status === 'completed' && 'opacity-70',
                                    isNow(myCalendarEvent) && 'ring-1 ring-inset ring-red-400',
                                ]"
                                @keydown.enter.prevent="editMyCalendarEvent(myCalendarEvent)"
                                @keydown.space.prevent="editMyCalendarEvent(myCalendarEvent)"
                                @click="editMyCalendarEvent(myCalendarEvent)">
                                <span v-if="isNow(myCalendarEvent)"
                                    class="mb-1 inline-flex items-center gap-x-1 rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
                                    <span class="h-1.5 w-1.5 rounded-full bg-white motion-safe:animate-pulse"></span>{{ $t('calendar.view.now') }}
                                </span>
                                <span v-else-if="isOverdue(myCalendarEvent)"
                                    class="mb-1 inline-flex items-center gap-x-1 rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-700">
                                    <Icon name="ph:warning-circle" class="h-2.5 w-2.5" />{{ $t('calendar.view.overdue') }}
                                </span>
                                <div class="flex items-center gap-x-1">
                                    <p class="min-w-0 flex-1 truncate text-[11px] font-semibold"
                                        :class="[
                                            myCalendarEvent?.completion_status === 'completed' && 'line-through',
                                            myCalendarEvent?.type === 'citizens' && 'text-amber-800',
                                            myCalendarEvent?.type === 'employees' && 'text-green-800',
                                            myCalendarEvent?.type === 'my_self' && 'text-primary',
                                        ]">
                                        {{ myCalendarEvent?.title }}
                                    </p>
                                    <Icon v-if="myCalendarEvent?.completion_status === 'completed'"
                                        name="ph:check-circle-fill" class="h-3 w-3 flex-none text-green-500" />
                                    <Menu as="div"
                                        class="relative flex-none opacity-0 group-hover/event:opacity-100" @click.stop>
                                        <MenuButton class="flex items-center rounded p-0.5 text-gray-400 hover:bg-white hover:text-gray-700">
                                            <Icon name="heroicons:ellipsis-horizontal" class="h-3.5 w-3.5" />
                                        </MenuButton>
                                        <transition enter-active-class="transition ease-out duration-100"
                                            enter-from-class="transform opacity-0 scale-95"
                                            enter-to-class="transform opacity-100 scale-100"
                                            leave-active-class="transition ease-in duration-75"
                                            leave-from-class="transform opacity-100 scale-100"
                                            leave-to-class="transform opacity-0 scale-95">
                                            <MenuItems class="absolute right-0 z-20 mt-1 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                <div class="py-1">
                                                    <MenuItem v-slot="{ active }">
                                                    <a href="#" :class="[active && 'bg-gray-100', 'text-gray-700', 'flex items-center gap-x-1.5 px-4 py-2 text-sm']"
                                                        @click.stop="editMyCalendarEvent(myCalendarEvent)">
                                                        <Icon name="ph:pencil-simple" class="h-4 w-4" />
                                                        {{ $t('calendar.edit') }}
                                                    </a>
                                                    </MenuItem>
                                                    <MenuItem v-slot="{ active }">
                                                    <a href="#" :class="[active && 'bg-gray-100', 'text-red-600', 'flex items-center gap-x-1.5 px-4 py-2 text-sm']"
                                                        @click.stop="confirmEventDeletion(myCalendarEvent)">
                                                        <Icon name="ph:trash" class="h-4 w-4" />
                                                        {{ $t('calendar.delete') }}
                                                    </a>
                                                    </MenuItem>
                                                    <template v-if="myCalendarEvent?.completion_status !== 'completed'">
                                                        <MenuItem v-slot="{ active }">
                                                        <a href="#" :class="[active && 'bg-gray-100', 'text-green-700', 'flex items-center gap-x-1.5 px-4 py-2 text-sm']"
                                                            @click.stop="markEventAsStatus(myCalendarEvent, 'completed')">
                                                            <Icon name="ph:check-circle" class="h-4 w-4" />
                                                            {{ $t('events.markAsCompleted') }}
                                                        </a>
                                                        </MenuItem>
                                                    </template>
                                                    <template v-if="myCalendarEvent?.completion_status !== 'not_completed'">
                                                        <MenuItem v-slot="{ active }">
                                                        <a href="#" :class="[active && 'bg-gray-100', 'text-red-700', 'flex items-center gap-x-1.5 px-4 py-2 text-sm']"
                                                            @click.stop="markEventAsStatus(myCalendarEvent, 'not_completed')">
                                                            <Icon name="ph:x-circle" class="h-4 w-4" />
                                                            {{ $t('events.markAsNotCompleted') }}
                                                        </a>
                                                        </MenuItem>
                                                    </template>
                                                    <template v-if="myCalendarEvent?.type === 'citizens'">
                                                        <MenuItem v-slot="{ active }">
                                                        <a href="#" :class="[active && 'bg-gray-100', 'text-gray-700', 'flex items-center gap-x-1.5 px-4 py-2 text-sm']"
                                                            @click.stop="openCreateJournal(myCalendarEvent)">
                                                            <Icon name="ph:notebook" class="h-4 w-4" />
                                                            {{ $t('events.createJournalNote') }}
                                                        </a>
                                                        </MenuItem>
                                                    </template>
                                                </div>
                                            </MenuItems>
                                        </transition>
                                    </Menu>
                                </div>
                                <p class="mt-0.5 text-[10px] tabular-nums text-gray-500">
                                    {{ moment(myCalendarEvent.date_time_start).format('HH:mm') }} –
                                    {{ moment(myCalendarEvent.date_time_end).format('HH:mm') }}
                                </p>
                                <div v-if="myCalendarEvent.calendar_tags?.length > 0" class="mt-1 flex flex-wrap gap-1">
                                    <span v-for="(calendarTag, ti) in myCalendarEvent.calendar_tags" :key="ti"
                                        class="rounded px-1 py-0.5 text-[9px] font-medium text-white"
                                        :style="{ backgroundColor: calendarTag?.color }">
                                        {{ calendarTag?.tag }}
                                    </span>
                                </div>
                            </div>
                        </template>
                        <p v-if="!events.length && !holidaysByDay[di]?.length"
                            class="pt-3 text-center text-[11px] text-gray-300">–</p>
                    </div>
                </div>
            </div>

            <!-- Mobile: agenda list -->
            <ol class="mt-4 space-y-2 text-sm leading-6 lg:hidden" v-if="selectedDay">
                <li v-for="(holiday, holidayIndex) in props.myCalendarEvents?.holidays" :key="holidayIndex"
                    class="border-secondary pl-4 border-l-4">
                    <div class="py-2">
                        <div class="flex items-center gap-x-2">
                            <Icon name="ph:clipboard" class="h-4 w-4 text-gray-400" aria-hidden="true" />
                            <dd class="font-semibold text-gray-900 xl:pr-0">
                                {{ holiday?.name }}
                            </dd>
                        </div>
                        <dl class="text-gray-500">
                            <div class="flex items-center space-x-3 text-xs">
                                <Icon name="ph:calendar" class="h-4 w-4 text-gray-400" aria-hidden="true" />
                                <dd>
                                    <time :datetime="holiday.date">
                                        {{ formatDateToReadable(holiday.date) }}
                                    </time>
                                </dd>
                            </div>
                        </dl>
                    </div>
                </li>
                <li v-for="(event, index) in props.myCalendarEvents?.data" :key="index" :class="[
                    event?.is_shift && 'border-indigo-500 bg-indigo-50/60 rounded-r-md',
                    !event?.is_shift && event?.type === 'citizens' && 'border-amber-500',
                    !event?.is_shift && event?.type === 'employees' && 'border-green-600',
                    !event?.is_shift && event?.type === 'my_self' && 'border-primary',
                    'pl-4 border-l-4'
                ]">
                    <div v-if="event?.is_shift" class="relative py-4">
                        <div class="flex items-center gap-x-2 flex-wrap">
                            <Icon name="ph:briefcase" class="h-4 w-4 text-indigo-600" aria-hidden="true" />
                            <dd class="font-semibold text-gray-900 xl:pr-0">{{ event?.title }}</dd>
                            <span
                                class="inline-flex items-center gap-x-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                                <Icon name="ph:clock" class="h-3.5 w-3.5" />
                                {{ $t('events.shiftLabel') }}
                            </span>
                        </div>
                        <p class="text-xs text-gray-500 mt-1" v-if="event?.employee">{{ event?.employee }}</p>
                        <p class="text-xs text-gray-500" v-if="event?.citizens?.length">
                            {{ event.citizens.map((c) => c.name).join(', ') }}
                        </p>
                        <dl class="text-gray-500">
                            <div class="flex items-center space-x-3 text-xs">
                                <Icon name="ph:calendar" class="h-4 w-4 text-gray-400" aria-hidden="true" />
                                <dd>
                                    <time :datetime="event.date_time_start">
                                        {{ formatDateTimeToReadable(event.date_time_start) }}
                                        -
                                        {{ formatDateTimeToReadable(event.date_time_end) }}
                                    </time>
                                </dd>
                            </div>
                        </dl>
                    </div>
                    <div v-else class="relative flex space-x-4 py-4">
                        <span class="mt-1.5 h-2.5 w-2.5 flex-none rounded-full" :class="[
                            event?.type === 'citizens' && 'bg-amber-500',
                            event?.type === 'employees' && 'bg-green-600',
                            event?.type === 'my_self' && 'bg-primary',
                        ]" />
                        <div class="flex-auto">
                            <div class="flex items-center gap-x-2 flex-wrap">
                                <dd class="font-semibold text-gray-900 xl:pr-0">
                                    {{ event?.title }}
                                </dd>
                                <span v-if="event?.completion_status === 'completed'"
                                    class="inline-flex items-center gap-x-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                    <Icon name="ph:check-circle" class="h-3.5 w-3.5" />
                                    {{ $t('events.status.completed') }}
                                </span>
                                <span v-else-if="event?.completion_status === 'not_completed'"
                                    class="inline-flex items-center gap-x-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                                    <Icon name="ph:x-circle" class="h-3.5 w-3.5" />
                                    {{ $t('events.status.notCompleted') }}
                                </span>
                            </div>
                            <p class="text-gray-900" v-if="event?.description">{{ event?.description }}</p>
                            <dl class="text-gray-500">
                                <div class="flex items-center space-x-3 text-xs">
                                    <Icon name="ph:calendar" class="h-4 w-4 text-gray-400" aria-hidden="true" />
                                    <dd>
                                        <time :datetime="event.datetime">
                                            {{ formatDateTimeToReadable(event.date_time_start) }}
                                            -
                                            {{ formatDateTimeToReadable(event.date_time_end) }}
                                        </time>
                                    </dd>
                                </div>
                            </dl>
                        </div>
                        <Menu as="div"
                            class="absolute right-0 top-4 xl:relative xl:right-auto xl:top-auto xl:self-center">
                            <div>
                                <MenuButton
                                    class="-m-2 flex items-center rounded-full p-2 text-gray-500 hover:text-gray-600">
                                    <span class="sr-only">Open options</span>
                                    <Icon name="heroicons:ellipsis-horizontal" class="h-5 w-5" aria-hidden="true" />
                                </MenuButton>
                            </div>
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
                                            @click="editMyCalendarEvent(event)">
                                            <Icon name="ph:pencil-simple" class="h-4 w-4" />
                                            {{ $t('calendar.edit') }}
                                        </a>
                                        </MenuItem>
                                        <MenuItem v-slot="{ active }">
                                        <a href="#"
                                            :class="[active && 'bg-gray-100', 'text-red-600', 'flex items-center gap-x-1.5 px-4 py-2 text-sm']"
                                            @click="confirmEventDeletion(event)">
                                            <Icon name="ph:trash" class="h-4 w-4" />
                                            {{ $t('calendar.delete') }}
                                        </a>
                                        </MenuItem>
                                        <template v-if="event?.completion_status !== 'completed'">
                                            <MenuItem v-slot="{ active }">
                                            <a href="#"
                                                :class="[active && 'bg-gray-100', 'text-green-700', 'flex items-center gap-x-1.5 px-4 py-2 text-sm']"
                                                @click="markEventAsStatus(event, 'completed')">
                                                <Icon name="ph:check-circle" class="h-4 w-4" />
                                                {{ $t('events.markAsCompleted') }}
                                            </a>
                                            </MenuItem>
                                        </template>
                                        <template v-if="event?.completion_status !== 'not_completed'">
                                            <MenuItem v-slot="{ active }">
                                            <a href="#"
                                                :class="[active && 'bg-gray-100', 'text-red-700', 'flex items-center gap-x-1.5 px-4 py-2 text-sm']"
                                                @click="markEventAsStatus(event, 'not_completed')">
                                                <Icon name="ph:x-circle" class="h-4 w-4" />
                                                {{ $t('events.markAsNotCompleted') }}
                                            </a>
                                            </MenuItem>
                                        </template>
                                        <template v-if="event?.type === 'citizens'">
                                            <MenuItem v-slot="{ active }">
                                            <a href="#"
                                                :class="[active && 'bg-gray-100', 'text-gray-700', 'flex items-center gap-x-1.5 px-4 py-2 text-sm']"
                                                @click="openCreateJournal(event)">
                                                <Icon name="ph:notebook" class="h-4 w-4" />
                                                {{ $t('events.createJournalNote') }}
                                            </a>
                                            </MenuItem>
                                        </template>
                                    </div>
                                </MenuItems>
                            </transition>
                        </Menu>
                    </div>
                </li>
            </ol>
            <ModulesUserMyCalendarModalShowAllInvitees :isModalOpen="state.modal.isShowAllInviteesOpen"
                :invitees="state.selectedSchedule?.calendar_users" @close="state.modal.isShowAllInviteesOpen = false"
                v-if="state.modal.isShowAllInviteesOpen" />
            <DialogConfirmation :isModalOpen="state.modal.isDeleteScheduleOpen"
                :message="$t('events.confirmation.deleteConfirmation') + '?'"
                @close="state.modal.isDeleteScheduleOpen = false" @confirm="deleteMyCalendarEvent" />
        </div>
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
const emit = defineEmits(['changeDatePerWeek', 'editMyCalendarEvent', 'deleteMyCalendarEvent', 'markEventAsStatus', 'createJournalFromEvent'])
const userStore = useUserStore() as any

const currentDate = ref(moment())
const selectedDay = ref(moment())

const state = reactive({
    modal: {
        isDeleteScheduleOpen: false,
        isShowAllInviteesOpen: false,
    },
    selectedDate: moment().format('YYYY-MM-DD'),
    selectedSchedule: {} as any
})

watch(() => state.selectedDate, (newSelectedDate: any) => {
    if (newSelectedDate) {
        currentDate.value = moment(newSelectedDate)
        const dateMoment = moment(currentDate.value)
        const startOfWeek = dateMoment.clone().startOf('isoWeek')
        const endOfWeek = dateMoment.clone().endOf('isoWeek')
        const startOfWeekFormatted = startOfWeek.format('YYYY-MM-DD')
        const endOfWeekFormatted = endOfWeek.format('YYYY-MM-DD')
        emit('changeDatePerWeek', [startOfWeekFormatted, endOfWeekFormatted])
    }
})

const previousWeek = () => {
    currentDate.value = moment(currentDate.value).subtract(1, 'week')
    const dateMoment = moment(currentDate.value)
    const startOfWeek = dateMoment.clone().startOf('isoWeek')
    const endOfWeek = dateMoment.clone().endOf('isoWeek')
    const startOfWeekFormatted = startOfWeek.format('YYYY-MM-DD')
    const endOfWeekFormatted = endOfWeek.format('YYYY-MM-DD')
    emit('changeDatePerWeek', [startOfWeekFormatted, endOfWeekFormatted])
    state.selectedDate = moment(state.selectedDate).subtract(1, 'week').format('YYYY-MM-DD')
}

const setToday = () => {
    currentDate.value = moment()
    const dateMoment = moment(currentDate.value)
    const startOfWeek = dateMoment.clone().startOf('isoWeek')
    const endOfWeek = dateMoment.clone().endOf('isoWeek')
    const startOfWeekFormatted = startOfWeek.format('YYYY-MM-DD')
    const endOfWeekFormatted = endOfWeek.format('YYYY-MM-DD')
    emit('changeDatePerWeek', [startOfWeekFormatted, endOfWeekFormatted])
    state.selectedDate = moment(currentDate.value).format('YYYY-MM-DD')
}

const nextWeek = () => {
    currentDate.value = moment(currentDate.value).add(1, 'week')
    const dateMoment = moment(currentDate.value)
    const startOfWeek = dateMoment.clone().startOf('isoWeek')
    const endOfWeek = dateMoment.clone().endOf('isoWeek')
    const startOfWeekFormatted = startOfWeek.format('YYYY-MM-DD')
    const endOfWeekFormatted = endOfWeek.format('YYYY-MM-DD')
    emit('changeDatePerWeek', [startOfWeekFormatted, endOfWeekFormatted])
    state.selectedDate = moment(state.selectedDate).add(1, 'week').format('YYYY-MM-DD')
}

function showAllInvitees(myCalendarEvent: any) {
    state.selectedSchedule = myCalendarEvent
    state.modal.isShowAllInviteesOpen = true
}

function editMyCalendarEvent(myCalendarEvent: any) {
    if (myCalendarEvent?.is_shift) return
    if (!state.modal.isShowAllInviteesOpen) {
        emit('editMyCalendarEvent', myCalendarEvent)
    }
}

const month = computed(() => currentDate.value.format('MMMM'))
const year = computed(() => currentDate.value.format('YYYY'))

const weekDays = computed(() => {
    const startOfWeek = moment(currentDate.value).startOf('isoWeek')
    return Array.from({ length: 7 }).map((_, i) => {
        const day = moment(startOfWeek).add(i, 'day')
        return {
            shortName: day.format('dd')[0],
            longName: day.format('ddd'),
            date: day.date(),
            fullDate: day
        }
    })
})

function isToday(date: any) {
    return moment().isSame(moment(date), 'day')
}

function isNow(event: any) {
    if (!event?.date_time_start || !event?.date_time_end) return false
    return moment().isBetween(moment(event.date_time_start), moment(event.date_time_end), null, '[)')
}

function isOverdue(event: any) {
    if (!event || event.completion_status === 'completed' || event.is_shift) return false
    return !isNow(event) && moment(event.date_time_end).isBefore(moment())
}

const weekCount = computed(() => eventsByDay.value.reduce((sum: number, day: any) => sum + day.length, 0))

function setSelectedDay(day: any) {
    selectedDay.value = day.fullDate
    const dateMoment = moment(currentDate.value)
    const startOfWeek = dateMoment.clone().startOf('isoWeek')
    const endOfWeek = dateMoment.clone().endOf('isoWeek')
    const startOfWeekFormatted = startOfWeek.format('YYYY-MM-DD')
    const endOfWeekFormatted = endOfWeek.format('YYYY-MM-DD')
    emit('changeDatePerWeek', [startOfWeekFormatted, endOfWeekFormatted])
}

function isWithinRange(eventStart: moment.Moment, eventEnd: moment.Moment, dayStart: moment.Moment, dayEnd: moment.Moment) {
    return eventStart.isBefore(dayEnd) && eventEnd.isAfter(dayStart)
}

const eventsByDay = computed(() => {
    if (!props.myCalendarEvents?.data) return Array.from({ length: 7 }).map(() => [])

    const startOfWeek = moment(currentDate.value).startOf('isoWeek')

    return Array.from({ length: 7 }).map((_, i) => {
        const dayStart = moment(startOfWeek).add(i, 'day').startOf('day')
        const dayEnd = moment(dayStart).endOf('day')

        return props.myCalendarEvents.data.filter((event: any) => {
            const eventStart = moment(event.date_time_start)
            const eventEnd = moment(event.date_time_end)
            return isWithinRange(eventStart, eventEnd, dayStart, dayEnd)
        })
    })
})

const holidaysByDay = computed(() => {
    if (!props.myCalendarEvents?.holidays) return Array.from({ length: 7 }).map(() => [])

    const startOfWeek = moment(currentDate.value).startOf('isoWeek')

    return Array.from({ length: 7 }).map((_, i) => {
        const dayStart = moment(startOfWeek).add(i, 'days').startOf('day')
        const dayEnd = moment(dayStart).endOf('day')

        return props.myCalendarEvents.holidays.filter((holiday: any) => {
            const eventStart = moment(holiday.date).startOf('day')
            const eventEnd = moment(holiday.date).endOf('day')
            return isWithinRange(eventStart, eventEnd, dayStart, dayEnd)
        })
    })
})

const eventsBySelectedDay = computed(() => {
    if (!props.myCalendarEvents?.data) return Array.from({ length: 7 }).map(() => [])

    const dayStart = moment(selectedDay.value).startOf('day')
    const dayEnd = moment(selectedDay.value).endOf('day')
    return props.myCalendarEvents.data.filter((event: any) => {
        const eventStart = moment(event.date_time_start)
        const eventEnd = moment(event.date_time_end)
        return isWithinRange(eventStart, eventEnd, dayStart, dayEnd)
    })
})

function confirmEventDeletion(myCalendarEvent: any) {
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
    if (e.key === 'ArrowLeft') { e.preventDefault(); previousWeek() }
    else if (e.key === 'ArrowRight') { e.preventDefault(); nextWeek() }
    else if (e.key === 't' || e.key === 'T') { setToday() }
}
onMounted(() => window.addEventListener('keydown', onCalKey))
onUnmounted(() => window.removeEventListener('keydown', onCalKey))
</script>
