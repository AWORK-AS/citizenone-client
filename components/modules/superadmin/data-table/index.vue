<template>
    <section class="space-y-3">
        <!-- Toolbar: search, the list's own filters, how many, and the export. -->
        <div v-if="showToolbar" class="flex flex-wrap items-center gap-2">
            <SuperadminTableSearch v-if="searchable" :modelValue="search"
                :placeholder="searchPlaceholder || $t('superadmin.dataTable.search')"
                @update:modelValue="emit('update:search', $event)" />

            <slot name="filters" />

            <div class="ml-auto flex flex-wrap items-center gap-2">
                <span v-if="countLabel" class="text-[12px] text-ink-muted tabular-nums whitespace-nowrap"
                    aria-live="polite">
                    {{ countLabel }}
                </span>
                <slot name="toolbar" />
                <button v-if="exportName" type="button" :disabled="exporting"
                    :title="$t('superadmin.dataTable.exportHelp')"
                    class="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-[13px] font-medium bg-white text-ink-body border border-line hover:bg-surface-canvas transition-colors disabled:opacity-60 disabled:cursor-progress"
                    @click="exportCsv">
                    <Icon :name="exporting ? 'ph:spinner' : 'ph:file-csv'" class="w-4 h-4"
                        :class="exporting && 'animate-spin'" aria-hidden="true" />
                    <span v-if="exporting" class="tabular-nums">
                        {{ $t('superadmin.dataTable.exporting', { done: progress.done, total: progress.total || '…' }) }}
                    </span>
                    <span v-else>{{ $t('superadmin.dataTable.exportCsv') }}</span>
                </button>
            </div>
        </div>

        <!-- Active filters as chips, each one removable. -->
        <div v-if="chips.length" class="flex flex-wrap items-center gap-1.5">
            <span v-for="chip in chips" :key="chip.key"
                class="inline-flex items-center gap-1 pl-2.5 pr-1 py-0.5 rounded-full text-[12px] font-medium bg-tertiary-soft text-tertiary border border-line">
                {{ chip.label }}
                <button type="button" class="rounded-full p-0.5 hover:bg-white/70"
                    :aria-label="`${$t('superadmin.dataTable.removeFilter')}: ${chip.label}`"
                    @click="emit('remove-chip', chip.key)">
                    <Icon name="ph:x" class="w-3 h-3" aria-hidden="true" />
                </button>
            </span>
            <button v-if="chips.length > 1 || filtered" type="button"
                class="text-[12px] font-medium text-ink-body hover:text-danger ml-1" @click="emit('reset')">
                {{ $t('superadmin.dataTable.clearFilters') }}
            </button>
        </div>

        <p v-if="notice" role="status"
            class="flex items-start justify-between gap-3 rounded-lg border px-3 py-2 text-[13px]"
            :class="notice.tone === 'danger' ? 'border-danger-line bg-danger-soft text-danger-ink' : 'border-warning-line bg-warning-soft text-warning-ink'">
            <span>{{ notice.text }}</span>
            <button type="button" class="shrink-0" :aria-label="$t('superadmin.dataTable.dismiss')" @click="notice = null">
                <Icon name="ph:x" class="w-3.5 h-3.5" aria-hidden="true" />
            </button>
        </p>

        <div class="bg-white border border-line rounded-xl shadow-sm overflow-hidden">
            <!-- Error -->
            <div v-if="error && !loading" class="flex flex-col items-center gap-2 px-6 py-14 text-center" role="alert">
                <Icon name="ph:warning-circle" class="w-10 h-10 text-danger" aria-hidden="true" />
                <p class="text-sm font-semibold text-ink">{{ $t('superadmin.dataTable.errorTitle') }}</p>
                <p class="text-[13px] text-ink-body max-w-md">{{ error }}</p>
                <button type="button"
                    class="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium bg-white text-tertiary border border-line-strong hover:bg-surface-canvas"
                    @click="emit('retry')">
                    <Icon name="ph:arrows-clockwise" class="w-3.5 h-3.5" aria-hidden="true" />
                    {{ $t('superadmin.dataTable.retry') }}
                </button>
            </div>

            <!-- Empty -->
            <div v-else-if="!loading && !rows.length" class="flex flex-col items-center gap-2 px-6 py-14 text-center text-ink-muted">
                <Icon :name="emptyIcon" class="w-11 h-11 opacity-30" aria-hidden="true" />
                <p class="text-sm font-medium text-ink-body">
                    {{ emptyTitle || $t('superadmin.dataTable.emptyTitle') }}
                </p>
                <p v-if="filtered || emptyHint" class="text-[12px]">
                    {{ filtered ? $t('superadmin.dataTable.emptyFiltered') : emptyHint }}
                </p>
                <button v-if="filtered" type="button" class="mt-1 text-[13px] font-medium text-tertiary hover:underline"
                    @click="emit('reset')">
                    {{ $t('superadmin.dataTable.clearFilters') }}
                </button>
                <slot name="empty" />
            </div>

            <div v-else class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="border-b border-line bg-surface-subtle">
                            <th v-for="column in columns" :key="column.key" scope="col" class="co-th"
                                :class="[alignClass(column), column.headerClass]"
                                :style="column.width ? { width: column.width } : undefined"
                                :aria-sort="ariaSort(column)">
                                <button v-if="columnSortField(column)" type="button"
                                    class="inline-flex items-center gap-1 uppercase tracking-wide hover:text-ink transition-colors"
                                    :class="isSorted(column) && 'text-ink'"
                                    :title="$t('superadmin.dataTable.sortBy', { column: column.label })"
                                    @click="emit('sort', columnSortField(column) as string)">
                                    {{ column.label }}
                                    <Icon :name="sortIcon(column)" class="w-3.5 h-3.5 shrink-0"
                                        :class="isSorted(column) ? 'text-tertiary' : 'text-ink-subtle'" aria-hidden="true" />
                                </button>
                                <template v-else>{{ column.label }}</template>
                            </th>
                        </tr>
                    </thead>

                    <!-- First load: a skeleton the shape of the table. -->
                    <tbody v-if="loading && !rows.length" :aria-label="$t('superadmin.dataTable.loading')" aria-busy="true">
                        <tr v-for="line in skeletonRows" :key="line" class="border-b border-surface-canvas last:border-b-0">
                            <td v-for="(column, index) in columns" :key="column.key" class="co-td">
                                <div class="h-3 rounded bg-surface-canvas animate-pulse"
                                    :style="{ width: `${skeletonWidth(line, index)}%` }" />
                            </td>
                        </tr>
                    </tbody>

                    <!-- A reload keeps the rows on screen, dimmed, instead of flashing a spinner. -->
                    <tbody v-else :class="loading && 'opacity-60 transition-opacity'" :aria-busy="loading || undefined">
                        <tr v-for="(row, index) in rows" :key="keyOf(row, index)"
                            class="border-b border-surface-canvas last:border-b-0 group transition-colors hover:bg-surface-subtle"
                            :class="[clickable && 'cursor-pointer focus:outline-none focus-visible:bg-surface-subtle', rowClass?.(row)]"
                            :tabindex="clickable ? 0 : undefined"
                            @click="onRowClick($event, row)" @keydown.enter="onRowClick($event, row)">
                            <td v-for="column in columns" :key="column.key" class="co-td"
                                :class="[alignClass(column), column.cellClass ?? 'text-[13px] text-ink-body']">
                                <slot :name="`cell-${column.key}`" :row="row" :value="row?.[column.key]" :index="index">
                                    {{ display(row?.[column.key]) }}
                                </slot>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Paging: where you are, and every way to somewhere else. -->
            <nav v-if="meta && meta.total > 0 && !error"
                class="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3 border-t border-line"
                :aria-label="$t('superadmin.dataTable.pages')">
                <p class="text-[12px] text-ink-muted tabular-nums">
                    {{ $t('superadmin.dataTable.range', { from: meta.from, to: meta.to, total: meta.total }) }}
                </p>
                <div v-if="meta.lastPage > 1" class="flex items-center gap-1">
                    <button type="button" class="co-page-btn px-2.5" :disabled="meta.page <= 1 || loading"
                        @click="emit('page', meta.page - 1)">
                        <Icon name="ph:caret-left" class="w-3.5 h-3.5" aria-hidden="true" />
                        <span class="hidden sm:inline">{{ $t('superadmin.dataTable.previous') }}</span>
                    </button>
                    <template v-for="(page, index) in pages" :key="index">
                        <span v-if="page === null" class="px-1 text-[12px] text-ink-subtle">…</span>
                        <button v-else type="button" class="co-page-btn min-w-8 justify-center"
                            :class="page === meta.page && 'co-page-btn-active'"
                            :aria-current="page === meta.page ? 'page' : undefined"
                            :aria-label="$t('superadmin.dataTable.page', { page })" :disabled="loading"
                            @click="page !== meta.page && emit('page', page)">
                            {{ page }}
                        </button>
                    </template>
                    <button type="button" class="co-page-btn px-2.5" :disabled="meta.page >= meta.lastPage || loading"
                        @click="emit('page', meta.page + 1)">
                        <span class="hidden sm:inline">{{ $t('superadmin.dataTable.next') }}</span>
                        <Icon name="ph:caret-right" class="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                </div>
            </nav>
        </div>
    </section>
