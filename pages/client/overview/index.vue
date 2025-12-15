<template>
    <div>
        <NuxtLayout name="client">

            <Head>
                <Title>{{ $t('overview.dailyOverview') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('overview.dailyOverview') }}</template>

            <div class="mt-2">
                <div class="space-y-10">
                    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-5">
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