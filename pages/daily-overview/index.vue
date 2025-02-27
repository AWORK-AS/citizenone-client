<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('dailyOverview.dailyOverview') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('dailyOverview.dailyOverview') }}</template>

            <div class="flex gap-x-2">
                <button class="flex items-center gap-x-1 text-sm text-primary group"
                    @click="state.modal.isFilterDailyOverviewOpen = true">
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

            <div class="mt-2">
                <div class="space-y-10">
                    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                        <div v-if="dailyOverviewStore.getDailyOverviewFilter.showCitizensAdmissionAndDischarged">
                            <ModulesUserDailyOverviewCitizensAdmissionDischarged
                                :dateRange="state.dateRange.formDateRange" />
                        </div>
                        <div class="space-y-3"
                            v-if="dailyOverviewStore.getDailyOverviewFilter.showRiskAssessment || dailyOverviewStore.getDailyOverviewFilter.showGender">
                            <ModulesUserDailyOverviewCitizensRiskAssessment :dateRange="state.dateRange.formDateRange"
                                v-if="dailyOverviewStore.getDailyOverviewFilter.showRiskAssessment" />
                            <ModulesUserDailyOverviewCitizensGender
                                v-if="dailyOverviewStore.getDailyOverviewFilter.showGender" />
                        </div>
                        <div v-if="dailyOverviewStore.getDailyOverviewFilter.showCitizensOrigin">
                            <ModulesUserDailyOverviewCitizensOrigin />
                        </div>
                        <div class="space-y-3"
                            v-if="dailyOverviewStore.getDailyOverviewFilter.showCitizensAddictions || dailyOverviewStore.getDailyOverviewFilter.showCitizensDiagnoses">
                            <ModulesUserDailyOverviewCitizensAddictions :dateRange="state.dateRange.formDateRange"
                                v-if="dailyOverviewStore.getDailyOverviewFilter.showCitizensAddictions" />
                            <ModulesUserDailyOverviewCitizensDiagnoses :dateRange="state.dateRange.formDateRange"
                                v-if="dailyOverviewStore.getDailyOverviewFilter.showCitizensDiagnoses" />
                        </div>
                    </div>

                    <div>
                        <div class="flex justify-end">
                            <div class="w-fit cursor-pointer">
                                <FormButton buttonStyle="primary" @click="navigateTo('/daily-overview/view')">
                                    {{ $t('dailyOverview.viewAll') }}
                                </FormButton>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5" v-if="dailyOverviewStore.getDailyOverviewFilter.showMyDailyEvents ||
                            dailyOverviewStore.getDailyOverviewFilter.showCitizensDailyEvents ||
                            dailyOverviewStore.getDailyOverviewFilter.showLatestJournal ||
                            dailyOverviewStore.getDailyOverviewFilter.showDailyMedicineOverview">
                            <div v-if="dailyOverviewStore.getDailyOverviewFilter.showMyDailyEvents">
                                <ModulesUserDailyOverviewMyEventToday :dateRange="state.dateRange.formDateRange" />
                            </div>
                            <div v-if="dailyOverviewStore.getDailyOverviewFilter.showCitizensDailyEvents">
                                <ModulesUserDailyOverviewCitizensDailyEvents
                                    :dateRange="state.dateRange.formDateRange" />
                            </div>
                            <div v-if="dailyOverviewStore.getDailyOverviewFilter.showLatestJournal">
                                <ModulesUserDailyOverviewLatestJournal :dateRange="state.dateRange.formDateRange" />
                            </div>
                            <div v-if="dailyOverviewStore.getDailyOverviewFilter.showJournalScoreStatistics">
                                <ModulesUserDailyOverviewJournalScoreStatistics
                                    :dateRange="state.dateRange.formDateRange" />
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                        <ModulesUserDailyOverviewCitizensMedicineOverview :dateRange="state.dateRange.formDateRange"
                            v-if="dailyOverviewStore.getDailyOverviewFilter.showDailyMedicineOverview" />
                        <ModulesUserDailyOverviewBulletBoard :dateRange="state.dateRange.formDateRange"
                            v-if="dailyOverviewStore.getDailyOverviewFilter.showBulletBoard" />
                        <div
                            v-if="dailyOverviewStore.getDailyOverviewFilter.showGoalsScoreStatistics || dailyOverviewStore.getDailyOverviewFilter.showSubgoalsScoreStatistics">
                            <div v-if="dailyOverviewStore.getDailyOverviewFilter.showGoalsScoreStatistics">
                                <ModulesUserDailyOverviewGoalsScoreStatistics
                                    :dateRange="state.dateRange.formDateRange" />
                            </div>
                            <div v-if="dailyOverviewStore.getDailyOverviewFilter.showSubgoalsScoreStatistics"
                                class="mt-2">
                                <ModulesUserDailyOverviewSubgoalsScoreStatistics
                                    :dateRange="state.dateRange.formDateRange" />
                            </div>
                        </div>
                        <div v-if="dailyOverviewStore.getDailyOverviewFilter.showStatusesScoreStatistics">
                            <ModulesUserDailyOverviewStatusesScoreStatistics
                                :dateRange="state.dateRange.formDateRange" />
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        <div v-if="dailyOverviewStore.getDailyOverviewFilter.showIncidentStatistics" class="mt-2">
                            <ModulesUserDailyOverviewIncidentReportsStatistics
                                :dateRange="state.dateRange.formDateRange" />
                        </div>
                        <div v-if="dailyOverviewStore.getDailyOverviewFilter.showUseOfForceStatistics" class="mt-2">
                            <ModulesUserDailyOverviewUseOfForceStatistics :dateRange="state.dateRange.formDateRange" />
                        </div>
                        <div v-if="dailyOverviewStore.getDailyOverviewFilter.showMedicineDeviationStatistics"
                            class="mt-2">
                            <ModulesUserDailyOverviewMedicineDeviationStatistics
                                :dateRange="state.dateRange.formDateRange" />
                        </div>
                    </div>
                    <div>
                        <p class="text-xl font-bold text-primary">
                            {{ $t('dailyOverview.from') }} CitizenOne<sup class="text-sm">&#8482;</sup>
                        </p>
                        <div class="mt-2 grid grid-cols-1 md:grid-cols-7 gap-5">
                            <div class="min-h-44 md:col-span-4">
                                <ModulesUserDailyOverviewNews />
                            </div>
                            <div class="min-h-44 md:col-span-3">
                                <ModulesUserDailyOverviewPoll />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ModulesUserDailyOverviewFilterModalShowHide :isModalOpen="state.modal.isFilterDailyOverviewOpen"
                @close="state.modal.isFilterDailyOverviewOpen = false" />
            <ModulesUserDutyScheduleModalShiftDateRange :isModalOpen="state.modal.isDailyOverviewDateRangeOpen"
                :dateRange="state.dateRange" @close="state.modal.isDailyOverviewDateRangeOpen = false"
                @filterDate="filterDailyOverviewByDate" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useDailyOverviewStore } from '@/store/daily-overview'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'

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
        isFilterDailyOverviewOpen: false,
    }
})

function filterDailyOverviewByDate(formDateRange: any) {
    state.dateRange.formDateRange.start_date = formDateRange.start_date
    state.dateRange.formDateRange.end_date = formDateRange.end_date
}
</script>