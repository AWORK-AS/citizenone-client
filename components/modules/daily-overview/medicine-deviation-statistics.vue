<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <h3 class="text-primary text-base font-medium py-2">
            {{ $t('dailyOverview.medicineDeviationStatistics.medicineDeviationStatistics') }}
        </h3>
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <div
            class="bg-white shadow-md rounded-md border-l-8 border-secondary mt-2 text-sm space-y-2 pr-5 pt-5 pb-5 pl-6 mr-1">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-x-2">
                    <div class="w-2.5 h-2.5 bg-yellow-500 rounded-sm"></div>
                    <p class="text-sm">
                        {{ $t('dailyOverview.medicineDeviationStatistics.deviated') }}
                    </p>
                </div>
                <p class="text-sm">
                    {{ state.citizenMedicineDeviationStatistics?.data?.Deviated ?? 0 }}
                </p>
            </div>
        </div>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { dailyOverviewService } from '@/components/api/DailyOverviewService'
import type { Error } from '@/types'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useDepartmentStore } from '@/store/department'

const departmentStore = useDepartmentStore()

const customPagesStore = useCustomPagesStore() as any

const state = reactive({
    citizenMedicineDeviationStatistics: [] as any,
    isPageLoading: false,
    error: {} as Error,
})

onMounted(() => {
    fetchMedicineDeviationStatistics()
})

watch(() => departmentStore.getSelectedDepartmentName, (newValue: any) => {
    if (newValue != null) {
        fetchMedicineDeviationStatistics()
    }
})

async function fetchMedicineDeviationStatistics() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params: any = {
            department: departmentStore.getSelectedDepartmentName
        }

        const response = await dailyOverviewService.getMedicineDeviationStatistics(params)
        if (response) {
            state.citizenMedicineDeviationStatistics = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>