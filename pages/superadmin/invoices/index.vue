<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.invoices.invoices') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('superadmin.invoices.invoices') }}</template>

            <div>
                <!-- Top bar -->
                <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
                    <p class="text-sm text-gray-500">{{ state.invoices?.total ?? 0 }} fakturaer</p>
                    <FormButton buttonStyle="action" @click="state.modal.isDownloadOpen = true">
                        <Icon name="ph:download" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('superadmin.invoices.download.download') }}
                    </FormButton>
                </div>

                <!-- Filters -->
                <div class="flex flex-wrap items-center gap-3 mb-5">
                    <TableSearch @search="handleSearch" />

                    <!-- Date from -->
                    <div class="flex items-center gap-1.5">
                        <label class="text-xs text-gray-500 whitespace-nowrap">Fra</label>
                        <input type="date" v-model="state.dataFilter.date_from"
                            class="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
                            @change="handleFilterChange" />
                    </div>

                    <!-- Date to -->
                    <div class="flex items-center gap-1.5">
                        <label class="text-xs text-gray-500 whitespace-nowrap">Til</label>
                        <input type="date" v-model="state.dataFilter.date_to"
                            class="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
                            @change="handleFilterChange" />
                    </div>

                    <!-- Customer filter -->
                    <select v-model="state.dataFilter.company_uuid"
                        class="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
                        @change="handleFilterChange">
                        <option value="">Alle kunder</option>
                        <option v-for="c in state.companies" :key="c.uuid" :value="c.uuid">
                            {{ c.name }}
                        </option>
                    </select>

                    <!-- Paid status filter -->
                    <select v-model="state.dataFilter.is_paid"
                        class="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
                        @change="handleFilterChange">
                        <option value="">Betaling: alle</option>
                        <option value="true">Betalt</option>
                        <option value="false">Ubetalt</option>
                    </select>

                    <!-- Clear filters -->
                    <button v-if="hasActiveFilters"
                        class="text-xs text-gray-500 hover:text-gray-800 underline"
                        @click="clearFilters">
                        Ryd filtre
                    </button>
                </div>

                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />

                    <!-- Table -->
                    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div v-if="state.isTableLoading" class="p-10 flex justify-center">
                            <Icon name="ph:spinner" class="w-6 h-6 text-gray-400 animate-spin" />
                        </div>
                        <div v-else-if="!state.invoices?.data?.length"
                            class="p-12 flex flex-col items-center gap-2 text-gray-400">
                            <Icon name="ph:receipt" class="w-12 h-12" />
                            <p class="text-sm">Ingen fakturaer fundet</p>
                        </div>
                        <table v-else class="w-full text-sm">
                            <thead>
                                <tr class="bg-gray-50 border-b border-gray-100">
                                    <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700"
                                        @click="sortBy('created_at')">
                                        <div class="flex items-center gap-1">
                                            {{ $t('superadmin.invoices.table.date') }}
                                            <Icon name="ph:arrows-down-up" class="w-3 h-3" />
                                        </div>
                                    </th>
                                    <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        {{ $t('superadmin.invoices.table.status') }}
                                    </th>
                                    <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        {{ $t('superadmin.invoices.table.paid') }}
                                    </th>
                                    <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700"
                                        @click="sortBy('invoice_number')">
                                        <div class="flex items-center gap-1">
                                            {{ $t('superadmin.invoices.table.invoiceNumber') }}
                                            <Icon name="ph:arrows-down-up" class="w-3 h-3" />
                                        </div>
                                    </th>
                                    <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700"
                                        @click="sortBy('total_amount')">
                                        <div class="flex items-center gap-1">
                                            {{ $t('superadmin.invoices.table.amount') }}
                                            <Icon name="ph:arrows-down-up" class="w-3 h-3" />
                                        </div>
                                    </th>
                                    <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        {{ $t('superadmin.invoices.table.company') }}
                                    </th>
                                    <th class="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(invoice, index) in state.invoices?.data" :key="index"
                                    class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                    <td class="px-4 py-3 text-gray-600">
                                        {{ formatDateTimeToReadable(invoice?.created_at) }}
                                    </td>
                                    <td class="px-4 py-3">
                                        <span v-if="invoice?.type === 'recurring'"
                                            class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                            {{ $t('recurring.recurring') }}
                                        </span>
                                        <span v-else
                                            class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                            {{ $t('superadmin.invoices.table.new') }}
                                        </span>
                                    </td>
                                    <td class="px-4 py-3">
                                        <span v-if="invoice?.is_paid"
                                            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                            <Icon name="ph:check" class="w-3 h-3" />
                                            {{ $t('superadmin.invoices.table.paid') }}
                                        </span>
                                        <span v-else
                                            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
                                            <Icon name="ph:x" class="w-3 h-3" />
                                            {{ $t('superadmin.invoices.table.unpaid') }}
                                        </span>
                                    </td>
                                    <td class="px-4 py-3 font-mono text-gray-700 text-xs">
                                        {{ invoice?.invoice_number }}
                                    </td>
                                    <td class="px-4 py-3 font-semibold text-gray-900">
                                        {{ formatAmount(invoice?.total_amount) }}
                                    </td>
                                    <td class="px-4 py-3 text-gray-600">
                                        {{ invoice?.user?.company?.name || '—' }}
                                    </td>
                                    <td class="px-4 py-3">
                                        <div class="flex items-center gap-1.5 justify-end">
                                            <FormButton type="button" buttonStyle="action"
                                                @click="navigateTo(`/superadmin/invoices/${invoice.uuid}/invoice-details`)">
                                                <Icon name="ph:eye" class="size-4" />
                                                {{ $t('superadmin.invoices.table.actions.view') }}
                                            </FormButton>
                                            <FormButton v-if="!invoice?.is_paid && !invoice?.invoice_type"
                                                type="button" buttonStyle="success"
                                                @click="confirmMarkInvoiceAsPaid(invoice)">
                                                <Icon name="ph:check" class="size-4" />
                                                {{ $t('superadmin.invoices.table.actions.markAsPaid') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <Pagination :data="state.invoices" @previous="previous" @next="next" />
                </div>
            </div>

            <ModulesSuperadminInvoiceModalDownload :isModalOpen="state.modal.isDownloadOpen"
                @close="state.modal.isDownloadOpen = false" />
            <DialogConfirmation :isModalOpen="state.modal.isMarkAsPaidConfirmationOpen"
                :message="$t('superadmin.invoices.table.confirmation.markAsPaidConfirmation') + '?'"
                @close="state.modal.isMarkAsPaidConfirmationOpen = false" @confirm="markInvoiceAsPaid" />

        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { invoiceService } from '@/components/api/superadmin/InvoiceService'
import { companyService } from '@/components/api/superadmin/CompanyService'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatAmount } = useAmountFormatter()
const { formatDateTimeToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()

let currentTablePage = 1

const state = reactive({
    companies: [] as any[],
    dataFilter: {
        search: '',
        date_from: '',
        date_to: '',
        company_uuid: '',
        is_paid: '',
    },
    error: {} as Error,
    invoices: [] as any,
    isTableLoading: false,
    modal: {
        isDownloadOpen: false,
        isMarkAsPaidConfirmationOpen: false,
    },
    selectedInvoice: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

const hasActiveFilters = computed(() =>
    state.dataFilter.date_from || state.dataFilter.date_to ||
    state.dataFilter.company_uuid || state.dataFilter.is_paid
)

onMounted(() => {
    fetchInvoices()
    fetchCompaniesForFilter()
})

async function fetchInvoices() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params: any = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            search: state.dataFilter.search,
        }
        if (state.dataFilter.date_from) params.date_from = state.dataFilter.date_from
        if (state.dataFilter.date_to) params.date_to = state.dataFilter.date_to
        if (state.dataFilter.company_uuid) params.company_uuid = state.dataFilter.company_uuid
        if (state.dataFilter.is_paid !== '') params.is_paid = state.dataFilter.is_paid

        const response = await invoiceService.getInvoices(params)
        if (response) state.invoices = response
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

async function fetchCompaniesForFilter() {
    try {
        const response = await companyService.getCompanies({ page: 1, sortField: 'name', sortOrder: 'ascend' })
        if (response) state.companies = response?.data ?? []
    } catch (_) { }
}

function previous() { currentTablePage--; fetchInvoices() }
function next() { currentTablePage++; fetchInvoices() }

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] === '' ? '' : (value?.[0] ?? '')
    fetchInvoices()
}

function handleFilterChange() {
    currentTablePage = 1
    fetchInvoices()
}

function sortBy(field: string) {
    currentTablePage = 1
    state.sortData.sortOrder = state.sortData.sortField === field && state.sortData.sortOrder === 'ascend' ? 'descend' : 'ascend'
    state.sortData.sortField = field
    fetchInvoices()
}

function clearFilters() {
    state.dataFilter.date_from = ''
    state.dataFilter.date_to = ''
    state.dataFilter.company_uuid = ''
    state.dataFilter.is_paid = ''
    currentTablePage = 1
    fetchInvoices()
}

function confirmMarkInvoiceAsPaid(invoice: any) {
    state.selectedInvoice = invoice
    state.modal.isMarkAsPaidConfirmationOpen = true
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
