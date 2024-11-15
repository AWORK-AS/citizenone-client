<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <h3 class="text-primary text-base font-medium py-2">
            {{ $t('dailyOverview.citizensDiagnoses') }}
        </h3>
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />

        <div class="bg-white shadow-md rounded-md border-l-8 border-secondary flex items-center justify-center min-h-40 max-h-40 text-sm mt-2"
            v-if="state.citizensDiagnoses?.data?.length === 0">
            {{ $t('dailyOverview.noDataToDisplay') }}
        </div>
        <div class="bg-white shadow-md rounded-md border-l-8 border-secondary mt-2 text-sm space-y-2 divide-y overflow-scroll min-h-40 max-h-40 pr-5 pt-1 pb-1 pl-6 mr-1"
            v-else>
            <div v-for="(citizen, index) in state.citizensDiagnoses?.data" :key="index" class="py-3">
                {{ citizen?.firstname + ' ' + citizen?.lastname }}
                <div class="flex items-center gap-x-1 text-xs text-muted-400 mt-1">
                    <div class="text-xxs flex flex-wrap gap-2" v-if="citizen.diagnoses?.length > 0">
                        <span v-for="(diagnosis, index) in citizen.diagnoses" :key=index
                            class="bg-primary p-1 text-white rounded-md">
                            {{ diagnosis?.name }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { dailyOverviewService } from '@/components/api/DailyOverviewService'
import type { Error } from '@/types'

const state = reactive({
    citizensDiagnoses: [] as any,
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
        const response = await dailyOverviewService.getCitizensDiagnoses()
        if (response) {
            state.citizensDiagnoses = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>