<template>
    <div class="rounded-xl border border-surface-200 bg-white shadow-card">
        <div class="flex flex-wrap items-center gap-3 border-b border-surface-100 px-4 py-3">
            <div class="min-w-0 flex-1">
                <p class="truncate font-semibold text-slate-900">{{ props.name }}</p>
                <span v-if="props.relationship"
                    class="mt-1 inline-flex items-center rounded-full bg-[#f0faf9] px-2 py-0.5 text-xs font-semibold text-[#1b6d8a]">
                    {{ props.relationship }}
                </span>
                <span v-else-if="props.isPrimary" class="text-xs text-slate-400">{{ $t('wellbeing.primary') }}</span>
            </div>
            <div v-if="latest" class="text-right">
                <p class="text-xs text-slate-400">{{ $t('wellbeing.latest') }}</p>
                <p class="text-lg font-semibold" :style="{ color: colourFor(latest.score) }">
                    {{ formatScore(latest.score) }}
                    <span class="text-xs font-normal text-slate-400">/ {{ MAX }}</span>
                </p>
            </div>
            <FormButton type="button" buttonStyle="action" @click="state.isAdding = !state.isAdding">
                <Icon name="ph:plus" class="size-4" />
                {{ $t('wellbeing.add') }}
            </FormButton>
        </div>

        <!-- A new measurement: the score, who gave it, and the day it came in. -->
        <div v-if="state.isAdding" class="space-y-3 border-b border-surface-100 bg-surface-50 px-4 py-4">
            <div class="flex rounded-sm border border-gray-300 overflow-hidden bg-white">
                <button v-for="step in STEPS" :key="'step_' + step" type="button"
                    class="grow py-1.5 border-r border-gray-200 last:border-r-0 transition-colors"
                    :class="[
                        Number.isInteger(step) ? 'text-xs' : 'text-[10px]',
                        state.form.score === step
                            ? 'text-white font-semibold'
                            : Number.isInteger(step) ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-400 hover:bg-gray-100',
                    ]"
                    :style="state.form.score === step ? { backgroundColor: colourFor(step) } : {}"
                    :aria-pressed="state.form.score === step" @click="state.form.score = step">
                    {{ formatScore(step) }}
                </button>
            </div>

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                    <FormLabel :for="`rater-${props.citizenUuid}`" :label="$t('wellbeing.givenBy')" />
                    <FormSelect :id="`rater-${props.citizenUuid}`" v-model="state.form.rater" :options="raterOptions"
                        :canClear="false" :canDeselect="false" />
                </div>
                <div v-if="state.form.rater === 'other'">
                    <FormLabel :for="`other-${props.citizenUuid}`" :label="$t('wellbeing.otherName')" />
                    <FormTextField :id="`other-${props.citizenUuid}`" :name="`other-${props.citizenUuid}`"
                        v-model="state.form.otherLabel" :placeholder="$t('wellbeing.otherPlaceholder')" :maxLength="60" />
                </div>
                <div>
                    <FormLabel :for="`date-${props.citizenUuid}`" :label="$t('wellbeing.receivedAt')" />
                    <FormDateField :id="`date-${props.citizenUuid}`" :name="`date-${props.citizenUuid}`"
                        v-model="state.form.measuredAt" />
                </div>
            </div>

            <div class="flex justify-end gap-2">
                <FormButton type="button" buttonStyle="cancel" @click="state.isAdding = false">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="button" buttonStyle="primary" :disabled="!canSave || state.isSaving" @click="save">
                    {{ $t('save') }}
                </FormButton>
            </div>
        </div>

        <!-- The movement is the point, so it is drawn - one line per party giving it. -->
        <div v-if="dates.length > 1" class="px-4 pt-4">
            <div class="overflow-x-auto">
                <svg :viewBox="`0 0 ${chart.width} ${chart.height}`" class="w-full h-auto" style="min-width: 320px"
                    role="img" :aria-label="$t('wellbeing.curve', { name: props.name })">
                    <line v-for="tick in chart.ticks" :key="'g' + tick.value" :x1="chart.padLeft" :y1="tick.y"
                        :x2="chart.width - chart.padRight" :y2="tick.y" stroke="#e5e7eb" stroke-width="1" />
                    <text v-for="tick in chart.ticks" :key="'t' + tick.value" :x="chart.padLeft - 6" :y="tick.y + 3"
                        text-anchor="end" font-size="9" fill="#9ca3af">{{ tick.value }}</text>
                    <text v-for="(point, i) in chart.xLabels" :key="'x' + i" :x="point.x" :y="chart.height - 6"
                        text-anchor="middle" font-size="9" fill="#9ca3af">{{ point.label }}</text>
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

        <p v-if="!state.scores.length && !state.isLoading" class="px-4 py-5 text-sm text-slate-400">
            {{ $t('wellbeing.empty') }}
        </p>

        <table v-else-if="state.scores.length" class="mt-2 w-full text-sm">
            <thead>
                <tr class="text-left text-xs text-slate-400">
                    <th class="px-4 py-2 font-medium">{{ $t('wellbeing.receivedAt') }}</th>
                    <th class="px-4 py-2 font-medium">{{ $t('wellbeing.givenBy') }}</th>
                    <th class="px-4 py-2 font-medium">{{ $t('wellbeing.score') }}</th>
                    <th class="px-4 py-2 font-medium hidden sm:table-cell">{{ $t('wellbeing.recordedBy') }}</th>
                    <th class="px-4 py-2"></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="score in newestFirst" :key="score.uuid" class="border-t border-surface-100">
                    <td class="px-4 py-2 text-slate-700">{{ longDate(score.measured_at) }}</td>
                    <td class="px-4 py-2 text-slate-700">{{ score.rater_label || score.rater_key }}</td>
                    <td class="px-4 py-2 font-semibold" :style="{ color: colourFor(score.score) }">
                        {{ formatScore(score.score) }}
                    </td>
                    <td class="px-4 py-2 text-slate-500 hidden sm:table-cell">{{ score.recorded_by }}</td>
                    <td class="px-4 py-2 text-right">
                        <!-- A score from a report is changed in the report, not here. -->
                        <button v-if="!score.from_report" type="button"
                            class="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                            :aria-label="$t('wellbeing.remove')" @click="state.removing = score">
                            <Icon name="ph:trash" class="size-4" />
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>

        <DialogConfirmation :isModalOpen="!!state.removing" :message="$t('wellbeing.removeConfirmation') + '?'"
            @close="state.removing = null" @confirm="remove" />
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useI18n } from 'vue-i18n'
import { citizenScaleScoreService } from '@/components/api/user/CitizenScaleScoreService'
import { useAlert } from '@/composables/alert'
import { useUserStore } from '@/store/user'