</template>

<script setup lang="ts">
/**
 * The one table for superadmin lists: toolbar (search, filter slot, count,
 * CSV), active-filter chips, sortable headers, cell slots, a clickable row,
 * skeleton / empty / error states and the pager.
 *
 * It keeps no list state of its own: search, sort and page come in as props
 * and go out as events, normally straight from `useListQuery`, so the URL
 * stays the source of truth. Cells render `row[key]` unless the page gives a
 * `#cell-<key>` slot.
 *
 * CSV: give `exportName`. With `exportPage` the table walks the server's pages
 * with the list's current params (up to CSV_MAX_ROWS); with `exportRows` it
 * writes those; otherwise the rows on screen. Columns go in as shown unless a
 * column says otherwise (`csv`) or `exportColumns` replaces them.
 */
import { saveAs } from 'file-saver'
import { useI18n } from 'vue-i18n'
import { buildCsv, collectPages, csvFilename, CSV_MAX_ROWS, type CsvColumn, type ExportPage } from '@/composables/csvExport'
import { columnSortField, csvColumnsFor, pageWindow, type DataTableChip, type DataTableColumn, type PageMeta } from '@/composables/dataTable'

const props = withDefaults(defineProps<{
    columns: DataTableColumn[]
    rows: any[]
    rowKey?: string | ((row: any) => string | number)
    loading?: boolean
    /** A message: the table shows the error state instead of rows. */
    error?: string | null
    meta?: PageMeta | null
    /** Overrides the count in the toolbar; defaults to `meta.total`, else the rows. */
    total?: number | null
    sort?: string | null
    order?: 'asc' | 'desc' | null
    searchable?: boolean
    search?: string
    searchPlaceholder?: string
    filtered?: boolean
    chips?: DataTableChip[]
    clickable?: boolean
    rowClass?: (row: any) => string | string[] | Record<string, boolean> | undefined
    emptyIcon?: string
    emptyTitle?: string
    emptyHint?: string
    showCount?: boolean
    toolbar?: boolean
    exportName?: string
    exportPage?: (page: number) => Promise<ExportPage>
    exportRows?: any[] | (() => any[])
    exportColumns?: CsvColumn[]
}>(), {
    rowKey: 'uuid',
    loading: false,
    error: null,
    meta: null,
    total: null,
    sort: null,
    order: null,
    searchable: true,
    search: '',
    searchPlaceholder: '',
    filtered: false,
    chips: () => [],
    clickable: false,
    rowClass: undefined,
    emptyIcon: 'ph:magnifying-glass',
    emptyTitle: '',
    emptyHint: '',
    showCount: true,
    toolbar: true,
    exportName: '',
    exportPage: undefined,
    exportRows: undefined,
    exportColumns: undefined,
})

