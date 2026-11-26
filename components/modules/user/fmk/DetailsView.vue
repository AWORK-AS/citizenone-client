<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FmkDrugMedication } from '@/types/fmk'
import { fmkText } from '@/utils/fmk'
import { useFmkModifier } from '@/composables/useFmkModifier'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'

/**
 * One drug medication from FMK in plain words (GK 3.4-3.6, 8.4): the drug,
 * the treatment, the full dosage and who created and changed it, with codes
 * next to texts. Every other field FMK sent stays available below (GK 3.5).
 */
const props = defineProps<{ medication: FmkDrugMedication, raw: unknown }>()

const { t } = useI18n()
const { by } = useFmkModifier()
const { formatDateToReadable } = useDatetimeFormatter()
const showRaw = shallowRef(false)

const m = computed(() => props.medication)
const withCode = (text: string | null, code: string | null) => [text, code && `(${code})`].filter(Boolean).join(' ') || null

interface Row { label: string, value: string | null }
interface Section { key: string, rows: Row[] }

const sections = computed<Section[]>(() => {
    const x = m.value
    const paused = x.paused ? [fmkText(x.paused.FromDate) ?? fmkText(x.paused.FromDateTime)?.slice(0, 10), fmkText(x.paused.ToDate) ?? fmkText(x.paused.ToDateTime)?.slice(0, 10)].map(d => (d ? formatDateToReadable(d) : '')).join(' – ') : null
    return [
        { key: 'drug', rows: [
            { label: t('fmk.details.name'), value: x.drug_name },
            { label: t('fmk.details.detailedText'), value: x.detailed_drug_text && x.detailed_drug_text !== x.drug_name ? x.detailed_drug_text : null },
            { label: t('fmk.details.form'), value: x.form },
            { label: t('fmk.details.strength'), value: x.strength },
            { label: t('fmk.details.substances'), value: x.substances?.length ? x.substances.join(', ') : null },
            { label: t('fmk.details.atc'), value: withCode(x.atc_text, x.atc_code) },
            { label: t('fmk.details.drugId'), value: x.drug_identifier },
        ] },
        { key: 'treatment', rows: [
            { label: t('fmk.details.indication'), value: withCode(x.indication, x.indication_code) },
            { label: t('fmk.details.route'), value: withCode(x.route, x.route_code) },
            { label: t('fmk.details.treatmentStart'), value: x.treatment_start ? formatDateToReadable(x.treatment_start) : t('fmk.details.treatmentStartMissing') },
            { label: t('fmk.details.treatmentEnd'), value: x.treatment_end ? formatDateToReadable(x.treatment_end) : t('fmk.medication.noEndDate') },
            { label: t('fmk.details.dosageType'), value: x.dosage_type },
            { label: t('fmk.details.paused'), value: paused },
        ] },
        { key: 'record', rows: [
            { label: t('fmk.details.type'), value: x.type },
            { label: t('fmk.details.identifier'), value: `${x.identifier} · ${t('fmk.details.version', { version: x.version })}` },
            { label: t('fmk.details.created'), value: x.created ? by(x.created) : null },
            { label: t('fmk.details.modified'), value: x.modified ? by(x.modified) : null },
            { label: t('fmk.details.reportedBy'), value: x.reported_by ? by(x.reported_by) : null },
            { label: t('fmk.details.modifiedNonclinical'), value: x.modified_nonclinical ? by(x.modified_nonclinical) : null },
            { label: t('fmk.details.prescriptions'), value: x.prescriptions ? String(x.prescriptions) : null },
            { label: t('fmk.details.effectuations'), value: x.effectuations ? String(x.effectuations) : null },
        ] },
    ].map(s => ({ ...s, rows: s.rows.filter(r => r.value) }))
})
</script>

<template>
    <div class="space-y-5">
        <section v-for="section in sections" :key="section.key" :aria-labelledby="`fmk-details-${section.key}`">
            <h3 :id="`fmk-details-${section.key}`" class="text-xs font-semibold uppercase tracking-wide text-[#64748b]">{{ $t(`fmk.details.sections.${section.key}`) }}</h3>
            <dl class="mt-2 divide-y divide-[#f1f5f9] rounded-xl border border-[#e2e8f0]">
                <div v-for="row in section.rows" :key="row.label" class="grid gap-1 px-4 py-2 text-sm sm:grid-cols-[180px_1fr] sm:gap-4">
                    <dt class="text-[#64748b]">{{ row.label }}</dt>
                    <dd class="text-[#1a2332]">{{ row.value }}</dd>
                </div>
            </dl>
            <!-- The full dosage sits with the treatment (GK 5). -->
            <div v-if="section.key === 'treatment'" class="mt-3 rounded-xl border border-[#e2e8f0] px-4 py-3">
                <p class="text-xs font-semibold uppercase tracking-wide text-[#64748b]">{{ $t('fmk.details.dosage') }}</p>
                <ModulesUserFmkDosageView :medication="medication" expanded />
            </div>
        </section>

        <!-- GK 3.5: every field FMK returned, for what is not shown above. -->
        <section>
            <button type="button" :aria-expanded="showRaw" @click="showRaw = !showRaw"
                class="inline-flex items-center gap-1 rounded text-sm font-semibold text-[#0f4c75] hover:text-[#1b6d8a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2dbab2]">
                <Icon :name="showRaw ? 'ph:caret-up' : 'ph:caret-down'" class="size-4" aria-hidden="true" />
                {{ $t('fmk.details.allFields') }}
            </button>
            <div v-if="showRaw && raw" class="mt-2">
                <ModulesUserFmkFieldTree :value="raw" />
            </div>
        </section>
    </div>
</template>
