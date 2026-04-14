<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('overview.overview') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('overview.overview') }}</template>
            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/overview">
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
                <div>
                    <Icon name="ph:question" class="w-4 h-4 cursor-pointer text-gray-700" aria-hidden="true"
                        @click="state.modal.isDateRangeHelperOpen = true" />
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
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useDailyOverviewStore } from '@/store/daily-overview'

const runtimeConfig = useRuntimeConfig()
const overviewStore = useDailyOverviewStore()
const userStore = useUserStore()
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

async function filterDailyOverviewByDate(formDateRange: any) {
    state.dateRange.formDateRange.start_date = formDateRange.start_date
    state.dateRange.formDateRange.end_date = formDateRange.end_date
}
</script>
