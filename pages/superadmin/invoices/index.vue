<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>
                    {{ $t('superadmin.invoices.invoices') }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>
            <template #header>
                {{ $t('superadmin.invoices.invoices') }}
            </template>

            <div class="p-1">
                <!-- `meta.total` is where a paginated collection carries
                     its count; `total` was never in the response, so the
                     subtitle read "0 invoices in total" above a full page. -->
                <ModulesSuperadminPageHeader :title="$t('superadmin.invoices.invoices')"
                    :subtitle="$t('superadmin.invoices.totalInvoices', { count: state.invoices?.meta?.total ?? 0 })">
                    <template #actions>
                        <button
                            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-warning-soft text-warning-ink border border-warning-line hover:bg-warning-soft/70 transition-colors"
                            @click="list.setFilter('status', 'pending')">
                            <span class="w-2 h-2 rounded-full bg-warning animate-pulse"></span>
                            {{ state.pendingCount }} {{ $t('superadmin.invoices.pending') }}
                        </button>
                        <Tooltip :text="$t('paymentDunning.invoices.failedTabHelp')" position="bottom" wrap>
                            <button
                                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-danger-soft text-danger-ink border border-danger-line hover:bg-danger-soft/70 transition-colors"
                                @click="list.setFilter('status', 'failed')">
                                <span class="w-2 h-2 rounded-full bg-danger"></span>
                                {{ state.failedCount }} {{ $t('superadmin.invoices.failed') }}
                            </button>
                        </Tooltip>
                        <FormButton buttonStyle="action" @click="state.modal.isDownloadOpen = true">
                            <Icon name="ph:download-simple" class="h-4 w-4" />
                            {{ $t('superadmin.invoices.download.download') }}
                        </FormButton>
                    </template>
                </ModulesSuperadminPageHeader>

                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <ModulesSuperadminDataTable :columns="columns" :rows="state.invoices?.data ?? []" rowKey="uuid"
                    :loading="state.isTableLoading" :error="state.loadError" :meta="meta"
                    :sort="list.state.sort" :order="list.state.order"
                    v-model:search="list.searchInput.value"
                    :searchPlaceholder="$t('superadmin.invoices.searchPlaceholder')"
                    :filtered="list.isFiltered.value" :chips="chips" clickable
                    emptyIcon="ph:receipt" :emptyTitle="$t('superadmin.invoices.noInvoicesFound')"
                    :exportName="$t('superadmin.invoices.invoices')" :exportPage="exportPage"
                    :exportColumns="exportColumns"
                    @sort="list.toggleSort" @page="list.setPage" @reset="list.reset" @retry="list.reload"
                    @remove-chip="(key) => list.setFilter(key, '')"
                    @row-click="(invoice) => navigateTo(`/superadmin/invoices/${invoice.uuid}/invoice-details`)">
                    <template #filters>
                        <ModulesSuperadminDataTableTabs :modelValue="list.state.filters.status || 'all'" :tabs="tabs"
                            @update:modelValue="(tab) => list.setFilter('status', tab === 'all' ? '' : tab)" />
                        <ModulesSuperadminDataTableSelect :modelValue="sortLabel" :options="sortOptions"
                            :placeholder="sortOptions.some(o => o.value === sortLabel) ? undefined : '—'"
                            @update:modelValue="(field) => field && list.setSort(field, 'desc')" />
                    </template>

                    <template #toolbar>
                        <label class="flex items-center gap-1.5 text-xs text-ink-body whitespace-nowrap">
                            {{ $t('superadmin.invoices.filter.from') }}
                            <input type="date" :value="list.state.filters.date_from"
                                class="h-9 text-sm border border-line rounded-lg px-3 bg-white text-ink outline-none focus:border-accent transition-colors"
                                @change="list.setFilter('date_from', ($event.target as HTMLInputElement).value)" />
                        </label>
                        <label class="flex items-center gap-1.5 text-xs text-ink-body whitespace-nowrap">
                            {{ $t('superadmin.invoices.filter.to') }}
                            <input type="date" :value="list.state.filters.date_to"
                                class="h-9 text-sm border border-line rounded-lg px-3 bg-white text-ink outline-none focus:border-accent transition-colors"
                                @change="list.setFilter('date_to', ($event.target as HTMLInputElement).value)" />
                        </label>
                        <ModulesSuperadminDataTableSelect :modelValue="list.state.filters.is_paid" :options="paidOptions"
                            :placeholder="$t('superadmin.invoices.filter.allPayments')"
                            @update:modelValue="(value) => list.setFilter('is_paid', value)" />
                    </template>

                    <template #cell-created_at="{ row: invoice }">
                        {{ formatDateTimeToReadable(invoice?.created_at) }}
                    </template>
                    <template #cell-type="{ row: invoice }">
                        <span v-if="invoice?.type === 'recurring'" class="co-badge co-badge-blue">
                            <Icon name="ph:arrows-clockwise" class="w-3 h-3" />
                            {{ $t('recurring.recurring') }}
                        </span>
                        <span v-else class="co-badge co-badge-gray">
                            {{ $t('superadmin.invoices.table.new') }}
                        </span>
                        <Tooltip v-if="invoice?.invoice_type === 'bank_transfer'"
                            :text="$t('superadmin.agreements.payment.bankTransferHelp')" position="top" wrap>
                            <span class="co-badge co-badge-navy ml-1.5">
                                <Icon name="ph:bank" class="w-3 h-3" aria-hidden="true" />
                                {{ $t('superadmin.agreements.payment.bankTransfer') }}
                            </span>
                        </Tooltip>
                    </template>
                    <!-- Three states, because there are three. A rejected
                         card payment read as "Unpaid" like an invoice
                         nobody had tried to charge yet, which is the
                         difference somebody working this list is after. -->
                    <template #cell-status="{ row: invoice }">
                        <Tooltip v-if="invoice?.covered_by_agreement" :text="$t('superadmin.agreements.covered.help')" position="top" wrap>
                            <span class="co-badge co-badge-navy">
                                <Icon name="ph:handshake" class="w-3 h-3" aria-hidden="true" />
                                {{ $t('superadmin.agreements.covered.chip') }}
                            </span>
                        </Tooltip>
                        <ModulesSuperadminStatusPill v-else-if="invoice?.is_paid || invoice?.status === 'paid'" variant="success" :dot="false">
                            <Icon name="ph:check" class="w-3 h-3" />
                            {{ $t('superadmin.invoices.table.paid') }}
                        </ModulesSuperadminStatusPill>
                        <Tooltip v-else-if="invoiceChip(invoice) === 'resolved'"
                            :text="$t('paymentDunning.invoices.resolvedHelp')" position="top" wrap>
                            <ModulesSuperadminStatusPill variant="neutral" :dot="false">
                                <Icon name="ph:arrow-counter-clockwise" class="w-3 h-3" aria-hidden="true" />
                                {{ $t('paymentDunning.invoices.resolvedChip') }}
                            </ModulesSuperadminStatusPill>
                        </Tooltip>
                        <ModulesSuperadminStatusPill v-else-if="invoiceChip(invoice) === 'failed'" variant="danger" :dot="false">
                            <Icon name="ph:x" class="w-3 h-3" />
                            {{ $t('superadmin.invoices.tabs.failed') }}
                        </ModulesSuperadminStatusPill>
                        <ModulesSuperadminStatusPill v-else variant="warning" :dot="false">
                            <Icon name="ph:clock" class="w-3 h-3" />
                            {{ $t('superadmin.invoices.tabs.pending') }}
                        </ModulesSuperadminStatusPill>
                    </template>
                    <template #cell-invoice_number="{ row: invoice }">
                        <span class="font-mono text-ink font-medium">#{{ invoice?.invoice_number }}</span>
                    </template>
                    <template #cell-total_amount="{ row: invoice }">
                        <span class="text-[14px] font-semibold text-ink tabular-nums">
                            {{ formatAmount(invoice?.total_amount, 'DKK') }}
                        </span>
                    </template>
                    <template #cell-company="{ row: invoice }">
                        <div class="flex items-center gap-2">
                            <div class="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                                <span class="text-[10px] font-bold text-accent">
                                    {{ (invoice?.user?.company?.name || '?').charAt(0).toUpperCase() }}
                                </span>
                            </div>
                            <span class="text-[13px] text-ink truncate max-w-[160px]">
                                {{ invoice?.user?.company?.name || '—' }}
                            </span>
                        </div>
                    </template>
                    <template #cell-actions="{ row: invoice }">
                        <div
                            class="flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                            <SuperadminTableButton
                                @click="navigateTo(`/superadmin/invoices/${invoice.uuid}/invoice-details`)">
                                <Icon name="ph:eye" class="w-3.5 h-3.5" />
                                {{ $t('superadmin.invoices.table.actions.view') }}
                            </SuperadminTableButton>
                            <SuperadminTableButton v-if="!invoice?.is_paid && !invoice?.invoice_type && !invoice?.covered_by_agreement"
                                buttonStyle="success" @click="confirmMarkInvoiceAsPaid(invoice)">
                                <Icon name="ph:check" class="w-3.5 h-3.5" />
                                {{ $t('superadmin.invoices.table.actions.markAsPaid') }}
                            </SuperadminTableButton>
                            <Tooltip v-if="!invoice?.is_paid && !invoice?.covered_by_agreement"
                                :text="$t('superadmin.agreements.payment.registerHelp')" position="top">
                                <SuperadminTableButton buttonStyle="success"
                                    @click="openRegisterPayment(invoice)">
                                    <Icon name="ph:bank" class="w-3.5 h-3.5" aria-hidden="true" />
                                    {{ $t('superadmin.agreements.payment.register') }}
                                </SuperadminTableButton>
                            </Tooltip>
                            <Tooltip v-if="invoice?.is_paid && invoice?.paid_at && invoice?.paid_source !== 'card'"
                                :text="$t('superadmin.agreements.payment.undoHelp')" position="top">
                                <SuperadminTableButton buttonStyle="danger" @click="confirmUndoPayment(invoice)">
                                    <Icon name="ph:arrow-counter-clockwise" class="w-3.5 h-3.5" aria-hidden="true" />
                                    {{ $t('superadmin.agreements.payment.undo') }}
                                </SuperadminTableButton>
                            </Tooltip>
                        </div>
                    </template>
                </ModulesSuperadminDataTable>
            </div>

            <ModulesSuperadminInvoiceModalDownload :isModalOpen="state.modal.isDownloadOpen"
                @close="state.modal.isDownloadOpen = false" />
            <ModulesSuperadminAgreementModalPayment :isModalOpen="state.modal.isPaymentOpen"
                :invoice="state.selectedInvoice" @close="state.modal.isPaymentOpen = false"
                @saved="onPaymentSaved" />
            <DialogConfirmation :isModalOpen="state.modal.isUndoPaymentOpen"
                :message="$t('superadmin.agreements.payment.undoConfirm') + '?'"
                @close="state.modal.isUndoPaymentOpen = false" @confirm="undoPayment" />
            <DialogConfirmation :isModalOpen="state.modal.isMarkAsPaidConfirmationOpen"
                :message="$t('superadmin.invoices.table.confirmation.markAsPaidConfirmation') + '?'"
                @close="state.modal.isMarkAsPaidConfirmationOpen = false" @confirm="markInvoiceAsPaid" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { invoiceService } from '@/components/api/superadmin/InvoiceService'
import { agreementService } from '@/components/api/superadmin/AgreementService'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { invoiceChip, invoiceCounts } from '@/composables/billingMethod'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useAlert } from '@/composables/alert'
import { useListQuery } from '@/composables/useListQuery'
import { apiSearchParam } from '@/composables/listQuery'
import { normalizePageMeta, responseRows, type DataTableColumn } from '@/composables/dataTable'
import type { CsvColumn } from '@/composables/csvExport'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatAmount } = useAmountFormatter()
const { formatDateTimeToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    loadError: null as string | null,
    failedCount: 0,
    resolvedCount: null as number | null,
    invoices: [] as any,
    isTableLoading: false,
    modal: {
        isDownloadOpen: false,
        isMarkAsPaidConfirmationOpen: false,
        isPaymentOpen: false,
        isUndoPaymentOpen: false,
    },
    paidCount: 0,
    totalCount: 0,
    pendingCount: 0,
    selectedInvoice: {} as any,
})

