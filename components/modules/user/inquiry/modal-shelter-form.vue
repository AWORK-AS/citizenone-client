<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <form @submit.prevent="submitForm()">
            <Alert type="danger" :text="props?.error?.message"
                v-if="props.error?.message && props.error.message.length > 0" />
            <div class="space-y-3">
                <div class="space-y-1">
                    <FormLabel for="inquiry_date" :label="dateOfInquiryLabel" />
                    <FormDateField id="inquiry_date" name="inquiry_date"
                        :placeholder="dateOfInquiryLabel" v-model="state.formInquiry.inquiry_date" />
                    <FormError :error="v$?.formInquiry?.inquiry_date?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.inquiry_date?.[0]" />
                </div>

                <div class="space-y-1">
                    <FormLabel for="department_uuid" :label="departmentLabel" />
                    <FormSelectMultiple id="department_uuid" :options="state.options.departments"
                        v-model="state.formInquiry.department_uuid" />
                    <FormError :error="props?.error?.errors?.department_uuid?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="cpr" :label="$t('inquiries.form.cpr')" />
                    <FormTextField id="cpr" name="cpr" :placeholder="$t('inquiries.form.cpr')"
                        v-model="state.formInquiry.cpr" />
                    <FormError :error="v$?.formInquiry?.cpr?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.cpr?.[0]" />
                </div>

                <!-- Question 2b: CPR Missing Reason - Only show if CPR is empty -->
                <div class="space-y-1" v-if="showCprMissingReason">
                    <FormLabel for="cpr_missing_reason" :label="$t('inquiries.form.shelter.fields.cprMissingReason')" />
                    <FormSelect id="cpr_missing_reason" :options="state.options.cprMissingReason"
                        v-model="state.formInquiry.cpr_missing_reason" />
                    <FormError :error="v$?.formInquiry?.cpr_missing_reason?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.cpr_missing_reason?.[0]" />
                </div>


                <div class="space-y-1">
                    <FormLabel for="inquirer_name" :label="completedByLabel" />
                    <FormTextField id="inquirer_name" name="inquirer_name"
                        :placeholder="completedByLabel" v-model="state.formInquiry.inquirer_name" />
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
                    <FormLabel for="vacant_place_available"
                        :label="$t('inquiries.form.shelter.fields.vacantPlaceAvailable')" />
                    <FormSelect id="vacant_place_available" :options="state.options.yesNo"
                        v-model="state.formInquiry.vacant_place_available" />
                    <FormError :error="v$?.formInquiry?.vacant_place_available?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.vacant_place_available?.[0]" />
                </div>

                <div class="space-y-1">
                    <FormLabel for="in_shelter_target_group"
                        :label="$t('inquiries.form.shelter.fields.inShelterTargetGroup')" />
                    <FormSelect id="in_shelter_target_group" :options="state.options.yesNo"
                        v-model="state.formInquiry.in_shelter_target_group" />
                    <FormError :error="v$?.formInquiry?.in_shelter_target_group?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.in_shelter_target_group?.[0]" />
                </div>

                <!-- Question 5: Fits in Target Group - Only show if in_shelter_target_group is "yes" -->
                <div class="space-y-1" v-if="showFitsInTargetGroup">
                    <FormLabel for="fits_in_target_group"
                        :label="$t('inquiries.form.shelter.fields.fitsInTargetGroup')" />
                    <FormSelect id="fits_in_target_group" :options="state.options.yesNo"
                        v-model="state.formInquiry.fits_in_target_group" />
                    <FormError :error="v$?.formInquiry?.fits_in_target_group?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.fits_in_target_group?.[0]" />
                </div>

                <!-- Question 6a: Non Admission Reason - Only if in target group + fits target group + space available -->
                <div class="space-y-1" v-if="showNonAdmissionReason">
                    <FormLabel for="non_admission_reason"
                        :label="$t('inquiries.form.shelter.fields.nonAdmissionReason')" />
                    <FormSelect id="non_admission_reason" :options="state.options.nonAdmissionReason"
                        v-model="state.formInquiry.non_admission_reason" />
                    <FormError :error="v$?.formInquiry?.non_admission_reason?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.non_admission_reason?.[0]" />
                </div>

                <!-- Question 6b: Not In Service Target Group Reason - Only if in target group + doesn't fit -->
                <div class="space-y-1" v-if="showNotInServiceTargetGroupReason">
                    <FormLabel for="not_in_service_target_group_reason"
                        :label="$t('inquiries.form.shelter.fields.notInServiceTargetGroupReason')" />
                    <FormSelect id="not_in_service_target_group_reason"
                        :options="state.options.notInServiceTargetGroupReason"
                        v-model="state.formInquiry.not_in_service_target_group_reason" />
                    <FormError
                        :error="v$?.formInquiry?.not_in_service_target_group_reason?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.not_in_service_target_group_reason?.[0]" />
                </div>

                <!-- Question 7: Referral Destination - Show in rejection scenarios -->
                <div class="space-y-1" v-if="showReferralDestination">
                    <FormLabel for="referral_destination"
                        :label="$t('inquiries.form.shelter.fields.referralDestination')" />
                    <FormSelect id="referral_destination" :options="state.options.referralDestination"
                        v-model="state.formInquiry.referral_destination" />
                    <FormError :error="v$?.formInquiry?.referral_destination?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.referral_destination?.[0]" />
                </div>
                <div class="space-y-1" v-if="isNotesActive">
                    <FormLabel for="notes" :label="$t('inquiries.form.notes')" />
                    <FormTextArea id="notes" name="notes" :placeholder="$t('inquiries.form.notes')"
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
                <div class="space-y-1" v-if="isPurposeActive">
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
    selectedInquiry: {
        type: Object,
        required: false,
    },
})
const emit = defineEmits(['closeModal', 'isPageLoading', 'submitForm'])

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
        cpr_missing_reason: '',
        inquiry_date: '',
        department_uuid: [] as any,
        inquirer_name: '',
        first_name: '',
        last_name: '',
        vacant_place_available: '',
        in_shelter_target_group: '',
        fits_in_target_group: '',
        non_admission_reason: '',
        not_in_service_target_group_reason: '',
        referral_destination: '',
        notes: '',
        outcome: '',
        conversation_summary: '',
        purpose: '',

    },
    options: {
        departments: [] as any,
        inquiry_type: [
            { value: 'shelter', label: `${t('inquiries.form.options.inquiryType.shelter')}` },
            { value: 'crisis_center', label: `${t('inquiries.form.options.inquiryType.crisisCenter')}` }
        ],
        yesNo: [
            { value: 'yes', label: `${t('inquiries.form.options.yesNo.yes')}` },
            { value: 'no', label: `${t('inquiries.form.options.yesNo.no')}` },
        ],
        cprMissingReason: [
            { value: 'citizen_does_not_have_cpr_number', label: `${t('inquiries.form.options.cprMissingReason.citizenDoesNotHaveCprNumber')}` },
            { value: 'shelter_does_not_know_citizen_cpr_number', label: `${t('inquiries.form.options.cprMissingReason.shelterDoesntHaveNumber')}` },
        ],
        nonAdmissionReason: [
            { value: 'expelled_due_to_violent_behavior', label: `${t('inquiries.form.options.nonAdmissionReason.expelledDueToViolentBehavior')}` },
            { value: 'citizen_declined_offer', label: `${t('inquiries.form.options.nonAdmissionReason.citizenDeclinedOffer')}` },
            { value: 'other', label: `${t('inquiries.form.options.nonAdmissionReason.other')}` },
        ],
        notInServiceTargetGroupReason: [
            { value: 'active_substance_abuse_problem', label: `${t('inquiries.form.options.notInServiceTargetGroupReason.activeSubstanceAbuseProblem')}` },
            { value: 'inactive_substance_abuse_problem', label: `${t('inquiries.form.options.notInServiceTargetGroupReason.inactiveSubstanceAbuseProblem')}` },
            { value: 'mental_difficulties', label: `${t('inquiries.form.options.notInServiceTargetGroupReason.mentalDifficulties')}` },
            { value: 'mental_functional_impairment', label: `${t('inquiries.form.options.notInServiceTargetGroupReason.mentalFunctionalImpairment')}` },
            { value: 'expose_to_violence', label: `${t('inquiries.form.options.notInServiceTargetGroupReason.exposeToViolence')}` },
            { value: 'unexposed_to_violence', label: `${t('inquiries.form.options.notInServiceTargetGroupReason.unexposeToViolence')}` },
            { value: 'children_accompany', label: `${t('inquiries.form.options.notInServiceTargetGroupReason.childrenAccompany')}` },
            { value: 'pets_accompany', label: `${t('inquiries.form.options.notInServiceTargetGroupReason.petsAccompany')}` },
            { value: 'not_within_gender_framework', label: `${t('inquiries.form.options.notInServiceTargetGroupReason.notWithinGenderFramework')}` },
            { value: 'not_within_age_framework', label: `${t('inquiries.form.options.notInServiceTargetGroupReason.notWithinAgeFramework')}` },
            { value: 'physical_functional_impairment', label: `${t('inquiries.form.options.notInServiceTargetGroupReason.physicalFunctionalImpairment')}` },
            { value: 'not_within_service_target_group', label: `${t('inquiries.form.options.notInServiceTargetGroupReason.notWithinServiceTargetGroup')}` },
        ],
        referralDestination: [
            { value: 'shelter_via_vacancy_overview', label: `${t('inquiries.form.options.referralDestination.shelterViaVacancyOverview')}` },
            { value: 'shelter_unused_vacancy_overview', label: `${t('inquiries.form.options.referralDestination.shelterUnusedVacancyOverview')}` },
            { value: 'night_cafe_warming_center', label: `${t('inquiries.form.options.referralDestination.nightCafeWarmingCenter')}` },
            { value: 'boarding_house_hostel', label: `${t('inquiries.form.options.referralDestination.boardingHouseHostel')}` },
            { value: 'womens_crisis_center', label: `${t('inquiries.form.options.referralDestination.womensCrisisCenter')}` },
            { value: 'self_solution', label: `${t('inquiries.form.options.referralDestination.selfSolution')}` },
            { value: 'other', label: `${t('inquiries.form.options.referralDestination.other')}` },
        ]

    }
})

