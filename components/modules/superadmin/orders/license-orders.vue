<template>
    <section class="space-y-3" data-testid="license-orders">
        <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
                <h2 class="text-[15px] font-semibold text-ink">{{ $t('superadmin.orders.licenseOrders.title') }}</h2>
                <p class="text-[12px] text-ink-body mt-0.5">{{ $t('superadmin.orders.licenseOrders.subtitle') }}</p>
            </div>
            <button v-if="state.attention > 0" type="button" @click="list.setFilter('status', 'attention')"
                class="co-badge co-badge-red cursor-pointer" data-testid="license-orders-attention">
                <Icon name="ph:warning" class="w-3.5 h-3.5" aria-hidden="true" />
                {{ $t('superadmin.orders.licenseOrders.attention', { count: state.attention }) }}
            </button>
        </div>

        <!-- Its own keys in the URL (lo_status, lo_page), next to the order report's. -->
        <ModulesSuperadminDataTable :columns="columns" :rows="state.rows" rowKey="uuid" :searchable="false"
            :loading="state.loading" :error="state.error" :meta="meta" :filtered="list.isFiltered.value"
            emptyIcon="ph:receipt" :emptyTitle="$t('superadmin.orders.licenseOrders.empty')"
            :rowClass="(order) => order.needs_attention ? 'bg-danger-soft hover:bg-danger-soft' : undefined"
            :exportName="$t('superadmin.orders.licenseOrders.title')" :exportPage="exportPage"
            :exportColumns="exportColumns"
            @page="list.setPage" @reset="list.reset" @retry="list.reload">
            <template #filters>
                <ModulesSuperadminDataTableSelect :modelValue="list.state.filters.status" :options="statusOptions"
                    :placeholder="$t('superadmin.orders.licenseOrders.allStatuses')"
                    :label="$t('superadmin.orders.licenseOrders.columns.status')"
                    @update:modelValue="(status) => list.setFilter('status', status)" />
            </template>

            <template #cell-created_at="{ row: order }">
                <span class="whitespace-nowrap">{{ formatDate(order.created_at) }}</span>
            </template>
            <template #cell-company="{ row: order }">
                <NuxtLink v-if="order.company" :to="`/superadmin/companies/${order.company.uuid}/license-overview`"
                    class="text-ink hover:underline">
                    {{ order.company.name }}
                </NuxtLink>
            </template>
            <template #cell-ordered_by="{ row: order }">
                <span class="text-ink">{{ order.ordered_by?.name || order.ordered_by?.email || '—' }}</span>
                <span class="co-badge ml-1" :class="order.source === 'customer' ? 'co-badge-navy' : 'co-badge-gray'">
                    {{ $t(`superadmin.orders.licenseOrders.source.${order.source === 'customer' ? 'customer' : 'superadmin'}`) }}
                </span>
            </template>
            <template #cell-lines="{ row: order }">
                {{ licenseOrderItems(order.lines) }}
            </template>
            <template #cell-total_amount="{ row: order }">
                <span class="text-ink tabular-nums whitespace-nowrap">{{ formatAmount(order.total_amount, 'DKK') }}</span>
            </template>
            <template #cell-invoice="{ row: order }">
                <NuxtLink v-if="order.invoice" :to="`/superadmin/invoices/${order.invoice.uuid}/invoice-details`"
                    class="font-mono text-[12px] hover:underline text-secondary">
                    #{{ order.invoice.invoice_number }}
                </NuxtLink>
                <span v-else class="text-ink-muted">—</span>
            </template>
            <template #cell-billing_method="{ row: order }">
                {{ methodLabel(order.billing_method) }}
            </template>
            <template #cell-economic_status="{ row: order }">
                <span class="whitespace-nowrap">
                    <ModulesSuperadminStatusPill :variant="statusVariant(order.economic_status)" :label="statusLabel(order)" />
                    <Icon v-if="order.needs_attention && order.economic_status !== 'error'" name="ph:clock-countdown"
                        class="w-4 h-4 text-danger ml-1 align-middle" aria-hidden="true" />
                </span>
            </template>
        </ModulesSuperadminDataTable>
    </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { orderService } from '@/components/api/superadmin/OrderService'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { LICENSE_ORDER_STATUSES, licenseOrderItems, licenseOrderStatusKey, licenseOrderTone } from '@/composables/licenseGrant'
import { useListQuery } from '@/composables/useListQuery'
import { normalizePageMeta, responseRows, type DataTableColumn } from '@/composables/dataTable'
import type { CsvColumn } from '@/composables/csvExport'

