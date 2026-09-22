<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <form @submit.prevent="submitForm()">
            <Alert type="danger" :text="props?.error?.message"
                v-if="props.error?.message && props.error.message.length > 0" />
            <div class="space-y-6">
                <section>
                    <h3 class="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {{ $t('inquiries.form.sections.inquiry') }}
                    </h3>
                    <div class="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                        <div class="space-y-1" v-if="asksFor('inquiry_date')">
                            <FormLabel for="inquiry_date" :label="dateOfInquiryLabel" />
                            <FormDateField id="inquiry_date" name="inquiry_date"
                                :placeholder="dateOfInquiryLabel" v-model="state.formInquiry.inquiry_date" />
                            <FormError :error="v$?.formInquiry?.inquiry_date?.$errors[0]?.$message.toString()" />
                            <FormError :error="props?.error?.errors?.inquiry_date?.[0]" />
                        </div>
                        <div class="space-y-1" v-if="asksFor('department_uuid')">
                            <FormLabel for="department_uuid" :label="departmentLabel" />
                            <FormSelectMultiple id="department_uuid" :options="state.options.departments"
                                v-model="state.formInquiry.department_uuid" />
                            <FormError :error="props?.error?.errors?.department_uuid?.[0]" />
                        </div>
                        <div class="space-y-1" v-if="asksFor('contacted_by')">
                            <FormLabel for="contacted_by" :label="$t('inquiries.form.crisisCenter.fields.contactedBy')" />
                            <FormSelect id="contacted_by" :options="state.options.contactedBy"
                                v-model="state.formInquiry.contacted_by" />
                            <FormError :error="v$?.formInquiry?.contacted_by?.$errors[0]?.$message.toString()" />
                            <FormError :error="props?.error?.errors?.contacted_by?.[0]" />
                        </div>
                        <!-- Hidden when the type was already chosen on the way in:
                             asking again invites two answers to the same question. -->
                        <div class="space-y-1" v-if="!props.serviceType">
                            <FormLabel for="inquiry_service_type"
                                :label="$t('inquiryServiceTypes.single')" />
                            <FormSelect id="inquiry_service_type" :options="state.options.serviceTypes"
                                :modelValue="state.formInquiry.inquiry_service_type_uuid"
                                @update:modelValue="(value: any) => state.formInquiry.inquiry_service_type_uuid = value" />
                            <p class="text-[11px] text-slate-400">
                                {{ $t('inquiryServiceTypes.hint') }}
                            </p>
                        </div>
                        <div class="space-y-1 sm:col-span-2" v-if="asksFor('company_contact')">
                            <FormLabel for="company_contact" :label="$t('inquiryContact.label')" />
                            <ModulesUserInquiryContactPicker :contact="props.selectedInquiry?.company_contact"
                                @update:contactUuid="(uuid: any) => state.formInquiry.company_contact_uuid = uuid" />
                            <p class="text-[11px] text-slate-400">
                                {{ $t('inquiryContact.hint') }}
                            </p>
                        </div>
                        <div class="space-y-1" v-if="asksFor('inquirer_name')">
                            <FormLabel for="inquirer_name" :label="completedByLabel" />
                            <FormTextField id="inquirer_name" name="inquirer_name"
                                :placeholder="completedByLabel" v-model="state.formInquiry.inquirer_name" />
                            <FormError :error="v$?.formInquiry?.inquirer_name?.$errors[0]?.$message.toString()" />
                            <FormError :error="props?.error?.errors?.inquirer_name?.[0]" />
                        </div>
                    </div>
                </section>
                <section>
                    <h3 class="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {{ $t('inquiries.form.sections.citizen') }}
                    </h3>
                    <div class="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                        <div class="space-y-1" v-if="asksFor('cpr')">
                            <FormLabel for="cpr" :label="$t('inquiries.form.cpr')" />
                            <FormTextField id="cpr" name="cpr" :placeholder="$t('inquiries.form.cpr')"
                                v-model="state.formInquiry.cpr" />
                            <FormError :error="v$?.formInquiry?.cpr?.$errors[0]?.$message.toString()" />
                            <FormError :error="props?.error?.errors?.cpr?.[0]" />
                        </div>
                        <div class="space-y-1" v-if="asksFor('first_name')">
                            <FormLabel for="first_name" :label="$t('inquiries.form.firstname')" />
                            <FormTextField id="first_name" name="first_name" :placeholder="$t('inquiries.form.firstname')"
                                v-model="state.formInquiry.first_name" />
                            <FormError :error="v$?.formInquiry?.first_name?.$errors[0]?.$message.toString()" />
                            <FormError :error="props?.error?.errors?.first_name?.[0]" />
                        </div>
                        <div class="space-y-1" v-if="asksFor('last_name')">
                            <FormLabel for="last_name" :label="$t('inquiries.form.lastname')" />
                            <FormTextField id="last_name" name="last_name" :placeholder="$t('inquiries.form.lastname')"
                                v-model="state.formInquiry.last_name" />
                            <FormError :error="v$?.formInquiry?.last_name?.$errors[0]?.$message.toString()" />
                            <FormError :error="props?.error?.errors?.last_name?.[0]" />
                        </div>
                    </div>
                </section>
                <section>
                    <h3 class="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {{ $t('inquiries.form.sections.assessment') }}
                    </h3>
                    <div class="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                        <div class="space-y-1 sm:col-span-2" v-if="asksFor('topic')">
                            <FormLabel for="topic" :label="$t('inquiries.form.crisisCenter.fields.topic')" />
                            <FormSelectMultiple id="topic" :options="state.options.about_list"
                                v-model="state.formInquiry.topic_uuid" />
                            <FormError :error="v$?.formInquiry?.topic_uuid?.$errors[0]?.$message.toString()" />
                            <FormError :error="props?.error?.errors?.topic_uuid?.[0]" />
                        </div>
                        <!-- Question 5: Assessment - Only show if topic includes "inquiry about place" -->
                        <div class="space-y-1" v-if="asksFor('assessment') && (showAssessmentFields)">
                            <FormLabel for="assessment" :label="$t('inquiries.form.crisisCenter.fields.assessment')" />
                            <FormSelect id="assessment" :options="state.options.assessment"
                                v-model="state.formInquiry.target_group_crisis_center" />
                            <FormError :error="v$?.formInquiry?.target_group_crisis_center?.$errors[0]?.$message.toString()" />
                            <FormError :error="props?.error?.errors?.target_group_crisis_center?.[0]" />
                        </div>
                        <!-- Question 6: Received Visit - Only show if assessment is "yes" or "unknown" -->
                        <div class="space-y-1" v-if="asksFor('received_visit') && (showReceivedVisitField)">
                            <FormLabel for="received_visit" :label="$t('inquiries.form.crisisCenter.fields.receivedVisit')" />
                            <FormSelect id="received_visit" :options="state.options.yesNo"
                                v-model="state.formInquiry.received_visit" />
                            <FormError :error="v$?.formInquiry?.received_visit?.$errors[0]?.$message.toString()" />
                            <FormError :error="props?.error?.errors?.received_visit?.[0]" />
                        </div>
                        <!-- Question 7: Assessment Reason - Only show if received_visit is "no" -->
                        <div class="space-y-1 sm:col-span-2" v-if="asksFor('assessment_reason') && (showAssessmentReasonAndGuidance)">
                            <FormLabel for="assessment_reason"
                                :label="$t('inquiries.form.crisisCenter.fields.notOfferedInterview')" />
                            <FormSelectMultiple id="assessment_reason" :options="state.options.assessment_reason_list"
                                v-model="state.formInquiry.assessment_uuid" />
                            <FormError :error="v$?.formInquiry?.assessment_uuid?.$errors[0]?.$message.toString()" />
                            <FormError :error="props?.error?.errors?.assessment_uuid?.[0]" />
                        </div>
                        <!-- Question 8: Guidance - Only show if received_visit is "no" -->
                        <div class="space-y-1 sm:col-span-2" v-if="asksFor('guidance') && (showAssessmentReasonAndGuidance)">
                            <FormLabel for="guidance" :label="$t('inquiries.form.crisisCenter.fields.guidance')" />
                            <FormSelectMultiple id="guidance" :options="state.options.guidance_list"
                                v-model="state.formInquiry.guidance_uuid" />
                            <FormError :error="v$?.formInquiry?.guidance_uuid?.$errors[0]?.$message.toString()" />
                            <FormError :error="props?.error?.errors?.guidance_uuid?.[0]" />
                        </div>
                    </div>
                </section>
                <section>
                    <h3 class="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {{ $t('inquiries.form.sections.outcome') }}
                    </h3>
                    <div class="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                        <div class="space-y-1" v-if="asksFor('outcome')">
                            <FormLabel for="outcome" :label="$t('inquiries.form.outcome')" />
                            <FormTextField id="outcome" name="outcome" :placeholder="$t('inquiries.form.outcome')"
                                v-model="state.formInquiry.outcome" />
                            <FormError :error="v$?.formInquiry?.outcome?.$errors[0]?.$message.toString()" />
                            <FormError :error="props?.error?.errors?.outcome?.[0]" />
                        </div>
                        <div class="space-y-1" v-if="asksFor('purpose') && (isPurposeActive)">
                            <FormLabel for="purpose" :label="$t('inquiries.form.purpose')" />
                            <FormTextField id="purpose" name="purpose" :placeholder="$t('inquiries.form.purpose')"
                                v-model="state.formInquiry.purpose" />
                            <FormError :error="v$?.formInquiry?.purpose?.$errors[0]?.$message.toString()" />
                            <FormError :error="props?.error?.errors?.purpose?.[0]" />
                        </div>
                        <div class="space-y-1 sm:col-span-2" v-if="asksFor('notes') && (isNotesActive)">
                            <FormLabel for="notes" :label="$t('inquiries.form.notes')" />
                            <FormTextArea id="notes" name="notes" :placeholder="$t('inquiries.form.notes')"
                                v-model="state.formInquiry.notes" />
                            <FormError :error="v$?.formInquiry?.notes?.$errors[0]?.$message.toString()" />
                            <FormError :error="props?.error?.errors?.notes?.[0]" />
                        </div>
                        <div class="space-y-1 sm:col-span-2" v-if="asksFor('conversation_summary')">
                            <FormLabel for="conversation_summary" :label="$t('inquiries.form.conversationSummary')" />
                            <FormTextArea id="conversation_summary" name="conversation_summary"
                                :placeholder="$t('inquiries.form.conversationSummary')"
                                v-model="state.formInquiry.conversation_summary" />
                            <FormError :error="v$?.formInquiry?.conversation_summary?.$errors[0]?.$message.toString()" />
                            <FormError :error="props?.error?.errors?.conversation_summary?.[0]" />
                        </div>
                    </div>
                </section>
            </div>
            <div class="mt-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormButton type="button" buttonStyle="cancel" @click="emit('closeModal')">
                        {{ $t('cancel') }}
                    </FormButton>
                    <FormButton type="submit" buttonStyle="primary">
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
import { useCustomPagesStore } from '@/store/custom-pages'
import type { Error } from '@/types'
import { citizenInquiryService } from '@/components/api/user/CitizenInquiryService'
import { departmentService } from '@/components/api/user/DepartmentService'
import { inquiryServiceTypeService } from '@/components/api/user/InquiryServiceTypeService'
import { customPagesService } from '@/components/api/user/CustomPagesService'

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    // The kind of inquiry being taken. Decides which built-in fields the
    // form asks for; absent when one of the built-in forms is used directly.
    serviceType: {
        type: Object,
        required: false,
        default: null,
    },
    selectedInquiry: {
        type: Object,
        required: false,
    },
})
const emit = defineEmits(['closeModal', 'isPageLoading', 'submitForm'])

