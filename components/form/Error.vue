<template>
    <p class="text-sm text-red-500" v-if="props.error">
        {{ props.error }}
    </p>
</template>

<script setup lang="ts">
const props = defineProps({
    error: {
        type: String,
        required: false,
    },
})
</script>