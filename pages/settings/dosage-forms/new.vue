<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('dosageForms.addNewDosageForm') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('dosageForms.addNewDosageForm') }}</template>

            <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/settings/dosage-forms">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </NuxtLink>
            <LoadingSpinner :isActive="state.isPageLoading">
                <ModulesUserDosageForm formType="create" :selectedDosageForm="state.formDosageForm" :error="state.error"
                    @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="saveDosageForm" />
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
const breadcrumbLinks = [
    {
        name: 'dosageForms.dosageForms',
        translate: true,
        href: '/settings/dosage-forms',
    },
    {
        name: 'dosageForms.addNewDosageForm',
        translate: true,
        href: '/settings/dosage-forms/new',
    },
]

const state = reactive({
    error: {} as Error,
    formDosageForm: {
        en_name: '',
        dk_name: '',
    },
    isPageLoading: false,
})

async function saveDosageForm(dosageFormDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            en_name: dosageFormDetails.en_name,
            dk_name: dosageFormDetails.dk_name,
        }
        const response = await dosageFormService.saveDosageForm(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('dosageForms.form.alert.newDosageFormSuccessfullySaved')}.`)
            navigateTo('/settings/dosage-forms')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>