<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('dailyOverview.dailyOverview') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('dailyOverview.dailyOverview') }}</template>

            <div class="space-y-5">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div class="bg-white pt-6 pb-6 pl-6 shadow-md rounded-md">
                        <ModulesDailyOverviewTodaysEvent />
                    </div>
                    <div class="bg-white pt-6 pb-6 pl-6 shadow-md rounded-md">
                        <ModulesDailyOverviewLatestJournal />
                    </div>
                    <div class="bg-white pt-6 pb-6 pl-6 shadow-md rounded-md">
                        <ModulesDailyOverviewPoll />
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div class="min-h-44">
                        <ModulesDailyOverviewSalesCampaign />
                    </div>
                    <div class="min-h-44">
                        <ModulesDailyOverviewLatestNews />
                    </div>
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()
</script>