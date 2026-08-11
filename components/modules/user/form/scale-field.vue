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
                        :title="previousScore(rater.key) === step ? $t('forms.scale.previousHere') : ''"
                        @click="setScore(rater.key, rater.label, step)">
                        <span class="relative inline-block">
                            {{ step }}
                            <span v-if="previousScore(rater.key) === step && scoreOf(rater.key) !== step"
                                class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                                :style="{ backgroundColor: colourFor(step), opacity: 0.55 }"></span>
                        </span>
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

        <!-- Earlier measurements. The movement is the point, so it is drawn. -->
        <div v-if="props.field?.showHistory && historyDates.length > 1" class="pt-3 border-t border-gray-200">
            <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                {{ $t('forms.scale.earlier') }}
            </p>
            <div class="overflow-x-auto">
                <svg :viewBox="`0 0 ${chart.width} ${chart.height}`" class="w-full h-auto"
                    style="min-width: 320px" role="img" :aria-label="$t('forms.scale.earlier')">
                    <line v-for="tick in chart.ticks" :key="'g' + tick.value" :x1="chart.padLeft" :y1="tick.y"
                        :x2="chart.width - chart.padRight" :y2="tick.y" stroke="#e5e7eb" stroke-width="1" />
                    <text v-for="tick in chart.ticks" :key="'t' + tick.value" :x="chart.padLeft - 6" :y="tick.y + 3"
                        text-anchor="end" font-size="9" fill="#9ca3af">{{ tick.value }}</text>
                    <text v-for="(point, i) in chart.xLabels" :key="'x' + i" :x="point.x"
                        :y="chart.height - 6" text-anchor="middle" font-size="9" fill="#9ca3af">
                        {{ point.label }}
                    </text>
                    <g v-for="series in chart.series" :key="'s' + series.key">
                        <polyline :points="series.points" fill="none" :stroke="series.colour" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round" />
                        <circle v-for="(dot, i) in series.dots" :key="'d' + i" :cx="dot.x" :cy="dot.y" r="3"
                            :fill="series.colour" />
                        <text :x="chart.width - chart.padRight + 6" :y="series.endY + 3" font-size="9"
                            :fill="series.colour" font-weight="600">{{ series.label }}</text>
                    </g>
                </svg>
            </div>
        </div>

        <p v-else-if="props.field?.showHistory && historyDates.length === 1"
            class="pt-3 border-t border-gray-200 text-xs text-gray-500">
            {{ $t('forms.scale.needsTwo') }}
        </p>

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

/** The most recent earlier score, marked faintly so movement is visible in place. */
function previousScore(raterKey: string): number | null {
    const dates = historyDates.value
    for (let i = dates.length - 1; i >= 0; i--) {
        const score = historyScore(raterKey, dates[i])
        if (score !== null) return score
    }

    return null
}

const chart = computed(() => {
    const width = 520
    const height = 170
    const padLeft = 24
    const padRight = 78
    const padTop = 10
    const padBottom = 22
    const innerW = width - padLeft - padRight
    const innerH = height - padTop - padBottom
    const dates = historyDates.value
    const max = maxScore.value

    const x = (i: number) => dates.length < 2
        ? padLeft
        : padLeft + (innerW * i) / (dates.length - 1)
    const y = (value: number) => padTop + innerH - (innerH * value) / max

    const ticks = [0, Math.round(max / 2), max].map((value) => ({ value, y: y(value) }))
    const xLabels = dates.map((date, i) => ({ x: x(i), label: shortDate(date) }))

    const series = historyRaters.value.map((raterKey: string) => {
        const dots: any[] = []
        dates.forEach((date, i) => {
            const score = historyScore(raterKey, date)
            if (score !== null) dots.push({ x: x(i), y: y(score) })
        })

        return {
            key: raterKey,
            label: historyLabel(raterKey),
            colour: colourFor(previousScore(raterKey)),
            points: dots.map((d) => `${d.x},${d.y}`).join(' '),
            dots,
            endY: dots.length ? dots[dots.length - 1].y : y(0),
        }
    }).filter((s: any) => s.dots.length > 0)

    return { width, height, padLeft, padRight, ticks, xLabels, series }
})

function shortDate(date: string): string {
    const parts = (date || '').split('-')

    return parts.length === 3 ? `${parts[2]}/${parts[1]}` : date
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
