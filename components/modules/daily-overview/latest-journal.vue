<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <h3 class="text-primary text-base font-medium py-2">
            {{ $t('dailyOverview.latestJournal') }}
        </h3>

        <div class="bg-white shadow-md rounded-md border-l-8 border-secondary flex items-center justify-center min-h-96 max-h-96 text-sm mt-2"
            v-if="state.citizens?.data?.length === 0">
            {{ $t('dailyOverview.noJournalsToShow') }}
        </div>

        <div class="bg-white shadow-md rounded-md border-l-8 border-secondary mt-2 text-sm space-y-2 divide-y overflow-scroll min-h-96 max-h-96 pr-5 pt-6 pb-6 pl-6 mr-1"
            v-else>
            <div v-for="(citizen, index) in state.citizens?.data" :key="index" class="py-3">
                <Badge type="primary" class="w-fit">
                    <p class="text-xs px-2">
                        {{ citizen?.firstname + ' ' + citizen?.lastname }}
                    </p>
                </Badge>
                <p class="text-xs py-1"
                    v-if="citizen?.citizen_journal?.user?.firstname && citizen?.citizen_journal?.user?.lastname">
                    {{ $t('dailyOverview.createdBy') }}
                    {{ citizen?.citizen_journal?.user?.firstname + ' ' + citizen?.citizen_journal?.user?.lastname }}
                </p>
                <div class="px-1">
                    <h3 class="text-base font-semibold">
                        {{ citizen?.citizen_journal?.title }}
                    </h3>
                    <div v-html="citizen?.citizen_journal?.content" class="table-responsive text-sm" />
                    <p class="content text-xs text-muted-400 mt-1">
                        <span>{{ formatDateToReadable(citizen?.citizen_journal?.date) }}</span>
                    </p>
                </div>
            </div>
        </div>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { dailyOverviewService } from '@/components/api/DailyOverviewService'
import { useDepartmentStore } from '@/store/department'
import type { Error } from '@/types'

const props = defineProps({
    endDate: {
        type: String,
        required: false,
    },
    startDate: {
        type: String,
        required: false,
    },
})

const departmentStore = useDepartmentStore()
const { formatDateToReadable } = useDatetimeFormatter()

const state = reactive({
    isPageLoading: false,
    citizens: [] as any,
    error: {} as Error,
    searchFilter: {
        end_date: props.endDate,
        start_date: props.startDate
    }
})

watch(() => props.startDate, (date: any) => {
    if (date != null) {
        state.searchFilter.start_date = date
        fetchCitizens()
    }
})

watch(() => props.endDate, (date: any) => {
    if (date != null) {
        state.searchFilter.end_date = date
        fetchCitizens()
    }
})

watch(() => departmentStore.getSelectedDepartmentName, (newValue: any) => {
    if (newValue != null) {
        fetchCitizens()
    }
})

onMounted(() => {
    fetchCitizens()
})

async function fetchCitizens() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params: any = {
            department: departmentStore.getSelectedDepartmentName
        }

        if (state.searchFilter.end_date && state.searchFilter.start_date) {
            params.date = {
                end_date: state.searchFilter.end_date,
                start_date: state.searchFilter.start_date
            }
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