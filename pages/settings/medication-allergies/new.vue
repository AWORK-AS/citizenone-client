<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>
                    {{ $t('medicationAllergies.newMedicationAllergy') }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('medicationAllergies.newMedicationAllergy') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/settings/medication-allergies">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserMedicationAllergyForm formType="create"
                        :selectedMedicationAllergy="state.formMedicationAllergy" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="saveMedicationAllergy" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { medicationAllergyService } from '@/components/api/user/MedicationAllergyService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const breadcrumbLinks = [
    {
        name: 'medicationAllergies.medicationAllergies',
        translate: true,
        href: '/settings/medication-allergies',
    },
    {
        name: 'medicationAllergies.newMedicationAllergy',
        translate: true,
        href: '/settings/medication-allergies/new',
    },
]

const state = reactive({
    error: {} as Error,
    formMedicationAllergy: {
        name: '',
    },
    isPageLoading: false,
})

async function saveMedicationAllergy(medicationAllergyDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: medicationAllergyDetails.name,
        }
        const response = await medicationAllergyService.saveMedicationAllergy(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('medicationAllergies.form.alert.newMedicationAllergiesSuccessfullySaved')}.`)
            navigateTo('/settings/medication-allergies')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>