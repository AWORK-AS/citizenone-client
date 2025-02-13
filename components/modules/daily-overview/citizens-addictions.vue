<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <h3 class="text-primary text-base font-medium py-2">
            {{ $t('dailyOverview.citizensAddictions') }}
        </h3>
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />

        <div class="border-2 border-gray-300 border-dashed rounded-md flex items-center justify-center min-h-40 max-h-40 text-sm mt-2 z-20"
            v-if="state.citizensAddictions?.data?.length === 0">
            {{ $t('dailyOverview.noDataToDisplay') }}
        </div>
        <div class="bg-white shadow-md rounded-md border-l-8 border-secondary mt-2 text-sm space-y-2 divide-y overflow-scroll min-h-40 max-h-40 pr-5 pt-1 pb-1 pl-6 mr-1"
            v-else>
            <div v-for="(citizen, index) in state.citizensAddictions?.data" :key="index" class="py-3">
                {{ citizen?.firstname + ' ' + citizen?.lastname }}
                <div class="flex items-center gap-x-1 text-xs text-muted-400 mt-1">
                    <div class="text-xxs flex flex-wrap gap-2" v-if="citizen.addictions?.length > 0">
                        <span v-for="(addiction, index) in citizen.addictions" :key=index
                            class="bg-primary p-1 text-white rounded-md">
                            {{ addiction?.name }}
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
    citizensAddictions: [] as any,
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
        const response = await dailyOverviewService.getCitizensAddictions()
        if (response) {
            state.citizensAddictions = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>