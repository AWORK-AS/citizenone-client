<template>
    <div class="lg:flex lg:h-full lg:flex-col">
        <header class="flex items-center justify-between border-b border-gray-200 py-4 lg:flex-none">
            <h3 class="text-base font-semibold leading-6 text-gray-900">
                {{ currentMonthYear }}
            </h3>
            <div class="flex items-center">
                <div class="relative flex items-center rounded-md bg-white shadow-sm md:items-stretch">
                    <button type="button" @click="previousMonth"
                        class="flex h-9 w-12 items-center justify-center rounded-l-md border-y border-l border-gray-300 pr-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pr-0 md:hover:bg-gray-50">
                        <span class="sr-only">Previous month</span>
                        <Icon name="heroicons:chevron-left" class="h-5 w-5" aria-hidden="true" />
                    </button>
                    <button type="button" @click="setToday"
                        class="hidden border-y border-gray-300 px-3.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:relative md:block">
                        Today
                    </button>
                    <span class="relative -mx-px h-5 w-px bg-gray-300 md:hidden" />
                    <button type="button" @click="nextMonth"
                        class="flex h-9 w-12 items-center justify-center rounded-r-md border-y border-r border-gray-300 pl-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pl-0 md:hover:bg-gray-50">
                        <span class="sr-only">Next month</span>
                        <Icon name="heroicons:chevron-right" class="h-5 w-5" aria-hidden="true" />
                    </button>
                </div>
            </div>
        </header>
        <div class="shadow ring-1 ring-black ring-opacity-5 lg:flex lg:flex-auto lg:flex-col">
            <div
                class="grid grid-cols-7 gap-px border-b border-gray-300 bg-gray-200 text-center text-xs font-semibold leading-6 text-gray-700 lg:flex-none">
                <div class="bg-white py-2">S<span class="sr-only sm:not-sr-only">un</span></div>
                <div class="bg-white py-2">M<span class="sr-only sm:not-sr-only">on</span></div>
                <div class="bg-white py-2">T<span class="sr-only sm:not-sr-only">ue</span></div>
                <div class="bg-white py-2">W<span class="sr-only sm:not-sr-only">ed</span></div>
                <div class="bg-white py-2">T<span class="sr-only sm:not-sr-only">hu</span></div>
                <div class="bg-white py-2">F<span class="sr-only sm:not-sr-only">ri</span></div>
                <div class="bg-white py-2">S<span class="sr-only sm:not-sr-only">at</span></div>
            </div>
            <div class="flex bg-gray-200 text-xs leading-6 text-gray-700 lg:flex-auto">
                <div class="hidden w-full lg:grid lg:grid-cols-7 lg:grid-rows-6 lg:gap-px">
                    <div v-for="(day, index) in state.days" :key="index"
                        :class="[day.isCurrentMonth ? 'bg-white' : 'min-h-20 bg-gray-50 text-gray-500', 'relative px-3 py-2']">
                        <time :datetime="day.date"
                            :class="day.isToday ? 'flex h-6 w-6 items-center justify-center rounded-full bg-tertiary font-semibold text-white' : undefined">
                            {{ day.date?.split('-').pop()?.replace(/^0/, '') }}
                        </time>
                        <ol v-if="day.events.length > 0" class="mt-2">
                            <li v-for="(dutySchedule, index) in day.events" :key="index">
                                <div class="group flex cursor-pointer" @click="editDutySchedule(dutySchedule)">
                                    <p class="flex-auto truncate font-medium text-gray-900 group-hover:text-tertiary">
                                        {{ dutySchedule.user.firstname }}
                                        {{ dutySchedule.user.lastname }}
                                    </p>
                                    <p class="ml-3 hidden flex-none text-gray-500 group-hover:text-tertiary xl:block">
                                        {{ dutySchedule.time_start }} - {{ dutySchedule.time_end }}
                                    </p>
                                </div>
                            </li>
                        </ol>
                    </div>
                </div>
                <div class="isolate grid w-full grid-cols-7 grid-rows-6 gap-px lg:hidden">
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
                            day.isSelected && 'flex h-6 w-6 items-center justify-center rounded-full',
                            day.isSelected && day.isToday && 'bg-tertiary',
                            day.isSelected && !day.isToday && 'bg-tertiary',
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
        <ol class="mt-4 divide-y divide-gray-100 text-sm leading-6 lg:col-span-7 xl:col-span-8" v-if=state.selectedDay>
            <li v-for="(dutySchedule, index) in state.days.find(day => day.date === state.selectedDay?.date)?.events || []"
                :key="index" class="relative flex space-x-6 py-6 xl:static">
                <img :src="`https://ui-avatars.com/api/?background=42AED9&color=fff&name=${dutySchedule?.user?.firstname + ' ' + dutySchedule?.user?.lastname}`"
                    alt="Image" class="h-14 w-14 flex-none rounded-full" />
                <div class="flex-auto">
                    <h3 class="pr-10 font-semibold text-gray-900 xl:pr-0">
                        {{ dutySchedule?.user?.firstname }}
                        {{ dutySchedule?.user?.lastname }}
                    </h3>
                    <div class="flex items-center gap-x-2">
                        <dt class="flex items-center">
                            <span class="sr-only">Title</span>
                            <Icon name="ph:clipboard" class="h-4 w-4 text-gray-400" aria-hidden="true" />
                        </dt>
                        <dd class="font-semibold text-gray-900 xl:pr-0">
                            {{ dutySchedule?.title }}
                        </dd>
                    </div>
                    <div class="flex gap-x-2">
                        <dt class="flex mt-1">
                            <span class="sr-only">Description</span>
                            <Icon name="heroicons:bars-3-bottom-left" class="h-4 w-4 text-gray-400"
                                aria-hidden="true" />
                        </dt>
                        <dd class="text-gray-900 xl:pr-0">
                            {{ dutySchedule?.description }}
                        </dd>
                    </div>
                    <dl class="text-gray-500">
                        <div class="flex items-center space-x-3 text-xs">
                            <dt class="flex items-center">
                                <span class="sr-only">Date</span>
                                <Icon name="ph:calendar" class="h-4 w-4 text-gray-400" aria-hidden="true" />
                            </dt>
                            <dd>
                                <time :datetime="dutySchedule.datetime">
                                    {{ formatDateTimeToReadable(dutySchedule.date_time_start) }}
                                    -
                                    {{ formatDateTimeToReadable(dutySchedule.date_time_end) }}
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
                                    @click="editDutySchedule(dutySchedule)">
                                    Edit
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
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'

