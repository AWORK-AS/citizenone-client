<template>
    <div class="relative block">
        <div :class="props.isActive && 'opacity-20 pointer-events-none'">
            <slot />
        </div>
        <div role="status"
            class="absolute -translate-x-1/2 -translate-y-1/2 top-2/4 left-1/2"
            v-if="props.isActive">
            <div class="relative h-14 w-14">
                <!-- Rotating brand accent arc -->
                <svg class="co-spinner-arc absolute inset-0 h-full w-full" viewBox="0 0 44 44" fill="none"
                    aria-hidden="true">
                    <circle cx="22" cy="22" r="20.5" stroke="#0f4c75" stroke-width="2.5" stroke-linecap="round"
                        stroke-dasharray="34 200" />
                </svg>
                <!-- CitizenOne mark, gently breathing -->
                <svg class="co-spinner-mark absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2"
                    viewBox="0 0 38.98 38.98" aria-hidden="true">
                    <circle cx="19.49" cy="19.49" r="18.99" fill="#00607a" />
                    <circle cx="19.43" cy="19.55" r="11.93" fill="#f3f9ee" />
                </svg>
            </div>
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

<style scoped>
@keyframes co-spinner-spin {
    to { transform: rotate(360deg); }
}
@keyframes co-spinner-breathe {
    0%, 100% { transform: translate(-50%, -50%) scale(1); }
    50% { transform: translate(-50%, -50%) scale(0.82); }
}
.co-spinner-arc {
    transform-origin: center;
    animation: co-spinner-spin 0.9s linear infinite;
}
.co-spinner-mark {
    animation: co-spinner-breathe 1.7s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
    .co-spinner-arc,
    .co-spinner-mark {
        animation: none;
    }
}
</style>