// The tabs are `status`, not `is_paid`: Paid, Pending and Rejected are the
// status column, and a rejected card payment is a status of its own -
// filtering two of the tabs on "not paid" made them the same list.
const list = useListQuery({
    filters: { status: '', date_from: '', date_to: '', is_paid: '' },
    defaultSort: 'id',
    defaultOrder: 'desc',
    onChange: fetchInvoices,
})

const meta = computed(() => normalizePageMeta(state.invoices))

const columns = computed<DataTableColumn[]>(() => [
    { key: 'created_at', label: t('superadmin.invoices.table.date'), sortable: true },
    { key: 'type', label: t('superadmin.invoices.table.type') },
    { key: 'status', label: t('superadmin.invoices.table.status') },
    { key: 'invoice_number', label: t('superadmin.invoices.table.invoiceNumber'), sortable: true },
    { key: 'total_amount', label: t('superadmin.invoices.table.amount'), sortable: true },
    { key: 'company', label: t('superadmin.invoices.table.company') },
    { key: 'actions', label: '', align: 'right' },
])

function statusLabel(invoice: any) {
    if (invoice?.covered_by_agreement) return t('superadmin.agreements.covered.chip')
    if (invoice?.is_paid || invoice?.status === 'paid') return t('superadmin.invoices.table.paid')
    const chip = invoiceChip(invoice)
    if (chip === 'resolved') return t('paymentDunning.invoices.resolvedChip')
    if (chip === 'failed') return t('superadmin.invoices.tabs.failed')
    return t('superadmin.invoices.tabs.pending')
}

