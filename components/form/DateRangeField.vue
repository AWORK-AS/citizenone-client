<template>
    <flat-pickr v-model="state.dateValue" :config="state.datePickerConfig" :id="props.id" :name="props.name"
        @on-change="updateValue" :placeholder="props.placeholder"
        class="appearance-none block w-full px-3 py-2.5 border border-gray-200 placeholder-gray-500 text-gray-900 rounded-full focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm" />
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
        }
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
