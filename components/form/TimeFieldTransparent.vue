<template>
    <flat-pickr v-model="state.timeValue" :config="config" :id="props.id" :name="props.name"
        @input="updateValue($event)" @keydown="handleKeydown" :placeholder="props.placeholder"
        class="w-full p-2 bg-transparent text-white border border-white focus:outline-none" />
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

const emit = defineEmits(['update:value', 'closed', 'cancelled'])

// Escape closes the flatpickr calendar too (its own default behavior), which
// would otherwise fire onClose as if the user had confirmed - this flag lets
// onClose tell the two apart so Escape can cancel instead of saving.
let cancelledViaEscape = false

const config = ref({
    enableTime: true,
    noCalendar: true,
    dateFormat: "H:i",
    time_24hr: true,
    onClose: (selectedDates: Date[], dateStr: string) => {
        if (cancelledViaEscape) {
            cancelledViaEscape = false
            emit('cancelled')
            return
        }
        emit('closed', dateStr)
    },
})

const state = reactive({
    timeValue: props?.value,
})

watch(() => props.value, (newValue: any) => {
    if (newValue != null) {
        state.timeValue = newValue
    }
})

function updateValue(event: any) {
    emit('update:value', event.target.value)
}

function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
        cancelledViaEscape = true
    } else if (event.key === 'Enter') {
        emit('closed', state.timeValue)
    }
}
</script>
