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
                <div class="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 class="text-[22px] font-semibold text-ink">
                            {{ $t('superadmin.orders.header') }}
                        </h1>
                        <p class="text-sm text-ink-body mt-0.5">
                            {{ $t('superadmin.orders.report.subtitle') }}
                        </p>
                    </div>
                    <div class="flex items-center gap-2">
                        <label class="text-[12px] text-ink-body">{{ $t('superadmin.orders.report.from') }}</label>
                        <input type="date" v-model="state.period.from" @change="onPeriodChange"
                            class="text-xs border border-line rounded-lg px-2 py-1.5 text-ink-body bg-white outline-none focus:border-accent" />
                        <label class="text-[12px] text-ink-body">{{ $t('superadmin.orders.report.to') }}</label>
                        <input type="date" v-model="state.period.to" @change="onPeriodChange"
                            class="text-xs border border-line rounded-lg px-2 py-1.5 text-ink-body bg-white outline-none focus:border-accent" />
                    </div>
                </div>

                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <!-- Key figures -->
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div class="co-stat-card" style="--accent:#2E9E33">
                        <p class="co-stat-label">{{ $t('superadmin.orders.report.revenue') }}</p>
                        <p class="co-stat-value text-success">{{ dkk(summary.revenue) }}</p>
                        <p class="co-stat-sub">
                            {{ $t('superadmin.orders.report.revenueSub', { new: dkk(summary.new_revenue), recurring: dkk(summary.recurring_revenue) }) }}
                        </p>
                    </div>
                    <div class="co-stat-card" style="--accent:#0B6FA4">
                        <p class="co-stat-label">{{ $t('superadmin.orders.report.ordersCount') }}</p>
                        <p class="co-stat-value">{{ summary.orders }}</p>
                        <p class="co-stat-sub">
                            {{ $t('superadmin.orders.report.ordersSub', { new: summary.new_orders, recurring: summary.recurring_orders }) }}
                        </p>
                    </div>
                    <div class="co-stat-card" style="--accent:#2DBAB2">
                        <p class="co-stat-label">{{ $t('superadmin.orders.report.average') }}</p>
                        <p class="co-stat-value">{{ dkk(summary.average_order) }}</p>
                        <p class="co-stat-sub">
                            {{ $t('superadmin.orders.report.averageSub', { count: summary.buying_companies }) }}
                        </p>
                    </div>
                    <div class="co-stat-card cursor-pointer hover:shadow-md transition-shadow" style="--accent:#CC3B2D"
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
                    <div class="flex flex-wrap items-center gap-2">
                        <h2 class="text-[13px] font-semibold text-ink mr-2">{{ $t('superadmin.orders.report.list') }}</h2>
                        <div class="flex-1 min-w-[220px]">
                            <SuperadminTableSearch v-model="state.filters.search"
                                :placeholder="$t('superadmin.orders.report.search')" @input="debouncedSearch" />
                        </div>
                        <select v-model="state.filters.type" @change="refetchOrders"
                            class="text-[13px] border border-line rounded-lg px-2 py-2 bg-white text-ink">
                            <option value="">{{ $t('superadmin.orders.report.allTypes') }}</option>
                            <option value="new">{{ $t('superadmin.orders.report.typeNew') }}</option>
                            <option value="recurring">{{ $t('superadmin.orders.report.typeRecurring') }}</option>
                            <option value="sms-credit">{{ $t('superadmin.orders.report.typeSms') }}</option>
                        </select>
                        <select v-model="state.filters.status" @change="refetchOrders"
                            class="text-[13px] border border-line rounded-lg px-2 py-2 bg-white text-ink">
                            <option value="">{{ $t('superadmin.orders.report.allStatuses') }}</option>
                            <option value="paid">{{ $t('superadmin.orders.report.statusPaid') }}</option>
                            <option value="pending">{{ $t('superadmin.orders.report.statusPending') }}</option>
                            <option value="failed">{{ $t('superadmin.orders.report.statusFailed') }}</option>
                        </select>
                        <button v-if="state.filters.product" type="button"
                            class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[12px] font-medium bg-secondary-25 text-secondary border border-secondary-400/40"
                            :title="$t('superadmin.orders.report.clearFilter')" @click="clearProduct">
                            {{ $t('superadmin.orders.report.filterProduct', { name: state.filters.product.name }) }}
                            <Icon name="ph:x" class="w-3 h-3" />
                        </button>
                    </div>

                    <SuperadminTable :columnHeaders="state.columnHeaders" :data="state.orders"
                        :isLoading="state.loading.isFetchingOrders" :emptyMessage="$t('superadmin.orders.noOrdersFound')"
                        emptyIcon="ph:receipt" rowKey="uuid">
                        <template #body>
                            <tr v-for="order in state.orders?.data" :key="order.uuid"
                                class="border-b border-surface-canvas hover:bg-surface-subtle transition-colors">
                                <td class="co-td text-[13px] text-ink-body whitespace-nowrap">
                                    {{ formatDateToReadable(order.created_at) }}
                                </td>
                                <td class="co-td text-[13px]">
                                    <NuxtLink v-if="order.company" :to="`/superadmin/companies/${order.company.uuid}/license-overview`"
                                        class="font-medium text-ink hover:underline">
                                        {{ order.company.name }}
                                    </NuxtLink>
                                    <span v-else class="text-ink-muted">—</span>
                                </td>
                                <td class="co-td">
                                    <div class="flex flex-wrap gap-1">
                                        <span v-for="(product, i) in order.products" :key="i"
                                            class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-surface-canvas text-ink">
                                            {{ product.quantity }} × {{ product.name ?? kindLabel(product.kind) }}
                                        </span>
                                    </div>
                                </td>
                                <td class="co-td">
                                    <span v-if="order.type === 'new'" class="co-badge co-badge-green">
                                        {{ $t('superadmin.orders.report.typeNew') }}
                                    </span>
                                    <span v-else-if="order.type === 'recurring'" class="co-badge co-badge-navy">
                                        {{ $t('superadmin.orders.report.typeRecurring') }}
                                    </span>
                                    <span v-else class="co-badge">{{ $t('superadmin.orders.report.typeSms') }}</span>
                                </td>
                                <td class="co-td">
                                    <span class="inline-flex items-center gap-1 text-[12px] font-medium" :class="statusClass(order.status)">
                                        <Icon :name="statusIcon(order.status)" class="w-3.5 h-3.5" />
                                        {{ statusLabel(order.status) }}
                                    </span>
                                </td>
                                <td class="co-td text-right whitespace-nowrap">
                                    <p class="text-[13px] font-semibold text-ink tabular-nums">{{ dkk(order.net_amount) }}</p>
                                    <p class="text-[11px] text-ink-muted tabular-nums">
                                        {{ $t('superadmin.orders.report.inclVat', { amount: dkk(order.total_amount) }) }}
                                    </p>
                                </td>
                                <td class="co-td text-[12px] text-ink-muted font-mono">
                                    <NuxtLink :to="`/superadmin/invoices/${order.uuid}/invoice-details`" class="hover:underline">
                                        #{{ order.invoice_number }}
                                    </NuxtLink>
                                </td>
                            </tr>
                        </template>
                    </SuperadminTable>
                    <Pagination :data="state.orders" @previous="previous" @next="next" />
                </div>

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
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const { formatDateToReadable } = useDatetimeFormatter()
const { formatAmount } = useAmountFormatter()
const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()

