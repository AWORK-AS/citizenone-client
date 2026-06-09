<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('overview.overview') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>
                <div class="flex items-center gap-x-4">
                    <span>
                        {{ $t('overview.overview') }}
                    </span>
                    <!-- Date navigator -->
                    <div
                        class="flex items-center gap-x-2 bg-white rounded-lg border border-surface-200 shadow-sm px-3 py-1.5">
                        <button @click="previousDay" class="p-0.5 rounded hover:bg-surface-100 transition-colors">
                            <Icon name="heroicons:chevron-left-20-solid" class="h-4 w-4 text-slate-400" />
                        </button>
                        <button @click="state.modal.isDailyOverviewDateRangeOpen = true"
                            class="text-sm font-medium text-slate-700 hover:text-primary transition-colors px-1">
                            {{ formatDisplayDate() }}
                        </button>
                        <button @click="nextDay" class="p-0.5 rounded hover:bg-surface-100 transition-colors">
                            <Icon name="heroicons:chevron-right-20-solid" class="h-4 w-4 text-slate-400" />
                        </button>
                    </div>
                </div>
            </template>

            <template #guided-tour>
                <div class="flex items-center gap-x-2">
                    <Tooltip :text="$t('guidedTour')" position="left" @click="openGuidedTour()">
                        <Icon name="ph:question"
                            class="size-5 cursor-pointer text-slate-400 hover:text-slate-600 transition-colors"
                            aria-hidden="true" />
                    </Tooltip>
                </div>
            </template>

            <Alert type="danger" :text="state?.error?.message"
                v-if="state.error?.message && state.error.message.length > 0" />

            <!-- Action bar -->
            <div class="flex items-center justify-between gap-3 flex-wrap">
                <div class="flex items-center gap-x-2">
                    <button
                        class="flex items-center gap-x-1.5 text-sm text-slate-500 hover:text-primary transition-colors rounded-lg px-2.5 py-1.5 hover:bg-primary-25"
                        @click="state.modal.isFilterDailyOverviewOpen = true">
                        <Icon name="ph:sliders-horizontal" class="w-4 h-4" />
                        <span>{{ $t('showHide') }}</span>
                    </button>
                </div>
                <div class="flex flex-wrap gap-2">
                    <FormButton buttonStyle="primary" class="w-full md:w-fit shadow-sm"
                        @click="navigateTo('/overview/view')">
                        {{ $t('overview.viewAll') }}
                    </FormButton>
                    <FormButton buttonStyle="action" class="w-full md:w-fit shadow-sm" @click="navigateTo('/inquiries')"
                        v-if="userStore.getUser?.company?.industry?.system_name === 'social_welfare' && ['Crisis center', 'Shelter'].includes(userStore.getUser?.company?.facility_type?.en_name)">
                        <Icon name="ph:list-bullets" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('inquiries.inquiries') }}
                    </FormButton>
                    <FormButton buttonStyle="primary" class="w-full md:w-fit shadow-sm"
                        @click="state.modal.isQuickRiskAssessmentOpen = true"
                        v-if="userStore.getUser?.company?.quick_risk_assessment_enabled">
                        {{ $t('overview.quickRiskAssessment.quickRiskAssessment') }}
                    </FormButton>
                </div>
            </div>

            <!-- Stat cards row -->
            <div class="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
                <div class="stat-card">
                    <div class="stat-label">
                        <span class="w-2 h-2 rounded-full bg-accent-blue"></span>
                        {{ $t('overview.citizensEvents') }}
                    </div>
                    <div class="mt-2 stat-value text-primary">
                        <CountUp :value="Number(state.stats.citizenCalendarEvents?.data?.length ?? 0)" />
                    </div>
                    <div class="stat-sublabel">
                        {{ $t('overview.stats.ongoing') }} |
                        {{ $t('overview.stats.upcoming') }}
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">
                        <span class="w-2 h-2 rounded-full bg-accent-green"></span>
                        {{ $t('overview.stats.journalEntries') || 'Journal entries' }}
                    </div>
                    <div class="mt-2 stat-value text-accent-green">
                        <CountUp :value="Number(state.stats.latestCitizensJournal?.data?.length ?? 0)" />
                    </div>
                    <div class="stat-sublabel">
                        {{ $t('overview.stats.acrossCitizens') }}
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">
                        <span class="w-2 h-2 rounded-full bg-accent-orange"></span>
                        {{ $t('overview.stats.medicationsDue') || 'Medications due' }}
                    </div>
                    <div class="mt-2 stat-value text-accent-orange">
                        <CountUp :value="Number(state.stats.medicinesPendingCount ?? 0)" />
                    </div>
                    <div class="stat-sublabel">
                        {{ state.stats.medicinesGivenCount }}
                        {{ $t('overview.stats.administered') }} ·
                        {{ state.stats.medicinesPendingCount }}
                        {{ $t('overview.stats.pending') }}·
                        {{ state.stats.medicinesDeviatedCount }}
                        {{ $t('overview.stats.deviated') }}
                    </div>
                </div>
                <div class="stat-card cursor-pointer hover:ring-secondary hover:ring-2 transition-all"
                    @click="scrollToTreatments" v-if="overviewStore.getDailyOverviewFilter.showTreatments">
                    <div class="stat-label">
                        <span class="w-2 h-2 rounded-full bg-green-500"></span>
                        {{ $t('overview.stats.activeTreatments') }}
                    </div>
                    <div class="mt-2 stat-value text-green-600">
                        <CountUp :value="Number(state.stats.activeTreatmentsCount ?? 0)" />
                    </div>
                    <div class="stat-sublabel flex items-center gap-1">
                        {{ $t('overview.stats.viewAll') }}
                        <Icon name="ph:arrow-right" class="size-3" />
                    </div>
                </div>
            </div>

            <!-- Main content grid -->
            <div class="mt-8 space-y-10">
                <!-- Citizens' events + Latest journal notes row -->
                <!-- Medication overview and Follow-up reminders row -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-5 gap-y-6 stagger-children" v-if="overviewStore.getDailyOverviewFilter.showCitizensDailyEvents ||
                    overviewStore.getDailyOverviewFilter.showLatestJournal ||
                    overviewStore.getDailyOverviewFilter.showDailyMedicineOverview ||
                    overviewStore.getDailyOverviewFilter.showCitizensFollowUpReminders ||
                    overviewStore.getDailyOverviewFilter.showReminders">
                    <!-- Citizens' events panel -->
                    <div class="card" v-if="overviewStore.getDailyOverviewFilter.showCitizensDailyEvents">
                        <div class="card-header">
                            <div class="flex items-center gap-x-2">
                                <Icon name="ph:check-circle" class="h-5 w-5 text-primary" />
                                <h3 class="text-sm font-semibold text-slate-900">
                                    {{ $t('overview.citizensEvents') }}
                                </h3>
                                <span class="badge badge-blue">
                                    {{ state.stats.citizenCalendarEvents?.data?.length ?? 0 }}
                                </span>
                            </div>
                            <button
                                class="text-sm text-primary font-medium hover:text-primary-700 transition-colors flex items-center gap-x-1"
                                @click="navigateTo('/calendar')">
                                {{ $t('overview.viewAll') }}
                                <Icon name="heroicons:arrow-right-20-solid" class="h-4 w-4" />
                            </button>
                        </div>
                        <div>
                            <ModulesUserDailyOverviewCitizensDailyEvents :dateRange="state.dateRange.formDateRange" />
                        </div>
                    </div>

                    <!-- Latest journal notes panel -->
                    <div class="card" v-if="overviewStore.getDailyOverviewFilter.showLatestJournal">
                        <div class="card-header">
                            <div class="flex items-center gap-x-2">
                                <Icon name="ph:notebook" class="h-5 w-5 text-primary" />
                                <h3 class="text-sm font-semibold text-slate-900">
                                    {{ $t('overview.latestJournal.latestJournal') }}
                                </h3>
                                <span class="badge badge-green">
                                    {{ state.stats.latestCitizensJournal?.data?.length ?? 0 }}
                                </span>
                            </div>
                            <button
                                class="text-sm text-primary font-medium hover:text-primary-700 transition-colors flex items-center gap-x-1"
                                @click="navigateTo('/citizens')">
                                {{ $t('overview.viewAll') }}
                                <Icon name="heroicons:arrow-right-20-solid" class="h-4 w-4" />
                            </button>
                        </div>
                        <div>
                            <ModulesUserDailyOverviewLatestJournal :dateRange="state.dateRange.formDateRange"
                                :viewAll="false" />
                        </div>
                    </div>

                    <!-- Medication overview panel -->
                    <div class="card" v-if="overviewStore.getDailyOverviewFilter.showDailyMedicineOverview">
                        <div class="card-header">
                            <div class="flex items-center gap-x-2">
                                <Icon name="ph:camera-plus" class="h-5 w-5 text-primary" />
                                <h3 class="text-sm font-semibold text-slate-900">
                                    {{ $t('overview.medicationOverview.medicationOverview') }}
                                </h3>
                            </div>
                        </div>
                        <div>
                            <ModulesUserDailyOverviewCitizensMedicineOverview
                                :dateRange="state.dateRange.formDateRange" />
                        </div>
                    </div>

                    <!-- User reminders panel -->
                    <div class="card" v-if="overviewStore.getDailyOverviewFilter.showReminders">
                        <div class="card-header">
                            <div class="flex items-center gap-x-2">
                                <Icon name="ph:check-square" class="h-5 w-5 text-primary" />
                                <h3 class="text-sm font-semibold text-slate-900">
                                    {{ $t('reminders.reminders') }}
                                </h3>
                            </div>
                            <button
                                class="text-sm text-primary font-medium hover:text-primary-700 transition-colors flex items-center gap-x-1"
                                @click="navigateTo('/reminders')">
                                {{ $t('overview.viewAll') }}
                                <Icon name="heroicons:arrow-right-20-solid" class="h-4 w-4" />
                            </button>
                        </div>
                        <div>
                            <ModulesUserDailyOverviewReminders />
                        </div>
                    </div>

                    <!-- Follow up reminders panel -->
                    <div class="card" v-if="overviewStore.getDailyOverviewFilter.showCitizensFollowUpReminders">
                        <div class="card-header">
                            <div class="flex items-center gap-x-2">
                                <Icon name="ph:notification" class="h-5 w-5 text-primary" />
                                <h3 class="text-sm font-semibold text-slate-900">
                                    {{ $t('overview.followUpReminders.followUpReminders') }}
                                </h3>
                            </div>
                        </div>
                        <div>
                            <ModulesUserDailyOverviewCitizensFollowUpReminders
                                :dateRange="state.dateRange.formDateRange" />
                        </div>
                    </div>
                </div>

                <!-- Treatments, My Events, Bulletin -->
                <div id="treatments-section" class="grid grid-cols-1 md:grid-cols-3 gap-5" v-if="overviewStore.getDailyOverviewFilter.showTreatments ||
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

                <!-- Statistics (collapsible; collapsed by default to keep the dashboard calm) -->
                <CollapsibleSection v-if="showStatisticsSection" :title="$t('overview.statistics')"
                    :default-open="false">
                    <div class="space-y-10">
                <!-- Statistics grid -->
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
                        <ModulesUserDailyOverviewCitizensAddictions :dateRange="state.dateRange.formDateRange" />
                        <ModulesUserDailyOverviewCitizensAddictionsCount :dateRange="state.dateRange.formDateRange" />
                    </div>
                    <div class="space-y-3" v-if="overviewStore.getDailyOverviewFilter.showCitizensDiagnoses">
                        <ModulesUserDailyOverviewCitizensDiagnoses :dateRange="state.dateRange.formDateRange" />
                        <ModulesUserDailyOverviewCitizensDiagnosesCount :dateRange="state.dateRange.formDateRange" />
                    </div>
                    <div class="space-y-3" v-if="overviewStore.getDailyOverviewFilter.showRiskAssessment">
                        <ModulesUserDailyOverviewCitizensRiskAssessment :dateRange="state.dateRange.formDateRange" />
                    </div>
                    <div class="space-y-3" v-if="overviewStore.getDailyOverviewFilter.showGender">
                        <ModulesUserDailyOverviewCitizensGender />
                    </div>
                </div>

                <!-- Score statistics -->
                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5" v-if="overviewStore.getDailyOverviewFilter.showStatusesScoreStatistics ||
                    overviewStore.getDailyOverviewFilter.showGoalsScoreStatistics ||
                    overviewStore.getDailyOverviewFilter.showIncidentStatistics ||
                    overviewStore.getDailyOverviewFilter.showMedicineDeviationStatistics ||
                    overviewStore.getDailyOverviewFilter.showJournalScoreStatistics ||
                    overviewStore.getDailyOverviewFilter.showSubgoalsScoreStatistics ||
                    overviewStore.getDailyOverviewFilter.showUseOfForceStatistics">
                    <div v-if="overviewStore.getDailyOverviewFilter.showStatusesScoreStatistics">
                        <ModulesUserDailyOverviewStatusesScoreStatistics :dateRange="state.dateRange.formDateRange" />
                    </div>
                    <div v-if="overviewStore.getDailyOverviewFilter.showGoalsScoreStatistics">
                        <ModulesUserDailyOverviewGoalsScoreStatistics :dateRange="state.dateRange.formDateRange" />
                    </div>
                    <div v-if="overviewStore.getDailyOverviewFilter.showIncidentStatistics">
                        <ModulesUserDailyOverviewIncidentReportsStatistics :dateRange="state.dateRange.formDateRange" />
                    </div>
                    <div v-if="overviewStore.getDailyOverviewFilter.showMedicineDeviationStatistics">
                        <ModulesUserDailyOverviewMedicineDeviationStatistics
                            :dateRange="state.dateRange.formDateRange" />
                    </div>
                    <div v-if="overviewStore.getDailyOverviewFilter.showJournalScoreStatistics">
                        <ModulesUserDailyOverviewJournalScoreStatistics :dateRange="state.dateRange.formDateRange" />
                    </div>
                    <div v-if="overviewStore.getDailyOverviewFilter.showSubgoalsScoreStatistics">
                        <ModulesUserDailyOverviewSubgoalsScoreStatistics :dateRange="state.dateRange.formDateRange" />
                    </div>
                    <div v-if="overviewStore.getDailyOverviewFilter.showUseOfForceStatistics">
                        <ModulesUserDailyOverviewUseOfForceStatistics :dateRange="state.dateRange.formDateRange" />
                    </div>
                </div>
                    </div>
                </CollapsibleSection>

                <!-- Schedule + Plans -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5"
                    v-if="overviewStore.getDailyOverviewFilter.showScheduleSlots || overviewStore.getDailyOverviewFilter.showPlansAndGoals">
                    <div v-if="overviewStore.getDailyOverviewFilter.showScheduleSlots">
                        <ModulesUserDailyOverviewScheduleSlots :dateRange="state.dateRange.formDateRange" />
                    </div>
                    <div v-if="overviewStore.getDailyOverviewFilter.showPlansAndGoals">
                        <ModulesUserDailyOverviewPlansAndGoals :dateRange="state.dateRange.formDateRange" />
                    </div>
                </div>

                <!-- News section -->
                <div>
                    <p class="text-lg font-semibold text-slate-900">
                        {{ $t('overview.from') }} CitizenOne<sup class="text-xs">&#8482;</sup>
                    </p>
                    <div class="mt-3 grid grid-cols-1 md:grid-cols-7 gap-5" ref="newsSection" id="news">
                        <div class="min-h-44 md:col-span-4">
                            <ModulesUserDailyOverviewNews />
                        </div>
                        <div class="min-h-44 md:col-span-3">
                            <ModulesUserDailyOverviewPoll />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modals -->
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
import { dailyOverviewService } from '@/components/api/user/DailyOverviewService'
import { useDailyOverviewStore } from '@/store/daily-overview'
import { useDepartmentStore } from '@/store/department'
import type { Error } from '@/types'

