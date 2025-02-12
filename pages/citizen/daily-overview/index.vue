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