<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <h3 class="text-primary text-base font-medium py-2">
            {{ $t('overview.journalStatistics') }}
        </h3>
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />

        <div
            class="bg-white shadow-md rounded-md border-l-8 border-primary mt-2 text-sm space-y-2 pr-5 pt-6 pb-6 pl-6 mr-1">
            <div class="space-y-1">
                <div v-for="(count, score) in state.journal_score_statistics?.data" :key="score"
                    class="flex items-center space-x-4">
                    <p class="w-2 text-sm text-right">
                        <span v-if="score.toString() === 'one_scores'">1</span>
                        <span v-if="score.toString() === 'two_scores'">2</span>
                        <span v-if="score.toString() === 'three_scores'">3</span>
                        <span v-if="score.toString() === 'four_scores'">4</span>
                        <span v-if="score.toString() === 'five_scores'">5</span>
                    </p>
                    <div class="flex-1">
                        <div class="h-2 bg-gray-300 rounded-full relative">
                            <div class="h-2 bg-primary rounded-full absolute top-0 left-0"
                                :style="{ width: getPercentage(state.journal_score_statistics?.data[score]) + '%' }">
                            </div>
                        </div>
                    </div>
                    <span class="w-6 text-sm">{{ state.journal_score_statistics?.data[score] }}</span>
                </div>
            </div>
        </div>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { dailyOverviewService } from '@/components/api/user/DailyOverviewService'
import { useDepartmentStore } from '@/store/department'
import type { Error } from '@/types'

const departmentStore = useDepartmentStore()

const props = defineProps({
    dateRange: {
        type: Object,
        required: false,
    },
})

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    journal_score_statistics: [] as any,
})

watch(() => props.dateRange, () => {
    fetchJournalScoreStatistics()
}, { deep: true })

watch(() => departmentStore.getSelectedDepartmentName, (newValue: any) => {
    if (newValue != null) {
        fetchJournalScoreStatistics()
    }
})

onMounted(() => {
    fetchJournalScoreStatistics()
})

async function fetchJournalScoreStatistics() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params: any = {
            department: departmentStore.getSelectedDepartmentName,
        }
        if (props.dateRange) {
            params.end_date = props.dateRange.end_date
            params.start_date = props.dateRange.start_date
        }
        const response = await dailyOverviewService.getCitizensJournalScoreStatistics(params)
        if (response) {
            state.journal_score_statistics = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

const getPercentage = (count: string): string => {
    // Explicitly typecast the values as an array of strings
    const total = (Object.values(state.journal_score_statistics?.data || {}) as string[])
        .reduce((acc: number, val: string) => acc + parseInt(val, 10), 0)

    // Avoid division by zero
    if (total === 0) {
        return "0"
    }

    // Calculate percentage and return it as a string with two decimal points
    return ((parseInt(count, 10) / total) * 100).toFixed(2)
}
</script>