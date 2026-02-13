<template>
  <button
    @click="openPaymentModal"
    :disabled="disabled || disabled"
    class="stripe-checkout-btn"
    :class="[variant, { 'is-loading': isLoading }]"
  >
    <span v-if="!isLoading">{{ buttonText }}</span>
    <span v-else>Processing...</span>
  </button>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  amount: number;
  invoiceId: string;
  citizenId: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  buttonText?: string;
}

interface Emits {
  paymentInitiated: [];
  paymentSuccess: [];
  paymentError: [error: string];
  closeModal: [];
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  variant: 'primary',
  buttonText: 'Pay Invoice'
});

const emit = defineEmits<Emits>();

const isLoading = ref(false);

const openPaymentModal = () => {
  isLoading.value = true;
  emit('paymentInitiated');
  // Modal will be controlled by parent component
};

const handlePaymentSuccess = () => {
  isLoading.value = false;
  emit('paymentSuccess');
};

const handlePaymentError = (error: string) => {
  isLoading.value = false;
  emit('paymentError', error);
};

defineExpose({
  handlePaymentSuccess,
  handlePaymentError
});
</script>

<style scoped>
.stripe-checkout-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

/* Primary Variant */
.stripe-checkout-btn.primary {
  background-color: #3b82f6;
  color: white;
}

.stripe-checkout-btn.primary:hover:not(:disabled) {
  background-color: #2563eb;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* Secondary Variant */
.stripe-checkout-btn.secondary {
  background-color: #f3f4f6;
  color: #1f2937;
  border: 1px solid #d1d5db;
}

.stripe-checkout-btn.secondary:hover:not(:disabled) {
  background-color: #e5e7eb;
}

/* Danger Variant */
.stripe-checkout-btn.danger {
  background-color: #ef4444;
  color: white;
}

.stripe-checkout-btn.danger:hover:not(:disabled) {
  background-color: #dc2626;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

/* Disabled State */
.stripe-checkout-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Loading State */
.stripe-checkout-btn.is-loading {
  opacity: 0.8;
}
</style>