const exportColumns = computed<CsvColumn[]>(() => [
    { label: t('superadmin.invoices.table.date'), value: i => i?.created_at, type: 'datetime' },
    { label: t('superadmin.invoices.table.type'), value: i => (i?.type === 'recurring' ? t('recurring.recurring') : t('superadmin.invoices.table.new')) },
    { label: t('superadmin.invoices.table.status'), value: statusLabel },
    { label: t('superadmin.invoices.table.invoiceNumber'), value: i => i?.invoice_number },
    { label: t('superadmin.invoices.table.amount'), value: i => i?.total_amount, type: 'amount' },
    { label: t('superadmin.invoices.table.company'), value: i => i?.user?.company?.name },
])

const tabs = computed(() => [
    { key: 'all', label: t('superadmin.invoices.tabs.all'), count: state.totalCount, help: '' },
    { key: 'paid', label: t('superadmin.invoices.tabs.paid'), count: state.paidCount, help: '' },
    { key: 'pending', label: t('superadmin.invoices.tabs.pending'), count: state.pendingCount, help: '' },
    { key: 'failed', label: t('superadmin.invoices.tabs.failed'), count: state.failedCount, help: t('paymentDunning.invoices.failedTabHelp') },
    ...(state.resolvedCount === null ? [] : [{ key: 'resolved', label: t('paymentDunning.invoices.resolvedTab'), count: state.resolvedCount, help: t('paymentDunning.invoices.resolvedHelp') }]),
])

