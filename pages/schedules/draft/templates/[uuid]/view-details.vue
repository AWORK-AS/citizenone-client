<template>
    <div>
        <NuxtLayout name="user">
            <Head>
                <Title>{{ $t('dutySchedules.draftTemplates.viewDraftTemplate') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #guided-tour>
                <div class="flex flex-wrap items-center gap-3">
                    <button @click="state.modal.isShowAllShiftTypes = !state.modal.isShowAllShiftTypes"
                        class="text-primary text-sm hover:text-primary-700">
                        {{ $t('dutySchedules.showTheDistributionOfShiftTypes') }}
                    </button>
                </div>
            </template>

            <template #header v-if="state?.draftTemplate?.name">{{ state?.draftTemplate?.name }} - {{ departmentStore?.getSelectedDepartmentName }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/schedules/draft/templates">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <div class="space-y-5">
                    <ModulesUserDutyScheduleDraftTemplatesWeekView v-if="state.calendarView === 'week'" />
                </div>
            </div>

            <ModulesUserDutyScheduleDraftTemplatesModalShiftTypes :isModalOpen="state.modal.isShowAllShiftTypes"
                @close="state.modal.isShowAllShiftTypes = false" />

        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useCustomPagesStore } from "@/store/custom-pages";
import { useDepartmentStore } from "@/store/department";
import { draftTemplateService } from "@/components/api/user/DraftTemplateService";

const runtimeConfig = useRuntimeConfig();
const customPagesStore = useCustomPagesStore() as any;
const departmentStore = useDepartmentStore() as any;
const router = useRouter()
const draftTemplateUuid = router?.currentRoute?.value?.params?.uuid

const breadcrumbLinks = [
    {
        name: customPagesStore.getCustomPagesName?.dutySchedules,
        translate: false,
        href: '/schedules',
    },
    {
        name: 'dutySchedules.draft.draft',
        translate: true,
        href: `/schedules/draft`,
    },
    {
        name: 'dutySchedules.draftTemplates.draftTemplates',
        translate: true,
        href: `/schedules/draft/templates`,
    },
    {
        name: 'dutySchedules.draftTemplates.viewDraftTemplate',
        translate: true,
        href: `/schedules/draft/templates/${draftTemplateUuid}/view-details`,
    },
]

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    calendarView: 'week',
    modal: {
        isShowAllShiftTypes: false,
    },
    draftTemplate: {} as any,
})

onMounted(() => {
    fetchDraftTemplate()
})

async function fetchDraftTemplate() {
    state.isPageLoading = true
    try {
        const response = await draftTemplateService.getDraftTemplateDetails(draftTemplateUuid as string)
        if (response) {
            state.draftTemplate = response.data
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

</script>