<template>
  <div class="invoice-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading invoice...</p>
    </div>

    <!-- Error State -->
    <div v-if="error && !loading" class="error-alert">
      <div class="error-content">
        <strong>Error:</strong> {{ error }}
      </div>
      <button @click="retryLoadInvoice" class="retry-btn">Try Again</button>
    </div>

    <!-- Success State: Display Invoice -->
    <div v-if="!loading && !error && invoiceData" class="invoice-content">
      <InvoiceStripe :invoice-data="invoiceData" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import InvoiceStripe from '@/components/stripe/InvoiceStripe.vue';
import stripeApi from '@/components/api/stripeApi';

definePageMeta({
  layout: 'user',
});


const route = useRoute();
const loading = ref(true);
const error = ref('');
const invoiceData = ref(null);

const invoiceId = computed(() => route.params.id as string);
const connectedAccountId = computed(() => {
  const value = route.query.accountId;
  const firstValue = Array.isArray(value) ? value[0] : value;
  return typeof firstValue === 'string' && /^acct_/.test(firstValue) ? firstValue : null;
});

// Stripe API calls must use Stripe resource IDs only.
const isStripeInvoice = computed(() => {
  const id = invoiceId.value || '';
  return /^(in_|pi_|cs_)/.test(id);
});

const isRegularInvoiceUuid = computed(() => {
  const id = invoiceId.value || '';
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
});

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

    if (isStripeInvoice.value) {
      // Fetch Stripe invoice only by Stripe resource ID.
      invoiceData.value = await stripeApi.getStripeInvoice(invoiceId.value, connectedAccountId.value);
    } else if (isRegularInvoiceUuid.value) {
      navigateTo(`/invoices/${invoiceId.value}/invoice-details`)
      return
    } else {
      throw new Error('Invalid invoice link. Stripe invoices must use in_/pi_/cs_ IDs.');
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load invoice';
    console.error('Error loading invoice:', err);
  } finally {
    loading.value = false;
  }
}

function retryLoadInvoice() {
  loadInvoice();
}
</script>

<style scoped>
.invoice-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
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

/* Error State */
.error-alert {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.error-content {
  flex: 1;
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
  white-space: nowrap;
}

.retry-btn:hover {
  background-color: #7f1d1d;
}

/* Invoice Content */
.invoice-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>
