<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('clientInvoices.clientInvoices') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('clientInvoices.clientInvoices') }}</template>

            <div class="mt-10">
                <div class="flex justify-end items-center mb-5 gap-3">
                    <FormButton buttonStyle="secondary" class="rounded-lg" @click="fetchInvoices">
                        <Icon name="ph:arrow-clockwise" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('refresh') || 'Refresh' }}
                    </FormButton>
                    <FormButton buttonStyle="action" class="rounded-lg" @click="navigateTo('/invoices/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('clientInvoices.newInvoice') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.invoices"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.invoices?.data?.length === 0))">
                                <tr v-for="(invoice, index) in state.invoices?.data" :key="index">
                                    <td width="20%">
                                        <div>
                                            {{ formatDateTimeToReadable(invoice?.created_at) }}
                                        </div>
                                    </td>
                                    <td width="20%">
                                        <div>
                                            {{ invoice?.invoice_number }}
                                        </div>
                                    </td>
                                    <td width="15%">
                                        <p class="capitalize">
                                            {{ formatAmount(invoice?.total_amount) }}
                                        </p>
                                    </td>
                                    <td width="20%">
                                        <div>
                                            <p>
                                                {{ invoice?.bill_to_name }}
                                            </p>
                                            <p class="text-xs">
                                                {{ invoice?.bill_to_number }}
                                            </p>
                                            <p class="text-xs">
                                                {{ invoice?.bill_to_address }}
                                            </p>
                                        </div>
                                    </td>
                                    <td width="15%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="openInvoiceDetails(invoice)">
                                                <Icon name="ph:eye" class="size-4" />
                                                {{ $t('clientInvoices.table.actions.view') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="openInvoiceEdit(invoice)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('clientInvoices.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="downloadInvoiceDetails(invoice)">
                                                <Icon name="ph:download" class="size-4" />
                                                {{ $t('clientInvoices.table.actions.download') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="openSendInvoiceModal(invoice)">
                                                <Icon name="ph:envelope" class="size-4" />
                                                {{ $t('clientInvoices.table.actions.sendInvoice') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <div class="mt-8 grid grid-cols-1 md:grid-cols-3 items-center gap-y-3"
                        v-if="state.invoices && state.invoices.meta">
                        <div class="flex justify-start">
                            <button class="w-28 bg-tertiary text-white rounded-sm text-sm px-4 py-3 hover:bg-tertiary/90"
                                v-if="state.invoices?.links && state.invoices?.links?.prev !== null" @click="previous">
                                {{ $t('pagination.previous') }}
                            </button>
                        </div>

                        <div class="text-sm flex flex-col items-center justify-center text-center">
                            <p v-if="state.invoices?.meta?.total > 0">
                                {{ $t('pagination.showingFrom') }}
                                {{ state.invoices?.meta?.from ?? 0 }}
                                {{ $t('pagination.to') }}
                                {{ state.invoices?.meta?.to ?? 0 }}
                                {{ $t('pagination.of') }}
                                {{ state.invoices?.meta?.total ?? 0 }}
                            </p>
                        </div>

                        <div class="flex justify-start md:justify-end">
                            <button class="w-28 bg-tertiary text-white rounded-sm text-sm px-4 py-3 hover:bg-tertiary/90"
                                v-if="state.invoices?.links && state.invoices?.links?.next !== null" @click="next">
                                {{ $t('pagination.next') }}
                            </button>
                        </div>
                    </div>
                </div>
                <ModulesUserClientInvoiceModalSendInvoice :isModalOpen="state.modal.isSendInvoiceOpen"
                    :selectedClientInvoice="state.selectedClientInvoice"
                    @close="state.modal.isSendInvoiceOpen = false" />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { clientInvoiceService } from '@/components/api/user/ClientInvoiceService'
import stripeApi from '@/components/api/stripeApi'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'
import { saveAs } from 'file-saver'

const runtimeConfig = useRuntimeConfig()
const { formatAmount } = useAmountFormatter()
const { formatDateTimeToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1
const INVOICES_PER_PAGE = 15
const breadcrumbLinks = [
    {
        name: 'clientInvoices.clientInvoices',
        translate: true,
        href: '/invoices',
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'clientInvoices.table.date', isTranslateName: true, sorter: true, key: 'created_at' },
        { name: 'clientInvoices.table.invoiceNumber', isTranslateName: true, sorter: true, key: 'invoice_number' },
        { name: 'clientInvoices.table.amount', isTranslateName: true, sorter: true, key: 'total_amount' },
        { name: 'clientInvoices.table.billedTo', isTranslateName: true, },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    invoices: [] as any,
    allInvoices: [] as any[],
    isTableLoading: false,
    modal: {
        isSendInvoiceOpen: false
    },
    selectedClientInvoice: {} as any,
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
        // Fetch both regular and Stripe invoices
        const [regularResponse, stripeResponse] = await Promise.all([
            fetchClientInvoices(),
            fetchStripeInvoices()
        ])
    
        // Combine both types of invoices
        let allInvoices = [...regularResponse]
        
        // Add Stripe invoices to the list, formatted to match the regular invoice structure
        const stripeInvoices = extractInvoices(stripeResponse)
        let formattedStripeInvoices: any[] = []
        if (stripeInvoices.length > 0) {
            const enrichedStripeInvoices = await enrichStripeInvoicesWithDetails(stripeInvoices)
            formattedStripeInvoices = enrichedStripeInvoices.map((si: any) => {
                // Resolve the correct total amount in major unit (DKK)
                // Prefer total_minor if available, otherwise use total/amount_due
                const rawTotal = si.total || si.amount_due || si.amount || 0
                const totalInMajor = si.total_minor 
                  ? si.total_minor / 100 
                  : (rawTotal >= 10000 ? rawTotal / 100 : rawTotal)

                return {
                    uuid: resolveStripeIdentifier(si),
                    invoice_number: si.number || resolveStripeIdentifier(si),
                    created_at: si.created_at || (si.created ? new Date(si.created * 1000).toISOString() : new Date().toISOString()),
                    total_amount: totalInMajor,
                    bill_to_name: resolveStripeCustomerName(si, si.customer_email || si.customer?.email || ''),
                    bill_to_number: si.customer?.phone || si.customer_details?.phone || '',
                    bill_to_address: si.customer?.address?.line1 || si.customer_details?.address?.line1 || '',
                    bill_to_email: si.customer_email || si.customer?.email || si.customer_details?.email || '',
                    is_stripe_invoice: true,
                    status: si.status,
                    stripe_id: resolveStripeIdentifier(si)
                }
            })

            // Match Stripe invoices with regular invoices by amount and date, and fill in missing customer info
            formattedStripeInvoices = formattedStripeInvoices.map((stripeInv: any) => {
                const matchingRegular = findMatchingRegularInvoice(stripeInv, allInvoices)
                
                // If we have a match, use its customer details as fallback for missing Stripe data
                if (matchingRegular) {
                    return {
                        ...stripeInv,
                        bill_to_name: stripeInv.bill_to_name || matchingRegular.bill_to_name || '',
                        bill_to_email: stripeInv.bill_to_email || matchingRegular.bill_to_email || '',
                        bill_to_number: stripeInv.bill_to_number || matchingRegular.bill_to_number || '',
                        bill_to_address: stripeInv.bill_to_address || matchingRegular.bill_to_address || '',
                    }
                }

                return stripeInv
            })
        }

        // Deduplicate: remove Stripe invoices if a regular invoice matches by amount, date, and customer info
        const dedupedStripeInvoices = formattedStripeInvoices.filter(stripeInv => {
            return !allInvoices.some(regInv => {
                const sameAmount = isEquivalentAmount(regInv.total_amount, stripeInv.total_amount)
                const sameDate = isSameDay(regInv.created_at, stripeInv.created_at)
                const nearInTime = isNearInTime(regInv.created_at, stripeInv.created_at, 10)
                const sameName = regInv.bill_to_name && stripeInv.bill_to_name && regInv.bill_to_name.trim().toLowerCase() === stripeInv.bill_to_name.trim().toLowerCase()
                const sameEmail = regInv.bill_to_email && stripeInv.bill_to_email && regInv.bill_to_email.trim().toLowerCase() === stripeInv.bill_to_email.trim().toLowerCase()
                
                // Only deduplicate if we have matching identifiers (name or email)
                // and matching amount and date
                const hasMatchingIdentifier = sameName || sameEmail
                const hasTimingMatch = nearInTime || sameDate
                
                return sameAmount && hasTimingMatch && hasMatchingIdentifier
            })
        })

        allInvoices = [...allInvoices, ...dedupedStripeInvoices]
        
        // Sort by created_at descending
        allInvoices.sort((a: any, b: any) => {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })

        state.allInvoices = allInvoices
        setPaginatedInvoices()
    } catch (error: any) {
        console.error('Error in fetchInvoices:', error)
        state.error = error
    }
    state.isTableLoading = false
}

function setPaginatedInvoices() {
    const total = state.allInvoices.length
    const lastPage = Math.max(1, Math.ceil(total / INVOICES_PER_PAGE))

    if (currentTablePage > lastPage) {
        currentTablePage = lastPage
    }

    const startIndex = (currentTablePage - 1) * INVOICES_PER_PAGE
    const pageData = state.allInvoices.slice(startIndex, startIndex + INVOICES_PER_PAGE)

    state.invoices = {
        data: pageData,
        links: {
            prev: currentTablePage > 1 ? `?page=${currentTablePage - 1}` : null,
            next: currentTablePage < lastPage ? `?page=${currentTablePage + 1}` : null,
        },
        meta: {
            from: total === 0 ? 0 : startIndex + 1,
            to: Math.min(startIndex + INVOICES_PER_PAGE, total),
            total,
            current_page: currentTablePage,
            last_page: lastPage,
            per_page: INVOICES_PER_PAGE,
        },
    }
}

function extractInvoices(response: any): any[] {
    if (Array.isArray(response?.data)) {
        return response.data
    }

    if (Array.isArray(response?.data?.data)) {
        return response.data.data
    }

    if (Array.isArray(response?.invoices)) {
        return response.invoices
    }

    if (Array.isArray(response?.data?.invoices)) {
        return response.data.invoices
    }

    return []
}

function resolveStripeIdentifier(invoice: any): string {
    return invoice?.stripe_id || invoice?.invoice_id || invoice?.id || invoice?.payment_intent || invoice?.payment_intent_id || invoice?.checkout_session_id || ''
}

function resolveStripeCustomerName(invoice: any, fallback: string = ''): string {
    return invoice?.customer_name
        || invoice?.customer?.name
        || invoice?.customer_details?.name
        || invoice?.customer?.data?.name
        || invoice?.metadata?.customer_name
        || invoice?.metadata?.customerName
        || invoice?.billing_details?.name
        || invoice?.customer_email
        || invoice?.customer?.email
        || invoice?.account_name
        || invoice?.recipient_name
        || fallback
}

function isEquivalentAmount(amountA: any, amountB: any): boolean {
    const a = parseAmountValue(amountA)
    const b = parseAmountValue(amountB)

    if (!Number.isFinite(a) || !Number.isFinite(b)) {
        return false
    }

    const diff = Math.abs(a - b)
    if (diff < 1) {
        return true
    }

    const diffMinorToMajor = Math.abs((a / 100) - b)
    const diffMajorToMinor = Math.abs(a - (b / 100))

    return diffMinorToMajor < 1 || diffMajorToMinor < 1
}

function parseAmountValue(value: any): number {
    if (typeof value === 'number') {
        return value
    }

    if (typeof value === 'string') {
        const trimmed = value.trim()
        if (!trimmed) {
            return 0
        }

        const normalized = trimmed
            .replace(/\./g, '')
            .replace(',', '.')
            .replace(/[^0-9.-]/g, '')

        const parsed = Number(normalized)
        return Number.isFinite(parsed) ? parsed : 0
    }

    const parsed = Number(value || 0)
    return Number.isFinite(parsed) ? parsed : 0
}

function isSameDay(dateA: any, dateB: any): boolean {
    if (!dateA || !dateB) {
        return false
    }

    const a = new Date(dateA)
    const b = new Date(dateB)

    if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) {
        return false
    }

    return a.toDateString() === b.toDateString()
}

function isNearInTime(dateA: any, dateB: any, minutes: number): boolean {
    if (!dateA || !dateB) {
        return false
    }

    const a = new Date(dateA)
    const b = new Date(dateB)

    if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) {
        return false
    }

    const threshold = minutes * 60 * 1000
    return Math.abs(a.getTime() - b.getTime()) <= threshold
}

function findMatchingRegularInvoice(stripeInvoice: any, regularInvoices: any[]): any {
    return regularInvoices.find((regularInvoice: any) => {
        const sameAmount = isEquivalentAmount(regularInvoice.total_amount, stripeInvoice.total_amount)
        const sameDate = isSameDay(regularInvoice.created_at, stripeInvoice.created_at)
        const nearInTime = isNearInTime(regularInvoice.created_at, stripeInvoice.created_at, 10)

        return sameAmount && (nearInTime || sameDate)
    })
}

async function enrichStripeInvoicesWithDetails(stripeInvoices: any[]): Promise<any[]> {
    const detailCache = new Map<string, any>()

    return await Promise.all(stripeInvoices.map(async (invoice: any) => {
        const stripeInvoiceId = resolveStripeIdentifier(invoice)
        if (!stripeInvoiceId) {
            return invoice
        }

        let enrichedInvoice = invoice

        // Try to fetch full details from API if we don't have a customer name
        if (!invoice?.customer_name && !invoice?.customer?.name) {
            if (detailCache.has(stripeInvoiceId)) {
                enrichedInvoice = {
                    ...invoice,
                    ...detailCache.get(stripeInvoiceId),
                }
            } else {
                try {
                    const details = await stripeApi.getStripeInvoice(stripeInvoiceId)
                    detailCache.set(stripeInvoiceId, details)
                    enrichedInvoice = {
                        ...invoice,
                        ...details,
                    }
                } catch (error) {
                    // Continue without enrichment if API call fails
                }
            }
        }

        return enrichedInvoice
    }))
}

function isStripeInvoice(invoice: any): boolean {
    if (invoice?.is_stripe_invoice) {
        return true
    }

    const possibleId = invoice?.stripe_id || invoice?.uuid || invoice?.invoice_number || ''
    return typeof possibleId === 'string' && /^(in_|pi_|cs_)/.test(possibleId)
}

function resolveInvoiceIdentifier(invoice: any): string {
    return invoice?.uuid || invoice?.stripe_id || invoice?.invoice_number || ''
}

async function fetchClientInvoices() {
    try {
        let page = 1
        let hasNextPage = true
        const allInvoices = [] as any[]

        while (hasNextPage) {
            const params = {
                page,
                sortField: state.sortData.sortField,
                sortOrder: state.sortData.sortOrder,
                ...state.dataFilter
            }

            const response = await clientInvoiceService.getClientInvoices(params)
            const pageInvoices = extractInvoices(response)

            if (pageInvoices.length > 0) {
                allInvoices.push(...pageInvoices)
            }

            hasNextPage = hasNextPagination(response)
            page++

            if (page > 100) {
                hasNextPage = false
            }
        }

        return allInvoices
    } catch (error: any) {
        console.error('Error fetching client invoices:', error)
        return []
    }
}

function hasNextPagination(response: any): boolean {
    if (response?.links && response.links.next !== null && response.links.next !== undefined) {
        return true
    }

    if (response?.data?.links && response.data.links.next !== null && response.data.links.next !== undefined) {
        return true
    }

    const currentPage = response?.meta?.current_page ?? response?.data?.meta?.current_page
    const lastPage = response?.meta?.last_page ?? response?.data?.meta?.last_page

    if (currentPage && lastPage) {
        return currentPage < lastPage
    }

    return false
}

async function fetchStripeInvoices() {
    try {
        const result = await stripeApi.getStripeInvoices()
        console.log('fetchStripeInvoices result:', result)
        return result || { data: [] }
    } catch (error: any) {
        console.error('Error fetching Stripe invoices:', error)
        console.error('Error details:', {
            message: error?.message,
            status: error?.status,
            data: error?.data
        })
        return { data: [] }
    }
}

function previous() {
    if (currentTablePage <= 1) {
        return
    }

    currentTablePage--
    setPaginatedInvoices()
}

function next() {
    const lastPage = Math.max(1, Math.ceil(state.allInvoices.length / INVOICES_PER_PAGE))
    if (currentTablePage >= lastPage) {
        return
    }

    currentTablePage++
    setPaginatedInvoices()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchInvoices()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchInvoices()
}

function openInvoiceDetails(invoice: any) {
    const invoiceId = resolveInvoiceIdentifier(invoice)

    if (isStripeInvoice(invoice)) {
        navigateTo(`/invoices/${invoiceId}`)
        return
    }

    navigateTo(`/invoices/${invoiceId}/invoice-details`)
}

function openInvoiceEdit(invoice: any) {
    const invoiceId = resolveInvoiceIdentifier(invoice)

    if (isStripeInvoice(invoice)) {
        navigateTo(`/invoices/${invoiceId}`)
        return
    }

    navigateTo(`/invoices/${invoiceId}/edit`)
}

async function downloadInvoiceDetails(invoice: any) {
    state.error = {}
    state.isTableLoading = true
    try {
        const invoiceUuid = resolveInvoiceIdentifier(invoice)
        let response
        
        // Handle Stripe vs regular invoices differently
        if (isStripeInvoice(invoice)) {
            response = await stripeApi.downloadStripeInvoicePdf(invoice?.stripe_id || invoiceUuid)
        } else {
            response = await clientInvoiceService.downloadClientInvoiceDetails(invoiceUuid)
        }
        
        if (response) {
            saveAs(response, invoice?.invoice_number ?? invoiceUuid.toString())
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function openSendInvoiceModal(invoice: any) {
    state.selectedClientInvoice = {
        ...invoice,
        uuid: resolveInvoiceIdentifier(invoice),
        is_stripe_invoice: isStripeInvoice(invoice),
    }
    state.modal.isSendInvoiceOpen = true
}
</script>