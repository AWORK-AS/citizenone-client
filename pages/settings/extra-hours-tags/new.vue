<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('extraHoursTags.addNewExtraHoursTag') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('extraHoursTags.addNewExtraHoursTag') }}</template>

            <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                to="/settings/extra-hours-tags">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </NuxtLink>
            <LoadingSpinner :isActive="state.isPageLoading">
                <ModulesUserExtraHoursTagForm formType="create" :selectedExtraHoursTag="state.formExtraHoursTag"
                    :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                    @submitForm="saveBookingTag" />
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { extraHoursTagService } from '@/components/api/user/ExtraHoursTagService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const breadcrumbLinks = [
    {
        name: 'extraHoursTags.extraHoursTags',
        translate: true,
        href: '/settings/extra-hours-tags',
    },
    {
        name: 'extraHoursTags.addNewExtraHoursTag',
        translate: true,
        href: '/settings/extra-hours-tags/new',
    },
]

const state = reactive({
    error: {} as Error,
    formExtraHoursTag: {
        name: '',
        departments: [],
    },
    isPageLoading: false,
})

async function saveBookingTag(tagDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            tag: tagDetails.name,
            departments_uuid: tagDetails.departments,
        }
        const response = await extraHoursTagService.saveExtraHoursTag(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('extraHoursTags.form.alert.newExtraHoursTagSuccessfullySaved')}.`)
            navigateTo('/settings/extra-hours-tags')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>