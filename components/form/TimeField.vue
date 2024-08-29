<template>
    <flat-pickr v-model="state.timeValue" :config="config" :id="props.id" :name="props.name"
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

console.log('propsValue', props?.value)

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
