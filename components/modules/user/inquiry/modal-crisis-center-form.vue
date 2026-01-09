<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <form @submit.prevent="submitForm()">
            <Alert type="danger" :text="props?.error?.message"
                v-if="props.error?.message && props.error.message.length > 0" />
            <div class="space-y-3">
                <div class="space-y-1">
                    <FormLabel for="inquiry_date" :label="$t('inquiries.form.dateOfInquiry')" />
                    <FormDateField id="inquiry_date" name="inquiry_date" :placeholder="$t('inquiries.form.dateOfInquiry')"
                        v-model="state.formInquiry.inquiry_date" />
                    <FormError :error="v$?.formInquiry?.inquiry_date?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.inquiry_date?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="cpr" :label="$t('inquiries.form.cpr')" />
                    <FormTextField id="cpr" name="cpr" :placeholder="$t('inquiries.form.cpr')"
                        v-model="state.formInquiry.cpr" />
                    <FormError :error="v$?.formInquiry?.cpr?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.cpr?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="contacted_by" :label="$t('inquiries.form.crisisCenter.fields.contactedBy')" />
                    <FormSelect id="contacted_by"
                                            :options="state.options.contactedBy"
                                            v-model="state.formInquiry.contacted_by" />
                    <FormError :error="v$?.formInquiry?.contacted_by?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.contacted_by?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="inquirer_name" :label="$t('inquiries.form.inquirerName')" />
                    <FormTextField id="inquirer_name" name="inquirer_name" :placeholder="$t('inquiries.form.inquirerName')"
                        v-model="state.formInquiry.inquirer_name" />
                    <FormError :error="v$?.formInquiry?.inquirer_name?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.inquirer_name?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="first_name" :label="$t('inquiries.form.firstname')" />
                    <FormTextField id="first_name" name="first_name" :placeholder="$t('inquiries.form.firstname')"
                        v-model="state.formInquiry.first_name" />
                    <FormError :error="v$?.formInquiry?.first_name?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.first_name?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="last_name" :label="$t('inquiries.form.lastname')" />
                    <FormTextField id="last_name" name="last_name" :placeholder="$t('inquiries.form.lastname')"
                        v-model="state.formInquiry.last_name" />
                    <FormError :error="v$?.formInquiry?.last_name?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.last_name?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="topic" :label="$t('inquiries.form.crisisCenter.fields.topic')" />
                    <FormSelectMultiple id="topic"
                                            :options="state.options.about_list"
                                            v-model="state.formInquiry.topic_uuid" />
                    <FormError :error="v$?.formInquiry?.topic_uuid?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.topic_uuid?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="assessment" :label="$t('inquiries.form.crisisCenter.fields.assessment')" />
                    <FormSelect id="assessment"
                                            :options="state.options.assessment"
                                            v-model="state.formInquiry.target_group_crisis_center" />
                    <FormError :error="v$?.formInquiry?.target_group_crisis_center?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.target_group_crisis_center?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="received_visit" :label="$t('inquiries.form.crisisCenter.fields.receivedVisit')" />
                    <FormSelect id="received_visit"
                                            :options="state.options.yesNo"
                                            v-model="state.formInquiry.received_visit" />
                    <FormError :error="v$?.formInquiry?.received_visit?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.received_visit?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="assessment_reason" :label="$t('inquiries.form.crisisCenter.fields.notOfferedInterview')" />
                    <FormSelectMultiple id="assessment_reason"
                                            :options="state.options.assessment_reason_list"
                                            v-model="state.formInquiry.assessment_uuid" />
                    <FormError :error="v$?.formInquiry?.assessment_uuid?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.assessment_uuid?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="guidance" :label="$t('inquiries.form.crisisCenter.fields.guidance')" />
                    <FormSelectMultiple id="guidance"
                                            :options="state.options.guidance_list"
                                            v-model="state.formInquiry.guidance_uuid" />
                    <FormError :error="v$?.formInquiry?.guidance_uuid?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.guidance_uuid?.[0]" />
                </div>
                 <div class="space-y-1">
                    <FormLabel for="notes" :label="$t('inquiries.form.notes')" />
                    <FormTextArea id="notes" name="notes"
                        :placeholder="$t('inquiries.form.notes')"
                        v-model="state.formInquiry.notes" />
                    <FormError :error="v$?.formInquiry?.notes?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.notes?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="outcome" :label="$t('inquiries.form.outcome')" />
                    <FormTextField id="outcome" name="outcome" :placeholder="$t('inquiries.form.outcome')"
                        v-model="state.formInquiry.outcome" />
                    <FormError :error="v$?.formInquiry?.outcome?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.outcome?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="purpose" :label="$t('inquiries.form.purpose')" />
                    <FormTextField id="purpose" name="purpose" :placeholder="$t('inquiries.form.purpose')"
                        v-model="state.formInquiry.purpose" />
                    <FormError :error="v$?.formInquiry?.purpose?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.purpose?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="conversation_summary" :label="$t('inquiries.form.conversationSummary')" />
                    <FormTextArea id="conversation_summary" name="conversation_summary"
                        :placeholder="$t('inquiries.form.conversationSummary')"
                        v-model="state.formInquiry.conversation_summary" />
                    <FormError :error="v$?.formInquiry?.conversation_summary?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.conversation_summary?.[0]" />
                </div>
            </div>
            <div class="mt-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="emit('closeModal')">
                        {{ $t('cancel') }}
                    </FormButton>
                    <FormButton type="submit" buttonStyle="primary" class="rounded-md">
                        {{ props.formType === 'create' ? $t('save') :
                            $t('update') }}
                    </FormButton>
                </div>
            </div>
        </form>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'
