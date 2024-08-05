<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <h3 class="text-sm font-medium pr-6">{{ $t('dailyOverview.latestJournal') }}</h3>
        <div class="mt-4 text-sm space-y-2 divide-y overflow-scroll min-h-44 max-h-96 pr-5 mr-1">
            <div class="flex items-center justify-center h-80" v-if="state.citizens?.data?.length === 0">
                {{ $t('dailyOverview.noJournalsToShow') }}
            </div>
            <div v-for="(citizen, index) in state.citizens?.data" :key="index" class="p-4">
                <h3 class="text-md font-semibold">
                    {{ citizen?.citizen_journal?.title }}
                </h3>
                <div v-html="citizen?.citizen_journal?.content" id="content" class="table-responsive" />
                <p class="text-xs text-muted-400">
                    <span>{{ formatDateToReadable(citizen?.citizen_journal?.date) }}</span>
                </p>
            </div>
        </div>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import moment from 'moment'
import { dailyOverviewService } from '@/components/api/DailyOverviewService'
import type { Error } from '@/types'

const state = reactive({
    isPageLoading: false,
    citizens: [] as any,
    error: {} as Error,
})

onMounted(() => {
    fetchCitizens()
})

async function fetchCitizens() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            end_date: moment(),
            start_date: moment(),
        }

        const response = await dailyOverviewService.getLatestCitizensJournal(params)
        if (response) {
            state.citizens = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function formatDateToReadable(datetime: string) {
    return moment(datetime).format('DD MMM, YYYY')
}
</script>