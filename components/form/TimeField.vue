<template>
    <flat-pickr v-model="state.dateValue" :config="config" :id="props.id" :name="props.name"
        @input="updateValue($event)" :placeholder="props.placeholder"
        class="w-full p-2 bg-transparent text-white border border-white focus:outline-none" />
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
        required: false,
    },
})

const config = ref({
    enableTime: true,
    noCalendar: true,
    dateFormat: "H:i",
    time_24hr: true
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
