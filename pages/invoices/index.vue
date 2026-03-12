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
                    <FormButton buttonStyle="action" class="rounded-lg"
                        @click="state.modal.isStripeInvoiceOpen = true">
                        <Icon name="ph:receipt" class="h-4 w-4" aria-hidden="true" />
                        Opret faktura
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <form class="flex" @submit.prevent="submitSearch">
                        <div class="grow relative">
                            <span class="flex items-center gap-x-1 text-gray-800 absolute left-3 top-3">
                                <Icon name="ic:search" class="text-primary w-6 h-6" />
                            </span>
                            <input
                                type="text"
                                name="stripe_invoice_search"
                                autocomplete="off"
                                list="stripe-invoice-suggestions"
                                class="appearance-none block w-full pl-10 h-12 border border-primary placeholder-gray-500 text-gray-900 rounded-tl-md rounded-bl-md focus:outline-none focus:ring-primary-700 focus:border-primary-700 focus:z-10 sm:text-sm"
                                :placeholder="$t('search')"
                                v-model="state.searchInput"
                            />
                            <datalist id="stripe-invoice-suggestions">
                                <option v-for="(suggestion, idx) in searchSuggestions" :key="idx" :value="suggestion" />
                            </datalist>
                        </div>
                        <button type="submit"
                            class="bg-primary px-6 py-1.5 border border-primary text-white hover:bg-primary-800 hover:border-primary-800 right-0.5 top-0.5 rounded-tr-md rounded-br-md text-xs">
                            {{ $t('search') }}
                        </button>
                    </form>
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
                                    <td width="10%">
                                        <span :class="{
                                            'px-2 py-1 rounded-full text-xs font-semibold': true,
                                            'bg-green-100 text-green-800': invoice?.status === 'paid',
                                            'bg-yellow-100 text-yellow-800': invoice?.status === 'open' || invoice?.status === 'draft',
                                            'bg-gray-100 text-gray-800': !invoice?.status || (invoice?.status !== 'paid' && invoice?.status !== 'open' && invoice?.status !== 'draft')
                                        }">
                                            {{ formatStatus(invoice?.status) }}
                                        </span>
                                    </td>
                                    <td width="15%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="openInvoiceDetails(invoice)">
                                                <Icon name="ph:eye" class="size-4" />
                                                {{ $t('clientInvoices.table.actions.view') }}
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
                <ModulesUserCitizenModalStripeInvoice :isModalOpen="state.modal.isStripeInvoiceOpen"
                    :citizens="state.citizens"
                    @close="state.modal.isStripeInvoiceOpen = false"
                    @success="fetchInvoices" />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { clientInvoiceService } from '@/components/api/user/ClientInvoiceService'
import { citizenService } from '@/components/api/user/CitizenService'
import stripeApi from '@/components/api/stripeApi'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'
import { saveAs } from 'file-saver'

const runtimeConfig = useRuntimeConfig()
const { formatAmount } = useAmountFormatter()
const { formatDateTimeToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
const userStore = useUserStore() as any
let currentTablePage = 1
let paginationToken = 0
const stripeDetailCache = new Map<string, any>()
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
        { name: 'clientInvoices.table.status', isTranslateName: true, },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    invoices: [] as any,
    allInvoices: [] as any[],
    citizens: [] as any[],
    isTableLoading: false,
    searchInput: '',
    activeSearchQuery: '',
    modal: {
        isSendInvoiceOpen: false,
        isStripeInvoiceOpen: false
    },
    selectedClientInvoice: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchInvoices()
    fetchCitizens()
})

