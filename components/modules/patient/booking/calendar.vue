<template>
    <div v-if="month">
        <div class="flex items-center justify-between mb-2">
            <button type="button" class="h-9 w-9 flex items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
                :disabled="state.monthIndex === 0" :aria-label="$t('patient.booking.previousMonth')"
                @click="state.monthIndex--">
                <Icon name="heroicons:chevron-left" class="h-5 w-5" aria-hidden="true" />
            </button>
            <p class="text-sm font-semibold text-gray-900">{{ monthTitle }}</p>
            <button type="button" class="h-9 w-9 flex items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
                :disabled="state.monthIndex >= months.length - 1" :aria-label="$t('patient.booking.nextMonth')"
                @click="state.monthIndex++">
                <Icon name="heroicons:chevron-right" class="h-5 w-5" aria-hidden="true" />
            </button>
        </div>

        <div class="grid grid-cols-7 gap-1 text-center">
            <div v-for="label in weekdays" :key="label" class="py-1 text-xs font-medium text-gray-400">{{ label }}</div>

            <template v-for="week in weeks" :key="week[0].key">
                <div v-for="day in week" :key="day.key" class="aspect-square">
                    <button v-if="day.inMonth" type="button"
                        class="h-full w-full rounded-full text-sm transition"
                        :class="dayClass(day)"
                        :disabled="!day.available"
                        :aria-pressed="day.key === props.modelValue"
                        @click="emit('update:modelValue', day.key)">
                        {{ day.day }}
                    </button>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { bookableMonths, monthGrid, monthOf, type CalendarDay } from '@/composables/bookingCalendar'

/**
 * Picking the day of a booking from a month calendar. Only days with a free
 * time can be clicked; the rest of the month shows where in the week a day
 * falls. The arrows stay within the months that have something bookable.
 *
 * Replaced a long row of date buttons, which a patient found hard to read
 * through (customer request). The page remounts it per treatment (`key`), so
 * it opens on the new treatment's first month.
 */
const props = defineProps({
    /** The chosen item's `available_dates`, `YYYY-MM-DD`. */
    dates: { type: Array as () => string[], required: true },
    modelValue: { type: String as () => string | null, default: null },
})
const emit = defineEmits(['update:modelValue'])
const { formatLocalized } = useDatetimeFormatter()

const months = computed(() => bookableMonths(props.dates))
const available = computed(() => new Set(props.dates))

const state = reactive({
    monthIndex: (() => {
        const target = props.modelValue ? monthOf(props.modelValue) : months.value[0]
        const index = months.value.findIndex((m) => target && m.year === target.year && m.month === target.month)
        return Math.max(0, index)
    })(),
})

const month = computed(() => months.value[state.monthIndex])
const weeks = computed(() => month.value ? monthGrid(month.value, available.value) : [])
const monthTitle = computed(() => month.value
    ? formatLocalized(moment({ year: month.value.year, month: month.value.month, day: 1 }), 'MMMM YYYY')
    : '')

// Monday to Sunday; 2024-01-01 was a Monday.
const weekdays = computed(() => Array.from({ length: 7 }, (_, i) =>
    formatLocalized(moment({ year: 2024, month: 0, day: 1 + i }), 'ddd')))

function dayClass(day: CalendarDay) {
    if (day.key === props.modelValue) return 'bg-primary text-white font-semibold'
    if (day.available) return 'border border-primary/40 text-gray-900 font-semibold hover:bg-primary/10'
    return 'text-gray-300 cursor-default'
}
</script>
