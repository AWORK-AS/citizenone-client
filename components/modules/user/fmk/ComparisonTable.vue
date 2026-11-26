<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import type { FmkRow, FmkRowStatus } from '@/types/fmk'
import { fmkNeedsAction } from '@/utils/fmk'

/**
 * FMK and CitizenOne side by side (FMK certification GK 3.1): FMK on the
 * left, the same drug medication on the same row, empty cells where a side
 * has nothing, differences marked with icon and text. Sort order comes from
 * the backend and is the same for both sides.
 *
 * The header answers "is there anything I need to do?" first: how many rows
 * need action, with one clickable count per kind. Each kind has its own
 * colour (always with icon and text), so warnings stay orange only.
 */
const props = defineProps<{ rows: FmkRow[], canEdit?: boolean, busyKey?: string | null, flashKey?: string | null }>()
const emit = defineEmits<{ details: [identifier: string], takeOver: [identifier: string], acknowledge: [identifier: string], openLocal: [] }>()

type Filter = 'action' | 'all' | 'draft' | FmkRowStatus

const statusMeta: Record<FmkRowStatus, { icon: string, chip: string, bar: string, dot: string }> = {
    changed_in_fmk: { icon: 'ph:arrows-clockwise', chip: 'bg-[#fefce8] text-[#854d0e] border-[#fde68a]', bar: 'border-l-[#eab308]', dot: 'bg-[#eab308]' },
    only_fmk: { icon: 'ph:arrow-left', chip: 'bg-[#eef4f9] text-[#0f4c75] border-[#bcd3e4]', bar: 'border-l-[#0f4c75]', dot: 'bg-[#0f4c75]' },
    missing_in_fmk: { icon: 'ph:warning', chip: 'bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]', bar: 'border-l-[#dc2626]', dot: 'bg-[#dc2626]' },
    only_local: { icon: 'ph:arrow-right', chip: 'bg-[#f8fafc] text-[#475569] border-[#e2e8f0]', bar: 'border-l-[#94a3b8]', dot: 'bg-[#94a3b8]' },
    same: { icon: 'ph:check', chip: 'bg-[#f0faf9] text-[#1b6d8a] border-[#2dbab2]/40', bar: 'border-l-transparent', dot: 'bg-[#2dbab2]' },
}
const statusOrder = Object.keys(statusMeta) as FmkRowStatus[]

const actionCount = computed(() => props.rows.filter(fmkNeedsAction).length)
const draftCount = computed(() => props.rows.filter(r => r.local?.is_draft).length)
const counts = computed(() => statusOrder
    .map(status => ({ status, count: props.rows.filter(r => r.status === status).length }))
    .filter(c => c.count > 0))

// Start where the work is; "Alle" is one click away.
const filter = shallowRef<Filter>(actionCount.value > 0 ? 'action' : 'all')

const visibleRows = computed(() => {
    const f = filter.value
    if (f === 'all') return props.rows
    if (f === 'action') return props.rows.filter(fmkNeedsAction)
    if (f === 'draft') return props.rows.filter(r => r.local?.is_draft)
    return props.rows.filter(r => r.status === f)
})

// A kind filter that has emptied (e.g. the last row taken over) goes back to "needs action".
watch(visibleRows, (rows) => {
    if (rows.length === 0 && filter.value !== 'action' && filter.value !== 'all') filter.value = 'action'
})

function rowClass(row: FmkRow): string[] {
    return [
        'border-l-4',
        statusMeta[row.status].bar,
        row.key === props.flashKey ? 'fmk-flash' : '',
    ]
}
</script>