const sortOptions = computed(() => [
    { value: 'id', label: t('superadmin.invoices.sort.newestFirst') },
    { value: 'total_amount', label: t('superadmin.invoices.sort.highestAmount') },
    { value: 'invoice_number', label: t('superadmin.invoices.sort.invoiceNumber') },
])

// The quick sort is always descending; a header sort it has no entry for shows a dash.
const sortLabel = computed(() => (list.state.order === 'desc' ? list.state.sort ?? '' : ''))

const paidOptions = computed(() => [
    { value: 'true', label: t('superadmin.invoices.table.paid') },
    { value: 'false', label: t('superadmin.invoices.filter.unpaid') },
])

const chips = computed(() => {
    const filters = list.state.filters
    const out = []
    if (filters.date_from) out.push({ key: 'date_from', label: `${t('superadmin.invoices.filter.from')} ${filters.date_from}` })
    if (filters.date_to) out.push({ key: 'date_to', label: `${t('superadmin.invoices.filter.to')} ${filters.date_to}` })
    if (filters.is_paid) out.push({ key: 'is_paid', label: paidOptions.value.find(o => o.value === filters.is_paid)?.label ?? filters.is_paid })
    return out
})

function listParams(page: number) {
    const filters = list.state.filters
    const params: any = { page, ...list.apiSort() }
    const search = apiSearchParam(list.state.search)
    if (search) params.search = search
    if (filters.date_from) params.date_from = filters.date_from
    if (filters.date_to) params.date_to = filters.date_to
    if (filters.is_paid !== '') params.is_paid = filters.is_paid
    if (filters.status) params.status = filters.status
    return params
}

