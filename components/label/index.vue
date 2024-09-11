<template>
    <p class="text-sm text-gray-600">{{ props.label }}</p>
</template>

<script setup lang="ts">
const props = defineProps({
    label: {
        type: String,
        required: false,
    },
})
</script>