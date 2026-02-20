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
        <button @click="payWithStripe" class="stripe-btn" :disabled="loadingStripe">
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
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';

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

// State
const route = useRoute();
const invoiceId = computed(() => route.params.id as string);

const invoiceDetails = ref<Invoice | null>(null);
const loading = ref(true);
const error = ref('');
const loadingStripe = ref(false);
const loadingPdf = ref(false);

// Load invoice on mount
onMounted(() => {
  loadInvoice();
});

async function loadInvoice() {
  if (!invoiceId.value) {
    error.value = 'Invalid invoice ID';
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    error.value = '';

    const res = await fetch(`http://127.0.0.1:8000/api/stripe/invoices/${invoiceId.value}`);
    if (!res.ok) throw new Error(`Failed to fetch invoice: ${res.statusText}`);
    const data = await res.json();

    if (!data || !data.invoice_id) {
      throw new Error('Invoice data is missing in the response');
    }

    // Map Stripe response to Invoice format
    invoiceDetails.value = {
      id: data.invoice_id,
      amount: data.total ?? data.amount_due ?? 0,
      currency: data.currency ?? 'dkk',
      status: data.status ?? 'unknown',
      customerName: data.customer_name ?? '',
      customerEmail: data.customer_email ?? '',
      items: data.lines?.map((line: any) => ({
        id: line.id,
        description: line.description,
        quantity: line.quantity ?? 1,
        unitPrice: line.amount ?? 0,
        amount: line.amount ?? 0,
      })) ?? [],
      hostedInvoiceUrl: data.hosted_invoice_url ?? '', 
    };
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load invoice';
    console.error(err);
  } finally {
    loading.value = false;
  }
}

function retryLoadInvoice() {
  loadInvoice();
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
    const res = await fetch(
      `http://127.0.0.1:8000/api/stripe/invoices/${invoiceId.value}/checkout-session`,
      { method: 'POST' }
    );

    if (!res.ok) throw new Error(`Failed to create Stripe checkout session: ${res.statusText}`);
    const data = await res.json();

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
    const response = await fetch(
      `http://127.0.0.1:8000/api/stripe/invoices/${invoiceDetails.value.id}/pdf`
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
