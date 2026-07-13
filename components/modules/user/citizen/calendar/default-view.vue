<template>
    <div class="motion-safe:animate-fade-in">
        <div class="lg:grid lg:grid-cols-12 lg:gap-x-12">
            <!-- Mini month picker -->
            <div class="py-4 lg:col-start-9 lg:col-end-13 lg:row-start-1">
                <div class="rounded-2xl bg-white p-4 ring-1 ring-gray-200 shadow-sm">
                    <div class="flex items-center justify-between">
                        <h3 class="text-sm font-semibold text-gray-900">
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
                        <div class="inline-flex items-center rounded-full border border-gray-200 bg-white shadow-sm">
                            <button type="button" @click="previousMonth"
                                class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-l-full text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors">
                                <span class="sr-only">Previous month</span>
                                <Icon name="heroicons:chevron-left" class="h-4 w-4" aria-hidden="true" />
                            </button>
                            <span class="h-3.5 w-px bg-gray-200"></span>
                            <button type="button" @click="nextMonth"
                                class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-r-full text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors">
                                <span class="sr-only">Next month</span>
                                <Icon name="heroicons:chevron-right" class="h-4 w-4" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                    <div class="mt-4 grid grid-cols-7 text-[11px] font-semibold uppercase tracking-wide leading-6 text-gray-400">
                        <div class="text-center">{{ $t('calendar.week.oneLetter.Monday') }}</div>
                        <div class="text-center">{{ $t('calendar.week.oneLetter.Tuesday') }}</div>
                        <div class="text-center">{{ $t('calendar.week.oneLetter.Wednesday') }}</div>
                        <div class="text-center">{{ $t('calendar.week.oneLetter.Thursday') }}</div>
                        <div class="text-center">{{ $t('calendar.week.oneLetter.Friday') }}</div>
                        <div class="text-center">{{ $t('calendar.week.oneLetter.Saturday') }}</div>
                        <div class="text-center">{{ $t('calendar.week.oneLetter.Sunday') }}</div>
                    </div>
                    <div class="mt-1 grid grid-cols-7 text-sm">
                        <div v-for="(day, dayIdx) in days" :key="day.date" class="py-0.5" @click="selectDay(day)">
                            <button type="button" :class="[
                                day.isSelected && day.isToday && 'bg-tertiary text-white',
                                day.isSelected && !day.isToday && 'bg-primary text-white',
                                !day.isSelected && day.isToday && 'text-tertiary',
                                !day.isSelected && !day.isToday && day.isCurrentMonth && 'text-gray-900',
                                !day.isSelected && !day.isToday && !day.isCurrentMonth && 'text-gray-300',
                                !day.isSelected && 'hover:bg-gray-100',
                                (day.isSelected || day.isToday) && 'font-semibold',
                                'relative mx-auto flex h-8 w-8 items-center justify-center rounded-full transition-colors'
                            ]">
                                <time :datetime="day.date">{{ day.date.split('-').pop().replace(/^0/, '') }}</time>
                                <span class="absolute bottom-1 h-1 w-1 rounded-full"
                                    :class="day.isSelected ? 'bg-white' : 'bg-tertiary'"
                                    v-if="hasSchedule(day)" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Agenda for selected day -->
            <div class="lg:col-span-8 lg:col-start-1 lg:row-start-1">
                <div class="flex items-center justify-between border-b border-gray-100 pb-3 pt-4">
                    <div class="flex items-baseline gap-x-2">
                        <h3 class="text-lg font-semibold tracking-tight text-gray-900">
                            {{ formatDateToReadable(state.selectedDate) }}
                        </h3>
                        <span v-if="state.filteredSchedules.length" class="text-sm text-gray-400">
                            {{ state.filteredSchedules.length === 1 ? $t('calendar.view.oneEvent') : $t('calendar.view.eventsCount', { count: state.filteredSchedules.length }) }}
                        </span>
                    </div>
                </div>

                <TimeGrid :days="dayGridDays" :showHeader="false" @eventClick="viewMyCalendarEvent" />
            </div>
        </div>
        <DialogConfirmation :isModalOpen="state.modal.isDeleteScheduleOpen"
            :message="$t('citizens.calendar.confirmation.deleteConfirmation') + '?'"
            @close="state.modal.isDeleteScheduleOpen = false" @confirm="deleteMyCalendarEvent" />
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import TimeGrid from '@/components/modules/user/calendar/time-grid.vue'

