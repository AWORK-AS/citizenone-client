<template>
    <div class="motion-safe:animate-fade-in flex h-full flex-col">
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
                <button @click="setToday" type="button"
                    class="rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-medium text-gray-600 shadow-sm hover:bg-gray-50 transition-colors">
                    {{ $t('calendar.today') }}
                </button>
                <div class="inline-flex items-center rounded-full border border-gray-200 bg-white shadow-sm">
                    <button @click="previousWeek" type="button"
                        class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-l-full text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors">
                        <span class="sr-only">Previous week</span>
                        <Icon name="heroicons:chevron-left" class="h-4 w-4" aria-hidden="true" />
                    </button>
                    <span class="h-4 w-px bg-gray-200"></span>
                    <button @click="nextWeek" type="button"
                        class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-r-full text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors">
                        <span class="sr-only">Next week</span>
                        <Icon name="heroicons:chevron-right" class="h-4 w-4" aria-hidden="true" />
                    </button>
                </div>
            </div>
        </header>

        <!-- Desktop: 7-day week grid -->
        <div class="hidden lg:block">
            <TimeGrid :days="timeGridDays" @eventClick="viewMyCalendarEvent" />
        </div>

        <!-- Mobile: agenda list -->
        <ol class="mt-4 divide-y divide-gray-100 text-sm leading-6 lg:hidden" v-if="selectedDay">
            <li v-for="(event, index) in eventsBySelectedDay" :key="index" class="group/event flex gap-x-3 py-4">
                <div class="w-14 flex-none pt-0.5 text-right">
                    <p class="text-[13px] font-semibold tabular-nums text-gray-900">
                        {{ moment(event.date_time_start).format('HH:mm') }}
                    </p>
                    <p class="text-[11px] tabular-nums text-gray-400">
                        {{ moment(event.date_time_end).format('HH:mm') }}
                    </p>
                </div>
                <span class="w-1 flex-none self-stretch rounded-full" :class="[
                    event?.type === 'employees' && 'bg-green-600',
                    event?.type === 'my_self' && 'bg-primary',
                    event?.type !== 'employees' && event?.type !== 'my_self' && 'bg-amber-500',
                ]"></span>
                <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-x-2">
                        <h4 class="truncate font-semibold text-gray-900"
                            :class="event?.completion_status === 'completed' && 'text-gray-400 line-through'">
                            {{ event?.title }}
                        </h4>
                        <span v-if="event?.completion_status === 'completed'"
                            class="inline-flex items-center gap-x-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-700">
                            <Icon name="ph:check-circle" class="h-3.5 w-3.5" />
                            {{ $t('events.completionStatistics.completed') }}
                        </span>
                        <span v-else-if="event?.completion_status === 'not_completed'"
                            class="inline-flex items-center gap-x-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700">
                            <Icon name="ph:x-circle" class="h-3.5 w-3.5" />
                            {{ $t('events.completionStatistics.notCompleted') }}
                        </span>
                    </div>
                    <p v-if="event?.description" class="mt-0.5 truncate text-sm text-gray-600">{{ event?.description }}</p>
                    <div v-if="event.calendar_tags?.length > 0" class="mt-1 flex flex-wrap gap-1">
                        <span v-for="(calendarTag, ti) in event.calendar_tags" :key="ti"
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
                                    @click="viewMyCalendarEvent(event)">
                                    <Icon name="ph:eye" class="h-4 w-4" />
                                    {{ $t('citizens.calendar.viewSchedule') }}
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
                                <MenuItem v-slot="{ active }">
                                <a href="#"
                                    :class="[active && 'bg-gray-100', 'text-gray-700', 'flex items-center gap-x-1.5 px-4 py-2 text-sm']"
                                    @click="openCreateJournal(event)">
                                    <Icon name="ph:notebook" class="h-4 w-4" />
                                    {{ $t('events.createJournalNote') }}
                                </a>
                                </MenuItem>
                            </div>
                        </MenuItems>
                    </transition>
                </Menu>
            </li>
            <li v-if="eventsBySelectedDay?.length < 1" class="py-10 text-center text-sm text-gray-400">
                {{ $t('events.noEventFound') }}
            </li>
        </ol>
    </div>
</template>


<script setup lang="ts">
import moment from 'moment'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { useI18n } from 'vue-i18n'
import TimeGrid from '@/components/modules/user/calendar/time-grid.vue'