const emit = defineEmits<{
    'update:search': [value: string]
    sort: [field: string]
    page: [page: number]
    'row-click': [row: any]
    'remove-chip': [key: string]
    reset: []
    retry: []
}>()

const slots = useSlots()
const { t } = useI18n()

const exporting = ref(false)
const progress = reactive({ done: 0, total: 0 })
const notice = ref<{ text: string; tone: 'warning' | 'danger' } | null>(null)

const showToolbar = computed(() => props.toolbar
    && (props.searchable || !!slots.filters || !!slots.toolbar || !!props.exportName || !!countLabel.value))

const count = computed(() => props.total ?? props.meta?.total ?? (props.loading ? null : props.rows.length))
const countLabel = computed(() => (props.showCount && count.value !== null && !props.error
    ? t('superadmin.dataTable.results', { count: count.value }, count.value)
    : ''))

const pages = computed(() => (props.meta ? pageWindow(props.meta.page, props.meta.lastPage) : []))
const skeletonRows = [1, 2, 3, 4, 5, 6]
const skeletonWidth = (line: number, index: number) => 45 + ((line * 7 + index * 13) % 45)

function keyOf(row: any, index: number) {
    if (typeof props.rowKey === 'function') return props.rowKey(row)
    return row?.[props.rowKey] ?? index
}

