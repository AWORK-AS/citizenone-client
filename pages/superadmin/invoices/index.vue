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
                <div class="flex items-center justify-between mb-5">
                    <div>
                        <h1 class="text-[22px] font-semibold text-[#1F2533]">
                            {{ $t('superadmin.invoices.invoices') }}
                        </h1>
                        <p class="text-sm text-[#5C6478] mt-0.5">
                            <!-- `meta.total` is where a paginated collection carries
                                 its count; `total` was never in the response, so this
                                 line read "0 invoices in total" above a full page. -->
                            {{ $t('superadmin.invoices.totalInvoices', { count: state.invoices?.meta?.total ?? 0 }) }}
                        </p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button
                            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 transition-colors"
                            @click="setTabFilter('pending')">
                            <span class="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                            {{ state.pendingCount }} {{ $t('superadmin.invoices.pending') }}
                        </button>
                        <button
                            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
                            @click="setTabFilter('failed')">
                            <span class="w-2 h-2 rounded-full bg-red-500"></span>
                            {{ state.failedCount }} {{ $t('superadmin.invoices.failed') }}
                        </button>
                        <FormButton buttonStyle="action" @click="state.modal.isDownloadOpen = true">
                            <Icon name="ph:download-simple" class="h-4 w-4" />
                            {{ $t('superadmin.invoices.download.download') }}
                        </FormButton>
                    </div>
                </div>

                <div class="flex flex-wrap items-center gap-3 mb-4">
                    <div class="flex items-center bg-white border border-[#EAECF0] rounded-lg p-0.5">
                        <button v-for="tab in tabs" :key="tab.key"
                            class="px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors flex items-center gap-1.5"
                            :style="state.activeTab === tab.key ? 'background:#205E77;color:#fff' : 'color:#5C6478'"
                            @click="setTabFilter(tab.key)">
                            {{ tab.label }}
                            <span class="text-[11px] font-normal opacity-70">({{ tab.count }})</span>
                        </button>
                    </div>

                    <select v-model="state.sortData.sortField"
                        class="text-sm border border-[#EAECF0] rounded-lg px-3 py-2 bg-white text-[#5C6478] outline-none focus:border-[#42AED9] transition-colors"
                        @change="() => { state.sortData.sortOrder = 'descend'; currentTablePage = 1; fetchInvoices() }">
                        <option value="id">{{ $t('superadmin.invoices.sort.newestFirst') }}</option>
                        <option value="total_amount">{{ $t('superadmin.invoices.sort.highestAmount') }}</option>
                        <option value="invoice_number">{{ $t('superadmin.invoices.sort.invoiceNumber') }}</option>
                    </select>
                </div>

                <div class="bg-white border border-[#EAECF0] rounded-xl p-4 mb-5 flex flex-wrap items-center gap-3">
                    <SuperadminTableSearch v-model="searchQuery"
                        :placeholder="$t('superadmin.invoices.searchPlaceholder')" @input="debouncedSearch" />

                    <div class="flex items-center gap-1.5">
                        <label class="text-xs text-[#5C6478] whitespace-nowrap">
                            {{ $t('superadmin.invoices.filter.from') }}
                        </label>
                        <input type="date" v-model="state.dataFilter.date_from"
                            class="text-sm border border-[#EAECF0] rounded-lg px-3 py-2 bg-white text-[#1F2533] outline-none focus:border-[#42AED9] transition-colors"
                            @change="handleFilterChange" />
                    </div>

                    <div class="flex items-center gap-1.5">
                        <label class="text-xs text-[#5C6478] whitespace-nowrap">
                            {{ $t('superadmin.invoices.filter.to') }}
                        </label>
                        <input type="date" v-model="state.dataFilter.date_to"
                            class="text-sm border border-[#EAECF0] rounded-lg px-3 py-2 bg-white text-[#1F2533] outline-none focus:border-[#42AED9] transition-colors"
                            @change="handleFilterChange" />
                    </div>

                    <select v-model="state.dataFilter.is_paid"
                        class="text-sm border border-[#EAECF0] rounded-lg px-3 py-2 bg-white text-[#5C6478] outline-none focus:border-[#42AED9] transition-colors"
                        @change="handleFilterChange">
                        <option value="">{{ $t('superadmin.invoices.filter.allPayments') }}</option>
                        <option value="true">{{ $t('superadmin.invoices.table.paid') }}</option>
                        <option value="false">{{ $t('superadmin.invoices.filter.unpaid') }}</option>
                    </select>

                    <button v-if="hasActiveFilters"
                        class="text-xs text-[#5C6478] hover:text-[#CC3B2D] flex items-center gap-1 transition-colors"
                        @click="clearFilters">
                        <Icon name="ph:x-circle" class="w-3.5 h-3.5" />
                        {{ $t('superadmin.invoices.filter.clearFilters') }}
                    </button>
                </div>

                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <SuperadminTable :columnHeaders="state.columnHeaders" :data="state.invoices"
                    :isLoading="state.isTableLoading" :sortData="state.sortData"
                    :emptyMessage="$t('superadmin.invoices.noInvoicesFound')"
                    :emptySubMessage="hasActiveFilters ? $t('superadmin.invoices.tryToClearFilters') : ''"
                    emptyIcon="ph:receipt" rowKey="uuid" @sort="handleSort">
                    <template #body>
                        <tr v-for="(invoice, index) in state.invoices?.data" :key="index"
                            class="border-b border-[#F5F6F8] hover:bg-[#F9FAFB] transition-colors group">
                            <td class="co-td text-[#5C6478] text-[13px]">
                                {{ formatDateTimeToReadable(invoice?.created_at) }}
                            </td>
                            <td class="co-td">
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
                            </td>
                            <!-- Three states, because there are three. A rejected
                                 card payment read as "Unpaid" like an invoice
                                 nobody had tried to charge yet, which is the
                                 difference somebody working this list is after. -->
                            <td class="co-td">
                                <Tooltip v-if="invoice?.covered_by_agreement" :text="$t('superadmin.agreements.covered.help')" position="top" wrap>
                                    <span class="co-badge co-badge-navy">
                                        <Icon name="ph:handshake" class="w-3 h-3" aria-hidden="true" />
                                        {{ $t('superadmin.agreements.covered.chip') }}
                                    </span>
                                </Tooltip>
                                <span v-else-if="invoice?.is_paid || invoice?.status === 'paid'"
                                    class="co-badge co-badge-green">
                                    <Icon name="ph:check" class="w-3 h-3" />
                                    {{ $t('superadmin.invoices.table.paid') }}
                                </span>
                                <span v-else-if="invoice?.status === 'failed'" class="co-badge co-badge-red">
                                    <Icon name="ph:x" class="w-3 h-3" />
                                    {{ $t('superadmin.invoices.tabs.failed') }}
                                </span>
                                <span v-else class="co-badge co-badge-gray">
                                    <Icon name="ph:clock" class="w-3 h-3" />
                                    {{ $t('superadmin.invoices.tabs.pending') }}
                                </span>
                            </td>
                            <td class="co-td font-mono text-[13px] text-[#1F2533] font-medium">
                                #{{ invoice?.invoice_number }}
                            </td>
                            <td class="co-td">
                                <span class="text-[14px] font-semibold text-[#1F2533]">
                                    {{ formatAmount(invoice?.total_amount, 'DKK') }}
                                </span>
                            </td>
                            <td class="co-td">
                                <div class="flex items-center gap-2">
                                    <div
                                        class="w-6 h-6 rounded-full bg-[#42AED9]/10 flex items-center justify-center flex-shrink-0">
                                        <span class="text-[10px] font-bold text-[#42AED9]">
                                            {{ (invoice?.user?.company?.name || '?').charAt(0).toUpperCase() }}
                                        </span>
                                    </div>
                                    <span class="text-[13px] text-[#1F2533] truncate max-w-[160px]">
                                        {{ invoice?.user?.company?.name || '—' }}
                                    </span>
                                </div>
                            </td>
                            <td class="co-td" @click.stop>
                                <div
                                    class="flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
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
                                    <Tooltip v-if="invoice?.is_paid && invoice?.paid_at"
                                        :text="$t('superadmin.agreements.payment.undoHelp')" position="top">
                                        <SuperadminTableButton buttonStyle="danger" @click="confirmUndoPayment(invoice)">
                                            <Icon name="ph:arrow-counter-clockwise" class="w-3.5 h-3.5" aria-hidden="true" />
                                            {{ $t('superadmin.agreements.payment.undo') }}
                                        </SuperadminTableButton>
                                    </Tooltip>
                                </div>
                            </td>
                        </tr>
                    </template>
                </SuperadminTable>

                <Pagination :data="state.invoices" @previous="previous" @next="next" />
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
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatAmount } = useAmountFormatter()
const { formatDateTimeToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()

let currentTablePage = 1
let searchTimeout: any = null
const searchQuery = ref('')

const state = reactive({
    activeTab: 'all',
    columnHeaders: computed(() => [
        { key: 'created_at', name: t('superadmin.invoices.table.date'), sorter: true },
        { key: 'type', name: t('superadmin.invoices.table.type') },
        { key: 'status', name: t('superadmin.invoices.table.status') },
        { key: 'invoice_number', name: t('superadmin.invoices.table.invoiceNumber'), sorter: true },
        { key: 'total_amount', name: t('superadmin.invoices.table.amount'), sorter: true },
        { key: 'company', name: t('superadmin.invoices.table.company') },
        { key: 'actions', name: '' },
    ]),
    dataFilter: {
        search: '',
        date_from: '',
        date_to: '',
        is_paid: '',
        // The tabs. Paid, Pending and Rejected are the `status` column, not
        // `is_paid`: a rejected card payment is a status of its own, and
        // filtering two of the tabs on "not paid" made them the same list.
        status: ''
    } as any,
    error: {} as Error,
    failedCount: 0,
    invoices: [] as any,
    isTableLoading: false,
    modal: {
        isDownloadOpen: false,
        isMarkAsPaidConfirmationOpen: false,
        isPaymentOpen: false,
        isUndoPaymentOpen: false,
    },
    paidCount: 0,
    pendingCount: 0,
    selectedInvoice: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend'
    },
})

