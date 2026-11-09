<template>
    <div class="flex h-full flex-col p-[4vh]">
        <p class="flex items-center gap-[1.2vh] text-[2vh] font-semibold uppercase tracking-widest text-[#2dbab2]">
            <Icon name="ph:calendar-dots" /> {{ $t('infoScreenDisplay.week') }}
        </p>
        <div class="mt-[2.4vh] grid min-h-0 flex-1 grid-cols-7 gap-[1vh]">
            <div v-for="(day, index) in week" :key="day.weekday"
                class="day flex min-h-0 flex-col overflow-hidden rounded-xl px-[1vh] py-[1.4vh]"
                :class="day.weekday === today ? 'bg-[#2dbab2]/20 ring-1 ring-[#2dbab2]/60' : 'bg-white/[0.04]'"
                :style="{ animationDelay: `${index * 0.07}s` }">
                <p class="text-center text-[2vh] font-semibold uppercase tracking-wider"
                    :class="day.weekday === today ? 'text-[#2dbab2]' : 'text-white/60'">{{ dayName(day.weekday) }}</p>
                <ul class="mt-[1.2vh] space-y-[1vh]">
                    <li v-for="activity in day.activities.slice(0, MAX_PER_DAY)" :key="`${activity.time}${activity.title}`" class="text-[1.7vh] leading-tight">
                        <span class="block font-semibold tabular-nums text-white/60">{{ activity.time ?? '' }}</span>
                        <span class="flex items-start gap-[0.5vh] font-light">
                            <Icon v-if="activityIcon(activity.icon)" :name="activityIcon(activity.icon)!" class="mt-[0.2vh] shrink-0" />
                            <span class="line-clamp-2 min-w-0 hyphens-auto [overflow-wrap:anywhere]" :lang="lang">{{ activity.title }}</span>
                        </span>
                    </li>
                    <li v-if="day.activities.length > MAX_PER_DAY" class="text-[1.6vh] text-white/40">
                        +{{ day.activities.length - MAX_PER_DAY }}
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { activityIcon, type ScreenActivity } from '@/composables/infoScreen'

/** The whole week's program, Monday first, today marked. */
const props = defineProps<{
    week: { weekday: number; activities: ScreenActivity[] }[]
    today: number
    locale: string
}>()

const MAX_PER_DAY = 5

// For hyphenation of long words in the narrow columns.
const lang = computed(() => props.locale.split('-')[0])

// ISO weekday to a short local name: 2024-01-01 was a Monday.
function dayName(weekday: number): string {
    return new Date(Date.UTC(2024, 0, weekday)).toLocaleDateString(props.locale, { weekday: 'short', timeZone: 'UTC' }).replace('.', '')
}
</script>

<style scoped>
.day {
    animation: rise 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes rise {
    from {
        opacity: 0;
        transform: translateY(2vh);
    }
}

@media (prefers-reduced-motion: reduce) {
    .day {
        animation: none;
    }
}
</style>
