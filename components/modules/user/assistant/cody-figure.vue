<template>
    <svg :width="size" :height="size" viewBox="0 0 128 128" fill="none" aria-hidden="true"
        :class="['cody-figure', waving && 'cody-figure--waving']">
        <defs>
            <linearGradient :id="gradientId" x1="15" y1="10" x2="112" y2="115" gradientUnits="userSpaceOnUse">
                <stop stop-color="#0F4C75" />
                <stop offset="1" stop-color="#10A6A6" />
            </linearGradient>
        </defs>

        <path class="cody-figure__c" d="M95 28A45 45 0 1 0 109 67" :stroke="`url(#${gradientId})`" stroke-width="16"
            stroke-linecap="round" />

        <rect x="38" y="43" width="53" height="43" rx="19" fill="#0F4C75" />
        <path class="cody-figure__eyes" d="M49 65c4-7 9-7 13 0M68 65c4-7 9-7 13 0" stroke="#fff" stroke-width="5"
            stroke-linecap="round" />

        <path d="M64 43V28" stroke="#10A6A6" stroke-width="6" stroke-linecap="round" />
        <circle class="cody-figure__tip" cx="64" cy="23" r="6" fill="#10A6A6" />
    </svg>
</template>

<script setup lang="ts">
/**
 * Cody with a face: the mascot from the icon files, unchanged - same C, same
 * rounded face, same closed smiling eyes, same antenna.
 *
 * Deliberately rare. The guide reserves the mascot for "særlige kontekster
 * (hilsen, loading)", and that restraint is the point: a character beside every
 * answer is wallpaper by Wednesday, while one that appears where someone has a
 * moment to notice it - the empty panel, the first greeting - is what makes the
 * assistant feel like somebody rather than a field with a send button.
 */
withDefaults(defineProps<{
    size?: number
    /** A small tilt on appearing. The greeting only. */
    waving?: boolean
}>(), {
    size: 40,
    waving: false,
})

const gradientId = `cody-figure-${Math.random().toString(36).slice(2, 9)}`
</script>

<style scoped>
.cody-figure {
    transform-origin: 50% 78%;
}

.cody-figure--waving {
    animation: cody-greet 2.6s ease-in-out 1;
}

@keyframes cody-greet {

    0%,
    52%,
    100% {
        transform: rotate(0deg);
    }

    12% {
        transform: rotate(-6deg);
    }

    26% {
        transform: rotate(4.5deg);
    }

    39% {
        transform: rotate(-2.5deg);
    }
}

/* The eyes blink once at the end of the wave, which is the only moment the
   figure is doing anything other than existing. */
.cody-figure--waving .cody-figure__eyes {
    animation: cody-blink 2.6s ease-in-out 1;
    transform-origin: 50% 50%;
}

@keyframes cody-blink {

    0%,
    68%,
    78%,
    100% {
        transform: scaleY(1);
    }

    73% {
        transform: scaleY(.35);
    }
}

@media (prefers-reduced-motion: reduce) {

    .cody-figure--waving,
    .cody-figure--waving .cody-figure__eyes {
        animation: none;
    }
}
</style>