const hasActiveFilters = computed(() =>
    state.dataFilter.date_from || state.dataFilter.date_to || state.dataFilter.is_paid
    || state.dataFilter.search || state.dataFilter.status
)

const tabs = computed(() => [
    { key: 'all', label: t('superadmin.invoices.tabs.all'), count: (state.paidCount + state.pendingCount + state.failedCount) },
    { key: 'paid', label: t('superadmin.invoices.tabs.paid'), count: state.paidCount },
    { key: 'pending', label: t('superadmin.invoices.tabs.pending'), count: state.pendingCount },
    { key: 'failed', label: t('superadmin.invoices.tabs.failed'), count: state.failedCount },
])

onMounted(() => {
    fetchInvoices()
})

async function fetchInvoices() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params: any = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
        }
        if (state.dataFilter.search) params.search = state.dataFilter.search
        if (state.dataFilter.date_from) params.date_from = state.dataFilter.date_from
        if (state.dataFilter.date_to) params.date_to = state.dataFilter.date_to
        if (state.dataFilter.is_paid !== '') params.is_paid = state.dataFilter.is_paid
        if (state.dataFilter.status) params.status = state.dataFilter.status

        const response = await invoiceService.getInvoices(params)
        if (response) {
            state.invoices = response
            state.paidCount = response?.paid_invoices_count
            state.pendingCount = response?.pending_invoices_count
            state.failedCount = response?.failed_invoices_count
        }
    } catch (error: any) { state.error = error }
    state.isTableLoading = false
}

