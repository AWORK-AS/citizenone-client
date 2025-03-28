<template>
    <div class="bg-white shadow-md rounded-md p-4 border-l-4 border-secondary">
        <div class="flex items-center gap-x-1">
            <h3 class="text-primary text-sm font-medium py-2">
                {{ props.title }}
            </h3>
            <button class="text-xxs text-primary hover:text-primary-700 hover:underline"
                @click="state.modal.isFilterDateOpen = true">
                ({{ formatDateToReadable(props?.revenueData?.formDateRange?.start_date) }} -
                {{ formatDateToReadable(props?.revenueData?.formDateRange?.end_date) }})
            </button>
        </div>
        <div class="flex items-end gap-x-1">
            <p class="text-xl font-semibold">
                {{ formatAmount(props.revenueData.amount) }}
            </p>
            <p class="lowercase text-xs py-1">
                {{ $t('excludeVat') }}
            </p>
        </div>
        <ModulesSuperadminDashboardModalRevenueDateRange :isModalOpen="state.modal.isFilterDateOpen"
            :revenueData="props.revenueData" @close="state.modal.isFilterDateOpen = false" @filterDate="filterDate" />
    </div>
</template>

<script setup lang="ts">
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'

const props = defineProps({
    title: String,
    revenueData: {
        type: Object,
        required: true,
    }
})
const { formatAmount } = useAmountFormatter()
const { formatDateToReadable } = useDatetimeFormatter()
const emit = defineEmits(['filterDate'])

const state = reactive({
    modal: {
        isFilterDateOpen: false,
    },
})

function filterDate(formDateRange: any) {
    emit('filterDate', formDateRange)
}
</script>