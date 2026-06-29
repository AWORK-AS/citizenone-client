<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('overview.statisticsTab') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>
                <div class="flex items-center gap-x-6">
                    <span v-if="!discoverCompleted"
                        class="text-slate-400 hover:text-slate-600 cursor-pointer transition-colors mb-1.5"
                        @click="navigateTo('/discover')">
                        {{ $t('discover.title') }}
                    </span>
                    <span class="text-slate-400 hover:text-slate-600 cursor-pointer transition-colors mb-1.5"
                        @click="navigateTo('/overview')">
                        {{ $t('overview.overview') }}
                    </span>
                    <span class="text-primary border-b-2 border-primary pb-1 font-semibold cursor-default">
                        {{ $t('overview.statisticsTab') }}
                    </span>
                </div>
            </template>

            <!-- Action bar -->
            <div class="flex items-center gap-x-3 flex-wrap">
                <button
                    class="flex items-center gap-x-1.5 text-sm text-slate-500 hover:text-primary transition-colors rounded-lg px-2.5 py-1.5 hover:bg-primary-25"
                    @click="state.modal.isFilterDailyOverviewOpen = true">
                    <Icon name="ph:sliders-horizontal" class="w-4 h-4" />
                    <span>{{ $t('showHide') }}</span>
                </button>
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

            <div class="mt-6 space-y-6">
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

                <!-- News section -->
                <div>
                    <p class="text-lg font-semibold text-slate-900">
                        {{ $t('overview.from') }} CitizenOne<sup class="text-xs">&#8482;</sup>
                    </p>
                    <div class="mt-3 grid grid-cols-1 md:grid-cols-7 gap-5" id="news">
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
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useUserStore } from '@/store/user'
import { useDailyOverviewStore } from '@/store/daily-overview'

const breadcrumbLinks = [
    {
        name: 'overview.overview',
        translate: true,
        href: '/overview',
    },
    {
        name: 'overview.statisticsTab',
        translate: true,
        href: '/statistics',
    },
]
const runtimeConfig = useRuntimeConfig()
const overviewStore = useDailyOverviewStore()
const userStore = useUserStore() as any
const { completed: discoverCompleted } = useDiscoverDone()

const state = reactive({
    currentDate: moment(),
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
    },
})

// Mirror the overview's saved date filter so the selected period is consistent
// when switching between the Overview and Statistics tabs.
function applyUserDateFilter(user: any) {
    const filter = user?.daily_overview_date_filter
    if (filter?.filter_type === 'today') {
        state.dateRange.formDateRange = {
            start_date: moment().format('YYYY-MM-DD'),
            end_date: moment().format('YYYY-MM-DD'),
        }
    } else if (filter?.filter_type === 'next_7_days') {
        state.dateRange.formDateRange = {
            start_date: moment().format('YYYY-MM-DD'),
            end_date: moment().add(1, 'week').format('YYYY-MM-DD'),
        }
    } else if (filter?.filter_type === 'custom') {
        state.dateRange.formDateRange = {
            start_date: moment(filter?.overview_date_start).format('YYYY-MM-DD'),
            end_date: moment(filter?.overview_date_end).format('YYYY-MM-DD'),
        }
    } else {
        state.dateRange.formDateRange = {
            start_date: moment().startOf('isoWeek').format('YYYY-MM-DD'),
            end_date: moment().endOf('isoWeek').format('YYYY-MM-DD'),
        }
    }
}

const route = useRoute()

onMounted(() => {
    if (userStore.getUser) applyUserDateFilter(userStore.getUser)
    // The navbar megaphone links here with #news; scroll once content is in.
    if (route.hash === '#news') {
        nextTick(() => {
            setTimeout(() => {
                document.getElementById('news')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }, 1500)
        })
    }
})

watch(() => userStore.getUser, (user: any) => {
    if (user) applyUserDateFilter(user)
})

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
    state.dateRange.formDateRange.start_date = start.clone().subtract(diff, 'days').format('YYYY-MM-DD')
    state.dateRange.formDateRange.end_date = end.clone().subtract(diff, 'days').format('YYYY-MM-DD')
    state.currentDate = moment(state.dateRange.formDateRange.start_date)
}

function nextDay() {
    const start = moment(state.dateRange.formDateRange.start_date)
    const end = moment(state.dateRange.formDateRange.end_date)
    const diff = end.diff(start, 'days') + 1
    state.dateRange.formDateRange.start_date = start.clone().add(diff, 'days').format('YYYY-MM-DD')
    state.dateRange.formDateRange.end_date = end.clone().add(diff, 'days').format('YYYY-MM-DD')
    state.currentDate = moment(state.dateRange.formDateRange.start_date)
}

function filterDailyOverviewByDate(formDateRange: any) {
    state.dateRange.formDateRange.start_date = formDateRange.start_date
    state.dateRange.formDateRange.end_date = formDateRange.end_date
}
</script>
