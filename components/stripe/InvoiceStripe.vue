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
      <!-- Invoice Header -->
      <div class="invoice-header">
        <div class="header-left">
          <h1>Invoice #{{ invoiceDetails.number || invoiceDetails.id }}</h1>
          <p class="invoice-id">{{ invoiceDetails.id }}</p>
        </div>
        <div class="header-right">
          <span 
            class="status-badge" 
            :class="invoiceDetails.status?.toLowerCase()"
          >
            {{ formatStatus(invoiceDetails.status) }}
          </span>
        </div>
      </div>

      <!-- Invoice Details Grid -->
      <div class="invoice-grid">
        <!-- Left Column -->
        <div class="grid-section">
          <div class="detail-row">
            <label>Invoice Date:</label>
            <span>{{ formatDate(invoiceDetails.createdAt) }}</span>
          </div>
          <div class="detail-row">
            <label>Due Date:</label>
            <span>{{ formatDate(invoiceDetails.dueDate) }}</span>
          </div>
          <div class="detail-row">
            <label>Client:</label>
            <span>{{ invoiceDetails.clientName || 'N/A' }}</span>
          </div>
        </div>

        <!-- Right Column -->
        <div class="grid-section">
          <div class="detail-row">
            <label>Invoice Type:</label>
            <span>{{ invoiceDetails.type || 'Standard' }}</span>
          </div>
          <div class="detail-row">
            <label>Reference:</label>
            <span>{{ invoiceDetails.reference || 'N/A' }}</span>
          </div>
          <div class="detail-row">
            <label>Currency:</label>
            <span>{{ invoiceDetails.currency || 'DKK' }}</span>
          </div>
        </div>
      </div>

      <!-- Invoice Items (if available) -->
      <div v-if="invoiceDetails.items && invoiceDetails.items.length > 0" class="invoice-items">
        <h3>Invoice Items</h3>
        <table class="items-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in invoiceDetails.items" :key="item.id">
              <td>{{ item.description }}</td>
              <td class="text-center">{{ item.quantity }}</td>
              <td class="text-right">{{ formatCurrency(item.unitPrice) }}</td>
              <td class="text-right"><strong>{{ formatCurrency(item.amount) }}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Amount Summary -->
      <div class="amount-summary">
        <div class="summary-row">
          <span>Subtotal:</span>
          <span>{{ formatCurrency(invoiceDetails.subtotal || invoiceDetails.amount) }}</span>
        </div>
        <div v-if="invoiceDetails.tax" class="summary-row">
          <span>Tax:</span>
          <span>{{ formatCurrency(invoiceDetails.tax) }}</span>
        </div>
        <div v-if="invoiceDetails.discount" class="summary-row discount">
          <span>Discount:</span>
          <span>-{{ formatCurrency(invoiceDetails.discount) }}</span>
        </div>
        <div class="summary-row total">
          <span>Total Amount Due:</span>
          <span>{{ formatCurrency(invoiceDetails.amount) }} {{ invoiceDetails.currency || 'DKK' }}</span>
        </div>
      </div>

      <!-- Notes Section -->
      <div v-if="invoiceDetails.notes" class="notes-section">
        <h3>Notes</h3>
        <p>{{ invoiceDetails.notes }}</p>
      </div>

      <!-- Payment Section -->
      <div v-if="invoiceDetails.status?.toLowerCase() !== 'paid'" class="payment-section">
        <h3>Payment</h3>
        <p class="payment-instructions">
          Click the button below to pay this invoice securely using Stripe.
        </p>

        <StripeCheckoutButton
          :amount="Math.round(invoiceDetails.amount * 100)"
          :invoice-id="invoiceDetails.id"
          :citizen-id="currentUserId"
          :button-text="`Pay ${formatCurrency(invoiceDetails.amount)} ${invoiceDetails.currency || 'DKK'}`"
          variant="primary"
          @payment-initiated="onPaymentInitiated"
        />

        <StripePaymentModal
          :is-open="paymentModalOpen"
          :amount="Math.round(invoiceDetails.amount * 100)"
          :invoice-id="invoiceDetails.id"
          :citizen-id="currentUserId"
          @close="paymentModalOpen = false"
          @payment-success="onPaymentSuccess"
          @payment-error="onPaymentError"
        />

        <!-- Payment Error Alert -->
        <div v-if="paymentError" class="alert alert-error">
          {{ paymentError }}
          <button @click="paymentError = ''" class="close-alert">×</button>
        </div>

        <!-- Payment Success Alert -->
        <div v-if="paymentSuccess" class="alert alert-success">
          Payment successful! Your invoice has been marked as paid.
          <button @click="paymentSuccess = false" class="close-alert">×</button>
        </div>
      </div>

      <!-- Paid Confirmation -->
      <div v-else class="paid-confirmation">
        <div class="paid-icon">✓</div>
        <h3>Invoice Paid</h3>
        <p>This invoice was paid on {{ formatDate(invoiceDetails.paidAt) }}</p>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button @click="downloadInvoice" class="btn btn-secondary">
          Download PDF
        </button>
        <button @click="goBack" class="btn btn-outline">
          Back to Invoices
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import StripeCheckoutButton from './StripeCheckoutButton.vue';
import StripePaymentModal from './StripePaymentModal.vue';
import { invoiceService } from '@/components/api/superadmin/InvoiceService';

