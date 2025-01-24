<template>
    <div class="flex h-full flex-col">
        <header class="flex flex-none items-center justify-between border-b border-gray-200 py-4">
            <h3 class="text-base font-semibold leading-6 text-gray-900">
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
            <div class="flex items-center">
                <div class="relative flex items-center rounded-md bg-white shadow-sm md:items-stretch">
                    <button @click="previousWeek" type="button"
                        class="flex h-9 w-12 items-center justify-center rounded-l-md border-y border-l border-gray-300 pr-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pr-0 md:hover:bg-gray-50">
                        <span class="sr-only">Previous week</span>
                        <Icon name="heroicons:chevron-left" class="h-5 w-5" aria-hidden="true" />
                    </button>
                    <button @click="setToday" type="button"
                        class="hidden border-y border-gray-300 px-3.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:relative md:block">
                        {{ $t('calendar.today') }}
                    </button>
                    <span class="relative -mx-px h-5 w-px bg-gray-300 md:hidden" />
                    <button @click="nextWeek" type="button"
                        class="flex h-9 w-12 items-center justify-center rounded-r-md border-y border-r border-gray-300 pl-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pl-0 md:hover:bg-gray-50">
                        <span class="sr-only">Next week</span>
                        <Icon name="heroicons:chevron-right" class="h-5 w-5" aria-hidden="true" />
                    </button>
                </div>
            </div>
        </header>
        <div class="isolate flex flex-auto flex-col overflow-auto bg-white">
            <div style="width: 165%" class="flex max-w-full flex-none flex-col sm:max-w-none md:max-w-full">
                <div class="sticky top-0 z-30 flex-none bg-white shadow ring-1 ring-black ring-opacity-5 sm:pr-8">
                    <div class="grid grid-cols-7 text-sm leading-6 text-gray-500 sm:hidden">
                        <button v-for="day in weekDays" :key="day.date" type="button"
                            class="flex flex-col items-center pb-3 pt-2" @click="setSelectedDay(day)">
                            <span v-if="day.longName === 'Mon'">
                                {{ $t('calendar.week.oneLetter.Monday') }}
                            </span>
                            <span v-if="day.longName === 'Tue'">
                                {{ $t('calendar.week.oneLetter.Tuesday') }}
                            </span>
                            <span v-if="day.longName === 'Wed'">
                                {{ $t('calendar.week.oneLetter.Wednesday') }}
                            </span>
                            <span v-if="day.longName === 'Thu'">
                                {{ $t('calendar.week.oneLetter.Thursday') }}
                            </span>
                            <span v-if="day.longName === 'Fri'">
                                {{ $t('calendar.week.oneLetter.Friday') }}
                            </span>
                            <span v-if="day.longName === 'Sat'">
                                {{ $t('calendar.week.oneLetter.Saturday') }}
                            </span>
                            <span v-if="day.longName === 'Sun'">
                                {{ $t('calendar.week.oneLetter.Sunday') }}
                            </span>
                            <span
                                :class="moment(selectedDay).format('YYYY-MM-DD') === moment(day.fullDate).format('YYYY-MM-DD') ? 'mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-tertiary font-semibold text-white' : 'mt-1 flex h-8 w-8 items-center justify-center font-semibold text-gray-900'">
                                {{ day.date }}
                            </span>
                        </button>
                    </div>

                    <div
                        class="-mr-px hidden grid-cols-7 divide-x divide-gray-100 border-r border-gray-100 text-sm leading-6 text-gray-500 sm:grid">
                        <div class="col-end-1 w-14" />
                        <div v-for="day in weekDays" :key="day.date" class="flex items-center justify-center py-3">
                            <span class="flex gap-x-1">
                                <span v-if="day.longName === 'Mon'">
                                    {{ $t('calendar.week.short.Monday') }}
                                </span>
                                <span v-if="day.longName === 'Tue'">
                                    {{ $t('calendar.week.short.Tuesday') }}
                                </span>
                                <span v-if="day.longName === 'Wed'">
                                    {{ $t('calendar.week.short.Wednesday') }}
                                </span>
                                <span v-if="day.longName === 'Thu'">
                                    {{ $t('calendar.week.short.Thursday') }}
                                </span>
                                <span v-if="day.longName === 'Fri'">
                                    {{ $t('calendar.week.short.Friday') }}
                                </span>
                                <span v-if="day.longName === 'Sat'">
                                    {{ $t('calendar.week.short.Saturday') }}
                                </span>
                                <span v-if="day.longName === 'Sun'">
                                    {{ $t('calendar.week.short.Sunday') }}
                                </span>
                                <span class="items-center justify-center font-semibold text-gray-900">
                                    {{ day.date }}
                                </span>
                            </span>
                        </div>
                    </div>
                </div>
                <div class="hidden md:flex flex-auto">
                    <div class="sticky left-0 z-10 w-14 flex-none bg-white ring-1 ring-gray-100" />
                    <div class="grid flex-auto grid-cols-1 grid-rows-1">
                        <div class="col-start-1 col-end-2 row-start-1 grid divide-y divide-gray-100"
                            style="grid-template-rows: repeat(8, minmax(3.5rem, 1fr))">
                            <div class="row-end-1 h-7" />
                        </div>
                        <div
                            class="col-start-1 col-end-2 row-start-1 hidden grid-cols-7 grid-rows-1 divide-x divide-gray-100 sm:grid sm:grid-cols-7">
                            <div v-for="(events, index) in eventsByDay" :key="index" class="col-start-{{ index + 1 }}">
                                <div class="p-3 space-y-3">
                                    <div v-for="myCalendarEvent in events" :key="myCalendarEvent.id"
                                        class="bg-gray-200 p-2 rounded-md cursor-pointer"
                                        @click="viewMyCalendarEvent(myCalendarEvent)">
                                        <p class="text-xxs font-semibold">
                                            {{ myCalendarEvent?.title }}
                                        </p>
                                        <p class="text-xxs">
                                            {{ moment(myCalendarEvent.date_time_start).format('HH:mm') }} -
                                            {{ moment(myCalendarEvent.date_time_end).format('HH:mm') }}
                                        </p>
                                        <div class="text-gray-500 text-xxs">
                                            {{ $t('events.createdBy') }}
                                            {{ myCalendarEvent.creator?.firstname }}
                                            {{ myCalendarEvent.creator?.lastname }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-start-8 w-8" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <ol class="mt-4 divide-y divide-gray-100 text-sm leading-6 lg:col-span-7 xl:col-span-8 md:hidden"
            v-if=selectedDay>
            <li v-for="(event, index) in eventsBySelectedDay" :key="index"
                class="relative flex space-x-6 py-6 xl:static">
                <img :src="`https://ui-avatars.com/api/?background=42AED9&color=fff&name=${event?.user?.firstname + ' ' + event?.user?.lastname}`"
                    alt="Image" class="h-14 w-14 flex-none rounded-full" />
                <div class="flex-auto">
                    <h3 class="pr-10 font-semibold text-gray-900 xl:pr-0">
                        {{ event?.user?.firstname }}
                        {{ event?.user?.lastname }}
                    </h3>
                    <div class="flex items-center gap-x-2">
                        <dt class="flex items-center">
                            <span class="sr-only">Title</span>
                            <Icon name="ph:clipboard" class="h-4 w-4 text-gray-400" aria-hidden="true" />
                        </dt>
                        <dd class="font-semibold text-gray-900 xl:pr-0">
                            {{ event?.title }}
                        </dd>
                    </div>
                    <div class="flex gap-x-2">
                        <dt class="flex mt-1">
                            <span class="sr-only">Description</span>
                            <Icon name="heroicons:bars-3-bottom-left" class="h-4 w-4 text-gray-400"
                                aria-hidden="true" />
                        </dt>
                        <dd class="text-gray-900 xl:pr-0">
                            {{ event?.description }}
                        </dd>
                    </div>
                    <dl class="text-gray-500">
                        <div class="flex items-center space-x-3 text-xs">
                            <dt class="flex items-center">
                                <span class="sr-only">Date</span>
                                <Icon name="ph:calendar" class="h-4 w-4 text-gray-400" aria-hidden="true" />
                            </dt>
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
                <Menu as="div" class="absolute right-0 top-6 xl:relative xl:right-auto xl:top-auto xl:self-center">
                    <div>
                        <MenuButton class="-m-2 flex items-center rounded-full p-2 text-gray-500 hover:text-gray-600">
                            <span class="sr-only">Open options</span>
                            <Icon name="heroicons:ellipsis-horizontal" class="h-5 w-5" aria-hidden="true" />
                        </MenuButton>
                    </div>
                    <transition enter-active-class="transition ease-out duration-100"
                        enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100"
                        leave-active-class="transition ease-in duration-75"
                        leave-from-class="transform opacity-100 scale-100"
                        leave-to-class="transform opacity-0 scale-95">
                        <MenuItems
                            class="absolute right-0 z-10 mt-2 w-36 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div class="py-1">
                                <MenuItem v-slot="{ active }">
                                <a href="#"
                                    :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-sm']"
                                    @click="viewMyCalendarEvent(event)">
                                    {{ $t('citizens.calendar.viewSchedule') }}
                                </a>
                                </MenuItem>
                            </div>
                        </MenuItems>
                    </transition>
                </Menu>
            </li>
        </ol>
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
const emit = defineEmits(['changeDatePerWeek', 'viewMyCalendarEvent'])

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
    const endOfWeek = moment(currentDate.value).endOf('isoWeek')

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
    if (!props.myCalendarEvents?.data) return Array.from({ length: 7 }).map(() => [])

    const dayStart = moment(selectedDay.value).startOf('day')
    const dayEnd = moment(selectedDay.value).endOf('day')
    return props.myCalendarEvents.data.filter((event: any) => {
        const eventStart = moment(event.date_time_start)
        const eventEnd = moment(event.date_time_end)
        return isWithinRange(eventStart, eventEnd, dayStart, dayEnd)
    })
})
</script>
