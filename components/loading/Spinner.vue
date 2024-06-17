<template>
    <div class="relative block">
        <div :class="props.isActive && 'opacity-20 pointer-events-none'">
            <slot />
        </div>
        <div role="status" class="absolute -translate-x-1/2 -translate-y-1/2 top-2/4 left-1/2" v-if="props.isActive">
            <div class="w-14 h-14 border-b-2 border-gray-500 rounded-full animate-spin"></div>
            <span class="sr-only">Loading...</span>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    isActive: {
        type: Boolean,
        required: true,
    },
})
</script>