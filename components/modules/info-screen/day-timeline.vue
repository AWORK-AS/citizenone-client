<template>
    <div class="panel-in relative px-[2vh] pb-[5.5vh] pt-[5vh]">
        <!-- Hour ticks -->
        <div class="relative h-[0.6vh] rounded-full bg-white/10">
            <div class="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#2dbab2]/20 to-[#2dbab2]/60 transition-[width] duration-1000"
                :style="{ width: `${nowPercent}%` }" />
            <span v-for="hour in hours" :key="hour" class="absolute top-[1.4vh] -translate-x-1/2 text-[1.6vh] tabular-nums text-white/40"
                :style="{ left: `${timelinePercent(hour * 60, range)}%` }">{{ String(hour).padStart(2, '0') }}</span>

            <!-- Activities; labels alternate above and below so neighbours do not collide -->
            <div v-for="(activity, index) in timed" :key="activity.time + activity.title"
                class="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                :style="{ left: `${timelinePercent(activity.minutes, range)}%` }">
                <span class="block size-[1.8vh] rounded-full border-[0.35vh] border-[#0a1f33]"
                    :class="{
                        'bg-white/30': activity.state === 'past',
                        'bg-[#2dbab2] now-dot': activity.state === 'now',
                        'bg-white': activity.state === 'next' || activity.state === 'later',
                    }" />
                <span class="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[1.8vh]"
                    :class="[
                        index % 2 === 0 ? 'bottom-[2.6vh]' : 'top-[3.2vh]',
                        activity.state === 'past' ? 'text-white/30' : activity.state === 'now' ? 'font-semibold text-[#2dbab2]' : 'text-white/80',
                    ]">
                    {{ activity.title }}
                </span>
            </div>

            <!-- Now -->
            <div class="absolute -top-[1.6vh] h-[3.8vh] w-[0.3vh] -translate-x-1/2 rounded-full bg-white transition-[left] duration-1000"
                :style="{ left: `${nowPercent}%` }" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { timelinePercent, timelineRange, type ActivityWithState } from '@/composables/infoScreen'

const props = defineProps<{
    activities: ActivityWithState[]
    nowMinutes: number
}>()

const timed = computed(() => props.activities.filter((activity) => activity.minutes !== null) as (ActivityWithState & { minutes: number })[])
const range = computed(() => timelineRange(props.activities))
const nowPercent = computed(() => timelinePercent(props.nowMinutes, range.value))
const hours = computed(() => {
    const list: number[] = []
    for (let hour = range.value.start / 60; hour <= range.value.end / 60; hour += 3) list.push(hour)
    return list
})
</script>

<style scoped>
.now-dot {
    animation: glow 2s ease-in-out infinite;
}

@keyframes glow {
    50% {
        box-shadow: 0 0 0 0.9vh rgba(45, 186, 178, 0.3);
    }
}

@media (prefers-reduced-motion: reduce) {
    .now-dot {
        animation: none;
    }
}
</style>