const props = defineProps({
    citizenUuid: { type: String, required: true },
    name: { type: String, required: true },
    relationship: { type: String, default: '' },
    isPrimary: { type: Boolean, default: false },
})

const { t } = useI18n()
const { errorAlert } = useAlert()
const userStore = useUserStore() as any

// The same key the report templates default to, so a score given here and one
// given in a report are one history.
const SCALE_KEY = 'trivsel'
const MAX = 10
const STEPS = Array.from({ length: MAX * 2 + 1 }, (_, i) => i / 2)

// The report defaults' bands, so a 3 reads as the same colour everywhere.
const BANDS = [
    { to: 2, color: '#96263a' },
    { to: 4, color: '#d9634a' },
    { to: 6, color: '#e0ab3d' },
    { to: 8, color: '#93b25c' },
    { to: 10, color: '#2f8577' },
]
const SERIES_COLOURS = ['#174560', '#2f8577', '#d9634a', '#7c5cbf', '#e0ab3d', '#1b6d8a', '#96263a', '#64748b']

// The parties Memox asked for. "staff" is the organisation itself, so it is
// shown under the company's own name.
const RATERS = ['caseworker', 'mother', 'father', 'parents', 'family', 'staff', 'citizen', 'other']

const raterOptions = computed(() => RATERS.map((key) => ({ value: key, label: raterLabel(key) })))

function raterLabel(key: string): string {
    if (key === 'staff') return userStore.getUser?.company?.name || t('wellbeing.raters.staff')

    return t('wellbeing.raters.' + key)
}

function emptyForm() {
    return {
        score: null as number | null,
        rater: 'caseworker',
        otherLabel: '',
        measuredAt: moment().format('YYYY-MM-DD'),
    }
}

const state = reactive({
    scores: [] as any[],
    isLoading: false,
    isAdding: false,
    isSaving: false,
    removing: null as any,
    form: emptyForm(),
})