// Computed properties for conditional field visibility
const showCprMissingReason = computed(() => {
    // Show if CPR is empty or whitespace
    return !state.formInquiry.cpr || state.formInquiry.cpr.trim() === ''
})

const showFitsInTargetGroup = computed(() => {
    // Show only if citizen is in shelter target group
    return state.formInquiry.in_shelter_target_group === 'yes'
})

const showNonAdmissionReason = computed(() => {
    // Question 6a: Show if in target group + fits target group + space available
    return state.formInquiry.in_shelter_target_group === 'yes' &&
        state.formInquiry.fits_in_target_group === 'yes' &&
        state.formInquiry.vacant_place_available === 'yes'
})

const showNotInServiceTargetGroupReason = computed(() => {
    // Question 6b: Show if in target group but doesn't fit offer's target group
    return state.formInquiry.in_shelter_target_group === 'yes' &&
        state.formInquiry.fits_in_target_group === 'no'
})

const showReferralDestination = computed(() => {
    // Question 7: Show in these scenarios: 
    // 1. Fits target group but no space available
    // 2. Doesn't fit target group (after showing 6b)
    // 3. Fits target group, space available, but not admitted (after showing 6a)

    if (state.formInquiry.in_shelter_target_group !== 'yes') {
        return false // Don't show if not in target group at all
    }

    // Scenario:  Fits target group + no space
    if (state.formInquiry.fits_in_target_group === 'yes' &&
        state.formInquiry.vacant_place_available === 'no') {
        return true
    }

    // Scenario: Doesn't fit target group
    if (state.formInquiry.fits_in_target_group === 'no') {
        return true
    }

    // Scenario: Fits target group + space available but not admitted (has filled 6a)
    if (state.formInquiry.fits_in_target_group === 'yes' &&
        state.formInquiry.vacant_place_available === 'yes' &&
        state.formInquiry.non_admission_reason) {
        return true
    }

    return false
})

