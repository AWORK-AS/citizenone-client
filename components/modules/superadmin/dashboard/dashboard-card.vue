<template>
    <div class="bg-white shadow-md rounded-md p-4 border-l-4 border-secondary">
        <h3 class="text-primary text-sm font-medium py-2">
            {{ props.title }}
        </h3>
        <p class="text-xl font-semibold">{{ value }}</p>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    title: String,
    value: [String, Number]
})
</script>