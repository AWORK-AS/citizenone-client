<template>
    <textarea type="text" :name="props.name" :autocomplete="props.name"
        class="appearance-none block w-full p-4 border border-gray-200 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
        :placeholder="props.placeholder" :rows="props.rows"
        @input="updateValue($event)">{{ props.modelValue }}</textarea>
</template>

<script setup lang="ts">
const props = defineProps({
    name: {
        type: String,
        required: true,
    },
    modelValue: {
        type: String,
        required: false,
    },
    placeholder: {
        type: String,
        required: true,
    },
    rows: {
        type: Number,
        required: false,
        default: 4,
    },
})

const emit = defineEmits(['update:modelValue'])

function updateValue(event: any) {
    emit('update:modelValue', event.target.value)
}
</script>