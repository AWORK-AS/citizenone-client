<template>
    <div class="space-y-5">
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <div class="flex h-full flex-col">
            <header class="flex flex-none items-center justify-between border-b border-gray-200 py-4">
                <div>
                    <p>Legend:</p>
                    <div class="grid grid-cols-2 gap-x-4">
                        <div class="flex items-center gap-x-2">
                            <div class="w-3 h-3 rounded-sm bg-shifts-regular"></div>
                            <span>Regular shift</span>
                        </div>
                        <div class="flex items-center gap-x-2">
                            <div class="w-3 h-3 rounded-sm bg-shifts-night"></div>
                            <span>Night shift</span>
                        </div>
                        <div class="flex items-center gap-x-2">
                            <div class="w-3 h-3 rounded-sm bg-shifts-vacation"></div>
                            <span>Vacation leave</span>
                        </div>
                        <div class="flex items-center gap-x-2">
                            <div class="w-3 h-3 rounded-sm bg-shifts-sickleave"></div>
                            <span>Sick leave</span>
                        </div>
                    </div>
                </div>
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
                    </div>
                    <div>
                        <div>
                            <div class="shadow grid grid-cols-9">
                                <div class="col-span-2 border-0.5"></div>
                                <div v-for="day in weekDays" :key="day.date"
                                    class="flex items-center justify-center py-4 border-0.5">
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

                            <div class="mt-0.5">
                                <div v-for="(weeklySchedule, weeklyScheduleIndex) in state.weeklySchedules"
                                    :key="weeklyScheduleIndex" class="grid grid-cols-9">
                                    <div class="p-3 col-span-2 space-y-2 border-0.5">
                                        <div>
                                            <p class="text-sm font-medium">
                                                {{ weeklySchedule?.employee?.firstname }}
                                                {{ weeklySchedule?.employee?.lastname }}
                                            </p>
                                        </div>
                                        <div class="text-xs grid grid-cols-7">
                                            <div class="col-span-3 space-y-2">
                                                <p>{{ $t('dutySchedules.table.timer') }}</p>
                                                <p>{{ $t('dutySchedules.table.holidayHours') }}</p>
                                                <p>{{ $t('dutySchedules.table.nightShiftHours') }}</p>
                                            </div>
                                            <div class="col-span-2 flex gap-2 flex-col items-end">
                                                <p>0</p>
                                                <p>0</p>
                                                <p>0</p>
                                            </div>
                                            <div
                                                class="col-span-2 flex gap-2 flex-col items-end border-l-2 border-gray-200 ml-3">
                                                <p>0</p>
                                                <p>0</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="p-3 border-0.5" @change="logChanges"
                                        v-for="(week, weekIndex) in weeklySchedule?.weeks" :key="weekIndex" :class="[
                                            isScheduleCopied(weeklyScheduleIndex, weekIndex) && 'border-1.5 border-dashed border-gray-700',
                                            !isScheduleCopied(weeklyScheduleIndex, weekIndex) & !isScheduleCopiedEmpty() && 'cursor-copy'
                                        ]">
                                        <div class="space-y-2" v-if="!isScheduleCopied(weeklyScheduleIndex, weekIndex)">
                                            <div class="flex justify-end gap-2">
                                                <button
                                                    class="bg-gray-200 w-6 h-6 text-sm text-gray-600 rounded-sm hover:bg-gray-400 hover:text-gray-200 flex items-center justify-center"
                                                    @click="copyEmployeeSchedule(weeklyScheduleIndex, weekIndex, weeklySchedule)">
                                                    <Icon name="mdi:content-copy" class="h-3 w-3" aria-hidden="true" />
                                                </button>
                                                <button
                                                    class="bg-gray-200 w-6 h-6 text-sm text-gray-600 rounded-sm hover:bg-gray-400 hover:text-gray-200"
                                                    @click="openAddNewShiftModal(weeklyScheduleIndex, weekIndex, week)">
                                                    +
                                                </button>
                                            </div>
                                            <div class="space-y-2 text-xs">
                                                <div class="bg-shifts-regular rounded-md p-1 relative"
                                                    v-if="week?.shifts.find((shift) => shift.name === 'regular shift')">
                                                    <div class="flex">
                                                        <FormTimeField name="time" class="rounded-tl-md rounded-bl-md"
                                                            :value="week?.shifts.find((shift) => shift.name === 'regular shift')?.time_in" />
                                                        <FormTimeField name="time" class="rounded-tr-md rounded-br-md"
                                                            :value="week?.shifts.find((shift) => shift.name === 'regular shift')?.time_out" />
                                                    </div>
                                                    <button
                                                        class="bg-gray-200 w-4 h-4 text-sm text-gray-600 rounded-full flex items-center justify-center absolute -right-1 -top-1"
                                                        @click="removeShift(weeklyScheduleIndex, weekIndex, 'regular shift')">
                                                        <Icon name="ph:x" class="h-2 w-2" aria-hidden="true" />
                                                    </button>
                                                </div>
                                                <div class="bg-shifts-night rounded-md p-1 relative"
                                                    v-if="week?.shifts.find((shift) => shift.name === 'night shift')">
                                                    <div class="flex">
                                                        <FormTimeField name="time" class="rounded-tl-md rounded-bl-md"
                                                            :value="week?.shifts.find((shift) => shift.name === 'night shift')?.time_in" />
                                                        <FormTimeField name="time" class="rounded-tr-md rounded-br-md"
                                                            :value="week?.shifts.find((shift) => shift.name === 'night shift')?.time_out" />
                                                    </div>
                                                    <button
                                                        class="bg-gray-200 w-4 h-4 text-sm text-gray-600 rounded-full flex items-center justify-center absolute -right-1 -top-1"
                                                        @click="removeShift(weeklyScheduleIndex, weekIndex, 'night shift')">
                                                        <Icon name="ph:x" class="h-2 w-2" aria-hidden="true" />
                                                    </button>
                                                </div>
                                                <div class="bg-shifts-vacation rounded-md p-1 relative"
                                                    v-if="week?.shifts.find((shift) => shift.name === 'vacation leave')">
                                                    <div class="flex">
                                                        <FormTimeField name="time" class="rounded-tl-md rounded-bl-md"
                                                            :value="week?.shifts.find((shift) => shift.name === 'vacation leave')?.time_in" />
                                                        <FormTimeField name="time" class="rounded-tr-md rounded-br-md"
                                                            :value="week?.shifts.find((shift) => shift.name === 'vacation leave')?.time_in" />
                                                    </div>
                                                    <button
                                                        class="bg-gray-200 w-4 h-4 text-sm text-gray-600 rounded-full flex items-center justify-center absolute -right-1 -top-1"
                                                        @click="removeShift(weeklyScheduleIndex, weekIndex, 'vacation leave')">
                                                        <Icon name="ph:x" class="h-2 w-2" aria-hidden="true" />
                                                    </button>
                                                </div>
                                                <div class="bg-shifts-sickleave rounded-md p-1 relative"
                                                    v-if="week?.shifts.find((shift) => shift.name === 'sick leave')">
                                                    <div class="flex">
                                                        <FormTimeField name="time" class="rounded-tl-md rounded-bl-md"
                                                            :value="week?.shifts.find((shift) => shift.name === 'sick leave')?.time_in" />
                                                        <FormTimeField name="time" class="rounded-tr-md rounded-br-md"
                                                            :value="week?.shifts.find((shift) => shift.name === 'sick leave')?.time_in" />
                                                    </div>
                                                    <button
                                                        class="bg-gray-200 w-4 h-4 text-sm text-gray-600 rounded-full flex items-center justify-center absolute -right-1 -top-1"
                                                        @click="removeShift(weeklyScheduleIndex, weekIndex, 'sick leave')">
                                                        <Icon name="ph:x" class="h-2 w-2" aria-hidden="true" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="flex flex-col items-center space-y-2 mt-3 cursor-pointer" v-else
                                            @click="stopCopying(weeklyScheduleIndex, weekIndex)">
                                            <p class="text-center text-sm">Stop copying</p>
                                            <p class="text-center text-xxs">
                                                Click here to stop copying the schedule
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <ModulesDutyScheduleModalNewShift :isModalOpen="state.modal.isAddShiftOpen"
            @close="state.modal.isAddShiftOpen = false" @saveShift="saveShift" />
    </div>
