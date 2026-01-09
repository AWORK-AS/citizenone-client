<template>
    <div>
        <Modal size="md" :title="inquiryType === 'shelter' ? $t('inquiries.shelterInquiry') : $t('inquiries.crisisCenterInquiry')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserInquiryModalCrisisCenterForm v-if="inquiryType === 'crisis_center'" formType="create" :selectedInquiry="state.formInquiry"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveInquiry" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { citizenInquiryService } from '@/components/api/user/CitizenInquiryService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()

const props = defineProps({
    inquiryType: {
        type: String,
        required: true,
    },
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshInquiries'])

const state = reactive({
    error: {} as Error,
    formInquiry: {
        inquiry_type: 'crisis_center',
        cpr: '',
        inquiry_date: '',
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
    isPageLoading: false,
})

function closeModal() {
    state.error = {}
    emit('close')
}

function refreshInquiries() {
    emit('refreshInquiries')
}

async function saveInquiry(inquiryDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
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