<template>
    <section class="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white" :aria-label="$t('fmk.compare.label')">
        <!-- Overview: what needs doing, and a way to see just that. -->
        <div class="border-b border-[#e2e8f0] px-4 py-4 sm:px-6">
            <div class="flex flex-wrap items-center justify-between gap-3">
                <div class="flex min-w-0 items-center gap-3" aria-live="polite">
                    <Transition name="fmk-pop" mode="out-in">
                        <span v-if="actionCount > 0" key="todo"
                            class="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#fefce8] text-[#a16207]">
                            <span class="text-lg font-semibold tabular-nums">{{ actionCount }}</span>
                        </span>
                        <span v-else key="done"
                            class="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#2dbab2] text-white shadow-[0_0_0_6px_#f0faf9]">
                            <Icon name="ph:check-bold" class="size-6" aria-hidden="true" />
                        </span>
                    </Transition>
                    <div class="min-w-0">
                        <h2 class="text-base font-semibold text-[#1a2332] sm:text-lg">
                            {{ actionCount > 0 ? $t('fmk.compare.actionTitle', { count: actionCount }, actionCount) : $t('fmk.compare.allMatch') }}
                        </h2>
                        <p class="text-sm text-[#64748b]">
                            {{ actionCount > 0 ? $t('fmk.compare.actionHint') : $t('fmk.compare.allMatchHint') }}
                        </p>
                    </div>
                </div>
                <div class="flex rounded-lg bg-[#f8fafc] p-1" role="group" :aria-label="$t('fmk.compare.filterLabel')">
                    <button v-for="f in (['action', 'all'] as const)" :key="f" type="button" :aria-pressed="filter === f"
                        class="rounded-md px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2dbab2]"
                        :class="filter === f ? 'bg-white text-[#0f4c75] shadow-sm' : 'text-[#64748b] hover:text-[#1a2332]'"
                        @click="filter = f">
                        {{ f === 'action' ? $t('fmk.compare.needsAction', { count: actionCount }) : $t('fmk.compare.all', { count: rows.length }) }}
                    </button>
                </div>
            </div>

            <ul v-if="rows.length" class="mt-3 flex flex-wrap gap-2" :aria-label="$t('fmk.compare.kindsLabel')">
                <li v-for="c in counts" :key="c.status">
                    <button type="button" :aria-pressed="filter === c.status" @click="filter = filter === c.status ? 'action' : c.status"
                        class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2dbab2]"
                        :class="[statusMeta[c.status].chip, filter === c.status ? 'ring-2 ring-offset-1 ring-current' : 'hover:brightness-95']">
                        <Icon :name="statusMeta[c.status].icon" class="size-3.5" aria-hidden="true" />
                        {{ $t(`fmk.compare.status.${c.status}`) }}
                        <span class="tabular-nums opacity-80">{{ c.count }}</span>
                    </button>
                </li>
                <li v-if="draftCount">
                    <button type="button" :aria-pressed="filter === 'draft'" @click="filter = filter === 'draft' ? 'action' : 'draft'"
                        class="inline-flex items-center gap-1.5 rounded-full border border-[#fed7aa] bg-[#fff7ed] px-2.5 py-1 text-xs font-semibold text-[#c2410c] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2dbab2]"
                        :class="filter === 'draft' ? 'ring-2 ring-offset-1 ring-current' : 'hover:brightness-95'">
                        <Icon name="ph:pencil-simple-line" class="size-3.5" aria-hidden="true" />
                        {{ $t('fmk.compare.drafts') }}
                        <span class="tabular-nums opacity-80">{{ draftCount }}</span>
                    </button>
                </li>
            </ul>
        </div>

        <!-- Nothing left to do: say so warmly, and offer the full list. -->
        <div v-if="visibleRows.length === 0" class="px-6 py-12 text-center">
            <template v-if="filter === 'action' && rows.length">
                <span class="fmk-celebrate mx-auto flex size-14 items-center justify-center rounded-full bg-[#f0faf9] text-[#2dbab2]">
                    <Icon name="ph:seal-check-fill" class="size-8" aria-hidden="true" />
                </span>
                <p class="mt-3 font-semibold text-[#1a2332]">{{ $t('fmk.compare.emptyDifferences') }}</p>
                <button type="button" class="mt-2 text-sm font-semibold text-[#0f4c75] hover:text-[#1b6d8a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2dbab2]"
                    @click="filter = 'all'">
                    {{ $t('fmk.compare.showAll', { count: rows.length }) }}
                </button>
            </template>
            <p v-else class="text-sm text-[#64748b]">{{ $t('fmk.compare.emptyAll') }}</p>
        </div>

        <!-- Phones: one card per row, FMK first, each side labelled. -->
        <TransitionGroup v-if="visibleRows.length" tag="ul" name="fmk-row" class="divide-y divide-[#e2e8f0] md:hidden">
            <li v-for="row in visibleRows" :key="row.key" class="space-y-3 px-4 py-4" :class="rowClass(row)">
                <span class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold" :class="statusMeta[row.status].chip">
                    <Icon :name="statusMeta[row.status].icon" class="size-3.5" aria-hidden="true" />
                    {{ $t(`fmk.compare.status.${row.status}`) }}
                </span>
                <div>
                    <p class="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">
                        <span class="rounded-full bg-[#0f4c75] px-1.5 py-px text-[10px] normal-case tracking-normal text-white" translate="no">FMK</span>
                        {{ $t('fmk.compare.fmkColumn') }}
                    </p>
                    <template v-if="row.fmk">
                        <ModulesUserFmkMedicationSummary :medication="row.fmk" @details="emit('details', row.fmk.identifier)" />
                        <ModulesUserFmkRowActions :row="row" :canEdit="canEdit" :busy="busyKey === row.key"
                            @takeOver="emit('takeOver', $event)" @acknowledge="emit('acknowledge', $event)" @openLocal="emit('openLocal')" />
                    </template>
                    <p v-else class="flex items-center gap-1.5 text-sm text-[#94a3b8]">
                        <Icon name="ph:minus-circle" class="size-4" aria-hidden="true" />
                        {{ $t('fmk.compare.notInFmk') }}
                    </p>
                </div>
                <div class="rounded-lg bg-[#f8fafc] px-3 py-2">
                    <p class="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">{{ $t('fmk.compare.localColumn') }}</p>
                    <ModulesUserFmkLocalSide :row="row" @openLocal="emit('openLocal')" />
                </div>
            </li>
        </TransitionGroup>

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
                        <th scope="col" class="border-l-4 border-l-transparent px-4 py-2 sm:px-6">
                            <span class="inline-flex items-center gap-1.5">
                                <span class="rounded-full bg-[#0f4c75] px-2 py-0.5 text-[11px] font-semibold normal-case tracking-normal text-white" translate="no">FMK</span>
                                {{ $t('fmk.compare.fmkColumn') }}
                            </span>
                        </th>
                        <th scope="col" class="px-2 py-2 text-center">{{ $t('fmk.compare.statusColumn') }}</th>
                        <th scope="col" class="px-4 py-2 sm:px-6">{{ $t('fmk.compare.localColumn') }}</th>
                    </tr>
                </thead>
                <TransitionGroup tag="tbody" name="fmk-row" class="divide-y divide-[#e2e8f0]">
                    <tr v-for="row in visibleRows" :key="row.key" class="align-top">
                        <td class="px-4 py-4 sm:px-6" :class="rowClass(row)">
                            <template v-if="row.fmk">
                                <ModulesUserFmkMedicationSummary :medication="row.fmk" @details="emit('details', row.fmk.identifier)" />
                                <ModulesUserFmkRowActions :row="row" :canEdit="canEdit" :busy="busyKey === row.key"
                                    @takeOver="emit('takeOver', $event)" @acknowledge="emit('acknowledge', $event)" @openLocal="emit('openLocal')" />
                            </template>
                            <p v-else class="flex items-center gap-1.5 text-sm text-[#94a3b8]">
                                <Icon name="ph:minus-circle" class="size-4" aria-hidden="true" />
                                {{ $t('fmk.compare.notInFmk') }}
                            </p>
                        </td>
                        <td class="px-2 py-4 text-center" :class="row.key === flashKey ? 'fmk-flash' : ''">
                            <span class="inline-flex flex-col items-center gap-1 rounded-xl border px-2 py-1.5 text-[11px] font-semibold leading-tight"
                                :class="statusMeta[row.status].chip">
                                <Icon :name="statusMeta[row.status].icon" class="size-4" aria-hidden="true" />
                                {{ $t(`fmk.compare.status.${row.status}`) }}
                            </span>
                        </td>
                        <td class="px-4 py-4 sm:px-6" :class="row.key === flashKey ? 'fmk-flash' : ''">
                            <ModulesUserFmkLocalSide :row="row" @openLocal="emit('openLocal')" />
                        </td>
                    </tr>
                </TransitionGroup>
            </table>
        </div>
    </section>
</template>

<style scoped>
.fmk-row-enter-active,
.fmk-row-leave-active {
    transition: opacity 0.35s ease, transform 0.35s ease;
}
.fmk-row-enter-from,
.fmk-row-leave-to {
    opacity: 0;
    transform: translateX(16px);
}

.fmk-pop-enter-active,
.fmk-pop-leave-active {
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease;
}
.fmk-pop-enter-from,
.fmk-pop-leave-to {
    transform: scale(0.6);
    opacity: 0;
}

/* The row just changed: a short teal glow so the eye finds it. */
.fmk-flash {
    animation: fmk-flash 1.8s ease-out;
}
@keyframes fmk-flash {
    0%, 30% { background-color: #d5f3f0; }
    100% { background-color: transparent; }
}

.fmk-celebrate {
    animation: fmk-celebrate 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes fmk-celebrate {
    from { transform: scale(0.5); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
    .fmk-row-enter-active,
    .fmk-row-leave-active,
    .fmk-pop-enter-active,
    .fmk-pop-leave-active { transition: none; }
    .fmk-flash,
    .fmk-celebrate { animation: none; }
}
</style>