</template>


<script setup lang="ts">
import moment from 'moment'
import draggable from 'vuedraggable'
import { userService } from '@/components/api/UserService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'

const currentDate = ref(moment())
const selectedDay = ref(moment())
const month = computed(() => currentDate.value.format('MMMM'))
const year = computed(() => currentDate.value.format('YYYY'))

const state = reactive({
    addShift: {
        selectedEmployeeSchedule: {}
    },
    copy: {
        selectedEmployeeSchedule: {}
    },
    employees: [] as any,
    error: {} as any,
    isPageLoading: false,
    modal: {
        isAddShiftOpen: false
    },
    weeklySchedules: [],
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
            if (state.employees) {
                state.weeklySchedules = []
                state.employees.forEach((employee) => {
                    const dateMoment = moment(currentDate.value)
                    const startOfWeek = dateMoment.clone().startOf('isoWeek')
                    const data = {
                        employee: employee,
                        weeks: {
                            monday: {
                                date: startOfWeek.clone().add(0, 'days').format('YYYY-MM-DD'),
                                shifts: []
                            },
                            tuesday: {
                                date: startOfWeek.clone().add(1, 'days').format('YYYY-MM-DD'),
                                shifts: []
                            },
                            wednesday: {
                                date: startOfWeek.clone().add(2, 'days').format('YYYY-MM-DD'),
                                shifts: []
                            },
                            thursday: {
                                date: startOfWeek.clone().add(3, 'days').format('YYYY-MM-DD'),
                                shifts: []
                            },
                            friday: {
                                date: startOfWeek.clone().add(4, 'days').format('YYYY-MM-DD'),
                                shifts: []
                            },
                            saturday: {
                                date: startOfWeek.clone().add(5, 'days').format('YYYY-MM-DD'),
                                shifts: []
                            },
                            sunday: {
                                date: startOfWeek.clone().add(6, 'days').format('YYYY-MM-DD'),
                                shifts: []
                            },
                        }
                    }
                    state.weeklySchedules.push(data)
                })
            }
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
    fetchEmployees()
    // emit('changeDatePerWeek', [startOfWeekFormatted, endOfWeekFormatted])
}

function setToday() {
    currentDate.value = moment()
    const dateMoment = moment(currentDate.value)
    const startOfWeek = dateMoment.clone().startOf('isoWeek')
    const endOfWeek = dateMoment.clone().endOf('isoWeek')
    const startOfWeekFormatted = startOfWeek.format('YYYY-MM-DD')
    const endOfWeekFormatted = endOfWeek.format('YYYY-MM-DD')
    fetchEmployees()
    // emit('changeDatePerWeek', [startOfWeekFormatted, endOfWeekFormatted])
}

function nextWeek() {
    currentDate.value = moment(currentDate.value).add(1, 'week')
    const dateMoment = moment(currentDate.value)
    const startOfWeek = dateMoment.clone().startOf('isoWeek')
    const endOfWeek = dateMoment.clone().endOf('isoWeek')
    const startOfWeekFormatted = startOfWeek.format('YYYY-MM-DD')
    const endOfWeekFormatted = endOfWeek.format('YYYY-MM-DD')
    fetchEmployees()
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

function openAddNewShiftModal(weeklyScheduleIndex: number, weekIndex: string, week: any) {
    state.modal.isAddShiftOpen = true
    state.addShift.selectedEmployeeSchedule = {
        weeklyScheduleIndex: weeklyScheduleIndex,
        weekIndex: weekIndex,
        ...week
    }
}

function isScheduleCopiedEmpty() {
    return Object.keys(state.copy.selectedEmployeeSchedule).length === 0
}

function isScheduleCopied(weeklyScheduleIndex: number, weekIndex: number) {
    return state.copy.selectedEmployeeSchedule.weeklyScheduleIndex === weeklyScheduleIndex & state.copy.selectedEmployeeSchedule.weekIndex === weekIndex
}

function copyEmployeeSchedule(weeklyScheduleIndex: number, weekIndex: number, weeklySchedule: any) {
    state.copy.selectedEmployeeSchedule = {
        weeklyScheduleIndex: weeklyScheduleIndex,
        weekIndex: weekIndex,
        weeklySchedule: weeklySchedule,
    }
}

function stopCopying(weeklyScheduleIndex: number, weekIndex: number) {
    state.copy.selectedEmployeeSchedule = {}
}

function saveShift(shiftDetails: any) {
    // Check if shift already existed
    if (!(state.weeklySchedules[state.addShift.selectedEmployeeSchedule.weeklyScheduleIndex].weeks[state.addShift.selectedEmployeeSchedule.weekIndex].shifts.find((shift) => shift.name === shiftDetails.shift_type))) {
        state.weeklySchedules[state.addShift.selectedEmployeeSchedule.weeklyScheduleIndex].weeks[state.addShift.selectedEmployeeSchedule.weekIndex].shifts.push({
            name: shiftDetails.shift_type,
            time_in: '08:00',
            time_out: '17:00',
        })
    }
}

function removeShift(weeklyScheduleIndex: number, weekIndex: number, shiftType: any) {
    const shiftIndexToRemove = state.weeklySchedules[state.addShift.selectedEmployeeSchedule.weeklyScheduleIndex].weeks[state.addShift.selectedEmployeeSchedule.weekIndex].shifts.findIndex((shift) => shift.name === shiftType)
    state.weeklySchedules[state.addShift.selectedEmployeeSchedule.weeklyScheduleIndex].weeks[state.addShift.selectedEmployeeSchedule.weekIndex].shifts.splice(shiftIndexToRemove, 1)
}
</script>