function alignClass(column: DataTableColumn) {
    return column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : ''
}

function isSorted(column: DataTableColumn) {
    const field = columnSortField(column)
    return !!field && field === props.sort && !!props.order
}

function sortIcon(column: DataTableColumn) {
    if (!isSorted(column)) return 'ph:caret-up-down'
    return props.order === 'desc' ? 'ph:caret-down' : 'ph:caret-up'
}

function ariaSort(column: DataTableColumn) {
    if (!columnSortField(column)) return undefined
    if (!isSorted(column)) return 'none'
    return props.order === 'desc' ? 'descending' : 'ascending'
}

function display(value: unknown) {
    return value === null || value === undefined || value === '' ? '—' : value
}

// A click on a link, button or field inside the row is that control's, not the row's.
function onRowClick(event: Event, row: any) {
    if (!props.clickable) return
    const target = event.target as HTMLElement | null
    if (target?.closest?.('a, button, input, select, textarea, label, [data-row-ignore]')) return
    emit('row-click', row)
}

async function exportCsv() {
    if (exporting.value) return
    exporting.value = true
    notice.value = null
    progress.done = 0
    progress.total = props.meta?.total ?? 0

    try {
        let rows: any[]
        let truncated = false
        let total = 0

        if (props.exportPage) {
            const collected = await collectPages(props.exportPage, {
                maxRows: CSV_MAX_ROWS,
                onProgress: (done, all) => {
                    progress.done = done
                    progress.total = all
                },
            })
            rows = collected.rows
            truncated = collected.truncated
            total = collected.total
        } else {
            const source = typeof props.exportRows === 'function' ? props.exportRows() : (props.exportRows ?? props.rows)
            total = source.length
            truncated = source.length > CSV_MAX_ROWS
            rows = source.slice(0, CSV_MAX_ROWS)
        }

        if (!rows.length) {
            notice.value = { text: t('superadmin.dataTable.exportEmpty'), tone: 'warning' }
            return
        }

        const columns = props.exportColumns ?? csvColumnsFor(props.columns)
        const blob = new Blob([buildCsv(columns, rows)], { type: 'text/csv;charset=utf-8' })
        saveAs(blob, csvFilename(props.exportName))

        if (truncated) {
            notice.value = { text: t('superadmin.dataTable.exportTruncated', { count: CSV_MAX_ROWS, total }), tone: 'warning' }
        }
    } catch (error: any) {
        notice.value = { text: error?.message || t('superadmin.dataTable.exportFailed'), tone: 'danger' }
    } finally {
        exporting.value = false
    }
}
</script>

<style scoped>
.co-page-btn {
    @apply inline-flex items-center gap-1 h-8 rounded-lg border border-line bg-white text-[12px] font-medium text-ink-body transition-colors;
}

.co-page-btn:hover:not(:disabled) {
    @apply bg-surface-canvas text-ink;
}

.co-page-btn:disabled {
    @apply opacity-40 cursor-not-allowed;
}

.co-page-btn-active,
.co-page-btn-active:hover:not(:disabled) {
    @apply bg-tertiary border-tertiary text-white;
}
</style>
