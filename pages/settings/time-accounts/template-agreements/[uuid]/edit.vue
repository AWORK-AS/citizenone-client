<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('timeAccounts.editTemplateAgreement') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('timeAccounts.editTemplateAgreement') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/settings/time-accounts?view=templateAgreements">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserTimeAccountsTemplateAgreementForm formType="update"
                        :selectedTemplateAgreement="state.formTemplateAgreement" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="updateTemplateAgreement" />
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
const router = useRouter()
const templateAgreementUuid = router?.currentRoute?.value?.params?.uuid

const breadcrumbLinks = [
    {
        name: 'timeAccounts.timeAccounts',
        translate: true,
        href: '/settings/time-accounts',
    },
    {
        name: 'timeAccounts.editTemplateAgreement',
        translate: true,
        href: `/settings/time-accounts/template-agreements/${templateAgreementUuid}/edit`,
    },
]

const state = reactive({
    error: {} as Error,
    formTemplateAgreement: {} as any,
    isPageLoading: false,
})

onMounted(() => {
    fetchTemplateAgreement()
})

async function fetchTemplateAgreement() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await timeAccountTemplateAgreementService.getTemplateAgreement(templateAgreementUuid)
        if (response?.data) {
            state.formTemplateAgreement = {
                name: response.data.name ?? '',
                time_account_uuids: (response.data.time_accounts ?? []).map((ta: any) => ta.uuid), time_account_uuid: response.data.time_account_uuid ?? [],
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateTemplateAgreement(payload: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await timeAccountTemplateAgreementService.updateTemplateAgreement(templateAgreementUuid, payload)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('timeAccounts.templateAgreementsForm.alert.templateAgreementSuccessfullyUpdated')}.`)
            navigateTo('/settings/time-accounts?view=templateAgreements')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
