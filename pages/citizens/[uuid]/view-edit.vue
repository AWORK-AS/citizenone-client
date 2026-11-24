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

            <div class="animate-fade-in">
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    :to="`/citizens/${citizenUuid}/journals`">
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
                <!-- The inquiry fields the company carries over to the indsats,
                     saved on their own; nothing is shown when there are none. -->
                <div :class="state.carriedFieldCount ? 'mt-6 rounded-xl border border-surface-200 bg-white p-5' : ''">
                    <ModulesUserInquiryFieldsBlock :citizenUuid="String(citizenUuid)"
                        @loaded="(count: number) => state.carriedFieldCount = count" />
                </div>
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
import { useUserStore } from '@/store/user'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { useNumberFormatter } from '@/composables/numberFormatter'
import { buildCitizenUpdateFormData } from '@/utils/citizenUpdateFormData'
import type { CitizenForm, Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const customPagesStore = useCustomPagesStore() as any
const userStore = useUserStore() as any
const { successAlert, warningAlert } = useAlert()
const { t } = useI18n()
const language = useI18n()
const { parseLocaleNumber } = useNumberFormatter()
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
        case_number: '',
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
        spoken_languages: [],
        primary_spoken_language: '',
        requires_interpreter: false,
        has_special_language: false,
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
        secondary_case_worker_uuid: '',
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
        has_patient_journal_access: false,
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
            contract_price: '',
            contract_hours: '',
            contract_hours_interval: 'weekly',
            primary_split_percentage: '',
            accompanying_children: [{
                name: '',
                gender: '',
                age: '',
                origin: '',
            }],
            residence_before_uuid: '',
            residence_after_uuid: '',
            discharge_reason: '',
            discharge_reason_uuid: null as string | null,
            consent_declarations: [],
            photo: false,
            parent_collaboration: false,
            student_collaboration: false,
            general_consent: false,
            personal_guardianship: false,
            financial_guardianship: false,
        },
        employmentData: {
            employment_case_type_uuid: '',
            employment_status_type_uuid: '',
            financial_support_basis: '',
            primary_consultant_uuid: '',
            secondary_consultant_uuid: '',
            referrer_name: '',
            referrer_phone: '',
            referrer_email: '',
            referrer_organization: '',
            referral_date: '',
            case_start_date: '',
            case_end_date: '',
            total_weeks: '',
            weeks_used: '',
            reporting_requirements: '',
            activation_deadline: '',
            referral_reason: '',
            internship_company: '',
        },
        dentalData: {
            is_member_of_sygeforsikring_danmark: false,
            danmark_group: '',
            sygesikring_group: '',
            is_foreign_patient: false,
            risk_profile: '',
            risk_profile_note: '',
            recall_channel: '',
            auto_reminder: true,
            patient_number: '',
            municipal_subsidy: '',
            last_checkup_date: '',
            checkup_interval_months: '',
        },
    } as CitizenForm,
    isPageLoading: false,
    carriedFieldCount: 0,
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
                case_number: response?.data?.case_number ?? '',
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
                // Everything sent on save is loaded here first, the way edit.vue
                // does, or an untouched field would go out empty and clear it.
                latitude: response?.data?.address?.latitude ?? '',
                longitude: response?.data?.address?.longitude ?? '',
                origin: response?.data?.origin?.uuid?.toString() ?? '',
                spoken_languages: [],
                primary_spoken_language: '',
                requires_interpreter: response?.data?.requires_interpreter ?? false,
                has_special_language: response?.data?.has_special_language ?? false,
                diagnoses: [],
                medication_allergies: [],
                addictions: [],
                date_admitted: response?.data?.date_admitted ?? '',
                date_discharged: response?.data?.date_discharged ?? '',
                is_discharge_reminded: response?.data?.is_discharge_reminded ?? false,
                section: response?.data?.section?.uuid?.toString() ?? '',
                pricing: response?.data?.pricing ?? '',
                // form.vue shows a lock instead of an input for these.
                hidden_fields: response?.data?.hidden_fields ?? [],
                pricing_start_date: response?.data?.pricing_start_date ?? '',
                primary_case_worker_uuid: response?.data?.primary_case_worker?.uuid?.toString() ?? '',
                secondary_case_worker_uuid: response?.data?.secondary_case_worker?.uuid?.toString() ?? '',
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
                has_patient_journal_access: response?.data?.has_patient_journal_access ?? false,
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
                    contract_price: response?.data?.stay_data?.contract_price ?? '',
                    contract_hours: response?.data?.stay_data?.contract_hours ?? '',
                    contract_hours_interval: response?.data?.stay_data?.contract_hours_interval || 'weekly',
                    primary_split_percentage: response?.data?.stay_data?.primary_split_percentage ?? '',
                    accompanying_children: response?.data?.stay_data?.accompanying_children ?? [{
                        name: '',
                        gender: '',
                        age: '',
                        origin: '',
                    }],
                    residence_before_uuid: response?.data?.stay_data?.residence_before_municipality?.uuid?.toString() ?? '',
                    residence_after_uuid: response?.data?.stay_data?.residence_after_municipality?.uuid?.toString() ?? '',
                    discharge_reason: response?.data?.stay_data?.discharge_reason ?? '',
                    discharge_reason_uuid: response?.data?.stay_data?.discharge_reason_option?.uuid ?? null,
                    consent_declarations: response?.data?.stay_data?.consent_declarations ?? [],
                    photo: response?.data?.stay_data?.photo ?? false,
                    parent_collaboration: response?.data?.stay_data?.parent_collaboration ?? false,
                    student_collaboration: response?.data?.stay_data?.student_collaboration ?? false,
                    general_consent: response?.data?.stay_data?.general_consent ?? false,
                    personal_guardianship: response?.data?.stay_data?.personal_guardianship ?? false,
                    financial_guardianship: response?.data?.stay_data?.financial_guardianship ?? false,
                },
                employmentData: {
                    employment_case_type_uuid: response?.data?.employment_profile?.case_type?.uuid || '',
                    employment_status_type_uuid: response?.data?.employment_profile?.status_type?.uuid || '',
                    financial_support_basis: response?.data?.employment_profile?.financial_support_basis || '',
                    primary_consultant_uuid: response?.data?.employment_profile?.primary_consultant?.uuid || '',
                    secondary_consultant_uuid: response?.data?.employment_profile?.secondary_consultant?.uuid || '',
                    referrer_name: response?.data?.employment_profile?.referrer_name || '',
                    referrer_phone: response?.data?.employment_profile?.referrer_phone || '',
                    referrer_email: response?.data?.employment_profile?.referrer_email || '',
                    referrer_organization: response?.data?.employment_profile?.referrer_organization || '',
                    referral_date: response?.data?.employment_profile?.referral_date || '',
                    case_start_date: response?.data?.employment_profile?.case_start_date || '',
                    case_end_date: response?.data?.employment_profile?.case_end_date || '',
                    total_weeks: response?.data?.employment_profile?.total_weeks || '',
                    weeks_used: response?.data?.employment_profile?.weeks_used || '',
                    reporting_requirements: response?.data?.employment_profile?.reporting_requirements || '',
                    activation_deadline: response?.data?.employment_profile?.activation_deadline || '',
                    referral_reason: response?.data?.employment_profile?.referral_reason || '',
                    internship_company: response?.data?.employment_profile?.internship_company || '',
                } as any,
                dentalData: {
                    is_member_of_sygeforsikring_danmark: response?.data?.dental_profile?.is_member_of_sygeforsikring_danmark ?? false,
                    danmark_group: response?.data?.dental_profile?.danmark_group || '',
                    sygesikring_group: response?.data?.dental_profile?.sygesikring_group || '',
                    is_foreign_patient: response?.data?.dental_profile?.is_foreign_patient ?? false,
                    risk_profile: response?.data?.dental_profile?.risk_profile || '',
                    risk_profile_note: response?.data?.dental_profile?.risk_profile_note || '',
                    recall_channel: response?.data?.dental_profile?.recall_channel || '',
                    auto_reminder: response?.data?.dental_profile?.auto_reminder ?? true,
                    patient_number: response?.data?.dental_profile?.patient_number || '',
                    municipal_subsidy: response?.data?.dental_profile?.municipal_subsidy || '',
                    last_checkup_date: response?.data?.dental_profile?.last_checkup_date || '',
                    checkup_interval_months: response?.data?.dental_profile?.checkup_interval_months || '',
                } as any,
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
            response?.data?.spoken_languages?.forEach((spokenLanguage: any) => {
                state.formCitizen.spoken_languages.push(spokenLanguage?.uuid)
                if (spokenLanguage?.is_primary) {
                    state.formCitizen.primary_spoken_language = spokenLanguage?.uuid
                }
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
        // Unknown, or outside what this user may see: no empty form to edit.
        // The saved language, as this can come back before the layout sets it.
        if (error?.status === 404) {
            const options = { locale: userStore.getLanguage || undefined }
            warningAlert(t('citizens.notFoundOrNoAccess.title', {}, options), t('citizens.notFoundOrNoAccess.message', {}, options))
            navigateTo('/citizens', { replace: true })
        }
    }
    state.isPageLoading = false
}

async function updateCitizen(citizenDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        // The same fields as the citizen list's pencil (edit.vue): this page
        // used to leave out 33 of them, and the backend keeps the stored value
        // of a field that isn't sent, so changes to them were lost (TKT-000138).
        // An emptied price is still sent empty here, as before.
        const params = buildCitizenUpdateFormData(citizenDetails, {
            locale: language.locale.value,
            parseLocaleNumber,
            sendEmptyPricing: true,
        })
        const response = await citizenService.updateCitizen(citizenUuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('citizens.form.alert.successfullyUpdate')}.`)
            navigateTo(`/citizens/${citizenUuid}/journals`)
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
            navigateTo('/citizens')
            const { show: showUndo } = useUndo()
            showUndo({
                message: `${t('citizens.alert.citizenSuccessfullyArchived')}`,
                onUndo: async () => {
                    await citizenService.archiveUnarchiveCitizen(citizenUuid)
                    successAlert(`${t('alert.success')}!`, `${t('archived.alert.citizenSuccessfullyUnarchive')}.`)
                },
            })
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>