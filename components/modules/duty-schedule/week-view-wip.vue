<template>
    <div class="space-y-5">
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
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
                    <div class="sticky top-0 z-30 flex-none bg-white shadow ring-1 ring-black ring-opacity-5">
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
                            <div class="col-end-1 w-40" />
                            <!-- <div v-for="day in weekDays" :key="day.date" class="flex items-center justify-center py-3">
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
                            </div> -->
                        </div>
                    </div>
                    <div>
                        <!-- <div class="sticky left-0 z-10 w-40 flex-none bg-white ring-1 ring-gray-100">
                            <div v-for="(employee, index) in state.employees" :key="index">
                                <p class="text-xs p-2">
                                    {{ employee?.firstname }} {{ employee?.lastname }}
                                </p>
                            </div>
                        </div> -->
                        <div class="min-h-96">
                            <!-- <div class="col-start-1 col-end-2 row-start-1 grid divide-y divide-gray-100"
                                style="grid-template-rows: repeat(8, minmax(3.5rem, 1fr))">
                                <div class="row-end-1 h-7" />
                            </div> -->
                            <div
                                class="bg-white shadow ring-1 ring-black ring-opacity-5 grid grid-cols-8 divide-x divide-gray-100">
                                <div></div>
                                <div v-for="day in weekDays" :key="day.date"
                                    class="flex items-center justify-center py-3">
                                    <span class="flex gap-x-1 text-sm">
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
                            <div class="grid grid-cols-8 divide-x divide-y divide-gray-100">
                                <div class="p-2">1</div>
                                <div class="p-2">2</div>
                                <div class="p-2">3</div>
                                <div class="p-2">4</div>
                                <div class="p-2">5</div>
                                <div class="p-2">6</div>
                                <div class="p-2">7</div>
                                <div class="p-2">8</div>

                                <div class="p-2">1</div>
                                <div class="p-2">2</div>
                                <div class="p-2">3</div>
                                <div class="p-2">4</div>
                                <div class="p-2">5</div>
                                <div class="p-2">6</div>
                                <div class="p-2">7</div>
                                <div class="p-2">8</div>
                            </div>
                            <!-- <div
                                class="col-start-1 col-end-2 row-start-1 hidden grid-cols-7 grid-rows-1 divide-x divide-gray-100 sm:grid sm:grid-cols-7">
                                <div class="col-start-1">
                                    <div v-for="(employee, index) in state.employees" :key="index" class="p-3">
                                        <p class="text-sm font-medium">
                                            {{ employee?.firstname }} {{ employee?.lastname }}
                                        </p>
                                        <div class="text-xs grid grid-cols-5">
                                            <div class="col-span-3">
                                                <p>Timer</p>
                                                <p>Holiday hours</p>
                                                <p>Night Shift hours</p>
                                            </div>
                                            <div class="col-span-1 flex justify-end">
                                                1
                                            </div>
                                            <div class="col-span-1">
                                                1
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-start-2">
                                    <div class="p-3 h-20">
                                        asdasdasd
                                    </div>
                                    <div class="p-3">
                                        asdasdasd
                                    </div>
                                </div>
                            </div> -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>


<script setup lang="ts">
import moment from 'moment'
import { userService } from '@/components/api/UserService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'

const props = defineProps({
    dutySchedules: {
        type: Object,
        required: true,
    },
})

const currentDate = ref(moment())
const selectedDay = ref(moment())
const month = computed(() => currentDate.value.format('MMMM'))
const year = computed(() => currentDate.value.format('YYYY'))

const state = reactive({
    employees: [] as any,
    error: {} as any,
    isPageLoading: false,
})


onMounted(() => {
    fetchEmployees()
})

async function fetchEmployees() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await userService.getAllUsers()
        if (response) {
            state.employees = response?.data
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function previousWeek() {
    currentDate.value = moment(currentDate.value).subtract(1, 'week')
    const dateMoment = moment(currentDate.value)
    const startOfWeek = dateMoment.clone().startOf('isoWeek')
    const endOfWeek = dateMoment.clone().endOf('isoWeek')
    const startOfWeekFormatted = startOfWeek.format('YYYY-MM-DD')
    const endOfWeekFormatted = endOfWeek.format('YYYY-MM-DD')
    // emit('changeDatePerWeek', [startOfWeekFormatted, endOfWeekFormatted])
}

function setToday() {
    currentDate.value = moment()
    const dateMoment = moment(currentDate.value)
    const startOfWeek = dateMoment.clone().startOf('isoWeek')
    const endOfWeek = dateMoment.clone().endOf('isoWeek')
    const startOfWeekFormatted = startOfWeek.format('YYYY-MM-DD')
    const endOfWeekFormatted = endOfWeek.format('YYYY-MM-DD')
    // emit('changeDatePerWeek', [startOfWeekFormatted, endOfWeekFormatted])
}

function nextWeek() {
    currentDate.value = moment(currentDate.value).add(1, 'week')
    const dateMoment = moment(currentDate.value)
    const startOfWeek = dateMoment.clone().startOf('isoWeek')
    const endOfWeek = dateMoment.clone().endOf('isoWeek')
    const startOfWeekFormatted = startOfWeek.format('YYYY-MM-DD')
    const endOfWeekFormatted = endOfWeek.format('YYYY-MM-DD')
    // emit('changeDatePerWeek', [startOfWeekFormatted, endOfWeekFormatted])
}

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
    if (!props.dutySchedules?.data) return Array.from({ length: 7 }).map(() => [])

    const startOfWeek = moment(currentDate.value).startOf('isoWeek')
    const endOfWeek = moment(currentDate.value).endOf('isoWeek')

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

const eventsBySelectedDay = computed(() => {
    if (!props.dutySchedules?.data) return Array.from({ length: 7 }).map(() => [])

    const dayStart = moment(selectedDay.value).startOf('day')
    const dayEnd = moment(selectedDay.value).endOf('day')
    return props.dutySchedules.data.filter((event: any) => {
        const eventStart = moment(event.date_time_start)
        const eventEnd = moment(event.date_time_end)
        return isWithinRange(eventStart, eventEnd, dayStart, dayEnd)
    })
})
</script>
