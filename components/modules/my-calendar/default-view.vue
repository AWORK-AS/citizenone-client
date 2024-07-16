<template>
    <div>
        <div class="lg:grid lg:grid-cols-12 lg:gap-x-16">
            <div class="py-4 lg:col-start-8 lg:col-end-13 lg:row-start-1 lg:mt-9 xl:col-start-9">
                <div class="flex items-center justify-between">
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
                    <div class="relative flex items-center rounded-md bg-white shadow-sm md:items-stretch">
                        <button type="button" @click="previousMonth"
                            class="flex h-9 w-12 items-center justify-center rounded-l-md border-y border-l border-gray-300 pr-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pr-0 md:hover:bg-gray-50">
                            <span class="sr-only">Previous month</span>
                            <Icon name="heroicons:chevron-left" class="h-5 w-5" aria-hidden="true" />
                        </button>
                        <button type="button" @click="setToday"
                            class="hidden border-y border-gray-300 px-3.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:relative md:block">
                            {{ $t('calendar.today') }}
                        </button>
                        <span class="relative -mx-px h-5 w-px bg-gray-300 md:hidden" />
                        <button type="button" @click="nextMonth"
                            class="flex h-9 w-12 items-center justify-center rounded-r-md border-y border-r border-gray-300 pl-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pl-0 md:hover:bg-gray-50">
                            <span class="sr-only">Next month</span>
                            <Icon name="heroicons:chevron-right" class="h-5 w-5" aria-hidden="true" />
                        </button>
                    </div>
                </div>
                <div class="mt-6 grid grid-cols-7 text-xs leading-6 text-gray-500">
                    <div class="text-center">{{ $t('calendar.week.oneLetter.Monday') }}</div>
                    <div class="text-center">{{ $t('calendar.week.oneLetter.Tuesday') }}</div>
                    <div class="text-center">{{ $t('calendar.week.oneLetter.Wednesday') }}</div>
                    <div class="text-center">{{ $t('calendar.week.oneLetter.Thursday') }}</div>
                    <div class="text-center">{{ $t('calendar.week.oneLetter.Friday') }}</div>
                    <div class="text-center">{{ $t('calendar.week.oneLetter.Saturday') }}</div>
                    <div class="text-center">{{ $t('calendar.week.oneLetter.Sunday') }}</div>
                </div>
                <div class="mt-2 grid grid-cols-7 text-sm">
                    <div v-for="(day, dayIdx) in days" :key="day.date"
                        :class="[dayIdx > 6 && 'border-t border-gray-200', 'py-2']" @click="selectDay(day)">
                        <button type="button" :class="[
                            day.isSelected && 'text-white',
                            !day.isSelected && day.isToday && 'text-tertiary',
                            !day.isSelected && !day.isToday && day.isCurrentMonth && 'text-gray-900',
                            !day.isSelected && !day.isToday && !day.isCurrentMonth && 'text-gray-400',
                            day.isSelected && day.isToday && 'bg-tertiary',
                            day.isSelected && !day.isToday && 'bg-tertiary',
                            !day.isSelected && 'hover:bg-gray-200',
                            (day.isSelected || day.isToday) && 'font-semibold',
                            'mx-auto flex h-8 w-8 items-center justify-center rounded-full'
                        ]">
                            <time :datetime="day.date">{{ day.date.split('-').pop().replace(/^0/, '') }}</time>
                        </button>
                    </div>
                </div>
            </div>
            <ol class="mt-4 divide-y divide-gray-100 text-sm leading-6 lg:col-span-7 xl:col-span-8">
                <p v-if="props.myCalendarEvents?.data?.length < 1" class="text-center py-28">
                    {{ $t('schedules.noEventFound') }}
                </p>
                <li v-for="(myCalendarEvent, index) in props.myCalendarEvents?.data" :key="index"
                    class="relative flex space-x-6 py-6 xl:static">
                    <img :src="`https://ui-avatars.com/api/?background=42AED9&color=fff&name=${myCalendarEvent?.user?.firstname + ' ' + myCalendarEvent?.user?.lastname}`"
                        alt="Image" class="h-14 w-14 flex-none rounded-full" />
                    <div class="flex-auto">
                        <h3 class="pr-10 font-semibold text-gray-900 xl:pr-0">
                            {{ myCalendarEvent?.user?.firstname }}
                            {{ myCalendarEvent?.user?.lastname }}
                        </h3>
                        <div class="flex items-center gap-x-2">
                            <dt class="flex items-center">
                                <span class="sr-only">Title</span>
                                <Icon name="ph:clipboard" class="h-4 w-4 text-gray-400" aria-hidden="true" />
                            </dt>
                            <dd class="font-semibold text-gray-900 xl:pr-0">
                                {{ myCalendarEvent?.title }}
                            </dd>
                        </div>
                        <div class="flex gap-x-2">
                            <dt class="flex mt-1">
                                <span class="sr-only">Description</span>
                                <Icon name="heroicons:bars-3-bottom-left" class="h-4 w-4 text-gray-400"
                                    aria-hidden="true" />
                            </dt>
                            <dd class="text-gray-900 xl:pr-0">
                                {{ myCalendarEvent?.description }}
                            </dd>
                        </div>
                        <dl class="text-gray-500">
                            <div class="flex items-center space-x-3 text-xs">
                                <dt class="flex items-center">
                                    <span class="sr-only">Date</span>
                                    <Icon name="ph:calendar" class="h-4 w-4 text-gray-400" aria-hidden="true" />
                                </dt>
                                <dd>
                                    <time :datetime="myCalendarEvent.datetime">
                                        {{ formatDateTimeToReadable(myCalendarEvent.date_time_start) }}
                                        -
                                        {{ formatDateTimeToReadable(myCalendarEvent.date_time_end) }}
                                    </time>
                                </dd>
                            </div>
                        </dl>
                    </div>
                    <Menu as="div" class="absolute right-0 top-6 xl:relative xl:right-auto xl:top-auto xl:self-center">
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
                                class="absolute right-0 z-10 mt-2 w-36 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <div class="py-1">
                                    <MenuItem v-slot="{ active }">
                                    <a href="#"
                                        :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-sm']"
                                        @click="editMyCalendarEvent(myCalendarEvent)">
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
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'

const props = defineProps({
    myCalendarEvents: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['changeDate', 'editMyCalendarEvent'])

const currentMonth = ref(moment().startOf('month'))
const month = ref(currentMonth.value.format('MMMM'))
const year = ref(currentMonth.value.format('YYYY'))
const days = ref(generateDays(currentMonth.value))

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
}

function setToday() {
    const today = moment()
    currentMonth.value = today.clone().startOf('month')
    month.value = currentMonth.value.format('MMMM')
    year.value = currentMonth.value.format('YYYY')
    days.value = generateDays(currentMonth.value)
    selectDay({ date: today.format('YYYY-MM-DD') })
}

function nextMonth() {
    currentMonth.value = currentMonth.value.clone().add(1, 'month')
    month.value = currentMonth.value.format('MMMM')
    year.value = currentMonth.value.format('YYYY')
    days.value = generateDays(currentMonth.value)
}

function selectDay(selectedDay: any) {
    days.value = days.value.map(day => ({
        ...day,
        isSelected: day.date === selectedDay.date,
    }))
    emit('changeDate', selectedDay.date)
}

function editMyCalendarEvent(myCalendarEvent: any) {
    emit('editMyCalendarEvent', myCalendarEvent)
}

function formatDateTimeToReadable(datetime: string) {
    return moment(datetime).format('DD. MMM YYYY HH:mm')
}
</script>