function debouncedSearch() {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        const trimmed = searchQuery.value.trim()
        state.dataFilter.search = trimmed.length ? Array(trimmed.split(/\s+/)) : null
        currentTablePage = 1
        fetchInvoices()
    }, 350)
}

function handleFilterChange() {
    currentTablePage = 1
    fetchInvoices()
}

function handleSort({ sort, column }: { sort: string | null; column: string | null }) {
    state.sortData.sortField = column ?? 'id'
    state.sortData.sortOrder = sort ?? 'descend'
    currentTablePage = 1
    fetchInvoices()
}

function previous() {
    currentTablePage--
    fetchInvoices()
}

function next() {
    currentTablePage++
    fetchInvoices()
}

function setTabFilter(tab: string) {
    state.activeTab = tab
    state.dataFilter.status = tab === 'all' ? '' : tab
    currentTablePage = 1
    fetchInvoices()
}

function clearFilters() {
    searchQuery.value = ''
    state.activeTab = 'all'
    state.dataFilter = { search: '', date_from: '', date_to: '', is_paid: '', status: '' }
    currentTablePage = 1
    fetchInvoices()
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
    try {
        await invoiceService.markInvoiceAsPaid(state.selectedInvoice.uuid)
        successAlert(`${t('alert.success')}!`, `${t('superadmin.invoices.form.alert.invoiceMarkedAsPaid')}`)
        await fetchInvoices()
        state.modal.isMarkAsPaidConfirmationOpen = false
    } catch (error: any) { state.error = error }
}
</script>
