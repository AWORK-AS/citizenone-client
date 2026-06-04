<template>
    <p v-if="error" class="co-error">{{ error }}</p>
</template>

<script setup lang="ts">
defineProps({
    error: {
        type: String,
        default: '',
    },
})
</script>
