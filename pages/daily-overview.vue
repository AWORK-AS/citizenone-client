<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('dailyOverview.dailyOverview') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('dailyOverview.dailyOverview') }}</template>

            <div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div>
                        <ModulesDailyOverviewTodaysEvent />
                    </div>
                    <div>
                        <ModulesDailyOverviewLatestJournal />
                    </div>
                    <div>
                        <ModulesDailyOverviewBulletBoard />
                    </div>
                </div>
                <div class="mt-6">
                    <p class="text-xl font-bold text-secondary">
                        From CitizenOne&#8482;
                    </p>
                </div>
                <div class="mt-2 grid grid-cols-1 md:grid-cols-7 gap-5">
                    <div class="min-h-44 md:col-span-4">
                        <ModulesDailyOverviewSalesCampaign />
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