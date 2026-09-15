<template>
    <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" aria-hidden="true"
        :class="['cody-mark', working && 'cody-mark--working']">
        <circle class="cody-mark__ring" cx="12" cy="12" r="9.2" :stroke-width="strokeWidth" />
        <circle class="cody-mark__core" cx="12" cy="12" r="3.4" />
    </svg>
</template>

<script setup lang="ts">
/**
 * Cody's mark: an open ring with a core, taken from the CitizenOne ring rather
 * than from the sparkle every AI product has used since 2023. The ring is not
 * decoration - it closes while Cody is working, so the state lives in the mark
 * instead of in a second spinner beside it.
 *
 * Colour comes from `currentColor`, so the mark is whatever the surface it sits
 * on says it is and never carries a colour of its own.
 */
withDefaults(defineProps<{
    size?: number
    strokeWidth?: number
    working?: boolean
}>(), {
    size: 16,
    strokeWidth: 3,
    working: false,
})
</script>

<style scoped>
.cody-mark__ring {
    stroke: currentColor;
    stroke-linecap: round;
    /* Open at roughly a quarter: a sibling of the CitizenOne ring, not a copy. */
    stroke-dasharray: 46 16;
    transform-origin: 50% 50%;
}

.cody-mark__core {
    fill: currentColor;
}

.cody-mark--working .cody-mark__ring {
    animation: cody-close-ring 1.15s ease-in-out infinite;
}

@keyframes cody-close-ring {
    0% {
        stroke-dasharray: 46 16;
        transform: rotate(0deg);
    }

    55% {
        stroke-dasharray: 62 0;
        transform: rotate(180deg);
    }

    100% {
        stroke-dasharray: 46 16;
        transform: rotate(360deg);
    }
}

@media (prefers-reduced-motion: reduce) {
    .cody-mark--working .cody-mark__ring {
        animation: none;
        stroke-dasharray: 62 0;
    }
}
</style>
