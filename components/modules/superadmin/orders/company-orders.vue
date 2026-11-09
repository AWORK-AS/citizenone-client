<template>
    <section class="space-y-3" data-testid="company-orders">
        <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
                <h2 class="text-[15px] font-semibold text-ink">{{ $t('superadmin.companyOrders.listTitle') }}</h2>
                <p class="text-[12px] text-ink-body mt-0.5">{{ $t('superadmin.companyOrders.listSubtitle') }}</p>
            </div>
            <button v-if="state.failed > 0" type="button" @click="list.setFilter('status', 'failed')"
                class="co-badge co-badge-red cursor-pointer" data-testid="company-orders-failed">
                <Icon name="ph:warning" class="w-3.5 h-3.5" aria-hidden="true" />
                {{ $t('superadmin.companyOrders.failedCount', { count: state.failed }) }}
            </button>
        </div>

        <!-- Its own keys in the URL (co_status, co_page), next to the other lists on the page. -->
        <ModulesSuperadminDataTable :columns="columns" :rows="state.rows" rowKey="uuid" :searchable="false"
            :loading="state.loading" :error="state.error" :meta="meta" :filtered="list.isFiltered.value"
            emptyIcon="ph:shopping-cart" :emptyTitle="$t('superadmin.companyOrders.empty')"
            :rowClass="(order) => order.status === 'failed' ? 'bg-danger-soft hover:bg-danger-soft' : undefined"
            :exportName="$t('superadmin.companyOrders.listTitle')" :exportPage="exportPage" :exportColumns="exportColumns"
            @page="list.setPage" @reset="list.reset" @retry="list.reload">
            <template #filters>
                <ModulesSuperadminDataTableSelect :modelValue="list.state.filters.status" :options="statusOptions"
                    :placeholder="$t('superadmin.companyOrders.allStatuses')" :label="$t('superadmin.companyOrders.col.status')"
                    @update:modelValue="(status) => list.setFilter('status', status)" />
            </template>

            <template #cell-created_at="{ row: order }">
                <NuxtLink :to="orderHref(order)" class="whitespace-nowrap text-secondary hover:underline">
                    {{ formatDate(order.created_at) }}
                </NuxtLink>
            </template>
            <template #cell-company="{ row: order }">
                <NuxtLink v-if="order.company" :to="`/superadmin/companies/${order.company.uuid}/license-overview`"
                    class="text-ink hover:underline">
                    {{ order.company.name }}
                </NuxtLink>
            </template>
            <template #cell-products="{ row: order }">
                <span class="text-ink">{{ productsText(order) }}</span>
            </template>
            <template #cell-total_amount="{ row: order }">
                <span class="text-ink tabular-nums whitespace-nowrap">
                    {{ order.total_amount !== null ? formatAmount(order.total_amount, 'DKK') : '—' }}
                </span>
            </template>
            <template #cell-status="{ row: order }">
                <ModulesSuperadminStatusPill :variant="orderStatusVariant(order.status)" :label="$t(orderStatusKey(order.status))" />
            </template>
            <template #cell-economic="{ row: order }">
                <span class="text-[12px] whitespace-nowrap" :class="order.status === 'failed' ? 'text-danger-ink' : 'text-ink-body'">
                    {{ economicText(order) }}
                </span>
            </template>
            <template #cell-actions="{ row: order }">
                <button v-if="order.can_retry && canManage" type="button" :disabled="state.retrying === order.uuid"
                    class="inline-flex items-center gap-1 text-[12px] font-semibold text-secondary hover:underline disabled:opacity-50"
                    @click="retry(order)">
                    <Icon name="ph:arrow-clockwise" class="w-3.5 h-3.5" aria-hidden="true" />
                    {{ $t('superadmin.companyOrders.retry') }}
                </button>
                <NuxtLink v-else :to="orderHref(order)" class="text-[12px] text-secondary hover:underline">
                    {{ $t('superadmin.companyOrders.open') }}
                </NuxtLink>
            </template>
        </ModulesSuperadminDataTable>
    </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { companyOrderService } from '@/components/api/superadmin/CompanyOrderService'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { usePermissions } from '@/composables/usePermissions'
