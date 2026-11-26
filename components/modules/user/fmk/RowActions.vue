<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FmkRow } from '@/types/fmk'
import { fmkModificator, fmkText } from '@/utils/fmk'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'

/**
 * What staff can do with a row from FMK: take a medication only in FMK over
 * into CitizenOne, or mark a change in FMK as seen. Taking over is the main
 * action on the screen, so it is the one filled button.
 */
const props = defineProps<{ row: FmkRow, canEdit?: boolean, busy?: boolean }>()
const emit = defineEmits<{ takeOver: [identifier: string], acknowledge: [identifier: string], openLocal: [] }>()

const { t } = useI18n()
const { formatDateTimeToReadable } = useDatetimeFormatter()

/** Who changed it in FMK and when (GK 3.6), for "Ændret i FMK". */
const changedBy = computed(() => {
    const modified = props.row.fmk?.modified
    if (!modified) return null
    const m = fmkModificator(modified.By)
    const who = m.isPatient ? t('fmk.status.byPatient') : [m.who, m.organisation].filter(Boolean).join(', ')
    const when = modified.DateTime ? formatDateTimeToReadable(fmkText(modified.DateTime) ?? '') : ''
    return [who, when].filter(Boolean).join(' · ') || null
})
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
                <p v-if="canEdit" class="mt-1 text-xs text-[#64748b]">{{ $t('fmk.compare.acknowledgeHint') }}</p>
            </div>
        </div>
        <!-- Work order: correct CitizenOne first, then mark the change as reviewed. -->
        <div v-if="canEdit" class="mt-3 flex flex-wrap gap-2">
            <button type="button" @click="emit('openLocal')"
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
