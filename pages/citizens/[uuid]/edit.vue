<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizens.editCitizen') }} - {{ runtimeConfig?.public?.appName }}</Title>
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

            <template #header>{{ $t('citizens.editCitizen') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/citizens">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="flex justify-end">
                        <FormButton type="button" buttonStyle="warning" @click="confirmCitizenArchiving">
                            {{ $t('citizens.archiveCitizen') }}
                        </FormButton>
                    </div>
                    <ModulesUserCitizenDetailsForm formType="update" :selectedCitizen="state.formCitizen"
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
import { citizenService } from '@/components/api/user/CitizenService'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { CitizenForm, Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const customPagesStore = useCustomPagesStore() as any
const { successAlert } = useAlert()
const { t } = useI18n()
const language = useI18n()
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
const breadcrumbLinks = [
    {
        name: 'citizens.editCitizen',
        translate: true,
        href: `/citizens/${citizenUuid}/edit`,
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
        rooms: [],
        street: '',
        foreign_city_uuid: '',
        region_uuid: '',
        municipality_uuid: '',
        city: '',
        post_code: '',
        latitude: '',
        longitude: '',
        origin: '',
        diagnoses: [],
        medication_allergies: [],
        addictions: [],
        date_admitted: '',
        date_discharged: '',
        is_discharge_reminded: false,
        section: '',
        pricing: '',
        pricing_start_date: '',
        primary_case_worker_uuid: '',
        paying_municipality: '',
        assessment_municipality: '',
        responsible_municipality: '',
        ean_number: '',
        transportation: '',
        hourly_rate: '',
        allocated_daily_hours: '',
        allocated_weekly_hours: '',
        allocated_monthly_hours: '',
        note: '',
        green: '',
        yellow: '',
        red: '',
        has_system_access: false,
        has_chat_access: false,
        has_duty_schedule_access: false,
        has_bullet_board_access: false,
        inquiryData: {
            inquiry_date: '',
            inquirer_name: '',
            outcome: '',
            purpose: '',
            conversation_summary: '',
        },
        stayData: {
            accommodation_end_date: '',
            accommodation_start_date: '',
            journal_number: '',
            accompanying_children: [{
                name: '',
                gender: '',
                age: '',
                origin: '',
            }],
            residence_before_uuid: '',
            residence_after_uuid: '',
            discharge_reason: '',
        },
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
                rooms: [],
                street: response?.data?.address?.street ?? '',
                foreign_city_uuid: response?.data?.foreign_city?.uuid?.toString() ?? '',
                region_uuid: response?.data?.address?.region?.uuid?.toString() ?? '',
                municipality_uuid: response?.data?.address?.municipality?.uuid?.toString() ?? '',
                city: response?.data?.address?.city ?? '',
                post_code: response?.data?.address?.post_code ?? '',
                latitude: response?.data?.address?.latitude ?? '',
                longitude: response?.data?.address?.longitude ?? '',
                origin: response?.data?.origin?.uuid?.toString() ?? '',
                diagnoses: [],
                medication_allergies: [],
                addictions: [],
                date_admitted: response?.data?.date_admitted ?? '',
                date_discharged: response?.data?.date_discharged ?? '',
                is_discharge_reminded: response?.data?.is_discharge_reminded ?? false,
                section: response?.data?.section?.uuid?.toString() ?? '',
                pricing: response?.data?.pricing ?? '',
                pricing_start_date: response?.data?.pricing_start_date ?? '',
                primary_case_worker_uuid: response?.data?.primary_case_worker?.uuid?.toString() ?? '',
                paying_municipality: response?.data?.paying_municipality?.uuid?.toString() ?? '',
                assessment_municipality: response?.data?.assessment_municipality?.uuid?.toString() ?? '',
                responsible_municipality: response?.data?.responsible_municipality?.uuid?.toString() ?? '',
                ean_number: response?.data?.ean_number ?? '',
                transportation: response?.data?.transportation ?? '',
                hourly_rate: response?.data?.hourly_rate ?? '',
                allocated_daily_hours: response?.data?.allocated_daily_hours ?? '',
                allocated_weekly_hours: response?.data?.allocated_weekly_hours ?? '',
                allocated_monthly_hours: response?.data?.allocated_monthly_hours ?? '',
                note: response?.data?.note ?? '',
                green: response?.data?.green ?? '',
                yellow: response?.data?.yellow ?? '',
                red: response?.data?.red ?? '',
                has_system_access: response?.data?.has_system_access ?? '',
                has_chat_access: response?.data?.has_chat_access ?? '',
                has_duty_schedule_access: response?.data?.has_duty_schedule_access ?? '',
                has_bullet_board_access: response?.data?.has_bullet_board_access ?? '',
                inquiryData: {
                    inquiry_date: response?.data?.inquiry_data?.inquiry_date ?? '',
                    inquirer_name: response?.data?.inquiry_data?.inquirer_name ?? '',
                    outcome: response?.data?.inquiry_data?.outcome ?? '',
                    purpose: response?.data?.inquiry_data?.purpose ?? '',
                    conversation_summary: response?.data?.inquiry_data?.conversation_summary ?? '',
                },
                stayData: {
                    accommodation_end_date: response?.data?.stay_data?.end_date ?? '',
                    accommodation_start_date: response?.data?.stay_data?.start_date ?? '',
                    journal_number: response?.data?.stay_data?.journal_number ?? '',
                    accompanying_children: response?.data?.children ?? [{
                        name: '',
                        gender: '',
                        age: '',
                        origin: '',
                    }],
                    residence_before_uuid: response?.data?.stay_data?.residence_before_municipality?.uuid?.toString() ?? '',
                    residence_after_uuid: response?.data?.stay_data?.residence_after_municipality?.uuid?.toString() ?? '',
                    discharge_reason: response?.data?.stay_data?.discharge_reason ?? '',
                },
            }
            response?.data?.departments?.forEach((department: any) => {
                state.formCitizen.departments.push(department?.uuid)
            })
            response?.data?.rooms?.forEach((room: any) => {
                state.formCitizen.rooms.push(room?.uuid)
            })
            response?.data?.diagnoses?.forEach((diagnosis: any) => {
                state.formCitizen.diagnoses.push(diagnosis?.uuid)
            })
            response?.data?.allergies?.forEach((medication_allergy: any) => {
                state.formCitizen.medication_allergies.push(medication_allergy?.uuid)
            })
            response?.data?.addictions?.forEach((addiction: any) => {
                state.formCitizen.addictions.push(addiction?.uuid)
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
        let pricingStr = citizenDetails.pricing

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
        if (citizenDetails.rooms) {
            params.append('room_uuid', JSON.stringify(citizenDetails.rooms))
        }
        params.append('street', citizenDetails.street)
        if (citizenDetails.region) {
            params.append('region_uuid', citizenDetails.region)
        } else {
            params.append('region_uuid', '')
        }
        if (citizenDetails.municipality) {
            params.append('municipality_uuid', citizenDetails.municipality)
        } else {
            params.append('municipality_uuid', '')
        }
        params.append('city', citizenDetails.city)
        params.append('post_code', citizenDetails.post_code)
        if (citizenDetails.latitude && citizenDetails.longitude) {
            params.append('latitude', citizenDetails.latitude)
            params.append('longitude', citizenDetails.longitude)
        }
        if (citizenDetails.is_foreign_city) {
            params.append('foreign_city_uuid', citizenDetails.foreign_city)
        } else {
            params.append('origin_uuid', citizenDetails.origin)
        }
        params.append('diagnoses_uuid', JSON.stringify(citizenDetails.diagnoses))
        params.append('medication_allergies_uuid', JSON.stringify(citizenDetails.medication_allergies))
        params.append('addictions_uuid', JSON.stringify(citizenDetails.addictions))
        params.append('date_admitted', citizenDetails.date_admitted != 'Invalid date' ? citizenDetails.date_admitted : '')
        params.append('date_discharged', citizenDetails.date_discharged != 'Invalid date' ? citizenDetails.date_discharged : '')
        params.append('is_discharge_reminded', citizenDetails.is_discharge_reminded)
        params.append('section', citizenDetails.section)

        if (citizenDetails.pricing) {
            if (language.locale.value === 'en') {
                // Remove thousand separators (','), already has '.' as decimal
                pricingStr = pricingStr.replace(/,/g, '')
            } else if (language.locale.value === 'dk') {
                // Remove thousand separators ('.'), and replace decimal separator (',') with '.'
                pricingStr = pricingStr.replace(/\./g, '').replace(',', '.')
            }
            const normalizedPricing = parseFloat(pricingStr) as any
            params.append('pricing', normalizedPricing)
        }

        params.append('pricing_start_date', citizenDetails.pricing_start_date)
        params.append('primary_case_worker_uuid', citizenDetails.primary_case_worker_uuid)
        params.append('paying_municipality', citizenDetails.paying_municipality)
        params.append('assessment_municipality', citizenDetails.assessment_municipality)
        params.append('responsible_municipality', citizenDetails.responsible_municipality)
        params.append('ean_number', citizenDetails.ean_number)
        params.append('transportation', citizenDetails.transportation)
        params.append('hourly_rate', citizenDetails.hourly_rate)
        params.append('allocated_daily_hours', citizenDetails.allocated_daily_hours)
        params.append('allocated_weekly_hours', citizenDetails.allocated_weekly_hours)
        params.append('allocated_monthly_hours', citizenDetails.allocated_monthly_hours)
        params.append('note', citizenDetails.note)
        params.append('green', citizenDetails.green)
        params.append('yellow', citizenDetails.yellow)
        params.append('red', citizenDetails.red)
        params.append('has_system_access', citizenDetails.has_system_access)
        params.append('has_chat_access', citizenDetails.has_chat_access)
        params.append('has_duty_schedule_access', citizenDetails.has_duty_schedule_access)
        params.append('has_bullet_board_access', citizenDetails.has_bullet_board_access)
        params.append('inquiry_date', citizenDetails.inquiryData.inquiry_date)
        params.append('inquirer_name', citizenDetails.inquiryData.inquirer_name)
        params.append('outcome', citizenDetails.inquiryData.outcome)
        params.append('purpose', citizenDetails.inquiryData.purpose)
        params.append('conversation_summary', citizenDetails.inquiryData.conversation_summary)
        params.append('end_date', citizenDetails.stayData.accommodation_end_date)
        params.append('start_date', citizenDetails.stayData.accommodation_start_date)
        params.append('journal_number', citizenDetails.stayData.journal_number)
        params.append('accompanying_children', JSON.stringify(citizenDetails.stayData.accompanying_children))
        if (citizenDetails.stayData.residence_before_uuid) {
            params.append('residence_before_uuid', citizenDetails.stayData.residence_before_uuid)
        }
        if (citizenDetails.stayData.residence_after_uuid) {
            params.append('residence_after_uuid', citizenDetails.stayData.residence_after_uuid)
        }
        params.append('discharge_reason', citizenDetails.stayData.discharge_reason)
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