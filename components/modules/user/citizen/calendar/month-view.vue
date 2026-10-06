<template>
    <div class="motion-safe:animate-fade-in lg:flex lg:h-full lg:flex-col">
        <header class="flex items-center justify-between py-4 lg:flex-none">
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
            <span v-if="monthCount" class="text-sm text-gray-400">
                {{ monthCount === 1 ? $t('calendar.view.oneEvent') : $t('calendar.view.eventsCount', { count: monthCount }) }}
            </span>
            </div>
            <div class="flex items-center gap-x-2">
                <button type="button" @click="setToday"
                    class="rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-medium text-gray-600 shadow-sm hover:bg-gray-50 transition-colors">
                    {{ $t('calendar.today') }}
                </button>
                <div class="inline-flex items-center rounded-full border border-gray-200 bg-white shadow-sm">
                    <button type="button" @click="previousMonth"
                        class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-l-full text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors">
                        <span class="sr-only">Previous month</span>
                        <Icon name="heroicons:chevron-left" class="h-4 w-4" aria-hidden="true" />
                    </button>
                    <span class="h-4 w-px bg-gray-200"></span>
                    <button type="button" @click="nextMonth"
                        class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-r-full text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors">
                        <span class="sr-only">Next month</span>
                        <Icon name="heroicons:chevron-right" class="h-4 w-4" aria-hidden="true" />
                    </button>
                </div>
            </div>
        </header>
        <div class="overflow-hidden rounded-2xl bg-white ring-1 ring-gray-200 shadow-sm lg:flex lg:flex-auto lg:flex-col">
            <div
                class="md:hidden grid grid-cols-7 border-b border-gray-200 bg-white text-center text-[11px] font-semibold uppercase tracking-wider leading-6 text-gray-400 lg:flex-none">
                <div class="py-2.5">{{ $t('calendar.week.oneLetter.Monday') }}</div>
                <div class="py-2.5">{{ $t('calendar.week.oneLetter.Tuesday') }}</div>
                <div class="py-2.5">{{ $t('calendar.week.oneLetter.Wednesday') }}</div>
                <div class="py-2.5">{{ $t('calendar.week.oneLetter.Thursday') }}</div>
                <div class="py-2.5">{{ $t('calendar.week.oneLetter.Friday') }}</div>
                <div class="py-2.5">{{ $t('calendar.week.oneLetter.Saturday') }}</div>
                <div class="py-2.5">{{ $t('calendar.week.oneLetter.Sunday') }}</div>
            </div>
            <div
                class="hidden md:grid grid-cols-7 border-b border-gray-200 bg-white text-center text-[11px] font-semibold uppercase tracking-wider leading-6 text-gray-400 lg:flex-none">
                <div class="py-2.5">{{ $t('calendar.week.short.Monday') }}</div>
                <div class="py-2.5">{{ $t('calendar.week.short.Tuesday') }}</div>
                <div class="py-2.5">{{ $t('calendar.week.short.Wednesday') }}</div>
                <div class="py-2.5">{{ $t('calendar.week.short.Thursday') }}</div>
                <div class="py-2.5">{{ $t('calendar.week.short.Friday') }}</div>
                <div class="py-2.5">{{ $t('calendar.week.short.Saturday') }}</div>
                <div class="py-2.5">{{ $t('calendar.week.short.Sunday') }}</div>
            </div>
            <div class="flex bg-gray-100 text-xs leading-6 text-gray-700 lg:flex-auto">
                <div class="hidden w-full lg:grid lg:grid-cols-7 lg:auto-rows-fr lg:gap-px">
                    <div v-for="(day, index) in state.days" :key="index"
                        :class="[
                            day.isToday ? 'bg-tertiary/[0.05]' : (day.isCurrentMonth ? 'bg-white' : 'bg-gray-50/70'),
                            day.isToday && state.flashToday && 'ring-2 ring-inset ring-tertiary motion-safe:animate-pulse',
                            'group/day relative flex min-h-[7rem] cursor-pointer flex-col gap-y-1 px-2 py-2',
                        ]"
                        @click="setSelectedDay(day)">
                        <div class="flex items-center justify-between">
                            <time :datetime="day.date"
                                :class="day.isToday
                                    ? 'flex h-6 w-6 items-center justify-center rounded-full bg-tertiary text-[13px] font-semibold text-white'
                                    : ['text-[13px] font-medium', day.isCurrentMonth ? (isWeekend(day.date) ? 'text-gray-400' : 'text-gray-700') : 'text-gray-300']">
                                {{ day.date?.split('-').pop()?.replace(/^0/, '') }}
                            </time>
                            <Icon name="ph:plus"
                                class="h-3.5 w-3.5 text-gray-300 opacity-0 transition-opacity group-hover/day:opacity-100" />
                        </div>
                        <ol v-if="day.events.length > 0" class="space-y-1">
                            <li v-for="myCalendarEvent in visibleEvents(day)" :key="myCalendarEvent.id">
                                <div class="group/event relative">
                                    <div role="button" tabindex="0"
                                        class="flex cursor-pointer items-center gap-x-1.5 rounded-md px-1.5 py-1 transition hover:bg-gray-100 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                                        :class="[
                                            myCalendarEvent?.completion_status === 'completed' && 'opacity-70',
                                            isNow(myCalendarEvent) && 'bg-red-50 ring-1 ring-inset ring-red-300',
                                            isOverdue(myCalendarEvent) && 'ring-1 ring-inset ring-amber-300',
                                        ]"
                                        :aria-label="`${myCalendarEvent?.title}, ${myCalendarEvent.time_start}`"
                                        @mouseenter.stop="showPreview($event, myCalendarEvent)" @mouseleave="hidePreview"
                                        @focus="showPreviewEl($event, myCalendarEvent)" @blur="hidePreview"
                                        @keydown.enter.prevent="viewMyCalendarEvent(myCalendarEvent)"
                                        @keydown.space.prevent="viewMyCalendarEvent(myCalendarEvent)"
                                        @click.stop="viewMyCalendarEvent(myCalendarEvent)">
                                        <span class="h-1.5 w-1.5 flex-none rounded-full" :class="[
                                            isNow(myCalendarEvent) ? 'bg-red-500 motion-safe:animate-pulse' : [
                                                myCalendarEvent?.type === 'citizens' && 'bg-amber-500',
                                                myCalendarEvent?.type === 'employees' && 'bg-green-600',
                                                myCalendarEvent?.type === 'my_self' && 'bg-primary',
                                                !['citizens', 'employees', 'my_self'].includes(myCalendarEvent?.type) && 'bg-tertiary',
                                            ],
                                        ]"></span>
                                        <span class="min-w-0 flex-1 truncate text-[11px] font-medium"
                                            :class="myCalendarEvent?.completion_status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-800 group-hover/event:text-gray-900'">
                                            {{ myCalendarEvent?.title }}
                                        </span>
                                        <Icon v-if="myCalendarEvent?.journal_id" name="ph:notebook"
                                            class="h-3 w-3 flex-none text-primary" :title="$t('events.linkedNote', { title: myCalendarEvent?.journal?.title ?? '' })" />
                                        <Icon v-if="myCalendarEvent?.completion_status === 'completed'"
                                            name="ph:check-circle-fill" class="h-3 w-3 flex-none text-green-500" />
                                        <Icon v-else-if="isOverdue(myCalendarEvent)"
                                            name="ph:warning-circle-fill" class="h-3 w-3 flex-none text-amber-500" />
                                        <span class="hidden flex-none text-[10px] tabular-nums text-gray-400 group-hover/event:opacity-0 xl:block">
                                            {{ myCalendarEvent.time_start }}
                                        </span>
                                        <Menu as="div"
                                            class="absolute right-1 flex-none opacity-0 group-hover/event:opacity-100"
                                            @click.stop>
                                            <MenuButton class="flex items-center rounded bg-white/90 p-0.5 text-gray-400 shadow-sm ring-1 ring-gray-200 hover:text-gray-700">
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
                                                            @click.stop="viewMyCalendarEvent(myCalendarEvent)">
                                                            <Icon name="ph:eye" class="h-4 w-4" />
                                                            {{ $t('citizens.calendar.viewSchedule') }}
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
                                                        <MenuItem v-slot="{ active }">
                                                        <a href="#" :class="[active && 'bg-gray-100', 'text-gray-700', 'flex items-center gap-x-1.5 px-4 py-2 text-sm']"
                                                            @click.stop="openCreateJournal(myCalendarEvent)">
                                                            <Icon name="ph:notebook" class="h-4 w-4" />
                                                            {{ $t('events.createJournalNote') }}
                                                        </a>
                                                        </MenuItem>
                                                    </div>
                                                </MenuItems>
                                            </transition>
                                        </Menu>
                                    </div>
                                </div>
                            </li>
                            <li v-if="day.events.length > 3 && !state.expandedDays.includes(day.date)">
                                <button type="button" @click.stop="state.expandedDays.push(day.date)"
                                    class="w-full rounded-md px-1.5 py-0.5 text-left text-[11px] font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700">
                                    +{{ day.events.length - 3 }} {{ $t('showMore') }}
                                </button>
                            </li>
                        </ol>
                    </div>
                </div>
                <div class="isolate grid w-full grid-cols-7 grid-rows-5 gap-px lg:hidden">
                    <button v-for="(day, index) in state.days" :key="index" type="button" :class="[
                        day.isCurrentMonth ? 'bg-white' : 'bg-gray-50',
                        (day.isSelected || day.isToday) && 'font-semibold',
                        day.isSelected && 'text-white',
                        !day.isSelected && day.isToday && 'text-tertiary',
                        !day.isSelected && day.isCurrentMonth && !day.isToday && 'text-gray-900',
                        !day.isSelected && !day.isCurrentMonth && !day.isToday && 'text-gray-500',
                        'flex h-14 flex-col px-3 py-2 hover:bg-gray-100 focus:z-10'
                    ]" @click="setSelectedDay(day)">
                        <time :datetime="day.date" :class="[
                            day.isSelected && 'flex h-6 w-6 items-center justify-center rounded-full bg-tertiary',
                            'ml-auto'
                        ]">
                            {{ day.date?.split('-').pop()?.replace(/^0/, '') }}
                        </time>
                        <span class="sr-only">{{ day.events.length }} events</span>
                        <span v-if="day.events.length > 0" class="-mx-0.5 mt-auto flex flex-wrap-reverse">
                            <span v-for="event in day.events" :key="event.id"
                                class="mx-0.5 mb-1 h-1.5 w-1.5 rounded-full bg-tertiary" />
                        </span>
                    </button>
                </div>
            </div>
        </div>
        <ol class="lg:hidden mt-4 divide-y divide-gray-100 text-sm leading-6"
            v-if="state.selectedDay">
            <li v-for="(myCalendarEvent, index) in state.days.find(day => day.date === state.selectedDay?.date)?.events || []"
                :key="index" class="group/event flex gap-x-3 py-4">
                <div class="w-14 flex-none pt-0.5 text-right">
                    <p class="text-[13px] font-semibold tabular-nums text-gray-900">{{ myCalendarEvent.time_start }}</p>
                    <p class="text-[11px] tabular-nums text-gray-400">{{ myCalendarEvent.time_end }}</p>
                </div>
                <span class="w-1 flex-none self-stretch rounded-full" :class="[
                    myCalendarEvent?.type === 'employees' && 'bg-green-600',
                    myCalendarEvent?.type === 'my_self' && 'bg-primary',
                    myCalendarEvent?.type !== 'employees' && myCalendarEvent?.type !== 'my_self' && 'bg-amber-500',
                ]"></span>
                <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-x-2">
                        <h4 class="truncate font-semibold text-gray-900"
                            :class="myCalendarEvent?.completion_status === 'completed' && 'text-gray-400 line-through'">
                            {{ myCalendarEvent?.title }}
                        </h4>
                        <span v-if="myCalendarEvent?.completion_status === 'completed'"
                            class="inline-flex items-center gap-x-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-700">
                            <Icon name="ph:check-circle" class="h-3.5 w-3.5" />
                            {{ $t('events.completionStatistics.completed') }}
                        </span>
                        <span v-else-if="myCalendarEvent?.completion_status === 'not_completed'"
                            class="inline-flex items-center gap-x-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700">
                            <Icon name="ph:x-circle" class="h-3.5 w-3.5" />
                            {{ $t('events.completionStatistics.notCompleted') }}
                        </span>
                    </div>
                    <p v-if="myCalendarEvent?.description" class="mt-0.5 truncate text-sm text-gray-600">
                        {{ myCalendarEvent?.description }}
                    </p>
                    <div v-if="myCalendarEvent.calendar_tags?.length > 0" class="mt-1 flex flex-wrap gap-1">
                        <span v-for="(calendarTag, ti) in myCalendarEvent.calendar_tags" :key="ti"
                            class="rounded-md px-1.5 py-0.5 text-[10px] font-medium text-white"
                            :style="{ backgroundColor: calendarTag?.color }">
                            {{ calendarTag?.tag }}
                        </span>
                    </div>
                </div>
                <Menu as="div" class="relative flex-none self-start">
                    <MenuButton class="-m-1 flex items-center rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                        <span class="sr-only">Open options</span>
                        <Icon name="heroicons:ellipsis-horizontal" class="h-5 w-5" aria-hidden="true" />
                    </MenuButton>
                    <transition enter-active-class="transition ease-out duration-100"
                        enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100"
                        leave-active-class="transition ease-in duration-75"
                        leave-from-class="transform opacity-100 scale-100"
                        leave-to-class="transform opacity-0 scale-95">
                        <MenuItems
                            class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div class="py-1">
                                <MenuItem v-slot="{ active }">
                                <a href="#"
                                    :class="[active && 'bg-gray-100', 'text-gray-700', 'flex items-center gap-x-1.5 px-4 py-2 text-sm']"
                                    @click="viewMyCalendarEvent(myCalendarEvent)">
                                    <Icon name="ph:eye" class="h-4 w-4" />
                                    {{ $t('citizens.calendar.viewSchedule') }}
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
                                <MenuItem v-slot="{ active }">
                                <a href="#"
                                    :class="[active && 'bg-gray-100', 'text-gray-700', 'flex items-center gap-x-1.5 px-4 py-2 text-sm']"
                                    @click="openCreateJournal(myCalendarEvent)">
                                    <Icon name="ph:notebook" class="h-4 w-4" />
                                    {{ $t('events.createJournalNote') }}
                                </a>
                                </MenuItem>
                            </div>
                        </MenuItems>
                    </transition>
                </Menu>
            </li>
        </ol>

        <Teleport to="body">
            <div v-if="state.preview.event"
                class="pointer-events-none fixed z-[60] w-64 rounded-xl bg-white p-3 shadow-dropdown ring-1 ring-gray-200 motion-safe:animate-fade-in"
                :style="{ left: state.preview.x + 'px', top: state.preview.y + 'px' }">
                <div class="flex items-center gap-x-1.5">
                    <span class="h-2 w-2 flex-none rounded-full" :class="[
                        state.preview.event?.type === 'employees' && 'bg-green-600',
                        state.preview.event?.type === 'my_self' && 'bg-primary',
                        state.preview.event?.type !== 'employees' && state.preview.event?.type !== 'my_self' && 'bg-amber-500',
                    ]"></span>
                    <p class="truncate text-sm font-semibold text-gray-900">{{ state.preview.event?.title }}</p>
                </div>
                <p class="mt-1 text-xs tabular-nums text-gray-500">
                    {{ state.preview.event?.time_start }} – {{ state.preview.event?.time_end }}
                </p>
                <!-- Not a link: the preview ignores the pointer. Click the booking to open it. -->
                <span v-if="state.preview.event?.journal"
                    class="mt-1.5 inline-flex max-w-full items-center gap-x-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    <Icon name="ph:notebook" class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span class="truncate">{{ $t('events.linkedNote', { title: state.preview.event.journal.title }) }}</span>
                </span>
                <p v-if="state.preview.event?.unit?.name" class="mt-1 flex items-center gap-x-1 text-xs text-gray-500">
                    <Icon name="ph:map-pin" class="h-3.5 w-3.5 text-gray-400" />{{ state.preview.event?.unit?.name }}
                </p>
                <p v-if="state.preview.event?.description" class="mt-1 line-clamp-3 text-xs text-gray-600">
                    {{ state.preview.event?.description }}
                </p>
            </div>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'

