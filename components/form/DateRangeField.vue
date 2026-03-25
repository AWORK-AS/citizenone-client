<template>
    <flat-pickr v-model="state.dateValue" :config="state.datePickerConfig" :id="props.id" :name="props.name"
        @on-change="updateValue" :placeholder="props.placeholder" :class="[
            props.dateType === 'duty-schedule' && 'h-11 w-full lg:w-64 text-center rounded-none border-l-0 border-r-0 border border-gray-300 focus:outline-none',
            !props.dateType && 'w-full border-primary focus:outline-none focus:ring-primary focus:border-primary',
            'appearance-none block px-3 py-2.5 border placeholder-gray-500 text-gray-900 rounded-md focus:z-10 sm:text-sm'
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
    disablePreviousWeeks: {
        type: Boolean,
        required: false,
        default: false,
    },
    name: {
        type: String,
        required: true,
    },
    modelValue: {
        type: Array as () => string[],
        required: true,
    },
    placeholder: {
        type: String,
        required: true,
    },
})

const emit = defineEmits(['update:modelValue'])

const state = reactive({
    dateValue: props.modelValue?.length === 2
        ? [new Date(props.modelValue[0]), new Date(props.modelValue[1])]
        : [],
    datePickerConfig: {
        mode: 'range',
        enableTime: false,
        dateFormat: 'd. F Y',
        disableMobile: true,
        locale: {
            firstDayOfWeek: 1,
        },
        minDate: props.disablePreviousWeeks ? moment().startOf('isoWeek').toDate() : null, // Disable previous weeks if enabled
    } as any,
})

const language = useI18n()
if (language.locale.value === 'dk') {
    state.datePickerConfig.locale = {
        ...Danish,
        firstDayOfWeek: 1,
    }
}

watch(() => language.locale.value, (locale: any) => {
    if (locale === 'dk') {
        state.datePickerConfig.locale = {
            ...Danish,
            firstDayOfWeek: 1,
        }
    } else {
        state.datePickerConfig.locale = {
            firstDayOfWeek: 1,
        }
    }
})

watch(() => props.modelValue, (newValue: string[]) => {
    if (newValue.length === 2) {
        const [start, end] = newValue || []
        state.dateValue = [new Date(start), new Date(end)]
    }
})

watch(() => props.disablePreviousWeeks, (newValue: any) => {
    if (newValue != null) {
        state.datePickerConfig.minDate = newValue ? moment().startOf('isoWeek').toDate() : null
    }
})

function updateValue(selectedDates: any) {
    if (selectedDates.length === 2) {
        const formattedDates = selectedDates.map((date: Date) =>
            moment(date).format('YYYY-MM-DD')
        )
        // Only emit if different
        if (
            JSON.stringify(formattedDates) !== JSON.stringify(props.modelValue)
        ) {
            emit('update:modelValue', formattedDates)
        }
    } else if (selectedDates.length === 0) {
        emit('update:modelValue', [])
    }
}
</script>
