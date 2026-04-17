<template>
    <div>
        <NuxtLayout name="superadmin">
            <Head>
                <Title>{{ $t('superadmin.invoices.invoices') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #header>{{ $t('superadmin.invoices.invoices') }}</template>

            <div class="p-1">
                <!-- Header row -->
                <div class="flex items-center justify-between mb-5">
                    <div>
                        <h1 class="text-[22px] font-semibold text-[#1F2533]">Fakturaer</h1>
                        <p class="text-sm text-[#5C6478] mt-0.5">{{ state.invoices?.total ?? 0 }} fakturaer i alt</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <!-- Alert badges (Obiyen style) -->
                        <button 
                            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 transition-colors"
                            @click="setTabFilter('pending')">
                            <span class="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                            {{ state.pendingCount }} afventer
                        </button>
                        <button 
                            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
                            @click="setTabFilter('failed')">
                            <span class="w-2 h-2 rounded-full bg-red-500"></span>
                            {{ state.failedCount }} afvist
                        </button>
                        <FormButton buttonStyle="action" @click="state.modal.isDownloadOpen = true">
                            <Icon name="ph:download-simple" class="h-4 w-4" />
                            Download
                        </FormButton>
                    </div>
                </div>

                <!-- Tab filters (Alle / Betalt / Afventer / Afvist) + search -->
                <div class="flex flex-wrap items-center gap-3 mb-4">
                    <!-- Pill tabs -->
                    <div class="flex items-center bg-white border border-[#EAECF0] rounded-lg p-0.5">
                        <button v-for="tab in tabs" :key="tab.key"
                            class="px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors flex items-center gap-1.5"
                            :style="state.activeTab === tab.key ? 'background:#205E77;color:#fff' : 'color:#5C6478'"
                            @click="setTabFilter(tab.key)">
                            {{ tab.label }}
                            <span class="text-[11px] font-normal opacity-70">({{ tab.count }})</span>
                        </button>
                    </div>

                    <!-- Sort -->
                    <select v-model="state.sortData.sortField"
                        class="text-sm border border-[#EAECF0] rounded-lg px-3 py-2 bg-white text-[#5C6478] outline-none focus:border-[#42AED9] transition-colors"
                        @change="() => { state.sortData.sortOrder = 'descend'; currentTablePage = 1; fetchInvoices() }">
                        <option value="id">Nyeste først</option>
                        <option value="total_amount">Højeste beløb</option>
                        <option value="invoice_number">Fakturanr.</option>
                    </select>
                </div>

                <!-- Search + date filters -->
                <div class="bg-white border border-[#EAECF0] rounded-xl p-4 mb-5 flex flex-wrap items-center gap-3">
                    <!-- Search -->
                    <div class="relative flex-1 min-w-[200px]">
                        <Icon name="ph:magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8891A4]" />
                        <input
                            v-model="searchQuery"
                            type="text"
                            placeholder="Søg på fakturanummer, virksomhed..."
                            class="w-full pl-9 pr-3 py-2 text-sm border border-[#EAECF0] rounded-lg bg-[#F5F6F8] text-[#1F2533] placeholder-[#8891A4] outline-none focus:border-[#42AED9] focus:ring-2 focus:ring-[#42AED9]/10 transition-colors"
                            @input="debouncedSearch"
                        />
                    </div>

                    <!-- Date from -->
                    <div class="flex items-center gap-1.5">
                        <label class="text-xs text-[#5C6478] whitespace-nowrap">Fra</label>
                        <input type="date" v-model="state.dataFilter.date_from"
                            class="text-sm border border-[#EAECF0] rounded-lg px-3 py-2 bg-white text-[#1F2533] outline-none focus:border-[#42AED9] transition-colors"
                            @change="handleFilterChange" />
                    </div>

                    <!-- Date to -->
                    <div class="flex items-center gap-1.5">
                        <label class="text-xs text-[#5C6478] whitespace-nowrap">Til</label>
                        <input type="date" v-model="state.dataFilter.date_to"
                            class="text-sm border border-[#EAECF0] rounded-lg px-3 py-2 bg-white text-[#1F2533] outline-none focus:border-[#42AED9] transition-colors"
                            @change="handleFilterChange" />
                    </div>

                    <!-- Paid status -->
                    <select v-model="state.dataFilter.is_paid"
                        class="text-sm border border-[#EAECF0] rounded-lg px-3 py-2 bg-white text-[#5C6478] outline-none focus:border-[#42AED9] transition-colors"
                        @change="handleFilterChange">
                        <option value="">Alle betalinger</option>
                        <option value="true">Betalt</option>
                        <option value="false">Ubetalt</option>
                    </select>

                    <!-- Clear -->
                    <button v-if="hasActiveFilters"
                        class="text-xs text-[#5C6478] hover:text-[#CC3B2D] flex items-center gap-1 transition-colors"
                        @click="clearFilters">
                        <Icon name="ph:x-circle" class="w-3.5 h-3.5" />
                        Ryd filtre
                    </button>
                </div>

                <Alert type="danger" :text="state?.error?.message" v-if="state.error?.message?.length > 0" />

                <!-- Table -->
                <div class="bg-white border border-[#EAECF0] rounded-xl overflow-hidden shadow-sm">
                    <!-- Loading -->
                    <div v-if="state.isTableLoading" class="flex items-center justify-center py-16">
                        <Icon name="ph:spinner" class="w-7 h-7 text-[#42AED9] animate-spin" />
                    </div>

                    <!-- Empty -->
                    <div v-else-if="!state.invoices?.data?.length" class="flex flex-col items-center gap-3 py-16 text-[#8891A4]">
                        <Icon name="ph:receipt" class="w-12 h-12 opacity-30" />
                        <p class="text-sm font-medium">Ingen fakturaer fundet</p>
                        <p class="text-xs" v-if="hasActiveFilters">Prøv at ryde dine filtre</p>
                    </div>

                    <!-- Table -->
                    <table v-else class="w-full">
                        <thead>
                            <tr class="border-b border-[#EAECF0] bg-[#F9FAFB]">
                                <th class="co-th cursor-pointer hover:text-[#1F2533]" @click="sortBy('created_at')">
                                    <div class="flex items-center gap-1">
                                        Dato
                                        <Icon name="ph:arrows-down-up" class="w-3 h-3 opacity-50" />
                                    </div>
                                </th>
                                <th class="co-th">Type</th>
                                <th class="co-th">Status</th>
                                <th class="co-th cursor-pointer hover:text-[#1F2533]" @click="sortBy('invoice_number')">
                                    <div class="flex items-center gap-1">
                                        Fakturanr.
                                        <Icon name="ph:arrows-down-up" class="w-3 h-3 opacity-50" />
                                    </div>
                                </th>
                                <th class="co-th cursor-pointer hover:text-[#1F2533]" @click="sortBy('total_amount')">
                                    <div class="flex items-center gap-1">
                                        Beløb
                                        <Icon name="ph:arrows-down-up" class="w-3 h-3 opacity-50" />
                                    </div>
                                </th>
                                <th class="co-th">Virksomhed</th>
                                <th class="co-th"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(invoice, index) in state.invoices?.data" :key="index"
                                class="border-b border-[#F5F6F8] hover:bg-[#F9FAFB] transition-colors group">

                                <!-- Date -->
                                <td class="co-td text-[#5C6478] text-[13px]">
                                    {{ formatDateTimeToReadable(invoice?.created_at) }}
                                </td>

                                <!-- Type badge -->
                                <td class="co-td">
                                    <span v-if="invoice?.type === 'recurring'"
                                        class="co-badge co-badge-blue">
                                        <Icon name="ph:arrows-clockwise" class="w-3 h-3" />
                                        {{ $t('recurring.recurring') }}
                                    </span>
                                    <span v-else
                                        class="co-badge co-badge-gray">
                                        {{ $t('superadmin.invoices.table.new') }}
                                    </span>
                                </td>

                                <!-- Paid badge -->
                                <td class="co-td">
                                    <span v-if="invoice?.is_paid"
                                        class="co-badge co-badge-green">
                                        <Icon name="ph:check" class="w-3 h-3" />
                                        {{ $t('superadmin.invoices.table.paid') }}
                                    </span>
                                    <span v-else
                                        class="co-badge co-badge-red">
                                        <Icon name="ph:x" class="w-3 h-3" />
                                        {{ $t('superadmin.invoices.table.unpaid') }}
                                    </span>
                                </td>

                                <!-- Invoice number -->
                                <td class="co-td font-mono text-[13px] text-[#1F2533] font-medium">
                                    #{{ invoice?.invoice_number }}
                                </td>

                                <!-- Amount -->
                                <td class="co-td">
                                    <span class="text-[14px] font-semibold text-[#1F2533]">
                                        {{ formatAmount(invoice?.total_amount) }}
                                    </span>
                                </td>

                                <!-- Company -->
                                <td class="co-td">
                                    <div class="flex items-center gap-2">
                                        <div class="w-6 h-6 rounded-full bg-[#42AED9]/10 flex items-center justify-center flex-shrink-0">
                                            <span class="text-[10px] font-bold text-[#42AED9]">
                                                {{ (invoice?.user?.company?.name || '?').charAt(0).toUpperCase() }}
                                            </span>
                                        </div>
                                        <span class="text-[13px] text-[#1F2533] truncate max-w-[160px]">
                                            {{ invoice?.user?.company?.name || '—' }}
                                        </span>
                                    </div>
                                </td>

                                <!-- Actions -->
                                <td class="co-td">
                                    <div class="flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-medium bg-[#F5F6F8] text-[#5C6478] hover:bg-[#42AED9]/10 hover:text-[#42AED9] border border-[#EAECF0] transition-colors"
                                            @click="navigateTo(`/superadmin/invoices/${invoice.uuid}/invoice-details`)">
                                            <Icon name="ph:eye" class="w-3.5 h-3.5" />
                                            Se
                                        </button>
                                        <button v-if="!invoice?.is_paid && !invoice?.invoice_type"
                                            class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-medium bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-colors"
                                            @click="confirmMarkInvoiceAsPaid(invoice)">
                                            <Icon name="ph:check" class="w-3.5 h-3.5" />
                                            Marker betalt
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div class="mt-4 flex items-center justify-between">
                    <p class="text-sm text-[#8891A4]">
                        Viser {{ state.invoices?.from ?? 0 }}–{{ state.invoices?.to ?? 0 }} af {{ state.invoices?.total ?? 0 }}
                    </p>
                    <Pagination :data="state.invoices" @previous="previous" @next="next" />
                </div>
            </div>

            <!-- Modals -->
            <ModulesSuperadminInvoiceModalDownload :isModalOpen="state.modal.isDownloadOpen"
                @close="state.modal.isDownloadOpen = false" />
            <DialogConfirmation :isModalOpen="state.modal.isMarkAsPaidConfirmationOpen"
                :message="$t('superadmin.invoices.table.confirmation.markAsPaidConfirmation') + '?'"
                @close="state.modal.isMarkAsPaidConfirmationOpen = false"
                @confirm="markInvoiceAsPaid" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { invoiceService } from '@/components/api/superadmin/InvoiceService'
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
    dataFilter: { search: '', date_from: '', date_to: '', is_paid: '' },
    activeTab: 'all',
    paidCount: 0,
    pendingCount: 0,
    failedCount: 0,
    error: {} as Error,
    invoices: [] as any,
    isTableLoading: false,
    modal: { isDownloadOpen: false, isMarkAsPaidConfirmationOpen: false },
    selectedInvoice: {} as any,
    sortData: { sortField: 'id', sortOrder: 'descend' },
})

