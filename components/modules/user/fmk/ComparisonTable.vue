<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FmkRow, FmkRowStatus } from '@/types/fmk'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'

/**
 * FMK and CitizenOne side by side (FMK certification GK 3.1): FMK on the
 * left, the same drug medication on the same row, empty cells where a side
 * has nothing, differences marked with icon and text. Sort order comes from
 * the backend and is the same for both sides.
 */
const props = defineProps<{ rows: FmkRow[], canEdit?: boolean, busyKey?: string | null }>()
const emit = defineEmits<{ details: [identifier: string], takeOver: [identifier: string], acknowledge: [identifier: string], openLocal: [] }>()

const { t } = useI18n()
const { formatDateToReadable } = useDatetimeFormatter()

const filter = shallowRef<'all' | 'differences'>('all')

const differenceCount = computed(() => props.rows.filter(r => r.status !== 'same').length)
const visibleRows = computed(() => (filter.value === 'all' ? props.rows : props.rows.filter(r => r.status !== 'same')))

const statusMeta: Record<FmkRowStatus, { icon: string, tone: string }> = {
    same: { icon: 'ph:equals', tone: 'bg-[#f0faf9] text-[#1b6d8a] border-[#2dbab2]/40' },
    changed_in_fmk: { icon: 'ph:arrows-clockwise', tone: 'bg-[#fff7ed] text-[#c2410c] border-[#fed7aa]' },
    only_fmk: { icon: 'ph:arrow-left', tone: 'bg-[#fff7ed] text-[#c2410c] border-[#fed7aa]' },
    only_local: { icon: 'ph:arrow-right', tone: 'bg-[#fff7ed] text-[#c2410c] border-[#fed7aa]' },
    missing_in_fmk: { icon: 'ph:warning', tone: 'bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]' },
}

function localPeriod(row: FmkRow): string {
    const l = row.local
    if (!l) return ''
    const start = l.start_date ? formatDateToReadable(l.start_date) : '–'
    const end = l.end_date ? formatDateToReadable(l.end_date) : t('fmk.medication.noEndDate')
    return `${start} – ${end}`
}
</script>

