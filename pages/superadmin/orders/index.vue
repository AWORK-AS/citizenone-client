<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>
                    {{ $t('superadmin.orders.pageTitle') }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>
            <template #header>
                {{ $t('superadmin.orders.header') }}
            </template>

            <div class="p-1 space-y-5">
                <!-- Header + period -->
                <ModulesSuperadminPageHeader :title="$t('superadmin.orders.header')"
                    :subtitle="$t('superadmin.orders.report.subtitle')">
                    <template #actions>
                        <label class="text-[12px] text-ink-body">{{ $t('superadmin.orders.report.from') }}</label>
                        <input type="date" :value="period.from" @change="onPeriodChange('from', $event)"
                            class="text-xs border border-line rounded-lg px-2 py-1.5 text-ink-body bg-white outline-none focus:border-accent" />
                        <label class="text-[12px] text-ink-body">{{ $t('superadmin.orders.report.to') }}</label>
                        <input type="date" :value="period.to" @change="onPeriodChange('to', $event)"
                            class="text-xs border border-line rounded-lg px-2 py-1.5 text-ink-body bg-white outline-none focus:border-accent" />
                    </template>
                </ModulesSuperadminPageHeader>

                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <!-- Key figures -->
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div class="co-stat-card [--accent:theme(colors.success.DEFAULT)]">
                        <p class="co-stat-label">{{ $t('superadmin.orders.report.revenue') }}</p>
                        <p class="co-stat-value text-success">{{ dkk(summary.revenue) }}</p>
                        <p class="co-stat-sub">
                            {{ $t('superadmin.orders.report.revenueSub', { new: dkk(summary.new_revenue), recurring: dkk(summary.recurring_revenue) }) }}
                        </p>
                    </div>
                    <div class="co-stat-card [--accent:theme(colors.secondary.DEFAULT)]">
                        <p class="co-stat-label">{{ $t('superadmin.orders.report.ordersCount') }}</p>
                        <p class="co-stat-value">{{ summary.orders }}</p>
                        <p class="co-stat-sub">
                            {{ $t('superadmin.orders.report.ordersSub', { new: summary.new_orders, recurring: summary.recurring_orders }) }}
                        </p>
                    </div>
                    <div class="co-stat-card [--accent:theme(colors.secondary.400)]">
                        <p class="co-stat-label">{{ $t('superadmin.orders.report.average') }}</p>
                        <p class="co-stat-value">{{ dkk(summary.average_order) }}</p>
                        <p class="co-stat-sub">
                            {{ $t('superadmin.orders.report.averageSub', { count: summary.buying_companies }) }}
                        </p>
                    </div>
                    <div class="co-stat-card cursor-pointer hover:shadow-md transition-shadow [--accent:theme(colors.danger.DEFAULT)]"
                        @click="filterByStatus('failed')">
                        <p class="co-stat-label">{{ $t('superadmin.orders.report.attention') }}</p>
                        <p class="co-stat-value" :class="summary.failed_orders > 0 ? 'text-danger' : ''">
                            {{ summary.failed_orders + summary.pending_orders }}
                        </p>
                        <p class="co-stat-sub">
                            {{ $t('superadmin.orders.report.attentionSub', { failed: summary.failed_orders, pending: summary.pending_orders }) }}
                        </p>
                    </div>
                </div>

                <!-- Monthly + top products -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <div class="lg:col-span-2 bg-white border border-line rounded-xl shadow-sm p-5">
                        <h2 class="text-[13px] font-semibold text-ink mb-3">
                            {{ $t('superadmin.orders.report.monthly') }}
                        </h2>
                        <div v-if="state.loading.isFetchingOverview" class="flex justify-center py-10">
                            <Icon name="ph:spinner" class="w-6 h-6 text-accent animate-spin" />
                        </div>
                        <ModulesSuperadminOrdersMonthlyChart v-else :months="state.overview?.monthly ?? []" :format="dkk" />
                    </div>

                    <div class="bg-white border border-line rounded-xl shadow-sm overflow-hidden">
                        <div class="px-5 py-4 border-b border-line">
                            <h2 class="text-[13px] font-semibold text-ink">
                                {{ $t('superadmin.orders.report.topProducts') }}
                            </h2>
                            <p class="text-[11px] text-ink-muted mt-0.5">
                                {{ $t('superadmin.orders.report.topProductsHint') }}
                            </p>
                        </div>
                        <div v-if="!products.length" class="px-5 py-8 text-center text-[13px] text-ink-muted">
                            {{ $t('superadmin.orders.report.noProducts') }}
                        </div>
                        <button v-for="product in products" :key="`${product.kind}-${product.id}`" type="button"
                            class="w-full text-left px-5 py-3 border-b border-surface-canvas last:border-0 hover:bg-surface-subtle transition-colors"
                            :class="isSelectedProduct(product) ? 'bg-secondary-25' : ''"
                            @click="filterByProduct(product)">
                            <div class="flex items-center justify-between gap-3">
                                <div class="min-w-0">
                                    <p class="text-[13px] font-medium text-ink truncate">{{ product.name ?? '—' }}</p>
                                    <p class="text-[11px] text-ink-muted">
                                        {{ kindLabel(product.kind) }} ·
                                        {{ $t('superadmin.orders.report.sold', { quantity: product.quantity, orders: product.orders }) }}
                                    </p>
                                </div>
                                <span class="text-[13px] font-semibold text-ink tabular-nums shrink-0">
                                    {{ dkk(product.revenue) }}
                                </span>
                            </div>
                            <!-- Share of the period's revenue as a thin bar -->
                            <div class="h-1 bg-surface-canvas rounded-full mt-1.5 overflow-hidden">
                                <div class="h-full rounded-full bg-secondary-400" :style="{ width: `${productShare(product)}%` }"></div>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- Orders -->
                <div class="space-y-3">
                    <h2 class="text-[13px] font-semibold text-ink">{{ $t('superadmin.orders.report.list') }}</h2>

                    <ModulesSuperadminDataTable :columns="columns" :rows="state.orders?.data ?? []" rowKey="uuid"
                        :loading="state.loading.isFetchingOrders" :error="state.ordersError" :meta="meta"
                        v-model:search="list.searchInput.value" :searchPlaceholder="$t('superadmin.orders.report.search')"
                        :filtered="list.isFiltered.value" :chips="chips" emptyIcon="ph:receipt"
                        :emptyTitle="$t('superadmin.orders.noOrdersFound')"
                        :exportName="$t('superadmin.orders.report.list')" :exportPage="exportPage"
                        :exportColumns="exportColumns"
                        @page="list.setPage" @reset="resetFilters" @retry="list.reload" @remove-chip="removeChip">
                        <template #filters>
                            <ModulesSuperadminDataTableSelect :modelValue="list.state.filters.type" :options="typeOptions"
                                :placeholder="$t('superadmin.orders.report.allTypes')" :label="$t('superadmin.orders.colType')"
                                @update:modelValue="(type) => list.setFilter('type', type)" />
                            <ModulesSuperadminDataTableSelect :modelValue="list.state.filters.status" :options="statusOptions"
                                :placeholder="$t('superadmin.orders.report.allStatuses')" :label="$t('superadmin.orders.colStatus')"
                                @update:modelValue="(status) => list.setFilter('status', status)" />
                        </template>

                        <template #cell-created_at="{ row: order }">
                            <span class="whitespace-nowrap">{{ formatDateToReadable(order.created_at) }}</span>
                        </template>
                        <template #cell-company="{ row: order }">
                            <NuxtLink v-if="order.company" :to="`/superadmin/companies/${order.company.uuid}/license-overview`"
                                class="font-medium text-ink hover:underline">
                                {{ order.company.name }}
                            </NuxtLink>
                            <span v-else class="text-ink-muted">—</span>
                        </template>
                        <template #cell-products="{ row: order }">
                            <div class="flex flex-wrap gap-1">
                                <span v-for="(product, i) in order.products" :key="i"
                                    class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-surface-canvas text-ink">
                                    {{ product.quantity }} × {{ product.name ?? kindLabel(product.kind) }}
                                </span>
                            </div>
                        </template>
                        <template #cell-type="{ row: order }">
                            <span v-if="order.type === 'new'" class="co-badge co-badge-green">
                                {{ $t('superadmin.orders.report.typeNew') }}
                            </span>
                            <span v-else-if="order.type === 'recurring'" class="co-badge co-badge-navy">
                                {{ $t('superadmin.orders.report.typeRecurring') }}
                            </span>
                            <span v-else class="co-badge">{{ $t('superadmin.orders.report.typeSms') }}</span>
                        </template>
                        <template #cell-status="{ row: order }">
                            <span class="inline-flex items-center gap-1 text-[12px] font-medium" :class="statusClass(order.status)">
                                <Icon :name="statusIcon(order.status)" class="w-3.5 h-3.5" />
                                {{ statusLabel(order.status) }}
                            </span>
                        </template>
                        <template #cell-amount="{ row: order }">
                            <div class="whitespace-nowrap">
                                <p class="text-[13px] font-semibold text-ink tabular-nums">{{ dkk(order.net_amount) }}</p>
                                <p class="text-[11px] text-ink-muted tabular-nums">
                                    {{ $t('superadmin.orders.report.inclVat', { amount: dkk(order.total_amount) }) }}
                                </p>
                            </div>
                        </template>
                        <template #cell-reference="{ row: order }">
                            <NuxtLink :to="`/superadmin/invoices/${order.uuid}/invoice-details`"
                                class="text-[12px] text-ink-muted font-mono hover:underline">
                                #{{ order.invoice_number }}
                            </NuxtLink>
                        </template>
                    </ModulesSuperadminDataTable>
                </div>

                <!-- Superadmin orders: several lines, one invoice, one e-conomic draft. -->
                <ModulesSuperadminOrdersCompanyOrders />

                <!-- Licensordrer: licence/storage orders and whether each reached e-conomic. -->
                <ModulesSuperadminOrdersLicenseOrders />
            </div>

        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { orderService } from '@/components/api/superadmin/OrderService'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useListQuery } from '@/composables/useListQuery'
