<template>
    <div class="bg-white shadow-md rounded-md p-4 border-l-4 border-secondary">
        <h3 class="text-primary text-sm font-medium py-2">
            {{ props.title }}
        </h3>
        <p class="text-xl font-semibold">{{ formatAmount(props.revenueData.amount) }}</p>
    </div>
</template>

<script setup lang="ts">
import { useAmountFormatter } from '@/composables/amountFormatter'

const props = defineProps({
    title: String,
    revenueData: {
        type: Object,
        required: true,
    }
})
const { formatAmount } = useAmountFormatter()
</script>