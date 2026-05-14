<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('dosageForms.editDosageForm') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('dosageForms.editDosageForm') }}</template>

            <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/settings/dosage-forms">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </NuxtLink>
            <LoadingSpinner :isActive="state.isPageLoading">
                <ModulesUserDosageForm formType="update" :selectedDosageForm="state.formDosageForm" :error="state.error"
                    @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="updateDosageForm" />
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { dosageFormService } from '@/components/api/user/DosageFormService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const dosageFormUuid = router?.currentRoute?.value?.params?.uuid
const breadcrumbLinks = [
    {
        name: 'dosageForms.dosageForms',
        translate: true,
        href: '/settings/dosage-forms',
    },
    {
        name: 'dosageForms.editDosageForm',
        translate: true,
        href: `/settings/dosage-forms/${dosageFormUuid}/edit`,
    },
]

const state = reactive({
    error: {} as Error,
    formDosageForm: {
        en_name: '',
        dk_name: '',
        no_name: '',
        sv_name: '',
    },
    isPageLoading: false,
})

onMounted(() => {
    fetchShift()
})

async function fetchShift() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await dosageFormService.getDosageForm(dosageFormUuid)
        if (response) {
            state.formDosageForm = {
                en_name: response?.data?.en_name ?? '',
                dk_name: response?.data?.dk_name ?? '',
                no_name: response?.data?.no_name ?? '',
                sv_name: response?.data?.sv_name ?? '',
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateDosageForm(dosageFormDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            en_name: dosageFormDetails.en_name,
            dk_name: dosageFormDetails.dk_name,
            no_name: dosageFormDetails.no_name,
            sv_name: dosageFormDetails.sv_name,
        }
        const response = await dosageFormService.updateDosageForm(dosageFormUuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('dosageForms.form.alert.dosageFormSuccessfullyUpdated')}.`)
            navigateTo('/settings/dosage-forms')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>