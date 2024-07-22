<template>
    <input type="text" :id="props.id" :name="props.name" :maxlength="props.maxLength" :autocomplete="props.name"
        class="appearance-none block w-full px-4 h-11 border border-primary placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-700 focus:border-primary-700 focus:z-10 sm:text-sm"
        :placeholder="props.placeholder" :value="props.modelValue" @input="updateValue($event)" />
</template>

<script setup lang="ts">
const props = defineProps({
    id: {
        type: String,
        required: false,
    },
    maxLength: {
        type: Number,
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

const emit = defineEmits(['update:modelValue'])

function updateValue(event: any) {
    emit('update:modelValue', event.target.value)
}
</script>