<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizens.newCitizen') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks">
                    <template #custom-link>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400"
                                aria-hidden="true" />
                            <button @click="navigateTo('/citizens')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ customPagesStore.getCustomPagesName?.citizens }}
                            </button>
                        </div>
                    </template>
                </Breadcrumb>
            </template>

            <template #header>{{ $t('citizens.newCitizen') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/citizens">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenDetailsForm formType="create" :selectedCitizen="state.formCitizen"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="saveCitizen" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { citizenService } from '@/components/api/user/CitizenService'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { CitizenForm, Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const customPagesStore = useCustomPagesStore() as any
const { successAlert } = useAlert()
const { t } = useI18n()
const breadcrumbLinks = [
    {
        name: 'citizens.newCitizen',
        translate: true,
        href: '/citizens/new',
    },
]

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
        foreign_city_uuid: '',
        region_uuid: '',
        municipality_uuid: '',
        city_uuid: '',
        post_code: '',
        origin: '',
        diagnoses: [],
        addictions: [],
        date_admitted: '',
        date_discharged: '',
        section: '',
        pricing: '',
        pricing_start_date: '',
        primary_case_worker_uuid: '',
        paying_municipality: '',
        assessment_municipality: '',
        responsible_municipality: '',
        ean_number: '',
        transportation: '',
        note: '',
        has_system_access: false,
        has_chat_access: false,
        has_duty_schedule_access: false,
        has_bullet_board_access: false,
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
        if (citizenDetails.is_foreign_city) {
            params.append('foreign_city_uuid', citizenDetails.foreign_city)
        } else {
            params.append('origin_uuid', citizenDetails.origin)
        }
        params.append('diagnoses_uuid', JSON.stringify(citizenDetails.diagnoses))
        params.append('addictions_uuid', JSON.stringify(citizenDetails.addictions))
        params.append('date_admitted', citizenDetails.date_admitted != 'Invalid date' ? citizenDetails.date_admitted : '')
        params.append('date_discharged', citizenDetails.date_discharged != 'Invalid date' ? citizenDetails.date_discharged : '')
        params.append('section', citizenDetails.section)
        params.append('pricing', citizenDetails.pricing)
        params.append('pricing_start_date', citizenDetails.pricing_start_date)
        params.append('primary_case_worker_uuid', citizenDetails.primary_case_worker_uuid)
        params.append('paying_municipality', citizenDetails.paying_municipality)
        params.append('assessment_municipality', citizenDetails.assessment_municipality)
        params.append('responsible_municipality', citizenDetails.responsible_municipality)
        params.append('ean_number', citizenDetails.ean_number)
        params.append('transportation', citizenDetails.transportation)
        params.append('note', citizenDetails.note)
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