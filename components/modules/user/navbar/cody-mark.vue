<template>
    <svg :width="size" :height="size" viewBox="0 0 32 32" fill="none" aria-hidden="true"
        :class="['cody-mark', `cody-mark--${resolvedState}`, mono && 'cody-mark--mono']">
        <!-- The C: an open ring, gapped towards the top right. Drawn as an arc
             rather than a dashed circle so the gap is the same at 16px as at
             128px and the stroke ends stay round. -->
        <path class="cody-mark__c" :d="ARC" :stroke-width="ringWidth" stroke-linecap="round" />
        <circle class="cody-mark__core" :cx="resolvedState === 'blocked' ? 20 : 16" cy="16" :r="coreRadius" />
        <!-- Only for the contexts the guide names: onboarding, marketing, empty
             states. Everywhere else the mark carries no ornament. -->
        <path v-if="sparkle" class="cody-mark__sparkle"
            d="M25.4 4.2l.86 2.18 2.18.86-2.18.86-.86 2.18-.86-2.18-2.18-.86 2.18-.86z" />
    </svg>
</template>

<script setup lang="ts">
/**
 * Cody's mark: the C-form from the icon guide - CitizenOne's own ring language,
 * opened into a C, with a filled core.
 *
 * Two tones by default, as the guide specifies: the C in the deep teal and the
 * core in the bright one. The C takes `currentColor`, so it is whatever the
 * surface says it is (white inside a navy avatar, deep teal on white), and the
 * core keeps its own colour unless `mono` is set - which is what makes the same
 * component work in the topbar, in the panel header and inside a card.
 *
 * The state lives in the mark instead of in a spinner beside it:
 *
 *   idle       the C rests. Present, asking for nothing.
 *   working    the C closes and turns. Something is being read.
 *   attention  the core breathes. Something was found; nothing is forced.
 *   blocked    the C stays open and the core sits off-centre. Refused, out of
 *              capacity, or answering without the company index.
 */
const props = withDefaults(defineProps<{
    size?: number
    /**
     * Kept for the callers written before there were states. `working` is the
     * same as `state="working"` and still wins when true, so no caller had to
     * change to get the rest of this.
     */
    working?: boolean
    state?: 'idle' | 'working' | 'attention' | 'blocked'
    /** One colour throughout, for surfaces that already carry the brand. */
    mono?: boolean
    /** The sparkle variant. Onboarding, marketing and empty states only. */
    sparkle?: boolean
}>(), {
    size: 20,
    working: false,
    state: 'idle',
    mono: false,
    sparkle: false,
})

// Open at the top right, ~68° of gap: enough to read as a C at 16px without
// the ring looking broken at 128px.
const ARC = 'M21.9 6.6A11 11 0 1 0 27 16'

const resolvedState = computed(() => (props.working ? 'working' : (props.state ?? 'idle')))

// The guide draws a heavy ring and a core just under half its inner width. Both
// scale with the icon so a 16px mark keeps the same weight as a 64px one.
const ringWidth = computed(() => (props.size <= 20 ? 5 : 4.6))
const coreRadius = computed(() => (props.size <= 20 ? 4.6 : 4.4))
</script>

<style scoped>
.cody-mark__c {
    stroke: currentColor;
    transform-origin: 50% 50%;
}

.cody-mark__core,
.cody-mark__sparkle {
    /* The bright teal from the icon guide. Overridable per surface with
       --cody-core, which is how the white-on-navy avatar gets a white core. */
    fill: var(--cody-core, #0ea5a8)  /* = theme colors.cody.DEFAULT */;
    transition: cx .22s ease-out;
}

.cody-mark--mono .cody-mark__core,
.cody-mark--mono .cody-mark__sparkle {
    fill: currentColor;
}

.cody-mark--working .cody-mark__c {
    animation: cody-close-c 1.25s linear infinite;
}

.cody-mark--attention .cody-mark__core {
    animation: cody-breathe 1.9s ease-in-out infinite;
    transform-origin: 50% 50%;
}

/* The C turns. It cannot close - the path is a 302-degree arc, and a dash
   longer than the path just draws the whole path - so the working state is the
   mark itself rotating, with the gap sweeping round. */
@keyframes cody-close-c {
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
        transform: scale(1.26);
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
