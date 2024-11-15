<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <h3 class="text-primary text-base font-medium py-2">
            {{ $t('dailyOverview.citizensAdmissionAndDischarged.citizensAdmissionAndDischarged') }}
        </h3>
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />

        <div class="bg-white shadow-md rounded-md border-l-8 border-secondary flex items-center justify-center min-h-96 max-h-96 text-sm mt-2"
            v-if="state.citizensAdmissionDischarged?.data?.length === 0">
            {{ $t('dailyOverview.noDataToDisplay') }}
        </div>
        <div class="bg-white shadow-md rounded-md border-l-8 border-secondary mt-2 text-sm space-y- divide-y overflow-scroll min-h-96 max-h-96 pr-5 pt-6 pb-6 pl-6 mr-1"
            v-else>
            <div v-for="(citizen, index) in state.citizensAdmissionDischarged?.data" :key="index" class="py-3">
                <Badge type="primary" class="w-fit">
                    <p class="text-xs px-2">
                        {{ citizen?.firstname + ' ' + citizen?.lastname }}
                    </p>
                </Badge>
                <div class="flex items-center gap-x-1 text-xs text-muted-400 mt-1">
                    <p>
                        {{ $t('dailyOverview.citizensAdmissionAndDischarged.dateAdmitted') }}:
                    </p>
                    <p>
                        {{ formatDateToReadable(citizen?.date_admitted) }}
                    </p>
                </div>
                <div class="flex items-center gap-x-1 text-xs text-muted-400 mt-1">
                    <p>
                        {{ $t('dailyOverview.citizensAdmissionAndDischarged.dateDischarged') }}:
                    </p>
                    <p>
                        {{ formatDateToReadable(citizen?.date_discharged) }}
                    </p>
                </div>
            </div>
        </div>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { dailyOverviewService } from '@/components/api/DailyOverviewService'
import type { Error } from '@/types'

const { formatDateToReadable } = useDatetimeFormatter()

const state = reactive({
    citizensAdmissionDischarged: [] as any,
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
        const response = await dailyOverviewService.getCitizensAdmissionAndDischarged()
        if (response) {
            state.citizensAdmissionDischarged = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>