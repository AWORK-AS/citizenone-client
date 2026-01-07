<template>
    <flat-pickr v-model="state.dateValue" :config="state.datePickerConfig" :id="props.id" :name="props.name"
        @on-change="updateValue" :placeholder="props.placeholder" :class="[
            props.dateType === 'duty-schedule' && 'h-11 text-center rounded-none border-l-0 border-r-0 border border-gray-300 focus:outline-none',
            props.dateType === 'calendar' && 'h-11 text-center rounded-none border-l-0 border-r-0 border border-gray-300 focus:outline-none',
            !props.dateType && 'border-primary focus:outline-none focus:ring-primary focus:border-primary',
            'appearance-none block w-full px-3 py-2.5 border placeholder-gray-500 text-gray-900 rounded-md focus:z-10 sm:text-sm'
        ]" />
</template>

<script setup lang="ts">
import moment from 'moment'
import flatPickr from 'vue-flatpickr-component'
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
    name: {
        type: String,
        required: true,
    },
    modelValue: String,
    placeholder: {
        type: String,
        required: true,
    },
})

const state = reactive({
    dateValue: props.modelValue ? new Date(props.modelValue) : '',
    datePickerConfig: {
        enableTime: false,
        // Updated dateFormat to include week number (w token for ISO week number)
        dateFormat: 'd. F Y (W)',
        disableMobile: true,
        locale: {
            firstDayOfWeek: 1, // Set Monday as the first day of the week
        }
    }
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
    if (newValue != null && newValue !== '') {
        state.dateValue = new Date(newValue)  // use Date object here
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
