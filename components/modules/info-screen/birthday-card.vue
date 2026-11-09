<template>
    <div class="relative flex h-full flex-col items-center justify-center overflow-hidden p-[5vh] text-center">
        <!-- Confetti, falling slowly -->
        <span v-for="piece in PIECES" :key="piece.left" class="confetti" aria-hidden="true"
            :style="{ left: `${piece.left}%`, background: piece.color, animationDelay: `${piece.delay}s`, animationDuration: `${piece.duration}s` }" />
        <Icon name="ph:cake" class="cake text-[14vh] text-[#2dbab2]" />
        <p class="mt-[2vh] text-[2.4vh] font-semibold uppercase tracking-widest text-[#2dbab2]">{{ $t('infoScreenDisplay.birthday') }}</p>
        <p class="mt-[1.4vh] font-semibold leading-tight" :class="names.length > 2 ? 'text-[5vh]' : 'text-[7vh]'">{{ nameList }}</p>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{ names: string[]; locale: string }>()

// "Anna, Bo og Leo", in the screen's language.
const nameList = computed(() => {
    try {
        return new Intl.ListFormat(props.locale, { type: 'conjunction' }).format(props.names)
    } catch {
        return props.names.join(', ')
    }
})

const COLORS = ['#2dbab2', '#ffffff', '#1b6d8a', '#fed7aa']
const PIECES = Array.from({ length: 18 }, (_, index) => ({
    left: (index * 37) % 100,
    color: COLORS[index % COLORS.length],
    delay: -((index * 0.7) % 6),
    duration: 6 + (index % 4),
}))
</script>

<style scoped>
.confetti {
    position: absolute;
    top: -2vh;
    width: 1vh;
    height: 1.6vh;
    border-radius: 0.3vh;
    opacity: 0.8;
    animation: fall linear infinite;
}

@keyframes fall {
    to {
        transform: translateY(110vh) rotate(540deg);
    }
}

.cake {
    animation: bounce 2.4s ease-in-out infinite;
}

@keyframes bounce {
    50% {
        transform: translateY(-1.4vh) rotate(-4deg);
    }
}

@media (prefers-reduced-motion: reduce) {
    .confetti {
        display: none;
    }

    .cake {
        animation: none;
    }
}
</style>
