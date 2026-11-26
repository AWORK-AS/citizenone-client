<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FmkDrugMedication } from '@/types/fmk'
import { fmkPrescriptionState, fmkText, fmkToday } from '@/utils/fmk'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'

/**
 * One drug medication from FMK, as shown in the overview. The markings FMK
 * requires on the overview (GK 3.9, 3.12, 3.13, 3.15, 3.16, 4.2, 5.6) are
 * badges with text, never colour alone. All other fields are in the details.
 */
const props = defineProps<{ medication: FmkDrugMedication }>()
const emit = defineEmits<{ details: [] }>()

const { t } = useI18n()
const { formatDateToReadable } = useDatetimeFormatter()

const m = computed(() => props.medication)
const today = fmkToday()

const title = computed(() => [m.value.drug_name, m.value.strength, m.value.form].filter(Boolean).join(' '))


const period = computed(() => {
    const start = m.value.treatment_start ? formatDateToReadable(m.value.treatment_start) : t('fmk.medication.startedPreviously')
    const end = m.value.treatment_end ? formatDateToReadable(m.value.treatment_end) : t('fmk.medication.noEndDate')
    return `${start} – ${end}`
})

interface Badge { key: string, text: string, tone: 'danger' | 'warning' | 'info' | 'neutral' }

const badges = computed<Badge[]>(() => {
    const list: Badge[] = []
    const med = m.value

    if (med.withdrawn) {
        list.push({ key: 'withdrawn', tone: 'danger', text: t('fmk.medication.withdrawn') })
    } else if (med.treatment_end && med.treatment_end < today) {
        list.push({ key: 'expired', tone: 'danger', text: t('fmk.medication.expired') })
    }

    if (med.paused) {
        const from = fmkText(med.paused.FromDate) ?? fmkText(med.paused.FromDateTime)?.slice(0, 10) ?? null
        const to = fmkText(med.paused.ToDate) ?? fmkText(med.paused.ToDateTime)?.slice(0, 10) ?? null
        const future = from !== null && from > today
        const text = [
            future ? t('fmk.medication.pausedFrom', { date: formatDateToReadable(from!) }) : t('fmk.medication.paused'),
            to ? t('fmk.medication.pausedUntil', { date: formatDateToReadable(to) }) : t('fmk.medication.pausedNoEnd'),
        ].join(' · ')
        list.push({ key: 'paused', tone: 'warning', text })
    }

    if (med.treatment_start && med.treatment_start > today) {
        list.push({ key: 'future', tone: 'warning', text: t('fmk.medication.notStartedYet', { date: formatDateToReadable(med.treatment_start) }) })
    }
    if (med.follow_up_dates) {
        list.push({ key: 'follow-up', tone: 'info', text: t('fmk.medication.followUpDates') })
    }
    if (med.has_negative_consent) {
        list.push({ key: 'private', tone: 'warning', text: t('fmk.medication.private') })
    }
    if (med.is_dose_dispensed) {
        list.push({ key: 'dose-dispensed', tone: 'info', text: t('fmk.medication.doseDispensed') })
    }
    // GK 3.16: open prescriptions that can still be dispensed; GK 6.4: future ones stand out.
    const future = (med.prescription_list ?? []).filter(p => fmkPrescriptionState(p, today).future)
    if (future.length) {
        const first = future.map(p => p.valid_from!).sort()[0]
        list.push({ key: 'future-prescription', tone: 'warning', text: t('fmk.prescription.futureBadge', { date: formatDateToReadable(first) }) })
    }
    if ((med.open_prescriptions ?? 0) > 0) {
        list.push({ key: 'prescriptions', tone: 'neutral', text: t('fmk.medication.openPrescriptions', { count: med.open_prescriptions }, med.open_prescriptions) })
    }
    if (med.effectuations > 0) {
        list.push({ key: 'effectuations', tone: 'neutral', text: t('fmk.medication.effectuations', { count: med.effectuations }, med.effectuations) })
    }

    return list
})

const badgeClass = {
    danger: 'bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]',
    warning: 'bg-[#fff7ed] text-[#c2410c] border-[#fed7aa]',
    info: 'bg-[#f0faf9] text-[#1b6d8a] border-[#2dbab2]/40',
    neutral: 'bg-[#f8fafc] text-[#64748b] border-[#e2e8f0]',
}
</script>

<template>
    <div class="min-w-0" :class="m.withdrawn ? 'opacity-80' : ''">
        <p class="font-semibold text-[#1a2332]" :class="m.withdrawn ? 'line-through decoration-1' : ''">
            {{ title || $t('fmk.medication.unnamed') }}
        </p>
        <ModulesUserFmkDosageView :medication="m" />
        <p v-if="m.indication" class="text-sm text-[#64748b]">{{ m.indication }}</p>
        <p class="text-xs text-[#64748b]">{{ period }}</p>

        <ul v-if="badges.length" class="mt-2 flex flex-wrap gap-1.5" :aria-label="$t('fmk.medication.markings')">
            <li v-for="badge in badges" :key="badge.key"
                class="rounded-full border px-2 py-0.5 text-[11px] font-semibold" :class="badgeClass[badge.tone]">
                {{ badge.text }}
            </li>
        </ul>

        <button type="button"
            class="mt-2 inline-flex items-center gap-1 rounded-md text-xs font-semibold text-[#0f4c75] hover:text-[#1b6d8a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2dbab2]"
            @click="emit('details')">
            <Icon name="ph:list-magnifying-glass" class="size-4" aria-hidden="true" />
            {{ $t('fmk.medication.showDetails') }}
        </button>
    </div>
</template>
