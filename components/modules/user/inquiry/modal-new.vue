<template>
    <div>
        <Modal size="lg" :title="title"
            :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <!-- The company's own fields sit inside the form, above Save, and
                         follow the service type as it is picked, so they are there
                         from the start rather than only on the saved inquiry. -->
                    <ModulesUserInquiryModalCrisisCenterForm v-if="inquiryType === 'crisis_center'" formType="create" :selectedInquiry="state.formInquiry"
                        :form="props.form" :serviceType="preselectedServiceType"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveCrisisCenterInquiry">
                        <template #after-fields="{ serviceTypeUuid }">
                            <ModulesUserInquiryCreationFieldsBlock v-model="state.fieldValues"
                                :formUuid="props.form?.uuid ?? null" :serviceTypeUuid="serviceTypeUuid ?? null" />
                        </template>
                    </ModulesUserInquiryModalCrisisCenterForm>
                    <ModulesUserInquiryModalShelterForm v-if="inquiryType === 'shelter'" formType="create" :selectedInquiry="state.formInquiry"
                        :form="props.form" :serviceType="preselectedServiceType"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveShelterInquiry">
                        <template #after-fields="{ serviceTypeUuid }">
                            <ModulesUserInquiryCreationFieldsBlock v-model="state.fieldValues"
                                :formUuid="props.form?.uuid ?? null" :serviceTypeUuid="serviceTypeUuid ?? null" />
                        </template>
                    </ModulesUserInquiryModalShelterForm>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { citizenInquiryService } from '@/components/api/user/CitizenInquiryService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import { useCustomPagesStore } from '@/store/custom-pages'
import type { Error } from '@/types'
import { formLabel, yesNoToBoolean } from '@/composables/inquiryForms'

const { successAlert } = useAlert()
const { t } = useI18n()
const customPagesStore = useCustomPagesStore() as any

const shelterName = computed(() => customPagesStore.getCustomPagesName?.shelter || t('inquiries.form.options.inquiryType.shelter'))
const crisisCenterName = computed(() => customPagesStore.getCustomPagesName?.crisisCenter || t('inquiries.form.options.inquiryType.crisisCenter'))

const props = defineProps({
    inquiryType: {
        type: String,
        required: true,
    },
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    // The form "Ny henvendelse" was opened on. Null only while the company's
    // forms could not be read, when the built-in form asks for everything.
    form: {
        type: Object,
        required: false,
        default: null,
    },
})

const title = computed(() => formLabel((props.form as any) ?? { name: null, builtin: props.inquiryType as any }, {
    shelter: shelterName.value,
    crisisCenter: crisisCenterName.value,
}))

// A form may come with its service type chosen; asking again would invite two
// answers to the same question.
const preselectedServiceType = computed(() => props.form?.service_type ?? null)
const emit = defineEmits(['close', 'refreshInquiries'])

const state = reactive({
    error: {} as Error,
    formInquiry: {
        inquiry_type: props.inquiryType,
        inquiry_service_type_uuid: props.form?.service_type?.uuid ?? null,
        cpr: '',
        inquiry_date: '',
        department_uuid: [],
        inquirer_name: '',
        first_name: '',
        last_name: '',
        contacted_by: '',
        outcome: '',
        purpose: '',
        topic_uuid: [],
        target_group_crisis_center: [],
        received_visit: '',
        assessment_uuid: [],
        guidance_uuid: [],
        conversation_summary: '',
        notes: ''
    },
    fieldValues: {} as Record<string, any>,
    isPageLoading: false,
})

function closeModal() {
    state.error = {}
    state.fieldValues = {}
    emit('close')
}

function refreshInquiries() {
    emit('refreshInquiries')
}

async function saveCrisisCenterInquiry(inquiryDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            inquiry_type: inquiryDetails.inquiry_type,
            inquiry_form_uuid: props.form?.uuid ?? null,
            cpr: inquiryDetails.cpr,
            inquiry_date: inquiryDetails.inquiry_date,
            department_uuid: inquiryDetails.department_uuid,
            inquirer_name: inquiryDetails.inquirer_name,
            company_contact_uuid: inquiryDetails.company_contact_uuid ?? null,
            inquiry_service_type_uuid: inquiryDetails.inquiry_service_type_uuid ?? null,
            first_name: inquiryDetails.first_name,
            last_name: inquiryDetails.last_name,
            contacted_by: inquiryDetails.contacted_by,
            topic_uuid: inquiryDetails.topic_uuid,
            target_group_crisis_center: inquiryDetails.target_group_crisis_center,
            received_visit: yesNoToBoolean(inquiryDetails.received_visit),
            assessment_uuid: inquiryDetails.assessment_uuid,
            guidance_uuid: inquiryDetails.guidance_uuid,
            notes: inquiryDetails.notes,
            outcome: inquiryDetails.outcome,
            purpose: inquiryDetails.purpose,
            conversation_summary: inquiryDetails.conversation_summary,
            field_values: state.fieldValues,
            ...(inquiryDetails.match_needs ?? {}),
        }
        const response = await citizenInquiryService.saveInquiry(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('inquiries.form.alert.newInquirySuccessfullySaved')}.`)
            refreshInquiries()
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function saveShelterInquiry(inquiryDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            inquiry_type: inquiryDetails.inquiry_type,
            inquiry_form_uuid: props.form?.uuid ?? null,
            cpr: inquiryDetails.cpr,
            cpr_missing_reason: inquiryDetails.cpr_missing_reason,
            inquiry_date: inquiryDetails.inquiry_date,
            department_uuid: inquiryDetails.department_uuid,
            inquirer_name: inquiryDetails.inquirer_name,
            company_contact_uuid: inquiryDetails.company_contact_uuid ?? null,
            inquiry_service_type_uuid: inquiryDetails.inquiry_service_type_uuid ?? null,
            first_name: inquiryDetails.first_name,
            last_name: inquiryDetails.last_name,
            vacant_place_available: yesNoToBoolean(inquiryDetails.vacant_place_available),
            in_shelter_target_group: yesNoToBoolean(inquiryDetails.in_shelter_target_group),
            fits_in_target_group: yesNoToBoolean(inquiryDetails.fits_in_target_group),
            non_admission_reason: inquiryDetails.non_admission_reason,
            not_in_service_target_group_reason: inquiryDetails.not_in_service_target_group_reason,
            referral_destination: inquiryDetails.referral_destination,
            notes: inquiryDetails.notes,
            outcome: inquiryDetails.outcome,
            purpose: inquiryDetails.purpose,
            conversation_summary: inquiryDetails.conversation_summary,
            field_values: state.fieldValues,
            ...(inquiryDetails.match_needs ?? {}),
        }
        const response = await citizenInquiryService.saveInquiry(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('inquiries.form.alert.newInquirySuccessfullySaved')}.`)
            refreshInquiries()
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>