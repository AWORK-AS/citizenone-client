<template>
    <flat-pickr v-model="state.timeValue" :config="config" :id="props.id" :name="props.name"
        @input="updateValue($event)" :placeholder="props.placeholder"
        class="appearance-none block w-full px-4 h-11 border border-gray-200 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-700 focus:border-primary-700 focus:z-10 sm:text-sm" />
</template>

<script setup lang="ts">
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
    value: String,
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
    timeValue: props?.value,
})

watch(() => props.value, (newValue: any) => {
    if (newValue != null) {
        state.timeValue = newValue
    }
})

const emit = defineEmits(['update:value'])

function updateValue(event: any) {
    emit('update:value', event.target.value)
}
</script>
