<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('dailyOverview.dailyOverview') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('dailyOverview.dailyOverview') }}</template>

            <button class="flex items-center gap-x-1 text-sm text-primary group"
                @click="state.modal.isFilterDailyOverviewOpen = true">
                <Icon name="ic:outline-filter-list" class="text-primary w-6 h-6 group-hover:text-primary-700" />
                <span class="group-hover:text-primary-700">
                    {{ $t('showHide') }}
                </span>
            </button>

            <div class="mt-2">
                <div class="space-y-10">
                    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                        <div v-if="dailyOverviewStore.getDailyOverviewFilter.showCitizensAdmissionAndDischarged">
                            <ModulesDailyOverviewCitizensAdmissionDischarged />
                        </div>
                        <div class="space-y-3"
                            v-if="dailyOverviewStore.getDailyOverviewFilter.showRiskAssessment || dailyOverviewStore.getDailyOverviewFilter.showGender">
                            <ModulesDailyOverviewCitizensRiskAssessment
                                v-if="dailyOverviewStore.getDailyOverviewFilter.showRiskAssessment" />
                            <ModulesDailyOverviewCitizensGender
                                v-if="dailyOverviewStore.getDailyOverviewFilter.showGender" />
                        </div>
                        <div v-if="dailyOverviewStore.getDailyOverviewFilter.showCitizensOrigin">
                            <ModulesDailyOverviewCitizensOrigin />
                        </div>
                        <div class="space-y-3"
                            v-if="dailyOverviewStore.getDailyOverviewFilter.showCitizensAddictions || dailyOverviewStore.getDailyOverviewFilter.showCitizensDiagnoses">
                            <ModulesDailyOverviewCitizensAddictions
                                v-if="dailyOverviewStore.getDailyOverviewFilter.showCitizensAddictions" />
                            <ModulesDailyOverviewCitizensDiagnoses
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
                                <ModulesDailyOverviewMyEventToday />
                            </div>
                            <div v-if="dailyOverviewStore.getDailyOverviewFilter.showCitizensDailyEvents">
                                <ModulesDailyOverviewCitizensDailyEvents />
                            </div>
                            <div v-if="dailyOverviewStore.getDailyOverviewFilter.showLatestJournal">
                                <ModulesDailyOverviewLatestJournal />
                            </div>
                            <div v-if="dailyOverviewStore.getDailyOverviewFilter.showDailyMedicineOverview">
                                <ModulesDailyOverviewCitizensMedicineOverview />
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5"
                        v-if="dailyOverviewStore.getDailyOverviewFilter.showBulletBoard">
                        <ModulesDailyOverviewBulletBoard />
                    </div>
                    <div>
                        <p class="text-xl font-bold text-primary">
                            {{ $t('dailyOverview.from') }} CitizenOne<sup class="text-sm">&#8482;</sup>
                        </p>
                        <div class="mt-2 grid grid-cols-1 md:grid-cols-7 gap-5">
                            <div class="min-h-44 md:col-span-4">
                                <ModulesDailyOverviewNews />
                            </div>
                            <div class="min-h-44 md:col-span-3">
                                <ModulesDailyOverviewPoll />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ModulesDailyOverviewModalFilter :isModalOpen="state.modal.isFilterDailyOverviewOpen"
                @close="state.modal.isFilterDailyOverviewOpen = false" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useDailyOverviewStore } from '@/store/daily-overview'

const runtimeConfig = useRuntimeConfig()
const dailyOverviewStore = useDailyOverviewStore()

const state = reactive({
    modal: {
        isFilterDailyOverviewOpen: false,
    }
})
</script>