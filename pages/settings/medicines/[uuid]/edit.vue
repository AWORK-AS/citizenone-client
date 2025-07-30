<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('medicines.editMedicine') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('medicines.editMedicine') }}</template>

            <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/settings/medicines">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </NuxtLink>
            <LoadingSpinner :isActive="state.isPageLoading">
                <ModulesUserMedicineForm formType="update" :selectedMedicine="state.formMedicine" :error="state.error"
                    @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="updateMedicine" />
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
const router = useRouter()
const medicineUuid = router?.currentRoute?.value?.params?.uuid
const breadcrumbLinks = [
    {
        name: 'medicines.medicines',
        translate: true,
        href: '/settings/medicines',
    },
    {
        name: 'medicines.editMedicine',
        translate: true,
        href: `/settings/medicines/${medicineUuid}/edit`,
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

onMounted(() => {
    fetchMedicine()
})

async function fetchMedicine() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await medicineService.getMedicine(medicineUuid)
        if (response) {
            state.formMedicine = {
                image: response?.data?.image_url ?? '',
                en_name: response?.data?.en_name ?? '',
                dk_name: response?.data?.dk_name ?? '',
                active_ingredients: response?.data?.ingredients ?? '',
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateMedicine(medicineDetails: any) {
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
        const response = await medicineService.updateMedicine(medicineUuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('medicines.form.alert.medicineSuccessfullyUpdated')}.`)
            navigateTo('/settings/medicines')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>