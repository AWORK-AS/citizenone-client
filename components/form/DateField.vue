<template>
    <flat-pickr v-model="state.dateValue" :config="state.datePickerConfig" :id="props.id" :name="props.name"
        @on-change="updateValue" :placeholder="props.placeholder" :class="[
            props.dateType === 'duty-schedule' && 'h-11 text-center rounded-none border-l-0 border-r-0 border border-gray-300 focus:outline-none',
            props.dateType === 'calendar' && 'h-11 text-center rounded-none border-0 focus:outline-none bg-transparent',
            !props.dateType && 'rounded-lg border border-gray-200 focus:outline-none focus:ring-primary focus:border-primary',
            'appearance-none block w-full px-5 py-3 placeholder-gray-500 text-gray-900 focus:z-10 sm:text-sm'
        ]" />
</template>

<script setup lang="ts">
import moment from 'moment'
import flatPickr from 'vue-flatpickr-component'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.css'
import { useI18n } from "vue-i18n"
import { Danish } from 'flatpickr/dist/l10n/da.js'

const props = defineProps({
    id: {
        type: String,
        required: false,
    },
    dateType: {
        type: String,
        required: false,
    },
    disablePreviousWeeks: {
        type: Boolean,
        required: false,
        default: false,
    },
    name: {
        type: String,
        required: true,
    },
    // Shows the age in years in place of the week number, e.g. for birthdays
    showAge: {
        type: Boolean,
        required: false,
        default: false,
    },
    // Optional bounds as YYYY-MM-DD; days outside them cannot be picked.
    minDate: {
        type: String,
        required: false,
    },
    maxDate: {
        type: String,
        required: false,
    },
    modelValue: String,
    placeholder: {
        type: String,
        required: true,
    },
})

// Bounds as Date objects: flatpickr reads a string bound with this field's
// display format ('d. F Y (W)'), which turns '2026-10-22' into nonsense.
function localDay(value?: string): Date | null {
    return value ? moment(value, 'YYYY-MM-DD').toDate() : null
}

const state = reactive({
    dateValue: props.modelValue ? new Date(props.modelValue) : '',
    datePickerConfig: {
        enableTime: false,
        // Updated dateFormat to include week number (w token for ISO week number)
        dateFormat: 'd. F Y (W)',
        formatDate: props.showAge
            ? (date: Date, _format: string, locale: any) => `${flatpickr.formatDate(date, 'd. F Y', locale)} (${moment().diff(date, 'years')})`
            : undefined,
        disableMobile: true,
        locale: {
            firstDayOfWeek: 1, // Set Monday as the first day of the week
        },
        weekNumbers: true,
        minDate: props.disablePreviousWeeks ? moment().startOf('isoWeek').toDate() : localDay(props.minDate), // Disable previous weeks if enabled
        maxDate: localDay(props.maxDate),
    } as any
})

const language = useI18n()
if (language.locale.value === 'dk') {
    state.datePickerConfig.locale = {
        ...Danish,
        firstDayOfWeek: 1, // Set Monday as the first day of the week
    }
} else {
    state.datePickerConfig.locale = {
        firstDayOfWeek: 1, // Set Monday as the first day of the week
    }
}

watch(() => language.locale.value, (language: any) => {
    if (language != null) {
        if (language === 'dk') {
            state.datePickerConfig.locale = {
                ...Danish,
                firstDayOfWeek: 1, // Set Monday as the first day of the week
            }
        } else {
            state.datePickerConfig.locale = {
                firstDayOfWeek: 1, // Set Monday as the first day of the week
            }
        }
    }
})

watch(() => props.modelValue, (newValue: any) => {
    state.dateValue = newValue ? new Date(newValue) : ''  // use Date object here, '' clears the picker
})

watch(() => props.disablePreviousWeeks, (newValue: any) => {
    if (newValue != null) {
        state.datePickerConfig.minDate = newValue ? moment().startOf('isoWeek').toDate() : new Date(0)
    }
})

const emit = defineEmits(['update:modelValue'])

function updateValue(selectedDates: any) {
    const date = selectedDates?.[0]
    if (date) {
        const formattedDate = moment(date).format('YYYY-MM-DD')
        emit('update:modelValue', formattedDate)
    } else {
        emit('update:modelValue', '')
    }
}
</script>
