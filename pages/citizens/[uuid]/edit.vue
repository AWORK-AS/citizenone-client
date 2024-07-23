<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizens.editCitizen') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('citizens.editCitizen') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/citizens">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesCitizenDetailsForm formType="update" :selectedCitizen="state.formCitizen"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="updateCitizen" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { citizenService } from '@/components/api/CitizenService'
import { useI18n } from "vue-i18n"
import { notify } from "@kyvg/vue3-notification"
import type { CitizenForm, CitizenResponse, Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid

const state = reactive({
    error: {} as Error,
    formCitizen: {
        image: '',
        firstname: '',
        lastname: '',
        email: '',
        social_security_number: '',
        birthday: '',
        phone: '',
        departments: [],
        street: '',
        region_id: '',
        municipality_id: '',
        city_id: '',
        post_code: '',
        diagnosis: '',
    } as CitizenForm,
    isPageLoading: false,
})

onMounted(() => {
    fetchCitizen()
})

async function fetchCitizen() {
    state.isPageLoading = true
    state.error = {}
    try {
        const response = await citizenService.getCitizen(citizenUuid) as CitizenResponse
        if (response) {
            state.formCitizen = {
                image: response?.data?.image ?? '',
                firstname: response?.data?.firstname ?? '',
                lastname: response?.data?.lastname ?? '',
                email: response?.data?.email ?? '',
                social_security_number: response?.data?.social_security_number ?? '',
                birthday: response?.data?.birthday ?? '',
                phone: response?.data?.phone ?? '',
                departments: [],
                street: response?.data?.address?.street ?? '',
                region_id: response?.data?.address?.region_id.toString() ?? '',
                municipality_id: response?.data?.address?.municipality_id.toString() ?? '',
                city_id: response?.data?.address?.city_id.toString() ?? '',
                post_code: response?.data?.address?.post_code ?? '',
                diagnosis: response?.data?.diagnosis ?? '',
            }
            response?.data?.departments.forEach((department: any) => {
                state.formCitizen.departments.push(department?.id)
            })
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateCitizen(citizenDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        let params = new FormData()
        params.append('image', citizenDetails.image)
        params.append('firstname', citizenDetails.firstname)
        params.append('lastname', citizenDetails.lastname)
        params.append('email', citizenDetails.email)
        params.append('social_security_number', citizenDetails.social_security_number)
        params.append('birthday', citizenDetails.birthday)
        params.append('phone', citizenDetails.phone)
        params.append('department_id', citizenDetails.departments)
        params.append('street', citizenDetails.street)
        params.append('region_id', citizenDetails.region)
        params.append('municipality_id', citizenDetails.municipality)
        params.append('city_id', citizenDetails.city)
        params.append('post_code', citizenDetails.post_code)
        params.append('diagnosis', citizenDetails.diagnosis)
        const response = await citizenService.updateCitizen(citizenUuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('citizens.form.alert.successfullyUpdate')}.`)
            navigateTo('/citizens')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function successAlert(title: string, message: string) {
    notify({
        title: title,
        text: message,
        type: 'success',
    })
}
</script>