let currentPage = 1
let searchTimeout: any = null

const dkk = (value: number) => formatAmount(value ?? 0, 'DKK')

const state = reactive({
    columnHeaders: computed(() => [
        { key: 'created_at', name: t('superadmin.orders.colDate') },
        { key: 'company', name: t('superadmin.orders.colCompany') },
        { key: 'products', name: t('superadmin.orders.colProducts') },
        { key: 'type', name: t('superadmin.orders.colType') },
        { key: 'status', name: t('superadmin.orders.colStatus') },
        { key: 'amount', name: t('superadmin.orders.report.colAmount') },
        { key: 'reference', name: t('superadmin.orders.report.colReference') },
    ]),
    // The last twelve months including this one - the backend's default too.
    period: {
        from: moment().subtract(11, 'months').startOf('month').format('YYYY-MM-DD'),
        to: moment().format('YYYY-MM-DD'),
    },
    filters: {
        search: '',
        type: '',
        status: '',
        product: null as null | { kind: string; id: number; name: string },
    },
    overview: null as any,
    orders: {} as any,
    error: {} as Error,
    loading: {
        isFetchingOverview: false,
        isFetchingOrders: false,
    },
})

const summary = computed(() => state.overview?.summary ?? {
    orders: 0, new_orders: 0, recurring_orders: 0, failed_orders: 0, pending_orders: 0,
    buying_companies: 0, revenue: 0, new_revenue: 0, recurring_revenue: 0, average_order: 0,
})
const products = computed<any[]>(() => state.overview?.products ?? [])

onMounted(() => {
    fetchOverview()
    fetchOrders()
})

async function fetchOverview() {
    state.loading.isFetchingOverview = true
    try {
        const params = {
            from: state.period.from,
            to: state.period.to,
        }

        const response = await orderService.getReportOverview(params)
        state.overview = response?.data ?? null
    } catch (error: any) {
        state.error = error
    }
    state.loading.isFetchingOverview = false
}

async function fetchOrders() {
    state.error = {}
    state.loading.isFetchingOrders = true
    try {
        const params: any = {
            page: currentPage,
            from: state.period.from,
            to: state.period.to,
        }
        if (state.filters.search.trim()) params.search = state.filters.search.trim()
        if (state.filters.type) params.type = state.filters.type
        if (state.filters.status) params.status = state.filters.status
        if (state.filters.product) {
            params.product_kind = state.filters.product.kind
            params.product_id = state.filters.product.id
        }

        const response = await orderService.getReportOrders(params)
        if (response) state.orders = response
    } catch (error: any) {
        state.error = error
    }
    state.loading.isFetchingOrders = false
}

function refetchOrders() {
    currentPage = 1
    fetchOrders()
}

function onPeriodChange() {
    if (!state.period.from || !state.period.to) return
    fetchOverview()
    refetchOrders()
}

function debouncedSearch() {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(refetchOrders, 350)
}

function filterByProduct(product: any) {
    state.filters.product = isSelectedProduct(product)
        ? null
        : { kind: product.kind, id: product.id, name: product.name ?? kindLabel(product.kind) }
    refetchOrders()
}

function clearProduct() {
    state.filters.product = null
    refetchOrders()
}

function filterByStatus(status: string) {
    state.filters.status = status
    refetchOrders()
}

function isSelectedProduct(product: any) {
    return state.filters.product?.kind === product.kind && state.filters.product?.id === product.id
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

function previous() {
    currentPage--
    fetchOrders()
}

function next() {
    currentPage++
    fetchOrders()
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
