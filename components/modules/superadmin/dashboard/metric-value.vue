<template>
    <span class="co-metric" :class="{ 'co-metric--up': delta > 0 && animating }">
        <span class="co-metric-number">{{ format(displayed) }}</span>
        <!-- Forskellen siden sidst denne browser viste tallet. Et salg på
             780 kr. i MRR forsvinder i 70.000, så det skal stå for sig selv. -->
        <span v-if="delta !== 0" class="co-metric-delta"
            :class="delta > 0 ? 'co-metric-delta--up' : 'co-metric-delta--down'">
            <Icon :name="delta > 0 ? 'ph:trend-up-bold' : 'ph:trend-down-bold'" class="w-3 h-3" />
            {{ delta > 0 ? '+' : '−' }}{{ format(Math.abs(delta)) }}
            <span class="co-metric-delta-hint">{{ $t('superadmin.metrics.sinceLastVisit') }}</span>
        </span>
    </span>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
    value: number | string | null | undefined
    // Navnet tallet huskes under, f.eks. 'paying_companies'.
    metricKey: string
    // false mens siden stadig viser standardværdien, så et 0 ikke gemmes som "sidst".
    ready?: boolean
    format?: (value: number) => string
}>(), {
    ready: true,
    format: (value: number) => String(Math.round(value)),
})

const STORAGE_PREFIX = 'co.superadmin.metric.'
const DURATION_MS = 1400

const displayed = ref(0)
const delta = ref(0)
const animating = ref(false)
let frame = 0

function readPrevious(): number | null {
    try {
        const raw = localStorage.getItem(STORAGE_PREFIX + props.metricKey)
        const parsed = raw === null ? NaN : Number(raw)
        return Number.isFinite(parsed) ? parsed : null
    } catch (_) {
        return null
    }
}

function remember(value: number) {
    try {
        localStorage.setItem(STORAGE_PREFIX + props.metricKey, String(value))
    } catch (_) { }
}

function prefersReducedMotion() {
    return typeof window !== 'undefined'
        && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

// Tæller op fra det gamle tal til det nye, så man ser at det har flyttet sig.
function countUp(from: number, to: number) {
    cancelAnimationFrame(frame)
    const start = performance.now()
    const decimals = Number.isInteger(from) && Number.isInteger(to) ? 0 : 2
    const factor = 10 ** decimals

    const step = (now: number) => {
        const progress = Math.min(1, (now - start) / DURATION_MS)
        const eased = 1 - Math.pow(1 - progress, 3)
        displayed.value = Math.round((from + (to - from) * eased) * factor) / factor
        if (progress < 1) {
            frame = requestAnimationFrame(step)
        } else {
            displayed.value = to
            animating.value = false
        }
    }

    animating.value = true
    frame = requestAnimationFrame(step)
}

function settle(raw: typeof props.value) {
    const value = Number(raw ?? 0)
    if (!Number.isFinite(value)) return

    const previous = readPrevious()
    remember(value)

    if (previous === null || previous === value) {
        displayed.value = value
        return
    }

    delta.value = Math.round((value - previous) * 100) / 100

    if (delta.value > 0 && !prefersReducedMotion()) {
        countUp(previous, value)
    } else {
        displayed.value = value
    }
}

watch(() => [props.value, props.ready] as const, ([value, ready]) => {
    if (ready) settle(value)
    else displayed.value = Number(value ?? 0)
}, { immediate: true })

onBeforeUnmount(() => cancelAnimationFrame(frame))
</script>

<style scoped>
.co-metric {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 10px;
}

.co-metric-number {
    display: inline-block;
    font-variant-numeric: tabular-nums;
}

.co-metric--up .co-metric-number {
    animation: co-metric-glow 1.4s ease-out;
}

.co-metric-delta {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    line-height: 1.4;
    letter-spacing: 0;
    text-transform: none;
    white-space: nowrap;
}

.co-metric-delta--up {
    background: #EDF7EE;
    color: #2E9E33;
    animation: co-metric-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both,
        co-metric-ring 1.6s ease-out 0.5s 2;
}

.co-metric-delta--down {
    background: #F5F6F8;
    color: #5C6478;
}

.co-metric-delta-hint {
    font-weight: 500;
    opacity: 0.8;
}

@keyframes co-metric-pop {
    from {
        opacity: 0;
        transform: translateY(4px) scale(0.6);
    }

    to {
        opacity: 1;
        transform: none;
    }
}

@keyframes co-metric-ring {
    0% {
        box-shadow: 0 0 0 0 rgba(46, 158, 51, 0.45);
    }

    100% {
        box-shadow: 0 0 0 8px rgba(46, 158, 51, 0);
    }
}

@keyframes co-metric-glow {
    0% {
        color: #2E9E33;
        transform: scale(1.06);
    }

    100% {
        transform: none;
    }
}

@media (prefers-reduced-motion: reduce) {

    .co-metric--up .co-metric-number,
    .co-metric-delta--up {
        animation: none;
    }
}
</style>
