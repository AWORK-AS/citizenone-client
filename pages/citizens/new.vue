<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizens.newCitizen') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('citizens.newCitizen') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/citizens">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesCitizenDetailsForm formType="create" :selectedCitizen="state.formCitizen"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="saveCitizen" />
                </LoadingSpinner>
            </div>
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
})

async function saveCitizen(citizenDetails: any) {
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
        const response = await citizenService.saveCitizen(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('citizens.form.alert.successfullyAdded')}.`)
            navigateTo('/citizens')
        }
    } catch (error: any) {
        state.error = error
        if (error?.message === 'One citizen can be created in Free Basis Tier.') {
            navigateTo(`/subscription?error=${error?.message}`)
        } else if (error?.message === 'Én borger kan oprettes i Gratis Basis-niveau.') {
            navigateTo(`/subscription?error=${error?.message}`)
        }
    }
    state.isPageLoading = false
}
</script>