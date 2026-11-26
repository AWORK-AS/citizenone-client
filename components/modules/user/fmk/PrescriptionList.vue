<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { FmkPrescription } from '@/types/fmk'
import { fmkPrescriptionState, fmkToday } from '@/utils/fmk'
import { useFmkModifier } from '@/composables/useFmkModifier'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'

/**
 * Prescriptions with everything GK 6 asks for: status (6.3), validity with
 * future ones standing out (6.4), package, dispensing and iterations,
 * substitution, reimbursement clause, invalidation reason (6.5) and the
 * pharmacy dispensings on each (6.2).
 */
defineProps<{ prescriptions: FmkPrescription[] }>()

const { t } = useI18n()
const { by } = useFmkModifier()
const { formatDateToReadable, formatDateTimeToReadable } = useDatetimeFormatter()
const today = fmkToday()

const date = (d: string | null) => (d ? formatDateToReadable(d) : '')
/** FMK sends statuses in lower case ("delvist udleveret"). */
const sentence = (s: string | null) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '–')

function statusTone(p: FmkPrescription): string {
    const s = fmkPrescriptionState(p, today)
    if (s.future) return 'border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]'
    if (s.open) return 'border-[#2dbab2]/40 bg-[#f0faf9] text-[#1b6d8a]'
    if (['ugyldig', 'annulleret'].includes((p.status ?? '').toLowerCase())) return 'border-[#fecaca] bg-[#fef2f2] text-[#b91c1c]'
    return 'border-[#e2e8f0] bg-[#f8fafc] text-[#475569]'
}

function rows(p: FmkPrescription): { label: string, value: string | null }[] {
    const pack = [p.package_quantity ? t('fmk.effectuation.packages', { count: p.package_quantity }, p.package_quantity) : null, p.package_size_text && `× ${p.package_size_text}`, p.package_number && `(${t('fmk.prescription.packageNumber', { number: p.package_number })})`].filter(Boolean).join(' ')
    const dispensing = p.reiteration
        ? t('fmk.prescription.reiterated', { number: p.reiteration.number, interval: p.reiteration.interval, unit: p.reiteration.unit ?? '' })
        : p.dose_dispensed
            ? t('fmk.prescription.doseDispensed', { start: date(p.dose_dispensed.start) || '–', end: date(p.dose_dispensed.end) || t('fmk.medication.noEndDate') })
            : t('fmk.prescription.single')
    return [
        { label: t('fmk.prescription.valid'), value: `${date(p.valid_from) || '–'} – ${date(p.valid_to) || t('fmk.medication.noEndDate')}` },
        { label: t('fmk.prescription.package'), value: pack || null },
        { label: t('fmk.prescription.dispensing'), value: dispensing },
        { label: t('fmk.prescription.dosage'), value: p.dosage_text },
        { label: t('fmk.prescription.indication'), value: p.indication },
        { label: t('fmk.prescription.substitution'), value: p.substitution_allowed ? null : t('fmk.prescription.noSubstitution') },
        { label: t('fmk.prescription.clause'), value: p.reimbursement_clause },
        { label: t('fmk.prescription.issuedBy'), value: p.created ? by(p.created) : null },
        { label: t('fmk.prescription.latestDispensing'), value: p.latest_effectuation_at ? formatDateTimeToReadable(p.latest_effectuation_at) : null },
        { label: t('fmk.prescription.invalidationReason'), value: p.invalidation_reason },
        { label: t('fmk.prescription.supplementary'), value: p.supplementary },
    ].filter(r => r.value)
}
</script>

<template>
    <ul class="space-y-3">
        <li v-for="(p, i) in prescriptions" :key="p.identifier ?? i" class="rounded-xl border border-[#e2e8f0]">
            <div class="flex flex-wrap items-center justify-between gap-2 border-b border-[#f1f5f9] px-4 py-2.5">
                <p class="font-semibold text-[#1a2332]">{{ [p.drug_name, p.strength, p.form].filter(Boolean).join(' ') || $t('fmk.medication.unnamed') }}</p>
                <span class="rounded-full border px-2 py-0.5 text-[11px] font-semibold" :class="statusTone(p)">
                    {{ fmkPrescriptionState(p, today).future ? $t('fmk.prescription.validFrom', { date: date(p.valid_from) }) : sentence(p.status) }}
                </span>
            </div>
            <dl class="divide-y divide-[#f8fafc] text-sm">
                <div v-for="row in rows(p)" :key="row.label" class="grid gap-1 px-4 py-1.5 sm:grid-cols-[170px_1fr] sm:gap-4">
                    <dt class="text-[#64748b]">{{ row.label }}</dt>
                    <dd class="text-[#1a2332]">{{ row.value }}</dd>
                </div>
            </dl>
            <div v-if="p.effectuations.length" class="px-4 pb-3 pt-1">
                <p class="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[#64748b]">{{ $t('fmk.prescription.dispensings') }}</p>
                <ModulesUserFmkEffectuationList :effectuations="p.effectuations" />
            </div>
        </li>
    </ul>
</template>
