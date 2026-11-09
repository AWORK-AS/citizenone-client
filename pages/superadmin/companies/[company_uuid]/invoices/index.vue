<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.invoices.invoices') }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #header>{{ $t('superadmin.invoices.invoices') }}</template>

            <div class="p-1">
                <ModulesSuperadminCompanyHeader />


                <div class="mt-5 space-y-4">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <SuperadminTableSearch v-model="searchQuery"
                        :placeholder="$t('superadmin.invoices.searchPlaceholder')" @input="debouncedSearch" />
                    <SuperadminTable :columnHeaders="state.columnHeaders" :data="state.invoices"
                        :isLoading="state.isTableLoading" :sortData="state.sortData"
                        :emptyMessage="$t('superadmin.invoices.noInvoicesFound')" emptyIcon="ph:invoice" rowKey="uuid"
                        @sort="handleSort">
                        <template #body>
                            <tr v-for="(invoice, index) in state.invoices?.data" :key="index"
                                class="border-b border-surface-canvas hover:bg-surface-subtle transition-colors group">
                                <td class="co-td text-[13px] text-ink-body">
                                    {{ formatDateTimeToReadable(invoice?.created_at) }}
                                </td>
                                <td class="co-td">
                                    <span v-if="invoice?.type === 'recurring'" class="co-badge co-badge-navy">
                                        {{ $t('recurring.recurring') }}
                                    </span>
                                    <span v-else class="co-badge co-badge-blue">
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
                                <td class="co-td">
                                    <Tooltip v-if="invoice?.covered_by_agreement" :text="$t('superadmin.agreements.covered.help')" position="top" wrap>
                                        <span class="co-badge co-badge-navy">
                                            <Icon name="ph:handshake" class="w-3 h-3" aria-hidden="true" />
                                            {{ $t('superadmin.agreements.covered.chip') }}
                                        </span>
                                    </Tooltip>
                                    <span v-else-if="invoice?.is_paid" class="co-badge co-badge-green">
                                        <span class="w-1.5 h-1.5 rounded-full bg-success"></span>
                                        {{ $t('superadmin.invoices.table.paid') }}
                                    </span>
                                    <span v-else class="co-badge co-badge-red">
                                        <span class="w-1.5 h-1.5 rounded-full bg-danger"></span>
                                        {{ $t('superadmin.invoices.table.unpaid') }}
                                    </span>
                                </td>
                                <td class="co-td text-[13px] text-ink-body font-mono">
                                    {{ invoice?.invoice_number }}
                                </td>
                                <td class="co-td text-[13px] text-ink font-medium">
                                    {{ formatAmount(invoice?.total_amount, 'DKK') }}
                                </td>
                                <td class="co-td" @click.stop>
                                    <div
                                        class="flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                        <SuperadminTableButton
                                            @click="navigateTo(`/superadmin/companies/${companyUuid}/invoices/${invoice.uuid}/invoice-details`)">
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
                                            <SuperadminTableButton buttonStyle="danger"
                                                @click="confirmUndoPayment(invoice)">
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
                <ModulesSuperadminAgreementModalPayment :isModalOpen="state.modal.isPaymentOpen"
                    :invoice="state.selectedInvoice" @close="state.modal.isPaymentOpen = false"
                    @saved="onPaymentSaved" />
                <DialogConfirmation :isModalOpen="state.modal.isUndoPaymentOpen"
                    :message="$t('superadmin.agreements.payment.undoConfirm') + '?'"
                    @close="state.modal.isUndoPaymentOpen = false" @confirm="undoPayment" />
                <DialogConfirmation :isModalOpen="state.modal.isMarkAsPaidConfirmationOpen"
                    :message="$t('superadmin.invoices.table.confirmation.markAsPaidConfirmation') + '?'"
                    @close="state.modal.isMarkAsPaidConfirmationOpen = false" @confirm="markInvoiceAsPaid" />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { companyService } from '@/components/api/superadmin/CompanyService'
import { invoiceService } from '@/components/api/superadmin/InvoiceService'
import { agreementService } from '@/components/api/superadmin/AgreementService'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const router = useRouter()
const companyUuid = router?.currentRoute?.value?.params?.company_uuid
const { formatAmount } = useAmountFormatter()
const { formatDateTimeToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1
let searchTimeout: any = null
const searchQuery = ref('')


const state = reactive({
    columnHeaders: computed(() => [
        { key: 'created_at', name: t('superadmin.invoices.table.date'), sorter: true },
        { key: 'type', name: t('superadmin.invoices.table.status') },
        { key: 'is_paid', name: t('superadmin.invoices.table.paid') },
        { key: 'invoice_number', name: t('superadmin.invoices.table.invoiceNumber'), sorter: true },
        { key: 'total_amount', name: t('superadmin.invoices.table.amount'), sorter: true },
        { key: 'actions', name: '' },
    ]),
    dataFilter: {
        search: ''
    } as any,
    error: {} as Error,
    invoices: {} as any,
    isTableLoading: false,
    modal: {
        isMarkAsPaidConfirmationOpen: false,
        isPaymentOpen: false,
        isUndoPaymentOpen: false,
    },
    selectedInvoice: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchInvoices()
})

async function fetchInvoices() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await companyService.getInvoicesPerCompany(companyUuid, params)
        if (response) {
            state.invoices = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchInvoices()
}

function next() {
    currentTablePage++
    fetchInvoices()
}

function handleSort({ sort, column }: { sort: string | null; column: string | null }) {
    state.sortData.sortField = column ?? 'id'
    state.sortData.sortOrder = sort ?? 'descend'
    currentTablePage = 1
    fetchInvoices()
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
    } catch (error: any) {
        state.error = error
    }
}
</script>