import { normalizePageMeta, responseRows, type DataTableColumn } from '@/composables/dataTable'
import type { CsvColumn } from '@/composables/csvExport'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const { formatDateToReadable } = useDatetimeFormatter()
const { formatAmount } = useAmountFormatter()
const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()

const dkk = (value: number) => formatAmount(value ?? 0, 'DKK')

// The last twelve months including this one - the backend's default too.
const DEFAULT_FROM = moment().subtract(11, 'months').startOf('month').format('YYYY-MM-DD')
const DEFAULT_TO = moment().format('YYYY-MM-DD')

const state = reactive({
    overview: null as any,
    overviewPeriod: '',
    orders: {} as any,
    error: {} as Error,
    ordersError: null as string | null,
    loading: {
        isFetchingOverview: false,
        isFetchingOrders: false,
    },
})

// Period, search, type, status, product and page live in the URL. The licence
// orders further down keep theirs under `lo_`.
const list = useListQuery({
    filters: { from: DEFAULT_FROM, to: DEFAULT_TO, type: '', status: '', product_kind: '', product_id: '' },
    onChange: () => {
        if (periodKey() !== state.overviewPeriod) fetchOverview()
        fetchOrders()
    },
})

const period = computed(() => ({ from: list.state.filters.from, to: list.state.filters.to }))
const periodKey = () => `${period.value.from}|${period.value.to}`