const hasActiveFilters = computed(() =>
    state.dataFilter.date_from || state.dataFilter.date_to || state.dataFilter.is_paid || state.dataFilter.search
)

const tabs = computed(() => [
    { key: 'all',     label: 'Alle',    count: state.invoices?.total ?? 0 },
    { key: 'paid',    label: 'Betalt',  count: state.paidCount },
    { key: 'pending', label: 'Afventer',count: state.pendingCount },
    { key: 'failed',  label: 'Afvist',  count: state.failedCount },
])

onMounted(() => { fetchInvoices() })

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
        const response = await invoiceService.getInvoices(params)
        if (response) {
            state.invoices = response
            // Compute tab counts from data
            const items = response?.data ?? []
            state.paidCount = items.filter((i: any) => i.is_paid === true).length
            state.pendingCount = items.filter((i: any) => i.is_paid === false).length
            state.failedCount = items.filter((i: any) => i.status === 'failed' || i.status === 'overdue').length
        }
    } catch (error: any) { state.error = error }
    state.isTableLoading = false
}

function debouncedSearch() {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        state.dataFilter.search = searchQuery.value
        currentTablePage = 1
        fetchInvoices()
    }, 350)
}

function handleFilterChange() { currentTablePage = 1; fetchInvoices() }
function previous() { currentTablePage--; fetchInvoices() }
function next() { currentTablePage++; fetchInvoices() }

