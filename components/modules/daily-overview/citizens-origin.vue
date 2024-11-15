<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <h3 class="text-primary text-base font-medium py-2">
            {{ $t('dailyOverview.citizensOrigin') }}
        </h3>
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />

        <div class="bg-white shadow-md rounded-md border-l-8 border-secondary flex items-center justify-center min-h-96 max-h-96 text-sm mt-2"
            v-if="state.citizensOrigin?.data?.length === 0">
            {{ $t('dailyOverview.noDataToDisplay') }}
        </div>
        <div class="bg-white shadow-md rounded-md border-l-8 border-secondary mt-2 text-sm space-y-2 divide-y overflow-scroll min-h-96 max-h-96 pr-5 pt-4 pb-4 pl-6 mr-1"
            v-else>
            <div v-for="(citizen, index) in state.citizensOrigin?.data" :key="index" class="py-3">
                <div class="flex items-center justify-between gap-x-3">
                    <Badge type="primary" class="w-fit">
                        <p class="text-xs px-2">
                            {{ citizen?.firstname + ' ' + citizen?.lastname }}
                        </p>
                    </Badge>
                    <div class="flex items-center gap-x-1 text-xs text-muted-400 mt-1">
                        {{ citizen?.origin?.name }}
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
    citizensOrigin: [] as any,
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
        const response = await dailyOverviewService.getCitizensOrigin()
        if (response) {
            state.citizensOrigin = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>