async function fetchCitizens() {
    try {
        const response = await citizenService.getCitizens({ per_page: 1000 })
        if (response?.data?.data) {
            state.citizens = response.data.data
        }
    } catch (error) {
        console.error('Failed to fetch citizens:', error)
    }
}

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
        console.log('Extracted Stripe invoices count:', stripeInvoices?.length || 0)
        
        let formattedStripeInvoices: any[] = []
        if (stripeInvoices.length > 0) {
            formattedStripeInvoices = stripeInvoices.map((si: any) => {
                const fallbackName = `${userStore.getUser?.firstname || ''} ${userStore.getUser?.lastname || ''}`.trim()
                const fallbackEmail = userStore.getUser?.email || ''

                // Resolve the correct total amount in major unit (DKK)
                // Prefer total_minor if available, otherwise use total/amount_due
                const rawTotal = si.total || si.amount_due || si.amount || 0
                const totalInMajor = si.total_minor
                    ? si.total_minor / 100
                    : (rawTotal >= 10000 ? rawTotal / 100 : rawTotal)

                return {
                    ...si,
                    uuid: resolveStripeIdentifier(si),
                    invoice_number: si.number || resolveStripeIdentifier(si),
                    created_at: si.created_at || (si.created ? new Date(si.created * 1000).toISOString() : new Date().toISOString()),
                    total_amount: totalInMajor,
                    bill_to_name: resolveStripeCustomerName(si, fallbackName || si.customer_email || si.customer?.email || ''),
                    bill_to_number: si.customer?.phone || si.customer_details?.phone || '',
                    bill_to_address: si.customer?.address?.line1 || si.customer_details?.address?.line1 || '',
                    bill_to_email: resolveStripeCustomerEmail(si, fallbackEmail),
                    is_stripe_invoice: true,
                    status: normalizeInvoiceStatus(si.status),
                    stripe_id: resolveStripeIdentifier(si),
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
                        matched_regular_invoice_uuid: matchingRegular.uuid || '',
                        matched_regular_invoice_number: matchingRegular.invoice_number || '',
                    }
                }

                return stripeInv
            })
        }

        // Deduplicate: keep Stripe invoices and hide matching regular invoices.
        // This avoids showing both e.g. "RPRQMMVS-0001" and "pi_..." for the same payment.
        const matchedRegularInvoiceUuids = new Set(
            formattedStripeInvoices
                .map((stripeInv: any) => stripeInv?.matched_regular_invoice_uuid)
                .filter((uuid: any) => !!uuid)
        )

        const filteredRegularInvoices = allInvoices.filter((regInv: any) => {
            if (!regInv?.uuid) {
                return true
            }

            return !matchedRegularInvoiceUuids.has(regInv.uuid)
        })

        allInvoices = [...filteredRegularInvoices, ...formattedStripeInvoices]
        allInvoices = dedupeEquivalentStripeRows(allInvoices)
        allInvoices = allInvoices.filter((invoice: any) => shouldDisplayInvoice(invoice))
        allInvoices = dedupeInvoices(allInvoices)
        
        // Sort by created_at descending
        allInvoices.sort((a: any, b: any) => {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })

        state.allInvoices = allInvoices
        await setPaginatedInvoices()
    } catch (error: any) {
        console.error('Error in fetchInvoices:', error)
        state.error = error
    } finally {
        state.isTableLoading = false
    }
}

