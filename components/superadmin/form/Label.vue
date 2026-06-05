<template>
    <label v-if="label" class="co-label">
        {{ label }}
        <span v-if="required" class="text-red-500">*</span>
    </label>
</template>

<script setup lang="ts">
defineProps({
    label: {
        type: String,
        default: '',
    },
    required: {
        type: Boolean,
        default: false,
    },
})
</script>
