<template>
    <div>
        <div class="lg:grid lg:grid-cols-12 lg:gap-x-16">
            <div class="mt-10 text-center lg:col-start-8 lg:col-end-13 lg:row-start-1 lg:mt-9 xl:col-start-9">
                <div class="flex items-center text-gray-900">
                    <button type="button" @click="previousMonth"
                        class="-m-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500">
                        <span class="sr-only">Previous month</span>
                        <Icon name="heroicons:chevron-left" class="h-5 w-5" aria-hidden="true" />
                    </button>
                    <div class="flex-auto text-sm font-semibold">{{ currentMonthLabel }}</div>
                    <button type="button" @click="nextMonth"
                        class="-m-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500">
                        <span class="sr-only">Next month</span>
                        <Icon name="heroicons:chevron-right" class="h-5 w-5" aria-hidden="true" />
                    </button>
                </div>
                <div class="mt-6 grid grid-cols-7 text-xs leading-6 text-gray-500">
                    <div>S</div>
                    <div>M</div>
                    <div>T</div>
                    <div>W</div>
                    <div>T</div>
                    <div>F</div>
                    <div>S</div>
                </div>
                <div
                    class="isolate mt-2 grid grid-cols-7 gap-px rounded-lg bg-gray-200 text-sm shadow ring-1 ring-gray-200">
                    <button v-for="(day, dayIdx) in days" :key="day.date" type="button"
                        :class="['py-1.5 hover:bg-gray-100 focus:z-10', day.isCurrentMonth ? 'bg-white' : 'bg-gray-50', (day.isSelected || day.isToday) && 'font-semibold', day.isSelected && 'text-white', !day.isSelected && day.isCurrentMonth && !day.isToday && 'text-gray-900', !day.isSelected && !day.isCurrentMonth && !day.isToday && 'text-gray-400', day.isToday && !day.isSelected && 'text-indigo-600', dayIdx === 0 && 'rounded-tl-lg', dayIdx === 6 && 'rounded-tr-lg', dayIdx === days.length - 7 && 'rounded-bl-lg', dayIdx === days.length - 1 && 'rounded-br-lg']">
                        <time :datetime="day.date"
                            :class="['mx-auto flex h-7 w-7 items-center justify-center rounded-full', day.isSelected && day.isToday && 'bg-indigo-600', day.isSelected && !day.isToday && 'bg-gray-900']">{{
                                day.date.split('-').pop().replace(/^0/, '') }}</time>
                    </button>
                </div>
                <button type="button"
                    class="mt-8 w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Add
                    event
                </button>
            </div>
            <ol class="mt-4 divide-y divide-gray-100 text-sm leading-6 lg:col-span-7 xl:col-span-8">
                <li v-for="meeting in meetings" :key="meeting.id" class="relative flex space-x-6 py-6 xl:static">
                    <img :src="meeting.imageUrl" alt="" class="h-14 w-14 flex-none rounded-full" />
                    <div class="flex-auto">
                        <h3 class="pr-10 font-semibold text-gray-900 xl:pr-0">{{ meeting.name }}</h3>
                        <dl class="mt-2 flex flex-col text-gray-500 xl:flex-row">
                            <div class="flex items-start space-x-3">
                                <dt class="mt-0.5">
                                    <span class="sr-only">Date</span>
                                    <Icon name="ph:calendar" class="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </dt>
                                <dd>
                                    <time :datetime="meeting.datetime">{{ meeting.date }} at {{ meeting.time }}</time>
                                </dd>
                            </div>
                            <div
                                class="mt-2 flex items-start space-x-3 xl:ml-3.5 xl:mt-0 xl:border-l xl:border-gray-400 xl:border-opacity-50 xl:pl-3.5">
                                <dt class="mt-0.5">
                                    <span class="sr-only">Location</span>
                                    <Icon name="heroicons:map-pin" class="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </dt>
                                <dd>{{ meeting.location }}</dd>
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
                                        :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-sm']">Edit</a>
                                    </MenuItem>
                                    <MenuItem v-slot="{ active }">
                                    <a href="#"
                                        :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-sm']">Cancel</a>
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

<script setup>
import { ref } from 'vue'
import moment from 'moment'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'

const currentMonth = ref(moment().startOf('month'))
const currentMonthLabel = ref(currentMonth.value.format('MMMM YYYY'))
const days = ref(generateDays(currentMonth.value))

function generateDays(month) {
    const startOfMonth = month.clone().startOf('month').startOf('week')
    const endOfMonth = month.clone().endOf('month').endOf('week')
    const date = startOfMonth.clone().subtract(1, 'day')
    const days = []

    while (date.isBefore(endOfMonth, 'day')) {
        days.push({
            date: date.add(1, 'day').format('YYYY-MM-DD'),
            isCurrentMonth: date.isSame(month, 'month'),
            isToday: date.isSame(moment(), 'day'),
        })
    }

    return days
}

function previousMonth() {
    currentMonth.value = currentMonth.value.clone().subtract(1, 'month')
    currentMonthLabel.value = currentMonth.value.format('MMMM YYYY')
    days.value = generateDays(currentMonth.value)
}

function nextMonth() {
    currentMonth.value = currentMonth.value.clone().add(1, 'month')
    currentMonthLabel.value = currentMonth.value.format('MMMM YYYY')
    days.value = generateDays(currentMonth.value)
}

const meetings = [
    {
        id: 1,
        date: 'January 10th, 2022',
        time: '5:00 PM',
        datetime: '2022-01-10T17:00',
        name: 'Leslie Alexander',
        imageUrl:
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        location: 'Starbucks',
    },
    // More meetings...
]
</script>
