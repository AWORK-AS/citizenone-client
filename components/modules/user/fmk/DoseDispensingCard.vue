<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FmkDoseDispensingCardResponse, FmkDoseDispensingWarning } from '@/types/fmk'
import { fmkToday } from '@/utils/fmk'
import { fMKService } from '@/components/api/user/FMKService'
import { useFmkModifier } from '@/composables/useFmkModifier'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'

/**
 * The citizen's dose dispensing card from FMK (GK 7.3), fetched when the
 * window opens: FMK's warnings, ordering and packing pharmacy, then the
 * current period and the coming ones with roll dates, the deadline for
 * changes and the medicines with name, form, strength and dosage.
 */
const props = defineProps<{ show: boolean, citizenUuid: string }>()
const emit = defineEmits<{ close: [] }>()

const { t } = useI18n()
const { by, organisationLine } = useFmkModifier()
const { formatDateToReadable, formatDateTimeToReadable } = useDatetimeFormatter()
const today = fmkToday()

const data = shallowRef<FmkDoseDispensingCardResponse | null>(null)
const pending = shallowRef(false)
const error = shallowRef<string | null>(null)

watch(() => props.show, async (open) => {
    if (!open) return
    pending.value = true
    error.value = null
    try {
        const response = await fMKService.getDoseDispensingCard(props.citizenUuid)
        data.value = (response?.data ?? response) as FmkDoseDispensingCardResponse
    } catch (cause: any) {
        error.value = cause?.message ?? String(cause)
    } finally {
        pending.value = false
    }
})

const date = (d: string | null) => (d ? formatDateToReadable(d.slice(0, 10)) : '–')

type Period = FmkDoseDispensingCardResponse['cards'][number]['periods'][number]
function split(periods: Period[]) {
    const current = periods.filter(p => (p.start ?? '') <= today && (!p.end || p.end >= today))
    return { current, coming: periods.filter(p => (p.start ?? '') > today) }
}

const severityClass: Record<string, string> = {
    high: 'border-[#fecaca] bg-[#fef2f2] text-[#991b1b]',
    medium: 'border-[#fed7aa] bg-[#fff7ed] text-[#9a3412]',
    low: 'border-[#e2e8f0] bg-[#f8fafc] text-[#475569]',
}
const warningClass = (w: FmkDoseDispensingWarning) => severityClass[(w.severity ?? '').toLowerCase()] ?? severityClass.low
const cards = computed(() => data.value?.cards ?? [])
</script>