// Watchers to clear dependent fields when conditions change
watch(() => state.formInquiry.cpr, (newValue) => {
    // Clear CPR missing reason if CPR is provided
    if (newValue && newValue.trim() !== '') {
        state.formInquiry.cpr_missing_reason = ''
    }
})

watch(() => state.formInquiry.in_shelter_target_group, (newValue) => {
    // Clear all dependent fields if not in target group
    if (newValue === 'no') {
        state.formInquiry.fits_in_target_group = ''
        state.formInquiry.non_admission_reason = ''
        state.formInquiry.not_in_service_target_group_reason = ''
        state.formInquiry.referral_destination = ''
    }
})

watch(() => state.formInquiry.fits_in_target_group, (newValue) => {
    // Clear non_admission_reason if doesn't fit target group
    if (newValue === 'no') {
        state.formInquiry.non_admission_reason = ''
    }
    // Clear not_in_service_target_group_reason if fits target group
    if (newValue === 'yes') {
        state.formInquiry.not_in_service_target_group_reason = ''
    }
})

watch(() => state.formInquiry.vacant_place_available, (newValue) => {
    // Clear non_admission_reason if no space available
    if (newValue === 'no') {
        state.formInquiry.non_admission_reason = ''
    }
})

// Watch combinations for referral destination
watch([
    () => state.formInquiry.fits_in_target_group,
    () => state.formInquiry.vacant_place_available,
], () => {
    // Clear referral destination if conditions no longer met
    if (!showReferralDestination.value) {
        state.formInquiry.referral_destination = ''
    }
})

