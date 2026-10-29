<template>
    <div>
        <Modal size="lg" :title="modalTitle" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <!-- Rediger means edit: the page behind already shows the review,
                         so the form opens straight away. Keyed on each open, so the
                         form always starts from the inquiry as it is now. -->
                    <ModulesUserInquiryModalCrisisCenterForm v-if="inquiryType === 'crisis_center'" :key="'crisis-' + state.openCount"
                        formType="update" :selectedInquiry="props.selectedInquiry"
                        :form="props.selectedInquiry.form ?? null"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="updateCrisisCenterInquiry">
                        <template #after-fields>
                            <ModulesUserInquiryFieldsBlock v-if="props.selectedInquiry.uuid" ref="fieldsBlock" embedded
                                :inquiryUuid="props.selectedInquiry.uuid" />
                        </template>
                    </ModulesUserInquiryModalCrisisCenterForm>
                    <ModulesUserInquiryModalShelterForm v-if="inquiryType === 'shelter'" :key="'shelter-' + state.openCount"
                        formType="update" :selectedInquiry="props.selectedInquiry"
                        :form="props.selectedInquiry.form ?? null" :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="updateShelterInquiry">
                        <template #after-fields>
                            <ModulesUserInquiryFieldsBlock v-if="props.selectedInquiry.uuid" ref="fieldsBlock" embedded
                                :inquiryUuid="props.selectedInquiry.uuid" />
                        </template>
                    </ModulesUserInquiryModalShelterForm>
                    <!-- The inquiry has no type yet, which happens to imported rows and
                         to anything created straight through the API. The user picks
                         one here; saving the form then stores it on the inquiry. -->
                    <div v-if="!hasKnownType && !state.chosenType" class="py-6 text-center">
                        <Icon name="ph:question" class="mx-auto size-8 text-gray-300" />
                        <p class="mt-2 text-sm font-semibold text-gray-700">
                            {{ $t('inquiries.unknownType.title') }}
                        </p>
                        <p class="mx-auto mt-1 max-w-sm text-xs text-gray-500">
                            {{ $t('inquiries.unknownType.hint') }}
                        </p>
                        <div class="mt-4 flex flex-wrap justify-center gap-2">
                            <FormButton type="button" buttonStyle="action" @click="state.chosenType = 'crisis_center'">
                                {{ crisisCenterName }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="action" @click="state.chosenType = 'shelter'">
                                {{ shelterName }}
                            </FormButton>
                        </div>
                    </div>
                    <div v-if="!hasKnownType && state.chosenType" class="mb-3 flex items-center gap-x-2 text-xs text-gray-500">
                        {{ $t('inquiries.unknownType.chosen', { type: modalTitle }) }}
                        <button type="button" class="font-semibold text-primary hover:underline" @click="state.chosenType = ''">
                            {{ $t('inquiries.unknownType.change') }}
                        </button>
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
import { yesNoToBoolean } from '@/composables/inquiryForms'

const { successAlert } = useAlert()
const { t } = useI18n()
const customPagesStore = useCustomPagesStore() as any

const shelterName = computed(() => customPagesStore.getCustomPagesName?.shelter || t('inquiries.form.options.inquiryType.shelter'))
const crisisCenterName = computed(() => customPagesStore.getCustomPagesName?.crisisCenter || t('inquiries.form.options.inquiryType.crisisCenter'))
const hasKnownType = computed(() =>
    ['shelter', 'crisis_center'].includes(props.selectedInquiry?.inquiry_type)
)

// The inquiry's own type, or the one picked here for an inquiry that has none.
const inquiryType = computed(() => hasKnownType.value ? props.selectedInquiry.inquiry_type : state.chosenType)

const modalTitle = computed(() => {
    if (inquiryType.value === 'shelter') return shelterName.value
    if (inquiryType.value === 'crisis_center') return crisisCenterName.value
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
    isPageLoading: false,
    openCount: 0,
    chosenType: '' as '' | 'shelter' | 'crisis_center',
})

// The custom fields in the form, saved by the same button as the rest.
const fieldsBlock = ref<any>(null)

// Every open starts from the inquiry as loaded, including reopening the same one.
watch(() => props.isModalOpen, (open: boolean) => {
    if (open) {
        state.openCount++
        state.error = {}
        state.chosenType = ''
    }
})

/**
 * The inquiry itself is saved; now its custom fields, if any changed. They go
 * through the block's own save, the same one the inquiry page uses. If that
 * fails the block says why and the form stays open with the answers in it.
 */
async function finishSave() {
    if (fieldsBlock.value?.isDirty && !(await fieldsBlock.value.save())) {
        refreshInquiries()
        return
    }

    refreshInquiries()
    closeModal()
    successAlert(`${t('alert.success')}!`, `${t('inquiries.form.alert.inquirySuccessfullyUpdated')}.`)
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
            inquiry_type: 'crisis_center',
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
            ...(inquiryDetails.match_needs ?? {}),
        }
        const response = await citizenInquiryService.updateInquiry(inquiryUuid, params)
        if (response?.data) {
            await finishSave()
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
            inquiry_type: 'shelter',
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
            ...(inquiryDetails.match_needs ?? {}),
        }
        const response = await citizenInquiryService.updateInquiry(inquiryUuid, params)
        if (response?.data) {
            await finishSave()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>