<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <h3 class="text-primary text-base font-medium py-2">
            {{ $t('dailyOverview.citizensOrigin') }}
        </h3>
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />

        <div class="border-2 border-gray-300 border-dashed rounded-md flex items-center justify-center min-h-96 max-h-96 text-sm mt-2"
            v-if="state.citizensOrigin?.data?.length === 0">
            {{ $t('dailyOverview.noDataToDisplay') }}
        </div>
        <div class="bg-white shadow-md rounded-md border-l-8 border-secondary mt-2 text-sm divide-y overflow-scroll min-h-96 max-h-96"
            v-else>
            <div v-for="(citizen, index) in state.citizensOrigin?.data" :key="index" class="pl-4 pr-3 py-5">
                <div class="flex items-center justify-between gap-x-3">
                    <div class="flex gap-x-2">
                        <img :src="citizen?.image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${citizen?.firstname + ' ' + citizen?.lastname}`"
                            class="rounded-full w-12 h-12 object-cover" />
                        <div>
                            <p class="text-sm font-medium text-primary">
                                {{ citizen?.firstname + ' ' + citizen?.lastname }}
                            </p>
                        </div>
                    </div>
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