const breadcrumbLinks = [
    {
        name: 'overview.overview',
        translate: true,
        href: '/overview',
    },
]
const runtimeConfig = useRuntimeConfig()
const overviewStore = useDailyOverviewStore()
const departmentStore = useDepartmentStore()

// True when any statistics widget is enabled — guards the collapsible Statistics
// section so an empty header never shows.
const showStatisticsSection = computed(() => {
    const f = overviewStore.getDailyOverviewFilter
    return f.showCitizensAdmissionAndDischarged || f.showCitizensOrigin || f.showCitizensAddictions
        || f.showCitizensDiagnoses || f.showRiskAssessment || f.showGender
        || f.showStatusesScoreStatistics || f.showGoalsScoreStatistics || f.showIncidentStatistics
        || f.showMedicineDeviationStatistics || f.showJournalScoreStatistics || f.showSubgoalsScoreStatistics
        || f.showUseOfForceStatistics
})
const userStore = useUserStore() as any
const route = useRoute()
const newsSection = ref<HTMLElement | null>(null)

const state = reactive({
    currentDate: moment(),
    dateRange: {
        formDateRange: {
            start_date: moment().startOf('isoWeek').format('YYYY-MM-DD'),
            end_date: moment().endOf('isoWeek').format('YYYY-MM-DD'),
        },
    } as any,
    error: {} as Error,
    isPageLoading: false,
    modal: {
        isDailyOverviewDateRangeOpen: false,
        isDateRangeHelperOpen: false,
        isFilterDailyOverviewOpen: false,
        isGuidedTourDailyOverviewOpen: false,
        isQuickRiskAssessmentOpen: false,
    },
    stats: {
        citizenCalendarEvents: [],
        latestCitizensJournal: [],
        medicines: [],
        medicinesDeviatedCount: 0,
        medicinesGivenCount: 0,
        medicinesPendingCount: 0,
        activeTreatmentsCount: 0,
    } as any,
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
                start_date: moment().format('YYYY-MM-DD'),
                end_date: moment().add(1, 'week').format('YYYY-MM-DD'),
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
        fetchCitizenCalendarEvents(state.dateRange.formDateRange)
        fetchCitizensLatestJournal(state.dateRange.formDateRange)
        fetchCitizensMedicines(state.dateRange.formDateRange)
        fetchActiveTreatmentsCount()
    }
})

