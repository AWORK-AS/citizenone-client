<template>
    <div>
        <NuxtLayout name="user">
            <Head>
                <Title>{{ $t('dutySchedules.draftTemplates.viewDraftTemplate') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('dutySchedules.draftTemplates.viewDraftTemplate') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/schedules/draft-templates">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <div class="space-y-5">
                    <ModulesUserDutyScheduleDraftTemplatesWeekView v-if="state.calendarView === 'week'" />
                </div>
            </div>

        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useCustomPagesStore } from "@/store/custom-pages";

const runtimeConfig = useRuntimeConfig();
const customPagesStore = useCustomPagesStore() as any;
const router = useRouter()
const draftTemplateUuid = router?.currentRoute?.value?.params?.uuid

const breadcrumbLinks = [
    {
        name: customPagesStore.getCustomPagesName?.dutySchedules,
        translate: false,
        href: '/schedules',
    },
    {
        name: 'dutySchedules.draftTemplates.draftTemplates',
        translate: true,
        href: `/schedules/draft-templates`,
    },
    {
        name: 'dutySchedules.draftTemplates.viewDraftTemplate',
        translate: true,
        href: `/schedules/draft-templates/${draftTemplateUuid}/view-details`,
    },
]

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    calendarView: 'week',
})

</script>