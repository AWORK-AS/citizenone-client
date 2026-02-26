<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('scheduleTags.addNewScheduleTag') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('scheduleTags.addNewScheduleTag') }}</template>

            <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                to="/settings/schedule-tags">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </NuxtLink>
            <LoadingSpinner :isActive="state.isPageLoading">
                <ModulesUserScheduleTagForm formType="create" :selectedScheduleTag="state.formScheduleTag"
                    :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                    @submitForm="saveScheduleTag" />
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
const breadcrumbLinks = [
    {
        name: 'scheduleTags.scheduleTags',
        translate: true,
        href: '/settings/schedule-tags',
    },
    {
        name: 'scheduleTags.addNewScheduleTag',
        translate: true,
        href: '/settings/schedule-tags/new',
    },
]

const state = reactive({
    error: {} as Error,
    formScheduleTag: {
        name: '',
        departments: [],
        color: '#000000',
    },
    isPageLoading: false,
})

async function saveScheduleTag(tagDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            tag: tagDetails.name,
            departments_uuid: tagDetails.departments,
            color: tagDetails.color,
        }
        const response = await scheduleTagService.saveScheduleTag(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('scheduleTags.form.alert.newScheduleTagSuccessfullySaved')}.`)
            navigateTo('/settings/schedule-tags')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>