const props = defineProps({
    dutySchedules: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(['changeMonthYear', 'editDutySchedule'])

const today = new Date()

const state = reactive({
    currentMonth: today.getMonth(),
    currentYear: today.getFullYear(),
    days: generateDays(today.getFullYear(), today.getMonth(), props.dutySchedules),
    selectedDay: null,
})

watch(() => props.dutySchedules, (newValue: any) => {
    if (newValue != null) {
        updateDays()
    }
})

function setSelectedDay(day: any) {
    state.selectedDay = day
    state.days.forEach(d => d.isSelected = d.date === day.date)
}

function previousMonth() {
    if (state.currentMonth === 0) {
        state.currentMonth = 11
        state.currentYear -= 1
    } else {
        state.currentMonth -= 1
    }
    updateDays()
    emit('changeMonthYear', state.currentYear, state.currentMonth)
}

function setToday() {
    state.currentMonth = today.getMonth()
    state.currentYear = today.getFullYear()
    updateDays()
    emit('changeMonthYear', state.currentYear, state.currentMonth)
}

function nextMonth() {
    if (state.currentMonth === 11) {
        state.currentMonth = 0
        state.currentYear += 1
    } else {
        state.currentMonth += 1
    }
    updateDays()
    emit('changeMonthYear', state.currentYear, state.currentMonth)
}

function updateDays() {
    state.days = generateDays(state.currentYear, state.currentMonth, props.dutySchedules)
}

function generateDays(year: any, month: any, dutySchedules: any) {
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0)

    const startDay = (startDate.getDay() + 6) % 7 // Adjust to make Sunday the first day of the week
    const endDay = endDate.getDate()

    const daysArray = []

    // Fill previous month's days
    for (let i = startDay - 1; i >= 0; i--) {
        const day = new Date(startDate)
        day.setDate(day.getDate() - (i + 1))
        daysArray.push({
            date: day.toISOString().split('T')[0], events: []
        })
    }

    // Fill current month's days
    for (let i = 1; i <= endDay; i++) {
        const day = new Date(year, month, i)
        const dateStr = day.toISOString().split('T')[0]
        daysArray.push({
            date: dateStr,
            isCurrentMonth: true,
            isSelected: false,
            isToday: isToday(dateStr),
            events: dutySchedules?.data?.filter((event: any) => isWithinRange(dateStr, event.date_time_start, event.date_time_end)).map((event: any) => ({
                ...event,
                time_start: moment(event.date_time_start).format('HH:mm'),
                time_end: moment(event.date_time_end).format('HH:mm'),
            })) || [],
        })
    }

    // Fill next month's days
    const remainingDays = 42 - daysArray.length
    for (let i = 1; i <= remainingDays; i++) {
        const day = new Date(year, month + 1, i)
        daysArray.push({ date: day.toISOString().split('T')[0], events: [] })
    }

    return daysArray
}

function isToday(day: any) {
    return moment().format('YYYY-MM-DD') === moment(day).format('YYYY-MM-DD')
}

function isWithinRange(dateStr: string, start: string, end: string) {
    const date = new Date(dateStr)
    const startDate = new Date(start)
    const endDate = new Date(end)

    // Normalize the dates to midnight to compare dates without time
    startDate.setHours(0, 0, 0, 0)
    endDate.setHours(23, 59, 59, 999)

    return date >= startDate && date <= endDate
}

const currentMonthYear = computed(() => {
    const date = new Date(state.currentYear, state.currentMonth)
    return date.toLocaleString('default', { month: 'long', year: 'numeric' })
})

function editDutySchedule(dutySchedule: any) {
    emit('editDutySchedule', dutySchedule)
}

function formatDateTimeToReadable(datetime: string) {
    return moment(datetime).format('DD. MMM YYYY HH:mm')
}
</script>