import { useListQuery } from '@/composables/useListQuery'
import { normalizePageMeta, responseRows, type DataTableColumn } from '@/composables/dataTable'
import type { CsvColumn } from '@/composables/csvExport'
import { ORDER_STATUSES, orderEconomicLabel, orderStatusKey, orderStatusVariant } from '@/composables/superadminOrder'

const props = defineProps<{
    /** Only this company's orders (the company's licence page). */
    companyUuid?: string
}>()

const { t } = useI18n()
const { formatAmount } = useAmountFormatter()
const { formatDateToReadable } = useDatetimeFormatter()
const { can } = usePermissions()
const { successAlert, errorAlert } = useAlert()

const PER_PAGE = 25
const EXPORT_PER_PAGE = 100

const state = reactive({
    response: null as any,
    rows: [] as any[],
    failed: 0,
    loading: false,
    error: null as string | null,
    retrying: '' as string,
})

const canManage = computed(() => can('manage_financials'))

const list = useListQuery({
    prefix: 'co_',
    filters: { status: '' },
    onChange: load,
})

const meta = computed(() => normalizePageMeta(state.response))

const columns = computed<DataTableColumn[]>(() => [
    { key: 'created_at', label: t('superadmin.companyOrders.col.date') },
    ...(props.companyUuid ? [] : [{ key: 'company', label: t('superadmin.companyOrders.col.company') }]),
    { key: 'products', label: t('superadmin.companyOrders.col.products') },
    { key: 'total_amount', label: t('superadmin.companyOrders.col.total'), align: 'right' },
    { key: 'status', label: t('superadmin.companyOrders.col.status') },
    { key: 'economic', label: 'e-conomic' },
    { key: 'actions', label: '' },
] as DataTableColumn[])

const exportColumns = computed<CsvColumn[]>(() => [
    { label: t('superadmin.companyOrders.col.date'), value: o => o.created_at, type: 'datetime' },
    { label: t('superadmin.companyOrders.col.company'), value: o => o.company?.name },
    { label: t('superadmin.companyOrders.col.products'), value: o => productsText(o) },
    { label: t('superadmin.companyOrders.col.total'), value: o => o.total_amount, type: 'amount' },
    { label: t('superadmin.companyOrders.col.status'), value: o => t(orderStatusKey(o.status)) },
    { label: 'e-conomic', value: o => economicText(o) },
])

const statusOptions = computed(() => ORDER_STATUSES.map(status => ({ value: status, label: t(orderStatusKey(status)) })))

function orderHref(order: any) {
    return `/superadmin/companies/${order.company?.uuid ?? props.companyUuid}/orders/${order.uuid}`
}

function formatDate(value?: string | null) {
    return value ? formatDateToReadable(value) : '—'
}

function productsText(order: any) {
    return (order.products ?? []).map((p: any) => `${p.quantity} × ${p.name ?? '—'}`).join(', ') || '—'
}

function economicText(order: any) {
    const label = orderEconomicLabel(order)
    return t(label.key, label.params)
}

function params(page: number, perPage = PER_PAGE) {
    const out: Record<string, string | number> = { page, per_page: perPage }
    if (list.state.filters.status) out.status = list.state.filters.status
    if (props.companyUuid) out.company_uuid = props.companyUuid
    return out
}

let requestSeq = 0

async function load() {
    const seq = ++requestSeq
    state.loading = true
    state.error = null
    try {
        const response = await companyOrderService.list(params(list.state.page))
        if (seq !== requestSeq) return
        state.response = response
        state.rows = response?.data ?? []
        state.failed = response?.meta?.failed ?? 0
    } catch (error: any) {
        if (seq !== requestSeq) return
        state.rows = []
        state.error = error?.message || t('superadmin.dataTable.errorTitle')
    }
    if (seq === requestSeq) state.loading = false
}

async function retry(order: any) {
    state.retrying = order.uuid
    try {
        await companyOrderService.retry(order.uuid)
        successAlert(`${t('alert.success')}!`, t('superadmin.companyOrders.retried'))
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('superadmin.companyOrders.saveFailed'))
    }
    state.retrying = ''
    load()
}

async function exportPage(page: number) {
    const response = await companyOrderService.list(params(page, EXPORT_PER_PAGE))
    const pageMeta = normalizePageMeta(response)
    return { rows: responseRows(response), lastPage: pageMeta?.lastPage ?? 1, total: pageMeta?.total ?? 0 }
}

defineExpose({ reload: load })
</script>
