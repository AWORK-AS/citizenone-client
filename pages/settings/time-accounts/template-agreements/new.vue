<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('timeAccounts.newTemplateAgreement') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('timeAccounts.newTemplateAgreement') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/settings/time-accounts?view=templateAgreements">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserTimeAccountsTemplateAgreementForm formType="create"
                        :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="saveTemplateAgreement" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { timeAccountTemplateAgreementService } from '~/components/api/user/TimeAccountTemplateAgreementService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()

const breadcrumbLinks = [
    {
        name: 'timeAccounts.timeAccounts',
        translate: true,
        href: '/settings/time-accounts',
    },
    {
        name: 'timeAccounts.newTemplateAgreement',
        translate: true,
        href: '/settings/time-accounts/template-agreements/new',
    },
]

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
})

async function saveTemplateAgreement(payload: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await timeAccountTemplateAgreementService.saveTemplateAgreement(payload)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('timeAccounts.templateAgreementsForm.alert.newTemplateAgreementSuccessfullySaved')}.`)
            navigateTo('/settings/time-accounts?view=templateAgreements')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
