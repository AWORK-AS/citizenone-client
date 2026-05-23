<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.invoices.invoices') }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #header>{{ $t('superadmin.invoices.invoices') }}</template>

            <div class="p-1">
                <!-- Back -->
                <NuxtLink to="/superadmin/companies"
                    class="inline-flex items-center gap-1.5 text-sm text-[#5C6478] hover:text-[#1F2533] mb-5 transition-colors">
                    <Icon name="ph:arrow-left" class="w-4 h-4" />
                    {{ $t('superadmin.companies.accounts.allCompanies') }}
                </NuxtLink>

                <!-- Sub-nav tabs -->
                <div class="flex items-center gap-1 mb-6 border-b border-[#EAECF0]">
                    <button v-for="tab in detailTabs" :key="tab.href"
                        class="px-4 py-2.5 text-[13px] font-medium transition-colors border-b-2 -mb-px" :class="$route.path === tab.href
                            ? 'border-[#42AED9] text-[#205E77]'
                            : 'border-transparent text-[#5C6478] hover:text-[#1F2533]'" @click="navigateTo(tab.href)">
                        <div class="flex items-center gap-1.5">
                            <Icon :name="tab.icon" class="w-4 h-4" />
                            {{ tab.label }}
                        </div>
                    </button>
                </div>

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
                                class="border-b border-[#F5F6F8] hover:bg-[#F9FAFB] transition-colors group">
                                <td class="co-td text-[13px] text-[#5C6478]">
                                    {{ formatDateTimeToReadable(invoice?.created_at) }}
                                </td>
                                <td class="co-td">
                                    <span v-if="invoice?.type === 'recurring'" class="co-badge co-badge-navy">
                                        {{ $t('recurring.recurring') }}
                                    </span>
                                    <span v-else class="co-badge co-badge-blue">
                                        {{ $t('superadmin.invoices.table.new') }}
                                    </span>
                                </td>
                                <td class="co-td">
                                    <span v-if="invoice?.is_paid" class="co-badge co-badge-green">
                                        <span class="w-1.5 h-1.5 rounded-full bg-[#2E9E33]"></span>
                                        {{ $t('superadmin.invoices.table.paid') }}
                                    </span>
                                    <span v-else class="co-badge co-badge-red">
                                        <span class="w-1.5 h-1.5 rounded-full bg-[#CC3B2D]"></span>
                                        {{ $t('superadmin.invoices.table.unpaid') }}
                                    </span>
                                </td>
                                <td class="co-td text-[13px] text-[#5C6478] font-mono">
                                    {{ invoice?.invoice_number }}
                                </td>
                                <td class="co-td text-[13px] text-[#1F2533] font-medium">
                                    {{ formatAmount(invoice?.total_amount) }}
                                </td>
                                <td class="co-td" @click.stop>
                                    <div
                                        class="flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                        <SuperadminTableButton
                                            @click="navigateTo(`/superadmin/companies/${companyUuid}/invoices/${invoice.uuid}/invoice-details`)">
                                            <Icon name="ph:eye" class="w-3.5 h-3.5" />
                                            {{ $t('superadmin.invoices.table.actions.view') }}
                                        </SuperadminTableButton>
                                        <SuperadminTableButton v-if="!invoice?.is_paid && !invoice?.invoice_type"
                                            buttonStyle="success" @click="confirmMarkInvoiceAsPaid(invoice)">
                                            <Icon name="ph:check" class="w-3.5 h-3.5" />
                                            {{ $t('superadmin.invoices.table.actions.markAsPaid') }}
                                        </SuperadminTableButton>
                                    </div>
                                </td>
                            </tr>
                        </template>
                    </SuperadminTable>
                    <Pagination :data="state.invoices" @previous="previous" @next="next" />
                </div>
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

const detailTabs = computed(() => [
    { label: t('superadmin.companies.accounts.tabs.overview'), href: `/superadmin/companies/${companyUuid}/accounts`, icon: 'ph:house' },
    { label: t('superadmin.sidebar.licenses'), href: `/superadmin/companies/${companyUuid}/license-overview`, icon: 'ph:key' },
    { label: t('superadmin.sidebar.apps'), href: `/superadmin/companies/${companyUuid}/apps`, icon: 'ph:squares-four' },
    { label: t('superadmin.sidebar.invoices'), href: `/superadmin/companies/${companyUuid}/invoices`, icon: 'ph:invoice' },
    { label: t('superadmin.companies.table.actions.edit'), href: `/superadmin/companies/${companyUuid}/edit`, icon: 'ph:pencil-simple' },
])

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