const { t, te } = useI18n()
const { formatAmount } = useAmountFormatter()
const { formatDateToReadable } = useDatetimeFormatter()

const PER_PAGE = 25
// The most the endpoint takes, so an export is a few requests rather than many.
const EXPORT_PER_PAGE = 100

const state = reactive({
    response: null as any,
    rows: [] as any[],
    attention: 0,
    loading: false,
    error: null as string | null,
})

const list = useListQuery({
    prefix: 'lo_',
    filters: { status: '' },
    onChange: load,
})

const meta = computed(() => normalizePageMeta(state.response))

const columns = computed<DataTableColumn[]>(() => [
    { key: 'created_at', label: t('superadmin.orders.licenseOrders.columns.date') },
    { key: 'company', label: t('superadmin.orders.licenseOrders.columns.company') },
    { key: 'ordered_by', label: t('superadmin.orders.licenseOrders.columns.orderedBy') },
    { key: 'lines', label: t('superadmin.orders.licenseOrders.columns.items') },
    { key: 'total_amount', label: t('superadmin.orders.licenseOrders.columns.total'), align: 'right' },
    { key: 'invoice', label: t('superadmin.orders.licenseOrders.columns.invoice') },
    { key: 'billing_method', label: t('superadmin.orders.licenseOrders.columns.billing') },
    { key: 'economic_status', label: t('superadmin.orders.licenseOrders.columns.status') },
])

const exportColumns = computed<CsvColumn[]>(() => [
    { label: t('superadmin.orders.licenseOrders.columns.date'), value: o => o.created_at, type: 'datetime' },
    { label: t('superadmin.orders.licenseOrders.columns.company'), value: o => o.company?.name },
    { label: t('superadmin.orders.licenseOrders.columns.orderedBy'), value: o => o.ordered_by?.name || o.ordered_by?.email },
    { label: t('superadmin.orders.licenseOrders.columns.items'), value: o => licenseOrderItems(o.lines) },
    { label: t('superadmin.orders.licenseOrders.columns.total'), value: o => o.total_amount, type: 'amount' },
    { label: t('superadmin.orders.licenseOrders.columns.invoice'), value: o => o.invoice?.invoice_number },
    { label: t('superadmin.orders.licenseOrders.columns.billing'), value: o => methodLabel(o.billing_method) },
    { label: t('superadmin.orders.licenseOrders.columns.status'), value: o => statusLabel(o) },
])

const statusOptions = computed(() => [
    { value: 'attention', label: t('superadmin.orders.licenseOrders.attention', { count: state.attention }) },
    ...LICENSE_ORDER_STATUSES.map(status => ({ value: status, label: t(licenseOrderStatusKey(status)) })),
])

function formatDate(value?: string | null) {
    return value ? formatDateToReadable(value) : '—'
}

function methodLabel(method: string) {
    const key = `superadmin.orders.licenseOrders.method.${method}`
    return te(key) ? t(key) : method
}

function statusLabel(order: any) {
    return order.economic_status === 'error' && order.economic_error
        ? t('superadmin.orders.licenseOrders.errorReason', { reason: order.economic_error })
        : t(licenseOrderStatusKey(order.economic_status))
}

function statusVariant(status: unknown): 'success' | 'info' | 'warning' | 'danger' | 'neutral' {
    return ({
        green: 'success',
        blue: 'info',
        amber: 'warning',
        red: 'danger',
        gray: 'neutral',
    } as const)[licenseOrderTone(status)]
}

function params(page: number, perPage = PER_PAGE) {
    const out: Record<string, string | number> = { page, per_page: perPage }
    if (list.state.filters.status) out.status = list.state.filters.status
    return out
}

let requestSeq = 0

async function load() {
    const seq = ++requestSeq
    state.loading = true
    state.error = null
    try {
        const response = await orderService.getLicenseOrders(params(list.state.page))
        if (seq !== requestSeq) return
        state.response = response
        state.rows = response?.data ?? []
        state.attention = response?.meta?.attention ?? 0
    } catch (error: any) {
        if (seq !== requestSeq) return
        state.rows = []
        state.error = error?.message || t('superadmin.dataTable.errorTitle')
    }
    if (seq === requestSeq) state.loading = false
}

async function exportPage(page: number) {
    const response = await orderService.getLicenseOrders(params(page, EXPORT_PER_PAGE))
    const pageMeta = normalizePageMeta(response)
    return { rows: responseRows(response), lastPage: pageMeta?.lastPage ?? 1, total: pageMeta?.total ?? 0 }
}
</script>
