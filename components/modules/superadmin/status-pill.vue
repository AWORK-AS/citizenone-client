<template>
    <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold whitespace-nowrap"
        :class="tone.pill">
        <span v-if="dot" class="w-1.5 h-1.5 rounded-full shrink-0" :class="tone.dot" aria-hidden="true" />
        <slot>{{ label }}</slot>
    </span>
</template>

<script setup lang="ts">
/**
 * The one status pill for superadmin. Meaning, not colour, picks the variant:
 * success = paid/ok, warning = pending/reminder, danger = failed/collection,
 * neutral = closed/inactive, info = anything else worth a label.
 */
export type StatusPillVariant = 'success' | 'warning' | 'danger' | 'neutral' | 'info'

const props = withDefaults(defineProps<{
    variant?: StatusPillVariant
    label?: string
    dot?: boolean
}>(), {
    variant: 'neutral',
    label: '',
    dot: true,
})

const VARIANTS: Record<StatusPillVariant, { pill: string; dot: string }> = {
    success: { pill: 'bg-success-soft text-success-ink border-success-line', dot: 'bg-success' },
    warning: { pill: 'bg-warning-soft text-warning-ink border-warning-line', dot: 'bg-warning' },
    danger: { pill: 'bg-danger-soft text-danger-ink border-danger-line', dot: 'bg-danger' },
    neutral: { pill: 'bg-surface-canvas text-ink-body border-line', dot: 'bg-ink-subtle' },
    info: { pill: 'bg-info-soft text-info border-info-line', dot: 'bg-info' },
}

const tone = computed(() => VARIANTS[props.variant] ?? VARIANTS.neutral)
</script>
