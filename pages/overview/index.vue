<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('overview.overview') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('overview.overview') }}</template>
            <template #guided-tour>
                <div />
                <Tooltip :text="$t('guidedTour')" @click="openGuidedTour()">
                    <Icon name="ph:question" class="size-6 cursor-pointer text-gray-700" aria-hidden="true" />
                </Tooltip>
            </template>

            <div class="flex gap-x-2">
                <button class="flex items-center gap-x-1 text-sm text-primary group"
                    @click="state.modal.isFilterDailyOverviewOpen = true">
                    <Icon name="ic:outline-filter-list" class="text-primary w-6 h-6 group-hover:text-primary-700" />
                    <span class="group-hover:text-primary-700">
                        {{ $t('showHide') }}
                    </span>
                </button>
                <div class="flex items-center gap-x-1">
                    <button class="text-sm text-primary hover:text-primary-700 hover:underline"
                        @click="state.modal.isDailyOverviewDateRangeOpen = true">
                        ({{ formatDateToReadable(state.dateRange.formDateRange.start_date) }} -
                        {{ formatDateToReadable(state.dateRange.formDateRange.end_date) }})
                    </button>
                    <div>
                        <Icon name="ph:question" class="w-4 h-4 cursor-pointer text-gray-700" aria-hidden="true"
                            @click="state.modal.isDateRangeHelperOpen = true" />
                    </div>
                </div>
            </div>

            <div class="mt-2">
                <div class="space-y-10">
                    <div class="flex gap-x-3 justify-end">
                        <FormButton buttonStyle="primary" @click="navigateTo('/overview/view')">
                            {{ $t('overview.viewAll') }}
                        </FormButton>
                        <FormButton buttonStyle="action" class="rounded-lg" @click="navigateTo('/inquiries')"
                            v-if="userStore.getUser?.company?.industry?.system_name === 'social_welfare' && ['Crisis center', 'Shelter'].includes(userStore.getUser?.company?.facility_type?.en_name)">
                            <Icon name="ph:list-bullets" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('inquiries.inquiries') }}
                        </FormButton>
                        <FormButton buttonStyle="primary" @click="state.modal.isQuickRiskAssessmentOpen = true"
                            v-if="userStore.getUser?.company?.quick_risk_assessment_enabled">
                            {{ $t('overview.quickRiskAssessment.quickRiskAssessment') }}
                        </FormButton>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5" v-if="overviewStore.getDailyOverviewFilter.showCitizensDailyEvents ||
                        overviewStore.getDailyOverviewFilter.showDailyMedicineOverview ||
                        overviewStore.getDailyOverviewFilter.showLatestJournal ||
                        overviewStore.getDailyOverviewFilter.showCitizensFollowUpReminders">
                        <div v-if="overviewStore.getDailyOverviewFilter.showCitizensDailyEvents">
                            <ModulesUserDailyOverviewCitizensDailyEvents :dateRange="state.dateRange.formDateRange" />
                        </div>
                        <ModulesUserDailyOverviewCitizensMedicineOverview :dateRange="state.dateRange.formDateRange"
                            v-if="overviewStore.getDailyOverviewFilter.showDailyMedicineOverview" />
                        <div v-if="overviewStore.getDailyOverviewFilter.showLatestJournal">
                            <ModulesUserDailyOverviewLatestJournal :dateRange="state.dateRange.formDateRange"
                                :viewAll="false" />
                        </div>
                        <div v-if="overviewStore.getDailyOverviewFilter.showCitizensFollowUpReminders">
                            <ModulesUserDailyOverviewCitizensFollowUpReminders :dateRange="state.dateRange.formDateRange" />
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-5" v-if="overviewStore.getDailyOverviewFilter.showTreatments ||
                        overviewStore.getDailyOverviewFilter.showMyDailyEvents ||
                        overviewStore.getDailyOverviewFilter.showBulletBoard">
                        <div v-if="overviewStore.getDailyOverviewFilter.showTreatments">
                            <ModulesUserDailyOverviewTreatments :dateRange="state.dateRange.formDateRange" />
                        </div>
                        <div v-if="overviewStore.getDailyOverviewFilter.showMyDailyEvents">
                            <ModulesUserDailyOverviewMyEventToday :dateRange="state.dateRange.formDateRange" />
                        </div>
                        <ModulesUserDailyOverviewBulletBoard :dateRange="state.dateRange.formDateRange"
                            v-if="overviewStore.getDailyOverviewFilter.showBulletBoard" />
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5" v-if="overviewStore.getDailyOverviewFilter.showCitizensAdmissionAndDischarged ||
                        overviewStore.getDailyOverviewFilter.showCitizensOrigin ||
                        overviewStore.getDailyOverviewFilter.showCitizensAddictions ||
                        overviewStore.getDailyOverviewFilter.showCitizensDiagnoses ||
                        overviewStore.getDailyOverviewFilter.showRiskAssessment ||
                        overviewStore.getDailyOverviewFilter.showGender">
                        <div v-if="overviewStore.getDailyOverviewFilter.showCitizensAdmissionAndDischarged">
                            <ModulesUserDailyOverviewCitizensAdmissionDischarged
                                :dateRange="state.dateRange.formDateRange" />
                        </div>
                        <div v-if="overviewStore.getDailyOverviewFilter.showCitizensOrigin">
                            <ModulesUserDailyOverviewCitizensOrigin />
                        </div>
                        <div class="space-y-3" v-if="overviewStore.getDailyOverviewFilter.showCitizensAddictions">
                            <ModulesUserDailyOverviewCitizensAddictions :dateRange="state.dateRange.formDateRange"
                                v-if="overviewStore.getDailyOverviewFilter.showCitizensAddictions" />
                            <ModulesUserDailyOverviewCitizensAddictionsCount :dateRange="state.dateRange.formDateRange"
                                v-if="overviewStore.getDailyOverviewFilter.showCitizensAddictions" />
                        </div>
                        <div class="space-y-3" v-if="overviewStore.getDailyOverviewFilter.showCitizensDiagnoses">
                            <ModulesUserDailyOverviewCitizensDiagnoses :dateRange="state.dateRange.formDateRange"
                                v-if="overviewStore.getDailyOverviewFilter.showCitizensDiagnoses" />
                            <ModulesUserDailyOverviewCitizensDiagnosesCount :dateRange="state.dateRange.formDateRange"
                                v-if="overviewStore.getDailyOverviewFilter.showCitizensDiagnoses" />
                        </div>
                        <div class="space-y-3" v-if="overviewStore.getDailyOverviewFilter.showRiskAssessment">
                            <ModulesUserDailyOverviewCitizensRiskAssessment :dateRange="state.dateRange.formDateRange"
                                v-if="overviewStore.getDailyOverviewFilter.showRiskAssessment" />
                        </div>
                        <div class="space-y-3" v-if="overviewStore.getDailyOverviewFilter.showGender">
                            <ModulesUserDailyOverviewCitizensGender
                                v-if="overviewStore.getDailyOverviewFilter.showGender" />
                        </div>
                    </div>

                    <div>
                        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5" v-if="overviewStore.getDailyOverviewFilter.showStatusesScoreStatistics ||
                            overviewStore.getDailyOverviewFilter.showGoalsScoreStatistics ||
                            overviewStore.getDailyOverviewFilter.showIncidentStatistics ||
                            overviewStore.getDailyOverviewFilter.showMedicineDeviationStatistics ||
                            overviewStore.getDailyOverviewFilter.showJournalScoreStatistics ||
                            overviewStore.getDailyOverviewFilter.showSubgoalsScoreStatistics ||
                            overviewStore.getDailyOverviewFilter.showUseOfForceStatistics">
                            <div v-if="overviewStore.getDailyOverviewFilter.showStatusesScoreStatistics">
                                <ModulesUserDailyOverviewStatusesScoreStatistics
                                    :dateRange="state.dateRange.formDateRange" />
                            </div>
                            <div v-if="overviewStore.getDailyOverviewFilter.showGoalsScoreStatistics">
                                <ModulesUserDailyOverviewGoalsScoreStatistics
                                    :dateRange="state.dateRange.formDateRange" />
                            </div>
                            <div v-if="overviewStore.getDailyOverviewFilter.showIncidentStatistics">
                                <ModulesUserDailyOverviewIncidentReportsStatistics
                                    :dateRange="state.dateRange.formDateRange" />
                            </div>
                            <div v-if="overviewStore.getDailyOverviewFilter.showMedicineDeviationStatistics">
                                <ModulesUserDailyOverviewMedicineDeviationStatistics
                                    :dateRange="state.dateRange.formDateRange" />
                            </div>
                            <div v-if="overviewStore.getDailyOverviewFilter.showJournalScoreStatistics">
                                <ModulesUserDailyOverviewJournalScoreStatistics
                                    :dateRange="state.dateRange.formDateRange" />
                            </div>
                            <div v-if="overviewStore.getDailyOverviewFilter.showSubgoalsScoreStatistics">
                                <ModulesUserDailyOverviewSubgoalsScoreStatistics
                                    :dateRange="state.dateRange.formDateRange" />
                            </div>
                            <div v-if="overviewStore.getDailyOverviewFilter.showUseOfForceStatistics">
                                <ModulesUserDailyOverviewUseOfForceStatistics
                                    :dateRange="state.dateRange.formDateRange" />
                            </div>
                        </div>

                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-5"
                        v-if="overviewStore.getDailyOverviewFilter.showScheduleSlots || overviewStore.getDailyOverviewFilter.showPlansAndGoals">
                        <div v-if="overviewStore.getDailyOverviewFilter.showScheduleSlots">
                            <ModulesUserDailyOverviewScheduleSlots :dateRange="state.dateRange.formDateRange" />
                        </div>
                        <div v-if="overviewStore.getDailyOverviewFilter.showPlansAndGoals">
                            <ModulesUserDailyOverviewPlansAndGoals :dateRange="state.dateRange.formDateRange" />
                        </div>
                    </div>
                    <div>
                        <p class="text-xl font-bold text-primary">
                            {{ $t('overview.from') }} CitizenOne<sup class="text-sm">&#8482;</sup>
                        </p>
                        <div class="mt-2 grid grid-cols-1 md:grid-cols-7 gap-5" ref="newsSection" id="news">
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
            <ModulesUserDailyOverviewFilterModalDateRange :isModalOpen="state.modal.isDailyOverviewDateRangeOpen"
                :dateRange="state.dateRange" @close="state.modal.isDailyOverviewDateRangeOpen = false"
                @filterDate="filterDailyOverviewByDate" />
            <ModulesUserDailyOverviewFilterModalDateRangeHelper :isModalOpen="state.modal.isDateRangeHelperOpen"
                @close="state.modal.isDateRangeHelperOpen = false" />
            <ModulesUserDailyOverviewQuickRiskAssessmentModalNew :isModalOpen="state.modal.isQuickRiskAssessmentOpen"
                @close="state.modal.isQuickRiskAssessmentOpen = false" />

            <ModulesUserGuidedTourModalDailyOverview v-if="state.modal.isGuidedTourDailyOverviewOpen"
                :isModalOpen="state.modal.isGuidedTourDailyOverviewOpen" :isGuidedTour="false"
                @close="state.modal.isGuidedTourDailyOverviewOpen = false" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useUserStore } from '@/store/user'
