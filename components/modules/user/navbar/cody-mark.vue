<template>
    <svg :width="size" :height="size" viewBox="0 0 128 128" fill="none" aria-hidden="true"
        :class="['cody-mark', `cody-mark--${resolvedState}`]">
        <defs v-if="!mono">
            <linearGradient :id="gradientId" x1="20" y1="15" x2="108" y2="110" gradientUnits="userSpaceOnUse">
                <stop stop-color="#0F4C75" />
                <stop offset="1" stop-color="#10A6A6" />
            </linearGradient>
        </defs>

        <!-- The C, exactly as drawn in the icon files: an arc, not a dashed
             circle, so the gap is identical at 16px and at 128px. -->
        <path class="cody-mark__c" :d="ARC[variant]" :stroke="mono ? 'currentColor' : `url(#${gradientId})`"
            :stroke-width="STROKE[variant]" stroke-linecap="round" />

        <circle class="cody-mark__core" :cx="coreX" :cy="CORE[variant].y" :r="CORE[variant].r"
            :fill="mono ? 'currentColor' : CORE[variant].fill" />

        <!-- The alternative mark carries a second, smaller dot in the gap. -->
        <circle v-if="variant === 'alternative'" class="cody-mark__dot" cx="108" cy="59" r="8"
            :fill="mono ? 'currentColor' : '#10A6A6'" />

        <!-- Onboarding, marketing and empty states only, per the guide. -->
        <path v-if="variant === 'sparkle'" class="cody-mark__sparkle"
            d="M104 9c2.4 9.8 5.2 12.6 15 15-9.8 2.4-12.6 5.2-15 15-2.4-9.8-5.2-12.6-15-15 9.8-2.4 12.6-5.2 15-15Z"
            :fill="mono ? 'currentColor' : '#10A6A6'" />
    </svg>
</template>

<script setup lang="ts">
/**
 * Cody's mark, from the icon files: CitizenOne's ring opened into a C, drawn in
 * the navy-to-teal gradient, with a filled core.
 *
 * The geometry and the colours are the delivered asset's, not an approximation:
 * same arcs, same stroke weights, same gradient stops, same core radii. The
 * three variants the guide defines are here, and the fourth - the mascot - is
 * its own component, because it is only used where there is time to notice it.
 *
 * Two things the asset cannot do on its own, and this can:
 *
 * `mono` drops the gradient for `currentColor`, which is what makes the mark
 * usable on a surface that already carries the brand - white inside a navy
 * disc, or ink-coloured in a line of text. The gradient is the default because
 * that is the identity; mono is the exception a surface asks for.
 *
 * The state lives in the mark instead of in a spinner beside it:
 *
 *   idle       the C rests. Present, asking for nothing.
 *   working    the C turns, gap sweeping round. Something is being read.
 *   attention  the core breathes. Something was found; nothing is forced.
 *   blocked    the core sits off-centre. Refused, out of capacity, or
 *              answering without the company index.
 */
const props = withDefaults(defineProps<{
    size?: number
    /**
     * Kept for the callers written before there were states. `working` is the
     * same as `state="working"` and still wins when true.
     */
    working?: boolean
    state?: 'idle' | 'working' | 'attention' | 'blocked'
    variant?: 'primary' | 'alternative' | 'sparkle'
    mono?: boolean
}>(), {
    size: 20,
    working: false,
    state: 'idle',
    variant: 'primary',
    mono: false,
})

const ARC = {
    primary: 'M94 28A45 45 0 1 0 108 64',
    alternative: 'M96 27A46 46 0 1 0 109 72',
    sparkle: 'M91 31A42 42 0 1 0 105 67',
} as const

const STROKE = { primary: 18, alternative: 17, sparkle: 17 } as const

const CORE = {
    primary: { x: 64, y: 64, r: 13, fill: '#10A6A6' },
    alternative: { x: 64, y: 65, r: 12, fill: '#0F4C75' },
    sparkle: { x: 61, y: 65, r: 12, fill: '#10A6A6' },
} as const

const gradientId = `cody-mark-${Math.random().toString(36).slice(2, 9)}`

const resolvedState = computed(() => (props.working ? 'working' : (props.state ?? 'idle')))

// Blocked pushes the core out towards the opening: the same mark, visibly not
// whole. Chosen over a colour change so it still reads on a mono surface.
const coreX = computed(() => (resolvedState.value === 'blocked'
    ? CORE[props.variant].x + 17
    : CORE[props.variant].x))

// One gradient per instance. Two marks sharing a def id is invalid markup, and
// a component has no idea how many of it exist on the page. Vue 3.5's useId()
// would be the right tool; this codebase is on 3.4.
</script>

<style scoped>
.cody-mark__c {
    transform-origin: 50% 50%;
}

.cody-mark__core {
    transition: cx .22s ease-out;
}

.cody-mark--working .cody-mark__c {
    animation: cody-turn 1.25s linear infinite;
}

.cody-mark--attention .cody-mark__core {
    animation: cody-breathe 1.9s ease-in-out infinite;
    transform-origin: 50% 50%;
}

@keyframes cody-turn {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

@keyframes cody-breathe {

    0%,
    100% {
        transform: scale(1);
        opacity: 1;
    }

    50% {
        transform: scale(1.22);
        opacity: .72;
    }
}

@media (prefers-reduced-motion: reduce) {

    .cody-mark--working .cody-mark__c,
    .cody-mark--attention .cody-mark__core {
        animation: none;
    }

    .cody-mark--working .cody-mark__c {
        transform: rotate(45deg);
    }
}
</style>
