<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('scheduleTags.editScheduleTag') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('scheduleTags.editScheduleTag') }}</template>

            <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                to="/settings/schedule-tags">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </NuxtLink>
            <LoadingSpinner :isActive="state.isPageLoading">
                <ModulesUserScheduleTagForm formType="update" :selectedTag="state.formScheduleTag" :error="state.error"
                    @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="updateScheduleTag" />
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { scheduleTagService } from '@/components/api/user/ScheduleTagService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const scheduleTagUuid = router?.currentRoute?.value?.params?.uuid
const breadcrumbLinks = [
    {
        name: 'scheduleTags.scheduleTags',
        translate: true,
        href: '/settings/schedule-tags',
    },
    {
        name: 'scheduleTags.editScheduleTag',
        translate: true,
        href: `/settings/schedule-tags/${scheduleTagUuid}/edit`,
    },
]

const state = reactive({
    error: {} as Error,
    formScheduleTag: {
        name: '',
        departments: [],
        color: '#000000',
    } as any,
    isPageLoading: false,
})

onMounted(() => {
    fetchScheduleTag()
})

async function fetchScheduleTag() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await scheduleTagService.getScheduleTag(scheduleTagUuid)
        if (response) {
            state.formScheduleTag = {
                name: response?.data?.tag ?? '',
                departments: [],
                color: response?.data?.color ?? '',
            }
            response?.data?.departments?.forEach((department: any) => {
                state.formScheduleTag.departments.push(department?.uuid)
            })
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateScheduleTag(tagDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            tag: tagDetails.name,
            departments_uuid: tagDetails.departments,
            color: tagDetails.color,
        }
        const response = await scheduleTagService.updateScheduleTag(scheduleTagUuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('scheduleTags.form.alert.scheduleTagSuccessfullyUpdated')}.`)
            navigateTo('/settings/schedule-tags')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>