<template>
    <svg :width="size" :height="size" viewBox="0 0 48 48" fill="none" aria-hidden="true"
        :class="['cody-figure', waving && 'cody-figure--waving']">
        <!-- Same C as the mark, at figure scale: the head is the ring language
             the whole product is built from, not a new shape. -->
        <path class="cody-figure__c" d="M33.6 10.4A17 17 0 1 0 41 24" stroke-width="5" stroke-linecap="round" />
        <!-- The face. Two closed, smiling eyes and an antenna - the only place
             in the product where Cody has a face, because it only appears where
             there is time to notice it. -->
        <path class="cody-figure__eye" d="M17.4 22.6a3.1 3.1 0 0 1 4.6 0" stroke-width="2.4"
            stroke-linecap="round" />
        <path class="cody-figure__eye" d="M26 22.6a3.1 3.1 0 0 1 4.6 0" stroke-width="2.4" stroke-linecap="round" />
        <path class="cody-figure__smile" d="M19.6 28.6a5.6 5.6 0 0 0 8.8 0" stroke-width="2.2"
            stroke-linecap="round" />
        <line class="cody-figure__antenna" x1="24" y1="6.6" x2="24" y2="3.4" stroke-width="2.2"
            stroke-linecap="round" />
        <circle class="cody-figure__tip" cx="24" cy="2.2" r="2.2" />
    </svg>
</template>

<script setup lang="ts">
/**
 * Cody with a face, from the icon guide's mascot variant.
 *
 * Deliberately rare. The guide puts the mascot in "særlige kontekster
 * (hilsen, loading)", and that restraint is the point: a character next to
 * every answer is wallpaper by Wednesday, while a character that appears where
 * someone has a moment to notice it - the empty panel, the first greeting - is
 * the thing that makes the assistant feel like somebody.
 *
 * Built from the same C as the mark rather than as a separate drawing, so the
 * figure and the 16px icon are recognisably the same character.
 */
withDefaults(defineProps<{
    size?: number
    /** A small tilt on appearing. Used for the greeting, nothing else. */
    waving?: boolean
}>(), {
    size: 40,
    waving: false,
})
</script>

<style scoped>
.cody-figure__c,
.cody-figure__eye,
.cody-figure__smile,
.cody-figure__antenna {
    stroke: currentColor;
    fill: none;
}

.cody-figure__tip {
    fill: var(--cody-core, #0ea5a8)  /* = theme colors.cody.DEFAULT */;
}

.cody-figure {
    transform-origin: 50% 80%;
}

.cody-figure--waving {
    animation: cody-greet 2.4s ease-in-out 1;
}

@keyframes cody-greet {

    0%,
    100% {
        transform: rotate(0deg);
    }

    12% {
        transform: rotate(-7deg);
    }

    24% {
        transform: rotate(5deg);
    }

    36% {
        transform: rotate(-3deg);
    }

    48% {
        transform: rotate(0deg);
    }
}

@media (prefers-reduced-motion: reduce) {
    .cody-figure--waving {
        animation: none;
    }
}
</style>
