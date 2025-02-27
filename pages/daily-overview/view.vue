<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('dailyOverview.dailyOverview') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('dailyOverview.dailyOverview') }}</template>
            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/daily-overview">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
            </div>

            <div class="flex gap-x-2">
                <button class="flex items-center gap-x-1 text-sm text-primary group"
                    @click="state.modal.isFilterDailyOverviewViewAllOpen = true">
                    <Icon name="ic:outline-filter-list" class="text-primary w-6 h-6 group-hover:text-primary-700" />
                    <span class="group-hover:text-primary-700">
                        {{ $t('showHide') }}
                    </span>
                </button>
                <button class="text-sm text-primary hover:text-primary-700 hover:underline"
                    @click="state.modal.isDailyOverviewDateRangeOpen = true">
                    ({{ formatDateToReadable(state.dateRange.formDateRange.start_date) }} -
                    {{ formatDateToReadable(state.dateRange.formDateRange.end_date) }})
                </button>
            </div>

            <div class="mt-6">
                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    <div v-if="dailyOverviewStore.getViewAllFilter.showCitizenDailyEvents">
                        <ModulesUserDailyOverviewCitizensDailyEvents :dateRange="state.dateRange.formDateRange" />
                    </div>
                    <div v-if="dailyOverviewStore.getViewAllFilter.showCitizenMedicineOverview">
                        <ModulesUserDailyOverviewCitizensMedicineOverview :dateRange="state.dateRange.formDateRange" />
                    </div>
                    <div v-if="dailyOverviewStore.getViewAllFilter.showLatestJournalNotes">
                        <ModulesUserDailyOverviewLatestJournal :dateRange="state.dateRange.formDateRange" />
                    </div>
                </div>
            </div>

            <ModulesUserDailyOverviewFilterAllModalShowHide :isModalOpen="state.modal.isFilterDailyOverviewViewAllOpen"
                @close="state.modal.isFilterDailyOverviewViewAllOpen = false" />
            <ModulesUserDutyScheduleModalShiftDateRange :isModalOpen="state.modal.isDailyOverviewDateRangeOpen"
                :dateRange="state.dateRange" @close="state.modal.isDailyOverviewDateRangeOpen = false"
                @filterDate="filterDailyOverviewByDate" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useDailyOverviewStore } from '@/store/daily-overview'

const runtimeConfig = useRuntimeConfig()
const dailyOverviewStore = useDailyOverviewStore()
const { formatDateToReadable } = useDatetimeFormatter()

const state = reactive({
    dateRange: {
        formDateRange: {
            start_date: moment().format('YYYY-MM-DD'),
            end_date: moment().format('YYYY-MM-DD'),
        },
    } as any,
    modal: {
        isDailyOverviewDateRangeOpen: false,
        isFilterDailyOverviewViewAllOpen: false,
    },
})

function filterDailyOverviewByDate(formDateRange: any) {
    state.dateRange.formDateRange.start_date = formDateRange.start_date
    state.dateRange.formDateRange.end_date = formDateRange.end_date
}
</script>
