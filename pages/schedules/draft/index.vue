<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>
                    {{ customPagesStore.getCustomPagesName?.dutySchedules }}
                    {{ $t('dutySchedules.draft.draft')?.toLowerCase() }}
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
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400"
                                aria-hidden="true" />
                            <button @click="navigateTo('/schedules/draft')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ customPagesStore.getCustomPagesName?.dutySchedules }}
                                <span class="lowercase">
                                    {{ $t('dutySchedules.draft.draft') }}
                                </span>
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
                    <FormButton buttonStyle="action" class="rounded-lg" @click="navigateTo('/schedules/draft/templates')">
                        <Icon name="ph:note" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('dutySchedules.draftTemplates.draftTemplates') }}
                    </FormButton>
                    <FormButton buttonStyle="action" class="rounded-lg" @click="state.modal.isPublishDraftOpen = true">
                        <Icon name="ph:check" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('dutySchedules.draft.publish') }}
                    </FormButton>
                </div>
            </template>

            <NuxtLink class="-mt-4 flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/schedules">
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

            <div class="space-y-5">
                <ModulesUserDutyScheduleDraftWeekView v-if="state.calendarView === 'week'" />
            </div>

            <ModulesUserDutyScheduleDraftModalShiftTypes :isModalOpen="state.modal.isShowAllShiftTypes"
                @close="state.modal.isShowAllShiftTypes = false" />
            <ModulesUserDutyScheduleDraftModalPublish :isModalOpen="state.modal.isPublishDraftOpen"
                @close="state.modal.isPublishDraftOpen = false" />
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
        isPublishDraftOpen: false,
        isShowAllShiftTypes: false,
    },
})
</script>