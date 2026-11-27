<script setup lang="ts">
import { shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FmkHistoryPeriod } from '@/types/fmk'
import { fMKService } from '@/components/api/user/FMKService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'

/**
 * GK 3.11: every version of a drug medication in FMK, newest first: when it
 * applied, the drug, strength and form, the dosage and any pause. Fetched
 * from FMK when staff ask for it.
 */
const props = defineProps<{ citizenUuid: string, identifier: string }>()

const { t } = useI18n()
const { formatDateTimeToReadable, formatDateToReadable } = useDatetimeFormatter()

const periods = shallowRef<FmkHistoryPeriod[] | null>(null)
const pending = shallowRef(false)
const error = shallowRef<string | null>(null)

async function load() {
    pending.value = true
    error.value = null
    try {
        const response = await fMKService.getDrugMedicationHistory(props.citizenUuid, props.identifier)
        const list = (((response?.data ?? response)?.periods ?? []) as FmkHistoryPeriod[])
        periods.value = [...list].reverse()
    } catch (cause: any) {
        error.value = cause?.message ?? String(cause)
    } finally {
        pending.value = false
    }
}

function dosage(p: FmkHistoryPeriod): string {
    if (p.dosage_by_local_schema) return t('fmk.medication.dosageWrittenInstructions')
    return p.dosage_free_text ?? p.dosage_text?.long ?? p.dosage_text?.short ?? p.dosage_type ?? t('fmk.compare.noValue')
}
</script>

<template>
    <div>
        <button v-if="!periods" type="button" :disabled="pending" @click="load"
            class="inline-flex items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 text-xs font-semibold text-[#0f4c75] hover:border-[#0f4c75] disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2dbab2]">
            <Icon :name="pending ? 'ph:spinner' : 'ph:clock-counter-clockwise'" :class="['size-4', pending && 'motion-safe:animate-spin']" aria-hidden="true" />
            {{ pending ? $t('fmk.compare.historyLoading') : $t('fmk.history.load') }}
        </button>
        <p v-if="error" role="alert" class="mt-2 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-sm text-[#991b1b]">{{ error }}</p>
        <ol v-if="periods" class="space-y-2">
            <li v-for="(p, i) in periods" :key="p.version ?? i" class="rounded-xl border px-4 py-2.5 text-sm" :class="i === 0 ? 'border-[#2dbab2]/50' : 'border-[#e2e8f0]'">
                <p class="flex flex-wrap items-center gap-2">
                    <span class="font-semibold text-[#1a2332]">{{ $t('fmk.details.version', { version: p.version }) }}</span>
                    <span v-if="i === 0" class="rounded-full border border-[#2dbab2]/40 bg-[#f0faf9] px-2 py-0.5 text-[11px] font-semibold text-[#1b6d8a]">{{ $t('fmk.history.current') }}</span>
                    <span class="text-xs text-[#64748b]">{{ p.from ? formatDateTimeToReadable(p.from) : '–' }} – {{ p.to ? formatDateTimeToReadable(p.to) : $t('fmk.history.now') }}</span>
                </p>
                <p class="text-[#1a2332]">{{ [p.drug_name, p.strength, p.form].filter(Boolean).join(' ') }}</p>
                <p class="whitespace-pre-line text-[#1a2332]">{{ dosage(p) }}</p>
                <p v-if="p.paused" class="text-xs font-semibold text-[#c2410c]">{{ $t('fmk.history.paused', { from: p.paused.from ? formatDateToReadable(p.paused.from) : '–', to: p.paused.to ? formatDateToReadable(p.paused.to) : $t('fmk.medication.noEndDate') }) }}</p>
            </li>
            <li v-if="!periods.length" class="text-sm text-[#64748b]">{{ $t('fmk.history.none') }}</li>
        </ol>
    </div>
</template>
