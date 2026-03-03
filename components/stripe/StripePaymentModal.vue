<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ isInvoiceView ? 'Invoice' : 'Complete Payment' }}</h2>
        <button
          @click="closeModal"
          class="close-btn"
          aria-label="Close modal"
        >
          ✕
        </button>
      </div>

      <div class="invoice-summary" v-if="!isInvoiceView">
        <div v-if="invoiceId" class="summary-row">
          <span>Invoice ID:</span>
          <strong>{{ invoiceId }}</strong>
        </div>
        <div class="summary-row total">
          <span>Amount Due:</span>
          <strong>{{ formatAmount(amount) }} DKK</strong>
        </div>
      </div>

      <template v-if="!isInvoiceView">
        <StripeCardElement
          :amount="Math.round(amount * 100)"
          :citizenId="props.citizenId"
          :clientSecret="props.clientSecret"
          :invoiceId="props.invoiceStripeId"
          :metadata="props.metadata"
          @payment-success="handlePaymentSuccess"
          @payment-error="handlePaymentError"
        />

        <p class="disclaimer">
          Your payment information is securely processed by Stripe. We never store your card details.
        </p>
      </template>

      <template v-else>
        <div class="invoice-view">
          <div v-if="loadingInvoice" class="invoice-loading">Loading invoice details...</div>

          <div v-else-if="invoiceError" class="invoice-error">{{ invoiceError }}</div>

          <div v-else class="invoice-details">
            <div class="summary-row" v-if="resolvedInvoiceId">
              <span>Invoice ID:</span>
              <strong>{{ resolvedInvoiceId }}</strong>
            </div>
            <div class="summary-row" v-if="invoiceDetails?.status">
              <span>Status:</span>
              <strong>{{ invoiceDetails.status }}</strong>
            </div>
            <div class="summary-row total">
              <span>Total Paid:</span>
              <strong>{{ formatAmount((invoiceDetails?.amount ?? amount) / 100) }} DKK</strong>
            </div>

            <table class="invoice-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!invoiceDetails?.items?.length">
                  <td>{{ props.itemDescription || 'Storage upgrade' }}</td>
                  <td>1</td>
                  <td>{{ formatAmount(amount) }} DKK</td>
                </tr>
                <tr v-for="item in invoiceDetails?.items || []" :key="item.id">
                  <td>{{ item.description }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>{{ formatAmount(item.amount / 100) }} DKK</td>
                </tr>
              </tbody>
            </table>

            <div class="invoice-actions">
              <button
                class="download-btn"
                @click="downloadPdf"
                :disabled="loadingPdf || !resolvedInvoiceId"
              >
                <span v-if="!loadingPdf">Download invoice PDF</span>
                <span v-else>Downloading...</span>
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import StripeCardElement from './StripeCardElement.vue';
import stripeApi from '@/components/api/stripeApi';

interface Props {
  isOpen: boolean;
  amount: number;
  invoiceId?: string;
  invoiceStripeId?: string;
  itemDescription?: string;
  citizenId: string;
  clientSecret: string;
  metadata?: Record<string, string | number | boolean | null>;
}

interface Emits {
  close: [];
  paymentSuccess: [payload: { paymentIntentId: string; invoiceId?: string }];
  paymentError: [error: string];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const runtimeConfig = useRuntimeConfig();

const isInvoiceView = ref(false);
const loadingInvoice = ref(false);
const loadingPdf = ref(false);
const invoiceError = ref('');
const resolvedInvoiceId = ref('');
const invoiceDetails = ref<null | {
  id: string;
  amount: number;
  status: string;
  items: Array<{ id: string; description: string; quantity: number; amount: number }>;
}>(null);

const authHeader = computed(() => `Bearer ${localStorage.getItem('_token') || ''}`);

const handlePaymentSuccess = async (payload: { paymentIntentId: string; invoiceId?: string }) => {
  emit('paymentSuccess', payload);
  isInvoiceView.value = true;
  resolvedInvoiceId.value = payload.invoiceId || props.invoiceStripeId || '';
  await loadInvoiceDetails();
};

const handlePaymentError = (error: string) => {
  emit('paymentError', error);
};

const closeModal = () => {
  emit('close');
};

async function loadInvoiceDetails() {
  if (!resolvedInvoiceId.value) {
    invoiceDetails.value = null;
    invoiceError.value = 'Payment is completed. Invoice ID is not available yet.';
    return;
  }

  try {
    loadingInvoice.value = true;
    invoiceError.value = '';
    const response = await stripeApi.getStripeInvoice(resolvedInvoiceId.value);

    invoiceDetails.value = {
      id: response?.invoice_id || resolvedInvoiceId.value,
      amount: response?.total ?? response?.amount_due ?? Math.round(props.amount * 100),
      status: response?.status ?? 'paid',
      items:
        response?.lines?.map((line: any) => ({
          id: line.id,
          description: line.description,
          quantity: line.quantity ?? 1,
          amount: line.amount ?? 0,
        })) ?? [],
    };
  } catch (error: any) {
    invoiceError.value = error?.message || 'Failed to load invoice details.';
  } finally {
    loadingInvoice.value = false;
  }
}

async function downloadPdf() {
  if (!resolvedInvoiceId.value) {
    return;
  }

  try {
    loadingPdf.value = true;

    const response = await fetch(`${runtimeConfig.public.apiBaseURL}/stripe/invoices/${resolvedInvoiceId.value}/pdf`, {
      method: 'GET',
      headers: {
        Authorization: authHeader.value,
        Accept: 'application/pdf',
      },
    });

    if (!response.ok) {
      throw new Error('Unable to download PDF.');
    }

    const blob = await response.blob();
    const fileURL = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = fileURL;
    link.download = `invoice_${resolvedInvoiceId.value}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(fileURL);
  } catch (error: any) {
    invoiceError.value = error?.message || 'Failed to download invoice PDF.';
  } finally {
    loadingPdf.value = false;
  }
}

// Format amount as currency
function formatAmount(amount: number): string {
  return new Intl.NumberFormat('da-DK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Prevent body scroll when modal is open
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      isInvoiceView.value = false;
      loadingInvoice.value = false;
      loadingPdf.value = false;
      invoiceError.value = '';
      resolvedInvoiceId.value = '';
      invoiceDetails.value = null;
    } else {
      document.body.style.overflow = '';
    }
  }
);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Modal Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.close-btn:hover {
  background-color: #f3f4f6;
  color: #1f2937;
}

/* Invoice Summary */
.invoice-summary {
  padding: 16px 24px;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  padding: 8px 0;
}

.summary-row span {
  color: #6b7280;
}

.summary-row strong {
  color: #1f2937;
  font-weight: 600;
}

.summary-row.total {
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
  margin-top: 8px;
  font-size: 16px;
}

.summary-row.total strong {
  font-size: 18px;
  color: #2563eb;
}

/* Payment Form (StripeCardElement) */
:deep(.stripe-payment-form) {
  margin: 0;
  padding: 24px;
  max-width: none;
}

/* Disclaimer */
.disclaimer {
  font-size: 12px;
  color: #9ca3af;
  text-align: center;
  padding: 16px 24px;
  margin: 0;
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.invoice-view {
  padding: 24px;
}

.invoice-loading,
.invoice-error {
  font-size: 14px;
  color: #6b7280;
}

.invoice-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
}

.invoice-table th,
.invoice-table td {
  border: 1px solid #e5e7eb;
  padding: 8px;
  text-align: left;
  font-size: 13px;
}

.invoice-actions {
  margin-top: 16px;
}

.download-btn {
  padding: 10px 16px;
  border: 1px solid #d1d5db;
  background-color: #f3f4f6;
  color: #1f2937;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.download-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 640px) {
  .modal-overlay {
    padding: 0;
  }

  .modal-content {
    max-width: 100%;
    border-radius: 12px 12px 0 0;
    max-height: 100vh;
  }
}
</style>
