<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>
                    {{ $t('dutySchedules.draft.draft') }}
                    {{ customPagesStore.getCustomPagesName?.dutySchedules }}
                    -
                    {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #header>
                {{ $t('dutySchedules.draft.draft') }}
                {{ customPagesStore.getCustomPagesName?.dutySchedules }}
            </template>

            <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/schedules">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </NuxtLink>

            <!-- <div class="flex items-center gap-x-3">
                <FormButton :buttonStyle="state.calendarView === 'default' ? 'primary' : ''"
                    @click="setCalendarView('default')" class="rounded-md">
                    {{ $t('calendar.view.defaultView') }}
                </FormButton>
                <FormButton :buttonStyle="state.calendarView === 'week' ? 'primary' : ''"
                    @click="setCalendarView('week')" class="rounded-md">
                    {{ $t('calendar.view.weekView') }}
                </FormButton>
                <FormButton :buttonStyle="state.calendarView === 'month' ? 'primary' : ''"
                    @click="setCalendarView('month')" class="rounded-md">
                    {{ $t('calendar.view.monthView') }}
                </FormButton>
            </div> -->

            <div class="mt-5 space-y-5">
                <ModulesDutyScheduleDraftWeekView v-if="state.calendarView === 'week'" />
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

function customPage(page: String) {
    return userStore.getUser?.custom_pages?.find((item: any) => item.page_type ===
        page)?.custom_name
}
</script>