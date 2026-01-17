<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>
                    {{ $t('dutySchedules.draft.pageTitle') }}
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
                                {{ $t('dutySchedules.draft.pageTitle') }}
                            </button>
                        </div>
                    </template>
                </Breadcrumb>
            </template>

            <template #header>
                <div class="flex items-center gap-x-6">
                    <span>
                        {{ $t('dutySchedules.draft.pageTitle') }} - {{ departmentStore.getSelectedDepartmentName }}
                    </span>
                    <NuxtLink to="/schedules/draft/published" class="text-primary text-sm hover:text-primary-700 font-normal">
                        {{ $t('dutySchedules.published.seePrevious') }}
                    </NuxtLink>
                </div>
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

            <div class="space-y-5">
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/schedules">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesUserDutyScheduleDraftWeekView v-if="state.calendarView === 'week' && state.hasContext" />
            </div>

            <ModulesUserDutyScheduleDraftModalShiftTypes :isModalOpen="state.modal.isShowAllShiftTypes"
                @close="state.modal.isShowAllShiftTypes = false" />
            <ModulesUserDutyScheduleDraftModalPublish :isModalOpen="state.modal.isPublishDraftOpen"
                @close="state.modal.isPublishDraftOpen = false" />
            <ModulesUserDutyScheduleDraftModalSelectDepartment
                :isModalOpen="state.modal.isSelectDepartmentModalOpen"
                @close="state.modal.isSelectDepartmentModalOpen = false"
                @select-department="selectDepartment" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()
import { useCustomPagesStore } from '@/store/custom-pages'
import { useDepartmentStore } from '@/store/department'

const customPagesStore = useCustomPagesStore() as any
const departmentStore = useDepartmentStore() as any

const state = reactive({
    calendarView: 'week',
    hasContext: true,
    modal: {
        isPublishDraftOpen: false,
        isShowAllShiftTypes: false,
        isSelectDepartmentModalOpen: false,
    },
})

onMounted(() => {
    if (!localStorage.getItem('schedulesDraftContextHidden')) {
        state.hasContext = false
        state.modal.isSelectDepartmentModalOpen = true
    }
})

function selectDepartment() {
    state.hasContext = true
    state.modal.isSelectDepartmentModalOpen = false
}
</script>