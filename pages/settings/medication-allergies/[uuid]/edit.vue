<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>
                    {{ $t('medicationAllergies.editMedicationAllergy') }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('medicationAllergies.editMedicationAllergy') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/settings/medication-allergies">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserMedicationAllergyForm formType="update"
                        :selectedMedicationAllergy="state.formMedicationAllergy" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="updateMedicationAllergy" />
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
const router = useRouter()
const medicationAllergyUuid = router?.currentRoute?.value?.params?.uuid
const breadcrumbLinks = [
    {
        name: 'medicationAllergies.medicationAllergies',
        translate: true,
        href: '/settings/medication-allergies',
    },
    {
        name: 'medicationAllergies.editMedicationAllergy',
        translate: true,
        href: `/settings/medication-allergies/${medicationAllergyUuid}/edit`,
    },
]

const state = reactive({
    error: {} as Error,
    formMedicationAllergy: {
        name: '',
    },
    isPageLoading: false,
})

onMounted(() => {
    fetchMedicationAllergy()
})

async function fetchMedicationAllergy() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await medicationAllergyService.getMedicationAllergy(medicationAllergyUuid)
        if (response) {
            state.formMedicationAllergy = {
                name: response?.data?.name ?? '',
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateMedicationAllergy(medicationAllergyDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: medicationAllergyDetails.name,
        }
        const response = await medicationAllergyService.updateMedicationAllergy(medicationAllergyUuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('medicationAllergies.form.alert.medicationAllergySuccessfullyUpdated')}.`)
            navigateTo('/settings/medication-allergies')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>