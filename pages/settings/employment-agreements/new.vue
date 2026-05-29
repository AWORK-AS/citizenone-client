<template>
    <div>
        <NuxtLayout name="user">
            <Head>
                <Title>{{ $t('employment.agreements.newAgreement') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>
            <template #header>{{ $t('employment.agreements.newAgreement') }}</template>
            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/settings/employment-agreements">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserEmploymentAgreementForm formType="create"
                        :selectedAgreement="state.formAgreement" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="saveAgreement" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { employmentAgreementService } from '@/components/api/user/EmploymentService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const breadcrumbLinks = [
    { name: 'employment.agreements.agreements', translate: true, href: '/settings/employment-agreements' },
    { name: 'employment.agreements.newAgreement', translate: true, href: '/settings/employment-agreements/new' },
]

const state = reactive({
    error: {} as Error,
    formAgreement: { name: '', jobcenter_uuid: null, description: '', default_duration_weeks: null, sort_order: 0, is_active: true },
    isPageLoading: false,
})

async function saveAgreement(details: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await employmentAgreementService.saveAgreement(details)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('employment.agreements.form.alert.newAgreementSuccessfullySaved')}.`)
            navigateTo('/settings/employment-agreements')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
