<template>
    <div>
        <NuxtLayout name="citizen">

            <Head>
                <Title>{{ $t('dailyOverview.dailyOverview') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('dailyOverview.dailyOverview') }}</template>

            <div class="mt-2">
                <div class="space-y-10">
                    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        <ModulesCitizenDailyOverviewBulletBoard />
                    </div>
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()
</script>