const { t } = useI18n()
const DOW: Record<string, string> = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' }
const { formatDateTimeToReadable } = useDatetimeFormatter()
const props = defineProps({
    myCalendarEvents: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['changeDatePerWeek', 'viewMyCalendarEvent', 'markEventAsStatus', 'createJournalFromEvent', 'createEvent'])

const currentDate = ref(moment())
const selectedDay = ref(moment())

const previousWeek = () => {
    currentDate.value = moment(currentDate.value).subtract(1, 'week')
    const dateMoment = moment(currentDate.value)
    const startOfWeek = dateMoment.clone().startOf('isoWeek')
    const endOfWeek = dateMoment.clone().endOf('isoWeek')
    const startOfWeekFormatted = startOfWeek.format('YYYY-MM-DD')
    const endOfWeekFormatted = endOfWeek.format('YYYY-MM-DD')
    emit('changeDatePerWeek', [startOfWeekFormatted, endOfWeekFormatted])
}

const setToday = () => {
    currentDate.value = moment()
    const dateMoment = moment(currentDate.value)
    const startOfWeek = dateMoment.clone().startOf('isoWeek')
    const endOfWeek = dateMoment.clone().endOf('isoWeek')
    const startOfWeekFormatted = startOfWeek.format('YYYY-MM-DD')
    const endOfWeekFormatted = endOfWeek.format('YYYY-MM-DD')
    emit('changeDatePerWeek', [startOfWeekFormatted, endOfWeekFormatted])
}

const nextWeek = () => {
    currentDate.value = moment(currentDate.value).add(1, 'week')
    const dateMoment = moment(currentDate.value)
    const startOfWeek = dateMoment.clone().startOf('isoWeek')
    const endOfWeek = dateMoment.clone().endOf('isoWeek')
    const startOfWeekFormatted = startOfWeek.format('YYYY-MM-DD')
    const endOfWeekFormatted = endOfWeek.format('YYYY-MM-DD')
    emit('changeDatePerWeek', [startOfWeekFormatted, endOfWeekFormatted])
}

function viewMyCalendarEvent(myCalendarEvent: any) {
    emit('viewMyCalendarEvent', myCalendarEvent)
}

function markEventAsStatus(myCalendarEvent: any, status: 'completed' | 'not_completed') {
    emit('markEventAsStatus', myCalendarEvent, status)
}

function openCreateJournal(myCalendarEvent: any) {
    emit('createJournalFromEvent', myCalendarEvent)
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
    if (!event || event.completion_status === 'completed') return false
    return !isNow(event) && moment(event.date_time_end).isBefore(moment())
}

const weekCount = computed(() => eventsByDay.value.reduce((sum: number, day: any) => sum + day.length, 0))

const timeGridDays = computed(() => weekDays.value.map((d: any, i: number) => ({
    date: moment(d.fullDate).format('YYYY-MM-DD'),
    fullDate: d.fullDate,
    isToday: isToday(d.fullDate),
    weekdayLabel: t(`calendar.week.short.${DOW[d.longName]}`),
    dayNumber: d.date,
    events: eventsByDay.value[i] || [],
})))

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

function setSelectedDay(day: any) {
    selectedDay.value = day.fullDate
    const dateMoment = moment(currentDate.value)
    const startOfWeek = dateMoment.clone().startOf('isoWeek')
    const endOfWeek = dateMoment.clone().endOf('isoWeek')
    const startOfWeekFormatted = startOfWeek.format('YYYY-MM-DD')
    const endOfWeekFormatted = endOfWeek.format('YYYY-MM-DD')
    emit('changeDatePerWeek', [startOfWeekFormatted, endOfWeekFormatted])
    emit('createEvent', moment(day.fullDate).format('YYYY-MM-DD'))
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

const eventsBySelectedDay = computed(() => {
    if (!props.myCalendarEvents?.data) return []

    const dayStart = moment(selectedDay.value).startOf('day')
    const dayEnd = moment(selectedDay.value).endOf('day')
    return props.myCalendarEvents.data.filter((event: any) => {
        const eventStart = moment(event.date_time_start)
        const eventEnd = moment(event.date_time_end)
        return isWithinRange(eventStart, eventEnd, dayStart, dayEnd)
    })
})
</script>
