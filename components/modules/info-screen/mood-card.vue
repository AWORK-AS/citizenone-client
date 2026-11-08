<template>
    <div class="flex h-full items-center gap-[5vh] p-[5vh]">
        <div class="flex min-w-0 flex-1 flex-col">
            <p class="text-[2vh] font-semibold uppercase tracking-widest text-[#2dbab2]">{{ $t('infoScreenDisplay.mood') }}</p>
            <h3 class="mt-[1vh] text-[5vh] font-semibold leading-tight [text-wrap:balance]">{{ $t('infoScreenDisplay.moodQuestion') }}</h3>
            <!-- The three answers, as the phone shows them -->
            <div class="mt-[4vh] flex gap-[4vh]">
                <Icon v-for="(face, index) in FACES" :key="face" :name="face" class="face text-[11vh] text-white/90"
                    :style="{ animationDelay: `${index * 0.4}s` }" />
            </div>
            <p class="mt-[3vh] text-[2.4vh] font-light text-white/60">{{ $t('infoScreenDisplay.moodAnonymous') }}</p>
        </div>

        <div v-if="url" class="flex w-[26vh] shrink-0 flex-col items-center justify-center gap-[1.6vh] text-center">
            <div class="rounded-2xl bg-white p-[1.6vh]">
                <QRCodeVue3 :value="url" :width="220" :height="220" :qrOptions="{ errorCorrectionLevel: 'M' }"
                    :dotsOptions="{ type: 'rounded', color: '#0f4c75' }"
                    :cornersSquareOptions="{ type: 'extra-rounded', color: '#0f4c75' }"
                    :cornersDotOptions="{ type: 'dot', color: '#2dbab2' }" />
            </div>
            <p class="text-[2.6vh] font-semibold">{{ $t('infoScreenDisplay.moodScan') }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
const QRCodeVue3 = defineAsyncComponent(() => import('qrcode-vue3'))

defineProps<{ url?: string | null }>()

const FACES = ['ph:smiley-sad', 'ph:smiley-meh', 'ph:smiley']
</script>

<style scoped>
.face {
    animation: bob 3.6s ease-in-out infinite;
}

@keyframes bob {
    50% {
        transform: translateY(-1vh);
    }
}

@media (prefers-reduced-motion: reduce) {
    .face {
        animation: none;
    }
}
</style>
