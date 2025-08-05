<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('medicines.addNewMedicine') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('medicines.addNewMedicine') }}</template>

            <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/settings/medicines">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </NuxtLink>
            <LoadingSpinner :isActive="state.isPageLoading">
                <ModulesUserMedicineForm formType="create" :selectedMedicine="state.formMedicine" :error="state.error"
                    @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="saveMedicine" />
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { medicineService } from '@/components/api/user/MedicineService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const breadcrumbLinks = [
    {
        name: 'medicines.medicines',
        translate: true,
        href: '/settings/medicines',
    },
    {
        name: 'medicines.addNewMedicine',
        translate: true,
        href: '/settings/medicines/new',
    },
]

const state = reactive({
    error: {} as Error,
    formMedicine: {
        image: '',
        en_name: '',
        dk_name: '',
        active_ingredients: '',
    },
    isPageLoading: false,
})

async function saveMedicine(medicineDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        let params = new FormData()
        if (medicineDetails?.image) {
            params.append('image', medicineDetails.image)
        }
        params.append('en_name', medicineDetails.en_name)
        params.append('dk_name', medicineDetails.dk_name)
        params.append('ingredients', medicineDetails.active_ingredients)
        const response = await medicineService.saveMedicine(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('medicines.form.alert.newMedicineSuccessfullySaved')}.`)
            navigateTo('/settings/medicines')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>