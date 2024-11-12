<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('dailyOverview.dailyOverview') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('dailyOverview.dailyOverview') }}</template>

            <div class="flex justify-end">
                <div class="w-fit cursor-pointer">
                    <FormButton buttonStyle="primary" @click="navigateTo('/daily-overview/view')">
                        {{ $t('dailyOverview.viewAll') }}
                    </FormButton>
                </div>
            </div>

            <div class="mt-6">
                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                    <div>
                        {{ $t('dailyOverview.citizensAdmissionAndDischarged') }}
                    </div>
                    <div>
                        {{ $t('dailyOverview.riskAssessment.riskAssessment') }}
                        <div class="space-y-1">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-x-1">
                                    <div class="w-2.5 h-2.5 bg-green-700 rounded-full"></div>
                                    <p class="text-sm">
                                        {{ $t('dailyOverview.riskAssessment.risk.noRisk') }}
                                    </p>
                                </div>
                                <p class="text-sm">0</p>
                            </div>
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-x-1">
                                    <div class="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>
                                    <p class="text-sm">
                                        {{ $t('dailyOverview.riskAssessment.risk.increasedRisk') }}
                                    </p>
                                </div>
                                <p class="text-sm">0</p>
                            </div>
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-x-1">
                                    <div class="w-2.5 h-2.5 bg-red-600 rounded-full"></div>
                                    <p class="text-sm">
                                        {{ $t('dailyOverview.riskAssessment.risk.acuteIncreasedRisk') }}
                                    </p>
                                </div>
                                <p class="text-sm">0</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        {{ $t('dailyOverview.citizensOrigin') }}
                    </div>
                    <div>
                        {{ $t('dailyOverview.gender.gender') }}
                    </div>
                    <div>
                        {{ $t('dailyOverview.citizensAddictions') }}
                    </div>
                    <div>
                        {{ $t('dailyOverview.citizensDiagnoses') }}
                    </div>
                </div>
                <div class="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                    <div>
                        <ModulesDailyOverviewMyEventToday />
                    </div>
                    <div>
                        <ModulesDailyOverviewCitizensDailyEvents />
                    </div>
                    <div>
                        <ModulesDailyOverviewLatestJournal />
                    </div>
                    <div>
                        <ModulesDailyOverviewCitizenMedicineOverview />
                    </div>
                </div>
                <div class="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                    <ModulesDailyOverviewBulletBoard />
                </div>
                <div class="mt-6">
                    <p class="text-xl font-bold text-primary">
                        {{ $t('dailyOverview.from') }} CitizenOne<sup class="text-sm">&#8482;</sup>
                    </p>
                </div>
                <div class="mt-2 grid grid-cols-1 md:grid-cols-7 gap-5">
                    <div class="min-h-44 md:col-span-4">
                        <ModulesDailyOverviewNews />
                    </div>
                    <div class="min-h-44 md:col-span-3">
                        <ModulesDailyOverviewPoll />
                    </div>
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()
</script>