<template>
    <section class="rounded-2xl border border-[#e2e8f0] bg-white" :aria-label="$t('fmk.compare.label')">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-[#e2e8f0] px-4 py-3 sm:px-6">
            <h2 class="text-base font-semibold text-[#1a2332]">{{ $t('fmk.compare.title') }}</h2>
            <div class="flex rounded-lg bg-[#f8fafc] p-1" role="group" :aria-label="$t('fmk.compare.filterLabel')">
                <button type="button" :aria-pressed="filter === 'all'"
                    class="rounded-md px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2dbab2]"
                    :class="filter === 'all' ? 'bg-white text-[#0f4c75] shadow-sm' : 'text-[#64748b] hover:text-[#1a2332]'"
                    @click="filter = 'all'">
                    {{ $t('fmk.compare.all', { count: rows.length }) }}
                </button>
                <button type="button" :aria-pressed="filter === 'differences'"
                    class="rounded-md px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2dbab2]"
                    :class="filter === 'differences' ? 'bg-white text-[#0f4c75] shadow-sm' : 'text-[#64748b] hover:text-[#1a2332]'"
                    @click="filter = 'differences'">
                    {{ $t('fmk.compare.differences', { count: differenceCount }) }}
                </button>
            </div>
        </div>

        <p v-if="visibleRows.length === 0" class="px-6 py-10 text-center text-sm text-[#64748b]">
            {{ filter === 'all' ? $t('fmk.compare.emptyAll') : $t('fmk.compare.emptyDifferences') }}
        </p>

        <!-- Phones: one card per row, FMK first, each side labelled. -->
        <ul v-if="visibleRows.length" class="divide-y divide-[#e2e8f0] md:hidden">
            <li v-for="row in visibleRows" :key="row.key" class="space-y-3 px-4 py-4"
                :class="row.status === 'same' ? '' : 'border-l-4 border-l-[#fed7aa]'">
                <span class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold"
                    :class="statusMeta[row.status].tone">
                    <Icon :name="statusMeta[row.status].icon" class="size-3.5" aria-hidden="true" />
                    {{ $t(`fmk.compare.status.${row.status}`) }}
                </span>
                <div>
                    <p class="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">{{ $t('fmk.compare.fmkColumn') }}</p>
                    <ModulesUserFmkMedicationSummary v-if="row.fmk" :medication="row.fmk" @details="emit('details', row.fmk.identifier)" />
                    <div v-if="canEdit && row.fmk && (row.status === 'only_fmk' || row.status === 'changed_in_fmk')" class="mt-3">
                        <FormButton v-if="row.status === 'only_fmk'" buttonStyle="action" class="rounded-md" :disabled="busyKey === row.key"
                            @click="emit('takeOver', row.fmk.identifier)">
                            <Icon :name="busyKey === row.key ? 'ph:spinner' : 'ph:arrow-fat-line-right'" :class="['size-4', busyKey === row.key && 'motion-safe:animate-spin']" aria-hidden="true" />
                            {{ $t('fmk.compare.takeOver') }}
                        </FormButton>
                        <FormButton v-else buttonStyle="action" class="rounded-md" :disabled="busyKey === row.key"
                            @click="emit('acknowledge', row.fmk.identifier)">
                            <Icon :name="busyKey === row.key ? 'ph:spinner' : 'ph:check'" :class="['size-4', busyKey === row.key && 'motion-safe:animate-spin']" aria-hidden="true" />
                            {{ $t('fmk.compare.acknowledge') }}
                        </FormButton>
                        <p v-if="row.status === 'changed_in_fmk'" class="mt-1 text-xs text-[#64748b]">{{ $t('fmk.compare.acknowledgeHint') }}</p>
                    </div>
                    <p v-if="!row.fmk" class="text-sm text-[#64748b]">{{ $t('fmk.compare.notInFmk') }}</p>
                </div>
                <div class="rounded-lg bg-[#f8fafc] px-3 py-2">
                    <p class="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">{{ $t('fmk.compare.localColumn') }}</p>
                    <template v-if="row.local">
                        <p class="font-semibold text-[#1a2332]">{{ [row.local.name, row.local.strength].filter(Boolean).join(' ') || $t('fmk.medication.unnamed') }}</p>
                        <p v-if="row.local.treatment_reason" class="text-sm text-[#64748b]">{{ row.local.treatment_reason }}</p>
                        <p class="text-xs text-[#64748b]">{{ localPeriod(row) }}</p>
                        <button v-if="row.local.is_draft" type="button" @click="emit('openLocal')"
                            class="mt-2 inline-flex items-center gap-1 rounded-full border border-[#fed7aa] bg-[#fff7ed] px-2 py-0.5 text-[11px] font-semibold text-[#c2410c] hover:border-[#c2410c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2dbab2]">
                            <Icon name="ph:pencil-simple" class="size-3.5" aria-hidden="true" />
                            {{ $t('fmk.compare.draft') }}
                        </button>
                    </template>
                    <p v-else class="text-sm text-[#64748b]">{{ $t('fmk.compare.notInLocal') }}</p>
                </div>
            </li>
        </ul>

        <div v-if="visibleRows.length" class="hidden overflow-x-auto md:block">
            <table class="w-full min-w-[720px] table-fixed text-left">
                <caption class="sr-only">{{ $t('fmk.compare.caption') }}</caption>
                <colgroup>
                    <col class="w-[44%]" />
                    <col class="w-[12%]" />
                    <col class="w-[44%]" />
                </colgroup>
                <thead class="bg-[#f8fafc] text-xs font-semibold uppercase tracking-wide text-[#64748b]">
                    <tr>
                        <th scope="col" class="px-4 py-2 sm:px-6">
                            <span class="inline-flex items-center gap-1.5">
                                <span class="rounded-full bg-[#0f4c75] px-2 py-0.5 text-[11px] font-semibold normal-case tracking-normal text-white" translate="no">FMK</span>
                                {{ $t('fmk.compare.fmkColumn') }}
                            </span>
                        </th>
                        <th scope="col" class="px-2 py-2 text-center">{{ $t('fmk.compare.statusColumn') }}</th>
                        <th scope="col" class="px-4 py-2 sm:px-6">{{ $t('fmk.compare.localColumn') }}</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-[#e2e8f0]">
                    <tr v-for="row in visibleRows" :key="row.key" class="align-top"
                        :class="row.status === 'same' ? '' : 'bg-[#fffdf9]'">
                        <td class="px-4 py-4 sm:px-6" :class="row.status === 'same' ? '' : 'border-l-4 border-l-[#fed7aa]'">
                            <ModulesUserFmkMedicationSummary v-if="row.fmk" :medication="row.fmk"
                                @details="emit('details', row.fmk.identifier)" />
                            <div v-if="canEdit && row.fmk && (row.status === 'only_fmk' || row.status === 'changed_in_fmk')" class="mt-3">
                                <FormButton v-if="row.status === 'only_fmk'" buttonStyle="action" class="rounded-md" :disabled="busyKey === row.key"
                                    @click="emit('takeOver', row.fmk.identifier)">
                                    <Icon :name="busyKey === row.key ? 'ph:spinner' : 'ph:arrow-fat-line-right'" :class="['size-4', busyKey === row.key && 'motion-safe:animate-spin']" aria-hidden="true" />
                                    {{ $t('fmk.compare.takeOver') }}
                                </FormButton>
                                <FormButton v-else buttonStyle="action" class="rounded-md" :disabled="busyKey === row.key"
                                    @click="emit('acknowledge', row.fmk.identifier)">
                                    <Icon :name="busyKey === row.key ? 'ph:spinner' : 'ph:check'" :class="['size-4', busyKey === row.key && 'motion-safe:animate-spin']" aria-hidden="true" />
                                    {{ $t('fmk.compare.acknowledge') }}
                                </FormButton>
                                <p v-if="row.status === 'changed_in_fmk'" class="mt-1 text-xs text-[#64748b]">{{ $t('fmk.compare.acknowledgeHint') }}</p>
                            </div>
                            <p v-if="!row.fmk" class="rounded-lg border border-dashed border-[#e2e8f0] px-3 py-4 text-sm text-[#64748b]">
                                {{ $t('fmk.compare.notInFmk') }}
                            </p>
                        </td>
                        <td class="px-2 py-4 text-center">
                            <span class="inline-flex flex-col items-center gap-1 rounded-xl border px-2 py-1.5 text-[11px] font-semibold leading-tight"
                                :class="statusMeta[row.status].tone">
                                <Icon :name="statusMeta[row.status].icon" class="size-4" aria-hidden="true" />
                                {{ $t(`fmk.compare.status.${row.status}`) }}
                            </span>
                        </td>
                        <td class="px-4 py-4 sm:px-6">
                            <div v-if="row.local" class="min-w-0">
                                <p class="font-semibold text-[#1a2332]">
                                    {{ [row.local.name, row.local.strength].filter(Boolean).join(' ') || $t('fmk.medication.unnamed') }}
                                </p>
                                <p v-if="row.local.treatment_reason" class="text-sm text-[#64748b]">{{ row.local.treatment_reason }}</p>
                                <p class="text-xs text-[#64748b]">{{ localPeriod(row) }}</p>
                                <span v-if="row.local.is_pn_medicine"
                                    class="mt-2 inline-block rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-2 py-0.5 text-[11px] font-semibold text-[#64748b]">
                                    {{ $t('fmk.compare.pn') }}
                                </span>
                                <button v-if="row.local.is_draft" type="button" @click="emit('openLocal')"
                                    class="mt-2 inline-flex items-center gap-1 rounded-full border border-[#fed7aa] bg-[#fff7ed] px-2 py-0.5 text-[11px] font-semibold text-[#c2410c] hover:border-[#c2410c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2dbab2]">
                                    <Icon name="ph:pencil-simple" class="size-3.5" aria-hidden="true" />
                                    {{ $t('fmk.compare.draft') }}
                                </button>
                            </div>
                            <p v-else class="rounded-lg border border-dashed border-[#e2e8f0] px-3 py-4 text-sm text-[#64748b]">
                                {{ $t('fmk.compare.notInLocal') }}
                            </p>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </section>
</template>
