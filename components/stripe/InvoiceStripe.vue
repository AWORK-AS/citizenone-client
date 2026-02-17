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
      <h1>Invoice #{{ invoiceDetails.id }}</h1>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { invoiceService } from '@/components/api/superadmin/InvoiceService';

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
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

    // Map Stripe response to InvoiceStripe format
    invoiceDetails.value = {
      id: data.invoice_id,
      amount: data.total,
      currency: data.lines[0]?.currency || 'DKK',
      status: data.status,
      items: data.lines.map((line: any) => ({
        id: line.id,
        description: line.description,
        quantity: line.quantity,
        unitPrice: line.amount,
        amount: line.amount,
      })),
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
</style>