async function setPaginatedInvoices() {
    const token = ++paginationToken
    const q = state.activeSearchQuery.trim().toLowerCase()
    const filtered = q
        ? state.allInvoices.filter((inv: any) =>
            !isStripeInvoice(inv) ||
            ((inv.bill_to_name && inv.bill_to_name.toLowerCase().includes(q)) ||
                (inv.invoice_number && String(inv.invoice_number).toLowerCase().includes(q)))
        )
        : state.allInvoices

    const total = filtered.length
    const lastPage = Math.max(1, Math.ceil(total / INVOICES_PER_PAGE))

    if (currentTablePage > lastPage) {
        currentTablePage = lastPage
    }

    const startIndex = (currentTablePage - 1) * INVOICES_PER_PAGE
    const pageData = filtered.slice(startIndex, startIndex + INVOICES_PER_PAGE)

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

    // Enrich only currently visible Stripe rows to avoid N+1 calls across all pages.
    const visibleStripeRows = pageData.filter((invoice: any) => isStripeInvoice(invoice))
    if (visibleStripeRows.length === 0) {
        return
    }

    const enrichedVisibleRows = await enrichStripeInvoicesWithDetails(visibleStripeRows)
    if (token !== paginationToken) {
        return
    }

    const enrichedById = new Map<string, any>()
    for (const row of enrichedVisibleRows) {
        const id = resolveStripeIdentifier(row)
        if (id) {
            enrichedById.set(id, row)
        }
    }

    state.invoices = {
        ...state.invoices,
        data: pageData.map((row: any) => {
            if (!isStripeInvoice(row)) {
                return row
            }

            const id = resolveStripeIdentifier(row)
            const enriched = id ? enrichedById.get(id) : null
            return enriched ? { ...row, ...enriched } : row
        }),
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
    const chargeBillingDetails = invoice?.charges?.data?.[0]?.billing_details || invoice?.latest_charge?.billing_details

    return invoice?.customer_name
        || invoice?.customer?.name
        || invoice?.customer_details?.name
        || invoice?.customer?.data?.name
        || invoice?.metadata?.customer_name
        || invoice?.metadata?.customerName
        || invoice?.billing_details?.name
        || chargeBillingDetails?.name
        || invoice?.customer_email
        || invoice?.customer?.email
        || invoice?.account_name
        || invoice?.recipient_name
        || fallback
}

function resolveStripeCustomerEmail(invoice: any, fallback: string = ''): string {
    const chargeBillingDetails = invoice?.charges?.data?.[0]?.billing_details || invoice?.latest_charge?.billing_details

    return invoice?.customer_email
        || invoice?.customer?.email
        || invoice?.customer_details?.email
        || invoice?.metadata?.customer_email
        || invoice?.metadata?.customerEmail
        || invoice?.billing_details?.email
        || chargeBillingDetails?.email
        || fallback
}

function normalizeInvoiceStatus(status: any): string {
    const normalized = (status || '').toString().trim().toLowerCase()

    if (!normalized) {
        return 'draft'
    }

    // Stripe payment intents can return succeeded/complete for already paid receipts.
    if (['paid', 'succeeded', 'complete', 'completed'].includes(normalized)) {
        return 'paid'
    }

    return normalized
}

function isPaidInvoice(status: any): boolean {
    return normalizeInvoiceStatus(status) === 'paid'
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

// Helper function to limit concurrent promises
function promiseConcurrencyLimiter(promises: (() => Promise<any>)[], concurrency: number = 5): Promise<any[]> {
    return new Promise((resolve, reject) => {
        let completed = 0
        let currentIndex = 0
        const results: any[] = new Array(promises.length)
        
        if (promises.length === 0) {
            resolve([])
            return
        }

        const executeNext = () => {
            if (currentIndex >= promises.length) {
                if (completed === promises.length) {
                    resolve(results)
                }
                return
            }

            const index = currentIndex
            currentIndex++

            promises[index]()
                .then(result => {
                    results[index] = result
                    completed++
                    executeNext()
                })
                .catch(error => {
                    results[index] = error
                    completed++
                    executeNext()
                })
        }

        // Start initial batch
        for (let i = 0; i < Math.min(concurrency, promises.length); i++) {
            executeNext()
        }
    })
}

async function enrichStripeInvoicesWithDetails(stripeInvoices: any[]): Promise<any[]> {
    // Separate invoices into those that need enrichment and those that don't
    const invoicesToEnrich: Array<{ index: number; invoice: any; id: string }> = []
    const results: any[] = new Array(stripeInvoices.length)

    // First pass: identify which invoices need enrichment
    for (let i = 0; i < stripeInvoices.length; i++) {
        const invoice = stripeInvoices[i]
        const stripeInvoiceId = resolveStripeIdentifier(invoice)
        
        if (!stripeInvoiceId) {
            results[i] = invoice
            continue
        }

        // Check if enrichment is needed
        const needsEnrichment = !invoice?.customer_name 
            && !invoice?.customer?.name 
            && !invoice?.customer_details?.name
            && !invoice?.customer_email
            && !invoice?.customer?.email

        if (!needsEnrichment) {
            results[i] = invoice
        } else {
            invoicesToEnrich.push({ index: i, invoice, id: stripeInvoiceId })
        }
    }

    // If no enrichment needed, return early
    if (invoicesToEnrich.length === 0) {
        return results
    }

    // Create a batch of API call promises with concurrency limit
    const enrichmentPromises = invoicesToEnrich.map(({ id, invoice }) => async () => {
        if (stripeDetailCache.has(id)) {
            return {
                invoice,
                details: stripeDetailCache.get(id)
            }
        }

        try {
            const details = await stripeApi.getStripeInvoice(id)
            stripeDetailCache.set(id, details)
            return { invoice, details }
        } catch (error) {
            console.warn(`Failed to enrich invoice ${id}:`, error)
            return { invoice, details: null }
        }
    })

    // Execute all enrichment calls with concurrency limit (5 at a time)
    const enrichmentResults = await promiseConcurrencyLimiter(enrichmentPromises, 5)

    // Merge enrichment results back into results array
    for (let i = 0; i < invoicesToEnrich.length; i++) {
        const { index } = invoicesToEnrich[i]
        const enrichmentResult = enrichmentResults[i]
        
        if (enrichmentResult?.details) {
            results[index] = {
                ...enrichmentResult.invoice,
                ...enrichmentResult.details,
            }
        } else {
            results[index] = enrichmentResult?.invoice
        }
    }

    return results
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

function shouldDisplayInvoice(invoice: any): boolean {
    const invoiceNumber = String(invoice?.invoice_number || '').trim()
    const fallbackIdentifier = String(resolveInvoiceIdentifier(invoice) || '').trim()
    const identifier = invoiceNumber || fallbackIdentifier

    return !!identifier
}

function dedupeInvoices(invoices: any[]): any[] {
    const seen = new Set<string>()
    const result: any[] = []

    for (const invoice of invoices) {
        const id = String(resolveInvoiceIdentifier(invoice) || '').trim()
        if (!id) {
            continue
        }

        if (seen.has(id)) {
            continue
        }

        seen.add(id)
        result.push(invoice)
    }

    return result
}

function isPaymentIntentLike(invoice: any): boolean {
    const id = String(resolveInvoiceIdentifier(invoice) || '').toLowerCase()
    const invoiceNumber = String(invoice?.invoice_number || '').toLowerCase()
    return id.startsWith('pi_') || invoiceNumber.startsWith('pi_')
}

function isSameCustomerStripePair(a: any, b: any): boolean {
    const emailA = String(a?.bill_to_email || '').trim().toLowerCase()
    const emailB = String(b?.bill_to_email || '').trim().toLowerCase()
    if (emailA && emailB) {
        return emailA === emailB
    }

    const nameA = String(a?.bill_to_name || '').trim().toLowerCase()
    const nameB = String(b?.bill_to_name || '').trim().toLowerCase()
    if (nameA && nameB) {
        return nameA === nameB
    }

    return false
}

function dedupeEquivalentStripeRows(invoices: any[]): any[] {
    const result: any[] = []

    for (const invoice of invoices) {
        if (!isStripeInvoice(invoice)) {
            result.push(invoice)
            continue
        }

        const existingIndex = result.findIndex((existing) => {
            if (!isStripeInvoice(existing)) {
                return false
            }

            const sameAmount = isEquivalentAmount(existing?.total_amount, invoice?.total_amount)
            const nearInTime = isNearInTime(existing?.created_at, invoice?.created_at, 2)
            const sameCustomer = isSameCustomerStripePair(existing, invoice)

            return sameAmount && nearInTime && sameCustomer
        })

        if (existingIndex === -1) {
            result.push(invoice)
            continue
        }

        const existing = result[existingIndex]
        const existingIsPi = isPaymentIntentLike(existing)
        const currentIsPi = isPaymentIntentLike(invoice)

        // Prefer invoice-number rows (e.g. RPRQMMVS-0010) over payment-intent ids (pi_...)
        if (existingIsPi && !currentIsPi) {
            result[existingIndex] = invoice
        }
    }

    return result
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
                // Ensure all invoices have a status field (default to 'paid' for regular invoices)
                const normalizedInvoices = pageInvoices.map((inv: any) => ({
                    ...inv,
                    status: inv.status || 'paid'
                }))
                allInvoices.push(...normalizedInvoices)
            }

            hasNextPage = hasNextPagination(response)
            page++

            if (page > 200) {
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

    // Check meta-based pagination
    let currentPage = response?.meta?.current_page ?? response?.data?.meta?.current_page
    let lastPage = response?.meta?.last_page ?? response?.data?.meta?.last_page

    if (currentPage && lastPage) {
        return currentPage < lastPage
    }

    // Check pagination object (Stripe API format)
    currentPage = response?.pagination?.current_page
    lastPage = response?.pagination?.last_page

    if (currentPage && lastPage) {
        return currentPage < lastPage
    }

    return false
}

async function fetchStripeInvoices() {
    try {
        // Request all invoices in one shot to avoid multiple round-trips to Stripe
        const result = await stripeApi.getStripeInvoices({ page: 1, per_page: 100, include_payment_intents: false })
        const pageInvoices = extractInvoices(result)
        return { data: pageInvoices }
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

function submitSearch() {
    currentTablePage = 1
    state.activeSearchQuery = String(state.searchInput || '').trim()
    setPaginatedInvoices()
}

function openInvoiceDetails(invoice: any) {
    if (isPaidInvoice(invoice?.status) && invoice?.matched_regular_invoice_uuid) {
        navigateTo(`/invoices/${invoice.matched_regular_invoice_uuid}/invoice-details`)
        return
    }

    if (isStripeInvoice(invoice)) {
        const stripeId = invoice.stripe_id || resolveInvoiceIdentifier(invoice)
        const displayId = invoice.invoice_number || stripeId
        navigateTo(`/invoices/${encodeURIComponent(displayId)}`)
        return
    }

    const invoiceId = resolveInvoiceIdentifier(invoice)

    navigateTo(`/invoices/${invoiceId}/invoice-details`)
}

async function downloadInvoiceDetails(invoice: any) {
    state.error = {}
    state.isTableLoading = true
    try {
        const invoiceUuid = resolveInvoiceIdentifier(invoice)
        const isPaid = isPaidInvoice(invoice?.status)
        const filePrefix = isPaid ? 'receipt' : 'invoice'
        const fileName = `${filePrefix}_${invoice?.invoice_number || invoiceUuid}.pdf`
        
        let response
        
        // Handle Stripe vs regular invoices differently
        // For Stripe invoices (paid or unpaid), always use Stripe download endpoint.
        if (isStripeInvoice(invoice)) {
            response = await stripeApi.downloadStripeInvoicePdf(invoice?.stripe_id || invoiceUuid)
        } else {
            response = await clientInvoiceService.downloadClientInvoiceDetails(invoiceUuid)
        }
        
        if (response) {
            if (
                isStripeInvoice(invoice)
                && typeof response === 'object'
                && !(response instanceof Blob)
                && response.is_stripe_receipt_url
            ) {
                const redirectUrl = response.redirect_url || response.receipt_url
                if (!redirectUrl) {
                    throw new Error('No redirect URL received from backend')
                }

                window.open(redirectUrl, '_blank')

                const title = isPaid ? t('stripeInvoices.downloadReceipt') : t('clientInvoices.table.actions.download')
                successAlert(title, 'Denne stykker åbnes i browser med mulighed for at gemme som PDF')
                return
            }

            saveAs(response, fileName)
            
            // Show success message
            const title = isPaid ? t('stripeInvoices.downloadReceipt') : t('clientInvoices.table.actions.download')
            const message = isPaid ? t('stripeInvoices.receiptDownloaded') : t('stripeInvoices.invoiceDownloaded')
            successAlert(title, message)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function formatStatus(status: string): string {
    if (!status) return 'N/A'
    
    // Common status values from Stripe and internal invoices
    const statusMap: Record<string, string> = {
        'paid': 'Paid',
        'open': 'Open',
        'draft': 'Draft',
        'void': 'Void',
        'uncollectible': 'Uncollectible'
    }
    
    return statusMap[status.toLowerCase()] || status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
}

const searchSuggestions = computed(() => {
    const items = new Set<string>()
    state.allInvoices
        .filter((inv: any) => isStripeInvoice(inv))
        .forEach((inv: any) => {
        if (inv.bill_to_name?.trim()) items.add(inv.bill_to_name.trim())
        if (inv.invoice_number) items.add(String(inv.invoice_number).trim())
    })
    return Array.from(items).filter(Boolean)
})

function openSendInvoiceModal(invoice: any) {
    state.selectedClientInvoice = {
        ...invoice,
        uuid: resolveInvoiceIdentifier(invoice),
        is_stripe_invoice: isStripeInvoice(invoice),
    }
    state.modal.isSendInvoiceOpen = true
}
</script>