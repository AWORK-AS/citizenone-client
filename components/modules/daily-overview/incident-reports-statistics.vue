<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <h3 class="text-primary text-base font-medium py-2">
            {{ $t('Incident statistics') }}
        </h3>
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />

        <div
            class="bg-white shadow-md rounded-md border-l-8 border-secondary mt-2 text-sm space-y-2 pr-5 pt-6 pb-6 pl-6 mr-1">
            <div class="space-y-1">
                <div v-for="(count, risk_level) in state.citizen_incidents_statistics" :key="risk_level"
                    class="flex items-center space-x-4">
                    <p class="w-1/4 text-sm text-left">
                        <span v-if="risk_level.toString() === 'harmless'">Harmless</span>
                        <span v-if="risk_level.toString() === 'low_risk'">Low risk</span>
                        <span v-if="risk_level.toString() === 'moderate_risk'">Moderate risk</span>
                        <span v-if="risk_level.toString() === 'high_risk'">High risk</span>
                    </p>
                    <div class="flex-1">
                        <div class="h-2 bg-gray-300 rounded-full relative">
                            <div class="h-2 bg-primary rounded-full absolute top-0 left-0" :style="{
                                width: getPercentage(state.citizen_incidents_statistics[risk_level]) + '%',
                                backgroundColor: getBarColor(risk_level)
                            }">
                            </div>
                        </div>
                    </div>
                    <span class="w-6 text-sm">{{ state.citizen_incidents_statistics[risk_level] }}</span>
                </div>
            </div>

        </div>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { dailyOverviewService } from '@/components/api/DailyOverviewService'
import type { Error } from '@/types'

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    citizen_incidents_statistics: [] as any,
})

onMounted(() => {
    fetchIncidentReportStatistics()
})

async function fetchIncidentReportStatistics() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await dailyOverviewService.getIncidentsStatistics()
        if (response) {
            state.citizen_incidents_statistics = response
            console.log(state.citizen_incidents_statistics)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

const getPercentage = (count: string): string => {
    // Explicitly typecast the values as an array of strings
    const total = (Object.values(state.citizen_incidents_statistics || {}) as string[])
        .reduce((acc: number, val: string) => acc + parseInt(val, 10), 0)

    // Avoid division by zero
    if (total === 0) {
        return "0"
    }

    // Calculate percentage and return it as a string with two decimal points
    return ((parseInt(count, 10) / total) * 100).toFixed(2)
}

const getBarColor = (risk_level: any) => {
    switch (risk_level) {
        case 'harmless':
            return 'rgb(32 94 119 / var(--tw-bg-opacity))'
        case 'low_risk':
            return 'rgb(234 179 8 / var(--tw-bg-opacity))'
        case 'moderate_risk':
            return 'rgb(249 115 22 / var(--tw-bg-opacity))'
        case 'high_risk':
            return 'rgb(153 27 27 / var(--tw-bg-opacity))'
        default:
            return 'rgb(169, 169, 169)'
    }
}
</script>