import { citizenInquiryService } from '@/components/api/user/CitizenInquiryService'

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    selectedInquiry: {
        type: Object,
        required: false,
    },
})
const emit = defineEmits(['closeModal', 'isPageLoading', 'submitForm'])

const { t, locale } = useI18n()

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
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
    options: {
        inquiry_type: [
           { value: 'shelter', label: `${t('inquiries.form.options.inquiryType.shelter')}` }, 
           { value: 'crisis_center', label: `${t('inquiries.form.options.inquiryType.crisisCenter')}` }
        ],
        contactedBy: [
            { value: 'the_citizen_themselves', label: `${t('inquiries.form.options.contactedBy.theCitizenThemselves')}` },
            { value: 'family_friend_neighbor_colleague_acquaintance', label: `${t('inquiries.form.options.contactedBy.familyFriends')}` },
            { value: 'municipal_employee', label: `${t('inquiries.form.options.contactedBy.municipalEmployee')}` },
            { value: 'police_prison_and_probation_service', label: `${t('inquiries.form.options.contactedBy.police')}` },
            { value: 'healthcare_professional', label: `${t('inquiries.form.options.contactedBy.healthcareProfessional')}` },
            { value: 'employee_from_another_crisis_center', label: `${t('inquiries.form.options.contactedBy.employeeFromAnotherCrisisCenter')}` },
            { value: 'other', label: `${t('inquiries.form.options.contactedBy.other')}` },
        ] as any,
        about_list: [] as any,
        assessment: [
            { value: 'yes', label: `${t('inquiries.form.options.assessment.yes')}` },
            { value: 'no', label: `${t('inquiries.form.options.assessment.no')}` },
            { value: 'unknown', label: `${t('inquiries.form.options.assessment.unknown')}` },
        ],
        assessment_reason_list: [] as any,
        guidance_list: [] as any,
        yesNo: [
            { value: 'yes', label: `${t('inquiries.form.options.yesNo.yes')}` },
            { value: 'no', label: `${t('inquiries.form.options.yesNo.no')}` },
        ],
    }
})

onMounted(() => {
    state.formInquiry = {
        inquiry_type: 'crisis_center',
        cpr: props.selectedInquiry?.cpr || '',
        inquiry_date: props.selectedInquiry?.inquiry_date,
        inquirer_name: props.selectedInquiry?.inquirer_name,
        first_name: props.selectedInquiry?.firstname,
        last_name: props.selectedInquiry?.lastname,
        contacted_by: props.selectedInquiry?.contacted_by || '',
        outcome: props.selectedInquiry?.outcome,
        purpose: props.selectedInquiry?.purpose,
        topic_uuid: props.selectedInquiry?.topics.map((topic: any) => topic.uuid) || [],
        target_group_crisis_center: props.selectedInquiry?.target_group_crisis_center || [],
        received_visit: props.selectedInquiry?.received_visit || false,
        assessment_uuid: props.selectedInquiry?.no_assessment_reasons.map((reason: any) => reason.uuid) || [],
        guidance_uuid: props.selectedInquiry?.guidances.map((guidance: any) => guidance.uuid) || [],
        conversation_summary: props.selectedInquiry?.conversation_summary,
        notes: props.selectedInquiry?.notes || ''
    }

    fetchInquiryAboutListOptions()
    fetchAssessmentReasonListOptions()
    fetchGuidanceListOptions()
})

watch(() => props.selectedInquiry, (newValue: any) => {
    if (newValue != null) {
        state.formInquiry = {
            inquiry_type: newValue.inquiry_type || '',
            cpr: newValue.cpr || '',
            inquiry_date: newValue.inquiry_date,
            inquirer_name: newValue.inquirer_name,
            first_name: newValue.first_name,
            last_name: newValue.last_name,
            contacted_by: newValue.contacted_by || '',
            outcome: newValue.outcome,
            purpose: newValue.purpose,
            topic_uuid: newValue.topic_uuid || [],
            target_group_crisis_center: newValue.target_group_crisis_center || [],
            received_visit: newValue.received_visit || '',
            assessment_uuid: newValue.assessment_uuid || [],
            guidance_uuid: newValue.guidance_uuid || [],
            conversation_summary: newValue.conversation_summary,
            notes: newValue.notes || ''
        }
    }
})

const rules = computed(() => {
    return {
        formInquiry: {
            cpr: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            inquiry_date: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            inquirer_name: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            conversation_summary: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

async function fetchInquiryAboutListOptions() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await citizenInquiryService.getAboutList()
        if (response.data) {
            let options: any = response.data.map((item: any) => {
                return {
                    value: item.uuid,
                    label: locale.value === 'en' ? item.en_name : item.dk_name,
                }
            })
            state.options.about_list = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchAssessmentReasonListOptions() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await citizenInquiryService.getAssessmentReasonList()
        if (response.data) {
            let options: any = response.data.map((item: any) => {
                return {
                    value: item.uuid,
                    label: locale.value === 'en' ? item.en_name : item.dk_name,
                }
            })
            state.options.assessment_reason_list = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchGuidanceListOptions() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await citizenInquiryService.getGuidanceList()
        if (response.data) {
            let options: any = response.data.map((item: any) => {
                return {
                    value: item.uuid,
                    label: locale.value === 'en' ? item.en_name : item.dk_name,
                }
            })
            state.options.guidance_list = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formInquiry)
    }
}
</script>