const { formatDateTimeToReadable } = useDatetimeFormatter()
const props = defineProps({
    myCalendarEvents: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(['changeMonthYear', 'viewMyCalendarEvent', 'markEventAsStatus', 'createJournalFromEvent', 'createEvent'])

const today = moment()

const state = reactive({
    currentMonth: today.month(),
    currentYear: today.year(),
    days: generateDays(today.year(), today.month(), props.myCalendarEvents),
    expandedDays: [] as string[],
    flashToday: false,
    preview: { event: null as any, x: 0, y: 0 },
    selectedDay: null as any,
})

watch(() => props.myCalendarEvents, (newValue: any) => {
    if (newValue != null) {
        updateDays()
    }
})

function setSelectedDay(day: any) {
    state.selectedDay = day
    state.days.forEach(d => d.isSelected = d.date === day.date)
    emit('createEvent', day.date)
}

function previousMonth() {
    const previous = moment([state.currentYear, state.currentMonth]).subtract(1, 'month')
    state.currentMonth = previous.month()
    state.currentYear = previous.year()
    updateDays()
    emit('changeMonthYear', state.currentYear, state.currentMonth)
}

function setToday() {
    state.currentMonth = today.month()
    state.currentYear = today.year()
    updateDays()
    emit('changeMonthYear', state.currentYear, state.currentMonth)
    state.flashToday = true
    setTimeout(() => { state.flashToday = false }, 1200)
}

function nextMonth() {
    const next = moment([state.currentYear, state.currentMonth]).add(1, 'month')
    state.currentMonth = next.month()
    state.currentYear = next.year()
    updateDays()
    emit('changeMonthYear', state.currentYear, state.currentMonth)
}

function updateDays() {
    state.days = generateDays(state.currentYear, state.currentMonth, props.myCalendarEvents)
}

function generateDays(year: any, month: any, myCalendarEvents: any) {
    const startOfMonth = moment([year, month]).startOf('month')
    const endOfMonth = moment([year, month]).endOf('month')
    const startOfWeek = startOfMonth.clone().startOf('isoWeek')
    const endOfWeek = endOfMonth.clone().endOf('isoWeek')

    const daysArray = []
    let day = startOfWeek.clone()

    while (day.isBefore(endOfWeek, 'day') || day.isSame(endOfWeek, 'day')) {
        const dateStr = day.format('YYYY-MM-DD')
        daysArray.push({
            date: dateStr,
            isCurrentMonth: day.isSame(startOfMonth, 'month'),
            isSelected: false,
            isToday: isToday(dateStr),
            events: myCalendarEvents?.data?.filter((event: any) => isWithinRange(dateStr, event.date_time_start, event.date_time_end)).map((event: any) => ({
                ...event,
                time_start: moment(event.date_time_start).format('HH:mm'),
                time_end: moment(event.date_time_end).format('HH:mm'),
            })) || [],
        })
        day.add(1, 'day')
    }

    return daysArray
}

function isToday(day: any) {
    return moment().isSame(day, 'day')
}

function isWeekend(dateStr: string) {
    return moment(dateStr).isoWeekday() >= 6
}

function isNow(event: any) {
    if (!event?.date_time_start || !event?.date_time_end) return false
    return moment().isBetween(moment(event.date_time_start), moment(event.date_time_end), null, '[)')
}

function visibleEvents(day: any) {
    if (state.expandedDays.includes(day.date)) return day.events
    return day.events.slice(0, 3)
}

function isOverdue(event: any) {
    if (!event || event.completion_status === 'completed') return false
    return !isNow(event) && moment(event.date_time_end).isBefore(moment())
}

const monthCount = computed(() => {
    if (!props.myCalendarEvents?.data) return 0
    return props.myCalendarEvents.data.filter((e: any) =>
        moment(e.date_time_start).month() === state.currentMonth
        && moment(e.date_time_start).year() === state.currentYear).length
})

function placePreview(anchorX: number, anchorY: number, event: any) {
    const margin = 12
    const width = 256
    const height = 180
    let x = anchorX + margin
    if (x + width > window.innerWidth) x = anchorX - width - margin
    if (x < margin) x = margin
    let y = anchorY + margin
    if (y + height > window.innerHeight) y = Math.max(margin, window.innerHeight - height - margin)
    state.preview = { event, x, y }
}

function showPreview(e: MouseEvent, event: any) {
    placePreview(e.clientX, e.clientY, event)
}

function showPreviewEl(e: FocusEvent, event: any) {
    const r = (e.target as HTMLElement).getBoundingClientRect()
    placePreview(r.left, r.bottom, event)
}

function hidePreview() {
    state.preview.event = null
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

function isWithinRange(dateStr: string, start: string, end: string) {
    const date = moment(dateStr)
    const startDate = moment(start)
    const endDate = moment(end)

    return date.isBetween(startDate, endDate, 'day', '[]')
}

const month = computed(() => {
    const date = moment([state.currentYear, state.currentMonth])
    return date.format('MMMM')
})

const year = computed(() => {
    const date = moment([state.currentYear, state.currentMonth])
    return date.format('YYYY')
})

function viewMyCalendarEvent(myCalendarEvent: any) {
    emit('viewMyCalendarEvent', myCalendarEvent)
}

function markEventAsStatus(myCalendarEvent: any, status: 'completed' | 'not_completed') {
    emit('markEventAsStatus', myCalendarEvent, status)
}

function openCreateJournal(myCalendarEvent: any) {
    emit('createJournalFromEvent', myCalendarEvent)
}
</script>