<template>
    <Modal :show="show" :title="$t('fmk.doseDispensing.title')" size="2xl" @close="emit('close')">
        <template #modal-body>
            <div class="max-h-[70vh] space-y-5 overflow-y-auto pr-2">
                <div v-if="pending" class="flex items-center gap-2 text-sm text-[#64748b]" role="status">
                    <Icon name="ph:spinner" class="size-4 motion-safe:animate-spin text-[#2dbab2]" aria-hidden="true" />
                    {{ $t('fmk.doseDispensing.fetching') }}
                </div>
                <p v-else-if="error" role="alert" class="rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-sm text-[#991b1b]">{{ error }}</p>

                <template v-else-if="data">
                    <!-- GK 7.2 -->
                    <p v-if="data.on_hold" role="status" class="flex items-start gap-2 rounded-lg border border-[#fed7aa] bg-[#fff7ed] px-3 py-2 text-sm text-[#9a3412]">
                        <Icon name="ph:pause-circle" class="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                        <span><strong>{{ $t('fmk.doseDispensing.onHold') }}</strong> {{ by(data.on_hold.Created ?? data.on_hold) }}</span>
                    </p>
                    <p v-if="!cards.length" class="text-sm text-[#64748b]">{{ $t('fmk.doseDispensing.none') }}</p>

                    <section v-for="(card, ci) in cards" :key="card.identifier ?? ci" class="space-y-4">
                        <div>
                            <h3 class="font-semibold text-[#1a2332]">{{ card.description ?? $t('fmk.doseDispensing.title') }}</h3>
                            <p v-if="card.is_invalid" class="mt-1 text-sm font-semibold text-[#b91c1c]">{{ $t('fmk.status.invalidTitle') }}</p>
                        </div>
                        <!-- FMK's warnings must be shown (GK 7.3) -->
                        <ul v-if="card.warnings.length" class="space-y-1.5">
                            <li v-for="(w, wi) in card.warnings" :key="wi" class="flex items-start gap-2 rounded-lg border px-3 py-2 text-sm" :class="warningClass(w)">
                                <Icon name="ph:warning" class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                                <span>{{ w.text }}<span v-if="w.code" class="opacity-70"> ({{ w.code }})</span></span>
                            </li>
                        </ul>
                        <dl class="grid gap-x-6 gap-y-1 rounded-xl border border-[#e2e8f0] px-4 py-3 text-sm sm:grid-cols-[170px_1fr]">
                            <template v-if="card.ordered_at_pharmacy"><dt class="text-[#64748b]">{{ $t('fmk.doseDispensing.orderedAt') }}</dt><dd>{{ organisationLine(card.ordered_at_pharmacy) }}</dd></template>
                            <template v-if="card.packed_at"><dt class="text-[#64748b]">{{ $t('fmk.doseDispensing.packedAt') }}</dt><dd>{{ organisationLine(card.packed_at) }}</dd></template>
                            <template v-if="card.packing_group"><dt class="text-[#64748b]">{{ $t('fmk.doseDispensing.packingGroup') }}</dt><dd>{{ card.packing_group }}</dd></template>
                            <template v-if="card.normal_period_days"><dt class="text-[#64748b]">{{ $t('fmk.doseDispensing.periodLength') }}</dt><dd>{{ $t('fmk.doseDispensing.days', { count: card.normal_period_days }) }}</dd></template>
                        </dl>

                        <template v-for="group in (['current', 'coming'] as const)" :key="group">
                            <div v-if="split(card.periods)[group].length" class="space-y-3">
                                <h4 class="text-xs font-semibold uppercase tracking-wide text-[#64748b]">{{ $t(`fmk.doseDispensing.${group}`) }}</h4>
                                <article v-for="(p, pi) in split(card.periods)[group]" :key="`${group}-${pi}`" class="rounded-xl border"
                                    :class="group === 'current' ? 'border-[#2dbab2]/50' : 'border-[#e2e8f0]'">
                                    <div class="flex flex-wrap items-center justify-between gap-2 border-b border-[#f1f5f9] px-4 py-2.5">
                                        <p class="font-semibold text-[#1a2332]">{{ $t('fmk.doseDispensing.roll', { start: date(p.start), end: date(p.end) }) }}</p>
                                        <span v-if="p.status" class="rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-2 py-0.5 text-[11px] font-semibold text-[#475569]">{{ p.status }}</span>
                                    </div>
                                    <dl class="grid gap-x-6 gap-y-1 px-4 py-2 text-sm sm:grid-cols-[170px_1fr]">
                                        <template v-if="p.deadline"><dt class="text-[#64748b]">{{ $t('fmk.doseDispensing.deadline') }}</dt><dd class="font-semibold text-[#c2410c]">{{ formatDateTimeToReadable(p.deadline) }}</dd></template>
                                        <template v-if="p.expected_delivery"><dt class="text-[#64748b]">{{ $t('fmk.doseDispensing.expectedDelivery') }}</dt><dd>{{ formatDateTimeToReadable(p.expected_delivery) }}</dd></template>
                                        <template v-if="p.effectuation_date"><dt class="text-[#64748b]">{{ $t('fmk.doseDispensing.dispensedOn') }}</dt><dd>{{ date(p.effectuation_date) }}</dd></template>
                                    </dl>
                                    <ul class="divide-y divide-[#f1f5f9] border-t border-[#f1f5f9]">
                                        <li v-for="(m, mi) in p.medications" :key="mi" class="px-4 py-2.5 text-sm">
                                            <p class="font-semibold text-[#1a2332]">{{ [m.drug_medication?.drug_name, m.drug_medication?.strength, m.drug_medication?.form].filter(Boolean).join(' ') || m.short_name }}</p>
                                            <ModulesUserFmkDosageView v-if="m.drug_medication" :medication="m.drug_medication" />
                                            <p v-if="m.administration_instruction" class="text-xs text-[#64748b]">{{ m.administration_instruction }}</p>
                                            <p v-if="m.total_quantity" class="text-xs text-[#64748b]">{{ $t('fmk.doseDispensing.quantity', { quantity: m.total_quantity, unit: card.unit_label ?? '' }) }}</p>
                                            <p v-for="(w, wi) in m.warnings" :key="wi" class="mt-1 rounded-md border px-2 py-1 text-xs" :class="warningClass(w)">{{ w.text }}</p>
                                        </li>
                                        <li v-if="p.private_medications" class="px-4 py-2 text-xs text-[#64748b]">{{ $t('fmk.doseDispensing.private', { count: p.private_medications }, p.private_medications) }}</li>
                                    </ul>
                                </article>
                            </div>
                        </template>
                    </section>
                </template>
            </div>
        </template>
    </Modal>
</template>
