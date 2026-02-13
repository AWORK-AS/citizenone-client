<template>
  <InvoiceStripe />
</template>

<script setup lang="ts">
import InvoiceStripe from '@/components/stripe/InvoiceStripe.vue';

definePageMeta({
  layout: 'superadmin', // Change to your desired layout if needed
});
</script>
