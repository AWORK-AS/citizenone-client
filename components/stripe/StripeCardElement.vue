<template>
  <div class="stripe-payment-form">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Initializing payment form...</p>
    </div>

    <!-- Payment Form -->
    <form v-show="!loading && !successMessage" @submit.prevent="handleSubmit" class="payment-form">
      <!-- Amount Display -->
      <div class="amount-display">
        <label>Amount to pay:</label>
        <p class="amount">{{ formatAmount(amount) }} DKK</p>
      </div>

      <!-- Full Name Input -->
      <div class="form-group">
        <label for="full-name">Full Name</label>
        <input
          id="full-name"
          v-model="form.fullName"
          type="text"
          placeholder="Your full name"
          required
          class="form-input"
        />
      </div>

      <!-- Email Input -->
      <div class="form-group">
        <label for="email">Email</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          placeholder="Your email address"
          required
          class="form-input"
        />
      </div>

      <!-- Card Element Container -->
      <div class="form-group">
        <label for="card-element">Card Details</label>
        <div id="card-element" class="card-element"></div>
        <div v-if="cardError" class="error-message card-error">
          {{ cardError }}
        </div>
      </div>

      <!-- Citizen ID Display (Reference) -->
      <div class="form-group info-group">
        <small class="text-muted">Citizen ID: {{ citizenId }}</small>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="!cardReady || processing || !form.fullName || !form.email"
        class="submit-button"
        :class="{ 'is-loading': processing }"
      >
        <span v-if="!processing">Pay {{ formatAmount(amount) }} DKK</span>
        <span v-else>Processing payment...</span>
      </button>

      <!-- Validation Errors -->
      <div v-if="errorMessage" class="error-message">
        <strong>Error:</strong> {{ errorMessage }}
      </div>
    </form>

    <!-- Success State -->
    <div v-if="successMessage" class="success-state">
      <div class="success-icon">✓</div>
      <h3>Payment Successful</h3>
      <p>{{ successMessage }}</p>
      <button @click="resetForm" class="reset-button">
        Start Over
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { getStripe } from '@/services/stripePaymentService';
import stripeApi from '@/components/api/stripeApi';
import type { Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';

interface Props {
  amount: number;
  citizenId: string;
  invoiceId?: string;
  userName?: string; // User's full name for auto-fill
  userEmail?: string; // User's email for auto-fill
  itemDescription?: string; // Item description for invoice
  metadata?: Record<string, string | number | boolean | null>;
  dealUuid?: string;
  paymentType?: string;
}

interface Emits {
  paymentSuccess: [{ 
    paymentIntentId: string; 
    invoiceId?: string; 
    billingDetails?: { name: string; email: string };
  }];
  paymentError: [error: string];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

let stripe: Stripe | null = null;
let elements: StripeElements | null = null;
let cardElement: StripeCardElement | null = null;

const loading = ref(true);
const processing = ref(false);
const cardReady = ref(false);
const cardError = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const clientSecret = ref<string | null>(null);
const form = ref({
  fullName: props.userName || '',
  email: props.userEmail || '',
});

// Initialize Stripe and Elements
onMounted(async () => {
  try {
    // First, fetch clientSecret from backend
    console.log('Fetching clientSecret with amount:', props.amount, 'citizenId:', props.citizenId, 'dealUuid:', props.dealUuid, 'paymentType:', props.paymentType);
    const response = await stripeApi.createPaymentIntent(props.amount, props.citizenId, props.dealUuid, props.paymentType, props.metadata);
    
    if (!response.client_secret) {
      throw new Error('Failed to retrieve client secret from server');
    }
    
    clientSecret.value = response.client_secret;
    console.log('ClientSecret retrieved:', clientSecret.value);

    stripe = await getStripe();
    
    if (!stripe) {
      throw new Error('Failed to initialize Stripe. Please check your Stripe publishable key.');
    }

    elements = stripe.elements();
    cardElement = elements.create('card', {
      hidePostalCode: true,
      style: {
        base: {
          fontSize: '16px',
          color: '#424770',
          '::placeholder': {
            color: '#9ca3af',
          },
        },
        invalid: {
          color: '#9e2146',
        },
      },
    });

    cardElement.mount('#card-element');

    // Listen to card changes
    cardElement.on('change', (event) => {
      cardReady.value = event.complete;
      cardError.value = event.error?.message || '';
    });

    loading.value = false;
  } catch (error) {
    console.error('Failed to initialize Stripe:', error);
    errorMessage.value = error instanceof Error ? error.message : 'Failed to initialize payment form';
    loading.value = false;
  }
});

// Cleanup on unmount
onUnmounted(() => {
  if (cardElement) {
    cardElement.unmount();
  }
});

// Handle form submission
async function handleSubmit() {
  if (!stripe || !elements || !cardElement || !cardReady.value) {
    errorMessage.value = 'Payment form is not ready. Please try again.';
    return;
  }

  if (!form.value.fullName || !form.value.email) {
    errorMessage.value = 'Please fill in all required fields.';
    return;
  }

  if (!clientSecret.value) {
    errorMessage.value = 'Payment initialization failed. Please reload and try again.';
    console.error('ClientSecret is missing:', clientSecret.value);
    return;
  }

  processing.value = true;
  errorMessage.value = '';

  try {
    console.log('Confirming payment with clientSecret:', clientSecret.value);
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret.value, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: form.value.fullName,
          email: form.value.email,
        },
      },
    });

    if (!error && paymentIntent) {
      successMessage.value = `Payment of ${formatAmount(props.amount)} DKK completed successfully!`;
      cardElement.clear();
      
      // Store payment metadata in sessionStorage for later retrieval
      if (props.metadata && paymentIntent.id) {
        try {
          sessionStorage.setItem(`stripe_payment_${paymentIntent.id}`, JSON.stringify({
            metadata: props.metadata,
            timestamp: Date.now(),
          }));
          console.log('📝 Stored payment metadata for', paymentIntent.id, props.metadata);
        } catch (e) {
          console.warn('Failed to store payment metadata:', e);
        }
      }
      
      emit('paymentSuccess', {
        paymentIntentId: paymentIntent.id,
        invoiceId: props.invoiceId,
        billingDetails: {
          name: form.value.fullName,
          email: form.value.email,
        },
      });
    } else {
      errorMessage.value = error?.message || 'Payment failed. Please try again.';
      emit('paymentError', error?.message || 'Unknown error');
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    errorMessage.value = message;
    emit('paymentError', message);
    console.error('Payment error:', error);
  } finally {
    processing.value = false;
  }
}

