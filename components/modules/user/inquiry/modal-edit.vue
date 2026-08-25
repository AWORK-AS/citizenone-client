<template>
    <div>
        <Modal size="lg" :title="modalTitle" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <!-- Opening an inquiry is for reading it. Editing is a decision the
                         user makes after that, not the thing they land in. -->
                    <ModulesUserInquiryDetailReview v-if="!state.isEditing && hasKnownType"
                        :inquiry="props.selectedInquiry" @edit="state.isEditing = true"
                        @fieldsSaved="refreshInquiries" />
                    <ModulesUserInquiryModalCrisisCenterForm v-if="state.isEditing && props.selectedInquiry.inquiry_type === 'crisis_center'" formType="update" :selectedInquiry="props.selectedInquiry"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="stopEditing" @submitForm="updateCrisisCenterInquiry" />
                    <ModulesUserInquiryModalShelterForm v-if="state.isEditing && props.selectedInquiry.inquiry_type === 'shelter'" formType="update" :selectedInquiry="props.selectedInquiry" :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="stopEditing" @submitForm="updateShelterInquiry" />
                    <!-- Neither form fits: the inquiry has no type, which happens to
                         imported rows and to anything created straight through the API.
                         Say so instead of showing an empty box. -->
                    <div v-if="!hasKnownType" class="py-6 text-center">
                        <Icon name="ph:question" class="mx-auto size-8 text-gray-300" />
                        <p class="mt-2 text-sm font-semibold text-gray-700">
                            {{ $t('inquiries.unknownType.title') }}
                        </p>
                        <p class="mx-auto mt-1 max-w-sm text-xs text-gray-500">
                            {{ $t('inquiries.unknownType.hint') }}
                        </p>
                    </div>
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
const hasKnownType = computed(() =>
    ['shelter', 'crisis_center'].includes(props.selectedInquiry?.inquiry_type)
)

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
    isEditing: false,
    isPageLoading: false
})

// Every open starts on the review, including reopening the same inquiry.
watch(() => props.isModalOpen, (open: boolean) => {
    if (open) {
        state.isEditing = false
        state.error = {}
    }
})

// Cancelling an edit returns to the review rather than throwing the user out of
// the inquiry altogether.
function stopEditing() {
    state.isEditing = false
    state.error = {}
}

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
            department_uuid: inquiryDetails.department_uuid,
            inquirer_name: inquiryDetails.inquirer_name,
            company_contact_uuid: inquiryDetails.company_contact_uuid ?? null,
            inquiry_service_type_uuid: inquiryDetails.inquiry_service_type_uuid ?? null,
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
            department_uuid: inquiryDetails.department_uuid,
            inquirer_name: inquiryDetails.inquirer_name,
            company_contact_uuid: inquiryDetails.company_contact_uuid ?? null,
            inquiry_service_type_uuid: inquiryDetails.inquiry_service_type_uuid ?? null,
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