<template>
    <input type="number" step="any" :name="props.name" :maxlength="props.maxLength" :autocomplete="props.name"
        class="appearance-none block w-full px-3 py-2 border border-primary placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
        :placeholder="props.placeholder" :value="props.modelValue" @input="updateValue($event)" />
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
})

const emit = defineEmits(['update:modelValue'])

function updateValue(event: any) {
    emit('update:modelValue', event.target.value)
}
</script>