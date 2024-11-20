<template>
    <div class="bg-white shadow-md rounded-md py-4 pl-4 pr-1 border-l-4 border-secondary">
        <div class="flex items-center justify-between pr-2">
            <h3 class="text-primary text-sm font-medium py-2">
                {{ props.title }}
            </h3>
            <button class="text-xs text-primary hover:text-primary-700"
                @click="navigateTo('/superadmin/dashboard/company-storage')">
                {{ $t('superadmin.dashboard.viewAll') }}
            </button>
        </div>
        <div class="mt-2 space-y-2 overflow-scroll max-h-28">
            <div v-for="(company, index) in props.companies" :key="index" class="flex justify-between items-center">
                <div>
                    <p class="text-sm font-semibold">{{ company.name }}</p>
                    <p class="text-xs" :class="company?.storage_paid > 0 ? 'text-green-600' : 'text-red-600'">
                        {{ $t('superadmin.dashboard.companyStorage.storagePaid') }}:
                        {{ formatAmount(company?.storage_paid) }}
                    </p>
                    <p class="text-xs" :class="company?.storage_used > 0 ? 'text-green-600' : 'text-red-600'">
                        {{ $t('superadmin.dashboard.companyStorage.storageUsed') }}:
                        {{ company?.storage_used }}
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useAmountFormatter } from '@/composables/amountFormatter'

const props = defineProps({
    title: String,
    companies: {
        type: Array,
        required: true
    } as any
})
const { formatAmount } = useAmountFormatter()
</script>