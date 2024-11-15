<template>
    <flat-pickr v-model="state.dateValue" :config="config" :id="props.id" :name="props.name"
        :placeholder="props.placeholder"
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
    modelValue: Array,
    placeholder: {
        type: String,
        required: true,
    },
})

const config = ref({
    enableTime: false,
    dateFormat: 'd. F Y',
    disableMobile: true,
    locale: {
        firstDayOfWeek: 1 // Set Monday as the first day of the week
    },
    mode: "range",
    wrap: true,
}) as any

const state = reactive({
    dateValue: props.modelValue as any,
})
</script>
