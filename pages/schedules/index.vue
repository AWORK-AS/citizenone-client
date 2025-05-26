<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>

                    {{ customPagesStore.getCustomPagesName?.dutySchedules }}
                    -
                    {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb>
                    <template #custom-link>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400"
                                aria-hidden="true" />
                            <button @click="navigateTo('/schedules')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ customPagesStore.getCustomPagesName?.dutySchedules }}
                            </button>
                        </div>
                    </template>
                </Breadcrumb>
            </template>

            <template #header>
                {{ customPagesStore.getCustomPagesName?.dutySchedules }}
            </template>
            <template #guided-tour>
                <Tooltip :text="$t('guidedTour')" @click="openGuidedTour()">
                    <Icon name="ph:question" class="size-6 cursor-pointer text-gray-700" aria-hidden="true" />
                </Tooltip>
            </template>

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
                <ModulesUserDutyScheduleWeekView v-if="state.calendarView === 'week'" />
            </div>

            <ModulesUserGuidedTourModalDutySchedule v-if="state.modal.isGuidedTourDutyScheduleOpen"
                :isModalOpen="state.modal.isGuidedTourDutyScheduleOpen" :isGuidedTour="false"
                @close="state.modal.isGuidedTourDutyScheduleOpen = false" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()
import { useCustomPagesStore } from '@/store/custom-pages'

const customPagesStore = useCustomPagesStore() as any

const state = reactive({
    calendarView: 'week',
    modal: {
        isGuidedTourDutyScheduleOpen: false,
    },
})

function openGuidedTour() {
    state.modal.isGuidedTourDutyScheduleOpen = true
}
</script>