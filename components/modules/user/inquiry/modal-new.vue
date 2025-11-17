<template>
    <div>
        <Modal size="md" :title="$t('inquiries.newInquiry')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserInquiryModalForm formType="create" :selectedInquiry="state.formInquiry"
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
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshInquiries'])

const state = reactive({
    error: {} as Error,
    formInquiry: {
        inquiry_date: '',
        inquirer_name: '',
        first_name: '',
        last_name: '',
        outcome: '',
        purpose: '',
        conversation_summary: '',
    },
    isPageLoading: false,
})

function closeModal() {
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
            inquiry_date: inquiryDetails.inquiry_date,
            inquirer_name: inquiryDetails.inquirer_name,
            first_name: inquiryDetails.first_name,
            last_name: inquiryDetails.last_name,
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