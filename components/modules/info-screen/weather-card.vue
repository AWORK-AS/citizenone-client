<template>
    <div class="flex h-full flex-col p-[4vh]">
        <div class="flex items-start justify-between gap-[3vh]">
            <div>
                <p class="text-[2vh] font-semibold uppercase tracking-widest text-[#2dbab2]">
                    {{ $t('infoScreenDisplay.weatherToday') }}<span v-if="place"> · {{ place }}</span>
                </p>
                <div class="mt-[1vh] flex items-center gap-[2vh]">
                    <Icon :name="weatherIcon(weather.now.symbol)" class="weather-icon text-[9vh] text-white" />
                    <p class="text-[10vh] font-light leading-none tabular-nums">{{ formatTemp(weather.now.temperature) }}</p>
                </div>
            </div>
            <div v-if="curve.min !== null" class="text-right text-[2.6vh] font-light text-white/70">
                <p><Icon name="ph:arrow-up" class="align-[-0.3vh]" /> {{ formatTemp(curve.max) }}</p>
                <p><Icon name="ph:arrow-down" class="align-[-0.3vh]" /> {{ formatTemp(curve.min) }}</p>
            </div>
        </div>

        <!-- Temperature for the next hours: one series, so no legend; the title names it. -->
        <svg v-if="curve.line" :viewBox="`0 0 ${WIDTH} ${HEIGHT + 70}`" class="mt-auto w-full" role="img"
            :aria-label="$t('infoScreenDisplay.weatherChart')">
            <defs>
                <linearGradient id="weather-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stop-color="#2dbab2" stop-opacity="0.35" />
                    <stop offset="1" stop-color="#2dbab2" stop-opacity="0" />
                </linearGradient>
            </defs>
            <path :d="curve.area" fill="url(#weather-area)" class="weather-area" />
            <path :d="curve.line" fill="none" stroke="#2dbab2" stroke-width="3" stroke-linecap="round"
                pathLength="1" class="weather-line" />
            <g v-for="(point, index) in curve.points" :key="point.time">
                <template v-if="index % LABEL_EVERY === 0">
                    <circle :cx="point.x" :cy="point.y" :r="index === 0 ? 9 : 6" :fill="index === 0 ? '#ffffff' : '#2dbab2'"
                        stroke="#0a1f33" stroke-width="3" class="weather-dot" :style="{ animationDelay: `${0.6 + index * 0.08}s` }" />
                    <text :x="point.x" :y="point.y - 20" text-anchor="middle" class="fill-white text-[26px] font-semibold"
                        :style="{ animationDelay: `${0.6 + index * 0.08}s` }">{{ formatTemp(point.temperature) }}</text>
                    <text :x="point.x" :y="HEIGHT + 50" text-anchor="middle" class="fill-white/60 text-[22px]">
                        {{ index === 0 ? $t('infoScreenDisplay.now') : point.time }}
                    </text>
                </template>
            </g>
        </svg>

        <p class="mt-[1vh] text-right text-[1.4vh] text-white/40">{{ $t('infoScreenDisplay.weatherCredit') }}</p>
    </div>
</template>

<script setup lang="ts">
import { weatherCurve, weatherIcon, type WeatherHour } from '@/composables/infoScreen'

const props = defineProps<{
    weather: { now: { temperature: number; symbol: string | null }; hours: WeatherHour[] }
    place?: string | null
}>()

const WIDTH = 1000
const HEIGHT = 300
// A label on every third hour keeps the numbers from touching.
const LABEL_EVERY = 3

const curve = computed(() => weatherCurve(props.weather.hours ?? [], WIDTH, HEIGHT, 40, 50))

function formatTemp(value: number | null): string {
    return value === null ? '' : `${Math.round(value)}°`
}
</script>

<style scoped>
.weather-line {
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    animation: draw 1.8s ease-out forwards;
}

.weather-area {
    opacity: 0;
    animation: appear 1.2s ease-out 0.8s forwards;
}

.weather-dot,
text {
    opacity: 0;
    animation: appear 0.5s ease-out forwards;
}

.weather-icon {
    animation: float 6s ease-in-out infinite;
}

@keyframes draw {
    to {
        stroke-dashoffset: 0;
    }
}

@keyframes appear {
    to {
        opacity: 1;
    }
}

@keyframes float {
    50% {
        transform: translateY(-0.8vh);
    }
}

@media (prefers-reduced-motion: reduce) {
    .weather-line,
    .weather-area,
    .weather-dot,
    text,
    .weather-icon {
        animation: none;
        opacity: 1;
        stroke-dashoffset: 0;
    }
}
</style>