const canSave = computed(() =>
    state.form.score !== null
    && !!state.form.measuredAt
    && (state.form.rater !== 'other' || state.form.otherLabel.trim() !== '')
)

const latest = computed(() => state.scores.length ? state.scores[state.scores.length - 1] : null)
const newestFirst = computed(() => [...state.scores].reverse())
const dates = computed(() => [...new Set(state.scores.map((s: any) => s.measured_at))])
const raterKeys = computed(() => [...new Set(state.scores.map((s: any) => s.rater_key))])

function colourFor(score: number | null): string {
    if (score === null) return '#9ca3af'

    return BANDS.find((band) => Number(score) <= band.to)?.color ?? BANDS[BANDS.length - 1].color
}

function formatScore(score: number): string {
    return Number(score).toLocaleString('da-DK', { maximumFractionDigits: 1 })
}

function longDate(date: string): string {
    return date ? moment(date).format('DD.MM.YYYY') : ''
}

function shortDate(date: string): string {
    const parts = (date || '').split('-')

    return parts.length === 3 ? `${parts[2]}/${parts[1]}` : date
}

const chart = computed(() => {
    const width = 520
    const height = 170
    const padLeft = 24
    const padRight = 90
    const padTop = 10
    const padBottom = 22
    const innerW = width - padLeft - padRight
    const innerH = height - padTop - padBottom
    const all = dates.value

    const x = (i: number) => all.length < 2 ? padLeft : padLeft + (innerW * i) / (all.length - 1)
    const y = (value: number) => padTop + innerH - (innerH * value) / MAX

    const series = raterKeys.value.map((key: string, index: number) => {
        const dots: any[] = []
        all.forEach((date, i) => {
            const hit = state.scores.find((s: any) => s.rater_key === key && s.measured_at === date)
            if (hit) dots.push({ x: x(i), y: y(Number(hit.score)) })
        })
        const label = state.scores.find((s: any) => s.rater_key === key)?.rater_label || key

        return {
            key,
            label: label.length > 16 ? label.slice(0, 15) + '…' : label,
            colour: SERIES_COLOURS[index % SERIES_COLOURS.length],
            points: dots.map((d) => `${d.x},${d.y}`).join(' '),
            dots,
            endY: dots.length ? dots[dots.length - 1].y : y(0),
        }
    }).filter((s: any) => s.dots.length > 0)

    return {
        width, height, padLeft, padRight, series,
        ticks: [0, MAX / 2, MAX].map((value) => ({ value, y: y(value) })),
        xLabels: all.map((date, i) => ({ x: x(i), label: shortDate(date) })),
    }
})

// "Andet" can be several parties - a school and an aunt on the same day - and
// a measurement is one per party and date, so each gets a key of its own.
function raterKeyFor(): string {
    if (state.form.rater !== 'other') return state.form.rater

    const slug = state.form.otherLabel.trim().toLowerCase()
        .replace(/æ/g, 'ae').replace(/ø/g, 'oe').replace(/å/g, 'aa')
        .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
        .slice(0, 50)

    return slug ? `other_${slug}` : 'other'
}

async function fetchScores() {
    state.isLoading = true
    try {
        const response = await citizenScaleScoreService.getScaleScores(props.citizenUuid, { scale_key: SCALE_KEY, limit: 500 })
        state.scores = response?.data ?? []
    } catch {
        state.scores = []
    }
    state.isLoading = false
}

async function save() {
    state.isSaving = true
    try {
        await citizenScaleScoreService.saveScaleScore(props.citizenUuid, {
            scale_key: SCALE_KEY,
            rater_key: raterKeyFor(),
            rater_label: state.form.rater === 'other' ? state.form.otherLabel.trim() : raterLabel(state.form.rater),
            score: state.form.score,
            max_score: MAX,
            measured_at: state.form.measuredAt,
        })
        state.form = emptyForm()
        state.isAdding = false
        await fetchScores()
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('wellbeing.saveFailed'))
    }
    state.isSaving = false
}

async function remove() {
    const score = state.removing
    state.removing = null
    if (!score) return
    try {
        await citizenScaleScoreService.deleteScaleScore(props.citizenUuid, score.uuid)
        await fetchScores()
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('wellbeing.removeFailed'))
    }
}

onMounted(fetchScores)
</script>
