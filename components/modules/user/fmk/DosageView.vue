<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FmkDosagePeriod, FmkDrugMedication } from '@/types/fmk'
import { fmkDosageNow, fmkToday, fmkVkaNotes } from '@/utils/fmk'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'

/**
 * A drug medication's dosage as FMK gives it (GK 5): free text as it is,
 * "Dosering efter skriftlig anvisning", or the structured dosage in FMK's own
 * words. For structured dosages: the current period with its dates, a clear
 * note when there is no current dosage, later periods that can be opened,
 * and the extra rules for vitamin K antagonists.
 */
const props = defineProps<{ medication: FmkDrugMedication }>()

const { t } = useI18n()
const { formatDateToReadable } = useDatetimeFormatter()
const today = fmkToday()

const m = computed(() => props.medication)
const periods = computed(() => m.value.dosage_periods ?? [])
const now = computed(() => fmkDosageNow(periods.value, today))
const vka = computed(() => (m.value.is_vka ? fmkVkaNotes(periods.value, today, m.value.treatment_end) : null))

const showLong = shallowRef(false)
const showLater = shallowRef(false)

const date = (d: string | null) => (d ? formatDateToReadable(d) : '')

function periodDates(p: FmkDosagePeriod): string {
    const end = p.end ? date(p.end) : t('fmk.dosage.noEnd')
    return t('fmk.dosage.period', { start: date(p.start), end })
}

function periodText(p: FmkDosagePeriod): string {
    return p.empty ? t('fmk.dosage.noDosage') : (p.short ?? p.long ?? t('fmk.medication.dosageStructured'))
}

/** The long text adds something the short one does not say (e.g. a week schedule). */
const longText = computed(() => {
    const c = now.value.current
    if (!c || c.empty || !c.long) return null
    return c.long.trim() === (c.short ?? '').trim() ? null : c.long
})
</script>

<template>
    <div class="mt-0.5 text-sm text-[#1a2332]">
        <!-- GK 5.6 -->
        <p v-if="m.dosage_by_local_schema" class="italic">{{ $t('fmk.medication.dosageWrittenInstructions') }}</p>
        <!-- GK 5.5: free text as it is -->
        <p v-else-if="m.dosage_free_text" class="whitespace-pre-line">{{ m.dosage_free_text }}</p>

        <template v-else-if="periods.length">
            <!-- GK 5.3 / 5.7: the current period with its own dates -->
            <template v-if="now.current">
                <p :class="now.current.empty ? 'italic text-[#64748b]' : ''">{{ periodText(now.current) }}</p>
                <p v-if="now.current.supplementary" class="text-xs text-[#64748b]">{{ now.current.supplementary }}</p>
                <p class="text-xs text-[#64748b]">{{ $t('fmk.dosage.dosagePeriod') }}: {{ periodDates(now.current) }}</p>
                <button v-if="longText" type="button" :aria-expanded="showLong" @click="showLong = !showLong"
                    class="mr-3 mt-1 inline-flex items-center gap-1 rounded text-xs font-semibold text-[#0f4c75] hover:text-[#1b6d8a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2dbab2]">
                    <Icon :name="showLong ? 'ph:caret-up' : 'ph:caret-down'" class="size-3.5" aria-hidden="true" />
                    {{ showLong ? $t('fmk.dosage.hideFull') : $t('fmk.dosage.showFull') }}
                </button>
                <p v-if="showLong && longText" class="mt-1 whitespace-pre-line rounded-lg bg-[#f8fafc] px-3 py-2 text-xs text-[#1a2332]">{{ longText }}</p>
            </template>
            <!-- GK 5.8: no current dosage, say whether it is to come or has ended -->
            <p v-else class="rounded-lg border border-[#fed7aa] bg-[#fff7ed] px-2.5 py-1.5 text-xs font-semibold text-[#c2410c]">
                {{ now.state === 'future' ? $t('fmk.dosage.notStarted', { date: date(now.nextStart) }) : $t('fmk.dosage.ended', { date: date(now.lastEnd) }) }}
            </p>

            <!-- GK 5.2.1: vitamin K antagonists -->
            <template v-if="vka">
                <p v-if="vka.repeats" class="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#1b6d8a]">
                    <Icon name="ph:repeat" class="size-3.5" aria-hidden="true" />
                    {{ $t('fmk.dosage.vkaRepeats') }}
                </p>
                <p v-if="vka.notSpecifiedAfter" class="mt-1 text-xs font-semibold italic text-[#dc2626]">{{ $t('fmk.dosage.vkaNotSpecifiedAfter') }}</p>
                <p v-if="vka.endPassed" class="mt-1 inline-block rounded-full border border-[#fecaca] bg-[#fef2f2] px-2 py-0.5 text-[11px] font-semibold text-[#b91c1c]">{{ $t('fmk.dosage.vkaEndPassed') }}</p>
            </template>

            <!-- GK 5.4: later periods stand out and can be found -->
            <template v-if="now.later.length && now.current">
                <button type="button" :aria-expanded="showLater" @click="showLater = !showLater"
                    class="mt-1.5 inline-flex items-center gap-1 rounded-full border border-[#bcd3e4] bg-[#eef4f9] px-2 py-0.5 text-[11px] font-semibold text-[#0f4c75] hover:border-[#0f4c75] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2dbab2]">
                    <Icon name="ph:calendar-plus" class="size-3.5" aria-hidden="true" />
                    {{ $t('fmk.dosage.laterPeriods', { count: now.later.length }, now.later.length) }}
                </button>
            </template>
            <ol v-if="(showLater && now.current) || (!now.current && now.later.length)" class="mt-1.5 space-y-1.5 border-l-2 border-[#bcd3e4] pl-3">
                <li v-for="p in now.later" :key="`${p.start}-${p.end}`" class="text-xs">
                    <p class="font-semibold text-[#1a2332]">{{ periodDates(p) }}</p>
                    <p :class="p.empty ? 'italic text-[#64748b]' : 'whitespace-pre-line text-[#1a2332]'">{{ p.empty ? $t('fmk.dosage.noDosage') : (p.long ?? p.short) }}</p>
                </li>
            </ol>
        </template>

        <p v-else-if="m.dosage_structures">{{ m.dosage_text?.short ?? m.dosage_text?.long ?? $t('fmk.medication.dosageStructured') }}</p>
        <p v-else class="italic text-[#64748b]">{{ $t('fmk.medication.noCurrentDosage') }}</p>
    </div>
</template>
