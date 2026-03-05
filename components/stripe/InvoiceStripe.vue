<template>
  <div class="invoice-stripe-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading invoice details...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-alert">
      <strong>Error:</strong> {{ error }}
      <button @click="retryLoadInvoice" class="retry-btn">Try Again</button>
    </div>

    <!-- Invoice Content -->
    <div v-if="!loading && !error && invoiceDetails" class="invoice-content">
      <h1>Invoice number: {{ invoiceDetails.id }}</h1>
      <p>Customer: {{ invoiceDetails.customerName }}</p>
      <p>Email: {{ invoiceDetails.customerEmail }}</p>
      <p>Status: {{ formatStatus(invoiceDetails.status) }}</p>
      <p>Total: {{ formatCurrency(invoiceDetails.amount) }} {{ invoiceDetails.currency }}</p>

      <h3>Items</h3>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in invoiceDetails.items" :key="item.id">
            <td>{{ item.description }}</td>
            <td>{{ item.quantity }}</td>
            <td>{{ formatCurrency(item.unitPrice / 100) }}</td>
            <td>{{ formatCurrency(item.amount / 100) }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Action buttons-->
      <div class="invoice-actions">
        <button 
          v-if="invoiceDetails.status !== 'paid'" 
          @click="payWithStripe" 
          class="stripe-btn" 
          :disabled="loadingStripe"
        >
          <span v-if="!loadingStripe">Pay with Stripe</span>
          <span v-else>Redirecting...</span>
        </button>
         
        <button @click="downloadPdf" class="pdf-btn" :disabled="loadingPdf">
          <span v-if="!loadingPdf">Download PDF</span>
          <span v-else>Downloading...</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import stripeApi from '@/components/api/stripeApi';
import { clientInvoiceService } from '@/components/api/user/ClientInvoiceService'

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
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
const invoiceId = computed(() => route.params.id as string);

const invoiceDetails = ref<Invoice | null>(null);
const loading = ref(true);
const error = ref('');
const loadingStripe = ref(false);
const loadingPdf = ref(false);

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

    console.log('Processing invoice data:', data);

    if (!data) {
      throw new Error('Invoice data is missing');
    }

    const mappedItems = (data.lines?.data || data.lines || []).map((line: any) => {
      const quantity = line.quantity ?? 1
      const unitPrice = line.price?.unit_amount ?? line.unit_amount ?? line.amount ?? 0
      const amount = line.amount ?? (quantity * unitPrice)

      return {
        id: line.id,
        description: line.description || 'No description',
        quantity,
        unitPrice,
        amount,
      }
    })

    const rawTotal = data.total ?? data.amount_due ?? data.amount ?? 0
    const itemsTotalMinor = mappedItems.reduce((sum: number, item: any) => sum + (item.amount ?? 0), 0)
    const fallbackCustomer = await findMatchingClientInvoiceCustomer(data, rawTotal)

    // Resolve the correct total amount in major unit (DKK)
    // If we have total_minor, use that; otherwise try to infer from rawTotal
    const totalInMajor = data.total_minor 
      ? data.total_minor / 100 
      : resolveInvoiceTotalInMajor(rawTotal, itemsTotalMinor)

    // Map Stripe response to Invoice format
    invoiceDetails.value = {
      id: data.invoice_id || data.id || invoiceId.value,
      amount: totalInMajor,
      currency: (data.currency ?? 'dkk').toUpperCase(),
      status: data.status ?? 'unknown',
      customerName: data.customer_name || data.customer?.name || data.customer_details?.name || data.metadata?.customer_name || data.metadata?.customerName || fallbackCustomer.name || '',
      customerEmail: data.customer_email || data.customer?.email || data.customer_details?.email || data.metadata?.customer_email || data.metadata?.customerEmail || fallbackCustomer.email || '',
      items: mappedItems,
      hostedInvoiceUrl: data.hosted_invoice_url ?? '', 
    };

    console.log('Processed invoice details:', invoiceDetails.value);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to process invoice';
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

async function loadInvoice() {
  if (!invoiceId.value) {
    error.value = 'Invalid invoice ID';
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    error.value = '';

    const data = await stripeApi.getStripeInvoice(invoiceId.value);
    console.log('Loaded invoice data from API:', data);
    processInvoiceData(data);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load invoice';
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

// Formatting helpers
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('da-DK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatStatus(status: string): string {
  if (!status) return 'Unknown';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

// Stripe Payment
async function payWithStripe() {
  if (!invoiceId.value) return;

  loadingStripe.value = true;

  try {
    const data = await stripeApi.createCheckoutSession(invoiceId.value);

    if (!data.url) throw new Error('Checkout URL is missing in the response');

    window.location.href = data.url; // Redirect til Stripe Checkout
  } catch (err) {
    console.error('Error creating Stripe checkout session:', err);
    alert('Failed to initiate payment. Please try again later.');
  } finally {
    loadingStripe.value = false;
  }
}

// PDF Download using hosted_invoice_url
  async function downloadPdf() {
    if (!invoiceDetails.value?.hostedInvoiceUrl) {
      alert('PDF is not available yet.');
      return;
    }

  loadingPdf.value = true;

  try {
    const runtimeConfig = useRuntimeConfig();
    const token = localStorage.getItem('_token') || '';
    
    const response = await fetch(
      `${runtimeConfig.public.apiBaseURL}/stripe/invoices/${invoiceId.value}/pdf`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/pdf',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch PDF');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice_${invoiceDetails.value.id}.pdf`;
    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);

  } catch (err) {
    console.error('Error downloading PDF:', err);
    alert('Failed to download PDF.');
  } finally {
    loadingPdf.value = false;
  }
}

</script>

<style scoped>
.invoice-stripe-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}
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
.invoice-content table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
}
.invoice-content th, .invoice-content td {
  border: 1px solid #e5e7eb;
  padding: 8px;
  text-align: left;
}
.invoice-actions {
  margin-top: 24px;
  display: flex;
  justify-content: space-between;
  max-width: 100%;
  gap: 16px;
  padding: 0;
  flex-wrap: wrap;
}
.stripe-btn, .pdf-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 150px;
  margin-bottom: 8px;
}
.stripe-btn, .pdf-btn {
  background-color: #f3f4f6;
  color: #1f2937;
  border: 1px solid #d1d5db;
}
.stripe-btn:hover:not(:disabled), .pdf-btn:hover:not(:disabled) {
  background-color: #e5e7eb;
}
.stripe-btn:disabled, .pdf-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
@media (max-width: 600px) {
  .invoice-actions {
    flex-direction: column;
    align-items: flex-start;
  }
  .stripe-btn, .pdf-btn {
    width: 100%;
  }
}
</style>
