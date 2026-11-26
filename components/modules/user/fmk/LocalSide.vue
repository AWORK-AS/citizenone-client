<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FmkRow } from '@/types/fmk'
import { fmkDifferences } from '@/utils/fmk'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'

/**
 * The CitizenOne side of one comparison row: the medicine as registered in
 * CitizenOne, the fields that differ from FMK (FMK's value next to ours), and
 * the way on for a draft taken over from FMK.
 */
const props = defineProps<{ row: FmkRow }>()
const emit = defineEmits<{ openLocal: [] }>()

const { t } = useI18n()
const { formatDateToReadable } = useDatetimeFormatter()

const local = computed(() => props.row.local)
const differences = computed(() => fmkDifferences(props.row))

const period = computed(() => {
    const l = local.value
    if (!l) return ''
    const start = l.start_date ? formatDateToReadable(l.start_date) : '–'
    const end = l.end_date ? formatDateToReadable(l.end_date) : t('fmk.medication.noEndDate')
    return `${start} – ${end}`
})

function shown(field: string, value: string | null): string {
    if (!value) return t('fmk.compare.noValue')
    return field === 'start' || field === 'end' ? formatDateToReadable(value) : value
}
</script>

<template>
    <div v-if="local" class="min-w-0">
        <p class="font-semibold text-[#1a2332]">
            {{ [local.name, local.strength].filter(Boolean).join(' ') || $t('fmk.medication.unnamed') }}
        </p>
        <p v-if="local.treatment_reason" class="text-sm text-[#64748b]">{{ local.treatment_reason }}</p>
        <p class="text-xs text-[#64748b]">{{ period }}</p>
        <span v-if="local.is_pn_medicine"
            class="mt-2 inline-block rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-2 py-0.5 text-[11px] font-semibold text-[#64748b]">
            {{ $t('fmk.compare.pn') }}
        </span>

        <!-- What to correct, without reading both sides line by line. -->
        <div v-if="differences.length" class="mt-3 rounded-lg border border-[#fde68a] bg-[#fefce8] px-3 py-2">
            <p class="text-[11px] font-semibold uppercase tracking-wide text-[#854d0e]">{{ $t('fmk.compare.diffTitle') }}</p>
            <dl class="mt-1 space-y-0.5 text-xs">
                <div v-for="d in differences" :key="d.field" class="flex flex-wrap gap-x-1.5">
                    <dt class="text-[#64748b]">{{ $t(`fmk.compare.fields.${d.field}`) }}:</dt>
                    <dd class="text-[#1a2332]">
                        <span class="text-[#64748b] line-through decoration-[#a16207]/60">{{ shown(d.field, d.local) }}</span>
                        <Icon name="ph:arrow-right" class="mx-1 inline size-3 align-[-1px] text-[#a16207]" aria-hidden="true" />
                        <span class="sr-only">{{ $t('fmk.compare.inFmk') }}</span>
                        <span class="font-semibold">{{ shown(d.field, d.fmk) }}</span>
                    </dd>
                </div>
            </dl>
        </div>

        <button v-if="local.is_draft" type="button" @click="emit('openLocal')"
            class="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-[#fed7aa] bg-[#fff7ed] px-3 py-1.5 text-xs font-semibold text-[#c2410c] transition-colors hover:border-[#c2410c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2dbab2]">
            <Icon name="ph:pencil-simple-line" class="size-4" aria-hidden="true" />
            {{ $t('fmk.compare.fillDosage') }}
        </button>
    </div>
    <p v-else class="flex items-center gap-1.5 text-sm text-[#94a3b8]">
        <Icon name="ph:minus-circle" class="size-4" aria-hidden="true" />
        {{ $t('fmk.compare.notInLocal') }}
    </p>
</template>
