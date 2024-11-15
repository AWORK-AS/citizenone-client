<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <h3 class="text-primary text-base font-medium py-2">
            {{ $t('dailyOverview.riskAssessment.riskAssessment') }}
        </h3>
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />

        <div
            class="bg-white shadow-md rounded-md border-l-8 border-secondary mt-2 text-sm space-y-2 pr-5 pt-5 pb-5 pl-6 mr-1">
            <div class="space-y-1">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-x-2">
                        <div class="w-2.5 h-2.5 bg-green-700 rounded-sm"></div>
                        <p class="text-sm">
                            {{ $t('dailyOverview.riskAssessment.risk.noRisk') }}
                        </p>
                    </div>
                    <p class="text-sm">
                        {{ state.citizensRiskAssessment?.data?.no_risk }}
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
                        {{ $t('dailyOverview.riskAssessment.risk.increasedRisk') }}
                    </p>
                </div>
                <p class="text-sm">
                    {{ state.citizensRiskAssessment?.data?.increased_risk }}
                </p>
            </div>
        </div>
        <div
            class="bg-white shadow-md rounded-md border-l-8 border-secondary mt-2 text-sm space-y-2 pr-5 pt-5 pb-5 pl-6 mr-1">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-x-2">
                    <div class="w-2.5 h-2.5 bg-red-600 rounded-sm"></div>
                    <p class="text-sm">
                        {{ $t('dailyOverview.riskAssessment.risk.acuteIncreasedRisk') }}
                    </p>
                </div>
                <p class="text-sm">
                    {{ state.citizensRiskAssessment?.data?.acute_increased_risk }}
                </p>
            </div>
        </div>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { dailyOverviewService } from '@/components/api/DailyOverviewService'
import type { Error } from '@/types'

const state = reactive({
    citizensRiskAssessment: [] as any,
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
        const response = await dailyOverviewService.getCitizensRiskAssessment()
        if (response) {
            state.citizensRiskAssessment = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>