interface Invoice {
  id: string;
  number?: string;
  amount: number;
  subtotal?: number;
  tax?: number;
  discount?: number;
  currency?: string;
  status: string;
  clientName?: string;
  createdAt?: string;
  dueDate?: string;
  paidAt?: string;
  type?: string;
  reference?: string;
  notes?: string;
  items?: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
}

interface Props {
  invoiceData?: Invoice | null;
  loading?: boolean;
  error?: string;
}

// Composables
const router = useRouter();
const route = useRoute();
const props = withDefaults(defineProps<Props>(), {
  invoiceData: null,
  loading: undefined,
  error: undefined,
});

// State
const invoiceDetails = ref<Invoice | null>(props.invoiceData || null);
const localLoading = ref(props.loading !== undefined ? props.loading : true);
const localError = ref(props.error || '');
const currentUserId = ref(''); // You'll need to get this from your auth store
const paymentModalOpen = ref(false);
const paymentError = ref('');
const paymentSuccess = ref(false);

// Get invoice ID from route
const invoiceId = computed(() => route.params.id as string);

// Use prop data if provided, otherwise use local state
const loading = computed(() => props.loading !== undefined ? props.loading : localLoading.value);
const error = computed(() => props.error !== undefined ? props.error : localError.value);

// Watch for prop changes
watch(() => props.invoiceData, (newData) => {
  invoiceDetails.value = newData;
}, { deep: true });

watch(() => props.loading, (newLoading) => {
  if (newLoading !== undefined) {
    localLoading.value = newLoading;
  }
});

watch(() => props.error, (newError) => {
  if (newError !== undefined) {
    localError.value = newError;
  }
});

// Load invoice on mount (only if data not provided via props)
onMounted(async () => {
  if (!props.invoiceData) {
    loadInvoice();
  }
  // Get current user ID from your auth store/context
  // currentUserId.value = useAuthStore().userId;
});

// Load invoice details
async function loadInvoice() {
  if (!invoiceId.value) {
    localError.value = 'Invalid invoice ID';
    localLoading.value = false;
    return;
  }

  try {
    localLoading.value = true;
    localError.value = '';
    invoiceDetails.value = await invoiceService.getInvoiceDetails(invoiceId.value);
  } catch (err) {
    localError.value = err instanceof Error ? err.message : 'Failed to load invoice';
    console.error('Error loading invoice:', err);
  } finally {
    localLoading.value = false;
  }
}

// Retry loading invoice
function retryLoadInvoice() {
  loadInvoice();
}

// Download invoice as PDF
async function downloadInvoice() {
  try {
    await invoiceService.downloadInvoiceDetails(invoiceId.value);
  } catch (err) {
    console.error('Error downloading invoice:', err);
    localError.value = 'Failed to download invoice PDF';
  }
}

// Go back to invoices list
function goBack() {
  router.back();
}

// Payment handlers
function onPaymentInitiated() {
  paymentModalOpen.value = true;
  paymentError.value = '';
  paymentSuccess.value = false;
}

async function onPaymentSuccess() {
  try {
    // Mark invoice as paid in backend
    await $fetch(`/api/invoices/${invoiceId.value}/mark-paid`, {
      method: 'POST'
    });

    // Update local state
    if (invoiceDetails.value) {
      invoiceDetails.value.status = 'paid';
      invoiceDetails.value.paidAt = new Date().toISOString();
    }

    paymentSuccess.value = true;
    paymentError.value = '';

    // Hide success message after 3 seconds
    setTimeout(() => {
      paymentSuccess.value = false;
    }, 3000);
  } catch (err) {
    console.error('Error marking invoice as paid:', err);
    paymentError.value = 'Payment completed but failed to update invoice status';
  }
}

function onPaymentError(error: string) {
  paymentError.value = error;
  console.error('Payment error:', error);
}

