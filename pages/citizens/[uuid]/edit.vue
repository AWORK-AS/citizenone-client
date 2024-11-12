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
                    <div class="max-w-3xl flex justify-end">
                        <FormButton type="button" buttonStyle="warning" class="rounded-md"
                            @click="confirmCitizenArchiving">
                            {{ $t('citizens.archiveCitizen') }}
                        </FormButton>
                    </div>
                    <ModulesCitizenDetailsForm formType="update" :selectedCitizen="state.formCitizen"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="updateCitizen" />
                </LoadingSpinner>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isArchiveCitizenOpen"
                :message="$t('citizens.confirmation.archiveConfirmation') + '?'"
                @close="state.modal.isArchiveCitizenOpen = false" @confirm="archiveCitizen" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { citizenService } from '@/components/api/CitizenService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { CitizenForm, Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid

const state = reactive({
    error: {} as Error,
    formCitizen: {
        image: '',
        firstname: '',
        lastname: '',
        gender: '',
        email: '',
        social_security_number: '',
        birthday: '',
        phone: '',
        departments: [],
        street: '',
        region_uuid: '',
        municipality_uuid: '',
        city_uuid: '',
        post_code: '',
        diagnosis: '',
        addictions: '',
        date_admitted: '',
        date_discharged: '',
    } as CitizenForm,
    isPageLoading: false,
    modal: {
        isArchiveCitizenOpen: false
    }
})

onMounted(() => {
    fetchCitizen()
})

async function fetchCitizen() {
    state.isPageLoading = true
    state.error = {}
    try {
        const response = await citizenService.getCitizen(citizenUuid)
        if (response) {
            state.formCitizen = {
                image: response?.data?.image ?? '',
                firstname: response?.data?.firstname ?? '',
                lastname: response?.data?.lastname ?? '',
                gender: response?.data?.gender ?? '',
                email: response?.data?.email ?? '',
                social_security_number: response?.data?.social_security_number ?? '',
                birthday: response?.data?.birthday ?? '',
                phone: response?.data?.phone ?? '',
                departments: [],
                street: response?.data?.address?.street ?? '',
                region_uuid: response?.data?.address?.region?.uuid.toString() ?? '',
                municipality_uuid: response?.data?.address?.municipality?.uuid.toString() ?? '',
                city_uuid: response?.data?.address?.city?.uuid.toString() ?? '',
                post_code: response?.data?.address?.post_code ?? '',
                diagnosis: response?.data?.diagnosis?.uuid.toString() ?? '',
                addictions: response?.data?.addictions?.uuid.toString() ?? '',
                date_admitted: response?.data?.date_admitted ?? '',
                date_discharged: response?.data?.date_discharged ?? '',
            }
            response?.data?.departments.forEach((department: any) => {
                state.formCitizen.departments.push(department?.uuid)
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
        params.append('gender', citizenDetails.gender)
        params.append('email', citizenDetails.email)
        params.append('social_security_number', citizenDetails.social_security_number)
        params.append('birthday', citizenDetails.birthday)
        params.append('phone', citizenDetails.phone)
        params.append('departments_uuid', JSON.stringify(citizenDetails.departments))
        params.append('street', citizenDetails.street)
        params.append('region_uuid', citizenDetails.region)
        params.append('municipality_uuid', citizenDetails.municipality)
        params.append('city_uuid', citizenDetails.city)
        params.append('post_code', citizenDetails.post_code)
        params.append('diagnosis', citizenDetails.diagnosis)
        params.append('addictions', citizenDetails.addictions)
        params.append('date_admitted', citizenDetails.date_admitted)
        params.append('date_discharged', citizenDetails.date_discharged)
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

function confirmCitizenArchiving() {
    state.modal.isArchiveCitizenOpen = true
}

async function archiveCitizen() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await citizenService.archiveUnarchiveCitizen(citizenUuid)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('citizens.alert.citizenSuccessfullyArchived')}.`)
            navigateTo('/citizens')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>