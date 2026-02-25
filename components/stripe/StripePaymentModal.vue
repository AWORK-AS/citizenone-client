<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <!-- Modal Header -->
      <div class="modal-header">
        <h2>Complete Payment</h2>
        <button
          @click="closeModal"
          class="close-btn"
          aria-label="Close modal"
        >
          ✕
        </button>
      </div>

      <!-- Invoice Summary -->
      <div class="invoice-summary">
        <div v-if="invoiceId" class="summary-row">
          <span>Invoice ID:</span>
          <strong>{{ invoiceId }}</strong>
        </div>
        <div class="summary-row total">
          <span>Amount Due:</span>
          <strong>{{ formatAmount(amount) }} DKK</strong>
        </div>
      </div>

      <!-- Payment Form -->
      <StripeCardElement
        :amount="Math.round(amount * 100)"
        :citizenId="props.citizenId"
        :metadata="props.metadata"
        @payment-success="handlePaymentSuccess"
        @payment-error="handlePaymentError"
      />

      <!-- Disclaimer -->
      <p class="disclaimer">
        Your payment information is securely processed by Stripe. We never store your card details.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import StripeCardElement from './StripeCardElement.vue';

interface Props {
  isOpen: boolean;
  amount: number;
  invoiceId?: string;
  citizenId: string;
  metadata?: Record<string, string | number | boolean | null>;
}

interface Emits {
  close: [];
  paymentSuccess: [];
  paymentError: [error: string];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const handlePaymentSuccess = () => {
  emit('paymentSuccess');
  // Auto-close after success
  setTimeout(() => {
    emit('close');
  }, 2000);
};

const handlePaymentError = (error: string) => {
  emit('paymentError', error);
};

const closeModal = () => {
  emit('close');
};

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