/**
 * Whether this kind of inquiry asks for a built-in field. A form opened
 * without a service type, or a type nobody has configured, asks for all of
 * them - which is what every form did before the setting existed.
 */
function asksFor(field: string): boolean {
    const configured = props.serviceType?.core_fields

    return !Array.isArray(configured) || configured.includes(field)
}

const { t, locale } = useI18n()
const customPagesStore = useCustomPagesStore() as any

const completedByLabel = computed(() => customPagesStore.getCustomPagesName?.completedBy || t('inquiries.form.inquirerName'))
const dateOfInquiryLabel = computed(() => customPagesStore.getCustomPagesName?.dateOfInquiry || t('inquiries.form.dateOfInquiry'))
const departmentLabel = computed(() => customPagesStore.getCustomPagesName?.department || t('department.department'))

const customPages = ref<any[]>([])
const isNotesActive = computed(() => customPages.value.find((p: any) => p.page_type === 'own_notes')?.is_field_active ?? true)
const isPurposeActive = computed(() => customPages.value.find((p: any) => p.page_type === 'purpose')?.is_field_active ?? true)

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formInquiry: {
        inquiry_type: 'crisis_center',
        cpr: '',
        inquiry_date: '',
        department_uuid: [] as any,
        inquirer_name: '',
        company_contact_uuid: null as string | null,
        inquiry_service_type_uuid: (props.serviceType?.uuid ?? null) as string | null,
        first_name: '',
        last_name: '',
        contacted_by: '',
        outcome: '',
        purpose: '',
        topic_uuid: [] as any,
        target_group_crisis_center: [] as any,
        received_visit: '',
        assessment_uuid: [] as any,
        guidance_uuid: [] as any,
        conversation_summary: '',
        notes: ''
    },
    options: {
        departments: [] as any,
        serviceTypes: [] as any,
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
    },
    inquiryAboutData: [] as any,
    assessmentReasonData: [] as any,
    guidanceData: [] as any,
})