const meta = computed(() => normalizePageMeta(state.orders))

const summary = computed(() => state.overview?.summary ?? {
    orders: 0, new_orders: 0, recurring_orders: 0, failed_orders: 0, pending_orders: 0,
    buying_companies: 0, revenue: 0, new_revenue: 0, recurring_revenue: 0, average_order: 0,
})
const products = computed<any[]>(() => state.overview?.products ?? [])

const columns = computed<DataTableColumn[]>(() => [
    { key: 'created_at', label: t('superadmin.orders.colDate') },
    { key: 'company', label: t('superadmin.orders.colCompany'), cellClass: 'text-[13px]' },
    { key: 'products', label: t('superadmin.orders.colProducts') },
    { key: 'type', label: t('superadmin.orders.colType') },
    { key: 'status', label: t('superadmin.orders.colStatus') },
    { key: 'amount', label: t('superadmin.orders.report.colAmount'), align: 'right' },
    { key: 'reference', label: t('superadmin.orders.report.colReference') },
])

const exportColumns = computed<CsvColumn[]>(() => [
    { label: t('superadmin.orders.colDate'), value: o => o.created_at, type: 'datetime' },
    { label: t('superadmin.orders.colCompany'), value: o => o.company?.name },
    { label: t('superadmin.orders.colProducts'), value: o => (o.products ?? []).map((p: any) => `${p.quantity} × ${p.name ?? kindLabel(p.kind)}`).join(', ') },
    { label: t('superadmin.orders.colType'), value: o => typeLabel(o.type) },
    { label: t('superadmin.orders.colStatus'), value: o => statusLabel(o.status) },
    { label: t('superadmin.orders.report.colAmount'), value: o => o.net_amount, type: 'amount' },
    { label: t('superadmin.orders.report.inclVat', { amount: t('superadmin.orders.report.colAmount') }), value: o => o.total_amount, type: 'amount' },
    { label: t('superadmin.orders.report.colReference'), value: o => o.invoice_number },
])

const typeOptions = computed(() => [
    { value: 'new', label: t('superadmin.orders.report.typeNew') },
    { value: 'recurring', label: t('superadmin.orders.report.typeRecurring') },
    { value: 'sms-credit', label: t('superadmin.orders.report.typeSms') },
])

const statusOptions = computed(() => [
    { value: 'paid', label: t('superadmin.orders.report.statusPaid') },
    { value: 'pending', label: t('superadmin.orders.report.statusPending') },
    { value: 'failed', label: t('superadmin.orders.report.statusFailed') },
])

// The product filter is a chip (it is picked in the top-products card), and so is a period other than the default.
const chips = computed(() => {
    const filters = list.state.filters
    const out = []
    if (filters.product_kind && filters.product_id) {
        const product = products.value.find(p => p.kind === filters.product_kind && String(p.id) === filters.product_id)
        out.push({ key: 'product', label: t('superadmin.orders.report.filterProduct', { name: product?.name ?? kindLabel(filters.product_kind) }) })
    }
    return out
})