function scrollToTreatments() {
    const el = document.getElementById('treatments-section')
    if (el) {
        const offset = 80 // compensate for fixed navbar height
        const top = el.getBoundingClientRect().top + window.scrollY - offset
        window.scrollTo({ top, behavior: 'smooth' })
    }
}

function formatDisplayDate() {
    const start = moment(state.dateRange.formDateRange.start_date)
    const end = moment(state.dateRange.formDateRange.end_date)
    if (start.isSame(end, 'day')) {
        return start.format('DD. MMMM YYYY')
    }
    return `${start.format('DD. MMMM YYYY')} - ${end.format('DD. MMMM YYYY')}`
}

function previousDay() {
    const start = moment(state.dateRange.formDateRange.start_date)
    const end = moment(state.dateRange.formDateRange.end_date)
    const diff = end.diff(start, 'days') + 1
    const newStart = start.clone().subtract(diff, 'days')
    const newEnd = end.clone().subtract(diff, 'days')
    state.dateRange.formDateRange.start_date = newStart.format('YYYY-MM-DD')
    state.dateRange.formDateRange.end_date = newEnd.format('YYYY-MM-DD')
    state.currentDate = newStart
    fetchCitizenCalendarEvents(state.dateRange.formDateRange)
    fetchCitizensLatestJournal(state.dateRange.formDateRange)
    fetchCitizensMedicines(state.dateRange.formDateRange)
}

