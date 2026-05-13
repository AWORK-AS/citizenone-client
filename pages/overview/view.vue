<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('overview.overview') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

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

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/overview">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
            </div>

            <div class="flex gap-x-2">
                <div class="flex items-center gap-x-2">
                    <button
                        class="flex items-center gap-x-1.5 text-sm text-slate-500 hover:text-primary transition-colors rounded-lg px-2.5 py-1.5 hover:bg-primary-25"
                        @click="state.modal.isFilterDailyOverviewViewAllOpen = true">
                        <Icon name="ph:sliders-horizontal" class="w-4 h-4" />
                        <span>{{ $t('showHide') }}</span>
                    </button>
                </div>
            </div>

            <div class="flex gap-x-3 justify-end">
                <FormButton buttonStyle="action" @click="navigateTo('/inquiries')">
                    <Icon name="ph:list-bullets" class="h-4 w-4" aria-hidden="true" />
                    {{ $t('inquiries.inquiries') }}
                </FormButton>
            </div>

            <div class="mt-6">
                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    <div v-if="overviewStore.getViewAllFilter.showCitizenDailyEvents">
                        <ModulesUserDailyOverviewCitizensDailyEvents :dateRange="state.dateRange.formDateRange" />
                    </div>
                    <div v-if="overviewStore.getViewAllFilter.showCitizenMedicineOverview">
                        <ModulesUserDailyOverviewCitizensMedicineOverview :dateRange="state.dateRange.formDateRange" />
                    </div>
                    <div v-if="overviewStore.getViewAllFilter.showLatestJournalNotes">
                        <ModulesUserDailyOverviewLatestJournal :dateRange="state.dateRange.formDateRange"
                            :viewAll="true" />
                    </div>
                </div>
            </div>

            <ModulesUserDailyOverviewFilterAllModalShowHide :isModalOpen="state.modal.isFilterDailyOverviewViewAllOpen"
                @close="state.modal.isFilterDailyOverviewViewAllOpen = false" />
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

const runtimeConfig = useRuntimeConfig()
const overviewStore = useDailyOverviewStore()
const userStore = useUserStore()

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
        isFilterDailyOverviewViewAllOpen: false,
    },
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
    }
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
    const newStart = start.clone().subtract(diff, 'days')
    const newEnd = end.clone().subtract(diff, 'days')
    state.dateRange.formDateRange.start_date = newStart.format('YYYY-MM-DD')
    state.dateRange.formDateRange.end_date = newEnd.format('YYYY-MM-DD')
    state.currentDate = newStart
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
}

async function filterDailyOverviewByDate(formDateRange: any) {
    state.dateRange.formDateRange.start_date = formDateRange.start_date
    state.dateRange.formDateRange.end_date = formDateRange.end_date
}
</script>