function sortBy(field: string) {
    state.sortData.sortOrder = state.sortData.sortField === field && state.sortData.sortOrder === 'ascend' ? 'descend' : 'ascend'
    state.sortData.sortField = field
    currentTablePage = 1
    fetchInvoices()
}

function setTabFilter(tab: string) {
    state.activeTab = tab
    if (tab === 'all')     state.dataFilter.is_paid = ''
    if (tab === 'paid')    state.dataFilter.is_paid = 'true'
    if (tab === 'pending') state.dataFilter.is_paid = 'false'
    if (tab === 'failed')  state.dataFilter.is_paid = 'false'
    currentTablePage = 1
    fetchInvoices()
}

function clearFilters() {
    searchQuery.value = ''
    state.dataFilter = { search: '', date_from: '', date_to: '', is_paid: '' }
    currentTablePage = 1
    fetchInvoices()
}

function confirmMarkInvoiceAsPaid(invoice: any) {
    state.selectedInvoice = invoice
    state.modal.isMarkAsPaidConfirmationOpen = true
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

<style scoped>
.co-th {
    text-align: left;
    padding: 10px 16px;
    font-size: 11px;
    font-weight: 600;
    color: #8891A4;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    white-space: nowrap;
}
.co-td {
    padding: 12px 16px;
    font-size: 13px;
    color: #5C6478;
    vertical-align: middle;
}
.co-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
}
.co-badge-blue  { background:#EEF4FB; color:#1A4D99 }
.co-badge-gray  { background:#F5F6F8; color:#5C6478 }
.co-badge-green { background:#EDF7EE; color:#2E9E33 }
.co-badge-red   { background:#FFF0F0; color:#CC3B2D }
</style>
