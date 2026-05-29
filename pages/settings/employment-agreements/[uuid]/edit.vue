<template>
    <div>
        <NuxtLayout name="user">
            <Head>
                <Title>{{ $t('employment.agreements.editAgreement') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>
            <template #header>{{ $t('employment.agreements.editAgreement') }}</template>
            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/settings/employment-agreements">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserEmploymentAgreementForm formType="update"
                        :selectedAgreement="state.formAgreement" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="updateAgreement" />
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
const router = useRouter()
const agreementUuid = router?.currentRoute?.value?.params?.uuid

const breadcrumbLinks = [
    { name: 'employment.agreements.agreements', translate: true, href: '/settings/employment-agreements' },
    { name: 'employment.agreements.editAgreement', translate: true, href: `/settings/employment-agreements/${agreementUuid}/edit` },
]

const state = reactive({
    error: {} as Error,
    formAgreement: {} as any,
    isPageLoading: false,
})

onMounted(() => { fetchAgreement() })

async function fetchAgreement() {
    state.isPageLoading = true
    try {
        const response = await employmentAgreementService.getAgreement(agreementUuid)
        if (response) state.formAgreement = response.data
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateAgreement(details: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await employmentAgreementService.updateAgreement(agreementUuid, details)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('employment.agreements.form.alert.agreementSuccessfullyUpdated')}.`)
            navigateTo('/settings/employment-agreements')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