let requestSeq = 0

async function fetchInvoices() {
    const seq = ++requestSeq
    state.loadError = null
    state.isTableLoading = true
    try {
        const response = await invoiceService.getInvoices(listParams(list.state.page))
        if (seq !== requestSeq) return
        if (response) {
            state.invoices = response
            // Older servers lack some counts; invoiceCounts never yields NaN and says
            // when the resolved count is not reported at all.
            const counts = invoiceCounts(response)
            state.totalCount = counts.total
            state.paidCount = counts.paid
            state.pendingCount = counts.pending
            state.failedCount = counts.failed
            state.resolvedCount = counts.resolved
        }
    } catch (error: any) {
        if (seq !== requestSeq) return
        state.loadError = error?.message || t('superadmin.dataTable.errorTitle')
    }
    if (seq === requestSeq) state.isTableLoading = false
}

async function exportPage(page: number) {
    const response = await invoiceService.getInvoices(listParams(page))
    const pageMeta = normalizePageMeta(response)
    return { rows: responseRows(response), lastPage: pageMeta?.lastPage ?? 1, total: pageMeta?.total ?? 0 }
}

function confirmMarkInvoiceAsPaid(invoice: any) {
    state.selectedInvoice = invoice
    state.modal.isMarkAsPaidConfirmationOpen = true
}

function openRegisterPayment(invoice: any) {
    state.selectedInvoice = invoice
    state.modal.isPaymentOpen = true
}

async function onPaymentSaved() {
    state.modal.isPaymentOpen = false
    successAlert(`${t('alert.success')}!`, t('superadmin.agreements.payment.registered'))
    await fetchInvoices()
}

function confirmUndoPayment(invoice: any) {
    state.selectedInvoice = invoice
    state.modal.isUndoPaymentOpen = true
}

async function undoPayment() {
    state.error = {}
    try {
        await agreementService.undoPayment(state.selectedInvoice.uuid)
        successAlert(`${t('alert.success')}!`, t('superadmin.agreements.payment.undone'))
        state.modal.isUndoPaymentOpen = false
        await fetchInvoices()
    } catch (error: any) {
        state.modal.isUndoPaymentOpen = false
        state.error = error
    }
}

async function markInvoiceAsPaid() {
    state.error = {}
    try {
        await invoiceService.markInvoiceAsPaid(state.selectedInvoice.uuid)
        successAlert(`${t('alert.success')}!`, `${t('superadmin.invoices.form.alert.invoiceMarkedAsPaid')}`)
        await fetchInvoices()
        state.modal.isMarkAsPaidConfirmationOpen = false
    } catch (error: any) { state.error = error }
}
</script>
