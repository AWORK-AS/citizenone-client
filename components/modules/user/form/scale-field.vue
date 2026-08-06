<template>
    <div class="p-5 space-y-4">
        <div class="flex gap-x-3">
            <div v-if="props.number" class="pt-0.5">{{ props.number }}.</div>
            <div class="grow">
                <h3 class="font-medium">
                    {{ props.field?.value }}
                    <span v-if="props.field?.required" class="text-red-600">*</span>
                </h3>
                <p v-if="props.field?.helpText" class="text-sm text-gray-500 mt-1">{{ props.field.helpText }}</p>
            </div>
        </div>

        <!-- Band header: the instrument itself, so the numbers below mean something. -->
        <div class="flex rounded-sm overflow-hidden">
            <div v-for="(band, bandIndex) in bands" :key="'band_' + bandIndex"
                class="py-1 px-1 text-center text-[10px] font-semibold uppercase tracking-wide text-white truncate"
                :style="{ backgroundColor: band.color, width: bandWidth(bandIndex) }">
                {{ band.label }}
            </div>
        </div>

        <!-- One row per party. Staff record every assessment, so all rows are editable here. -->
        <div class="space-y-1.5">
            <div v-for="(rater, raterIndex) in raters" :key="'rater_' + raterIndex"
                class="flex items-center gap-x-3">
                <div class="w-32 shrink-0 text-sm text-gray-700 truncate" :title="rater.label">
                    {{ rater.label }}
                </div>
                <div class="grow flex rounded-sm border border-gray-300 overflow-hidden">
                    <button v-for="step in steps" :key="'step_' + raterIndex + '_' + step" type="button"
                        class="grow py-1.5 text-xs border-r border-gray-200 last:border-r-0 transition-colors"
                        :class="scoreOf(rater.key) === step
                            ? 'text-white font-semibold'
                            : 'text-gray-600 hover:bg-gray-100'"
                        :style="scoreOf(rater.key) === step ? { backgroundColor: colourFor(step) } : {}"
                        :aria-pressed="scoreOf(rater.key) === step"
                        @click="setScore(rater.key, rater.label, step)">
                        {{ step }}
                    </button>
                </div>
                <button type="button" class="shrink-0 text-xs text-gray-400 hover:text-gray-700 w-12 text-right"
                    @click="clearScore(rater.key)">
                    {{ $t('forms.scale.clear') }}
                </button>
            </div>
        </div>

        <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span class="text-sm text-gray-600">{{ $t('forms.scale.measuredAt') }}</span>
            <div class="w-48">
                <FormDateField :name="'scale_date_' + props.fieldIndex" v-model="measuredAt" />
            </div>
        </div>

        <p class="text-xs text-gray-500">{{ $t('forms.scale.recordedByHint') }}</p>

        <!-- Earlier measurements, so the movement is visible while writing. -->
        <div v-if="props.field?.showHistory && history.length > 0" class="pt-2 border-t border-gray-200">
            <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                {{ $t('forms.scale.earlier') }}
            </p>
            <div class="overflow-x-auto">
                <table class="text-sm min-w-full">
                    <thead>
                        <tr class="text-left text-xs text-gray-500">
                            <th class="pr-4 pb-1 font-medium">{{ $t('forms.scale.raterLabel') }}</th>
                            <th v-for="date in historyDates" :key="'h_' + date" class="pr-4 pb-1 font-medium">
                                {{ date }}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="rater in historyRaters" :key="'hr_' + rater">
                            <td class="pr-4 py-0.5 text-gray-700">{{ historyLabel(rater) }}</td>
                            <td v-for="date in historyDates" :key="'hc_' + rater + date" class="pr-4 py-0.5">
                                <span v-if="historyScore(rater, date) !== null"
                                    class="inline-block w-6 text-center rounded text-white text-xs"
                                    :style="{ backgroundColor: colourFor(historyScore(rater, date)) }">
                                    {{ historyScore(rater, date) }}
                                </span>
                                <span v-else class="text-gray-300">-</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { citizenScaleScoreService } from '@/components/api/user/CitizenScaleScoreService'

