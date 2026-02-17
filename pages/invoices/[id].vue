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
import { invoiceService } from '@/components/api/superadmin/InvoiceService';

definePageMeta({
  layout: 'superadmin',
});


const route = useRoute();
const loading = ref(true);
const error = ref('');
const invoiceData = ref(null);

const invoiceId = computed(() => route.params.id as string);

// Check if it's a Stripe invoice ID (starts with 'in_')
const isStripeInvoice = computed(() => invoiceId.value?.startsWith('in_'));

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
    console.log('Loading invoice with ID:', invoiceId.value, 'Is Stripe Invoice:', isStripeInvoice.value);

    if (isStripeInvoice.value) {
      // Fetch Stripe invoice directly
      //invoiceData.value = await stripeApi.getStripeInvoice(invoiceId.value);
      const res = await fetch(`http://127.0.0.1:8000/api/stripe/invoices/${invoiceId.value}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch Stripe invoice: ${res.statusText}`);
      }
      const data = await res.json();
      invoiceData.value = data; // Assuming the API returns { invoice: { ... }
      console.log('Fetched Stripe invoice data:', invoiceData.value);
    } else {
      // Fetch regular invoice from backend
      invoiceData.value = await invoiceService.getInvoiceDetails(invoiceId.value);
      console.log('Fetched regular invoice data:', invoiceData.value);
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
