<template>
    <flat-pickr v-model="state.dateValue" :config="config" :id="props.id" :name="props.name"
        @input="updateValue($event)"
        class="appearance-none block w-full px-3 py-2.5 border border-primary placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm" />
</template>

<script setup lang="ts">
import moment from 'moment'
import flatPickr from 'vue-flatpickr-component'
import 'flatpickr/dist/flatpickr.css'

const props = defineProps({
    id: {
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

const config = ref({
    enableTime: true,
    dateFormat: 'd. F Y H:i',
    time_24hr: true,
    disableMobile: true,
    locale: {
        firstDayOfWeek: 1 // Set Monday as the first day of the week
    }
})

const state = reactive({
    dateValue: '',
})


watch(() => props.modelValue, (newValue: any) => {
    if (newValue != null) {
        state.dateValue = formatDateToDDMMMMYYYYHHmm(newValue)
    }
})

const emit = defineEmits(['update:modelValue'])

function updateValue(event: any) {
    const formattedDate = formatDateToYYYYMMDDHHmm(event.target.value)
    emit('update:modelValue', formattedDate)
}

function formatDateToYYYYMMDDHHmm(dateString: any) {
    let date = moment(dateString, 'DD. MMMM YYYY HH:mm')
    let formattedDate = date.format('YYYY-MM-DD H:mm')
    return formattedDate
}

function formatDateToDDMMMMYYYYHHmm(dateString: any) {
    let date = moment(dateString, 'YYYY-MM-DD H:mm')
    let formattedDate = date.format('DD. MMMM YYYY HH:mm')
    return formattedDate
}
</script>