// Formatting helpers
function formatDate(date: string | undefined): string {
  if (!date) return 'N/A';
  return new Intl.DateTimeFormat('da-DK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date));
}

function formatCurrency(amount: number | undefined): string {
  if (amount === undefined) return '0.00 DKK';
  return new Intl.NumberFormat('da-DK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

function formatStatus(status: string | undefined): string {
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

/* Loading State */
.loading-state {
  text-align: center;
  padding: 60px 20px;
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
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-state p {
  color: #6b7280;
  font-size: 14px;
}

/* Error Alert */
.error-alert {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-alert strong {
  font-weight: 600;
}

.retry-btn {
  padding: 8px 16px;
  background-color: #991b1b;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
}

.retry-btn:hover {
  background-color: #7f1d1d;
}

/* Invoice Content */
.invoice-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 32px;
}

/* Invoice Header */
.invoice-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid #e5e7eb;
}

.header-left h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.invoice-id {
  font-size: 13px;
  color: #9ca3af;
  margin: 4px 0 0 0;
}

.header-right {
  display: flex;
  gap: 12px;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.paid {
  background-color: #dcfce7;
  color: #166534;
}

.status-badge.unpaid {
  background-color: #fef3c7;
  color: #b45309;
}

.status-badge.pending {
  background-color: #dbeafe;
  color: #1e40af;
}

/* Invoice Grid */
.invoice-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-bottom: 32px;
}

.grid-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.detail-row label {
  color: #6b7280;
  font-weight: 500;
}

.detail-row span {
  color: #1f2937;
  font-weight: 600;
}

/* Invoice Items */
.invoice-items {
  margin-bottom: 32px;
}

.invoice-items h3 {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 16px 0;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.items-table thead {
  background-color: #f9fafb;
}

.items-table th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #1f2937;
  border-bottom: 1px solid #e5e7eb;
  font-size: 13px;
}

.items-table td {
  padding: 12px;
  color: #6b7280;
  border-bottom: 1px solid #e5e7eb;
}

.items-table thead th {
  border-bottom: 2px solid #d1d5db;
}

.items-table tbody tr:last-child td {
  border-bottom: none;
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

/* Amount Summary */
.amount-summary {
  background-color: #f9fafb;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 32px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  padding: 8px 0;
}

.summary-row span:first-child {
  color: #6b7280;
}

.summary-row span:last-child {
  color: #1f2937;
  font-weight: 600;
}

.summary-row.discount span:last-child {
  color: #16a34a;
}

.summary-row.total {
  padding-top: 12px;
  border-top: 2px solid #e5e7eb;
  margin-top: 12px;
  font-size: 16px;
}

.summary-row.total span:first-child {
  font-weight: 700;
  color: #1f2937;
}

.summary-row.total span:last-child {
  font-size: 18px;
  font-weight: 700;
  color: #2563eb;
}

/* Notes Section */
.notes-section {
  margin-bottom: 32px;
}

.notes-section h3 {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.notes-section p {
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
  background-color: #f9fafb;
  padding: 12px;
  border-left: 3px solid #3b82f6;
  border-radius: 4px;
}

/* Payment Section */
.payment-section {
  background-color: #f0f9ff;
  border: 2px solid #bfdbfe;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 32px;
}

.payment-section h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1e40af;
  margin: 0 0 12px 0;
}

.payment-instructions {
  color: #1e40af;
  font-size: 14px;
  margin: 0 0 16px 0;
}

/* Paid Confirmation */
.paid-confirmation {
  text-align: center;
  padding: 40px;
  background-color: #f0fdf4;
  border-radius: 8px;
  margin-bottom: 32px;
}

.paid-icon {
  width: 60px;
  height: 60px;
  background-color: #dcfce7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: #16a34a;
  margin: 0 auto 16px;
}

.paid-confirmation h3 {
  font-size: 20px;
  font-weight: 700;
  color: #166534;
  margin: 0 0 8px 0;
}

.paid-confirmation p {
  color: #4b5563;
  margin: 0;
}

/* Alerts */
.alert {
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.alert-success {
  background-color: #dcfce7;
  color: #166534;
  border: 1px solid #86efac;
}

.alert-error {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.close-alert {
  background: none;
  border: none;
  color: inherit;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  margin-left: 12px;
}

.close-alert:hover {
  opacity: 0.7;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #1f2937;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.btn-outline {
  background-color: transparent;
  color: #3b82f6;
  border: 1px solid #3b82f6;
}

.btn-outline:hover {
  background-color: #eff6ff;
}

/* Responsive */
@media (max-width: 768px) {
  .invoice-grid {
    grid-template-columns: 1fr;
  }

  .invoice-header {
    flex-direction: column;
    gap: 16px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .items-table {
    font-size: 12px;
  }

  .items-table th,
  .items-table td {
    padding: 8px;
  }
}
</style>
