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

// Consider any id that is not a UUID as a potential Stripe resource id or formatted number.
// The backend resolves formatted numbers (e.g. RPRQMMVS-0015) via Stripe search.
const isStripeInvoice = computed(() => {
  const id = invoiceId.value || '';
  // UUIDs are only 36-char hex with dashes; anything else goes to Stripe
  return !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
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
      // Fetch Stripe invoice using authenticated API call.
      // The backend resolves both raw Stripe IDs (in_/pi_/cs_) and
      // formatted invoice numbers (e.g. RPRQMMVS-0015).
      invoiceData.value = await stripeApi.getStripeInvoice(invoiceId.value);
    } else {
      navigateTo(`/invoices/${invoiceId.value}/invoice-details`)
      return
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
