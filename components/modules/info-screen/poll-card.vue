<template>
    <div class="flex h-full gap-[4vh] p-[4vh]">
        <div class="flex min-w-0 flex-1 flex-col">
            <p class="text-[2vh] font-semibold uppercase tracking-widest text-[#2dbab2]">{{ $t('infoScreenDisplay.poll') }}</p>
            <h3 class="mt-[1vh] text-[4.4vh] font-semibold leading-tight">{{ poll.question }}</h3>

            <!-- One measure per option: bars in one hue, the leader a step stronger. -->
            <ul class="mt-[3vh] flex flex-1 flex-col justify-center gap-[2.2vh]">
                <li v-for="(option, index) in poll.options" :key="index">
                    <div class="mb-[0.8vh] flex items-baseline justify-between gap-[2vh] text-[2.8vh]">
                        <span class="truncate font-light">{{ option.title }}</span>
                        <span class="shrink-0 font-semibold tabular-nums">{{ shares[index] }}%</span>
                    </div>
                    <div class="h-[2.4vh] overflow-hidden rounded-full bg-white/10">
                        <div class="bar h-full rounded-full"
                            :class="isLeader(index) ? 'bg-[#2dbab2]' : 'bg-[#2dbab2]/50'"
                            :style="{ width: `${ready ? shares[index] : 0}%`, transitionDelay: `${index * 0.12}s` }" />
                    </div>
                </li>
            </ul>
            <p class="mt-[2vh] text-[2.2vh] text-white/60">{{ $t('infoScreenDisplay.pollVotes', { count: poll.total }) }}</p>
        </div>

        <div v-if="voteUrl" class="flex w-[26vh] shrink-0 flex-col items-center justify-center gap-[1.6vh] text-center">
            <div class="qr rounded-2xl bg-white p-[1.6vh]">
                <QRCodeVue3 :value="voteUrl" :width="220" :height="220" :qrOptions="{ errorCorrectionLevel: 'M' }"
                    :dotsOptions="{ type: 'rounded', color: '#0f4c75' }"
                    :cornersSquareOptions="{ type: 'extra-rounded', color: '#0f4c75' }"
                    :cornersDotOptions="{ type: 'dot', color: '#2dbab2' }" />
            </div>
            <p class="text-[2.6vh] font-semibold">{{ $t('infoScreenDisplay.pollScan') }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { pollShares } from '@/composables/infoScreen'

const QRCodeVue3 = defineAsyncComponent(() => import('qrcode-vue3'))

const props = defineProps<{
    poll: { question: string; options: { title: string; votes: number }[]; total: number }
    voteUrl?: string | null
}>()

const shares = computed(() => pollShares(props.poll.options))
const top = computed(() => Math.max(0, ...props.poll.options.map((option) => option.votes)))
const isLeader = (index: number) => top.value > 0 && props.poll.options[index].votes === top.value

// Bars grow from zero when the card comes on screen.
const ready = ref(false)
onMounted(() => requestAnimationFrame(() => requestAnimationFrame(() => { ready.value = true })))
</script>

<style scoped>
.bar {
    transition: width 1.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.qr {
    animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
    50% {
        box-shadow: 0 0 0 1.2vh rgba(45, 186, 178, 0.25);
    }
}

@media (prefers-reduced-motion: reduce) {
    .bar {
        transition: none;
    }

    .qr {
        animation: none;
    }
}
</style>
