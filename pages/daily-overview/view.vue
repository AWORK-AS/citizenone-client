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
                <div class="flex items-center gap-x-3">
                    <p class="text-sm">{{ $t('dailyOverview.filter.show') }}</p>
                    <FormButton buttonSize="sm" :class="[
                        dailyOverviewStore.getViewAllFilter.showCitizenDailyEvents && 'border-secondary bg-secondary text-white',
                        'rounded-md w-full md:w-fit']"
                        @click="dailyOverviewStore.setViewAllShowCitizenDailyEvents(!dailyOverviewStore.getViewAllFilter.showCitizenDailyEvents)">
                        {{ $t('dailyOverview.citizensDailyEvents') }}
                    </FormButton>
                    <FormButton buttonSize="sm" :class="[
                        dailyOverviewStore.getViewAllFilter.showCitizenMedicineOverview && 'border-secondary bg-secondary text-white',
                        'rounded-md w-full md:w-fit']"
                        @click="dailyOverviewStore.setViewAllShowCitizenMedicineOverview(!dailyOverviewStore.getViewAllFilter.showCitizenMedicineOverview)">
                        {{ $t('dailyOverview.dailyMedicineOverview.dailyMedicineOverview') }}
                    </FormButton>
                    <FormButton buttonSize="sm" :class="[
                        dailyOverviewStore.getViewAllFilter.showLatestJournalNotes && 'border-secondary bg-secondary text-white',
                        'rounded-md w-full md:w-fit']"
                        @click="dailyOverviewStore.setViewAllShowLatestJournalNotes(!dailyOverviewStore.getViewAllFilter.showLatestJournalNotes)">
                        {{ $t('dailyOverview.latestJournal') }}
                    </FormButton>
                </div>
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
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useDailyOverviewStore } from '@/store/daily-overview'

const runtimeConfig = useRuntimeConfig()
const dailyOverviewStore = useDailyOverviewStore()

const state = reactive({
    searchFilter: {
        'end_date': moment().format('YYYY-MM-DD'),
        'start_date': moment().format('YYYY-MM-DD'),
    },
})
</script>