onMounted(() => {
    state.formInquiry = {
        inquiry_type: 'crisis_center',
        cpr: props.selectedInquiry?.cpr || '',
        inquiry_date: props.selectedInquiry?.inquiry_date,
        department_uuid: props.selectedInquiry?.departments?.map((d: any) => d.uuid) || [],
        inquirer_name: props.selectedInquiry?.inquirer_name,
        company_contact_uuid: props.selectedInquiry?.company_contact?.uuid ?? null,
        inquiry_service_type_uuid: props.selectedInquiry?.service_type?.uuid ?? null,
        first_name: props.selectedInquiry?.firstname,
        last_name: props.selectedInquiry?.lastname,
        contacted_by: props.selectedInquiry?.contacted_by || '',
        outcome: props.selectedInquiry?.outcome,
        purpose: props.selectedInquiry?.purpose,
        topic_uuid: props.selectedInquiry?.topics?.map((topic: any) => topic.uuid) || [],
        target_group_crisis_center: props.selectedInquiry?.target_group_crisis_center || [],
        received_visit: props.formType === 'update' ? (props.selectedInquiry?.received_visit ? 'yes' : 'no') : '',
        assessment_uuid: props.selectedInquiry?.no_assessment_reasons?.map((reason: any) => reason.uuid) || [],
        guidance_uuid: props.selectedInquiry?.guidances?.map((guidance: any) => guidance.uuid) || [],
        conversation_summary: props.selectedInquiry?.conversation_summary,
        notes: props.selectedInquiry?.notes || ''
    }

    fetchDepartments()
    fetchServiceTypes()
    fetchCustomPages()
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
            department_uuid: newValue.departments?.map((d: any) => d.uuid) || [],
            inquirer_name: newValue.inquirer_name,
            company_contact_uuid: newValue.company_contact?.uuid ?? null,
            inquiry_service_type_uuid: newValue.service_type?.uuid ?? null,
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
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            inquiry_date: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            inquirer_name: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            conversation_summary: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

// Computed fields for conditional field rendering
const showAssessmentFields = computed(() => {
    const inquiryAboutPlace: string = 'inquiry-about-an-available-place-at-this-crisis-center'
    const inquiryAboutPlaceUuid = state.inquiryAboutData.find((item: any) => item.system_name === inquiryAboutPlace)?.uuid
    return state.formInquiry.topic_uuid?.includes(inquiryAboutPlaceUuid)
})

const showReceivedVisitField = computed(() => {
    return showAssessmentFields.value &&
        (state.formInquiry.target_group_crisis_center === 'yes' ||
            state.formInquiry.target_group_crisis_center === 'unknown')
})

const showAssessmentReasonAndGuidance = computed(() => {
    return showReceivedVisitField.value &&
        state.formInquiry.received_visit === 'no'
})

// Watch for changes and clear dependent fields for Dynamic Form
watch(() => state.formInquiry.topic_uuid, (newValue, oldValue) => {
    // If "inquiry about place" is no longer selected, clear dependent fields
    if (!showAssessmentFields.value) {
        state.formInquiry.target_group_crisis_center = []
        state.formInquiry.received_visit = ''
        state.formInquiry.assessment_uuid = []
        state.formInquiry.guidance_uuid = []
    }
})

watch(() => state.formInquiry.target_group_crisis_center, (newValue) => {
    // If assessment changes to "no", skip to end and clear intermediate fields
    if (newValue === 'no') {
        state.formInquiry.received_visit = ''
        state.formInquiry.assessment_uuid = []
        state.formInquiry.guidance_uuid = []
    }
})

watch(() => state.formInquiry.received_visit, (newValue) => {
    // If received_visit changes to "yes", clear reason and guidance
    if (newValue === 'yes') {
        state.formInquiry.assessment_uuid = []
        state.formInquiry.guidance_uuid = []
    }
})

async function fetchServiceTypes() {
    try {
        const response = await inquiryServiceTypeService.getServiceTypes()
        // Only what can still be chosen; a retired type stays on the inquiries
        // that already carry it.
        state.options.serviceTypes = (response?.data ?? [])
            .filter((type: any) => type.is_active)
            .map((type: any) => ({ value: type.uuid, label: type.label }))
    } catch (_) {
        state.options.serviceTypes = []
    }
}

async function fetchDepartments() {
    try {
        const response = await departmentService.getAllDepartments({})
        if (response) {
            state.options.departments = response.data.map((item: any) => ({
                value: item.uuid,
                label: item.name,
            }))
        }
    } catch (error: any) {
        state.error = error
    }
}

async function fetchCustomPages() {
    try {
        const response = await customPagesService.getCustomPages({})
        if (response?.data) customPages.value = response.data
    } catch (error: any) {
        state.error = error
    }
}

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
                    system_name: item.system_name
                }
            })
            state.options.about_list = options
            state.inquiryAboutData = response.data
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
                    system_name: item.system_name
                }
            })
            state.options.assessment_reason_list = options
            state.assessmentReasonData = response.data
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
                    system_name: item.system_name
                }
            })
            state.options.guidance_list = options
            state.guidanceData = response.data
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
