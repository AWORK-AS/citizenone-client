<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('diagnoses.newDiagnosis') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('diagnoses.newDiagnosis') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/settings/diagnoses">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserDiagnosisForm formType="create" :selectedDiagnosis="state.formDiagnosis"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="saveDiagnosis" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { diagnosisService } from '@/components/api/DiagnosisService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const breadcrumbLinks = [
    {
        name: 'diagnoses.diagnoses',
        translate: true,
        href: '/settings/diagnoses',
    },
    {
        name: 'diagnoses.newDiagnosis',
        translate: true,
        href: '/settings/diagnoses/new',
    },
]

const state = reactive({
    error: {} as Error,
    formDiagnosis: {
        name: '',
    },
    isPageLoading: false,
})

async function saveDiagnosis(diagnosisDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: diagnosisDetails.name,
        }
        const response = await diagnosisService.saveDiagnosis(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('diagnoses.form.alert.newDiagnosisSuccessfullySaved')}.`)
            navigateTo('/settings/diagnoses')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>