function nextDay() {
    const start = moment(state.dateRange.formDateRange.start_date)
    const end = moment(state.dateRange.formDateRange.end_date)
    const diff = end.diff(start, 'days') + 1
    const newStart = start.clone().add(diff, 'days')
    const newEnd = end.clone().add(diff, 'days')
    state.dateRange.formDateRange.start_date = newStart.format('YYYY-MM-DD')
    state.dateRange.formDateRange.end_date = newEnd.format('YYYY-MM-DD')
    state.currentDate = newStart
    fetchCitizenCalendarEvents(state.dateRange.formDateRange)
    fetchCitizensLatestJournal(state.dateRange.formDateRange)
    fetchCitizensMedicines(state.dateRange.formDateRange)
}

function scrollToNewsIfNeeded() {
    if (route.hash === '#news' && newsSection.value) {
        nextTick(() => {
            setTimeout(() => {
                newsSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }, 3000)
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

async function fetchCitizenCalendarEvents(dateRange: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params: any = {
            department: departmentStore.getSelectedDepartmentName
        }

        if (state.dateRange) {
            params.end_date = dateRange.end_date
            params.start_date = dateRange.start_date
        }
        const response = await dailyOverviewService.getCitizenDailyEvents(params)
        if (response) {
            state.stats.citizenCalendarEvents = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchCitizensLatestJournal(dateRange: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params: any = {
            department: departmentStore.getSelectedDepartmentName,
        }

        if (state.dateRange) {
            params.end_date = dateRange.end_date
            params.start_date = dateRange.start_date
        }
        const response = await dailyOverviewService.getLatestCitizensJournal(params)
        if (response) {
            state.stats.latestCitizensJournal = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchCitizensMedicines(dateRange: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params: any = {
            department: departmentStore.getSelectedDepartmentName
        }

        if (state.dateRange) {
            params.end_date = dateRange.end_date
            params.start_date = dateRange.start_date
        }
        const response = await dailyOverviewService.getCitizenDailyMedicineOverview(params)
        if (response) {
            state.stats.medicines = response

            const today = moment().format('YYYY-MM-DD')

            const todayDueDates = response?.data?.flatMap((medicine: any) =>
                (medicine?.due_dates || []).filter((dueDate: any) => dueDate.date === today)
            ) || []

            state.stats.medicinesPendingCount = todayDueDates.filter(
                (dueDate: any) => dueDate.status === null
            ).length

            state.stats.medicinesGivenCount = todayDueDates.filter(
                (dueDate: any) => ['delivered', 'given'].includes(dueDate.status)
            ).length

            state.stats.medicinesDeviatedCount = todayDueDates.filter(
                (dueDate: any) => dueDate.status === 'deviated'
            ).length
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchActiveTreatmentsCount() {
    try {
        const params: any = {
            is_completed: 0,
            department: departmentStore.getSelectedDepartmentName,
            per_page: 1,
        }
        const response = await dailyOverviewService.getTreatments(params)
        if (response) {
            state.stats.activeTreatmentsCount = response.total ?? response.data?.length ?? 0
        }
    } catch {
        // silently fail — widget shows 0
    }
}
</script>
