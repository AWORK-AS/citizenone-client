<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { FmkEffectuation } from '@/types/fmk'
import { useFmkModifier } from '@/composables/useFmkModifier'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'

/**
 * Dispensings and administrations registered on FMK (GK 3.16, 6.2, 13.3):
 * when, how (given, handed out, pharmacy, dose dispensed), what and by whom.
 */
defineProps<{ effectuations: FmkEffectuation[], more?: boolean }>()

const { t } = useI18n()
const { by } = useFmkModifier()
const { formatDateTimeToReadable } = useDatetimeFormatter()

const METHODS: Record<string, string> = {
    'indgivet': 'given',
    'udleveret': 'handedOut',
    'en- eller flergangs apoteksudlevering': 'pharmacy',
    'dosisdispenseret apoteksudlevering': 'doseDispensed',
}

function method(e: FmkEffectuation): string {
    const key = METHODS[(e.method ?? '').toLowerCase()]
    return key ? t(`fmk.effectuation.methods.${key}`) : (e.method ?? t('fmk.effectuation.methods.unknown'))
}

function what(e: FmkEffectuation): string {
    if (e.according_to_drug_medication) return t('fmk.effectuation.asOrdered')
    if (e.dose_quantity) return [e.dose_quantity, e.dose_unit, e.drug_name].filter(Boolean).join(' ')
    const packages = e.package_quantity ? t('fmk.effectuation.packages', { count: e.package_quantity }, e.package_quantity) : null
    return [packages, e.package_size && `× ${e.package_size}`, e.drug_name].filter(Boolean).join(' ')
}
</script>

<template>
    <ul class="divide-y divide-[#f1f5f9] rounded-xl border border-[#e2e8f0]">
        <li v-for="(e, i) in effectuations" :key="e.identifier ?? i" class="px-4 py-2.5 text-sm">
            <p class="flex flex-wrap items-baseline gap-x-2">
                <span class="font-semibold text-[#1a2332]">{{ e.date_time ? formatDateTimeToReadable(e.date_time) : '–' }}</span>
                <span class="rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-2 py-0.5 text-[11px] font-semibold text-[#475569]">{{ method(e) }}</span>
            </p>
            <p v-if="what(e)" class="text-[#1a2332]">{{ what(e) }}</p>
            <p v-if="e.created" class="text-xs text-[#64748b]">{{ by({ By: e.created.By }) }}</p>
        </li>
        <li v-if="more" class="px-4 py-2.5 text-xs text-[#64748b]">{{ $t('fmk.effectuation.more') }}</li>
    </ul>
</template>
