<template>
    <div class="lg:flex lg:h-full lg:flex-col">
        <header class="flex items-center justify-between border-b border-gray-200 py-4 lg:flex-none">
            <h1 class="text-base font-semibold leading-6 text-gray-900">
                <time :datetime="currentYearMonth">{{ currentMonthYear }}</time>
            </h1>
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
                    <div v-for="(day, index) in days" :key="index"
                        :class="[day.isCurrentMonth ? 'bg-white' : 'min-h-20 bg-gray-50 text-gray-500', 'relative px-3 py-2']">
                        <time :datetime="day.date"
                            :class="day.isToday ? 'flex h-6 w-6 items-center justify-center rounded-full bg-tertiary font-semibold text-white' : undefined">
                            {{ day.date.split('-').pop().replace(/^0/, '') }}
                        </time>
                        <ol v-if="day.events.length > 0" class="mt-2">
                            <li v-for="event in day.events" :key="event.id">
                                <a :href="event.href" class="group flex">
                                    <p class="flex-auto truncate font-medium text-gray-900 group-hover:text-tertiary">
                                        {{ event.user.firstname }}
                                        {{ event.user.lastname }}
                                    </p>
                                    <time :datetime="event.datetime"
                                        class="ml-3 hidden flex-none text-gray-500 group-hover:text-tertiary xl:block">
                                        {{ event.time_start }} - {{ event.time_end }}
                                    </time>
                                </a>
                            </li>
                            <!-- <li v-if="day.events.length > 2" class="text-gray-500">
                                + {{ day.events.length - 2 }} more
                            </li> -->
                        </ol>
                    </div>
                </div>
                <div class="isolate grid w-full grid-cols-7 grid-rows-6 gap-px lg:hidden">
                    <button v-for="(day, index) in days" :key="index" type="button" :class="[
                        day.isCurrentMonth ? 'bg-white' : 'bg-gray-50',
                        (day.isSelected || day.isToday) && 'font-semibold',
                        day.isSelected && 'text-white',
                        !day.isSelected && day.isToday && 'text-tertiary',
                        !day.isSelected && day.isCurrentMonth && !day.isToday && 'text-gray-900',
                        !day.isSelected && !day.isCurrentMonth && !day.isToday && 'text-gray-500',
                        'flex h-14 flex-col px-3 py-2 hover:bg-gray-100 focus:z-10'
                    ]">
                        <time :datetime="day.date" :class="[
                            day.isSelected && 'flex h-6 w-6 items-center justify-center rounded-full',
                            day.isSelected && day.isToday && 'bg-tertiary',
                            day.isSelected && !day.isToday && 'bg-gray-900',
                            'ml-auto'
                        ]">
                            {{ day.date.split('-').pop().replace(/^0/, '') }}
                        </time>
                        <span class="sr-only">{{ day.events.length }} events</span>
                        <span v-if="day.events.length > 0" class="-mx-0.5 mt-auto flex flex-wrap-reverse">
                            <span v-for="event in day.events" :key="event.id"
                                class="mx-0.5 mb-1 h-1.5 w-1.5 rounded-full bg-gray-400" />
                        </span>
                    </button>
                </div>
            </div>
        </div>
        <div v-if="selectedDay?.events.length > 0" class="px-4 py-10 sm:px-6 lg:hidden">
            <ol
                class="divide-y divide-gray-100 overflow-hidden rounded-lg bg-white text-sm shadow ring-1 ring-black ring-opacity-5">
                <li v-for="event in selectedDay.events" :key="event.id"
                    class="group flex p-4 pr-6 focus-within:bg-gray-50 hover:bg-gray-50">
                    <div class="flex-auto">
                        <p class="font-semibold text-gray-900">{{ event.name }}</p>
                        <time :datetime="event.datetime" class="mt-2 flex items-center text-gray-700">
                            <Icon name="ph:clock" class="mr-2 h-5 w-5 text-gray-400" aria-hidden="true" />
                            {{ event.time }}
                        </time>
                    </div>
                    <a :href="event.href"
                        class="ml-6 flex-none self-center rounded-md bg-white px-3 py-2 font-semibold text-gray-900 opacity-0 shadow-sm ring-1 ring-inset ring-gray-300 hover:ring-gray-400 focus:opacity-100 group-hover:opacity-100">Edit<span
                            class="sr-only">, {{ event.name }}</span></a>
                </li>
            </ol>
        </div>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'

const props = defineProps({
    dutySchedules: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(['changeMonthYear', 'editDutySchedule'])

const today = new Date()
const currentMonth = ref(today.getMonth())
const currentYear = ref(today.getFullYear())

const days = ref(generateDays(currentYear.value, currentMonth.value, props.dutySchedules))
const selectedDay = ref(days.value.find((day: any) => day.isSelected))

watch(() => props.dutySchedules, (newValue: any) => {
    if (newValue != null) {
        updateDays()
    }
})

function previousMonth() {
    if (currentMonth.value === 0) {
        currentMonth.value = 11
        currentYear.value -= 1
    } else {
        currentMonth.value -= 1
    }
    updateDays()
    emit('changeMonthYear', currentYear.value, currentMonth.value)
}

function setToday() {
    currentMonth.value = today.getMonth()
    currentYear.value = today.getFullYear()
    updateDays()
    emit('changeMonthYear', currentYear.value, currentMonth.value)
}

function nextMonth() {
    if (currentMonth.value === 11) {
        currentMonth.value = 0
        currentYear.value += 1
    } else {
        currentMonth.value += 1
    }
    updateDays()
    emit('changeMonthYear', currentYear.value, currentMonth.value)
}

function updateDays() {
    days.value = generateDays(currentYear.value, currentMonth.value, props.dutySchedules)
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
            isToday: isToday(day),
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
    const today = new Date()
    return day.getFullYear() === today.getFullYear() && day.getMonth() === today.getMonth() && day.getDate() === today.getDate()
}

function isWithinRange(dateStr: string, start: string, end: string) {
    const date = new Date(dateStr)
    const startDate = new Date(start)
    const endDate = new Date(end)
    return date >= startDate && date <= endDate
}

const currentMonthYear = computed(() => {
    const date = new Date(currentYear.value, currentMonth.value)
    return date.toLocaleString('default', { month: 'long', year: 'numeric' })
})

const currentYearMonth = computed(() => `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}`)

</script>
