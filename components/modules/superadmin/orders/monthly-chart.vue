<template>
    <div>
        <div v-if="!months.length" class="py-10 text-center text-[13px] text-ink-muted">
            {{ $t('superadmin.orders.report.monthlyEmpty') }}
        </div>
        <div v-else>
            <!-- Legend: identity is never colour alone -->
            <div class="flex flex-wrap gap-x-4 gap-y-1 mb-3">
                <span v-for="serie in SERIES" :key="serie.key" class="inline-flex items-center gap-1.5 text-[11px] text-ink-body">
                    <span class="w-2.5 h-2.5 rounded-sm" :style="{ background: serie.color }"></span>
                    {{ $t(serie.label) }}
                </span>
            </div>

            <div class="relative" @mouseleave="hovered = null">
                <svg :viewBox="`0 0 ${WIDTH} ${HEIGHT}`" class="w-full h-auto block" role="img"
                    :aria-label="$t('superadmin.orders.report.monthly')">
                    <!-- Recessive grid with value labels -->
                    <g v-for="tick in ticks" :key="tick.value">
                        <line :x1="PAD_LEFT" :x2="WIDTH - PAD_RIGHT" :y1="tick.y" :y2="tick.y" stroke="#EEF0F3" stroke-width="1" />
                        <text :x="PAD_LEFT - 6" :y="tick.y + 3" text-anchor="end" class="co-chart-axis">{{ tick.label }}</text>
                    </g>

                    <g v-for="(bar, i) in bars" :key="bar.month">
                        <path v-for="segment in bar.segments" :key="segment.key" :d="segment.path" :fill="segment.color"
                            :opacity="hovered === null || hovered === i ? 1 : 0.45" />
                        <text :x="bar.x + bar.width / 2" :y="HEIGHT - 6" text-anchor="middle" class="co-chart-axis">
                            {{ bar.label }}
                        </text>
                        <!-- Hit target: the whole column, wider than the bar -->
                        <rect :x="bar.slotX" :y="PAD_TOP" :width="bar.slotWidth" :height="plotHeight" fill="transparent"
                            @mouseenter="hovered = i" @focus="hovered = i" tabindex="0" />
                    </g>
                </svg>

                <div v-if="hovered !== null && bars[hovered]"
                    class="absolute z-10 pointer-events-none bg-white border border-line rounded-lg shadow-md px-3 py-2 text-[12px] min-w-[180px]"
                    :style="tooltipStyle">
                    <p class="font-semibold text-ink mb-1">{{ bars[hovered].longLabel }}</p>
                    <div v-for="serie in SERIES" :key="serie.key" class="flex items-center justify-between gap-3 text-ink-body">
                        <span class="inline-flex items-center gap-1.5">
                            <span class="w-2 h-2 rounded-sm" :style="{ background: serie.color }"></span>
                            {{ $t(serie.label) }}
                        </span>
                        <span class="tabular-nums text-ink">{{ format(bars[hovered].values[serie.key]) }}</span>
                    </div>
                    <div class="flex items-center justify-between gap-3 mt-1 pt-1 border-t border-line">
                        <span class="text-ink-body">{{ $t('superadmin.orders.report.total') }}</span>
                        <span class="tabular-nums font-semibold text-ink">{{ format(bars[hovered].total) }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const props = defineProps<{
    months: { month: string; orders: number; new_revenue: number; recurring_revenue: number; sms_credit_revenue: number }[]
    format: (value: number) => string
}>()

const { locale } = useI18n()

// Validated with the dataviz palette check (light surface): all checks pass;
// the teal sits under 3:1 contrast, so the legend and tooltip carry the values.
const SERIES = [
    { key: 'new_revenue', label: 'superadmin.orders.report.seriesNew', color: '#0B6FA4' },
    { key: 'recurring_revenue', label: 'superadmin.orders.report.seriesRecurring', color: '#2DBAB2' },
    { key: 'sms_credit_revenue', label: 'superadmin.orders.report.seriesSms', color: '#9B4D9B' },
] as const

const WIDTH = 640
const HEIGHT = 220
const PAD_LEFT = 48
const PAD_RIGHT = 8
const PAD_TOP = 8
const PAD_BOTTOM = 24
const GAP = 2
const RADIUS = 4

const hovered = ref<number | null>(null)
const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM

const localeTag = computed(() => ({ dk: 'da-DK', en: 'en-GB', no: 'nb-NO', sv: 'sv-SE' } as Record<string, string>)[locale.value] ?? 'da-DK')

const maxTotal = computed(() => {
    const max = Math.max(0, ...props.months.map(m => m.new_revenue + m.recurring_revenue + m.sms_credit_revenue))
    return niceCeil(max)
})

function niceCeil(value: number) {
    if (value <= 0) return 1
    const magnitude = 10 ** Math.floor(Math.log10(value))
    const step = [1, 2, 2.5, 5, 10].find(s => s * magnitude >= value) ?? 10
    return step * magnitude
}

function compact(value: number) {
    return new Intl.NumberFormat(localeTag.value, { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

const ticks = computed(() => [0, 0.25, 0.5, 0.75, 1].map(f => ({
    value: f,
    y: PAD_TOP + plotHeight * (1 - f),
    label: compact(maxTotal.value * f),
})))

// A bar segment; only the top one gets rounded ends, anchored flat at the baseline.
function segmentPath(x: number, y: number, w: number, h: number, roundTop: boolean) {
    if (h <= 0) return ''
    const r = roundTop ? Math.min(RADIUS, h, w / 2) : 0
    return `M${x},${y + h} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + w - r},${y} Q${x + w},${y} ${x + w},${y + r} L${x + w},${y + h} Z`
}

const bars = computed(() => {
    const slot = (WIDTH - PAD_LEFT - PAD_RIGHT) / Math.max(1, props.months.length)
    const width = Math.max(4, Math.min(36, slot * 0.6))

    return props.months.map((m, i) => {
        const slotX = PAD_LEFT + slot * i
        const x = slotX + (slot - width) / 2
        const values = { new_revenue: m.new_revenue, recurring_revenue: m.recurring_revenue, sms_credit_revenue: m.sms_credit_revenue }
        const total = m.new_revenue + m.recurring_revenue + m.sms_credit_revenue
        const visible = SERIES.filter(s => values[s.key] > 0)

        let base = PAD_TOP + plotHeight
        const segments = visible.map((serie, j) => {
            const h = (values[serie.key] / maxTotal.value) * plotHeight
            // 2px surface gap between stacked segments
            const drawn = j < visible.length - 1 ? Math.max(0, h - GAP) : h
            const y = base - h + (h - drawn)
            const path = segmentPath(x, base - h, width, drawn, j === visible.length - 1)
            base -= h
            return { key: serie.key, color: serie.color, path, y }
        })

        const date = new Date(`${m.month}-01T00:00:00`)
        return {
            month: m.month,
            x,
            width,
            slotX,
            slotWidth: slot,
            values,
            total,
            segments,
            label: date.toLocaleDateString(localeTag.value, { month: 'short' }),
            longLabel: date.toLocaleDateString(localeTag.value, { month: 'long', year: 'numeric' }),
        }
    })
})

const tooltipStyle = computed(() => {
    if (hovered.value === null) return {}
    const bar = bars.value[hovered.value]
    const leftPct = ((bar.x + bar.width / 2) / WIDTH) * 100
    return leftPct > 60
        ? { right: `${100 - leftPct + 2}%`, top: '8px' }
        : { left: `${leftPct + 2}%`, top: '8px' }
})
</script>

<style scoped>
.co-chart-axis {
    font-size: 10px;
    fill: theme('colors.ink.muted');
    font-variant-numeric: tabular-nums;
}
</style>
