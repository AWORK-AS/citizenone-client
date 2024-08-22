<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <h3 class="text-primary text-base font-medium py-2">
            {{ $t('dailyOverview.latestJournal') }}
        </h3>

        <div class="flex items-center justify-center h-80 text-sm mt-10" v-if="state.citizens?.data?.length === 0">
            {{ $t('dailyOverview.noJournalsToShow') }}
        </div>

        <div class="bg-white shadow-md rounded-md border-l-8 border-secondary mt-2 text-sm space-y-2 divide-y overflow-scroll min-h-96 max-h-96 pr-5 pt-6 pb-6 pl-6 mr-1"
            v-else>
            <div v-for="(citizen, index) in state.citizens?.data" :key="index" class="py-2">
                <Badge type="primary" class="w-fit">
                    <p class="text-xs px-2">
                        {{ citizen?.firstname + ' ' + citizen?.lastname }}
                    </p>
                </Badge>
                <div class="px-1">
                    <h3 class="mt-2 text-base font-semibold">
                        {{ citizen?.citizen_journal?.title }}
                    </h3>
                    <div v-html="citizen?.citizen_journal?.content" id="content" class="table-responsive" />
                    <p class="text-xs text-muted-400">
                        <span>{{ formatDateToReadable(citizen?.citizen_journal?.date) }}</span>
                    </p>
                </div>
            </div>
        </div>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { dailyOverviewService } from '@/components/api/DailyOverviewService'
import { useDepartmentStore } from '@/store/department'
import type { Error } from '@/types'


const departmentStore = useDepartmentStore()
const { formatDateToReadable } = useDatetimeFormatter()

const state = reactive({
    isPageLoading: false,
    citizens: [] as any,
    error: {} as Error,
})

onMounted(() => {
    fetchCitizens()
})

watch(() => departmentStore.getSelectedDepartmentName, (newValue: any) => {
    if (newValue != null) {
        fetchCitizens()
    }
})

async function fetchCitizens() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            department: departmentStore.getSelectedDepartmentName,
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
</script>