function removeChip(key: string) {
    if (key === 'product') list.setFilters({ product_kind: '', product_id: '' })
    else list.setFilter(key, '')
}

// "Clear filters" keeps the period, which belongs to the whole page.
function resetFilters() {
    list.reset(['from', 'to'])
}

function orderParams(page: number) {
    const filters = list.state.filters
    const params: any = { page, from: filters.from, to: filters.to }
    if (list.state.search.trim()) params.search = list.state.search.trim()
    if (filters.type) params.type = filters.type
    if (filters.status) params.status = filters.status
    if (filters.product_kind && filters.product_id) {
        params.product_kind = filters.product_kind
        params.product_id = Number(filters.product_id)
    }
    return params
}

async function fetchOverview() {
    state.overviewPeriod = periodKey()
    state.loading.isFetchingOverview = true
    try {
        const response = await orderService.getReportOverview({ from: period.value.from, to: period.value.to })
        state.overview = response?.data ?? null
    } catch (error: any) {
        state.overviewPeriod = ''
        state.error = error
    }
    state.loading.isFetchingOverview = false
}

let requestSeq = 0

async function fetchOrders() {
    const seq = ++requestSeq
    state.ordersError = null
    state.loading.isFetchingOrders = true
    try {
        const response = await orderService.getReportOrders(orderParams(list.state.page))
        if (seq !== requestSeq) return
        if (response) state.orders = response
    } catch (error: any) {
        if (seq !== requestSeq) return
        state.ordersError = error?.message || t('superadmin.dataTable.errorTitle')
    }
    if (seq === requestSeq) state.loading.isFetchingOrders = false
}

async function exportPage(page: number) {
    const response = await orderService.getReportOrders(orderParams(page))
    const pageMeta = normalizePageMeta(response)
    return { rows: responseRows(response), lastPage: pageMeta?.lastPage ?? 1, total: pageMeta?.total ?? 0 }
}

function onPeriodChange(field: 'from' | 'to', event: Event) {
    const value = (event.target as HTMLInputElement).value
    if (!value) return
    list.setFilters({ [field]: value })
}

function filterByProduct(product: any) {
    list.setFilters(isSelectedProduct(product)
        ? { product_kind: '', product_id: '' }
        : { product_kind: product.kind, product_id: String(product.id) })
}

function filterByStatus(status: string) {
    list.setFilter('status', status)
}

function isSelectedProduct(product: any) {
    return list.state.filters.product_kind === product.kind && list.state.filters.product_id === String(product.id)
}

function productShare(product: any) {
    const total = Number(summary.value.revenue ?? 0)
    return total > 0 ? Math.max(2, Math.round((Number(product.revenue) / total) * 100)) : 0
}

function kindLabel(kind: string) {
    return {
        plan: t('superadmin.orders.report.kindPlan'),
        add_on: t('superadmin.orders.report.kindAddOn'),
        app: t('superadmin.orders.report.kindApp'),
    }[kind] ?? t('superadmin.orders.report.kindOther')
}

function typeLabel(type: string) {
    return {
        new: t('superadmin.orders.report.typeNew'),
        recurring: t('superadmin.orders.report.typeRecurring'),
    }[type] ?? t('superadmin.orders.report.typeSms')
}

function statusLabel(status: string) {
    return {
        paid: t('superadmin.orders.report.statusPaid'),
        failed: t('superadmin.orders.report.statusFailed'),
    }[status] ?? t('superadmin.orders.report.statusPending')
}

function statusIcon(status: string) {
    return { paid: 'ph:check-circle', failed: 'ph:x-circle' }[status] ?? 'ph:clock'
}

function statusClass(status: string) {
    return { paid: 'text-success', failed: 'text-danger' }[status] ?? 'text-warning'
}
</script>

<style scoped>
.co-stat-card {
    background: white;
    border: 1px solid theme('colors.line.DEFAULT');
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    position: relative;
    overflow: hidden;
}

.co-stat-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    border-radius: 12px 12px 0 0;
    background: var(--accent, theme('colors.accent.DEFAULT'));
}

.co-stat-label {
    font-size: 10px;
    font-weight: 700;
    color: theme('colors.ink.muted');
    text-transform: uppercase;
    letter-spacing: 0.07em;
}

.co-stat-value {
    font-size: 24px;
    font-weight: 800;
    color: theme('colors.ink.DEFAULT');
    line-height: 1.1;
    margin-top: 6px;
}

.co-stat-sub {
    font-size: 11px;
    color: theme('colors.ink.muted');
    margin-top: 4px;
}
</style>
