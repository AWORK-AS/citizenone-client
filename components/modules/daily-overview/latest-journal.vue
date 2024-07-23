<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <h3 class="text-sm font-medium pr-6">{{ $t('dailyOverview.latestJournal') }}</h3>
        <div class="mt-4 text-sm space-y-2 divide-y overflow-scroll min-h-44 max-h-96 pr-6">
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

const state = reactive({
    isPageLoading: false,
    citizens: [],
    error: null,
})

onMounted(() => {
    fetchCitizens()
})

async function fetchCitizens() {
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