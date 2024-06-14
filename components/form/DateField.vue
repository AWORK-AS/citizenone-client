<template>
    <input type="date" :name="props.name" :autocomplete="props.name"
        class="appearance-none block w-full px-3 py-2.5 border border-primary placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
        :placeholder="props.placeholder" :value="props.modelValue" @input="updateValue($event)" />
</template>

<script setup lang="ts">
const props = defineProps({
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