import { useDailyOverviewStore } from '@/store/daily-overview'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'

const runtimeConfig = useRuntimeConfig()
const overviewStore = useDailyOverviewStore()
const userStore = useUserStore() as any
const route = useRoute()
const newsSection = ref<HTMLElement | null>(null)
const { formatDateToReadable } = useDatetimeFormatter()

const state = reactive({
    dateRange: {
        formDateRange: {
            start_date: moment().startOf('isoWeek').format('YYYY-MM-DD'),
            end_date: moment().endOf('isoWeek').format('YYYY-MM-DD'),
        },
    } as any,
    modal: {
        isDailyOverviewDateRangeOpen: false,
        isDateRangeHelperOpen: false,
        isFilterDailyOverviewOpen: false,
        isGuidedTourDailyOverviewOpen: false,
        isQuickRiskAssessmentOpen: false,
    }
})

onMounted(() => {
    scrollToNewsIfNeeded()
})

watch(() => userStore.getUser, (user: any) => {
    if (user) {
        if (user?.daily_overview_date_filter?.filter_type === 'today') {
            state.dateRange.formDateRange = {
                start_date: moment().format('YYYY-MM-DD'),
                end_date: moment().format('YYYY-MM-DD'),
            }
        } else if (user?.daily_overview_date_filter?.filter_type === 'next_7_days') {
            state.dateRange.formDateRange = {
                start_date: moment().add(1, 'week').startOf('isoWeek').format('YYYY-MM-DD'),
                end_date: moment().add(1, 'week').endOf('isoWeek').format('YYYY-MM-DD'),
            }
        } else if (user?.daily_overview_date_filter?.filter_type === 'custom') {
            state.dateRange.formDateRange = {
                start_date: moment(user?.daily_overview_date_filter?.overview_date_start).format('YYYY-MM-DD'),
                end_date: moment(user?.daily_overview_date_filter?.overview_date_end).format('YYYY-MM-DD'),
            }
        } else {
            state.dateRange.formDateRange = {
                start_date: moment().startOf('isoWeek').format('YYYY-MM-DD'),
                end_date: moment().endOf('isoWeek').format('YYYY-MM-DD'),
            }
        }
    }
})

function scrollToNewsIfNeeded() {
    if (route.hash === '#news' && newsSection.value) {
        nextTick(() => {
            setTimeout(() => {
                newsSection.value?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                })
            }, 3000) // delay 3 seconds
        })
    }
}

function openGuidedTour() {
    state.modal.isGuidedTourDailyOverviewOpen = true
}

function filterDailyOverviewByDate(formDateRange: any) {
    state.dateRange.formDateRange.start_date = formDateRange.start_date
    state.dateRange.formDateRange.end_date = formDateRange.end_date
}
</script>