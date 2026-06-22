<template>
    <input type="number" step="any" :name="props.name" :maxlength="props.maxLength" :autocomplete="props.name"
        class="appearance-none block w-full px-3 h-11 border border-gray-200 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
        :placeholder="props.placeholder" :value="props.modelValue" :min="props.min" @input="updateValue($event)" />
</template>

<script setup lang="ts">
const props = defineProps({
    name: {
        type: String,
        required: true,
    },
    maxLength: {
        type: Number,
        required: false,
    },
    modelValue: {
        type: String,
        required: false
    },
    placeholder: {
        type: String,
        required: true,
    },
    min: {
        type: Number,
        required: false,
    },
})

const emit = defineEmits(['update:modelValue'])

function updateValue(event: any) {
    let value = event.target.value
    if (props.min !== undefined && Number(value) < props.min) {
        value = String(props.min)
        event.target.value = value
    }
    emit('update:modelValue', value)
}
</script>