const props = defineProps({
    field: {
        type: Object,
        required: true,
    },
    modelValue: {
        type: [Object, String],
        required: false,
        default: null,
    },
    fieldIndex: {
        type: Number,
        default: 0,
    },
    number: {
        type: Number,
        default: 0,
    },
    citizenUuid: {
        type: String,
        default: '',
    },
})

const emit = defineEmits(['update:modelValue'])

const history = ref<any[]>([])

const maxScore = computed(() => Number(props.field?.maxScore) || 10)
const steps = computed(() => Array.from({ length: maxScore.value + 1 }, (_, i) => i))
const bands = computed(() => props.field?.bands ?? [])
const raters = computed(() => props.field?.raters ?? [])

/**
 * The answer travels as an object so a whole measurement stays one field. It can
 * arrive as a JSON string when an existing report is reopened.
 */
const answer = computed(() => {
    const value = props.modelValue
    if (!value) return { measured_at: today(), scores: [] }
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value)
            return { measured_at: parsed.measured_at || today(), scores: parsed.scores ?? [] }
        } catch {
            return { measured_at: today(), scores: [] }
        }
    }
    return { measured_at: value.measured_at || today(), scores: value.scores ?? [] }
})

const measuredAt = computed({
    get: () => answer.value.measured_at,
    set: (value: string) => emit('update:modelValue', { ...answer.value, measured_at: value }),
})

function today(): string {
    return new Date().toISOString().slice(0, 10)
}

function scoreOf(raterKey: string): number | null {
    const hit = answer.value.scores.find((s: any) => s.rater_key === raterKey)
    return hit ? Number(hit.score) : null
}

function setScore(raterKey: string, raterLabel: string, score: number) {
    const scores = answer.value.scores.filter((s: any) => s.rater_key !== raterKey)
    scores.push({ rater_key: raterKey, rater_label: raterLabel, score })
    emit('update:modelValue', { ...answer.value, scores })
}

function clearScore(raterKey: string) {
    emit('update:modelValue', {
        ...answer.value,
        scores: answer.value.scores.filter((s: any) => s.rater_key !== raterKey),
    })
}

/** The band a score falls in, so the marker carries the same colour as the ruler. */
function colourFor(score: number | null): string {
    if (score === null) return '#9ca3af'
    const band = bands.value.find((b: any) => Number(score) <= Number(b.to))
    return band?.color ?? bands.value[bands.value.length - 1]?.color ?? '#174560'
}

function bandWidth(bandIndex: number): string {
    const from = bandIndex === 0 ? 0 : Number(bands.value[bandIndex - 1]?.to ?? 0)
    const to = Number(bands.value[bandIndex]?.to ?? maxScore.value)
    return `${(Math.max(to - from, 0) / maxScore.value) * 100}%`
}

const historyDates = computed(() => [...new Set(history.value.map((h: any) => h.measured_at))])
const historyRaters = computed(() => [...new Set(history.value.map((h: any) => h.rater_key))])

function historyLabel(raterKey: string): string {
    return history.value.find((h: any) => h.rater_key === raterKey)?.rater_label || raterKey
}

function historyScore(raterKey: string, date: string): number | null {
    const hit = history.value.find((h: any) => h.rater_key === raterKey && h.measured_at === date)
    return hit ? Number(hit.score) : null
}

async function fetchHistory() {
    if (!props.field?.showHistory || !props.citizenUuid || !props.field?.scaleKey) return
    try {
        const response = await citizenScaleScoreService.getScaleScores(props.citizenUuid, {
            scale_key: props.field.scaleKey,
            limit: 24,
        })
        history.value = response?.data ?? []
    } catch {
        // The measurement itself must still be recordable if the history cannot
        // be loaded, so a failure here is left silent rather than blocking.
        history.value = []
    }
}

onMounted(fetchHistory)
</script>
