<template>
    <div class="space-y-2">
        <div class="flex items-baseline justify-between gap-x-3">
            <FormLabel :label="$t('wellbeing.ruler.title')" />
            <span class="text-xs text-gray-500">{{ $t('wellbeing.ruler.optional') }}</span>
        </div>
        <p class="text-xs text-gray-500">{{ $t('wellbeing.ruler.hint', { max: MAX_SCORE }) }}</p>

        <div class="space-y-1.5">
            <div v-for="row in props.rows" :key="row.key" class="flex items-center gap-x-3">
                <div class="w-32 shrink-0 text-sm text-gray-700 truncate" :title="row.label">{{ row.label }}</div>
                <div class="grow flex rounded-sm border border-gray-300 overflow-hidden" role="group"
                    :aria-label="row.label">
                    <button v-for="step in steps" :key="row.key + '_' + step" type="button"
                        class="grow py-1.5 border-r border-gray-200 last:border-r-0 transition-colors"
                        :class="[
                            Number.isInteger(step) ? 'text-xs' : 'text-[10px]',
                            scoreOf(row.key) === step
                                ? 'text-white font-semibold bg-secondary'
                                : Number.isInteger(step) ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-400 hover:bg-gray-100',
                        ]"
                        :aria-pressed="scoreOf(row.key) === step"
                        @click="setScore(row.key, step)">
                        {{ formatStep(step) }}
                    </button>
                </div>
                <button type="button" class="shrink-0 text-xs text-gray-400 hover:text-gray-700 w-12 text-right"
                    :disabled="scoreOf(row.key) === null" @click="setScore(row.key, null)">
                    {{ $t('wellbeing.ruler.clear') }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

// The same instrument as the ruler on the inquiry: 0-10, read off at a mark or
// halfway between two.
const MAX_SCORE = 10

const props = defineProps({
    // One row per child in the case, or a single row for the case itself.
    rows: {
        type: Array as () => Array<{ key: string, label: string }>,
        required: true,
    },
    modelValue: {
        type: Object as () => Record<string, number | null>,
        required: true,
    },
})

const emit = defineEmits(['update:modelValue'])

const { locale } = useI18n()

const steps = Array.from({ length: MAX_SCORE * 2 + 1 }, (_, i) => i * 0.5)

// 4.5 reads as 4,5 everywhere but English.
const formatter = computed(() => new Intl.NumberFormat(locale.value === 'en' ? 'en-GB' : 'da-DK'))

function formatStep(step: number): string {
    return formatter.value.format(step)
}

function scoreOf(key: string): number | null {
    const value = props.modelValue?.[key]
    return value === null || value === undefined ? null : Number(value)
}

function setScore(key: string, score: number | null) {
    emit('update:modelValue', { ...props.modelValue, [key]: score })
}
</script>