// Reset form for new payment
function resetForm() {
  successMessage.value = '';
  errorMessage.value = '';
  cardError.value = '';
  cardReady.value = false;

  if (cardElement) {
    cardElement.clear();
  }
}

// Format amount as currency
function formatAmount(amount: number): string {
  return new Intl.NumberFormat('da-DK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount / 100);
}
</script>

<style scoped>
.stripe-payment-form {
  max-width: 500px;
  margin: 0 auto;
  padding: 24px;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 40px 20px;
}

.spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
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

/* Payment Form */
.payment-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
}

/* Amount Display */
.amount-display {
  background-color: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.amount-display label {
  margin-bottom: 4px;
}

.amount {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

/* Card Element */
.card-element {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 12px;
  min-height: 44px;
  background-color: white;
  transition: border-color 0.2s;
}

.card-element:focus {
  border-color: #3b82f6;
  outline: none;
}

/* Card Error */
.card-error {
  margin-top: 4px;
  font-size: 13px;
}

/* Info Group */
.info-group {
  padding: 8px 0;
}

.text-muted {
  color: #9ca3af;
  font-size: 12px;
}

/* Submit Button */
.submit-button {
  padding: 12px 16px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-button:hover:not(:disabled) {
  background-color: #2563eb;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.submit-button:disabled {
  background-color: #d1d5db;
  cursor: not-allowed;
  opacity: 0.6;
}

.submit-button.is-loading {
  opacity: 0.8;
}

/* Error Message */
.error-message {
  padding: 12px;
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
  border-radius: 6px;
  font-size: 14px;
}

.error-message strong {
  font-weight: 600;
}

/* Success State */
.success-state {
  text-align: center;
  padding: 40px 20px;
}

.success-icon {
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

.success-state h3 {
  color: #1f2937;
  font-size: 20px;
  margin: 0 0 8px 0;
}

.success-state p {
  color: #6b7280;
  margin: 0 0 20px 0;
}

.reset-button {
  padding: 10px 20px;
  background-color: #f3f4f6;
  color: #1f2937;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-button:hover {
  background-color: #e5e7eb;
}

/* Form Input */
.form-input {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input::placeholder {
  color: #9ca3af;
}

</style>
