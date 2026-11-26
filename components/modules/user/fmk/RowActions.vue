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
const emit = defineEmits<{ takeOver: [identifier: string], acknowledge: [identifier: string] }>()

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
    <div v-if="row.fmk && row.status === 'changed_in_fmk'" class="mt-3 space-y-2">
        <p class="text-xs text-[#854d0e]">
            <Icon name="ph:arrows-clockwise" class="mr-1 inline size-3.5 align-[-2px]" aria-hidden="true" />
            {{ $t('fmk.compare.changedVersion', { fmk: row.fmk.version, local: row.local?.fmk_drug_medication_version ?? '–' }) }}
            <template v-if="changedBy"> · {{ $t('fmk.compare.changedBy', { by: changedBy }) }}</template>
        </p>
        <template v-if="canEdit">
            <button type="button" :disabled="busy" @click="emit('acknowledge', row.fmk.identifier)"
                class="inline-flex items-center gap-2 rounded-lg border border-[#0f4c75] bg-white px-4 py-2 text-sm font-semibold text-[#0f4c75] transition-colors hover:bg-[#f0faf9] disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2dbab2] focus-visible:ring-offset-2">
                <Icon :name="busy ? 'ph:spinner' : 'ph:check'" :class="['size-4', busy && 'motion-safe:animate-spin']" aria-hidden="true" />
                {{ $t('fmk.compare.acknowledge') }}
            </button>
            <p class="text-xs text-[#64748b]">{{ $t('fmk.compare.acknowledgeHint') }}</p>
        </template>
    </div>

    <div v-else-if="row.fmk && row.status === 'only_fmk' && canEdit" class="mt-3">
        <button type="button" :disabled="busy" @click="emit('takeOver', row.fmk.identifier)"
            class="inline-flex items-center gap-2 rounded-lg bg-[#2dbab2] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1b6d8a] disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2dbab2] focus-visible:ring-offset-2">
            <Icon :name="busy ? 'ph:spinner' : 'ph:arrow-fat-line-right'" :class="['size-4', busy && 'motion-safe:animate-spin']" aria-hidden="true" />
            {{ busy ? $t('fmk.compare.takingOver') : $t('fmk.compare.takeOver') }}
        </button>
    </div>
</template>
