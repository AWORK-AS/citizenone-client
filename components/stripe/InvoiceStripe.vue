<template>
  <div class="px-4 py-6">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Indlæser faktura...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-alert">
      <strong>Fejl:</strong> {{ error }}
      <button @click="retryLoadInvoice" class="retry-btn">Prøv igen</button>
    </div>

    <!-- Invoice Content -->
    <div v-if="!loading && !error && invoiceDetails">

      <!-- Back link -->
      <button @click="goBack" class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4">
        <Icon name="ph:arrow-left" class="h-4 w-4" />
        Tilbage til Kundefakturaer
      </button>

      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">
          {{ isReceipt(invoiceDetails.status) ? 'Kvittering' : 'Faktura' }} {{ invoiceDetails.invoiceNumber || invoiceDetails.id }}
        </h1>
        <p class="text-sm text-gray-500 mt-1" v-if="rawStripeInvoice?.created_at">
          {{ new Date(rawStripeInvoice.created_at).toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }}
        </p>
      </div>

      <!-- Two-column cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

        <!-- Kundeoplysninger -->
        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <h2 class="text-base font-semibold text-primary mb-4">Kundeoplysninger</h2>
          <div class="space-y-3">
            <div>
              <p class="text-xs text-gray-400 mb-0.5">Kunde</p>
              <p class="font-semibold text-gray-900">{{ invoiceDetails.customerName || '---' }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-400 mb-0.5">E-mail</p>
              <p class="text-gray-700">{{ invoiceDetails.customerEmail || '---' }}</p>
            </div>
            <div v-if="invoiceDetails.description">
              <p class="text-xs text-gray-400 mb-0.5">Beskrivelse</p>
              <p class="text-gray-700">{{ invoiceDetails.description }}</p>
            </div>
          </div>
        </div>

        <!-- Fakturadetaljer -->
        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <h2 class="text-base font-semibold text-primary mb-4">Fakturadetaljer</h2>
          <div class="space-y-3">
            <div>
              <p class="text-xs text-gray-400 mb-0.5">Fakturanummer</p>
              <p class="font-semibold text-gray-900">{{ invoiceDetails.invoiceNumber }}</p>
            </div>
            <div class="border-t border-gray-100 pt-3">
              <p class="text-xs text-gray-400 mb-1">Status</p>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="statusBadgeClass(invoiceDetails.status)">
                {{ formatStatus(invoiceDetails.status) }}
              </span>
            </div>
            <div class="border-t border-gray-100 pt-3">
              <p class="text-xs text-gray-400 mb-1">Total beløb inkl. moms</p>
              <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(invoiceTotalInclTax) }} {{ invoiceDetails.currency }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Fakturalinjer -->
      <div class="bg-white border border-gray-200 rounded-xl mb-6">
        <div class="px-6 py-4 border-b border-gray-100">
          <h2 class="text-base font-semibold text-primary">Fakturalinjer</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-tertiary text-white">
                <th class="px-6 py-3 text-left text-sm font-semibold">Beskrivelse</th>
                <th class="px-6 py-3 text-center text-sm font-semibold">Antal</th>
                <th class="px-6 py-3 text-right text-sm font-semibold">Enhedspris</th>
                <th class="px-6 py-3 text-right text-sm font-semibold">Beløb</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="item in invoiceDetails.items" :key="item.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 text-sm text-gray-900">{{ cleanInvoiceDescription(item.description) }}</td>
                <td class="px-6 py-4 text-sm text-gray-600 text-center">{{ item.quantity }}</td>
                <td class="px-6 py-4 text-sm text-gray-900 text-right">{{ formatCurrency(item.unitPrice / 100) }}</td>
                <td class="px-6 py-4 text-sm text-gray-900 text-right">{{ formatCurrency(item.amount / 100) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Totals summary -->
        <div class="px-6 py-4 border-t border-gray-100 space-y-2">
          <div class="flex justify-end gap-4">
            <span class="text-sm text-gray-500 w-36 text-right">Subtotal (ekskl. moms):</span>
            <span class="text-sm text-gray-900 w-32 text-right">{{ formatCurrency(itemsSubtotal) }} {{ invoiceDetails.currency }}</span>
          </div>
          <div class="flex justify-end gap-4">
            <span class="text-sm text-gray-500 w-36 text-right">Moms 25%:</span>
            <span class="text-sm text-gray-900 w-32 text-right">{{ formatCurrency(invoiceTax) }} {{ invoiceDetails.currency }}</span>
          </div>
          <div class="flex justify-end gap-4 border-t border-gray-200 pt-2">
            <span class="text-sm font-bold text-gray-900 w-36 text-right">Total inkl. moms:</span>
            <span class="text-sm font-bold text-gray-900 w-32 text-right">{{ formatCurrency(invoiceTotalInclTax) }} {{ invoiceDetails.currency }}</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-between items-center">
        <button @click="goBack"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
          Tilbage
        </button>
        <div class="flex gap-3">
        <button @click="sendInvoice"
          class="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-tertiary rounded-lg hover:bg-tertiary-800 disabled:opacity-60"
          :disabled="loadingSend">
          <Icon name="ph:envelope" class="h-4 w-4" />
          <span v-if="!loadingSend">Send faktura</span>
          <span v-else>Sender...</span>
        </button>
        <button @click="downloadPdf"
          class="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-tertiary rounded-lg hover:bg-tertiary-800 disabled:opacity-60"
          :disabled="loadingPdf">
          <Icon name="ph:download" class="h-4 w-4" />
          <span v-if="!loadingPdf">Download PDF</span>
          <span v-else>Downloader...</span>
        </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import stripeApi from '@/components/api/stripeApi';
import { clientInvoiceService } from '@/components/api/user/ClientInvoiceService'
import { appService } from '@/components/api/user/AppService'
import { useUserStore } from '@/store/user'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import { saveAs } from 'file-saver'

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface Invoice {
  id: string;
  invoiceNumber?: string;
  amount: number;
  currency: string;
  status: string;
  description?: string;
  customerName?: string;
  customerEmail?: string;
  items: InvoiceItem[];
  hostedInvoiceUrl?: string;
}

// Props
const props = defineProps({
  invoiceData: {
    type: Object,
    default: null,
  },
});

// State
const route = useRoute();
const userStore = useUserStore() as any
const { successAlert } = useAlert()
const { t } = useI18n()
const invoiceId = computed(() => route.params.id as string);
const routeConnectedAccountId = computed(() => {
  const value = route.query.accountId
  const firstValue = Array.isArray(value) ? value[0] : value
  return typeof firstValue === 'string' && /^acct_/.test(firstValue) ? firstValue : null
})

const invoiceDetails = ref<Invoice | null>(null);
const loading = ref(true);
const error = ref('');
const loadingStripe = ref(false);
const loadingPdf = ref(false);
const loadingSend = ref(false);
const rawStripeInvoice = ref<any>(null)

function resolveConnectedAccountIdFromInvoiceData(data: any): string | null {
  const value = data?.connected_account_id || data?.invoice?.connected_account_id
  return typeof value === 'string' && /^acct_/.test(value) ? value : null
}

// Load invoice on mount or when prop changes
onMounted(() => {
  if (props.invoiceData) {
    processInvoiceData(props.invoiceData);
  } else {
    loadInvoice();
  }
});

watch(() => props.invoiceData, (newData) => {
  if (newData) {
    processInvoiceData(newData);
  }
});

async function processInvoiceData(data: any) {
  try {
    loading.value = true;
    error.value = '';
    rawStripeInvoice.value = data

    console.log('Processing invoice data:', data);

    if (!data) {
      throw new Error('Fakturadata mangler');
    }

    const mappedItems = (data.lines?.data || data.lines || []).map((line: any) => {
      const quantity = line.quantity ?? 1
      const unitPrice = line.price?.unit_amount ?? line.unit_amount ?? line.amount ?? 0
      const amount = line.amount ?? (quantity * unitPrice)

      // Use invoice_description as fallback if line description is generic
      let description = line.description || 'Ingen beskrivelse';
      if (data.invoice_description && 
          (description === 'Payment for Invoice' || 
           description.toLowerCase().includes('payment for invoice'))) {
        description = data.invoice_description;
      }

      return {
        id: line.id,
        description: description,
        quantity,
        unitPrice,
        amount,
      }
    })

    const rawTotal = data.total ?? data.amount_due ?? data.amount ?? 0
    const itemsTotalMinor = mappedItems.reduce((sum: number, item: any) => sum + (item.amount ?? 0), 0)
    const fallbackCustomer = await findMatchingClientInvoiceCustomer(data, rawTotal)
    const fallbackUserName = `${userStore.getUser?.firstname || ''} ${userStore.getUser?.lastname || ''}`.trim()
    const fallbackUserEmail = userStore.getUser?.email || ''
    const chargeBillingDetails = data?.charges?.data?.[0]?.billing_details || data?.latest_charge?.billing_details
    
    // Extract metadata from various possible locations
    const extractedMeta = extractMetadataFromInvoiceData(data)

    // Resolve the correct total amount in major unit (DKK)
    // If we have total_minor, use that; otherwise try to infer from rawTotal
    const totalInMajor = data.total_minor 
      ? data.total_minor / 100 
      : resolveInvoiceTotalInMajor(rawTotal, itemsTotalMinor)

    const fallbackAppItems = await buildFallbackAppItems(data, totalInMajor, mappedItems, extractedMeta)

    // Map Stripe response to Invoice format
    invoiceDetails.value = {
      id: data.invoice_id || data.id || invoiceId.value,
      invoiceNumber: data.invoice_number || data.number || data.invoice_id || data.id || invoiceId.value,
      amount: totalInMajor,
      currency: (data.currency ?? 'dkk').toUpperCase(),
      status: data.status ?? 'unknown',
      description: data.invoice_description || data.description || null,
      customerName: data.customer_name || data.customer?.name || data.customer_details?.name || data.metadata?.customer_name || data.metadata?.customerName || data.billing_details?.name || chargeBillingDetails?.name || fallbackCustomer.name || fallbackUserName || '',
      customerEmail: data.customer_email || data.customer?.email || data.customer_details?.email || data.metadata?.customer_email || data.metadata?.customerEmail || data.billing_details?.email || chargeBillingDetails?.email || fallbackCustomer.email || fallbackUserEmail || '',
      items: fallbackAppItems || mappedItems,
      hostedInvoiceUrl: data.hosted_invoice_url ?? '', 
    };

    console.log('Processed invoice details:', invoiceDetails.value);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Kunne ikke behandle fakturaen';
    console.error('Error processing invoice:', err);
  } finally {
    loading.value = false;
  }
}

async function findMatchingClientInvoiceCustomer(stripeData: any, stripeTotalRaw: number): Promise<{ name: string, email: string }> {
  try {
    let page = 1
    let hasNextPage = true
    const stripeCreatedAt = stripeData?.created_at
      ? new Date(stripeData.created_at).toDateString()
      : (stripeData?.created ? new Date(stripeData.created * 1000).toDateString() : null)

    while (hasNextPage) {
      const response = await clientInvoiceService.getClientInvoices({ page })
      const invoices = response?.data?.data || response?.data || []

      const match = invoices.find((invoice: any) => {
        const sameDate = stripeCreatedAt && invoice?.created_at
          ? new Date(invoice.created_at).toDateString() === stripeCreatedAt
          : false

        return sameDate && isEquivalentAmount(invoice?.total_amount, stripeTotalRaw)
      })

      if (match) {
        return {
          name: match?.bill_to_name || '',
          email: match?.bill_to_email || match?.recipient || '',
        }
      }

      const nextLink = response?.links?.next ?? response?.data?.links?.next ?? null
      const currentPage = response?.meta?.current_page ?? response?.data?.meta?.current_page
      const lastPage = response?.meta?.last_page ?? response?.data?.meta?.last_page

      hasNextPage = !!nextLink || (!!currentPage && !!lastPage && currentPage < lastPage)
      page++

      if (page > 100) {
        hasNextPage = false
      }
    }
  } catch (error) {
    return { name: '', email: '' }
  }

  return { name: '', email: '' }
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

function resolveInvoiceTotalInMajor(rawTotal: number, itemsTotalMinor: number): number {
  if (!rawTotal || rawTotal <= 0) {
    return itemsTotalMinor > 0 ? itemsTotalMinor / 100 : 0
  }

  if (itemsTotalMinor > 0) {
    const diffIfMinor = Math.abs(rawTotal - itemsTotalMinor)
    const diffIfMajor = Math.abs(rawTotal - (itemsTotalMinor / 100))

    if (diffIfMinor <= diffIfMajor) {
      return rawTotal / 100
    }

    return rawTotal
  }

  // If rawTotal is small (< 10000), it's likely in major unit already
  // If it's large (>= 10000), it's likely in minor unit (øre/cents)
  // Use a threshold of 10000 to distinguish between major and minor amounts
  return rawTotal >= 10000 ? rawTotal / 100 : rawTotal
}

function looksLikeTestInvoice(items: InvoiceItem[], totalInMajor: number): boolean {
  if (items.length === 0) return false

  // Only replace items when ALL descriptions match the test data pattern (e.g. "test 1", "test 2").
  // Do not compare amounts — the items subtotal is pre-tax while totalInMajor includes VAT,
  // so the difference will always exceed 1 DKK on any taxed invoice.
  return items.every((item) => /^test\s*\d+$/i.test(item.description?.trim() || ''))
}

function extractMetadataFromInvoiceData(data: any): any {
  // First, try to get metadata from sessionStorage (for recent payments)
  const paymentIntentId = data?.id || data?.invoice_id || data?.payment_intent_id
  if (paymentIntentId) {
    try {
      const stored = sessionStorage.getItem(`stripe_payment_${paymentIntentId}`)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Only use if stored within last 24 hours
        if (parsed.timestamp && (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000)) {
          return parsed.metadata || {}
        } else {
          // Clean up expired entry
          sessionStorage.removeItem(`stripe_payment_${paymentIntentId}`)
        }
      }
    } catch (e) {
      console.warn('Failed to retrieve metadata from sessionStorage:', e)
    }
  }
  
  // Metadata can be in multiple places depending on response structure
  const metadata = data?.metadata || {}
  
  // Also check in payment_intent metadata
  if (data?.payment_intent?.metadata) {
    return { ...metadata, ...data.payment_intent.metadata }
  }
  
  // Check in charge metadata
  if (data?.charges?.data?.[0]?.metadata) {
    return { ...metadata, ...data.charges.data[0].metadata }
  }
  
  return metadata
}

async function buildFallbackAppItems(data: any, totalInMajor: number, mappedItems: InvoiceItem[], meta?: any): Promise<InvoiceItem[] | null> {
  const metadata = meta || extractMetadataFromInvoiceData(data)
  const isAppPayment = String(metadata?.type || '').toLowerCase() === 'app' || !!metadata?.app_uuid
  const isTestInvoice = looksLikeTestInvoice(mappedItems, totalInMajor)

  // If it's explicitly marked as an app OR looks like test data that needs replacement
  if (!isAppPayment && !isTestInvoice) {
    return null
  }

  const mappedTotalMinor = mappedItems.reduce((sum: number, item: InvoiceItem) => sum + (item.amount || 0), 0)
  const expectedTotalMinor = Math.round((totalInMajor || 0) * 100)

  // Keep Stripe lines if they look correct and we're not in test mode
  if (mappedItems.length > 0 && !isTestInvoice && Math.abs(mappedTotalMinor - expectedTotalMinor) <= 1) {
    return null
  }

  const quantityRaw = Number(metadata?.quantity ?? 1)
  const quantity = Number.isFinite(quantityRaw) && quantityRaw > 0 ? Math.floor(quantityRaw) : 1

  // Try to get app name from metadata first (priority order)
  let appName = metadata?.app_name || metadata?.item_description || ''
  const appUuid = metadata?.app_uuid || data?.deal_uuid

  // If still no name, try to look it up by app UUID
  if (!appName && appUuid) {
    appName = await lookupAppNameByUuid(appUuid)
  }

  // Final fallback: extract from data description or generic fallback
  if (!appName) {
    appName = data?.description || data?.product_description || 'App purchase'
  }

  const amountMinor = expectedTotalMinor > 0
    ? expectedTotalMinor
    : Math.round(mappedTotalMinor > 0 ? mappedTotalMinor : (totalInMajor * 100))
  const unitPriceMinor = quantity > 0 ? Math.round(amountMinor / quantity) : amountMinor

  return [
    {
      id: `app-item-${appUuid || invoiceId.value || 'unknown'}`,
      description: appName,
      quantity,
      unitPrice: unitPriceMinor,
      amount: amountMinor,
    },
  ]
}

async function lookupAppNameByUuid(appUuid: string): Promise<string> {
  if (!appUuid) return ''

  try {
    // Try to find the app by searching through available apps
    let page = 1
    let hasMore = true
    
    while (hasMore && page <= 5) {
      const response = await appService.getApps({ page, per_page: 50 })
      const apps = response?.data || []
      
      if (!Array.isArray(apps) || apps.length === 0) {
        hasMore = false
        break
      }

      const matchedApp = apps.find((app: any) => app?.uuid === appUuid)
      if (matchedApp?.name) {
        return matchedApp.name
      }

      // Check if there are more pages
      if (apps.length < 50) {
        hasMore = false
      } else {
        page++
      }
    }
  } catch (error) {
    console.warn(`Failed to lookup app by UUID ${appUuid}:`, error)
  }

  return ''
}

async function loadInvoice() {
  if (!invoiceId.value) {
    error.value = 'Ugyldigt faktura-ID';
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    error.value = '';

    const connectedAccountId = resolveConnectedAccountIdFromInvoiceData(props.invoiceData) || routeConnectedAccountId.value
    const data = await stripeApi.getStripeInvoice(invoiceId.value, connectedAccountId);
    console.log('Loaded invoice data from API:', data);
    processInvoiceData(data);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Kunne ikke indlæse faktura';
    console.error('Error loading invoice:', err);
    loading.value = false;
  }
}

function retryLoadInvoice() {
  if (props.invoiceData) {
    processInvoiceData(props.invoiceData);
  } else {
    loadInvoice();
  }
}

// Layout helpers
// Payment intents (App purchases) carry the tax-inclusive total as the item amount.
// Stripe invoices carry pre-tax amounts. Divide out the 25% for payment intents so
// the computed tax and total rows are always correct.
const isPriceInclusiveTax = computed(() => rawStripeInvoice.value?.type === 'payment_intent')

const itemsSubtotal = computed(() => {
  if (!invoiceDetails.value?.items?.length) return invoiceDetails.value?.amount || 0
  const raw = invoiceDetails.value.items.reduce((sum: number, item: any) => sum + (item.amount / 100), 0)
  return isPriceInclusiveTax.value ? raw / 1.25 : raw
})

const invoiceTax = computed(() => {
  return itemsSubtotal.value * 0.25
})

const invoiceTotalInclTax = computed(() => {
  return itemsSubtotal.value * 1.25
})

function statusBadgeClass(status: string): string {
  const s = (status || '').toLowerCase()
  if (['paid', 'succeeded', 'complete', 'completed'].includes(s)) return 'bg-green-100 text-green-800'
  if (['open'].includes(s)) return 'bg-yellow-100 text-yellow-800'
  if (['dispute_lost', 'refunded'].includes(s)) return 'bg-red-100 text-red-800'
  if (['disputed', 'refunded_partial', 'partially_refunded'].includes(s)) return 'bg-orange-100 text-orange-800'
  if (['void', 'uncollectible'].includes(s)) return 'bg-gray-100 text-gray-600'
  return 'bg-gray-100 text-gray-700'
}

// Formatting helpers
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('da-DK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatStatus(status: string): string {
  if (!status) return 'Ukendt';
  
  const statusMap: { [key: string]: string } = {
    'paid': 'Betalt',
    'succeeded': 'Betalt',
    'complete': 'Betalt',
    'completed': 'Betalt',
    'open': 'Åben',
    'draft': 'Kladde',
    'uncollectible': 'Uinddrivelig',
    'void': 'Annulleret',
    'pending': 'Afventende',
    'processing': 'Behandles',
    'requires_payment_method': 'Kræver betalingsmetode',
    'disputed': 'Tvist',
    'dispute_lost': 'Tvist tabt',
    'refunded': 'Refunderet',
    'refunded_partial': 'Delvist refunderet',
    'partially_refunded': 'Delvist refunderet',
  };
  
  const normalized = status.toLowerCase().trim();
  return statusMap[normalized] || status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

function normalizeStatus(status: string): string {
  const normalized = (status || '').toLowerCase().trim();

  if (['paid', 'succeeded', 'complete', 'completed'].includes(normalized)) {
    return 'paid';
  }

  return normalized;
}

function isReceipt(status: string): boolean {
  return normalizeStatus(status) === 'paid';
}

function canPayInvoice(status: string): boolean {
  return !isReceipt(status);
}

function cleanInvoiceDescription(description: string): string {
  if (!description) return ''
  return description.replace(/\s*-\s*One[\s-]time\s*purchase\s*$/i, '').trim()
}

// Stripe Payment
async function payWithStripe() {
  if (!invoiceId.value) return;

  loadingStripe.value = true;

  try {
    const data = await stripeApi.createCheckoutSession(invoiceId.value);

    if (!data.url) throw new Error('Checkout URL mangler i svaret');

    window.location.href = data.url; // Redirect til Stripe Checkout
  } catch (err) {
    console.error('Error creating Stripe checkout session:', err);
    alert('Kunne ikke starte betaling. Prøv venligst igen senere.');
  } finally {
    loadingStripe.value = false;
  }
}

// PDF Download using Stripe invoice PDF or Stripe hosted receipt URL
  async function downloadPdf() {
    if (!invoiceId.value) {
      alert('Faktura-ID mangler.');
      return;
    }

    loadingPdf.value = true;

    try {
      const currentInvoice = invoiceDetails.value;
      if (!currentInvoice) {
        throw new Error('Fakturadetaljer mangler');
      }

      const filePrefix = isReceipt(currentInvoice.status) ? 'receipt' : 'invoice';
      const fileName = `${filePrefix}_${currentInvoice.id}.pdf`;

      // Mirror list-page behavior: for paid Stripe rows, prefer matched regular invoice download.
      // For Stripe payment intents and invoices, always download the Stripe receipt
      // Don't try to match to regular invoices - use the Stripe receipt HTML directly
      const correctInvoiceId = currentInvoice.id || invoiceId.value
      const connectedAccountId = resolveConnectedAccountIdFromInvoiceData(rawStripeInvoice.value) || routeConnectedAccountId.value
      const response = await stripeApi.downloadStripeInvoicePdf(correctInvoiceId, connectedAccountId)

      // If we get a JSON response with a Stripe receipt URL, open it in a new window
      if (response && typeof response === 'object' && response.is_stripe_receipt_url) {
        const redirectUrl = response.redirect_url || response.receipt_url
        if (!redirectUrl) {
          throw new Error('No redirect URL received from backend')
        }

        window.open(redirectUrl, '_blank')
        const title = isReceipt(currentInvoice.status) ? t('stripeInvoices.downloadReceipt') : t('clientInvoices.table.actions.download')
        successAlert(title, 'Denne stykker åbnes i browser med mulighed for at gemme som PDF')
        return
      }

      // Otherwise treat as a Blob/file
      saveAs(response, fileName)
      
      // Show success message
      const title = isReceipt(currentInvoice.status) ? t('stripeInvoices.downloadReceipt') : t('clientInvoices.table.actions.download')
      const message = isReceipt(currentInvoice.status) ? t('stripeInvoices.receiptDownloaded') : t('stripeInvoices.invoiceDownloaded')
      successAlert(title, message)
    } catch (err) {
      console.error('Error downloading PDF:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      alert(`Kunne ikke downloade PDF: ${errorMessage}`);
    } finally {
      loadingPdf.value = false;
    }
  }

async function findMatchingClientInvoiceUuid(stripeData: any): Promise<string> {
  if (!stripeData) {
    return ''
  }

  try {
    let page = 1
    let hasNextPage = true
    const stripeCreatedAt = stripeData?.created_at
      ? new Date(stripeData.created_at).toDateString()
      : (stripeData?.created ? new Date(stripeData.created * 1000).toDateString() : null)

    while (hasNextPage) {
      const response = await clientInvoiceService.getClientInvoices({ page })
      const invoices = response?.data?.data || response?.data || []

      const stripeRawTotal = stripeData?.total ?? stripeData?.amount_due ?? stripeData?.amount ?? 0
      const match = invoices.find((invoice: any) => {
        const sameDate = stripeCreatedAt && invoice?.created_at
          ? new Date(invoice.created_at).toDateString() === stripeCreatedAt
          : false

        return sameDate && isEquivalentAmount(invoice?.total_amount, stripeRawTotal)
      })

      if (match?.uuid) {
        return match.uuid
      }

      const nextLink = response?.links?.next ?? response?.data?.links?.next ?? null
      const currentPage = response?.meta?.current_page ?? response?.data?.meta?.current_page
      const lastPage = response?.meta?.last_page ?? response?.data?.meta?.last_page

      hasNextPage = !!nextLink || (!!currentPage && !!lastPage && currentPage < lastPage)
      page++

      if (page > 100) {
        hasNextPage = false
      }
    }
  } catch (error) {
    return ''
  }

  return ''
}

async function sendInvoice() {
  const email = invoiceDetails.value?.customerEmail
  const id = invoiceDetails.value?.id
  if (!email || !id) {
    alert('Kunde-e-mail mangler – kan ikke sende faktura.')
    return
  }
  loadingSend.value = true
  try {
    await stripeApi.sendStripeInvoice(id, { recipient_email: email })
    successAlert('Faktura sendt', `Faktura sendt til ${email}`)
  } catch (err) {
    alert('Kunne ikke sende faktura. Prøv igen.')
  } finally {
    loadingSend.value = false
  }
}

function goBack() {
  navigateTo('/invoices');
}

</script>

<style scoped>
.loading-state {
  text-align: center;
  padding: 60px 0;
}
.spinner {
  display: inline-block;
  width: 50px;
  height: 50px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.error-alert {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
  padding: 16px;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.retry-btn {
  margin-left: 12px;
  padding: 6px 12px;
  background-color: #991b1b;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
