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
      <h1>Invoice #: {{ invoiceDetails.id }}</h1>
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
            <td>{{ formatCurrency(item.unitPrice) }}</td>
            <td>{{ formatCurrency(item.amount) }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Action buttons-->
 <div class="invoice-actions">
    <button @click="payWithStripe" class="stripe-btn" :disabled="loadingPay">
      <span v-if="!loadingPay">Pay with Stripe</span>
      <span v-else>Redirecting...</span>
    </button>
     
    <button @click="downloadPdf" class="pdf-btn" :disabled="loadingPay">
      Download PDF
    </button>
     </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  customerName?: string;
  customerEmail?: string;
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
}

// State
const route = useRoute();
const invoiceId = computed(() => route.params.id as string);

const invoiceDetails = ref<Invoice | null>(null);
const loading = ref(true);
const error = ref('');
const loadingPay = ref(false);

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

    const invoice = data; // Assuming API returns { invoice: { ... } }
    const invoiceFromApi = data?.invoice_id; // Adjust based on actual API response structure

    if(!invoice || !invoiceFromApi) {
      throw new Error('Invoice data is missing in the response');
    }

    // Map Stripe response to InvoiceStripe format
    invoiceDetails.value = {
      id: invoiceFromApi, // Use the correct ID from the API response
      amount: invoice.total ?? invoice.amount_due ?? 0,
      currency: invoice.currency ?? 'dkk',
      status: invoice.status ?? 'unknown',
      customerName: invoice.customer_name ?? '',
      customerEmail: invoice.customer_email ?? '',
      items: invoice.lines?.map((line: any) => ({
        id: line.id,
        description: line.description,
        quantity: line.quantity,
        unitPrice: line.amount,
        amount: line.amount,
      })) ?? [],
    };

  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load invoice';
    console.error(err);
  } finally {
    loading.value = false; // 🔹 Spinner stopper
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

//Stripe Payment
async function payWithStripe() {
  if (!invoiceId.value) return;
  loadingPay.value = true;

  try {
    // Call backend to create Stripe Checkout session
    const res = await fetch(`http://127.0.0.1:8000/api/stripe/invoices/${invoiceId.value}/checkout-session`);
    const data = await res.json();

    if (data.hosted_invoice_url) {
      window.open(data.hosted_invoice_url, '_blank');
    }else{
        throw new Error('Failed to create Stripe checkout session');
    }
   
  } catch (err) {
    console.error('Error creating Stripe checkout session:', err);
  } finally {
    loadingPay.value = false;
  }
}

// PDF Download
async function downloadPdf() {
  if (!invoiceId.value) return;
  loadingPay.value = true;

  try {
    const res = await fetch(`http://127.0.0.1:8000/api/stripe/invoices/${invoiceId.value}/pdf`);

    if (!res.ok) {
       throw new Error(`Failed to fetch PDF: ${res.statusText}`);
    }

    const blob = await res.blob();
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `invoice_${invoiceId.value}.pdf`;
    link.click();  

    window.URL.revokeObjectURL(link.href); // Clean up URL object

  } catch (err) {
    console.error('Error downloading PDF:', err);
  } finally {
    loadingPay.value = false;
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
