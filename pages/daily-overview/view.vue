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

            <div class="flex justify-between">
                <button class="flex items-center gap-x-1 text-sm text-primary group"
                    @click="state.modal.isFilterDailyOverviewViewAllOpen = true">
                    <Icon name="ic:outline-filter-list" class="text-primary w-6 h-6 group-hover:text-primary-700" />
                    <span class="group-hover:text-primary-700">
                        {{ $t('showHide') }}
                    </span>
                </button>
                <div class="flex items-center gap-x-3">
                    <div class="space-y-1 col-span-1 md:col-span-3">
                        <FormLabel for="start_date" :label="$t('protocols.form.startDate')" />
                        <FormDateField id="start_date" name="start_date" :placeholder="$t('protocols.table.startDate')"
                            v-model="state.searchFilter.start_date" />
                    </div>
                    <div class="space-y-1 col-span-1 md:col-span-3">
                        <FormLabel for="end_date" :label="$t('protocols.form.endDate')" />
                        <FormDateField id="end_date" name="end_date" :placeholder="$t('protocols.table.endDate')"
                            v-model="state.searchFilter.end_date" />
                    </div>
                </div>
            </div>

            <div class="mt-6">
                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    <div v-if="dailyOverviewStore.getViewAllFilter.showCitizenDailyEvents">
                        <ModulesDailyOverviewCitizensDailyEvents :startDate="state.searchFilter.start_date"
                            :endDate="state.searchFilter.end_date" />
                    </div>
                    <div v-if="dailyOverviewStore.getViewAllFilter.showCitizenMedicineOverview">
                        <ModulesDailyOverviewCitizensMedicineOverview :startDate="state.searchFilter.start_date"
                            :endDate="state.searchFilter.end_date" />
                    </div>
                    <div v-if="dailyOverviewStore.getViewAllFilter.showLatestJournalNotes">
                        <ModulesDailyOverviewLatestJournal :startDate="state.searchFilter.start_date"
                            :endDate="state.searchFilter.end_date" />
                    </div>
                </div>
            </div>

            <ModulesDailyOverviewFilterModalDailyOverviewAll :isModalOpen="state.modal.isFilterDailyOverviewViewAllOpen"
                @close="state.modal.isFilterDailyOverviewViewAllOpen = false" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useDailyOverviewStore } from '@/store/daily-overview'

const runtimeConfig = useRuntimeConfig()
const dailyOverviewStore = useDailyOverviewStore()

const state = reactive({
    modal: {
        isFilterDailyOverviewViewAllOpen: false,
    },
    searchFilter: {
        'end_date': moment().format('YYYY-MM-DD'),
        'start_date': moment().format('YYYY-MM-DD'),
    },
})
</script>
