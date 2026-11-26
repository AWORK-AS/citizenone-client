<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FmkHistoryPeriod, FmkRow } from '@/types/fmk'
import { fmkHistoryChanges } from '@/utils/fmk'
import { useFmkModifier } from '@/composables/useFmkModifier'
import type { FmkHistoryChange } from '@/utils/fmk'
import { fMKService } from '@/components/api/user/FMKService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'

/**
 * What staff can do with a row from FMK: take a medication only in FMK over
 * into CitizenOne, or mark a change in FMK as seen. Taking over is the main
 * action on the screen, so it is the one filled button.
 */
const props = defineProps<{ row: FmkRow, canEdit?: boolean, busy?: boolean }>()
const emit = defineEmits<{ takeOver: [identifier: string], acknowledge: [identifier: string], openLocal: [uuid: string | null] }>()

const { t } = useI18n()
const { formatDateToReadable } = useDatetimeFormatter()
const route = useRoute()

/** Who changed it in FMK and when (GK 3.6), for "Ændret i FMK". */
const { by } = useFmkModifier()
const changedBy = computed(() => (props.row.fmk?.modified ? by(props.row.fmk.modified) || null : null))

// "Se hvad der er ændret": FMK's version history, fetched only when asked (GK 1.2).
const history = shallowRef<{ from: string | null, to: string | null, changes: FmkHistoryChange[] } | null>(null)
const historyPending = shallowRef(false)
const historyError = shallowRef<string | null>(null)

async function loadHistory() {
    if (!props.row.fmk) return
    historyPending.value = true
    historyError.value = null
    try {
        const response = await fMKService.getDrugMedicationHistory(route.params.uuid as string, props.row.fmk.identifier)
        const periods = ((response?.data ?? response)?.periods ?? []) as FmkHistoryPeriod[]
        history.value = fmkHistoryChanges(periods, props.row.local?.fmk_drug_medication_version ?? null)
    } catch (cause: any) {
        historyError.value = cause?.message ?? String(cause)
    } finally {
        historyPending.value = false
    }
}

function shown(change: FmkHistoryChange, value: string | null): string {
    if (!value) return t('fmk.compare.noValue')
    if (change.field === 'dosage' && value === 'local-schema') return t('fmk.medication.dosageWrittenInstructions')
    if (change.field === 'paused') {
        const [from, to] = value.split('|')
        return [from ? formatDateToReadable(from) : '', to ? formatDateToReadable(to) : t('fmk.medication.pausedNoEnd')].filter(Boolean).join(' – ')
    }
    return value
}
</script>

<template>
    <!-- Changed in FMK: one contained callout that says what happened and what to do. -->
    <div v-if="row.fmk && row.status === 'changed_in_fmk'" class="mt-3 rounded-xl border border-[#fde68a] bg-[#fefce8] p-3">
        <div class="flex items-start gap-2.5">
            <span class="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#fef08a] text-[#854d0e]">
                <Icon name="ph:arrows-clockwise" class="size-4" aria-hidden="true" />
            </span>
            <div class="min-w-0">
                <p class="text-sm font-semibold text-[#713f12]">{{ $t('fmk.compare.changedTitle') }}</p>
                <p class="text-xs text-[#854d0e]">
                    {{ $t('fmk.compare.changedVersion', { fmk: row.fmk.version, local: row.local?.fmk_drug_medication_version ?? '–' }) }}<template v-if="changedBy"> · {{ $t('fmk.compare.changedBy', { by: changedBy }) }}</template>
                </p>
                <button v-if="!history" type="button" :disabled="historyPending" @click="loadHistory"
                    class="mt-1.5 inline-flex items-center gap-1 rounded text-xs font-semibold text-[#0f4c75] underline decoration-[#0f4c75]/30 underline-offset-2 hover:decoration-[#0f4c75] disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2dbab2]">
                    <Icon :name="historyPending ? 'ph:spinner' : 'ph:clock-counter-clockwise'" :class="['size-3.5', historyPending && 'motion-safe:animate-spin']" aria-hidden="true" />
                    {{ historyPending ? $t('fmk.compare.historyLoading') : $t('fmk.compare.historyShow') }}
                </button>
                <p v-if="historyError" role="alert" class="mt-1.5 text-xs text-[#b91c1c]">{{ historyError }}</p>
                <p v-if="canEdit" class="mt-1 text-xs text-[#64748b]">{{ $t('fmk.compare.acknowledgeHint') }}</p>
            </div>
        </div>

        <!-- What changed between our version and FMK's newest. -->
        <div v-if="history" class="mt-3 rounded-lg border border-[#fde68a] bg-white px-3 py-2.5" aria-live="polite">
            <p class="text-[11px] font-semibold uppercase tracking-wide text-[#854d0e]">
                {{ $t('fmk.compare.historyTitle', { from: history.from ?? '–', to: history.to ?? '–' }) }}
            </p>
            <dl v-if="history.changes.length" class="mt-1.5 space-y-1.5 text-sm">
                <div v-for="change in history.changes" :key="change.field">
                    <dt class="text-xs text-[#64748b]">{{ $t(`fmk.compare.historyFields.${change.field}`) }}</dt>
                    <dd class="text-[#1a2332]">
                        <span class="text-[#64748b] line-through decoration-[#a16207]/60">{{ shown(change, change.before) }}</span>
                        <Icon name="ph:arrow-right" class="mx-1.5 inline size-3.5 align-[-2px] text-[#a16207]" aria-hidden="true" />
                        <span class="sr-only">{{ $t('fmk.compare.historyNow') }}</span>
                        <span class="font-semibold">{{ shown(change, change.after) }}</span>
                    </dd>
                </div>
            </dl>
            <p v-else class="mt-1 text-sm text-[#64748b]">{{ $t('fmk.compare.historyNoChanges') }}</p>
        </div>
        <!-- Work order: correct CitizenOne first, then mark the change as reviewed. -->
        <div v-if="canEdit" class="mt-3 flex flex-wrap gap-2">
            <button type="button" @click="emit('openLocal', row.local?.uuid ?? null)"
                class="inline-flex items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 text-[13px] font-semibold text-[#0f4c75] transition-colors hover:border-[#0f4c75] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2dbab2] focus-visible:ring-offset-2">
                <Icon name="ph:pencil-simple" class="size-4" aria-hidden="true" />
                {{ $t('fmk.compare.editLocal') }}
            </button>
            <button type="button" :disabled="busy" @click="emit('acknowledge', row.fmk.identifier)"
                class="inline-flex items-center gap-1.5 rounded-lg bg-[#0f4c75] px-3 py-1.5 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[#1b6d8a] disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2dbab2] focus-visible:ring-offset-2">
                <Icon :name="busy ? 'ph:spinner' : 'ph:check'" :class="['size-4', busy && 'motion-safe:animate-spin']" aria-hidden="true" />
                {{ $t('fmk.compare.acknowledge') }}
            </button>
        </div>
    </div>

    <div v-else-if="row.fmk && row.status === 'only_fmk' && canEdit" class="mt-3">
        <button type="button" :disabled="busy" @click="emit('takeOver', row.fmk.identifier)"
            class="inline-flex items-center gap-2 rounded-lg bg-[#2dbab2] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1b6d8a] disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2dbab2] focus-visible:ring-offset-2">
            <Icon :name="busy ? 'ph:spinner' : 'ph:arrow-fat-line-right'" :class="['size-4', busy && 'motion-safe:animate-spin']" aria-hidden="true" />
            {{ busy ? $t('fmk.compare.takingOver') : $t('fmk.compare.takeOver') }}
        </button>
    </div>
</template>
