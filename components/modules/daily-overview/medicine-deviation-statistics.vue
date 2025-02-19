<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <h3 class="text-primary text-base font-medium py-2">
            {{ 'Medicine history' }}
        </h3>
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />

        <div
            class="bg-white shadow-md rounded-md border-l-8 border-secondary mt-2 text-sm space-y-2 pr-5 pt-5 pb-5 pl-6 mr-1">
            <div class="space-y-1">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-x-2">
                        <div class="w-2.5 h-2.5 bg-primary rounded-sm"></div>
                        <p class="text-sm">
                            {{ $t('Delivered') }}
                        </p>
                    </div>
                    <p class="text-sm">
                        {{ state.citizenMedicineDeviationStatistics.Delivered }}
                    </p>
                </div>
            </div>
        </div>
        <div
            class="bg-white shadow-md rounded-md border-l-8 border-secondary mt-2 text-sm space-y-2 pr-5 pt-5 pb-5 pl-6 mr-1">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-x-2">
                    <div class="w-2.5 h-2.5 bg-yellow-500 rounded-sm"></div>
                    <p class="text-sm">
                        {{ $t('Deviated') }}
                    </p>
                </div>
                <p class="text-sm">
                    {{ state.citizenMedicineDeviationStatistics.Deviated }}
                </p>
            </div>
        </div>
        <div
            class="bg-white shadow-md rounded-md border-l-8 border-secondary mt-2 text-sm space-y-2 pr-5 pt-5 pb-5 pl-6 mr-1">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-x-2">
                    <div class="w-2.5 h-2.5 bg-green-700 rounded-sm"></div>
                    <p class="text-sm">
                        {{ $t('Given') }}
                    </p>
                </div>
                <p class="text-sm">
                    {{ state.citizenMedicineDeviationStatistics.Given }}
                </p>
            </div>
        </div>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { dailyOverviewService } from '@/components/api/DailyOverviewService'
import type { Error } from '@/types'
import { useCustomPagesStore } from '@/store/custom-pages'

const customPagesStore = useCustomPagesStore() as any

const state = reactive({
    citizenMedicineDeviationStatistics: [] as any,
    isPageLoading: false,
    error: {} as Error,
})

onMounted(() => {
    fetchCitizensAdmissionDischarged()
})

async function fetchCitizensAdmissionDischarged() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await dailyOverviewService.getMedicineDeviationStatistics()
        if (response) {
            state.citizenMedicineDeviationStatistics = response
            console.log(response)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>