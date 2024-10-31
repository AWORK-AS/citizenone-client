<template>
    <input type="radio" :id="props.id" :name="props.name" class="w-5 h-5" :value="props.modelValue" />
</template>

<script setup lang="ts">
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
})
</script>