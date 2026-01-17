<template>
    <div>
        <NuxtLayout name="user">
            <Head>
                <Title>{{ $t('dutySchedules.published.viewPublishedVersion') }} - {{ runtimeConfig?.public?.appName }}</Title>
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

            <template #header v-if="versionName && versionName.length">{{versionName }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/schedules/draft/templates">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <div class="space-y-5">
                    <ModulesUserDutySchedulePublishedWeekView v-if="state.calendarView === 'week'" />
                </div>
            </div>

            <!-- <ModulesUserDutyScheduleDraftTemplatesModalShiftTypes :isModalOpen="state.modal.isShowAllShiftTypes"
                @close="state.modal.isShowAllShiftTypes = false" /> -->

        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useCustomPagesStore } from "@/store/custom-pages";
import { publishedVersionsService } from "~/components/api/user/PublishedVersionsService";

const runtimeConfig = useRuntimeConfig();
const customPagesStore = useCustomPagesStore() as any;
const router = useRouter()
const publishedVersionUuid = router?.currentRoute?.value?.params?.uuid

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
        href: `/schedules/draft/published/${publishedVersionUuid}/view-details`,
    },
]

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    calendarView: 'week',
    modal: {
        isShowAllShiftTypes: false,
    },
    publishedVersions: [] as any,
})

onMounted(() => {
    fetchPublishedVersionDetails()
})

const versionName = computed(() => {
    return state.publishedVersions && state.publishedVersions.length ? 'Version ' + state.publishedVersions[0]?.version_number : ''
})

async function fetchPublishedVersionDetails() {
    state.isPageLoading = true
    try {
        const response = await publishedVersionsService.getPublishedVersionDetails(publishedVersionUuid as string)
        if (response) {
            state.publishedVersions = response.data
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

</script>