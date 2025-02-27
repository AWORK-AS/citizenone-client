<template>
    <div>
        <NuxtLayout name="citizen">

            <Head>
                <Title>

                    {{ customPagesStore.getCustomPagesName?.dutySchedules }}
                    -
                    {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #header>
                {{ customPagesStore.getCustomPagesName?.dutySchedules }}
            </template>

            <div class="mt-5 space-y-5">
                <ModulesUserCitizenDutyScheduleWeekView v-if="state.calendarView === 'week'" />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()
import { useCustomPagesStore } from '@/store/custom-pages'
import { useUserStore } from '@/store/user'

const customPagesStore = useCustomPagesStore() as any
const userStore = useUserStore() as any

const state = reactive({
    calendarView: 'week',
})
</script>