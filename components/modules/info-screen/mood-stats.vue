<template>
    <div>
        <!-- Legend: face + word, so it never rests on colour alone -->
        <div class="flex flex-wrap gap-4 text-xs text-slate-600">
            <span v-for="mood in MOOD_STYLES" :key="mood.key" class="flex items-center gap-1.5">
                <span class="h-2.5 w-2.5 rounded-sm" :style="{ background: mood.color }" />
                <Icon :name="mood.icon" class="h-4 w-4" />
                {{ $t(`settings.infoScreen.mood_${mood.key}`) }}
            </span>
        </div>

        <!-- One row per week, newest at the bottom: 100% bars, sad left, happy right -->
        <ul class="mt-3 space-y-1.5">
            <li v-for="week in weeks" :key="week.start" class="grid grid-cols-[4.5rem_1fr_3.5rem] items-center gap-3 text-xs">
                <span class="text-slate-500">{{ $t('settings.infoScreen.moodWeek', { week: week.week }) }}</span>
                <div v-if="week.total" class="flex h-5 gap-[2px] overflow-hidden rounded">
                    <div v-for="(share, index) in shares(week)" v-show="share > 0" :key="index"
                        class="flex items-center justify-center first:rounded-l last:rounded-r text-[10px] font-semibold"
                        :style="{ width: `${share}%`, background: MOOD_STYLES[index].color, color: MOOD_STYLES[index].ink }"
                        :title="`${$t(`settings.infoScreen.mood_${MOOD_STYLES[index].key}`)}: ${week.counts[index]} (${share}%)`">
                        <span v-if="share >= 12">{{ share }}%</span>
                    </div>
                </div>
                <span v-else class="text-slate-400">{{ week.too_few ? $t('settings.infoScreen.moodTooFew', { min: minAnswers }) : $t('settings.infoScreen.moodNone') }}</span>
                <span class="text-right tabular-nums text-slate-500">{{ week.total ? $t('settings.infoScreen.moodAnswers', { count: week.total }) : '' }}</span>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { moodShares } from '@/composables/infoScreen'

/** Diverging: amber for sad, a neutral gray middle, CitizenOne teal-blue for happy. Checked for colour blindness. */
const MOOD_STYLES = [
    { key: 'sad', icon: 'ph:smiley-sad', color: '#c2410c', ink: '#ffffff' },
    { key: 'meh', icon: 'ph:smiley-meh', color: '#cbd5e1', ink: '#1a2332' },
    { key: 'happy', icon: 'ph:smiley', color: '#1b6d8a', ink: '#ffffff' },
]

defineProps<{
    weeks: { week: number; start: string; total: number | null; counts: number[] | null; too_few: boolean }[]
    minAnswers: number
}>()

const shares = (week: { counts: number[] | null }) => moodShares(week.counts)
</script>
