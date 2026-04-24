<template>
    <div>
        <Modal size="md" :title="modalTitle" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserInquiryModalCrisisCenterForm v-if="props.selectedInquiry.inquiry_type === 'crisis_center'" formType="update" :selectedInquiry="props.selectedInquiry"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="updateCrisisCenterInquiry" />
                    <ModulesUserInquiryModalShelterForm v-if="props.selectedInquiry.inquiry_type === 'shelter'" formType="update" :selectedInquiry="props.selectedInquiry" :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="updateShelterInquiry" />
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

const { successAlert } = useAlert()
const { t } = useI18n()
const customPagesStore = useCustomPagesStore() as any

const shelterName = computed(() => customPagesStore.getCustomPagesName?.shelter || t('inquiries.form.options.inquiryType.shelter'))
const crisisCenterName = computed(() => customPagesStore.getCustomPagesName?.crisisCenter || t('inquiries.form.options.inquiryType.crisisCenter'))
const modalTitle = computed(() => {
    if (props.selectedInquiry?.inquiry_type === 'shelter') return shelterName.value
    if (props.selectedInquiry?.inquiry_type === 'crisis_center') return crisisCenterName.value
    return t('inquiries.editInquiry')
})

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedInquiry: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshInquiries'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false
})

function closeModal() {
    emit('close')
}

function refreshInquiries() {
    emit('refreshInquiries')
}

async function updateCrisisCenterInquiry(inquiryDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const inquiryUuid = props.selectedInquiry.uuid
        const params = {
            inquiry_type: inquiryDetails.inquiry_type,
            cpr: inquiryDetails.cpr,
            inquiry_date: inquiryDetails.inquiry_date,
            inquirer_name: inquiryDetails.inquirer_name,
            first_name: inquiryDetails.first_name,
            last_name: inquiryDetails.last_name,
            contacted_by: inquiryDetails.contacted_by,
            topic_uuid: inquiryDetails.topic_uuid,
            target_group_crisis_center: inquiryDetails.target_group_crisis_center,
            received_visit: inquiryDetails.received_visit === 'yes',
            assessment_uuid: inquiryDetails.assessment_uuid,
            guidance_uuid: inquiryDetails.guidance_uuid,
            notes: inquiryDetails.notes,
            outcome: inquiryDetails.outcome,
            purpose: inquiryDetails.purpose,
            conversation_summary: inquiryDetails.conversation_summary,
        }
        const response = await citizenInquiryService.updateInquiry(inquiryUuid, params)
        if (response?.data) {
            refreshInquiries()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('inquiries.form.alert.inquirySuccessfullyUpdated')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateShelterInquiry(inquiryDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const inquiryUuid = props.selectedInquiry.uuid
        const params = {
            inquiry_type: inquiryDetails.inquiry_type,
            cpr: inquiryDetails.cpr,
            cpr_missing_reason: inquiryDetails.cpr_missing_reason,
            inquiry_date: inquiryDetails.inquiry_date,
            inquirer_name: inquiryDetails.inquirer_name,
            first_name: inquiryDetails.first_name,
            last_name: inquiryDetails.last_name,
            vacant_place_available: inquiryDetails.vacant_place_available === 'yes',
            in_shelter_target_group: inquiryDetails.in_shelter_target_group  === 'yes',
            fits_in_target_group: inquiryDetails.fits_in_target_group  === 'yes',
            non_admission_reason: inquiryDetails.non_admission_reason,
            not_in_service_target_group_reason: inquiryDetails.not_in_service_target_group_reason,
            referral_destination: inquiryDetails.referral_destination,
            notes: inquiryDetails.notes,
            outcome: inquiryDetails.outcome,
            purpose: inquiryDetails.purpose,
            conversation_summary: inquiryDetails.conversation_summary,
        }
        const response = await citizenInquiryService.updateInquiry(inquiryUuid, params)
        if (response?.data) {
            refreshInquiries()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('inquiries.form.alert.inquirySuccessfullyUpdated')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>