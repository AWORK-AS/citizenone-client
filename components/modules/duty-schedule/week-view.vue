<template>
    <!-- {{ props.dutySchedules?.data }} -->
    <div class="flex h-full flex-col">
        <header class="flex flex-none items-center justify-between border-b border-gray-200 py-4">
            <h3 class="text-base font-semibold leading-6 text-gray-900">
                <time>{{ formattedDate }}</time>
            </h3>
            <div class="flex items-center">
                <div class="relative flex items-center rounded-md bg-white shadow-sm md:items-stretch">
                    <button @click="previousWeek" type="button"
                        class="flex h-9 w-12 items-center justify-center rounded-l-md border-y border-l border-gray-300 pr-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pr-0 md:hover:bg-gray-50">
                        <span class="sr-only">Previous week</span>
                        <Icon name="heroicons:chevron-left" class="h-5 w-5" aria-hidden="true" />
                    </button>
                    <button @click="setToday" type="button"
                        class="hidden border-y border-gray-300 px-3.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:relative md:block">Today</button>
                    <span class="relative -mx-px h-5 w-px bg-gray-300 md:hidden" />
                    <button @click="nextWeek" type="button"
                        class="flex h-9 w-12 items-center justify-center rounded-r-md border-y border-r border-gray-300 pl-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pl-0 md:hover:bg-gray-50">
                        <span class="sr-only">Next week</span>
                        <Icon name="heroicons:chevron-right" class="h-5 w-5" aria-hidden="true" />
                    </button>
                </div>
            </div>
        </header>
        <div ref="container" class="isolate flex flex-auto flex-col overflow-auto bg-white">
            <div style="width: 165%" class="flex max-w-full flex-none flex-col sm:max-w-none md:max-w-full">
                <div ref="containerNav"
                    class="sticky top-0 z-30 flex-none bg-white shadow ring-1 ring-black ring-opacity-5 sm:pr-8">
                    <div class="grid grid-cols-7 text-sm leading-6 text-gray-500 sm:hidden">
                        <button v-for="day in weekDays" :key="day.date" type="button"
                            class="flex flex-col items-center pb-3 pt-2" @click="setSelectedDay(day)">
                            {{ day.shortName }}
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
                            <span>
                                {{ day.longName }}
                                <span class="items-center justify-center font-semibold text-gray-900">
                                    {{ day.date }}
                                </span>
                            </span>
                        </div>
                    </div>
                </div>
                <div class="flex flex-auto">
                    <div class="sticky left-0 z-10 w-14 flex-none bg-white ring-1 ring-gray-100" />
                    <div class="grid flex-auto grid-cols-1 grid-rows-1">
                        <div class="col-start-1 col-end-2 row-start-1 grid divide-y divide-gray-100"
                            style="grid-template-rows: repeat(8, minmax(3.5rem, 1fr))">
                            <div ref="containerOffset" class="row-end-1 h-7" />
                        </div>
                        <div
                            class="col-start-1 col-end-2 row-start-1 hidden grid-cols-7 grid-rows-1 divide-x divide-gray-100 sm:grid sm:grid-cols-7">
                            <div v-for="(events, index) in eventsByDay" :key="index" class="col-start-{{ index + 1 }}">
                                <div class="p-3 space-y-3">
                                    <div v-for="dutySchedule in events" :key="dutySchedule.id"
                                        class="bg-gray-200 p-2 rounded-md" @click="editDutySchedule(dutySchedule)">
                                        <p class="text-xxs">
                                            {{ moment(dutySchedule.date_time_start).format('HH:mm') }} -
                                            {{ moment(dutySchedule.date_time_end).format('HH:mm') }}
                                        </p>
                                        <p class="text-xs">
                                            {{ dutySchedule.user?.firstname }}
                                            {{ dutySchedule.user?.lastname }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-start-8 w-8" />
                        </div>
                        <div
                            class="col-start-1 col-end-2 row-start-1 grid-cols-7 grid-rows-1 divide-x divide-gray-100 block sm:hidden">
                            12313123213
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>


<script setup lang="ts">
import moment from 'moment'
import { computed, ref, defineProps, onMounted } from 'vue'

const props = defineProps({
    dutySchedules: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['changeDatePerWeek', 'editDutySchedule'])

const container = ref(null)
const containerNav = ref(null)
const containerOffset = ref(null)
const currentDate = ref(moment())
const selectedDay = ref(moment())

const previousWeek = () => {
    currentDate.value = moment(currentDate.value).subtract(1, 'week')
    const dateMoment = moment(currentDate.value)
    const startOfWeek = dateMoment.clone().startOf('week')
    const endOfWeek = dateMoment.clone().endOf('week')
    const startOfWeekFormatted = startOfWeek.format('YYYY-MM-DD')
    const endOfWeekFormatted = endOfWeek.format('YYYY-MM-DD')
    emit('changeDatePerWeek', [startOfWeekFormatted, endOfWeekFormatted])
}

const setToday = () => {
    currentDate.value = moment()
    const dateMoment = moment(currentDate.value)
    const startOfWeek = dateMoment.clone().startOf('week')
    const endOfWeek = dateMoment.clone().endOf('week')
    const startOfWeekFormatted = startOfWeek.format('YYYY-MM-DD')
    const endOfWeekFormatted = endOfWeek.format('YYYY-MM-DD')
    emit('changeDatePerWeek', [startOfWeekFormatted, endOfWeekFormatted])
}

const nextWeek = () => {
    currentDate.value = moment(currentDate.value).add(1, 'week')
    const dateMoment = moment(currentDate.value)
    const startOfWeek = dateMoment.clone().startOf('week')
    const endOfWeek = dateMoment.clone().endOf('week')
    const startOfWeekFormatted = startOfWeek.format('YYYY-MM-DD')
    const endOfWeekFormatted = endOfWeek.format('YYYY-MM-DD')
    emit('changeDatePerWeek', [startOfWeekFormatted, endOfWeekFormatted])
}

function editDutySchedule(dutySchedule: any) {
    emit('editDutySchedule', dutySchedule)
}

const formattedDate = computed(() => currentDate.value.format('MMMM YYYY'))

const weekDays = computed(() => {
    const startOfWeek = moment(currentDate.value).startOf('week') // Sunday as the first day
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
    const startOfWeek = dateMoment.clone().startOf('week')
    const endOfWeek = dateMoment.clone().endOf('week')
    const startOfWeekFormatted = startOfWeek.format('YYYY-MM-DD')
    const endOfWeekFormatted = endOfWeek.format('YYYY-MM-DD')
    emit('changeDatePerWeek', [startOfWeekFormatted, endOfWeekFormatted])
}

function isWithinRange(eventStart: moment.Moment, eventEnd: moment.Moment, dayStart: moment.Moment, dayEnd: moment.Moment) {
    return eventStart.isBefore(dayEnd) && eventEnd.isAfter(dayStart)
}

const eventsByDay = computed(() => {
    if (!props.dutySchedules?.data) return Array.from({ length: 7 }).map(() => [])

    const startOfWeek = moment(currentDate.value).startOf('week')
    const endOfWeek = moment(currentDate.value).endOf('week')

    return Array.from({ length: 7 }).map((_, i) => {
        const dayStart = moment(startOfWeek).add(i, 'day').startOf('day')
        const dayEnd = moment(dayStart).endOf('day')

        return props.dutySchedules.data.filter((event: any) => {
            const eventStart = moment(event.date_time_start)
            const eventEnd = moment(event.date_time_end)
            return isWithinRange(eventStart, eventEnd, dayStart, dayEnd)
        })
    })
})
</script>