onMounted(() => {
    fetchDepartments()
    fetchCustomPages()
    state.formInquiry = {
        inquiry_type: 'shelter',
        cpr: props.selectedInquiry?.cpr || '',
        cpr_missing_reason: props.selectedInquiry?.cpr_missing_reason || '',
        inquiry_date: props.selectedInquiry?.inquiry_date,
        department_uuid: props.selectedInquiry?.departments?.map((d: any) => d.uuid) || [],
        inquirer_name: props.selectedInquiry?.inquirer_name,
        first_name: props.selectedInquiry?.firstname,
        last_name: props.selectedInquiry?.lastname,
        vacant_place_available: props.formType === 'update' ? (props.selectedInquiry?.vacant_place_available ? 'yes' : 'no') : '',
        in_shelter_target_group: props.formType === 'update' ? (props.selectedInquiry?.in_shelter_target_group ? 'yes' : 'no') : '',
        fits_in_target_group: props.formType === 'update' ? (props.selectedInquiry?.fits_in_target_group ? 'yes' : 'no') : '',
        non_admission_reason: props.selectedInquiry?.non_admission_reason || '',
        not_in_service_target_group_reason: props.selectedInquiry?.not_in_service_target_group_reason || '',
        referral_destination: props.selectedInquiry?.referral_destination || '',
        outcome: props.selectedInquiry?.outcome,
        purpose: props.selectedInquiry?.purpose,
        conversation_summary: props.selectedInquiry?.conversation_summary,
        notes: props.selectedInquiry?.notes || ''
    }
})

watch(() => props.selectedInquiry, (newValue: any) => {
    if (newValue != null) {
        state.formInquiry = {
            inquiry_type: 'shelter',
            cpr: props.selectedInquiry?.cpr || '',
            cpr_missing_reason: props.selectedInquiry?.cpr_missing_reason || '',
            inquiry_date: props.selectedInquiry?.inquiry_date,
            department_uuid: props.selectedInquiry?.departments?.map((d: any) => d.uuid) || [],
            inquirer_name: props.selectedInquiry?.inquirer_name,
            first_name: props.selectedInquiry?.firstname,
            last_name: props.selectedInquiry?.lastname,
            vacant_place_available: props.selectedInquiry?.vacant_place_available || '',
            in_shelter_target_group: props.selectedInquiry?.in_shelter_target_group || '',
            fits_in_target_group: props.selectedInquiry?.fits_in_target_group || '',
            non_admission_reason: props.selectedInquiry?.non_admission_reason || '',
            not_in_service_target_group_reason: props.selectedInquiry?.not_in_service_target_group_reason || '',
            referral_destination: props.selectedInquiry?.referral_destination || '',
            outcome: props.selectedInquiry?.outcome,
            purpose: props.selectedInquiry?.purpose,
            conversation_summary: props.selectedInquiry?.conversation_summary,
            notes: props.selectedInquiry?.notes || ''
        }
    }
})

const rules = computed(() => {
    return {
        formInquiry: {
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

function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formInquiry)
    }
}
</script>