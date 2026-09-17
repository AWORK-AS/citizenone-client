<template>
    <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" aria-hidden="true"
        :class="['cody-mark', `cody-mark--${resolvedState}`]">
        <circle class="cody-mark__ring" cx="12" cy="12" r="9.2" :stroke-width="strokeWidth" />
        <circle class="cody-mark__core" :cx="resolvedState === 'blocked' ? 15.2 : 12" cy="12" r="3.4" />
    </svg>
</template>

<script setup lang="ts">
/**
 * Cody's mark: an open ring with a core, taken from the CitizenOne ring rather
 * than from the sparkle every AI product has used since 2023.
 *
 * The ring is not decoration - it carries Cody's state, so the state lives in
 * the mark instead of in a spinner beside it. Four states, because those are
 * the four things a reader needs to tell apart:
 *
 *   idle       open ring, resting. Present, asking for nothing.
 *   working    the ring closes and turns. Something is being read.
 *   attention  the core breathes. Something was found; nothing is forced.
 *   blocked    the ring stays open and the core sits off-centre. Refused, out
 *              of capacity, or answering without the company index.
 *
 * Colour comes from `currentColor`, so the mark is whatever the surface it sits
 * on says it is and never carries a colour of its own. That is what lets the
 * same component sit in the topbar, in a panel header and inside a card.
 */
const props = withDefaults(defineProps<{
    size?: number
    strokeWidth?: number
    /**
     * Kept for the callers written before there were states. `working` is the
     * same thing as `state="working"` and still wins when it is true, so no
     * caller had to change to get the rest of this.
     */
    working?: boolean
    state?: 'idle' | 'working' | 'attention' | 'blocked'
}>(), {
    size: 16,
    strokeWidth: 3,
    working: false,
    state: 'idle',
})

const resolvedState = computed(() => (props.working ? 'working' : (props.state ?? 'idle')))
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
    transition: cx 220ms ease-out;
}

.cody-mark--working .cody-mark__ring {
    animation: cody-close-ring 1.15s ease-in-out infinite;
}

.cody-mark--attention .cody-mark__core {
    animation: cody-breathe 1.9s ease-in-out infinite;
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

@keyframes cody-breathe {

    0%,
    100% {
        opacity: 1;
        transform: scale(1);
    }

    50% {
        opacity: .7;
        transform: scale(1.28);
    }
}

.cody-mark--attention .cody-mark__core {
    transform-origin: 50% 50%;
}

@media (prefers-reduced-motion: reduce) {

    .cody-mark--working .cody-mark__ring,
    .cody-mark--attention .cody-mark__core {
        animation: none;
    }

    .cody-mark--working .cody-mark__ring {
        stroke-dasharray: 62 0;
    }
}
</style>
