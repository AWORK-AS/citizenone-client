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

            <template #guided-tour>
                <div class="flex flex-wrap items-center gap-3">
                    <button @click="state.modal.isShowAllShiftTypes = !state.modal.isShowAllShiftTypes"
                        class="text-primary text-sm hover:text-primary-700">
                        {{ $t('dutySchedules.showTheDistributionOfShiftTypes') }}
                    </button>
                    <FormButton buttonStyle="action" class="rounded-lg" @click="navigateTo('/schedules/draft')"
                        v-if="isAdmin(userStore.getUser?.role)">
                        <Icon name="ph:note" class="h-4 w-4" aria-hidden="true" />
                        {{ customPagesStore.getCustomPagesName?.dutySchedules }}
                        {{ $t('dutySchedules.draft.draft')?.toLowerCase() }}
                    </FormButton>
                    <FormButton buttonStyle="action" class="rounded-lg" @click="navigateTo('/schedules/draft-templates')"
                        v-if="isAdmin(userStore.getUser?.role)">
                        <Icon name="ph:note" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('dutySchedules.draftTemplates.draftTemplates') }}
                    </FormButton>
                    <FormButton buttonStyle="action" class="rounded-lg" @click="state.modal.isDownloadOpen = true">
                        <Icon name="ph:download" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('dutySchedules.download.download') }}
                    </FormButton>
                    <Tooltip :text="$t('dutySchedules.activityLogs')" @click="openDutySchedulesActivityLogs()">
                        <Icon name="ph:clock-counter-clockwise" class="size-6 cursor-pointer text-gray-700"
                            aria-hidden="true" />
                    </Tooltip>
                    <Tooltip :text="$t('guidedTour')" @click="openGuidedTour()">
                        <Icon name="ph:question" class="size-6 cursor-pointer text-gray-700" aria-hidden="true" />
                    </Tooltip>
                </div>
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

            <div class="-mt-4 space-y-5">
                <ModulesUserDutyScheduleWeekView v-if="state.calendarView === 'week'" />
            </div>

            <ModulesUserDutyScheduleModalShiftTypes :isModalOpen="state.modal.isShowAllShiftTypes"
                @close="state.modal.isShowAllShiftTypes = false" />
            <ModulesUserDutyScheduleActivityLogsModalHistory :isModalOpen="state.modal.isActivityLogsOpen"
                @close="state.modal.isActivityLogsOpen = false" />
            <ModulesUserGuidedTourModalDutySchedule v-if="state.modal.isGuidedTourDutyScheduleOpen"
                :isModalOpen="state.modal.isGuidedTourDutyScheduleOpen" :isGuidedTour="false"
                @close="state.modal.isGuidedTourDutyScheduleOpen = false" />
        </NuxtLayout>
        <ModulesUserDutyScheduleModalDownload :isModalOpen="state.modal.isDownloadOpen"
            @close="state.modal.isDownloadOpen = false" />
    </div>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()
import { useUserStore } from '@/store/user'
import { useCustomPagesStore } from '@/store/custom-pages'

const customPagesStore = useCustomPagesStore() as any
const userStore = useUserStore() as any

const state = reactive({
    calendarView: 'week',
    modal: {
        isActivityLogsOpen: false,
        isDownloadOpen: false,
        isGuidedTourDutyScheduleOpen: false,
        isShowAllShiftTypes: false,
    },
})

function openDutySchedulesActivityLogs() {
    state.modal.isActivityLogsOpen = true
}

function openGuidedTour() {
    state.modal.isGuidedTourDutyScheduleOpen = true
}

function isAdmin(role: any) {
    return role && role === 'Admin'
}
</script>