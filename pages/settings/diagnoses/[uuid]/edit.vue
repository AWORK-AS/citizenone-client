<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('diagnoses.editDiagnosis') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('diagnoses.editDiagnosis') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/settings/diagnoses">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserDiagnosisForm formType="update" :selectedDiagnosis="state.formDiagnosis"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="updateDiagnosis" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { diagnosisService } from '@/components/api/user/DiagnosisService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const diagnosisUuid = router?.currentRoute?.value?.params?.uuid
const breadcrumbLinks = [
    {
        name: 'diagnoses.diagnoses',
        translate: true,
        href: '/settings/diagnoses',
    },
    {
        name: 'diagnoses.editDiagnosis',
        translate: true,
        href: `/settings/diagnoses/${diagnosisUuid}/edit`,
    },
]

const state = reactive({
    error: {} as Error,
    formDiagnosis: {
        name: '',
    },
    isPageLoading: false,
})

onMounted(() => {
    fetchDiagnosis()
})

async function fetchDiagnosis() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await diagnosisService.getDiagnosis(diagnosisUuid)
        if (response) {
            state.formDiagnosis = {
                name: response?.data?.name ?? '',
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateDiagnosis(diagnosisDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: diagnosisDetails.name,
        }
        const response = await diagnosisService.updateDiagnosis(diagnosisUuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('diagnoses.form.alert.diagnosisSuccessfullyUpdated')}.`)
            navigateTo('/settings/diagnoses')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>