const { formatDateToReadable, formatDateTimeToReadable } = useDatetimeFormatter()
const props = defineProps({
    myCalendarEvents: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['changeMonthYear', 'editMyCalendarEvent', 'deleteMyCalendarEvent', 'markEventAsStatus', 'createJournalFromEvent', 'createEvent', 'viewMyCalendarEvent'])

function viewMyCalendarEvent(event: any) {
    emit('viewMyCalendarEvent', event)
}

const dayGridDays = computed(() => [{
    date: moment(state.selectedDate).format('YYYY-MM-DD'),
    fullDate: moment(state.selectedDate),
    isToday: moment().isSame(moment(state.selectedDate), 'day'),
    weekdayLabel: '',
    dayNumber: moment(state.selectedDate).date(),
    events: state.filteredSchedules || [],
}])

const currentMonth = ref(moment().startOf('month'))
const month = ref(currentMonth.value.format('MMMM'))
const year = ref(currentMonth.value.format('YYYY'))
const days = ref(generateDays(currentMonth.value))

const state = reactive({
    filteredSchedules: [] as any,
    modal: {
        isDeleteScheduleOpen: false,
    },
    selectedDate: moment().format('YYYY-MM-DD'),
    selectedSchedule: {},
})

watch(() => props.myCalendarEvents, (myCalendarEvents: any) => {
    if (myCalendarEvents) {
        filterBasedOnSelectedDate()
    }
})

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
    emit('changeMonthYear', year.value, currentMonth.value.month())
}

function setToday() {
    const today = moment()
    currentMonth.value = today.clone().startOf('month')
    month.value = currentMonth.value.format('MMMM')
    year.value = currentMonth.value.format('YYYY')
    days.value = generateDays(currentMonth.value)
    state.selectedDate = today.format('YYYY-MM-DD')
    emit('changeMonthYear', year.value, currentMonth.value.month())
}

function nextMonth() {
    currentMonth.value = currentMonth.value.clone().add(1, 'month')
    month.value = currentMonth.value.format('MMMM')
    year.value = currentMonth.value.format('YYYY')
    days.value = generateDays(currentMonth.value)
    emit('changeMonthYear', year.value, currentMonth.value.month())
}

function selectDay(selectedDay: any) {
    days.value = days.value.map(day => ({
        ...day,
        isSelected: day.date === selectedDay.date,
    }))
    state.selectedDate = selectedDay.date
    filterBasedOnSelectedDate()
    emit('createEvent', selectedDay.date)
}

function isNow(event: any) {
    if (!event?.date_time_start || !event?.date_time_end) return false
    return moment().isBetween(moment(event.date_time_start), moment(event.date_time_end), null, '[)')
}

function isOverdue(event: any) {
    if (!event || event.completion_status === 'completed') return false
    return !isNow(event) && moment(event.date_time_end).isBefore(moment())
}

function hasSchedule(day: any) {
    if (props.myCalendarEvents?.data) {
        const targetDate = moment(day?.date)
        const hasSchedule = props.myCalendarEvents?.data?.some((event: any) => {
            const start = moment(event.date_time_start)
            const end = moment(event.date_time_end)
            return targetDate.isBetween(start, end, null, '[]')  // '[]' includes the boundaries
        })
        return hasSchedule
    }
    return false
}

function filterBasedOnSelectedDate() {
    if (props.myCalendarEvents?.data) {
        const targetDate = moment(state.selectedDate).format('YYYY-MM-DD')
        const filteredEvents = props.myCalendarEvents.data.filter((event: any) => {
            const start = moment(event.date_time_start).format('YYYY-MM-DD')
            const end = moment(event.date_time_end).format('YYYY-MM-DD')
            return targetDate >= start && targetDate <= end
        })
        state.filteredSchedules = filteredEvents
    } else {
        state.filteredSchedules = []
    }
}

function deleteEventConfirmation(myCalendarEvent: any) {
    state.selectedSchedule = myCalendarEvent
    state.modal.isDeleteScheduleOpen = true
}

function deleteMyCalendarEvent() {
    state.modal.isDeleteScheduleOpen = false
    emit('deleteMyCalendarEvent', state.selectedSchedule)
}

function markEventAsStatus(myCalendarEvent: any, status: 'completed' | 'not_completed') {
    emit('markEventAsStatus', myCalendarEvent, status)
}

function openCreateJournal(myCalendarEvent: any) {
    emit('createJournalFromEvent', myCalendarEvent)
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
</script>
