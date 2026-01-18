<template>
    <div>
        <Modal size="xl" :title="$t('citizens.inquiryStayData.inquiryAndStayData')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <div class="space-y-1">
                    <h3 class="text-sm font-semibold">
                        {{ $t('citizens.inquiryStayData.inquiryData.inquiryData') }}
                    </h3>
                    
                    <div class="flex items-center gap-x-1 text-sm">
                        <p>
                            {{ $t('citizens.inquiryStayData.inquiryData.dateOfInquiry') }}:
                        </p>
                        <p v-if="props?.selectedCitizen?.data?.inquiry_data?.inquiry_date">
                            {{ formatDateToReadable(props?.selectedCitizen?.data?.inquiry_data?.inquiry_date) }}
                        </p>
                    </div>
                    <div class="flex items-center gap-x-1 text-sm">
                        <p>
                            {{ $t('inquiries.form.cpr') }}:
                        </p>
                        <p>
                            {{ props?.selectedCitizen?.data?.inquiry_data?.cpr }}
                        </p>
                    </div>
                    
                    <!-- CPR Missing Reason (Shelter only) -->
                    <div v-if="isShelterInquiry && props?.selectedCitizen?.data?.inquiry_data?.cpr_missing_reason" class="flex items-center gap-x-1 text-sm">
                        <p>
                            {{ $t('inquiries.form.shelter.fields.cprMissingReason') }}:
                        </p>
                        <p>
                            {{ state.options.cprMissingReason.find((option: any) => option.value === props?.selectedCitizen?.data?.inquiry_data?.cpr_missing_reason)?.label }}
                        </p>
                    </div>
                    
                    <div class="flex items-center gap-x-1 text-sm">
                        <p>
                            {{ $t('inquiries.form.firstname') }}:
                        </p>
                        <p>
                            {{ props?.selectedCitizen?.data?.inquiry_data?.firstname }}
                        </p>
                    </div>
                    <div class="flex items-center gap-x-1 text-sm">
                        <p>
                            {{ $t('inquiries.form.lastname') }}:
                        </p>
                        <p>
                            {{ props?.selectedCitizen?.data?.inquiry_data?.lastname }}
                        </p>
                    </div>
                    <div class="flex items-center gap-x-1 text-sm">
                        <p>
                            {{ $t('citizens.inquiryStayData.inquiryData.inquirerName') }}:
                        </p>
                        <p>
                            {{ props?.selectedCitizen?.data?.inquiry_data?.inquirer_name }}
                        </p>
                    </div>
                    
                    <!-- Crisis Center Specific Fields -->
                    <template v-if="isCrisisCenterInquiry">
                        <!-- Contacted By -->
                        <div v-if="props?.selectedCitizen?.data?.inquiry_data?.contacted_by" class="flex items-center gap-x-1 text-sm">
                            <p>
                                {{ $t('inquiries.form.crisisCenter.fields.contactedBy') }}:
                            </p>
                            <p>
                                {{ state.options.contactedBy.find((option: any) => option.value === props?.selectedCitizen?.data?.inquiry_data?.contacted_by)?.label }}
                            </p>
                        </div>
                        
                        <!-- Topic (Multiple Selection) -->
                        <div v-if="topics" class="flex items-center gap-x-1 text-sm">
                            <p>
                                {{ $t('inquiries.form.crisisCenter.fields.topic') }}:
                            </p>
                            <p>
                                {{ topics }}
                            </p>
                        </div>
                        
                        <!-- Assessment (Target Group Crisis Center) -->
                        <div v-if="props?.selectedCitizen?.data?.inquiry_data?.target_group_crisis_center" class="flex items-center gap-x-1 text-sm">
                            <p>
                                {{ $t('inquiries.form.crisisCenter.fields.assessment') }}:
                            </p>
                            <p>
                                {{ state.options.assessment.find((option: any) => option.value === props?.selectedCitizen?.data?.inquiry_data?.target_group_crisis_center)?.label }}
                            </p>
                        </div>
                        
                        <!-- Received Visit -->
                        <div v-if="props?.selectedCitizen?.data?.inquiry_data?.received_visit !== null && props?.selectedCitizen?.data?.inquiry_data?.received_visit !== undefined" class="flex items-center gap-x-1 text-sm">
                            <p>
                                {{ $t('inquiries.form.crisisCenter.fields.receivedVisit') }}:
                            </p>
                            <p>
                                {{ props?.selectedCitizen?.data?.inquiry_data?.received_visit ?  state.options.yesNo.find((option: any) => option.value === 'yes')?.label : state.options.yesNo.find((option: any) => option.value === 'no')?.label }}
                            </p>
                        </div>
                        
                        <!-- No Assessment Reasons (Not Offered Interview - Multiple Selection) -->
                        <div v-if="noAssessmentReasons" class="flex items-center gap-x-1 text-sm">
                            <p>
                                {{ $t('inquiries.form.crisisCenter.fields.notOfferedInterview') }}:
                            </p>
                            <p>
                                {{ noAssessmentReasons }}
                            </p>
                        </div>
                        
                        <!-- Guidance (Multiple Selection) -->
                        <div v-if="guidances" class="flex items-center gap-x-1 text-sm">
                            <p>
                                {{ $t('inquiries.form.crisisCenter.fields.guidance') }}:
                            </p>
                            <p>
                                {{ guidances }}
                            </p>
                        </div>
                    </template>
                    
                    <!-- Shelter Specific Fields -->
                    <template v-if="isShelterInquiry">
                        <!-- Vacant Place Available -->
                        <div v-if="props?.selectedCitizen?.data?.inquiry_data?.vacant_place_available !== null && props?.selectedCitizen?.data?.inquiry_data?.vacant_place_available !== undefined" class="flex items-center gap-x-1 text-sm">
                            <p>
                                {{ $t('inquiries.form.shelter.fields.vacantPlaceAvailable') }}:
                            </p>
                            <p>
                                {{ props?.selectedCitizen?.data?.inquiry_data?.vacant_place_available ? state.options.yesNo.find((option: any) => option.value === 'yes')?.label : state.options.yesNo.find((option: any) => option.value === 'no')?.label }}
                            </p>
                        </div>
                        
                        <!-- In Shelter Target Group -->
                        <div v-if="props?.selectedCitizen?.data?.inquiry_data?.in_shelter_target_group !== null && props?.selectedCitizen?.data?.inquiry_data?.in_shelter_target_group !== undefined" class="flex items-center gap-x-1 text-sm">
                            <p>
                                {{ $t('inquiries.form.shelter.fields.inShelterTargetGroup') }}:
                            </p>
                            <p>
                                {{ props?.selectedCitizen?.data?.inquiry_data?.in_shelter_target_group ? state.options.yesNo.find((option: any) => option.value === 'yes')?.label : state.options.yesNo.find((option: any) => option.value === 'no')?.label }}
                            </p>
                        </div>
                        
                        <!-- Fits In Target Group -->
                        <div v-if="props?.selectedCitizen?.data?.inquiry_data?.fits_in_target_group !== null && props?.selectedCitizen?.data?.inquiry_data?.fits_in_target_group !== undefined" class="flex items-center gap-x-1 text-sm">
                            <p>
                                {{ $t('inquiries.form.shelter.fields.fitsInTargetGroup') }}:
                            </p>
                            <p>
                                {{ props?.selectedCitizen?.data?.inquiry_data?.fits_in_target_group ? state.options.yesNo.find((option: any) => option.value === 'yes')?.label : state.options.yesNo.find((option: any) => option.value === 'no')?.label }}
                            </p>
                        </div>
                        
                        <!-- Non Admission Reason -->
                        <div v-if="props?.selectedCitizen?.data?.inquiry_data?.non_admission_reason" class="flex items-center gap-x-1 text-sm">
                            <p>
                                {{ $t('inquiries.form.shelter.fields.nonAdmissionReason') }}:
                            </p>
                            <p>
                                {{ state.options.nonAdmissionReason.find((option: any) => option.value === props?.selectedCitizen?.data?.inquiry_data?.non_admission_reason)?.label }}
                            </p>
                        </div>
                        
                        <!-- Not In Service Target Group Reason -->
                        <div v-if="props?.selectedCitizen?.data?.inquiry_data?.not_in_service_target_group_reason" class="flex items-center gap-x-1 text-sm">
                            <p>
                                {{ $t('inquiries.form.shelter.fields.notInServiceTargetGroupReason') }}:
                            </p>
                            <p>
                                {{ state.options.notInServiceTargetGroupReason.find((option: any) => option.value === props?.selectedCitizen?.data?.inquiry_data?.not_in_service_target_group_reason)?.label }}
                            </p>
                        </div>
                        
                        <!-- Referral Destination -->
                        <div v-if="props?.selectedCitizen?.data?.inquiry_data?.referral_destination" class="flex items-center gap-x-1 text-sm">
                            <p>
                                {{ $t('inquiries.form.shelter.fields.referralDestination') }}:
                            </p>
                            <p>
                                {{ state.options.referralDestination.find((option: any) => option.value === props?.selectedCitizen?.data?.inquiry_data?.referral_destination)?.label }}
                            </p>
                        </div>
                    </template>
                    
                    <!-- Common Fields -->
                    <!-- Notes -->
                    <div v-if="props?.selectedCitizen?.data?.inquiry_data?.notes" class="space-y-1 text-sm">
                        <p>
                            {{ $t('inquiries.form.notes') }}:
                        </p>
                        <p class="ml-3">
                            {{ props?.selectedCitizen?.data?.inquiry_data?.notes }}
                        </p>
                    </div>
                    
                    <!-- Outcome -->
                    <div v-if="props?.selectedCitizen?.data?.inquiry_data?.outcome" class="flex items-center gap-x-1 text-sm">
                        <p>
                            {{ $t('citizens.inquiryStayData.inquiryData.outcome') }}:
                        </p>
                        <p>
                            {{ props?.selectedCitizen?.data?.inquiry_data?.outcome }}
                        </p>
                    </div>
                    
                    <!-- Purpose -->
                    <div v-if="props?.selectedCitizen?.data?.inquiry_data?.purpose" class="flex items-center gap-x-1 text-sm">
                        <p>
                            {{ $t('citizens.inquiryStayData.inquiryData.purpose') }}:
                        </p>
                        <p>
                            {{ props?.selectedCitizen?.data?.inquiry_data?.purpose }}
                        </p>
                    </div>
                    
                    <!-- Conversation Summary -->
                    <div v-if="props?.selectedCitizen?.data?.inquiry_data?.conversation_summary" class="space-y-1 text-sm">
                        <p>
                            {{ $t('citizens.inquiryStayData.inquiryData.conversationSummary') }}:
                        </p>
                        <p class="ml-3">
                            {{ props?.selectedCitizen?.data?.inquiry_data?.conversation_summary }}
                        </p>
                    </div>
                </div>
                <div v-if="props?.selectedCitizen?.data?.stay_data" class="mt-5 space-y-1">
                    <h3 class="text-sm font-semibold">
                        {{ $t('citizens.inquiryStayData.stayData.stayData') }}
                    </h3>
                    <div class="flex items-center gap-x-1 text-sm">
                        <p>
                            {{ $t('citizens.inquiryStayData.stayData.journalNumber') }}:
                        </p>
                        <p>
                            {{ props?.selectedCitizen?.data?.stay_data?.journal_number }}
                        </p>
                    </div>
                    <div class="flex items-center gap-x-1 text-sm">
                        <p>
                            {{ $t('citizens.inquiryStayData.stayData.accommodationStartDate') }}:
                        </p>
                        <p v-if="props?.selectedCitizen?.data?.stay_data?.start_date">
                            {{ formatDateToReadable(props?.selectedCitizen?.data?.stay_data?.start_date) }}
                        </p>
                    </div>
                    <div class="flex items-center gap-x-1 text-sm">
                        <p>
                            {{ $t('citizens.inquiryStayData.stayData.accommodationEndDate') }}:
                        </p>
                        <p v-if="props?.selectedCitizen?.data?.stay_data?.end_date">
                            {{ formatDateToReadable(props?.selectedCitizen?.data?.stay_data?.end_date) }}
                        </p>
                    </div>
                    <div class="flex items-center gap-x-1 text-sm">
                        <p>
                            {{ $t('citizens.inquiryStayData.stayData.municipalityOfResidenceBefore') }}:
                        </p>
                        <p>
                            {{ props?.selectedCitizen?.data?.stay_data?.residence_before_municipality?.name }}
                        </p>
                    </div>
                    <div class="flex items-center gap-x-1 text-sm">
                        <p>
                            {{ $t('citizens.inquiryStayData.stayData.municipalityOfResidenceAfter') }}:
                        </p>
                        <p>
                            {{ props?.selectedCitizen?.data?.stay_data?.residence_after_municipality?.name }}
                        </p>
                    </div>
                    <div class="flex items-center gap-x-1 text-sm">
                        <p>
                            {{ $t('citizens.inquiryStayData.stayData.dischargeReason') }}:
                        </p>
                        <p>
                            {{ props?.selectedCitizen?.data?.stay_data?.discharge_reason }}
                        </p>
                    </div>
                    <div v-if="props?.selectedCitizen?.data?.stay_data?.accompanying_children?.length > 0" class="text-sm">
                        <p>
                            {{ $t('citizens.inquiryStayData.stayData.accompanyingChildren.accompanyingChildren') }}:
                        </p>
                        <div class="divide-y divide-gray-300 divide-dashed">
                            <div v-for="(child, index) in props?.selectedCitizen?.data?.stay_data?.accompanying_children"
                                :key="index" class="ml-3">
                                <div class="space-y-1 py-2">
                                    <div class="flex items-center gap-x-1 text-sm">
                                        <p>
                                            {{ $t('citizens.inquiryStayData.stayData.accompanyingChildren.name') }}:
                                        </p>
                                        <p>
                                            {{ child?.name }}
                                        </p>
                                    </div>
                                    <div class="flex items-center gap-x-1 text-sm">
                                        <p>
                                            {{ $t('citizens.inquiryStayData.stayData.accompanyingChildren.gender') }}:
                                        </p>
                                        <p>
                                            <span v-if="child?.gender === 'male'">
                                                {{ $t('gender.male') }}
                                            </span>
                                            <span v-if="child?.gender === 'female'">
                                                {{ $t('gender.female') }}
                                            </span>
                                            <span v-if="child?.gender === 'non_binary'">
                                                {{ $t('gender.nonbinary') }}
                                            </span>
                                            <span v-if="child?.gender === 'will_not_disclose'">
                                                {{ $t('gender.willNotDisclose') }}
                                            </span>
                                        </p>
                                    </div>
                                    <div class="flex items-center gap-x-1 text-sm">
                                        <p>
                                            {{ $t('citizens.inquiryStayData.stayData.accompanyingChildren.age') }}:
                                        </p>
                                        <p>
                                            {{ child?.age }}
                                        </p>
                                    </div>
                                    <div class="flex items-center gap-x-1 text-sm">
                                        <p>
                                            {{ $t('citizens.inquiryStayData.stayData.accompanyingChildren.origin') }}:
                                        </p>
                                        <p>
                                            {{ child?.origin }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mt-5 space-y-1">
                    <h3 class="text-sm font-semibold">
                        {{ $t('citizens.inquiryStayData.stayData.stayData') }}
                    </h3>
                    <div class="flex items-center gap-x-1 text-sm">
                        <p>
                            {{ $t('citizens.inquiryStayData.stayData.journalNumber') }}:
                        </p>
                        <p>
                            {{ props?.selectedCitizen?.data?.stay_data?.journal_number }}
                        </p>
                    </div>
                    <div class="flex items-center gap-x-1 text-sm">
                        <p>
                            {{ $t('citizens.inquiryStayData.stayData.accommodationStartDate') }}:
                        </p>
                        <p v-if="props?.selectedCitizen?.data?.stay_data?.start_date">
                            {{ formatDateToReadable(props?.selectedCitizen?.data?.stay_data?.start_date) }}
                        </p>
                    </div>
                    <div class="flex items-center gap-x-1 text-sm">
                        <p>
                            {{ $t('citizens.inquiryStayData.stayData.accommodationEndDate') }}:
                        </p>
                        <p v-if="props?.selectedCitizen?.data?.stay_data?.end_date">
                            {{ formatDateToReadable(props?.selectedCitizen?.data?.stay_data?.end_date) }}
                        </p>
                    </div>
                    <div class="flex items-center gap-x-1 text-sm">
                        <p>
                            {{ $t('citizens.inquiryStayData.stayData.municipalityOfResidenceBefore') }}:
                        </p>
                        <p>
                            {{ props?.selectedCitizen?.data?.stay_data?.residence_before_municipality?.name }}
                        </p>
                    </div>
                    <div class="flex items-center gap-x-1 text-sm">
                        <p>
                            {{ $t('citizens.inquiryStayData.stayData.municipalityOfResidenceAfter') }}:
                        </p>
                        <p>
                            {{ props?.selectedCitizen?.data?.stay_data?.residence_after_municipality?.name }}
                        </p>
                    </div>
                    <div class="flex items-center gap-x-1 text-sm">
                        <p>
                            {{ $t('citizens.inquiryStayData.stayData.dischargeReason') }}:
                        </p>
                        <p>
                            {{ props?.selectedCitizen?.data?.stay_data?.discharge_reason }}
                        </p>
                    </div>
                    <div class="text-sm">
                        <p>
                            {{ $t('citizens.inquiryStayData.stayData.accompanyingChildren.accompanyingChildren') }}:
                        </p>
                        <div class="divide-y divide-gray-300 divide-dashed">
                            <div v-for="(child, index) in props?.selectedCitizen?.data?.stay_data?.accompanying_children"
                                :key="index" class="ml-3">
                                <div class="space-y-1 py-2">
                                    <div class="flex items-center gap-x-1 text-sm">
                                        <p>
                                            {{ $t('citizens.inquiryStayData.stayData.accompanyingChildren.name') }}:
                                        </p>
                                        <p>
                                            {{ child?.name }}
                                        </p>
                                    </div>
                                    <div class="flex items-center gap-x-1 text-sm">
                                        <p>
                                            {{ $t('citizens.inquiryStayData.stayData.accompanyingChildren.gender') }}:
                                        </p>
                                        <p>
                                            <span v-if="child?.gender === 'male'">
                                                {{ $t('gender.male') }}
                                            </span>
                                            <span v-if="child?.gender === 'female'">
                                                {{ $t('gender.female') }}
                                            </span>
                                            <span v-if="child?.gender === 'non_binary'">
                                                {{ $t('gender.nonbinary') }}
                                            </span>
                                            <span v-if="child?.gender === 'will_not_disclose'">
                                                {{ $t('gender.willNotDisclose') }}
                                            </span>
                                        </p>
                                    </div>
                                    <div class="flex items-center gap-x-1 text-sm">
                                        <p>
                                            {{ $t('citizens.inquiryStayData.stayData.accompanyingChildren.age') }}:
                                        </p>
                                        <p>
                                            {{ child?.age }}
                                        </p>
                                    </div>
                                    <div class="flex items-center gap-x-1 text-sm">
                                        <p>
                                            {{ $t('citizens.inquiryStayData.stayData.accompanyingChildren.origin') }}:
                                        </p>
                                        <p>
                                            {{ child?.origin }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </Modal>
    </div>

</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const { formatDateToReadable } = useDatetimeFormatter()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedCitizen: {
        type: Object,
        required: true,
    }
})

const { t, locale } = useI18n()

const state = reactive({
        options: {
            inquiry_type: [
                { value:  'shelter', label: `${t('inquiries.form.options.inquiryType.shelter')}` }, 
                { value: 'crisis_center', label: `${t('inquiries.form.options.inquiryType.crisisCenter')}` }
            ],
            contactedBy: [
                { value:  'the_citizen_themselves', label: `${t('inquiries.form.options.contactedBy.theCitizenThemselves')}` },
                { value: 'family_friend_neighbor_colleague_acquaintance', label: `${t('inquiries.form.options.contactedBy.familyFriends')}` },
                { value: 'municipal_employee', label: `${t('inquiries.form.options.contactedBy.municipalEmployee')}` },
                { value: 'police_prison_and_probation_service', label: `${t('inquiries.form.options.contactedBy.police')}` },
                { value: 'healthcare_professional', label: `${t('inquiries.form.options.contactedBy.healthcareProfessional')}` },
                { value: 'employee_from_another_crisis_center', label: `${t('inquiries.form.options.contactedBy.employeeFromAnotherCrisisCenter')}` },
                { value: 'other', label: `${t('inquiries.form.options.contactedBy.other')}` },
            ] as any,
            about_list: [] as any,
            assessment:  [
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
            cprMissingReason: [
                { value: 'citizen_does_not_have_cpr_number', label: `${t('inquiries.form.options.cprMissingReason.citizenDoesNotHaveCprNumber')}` },
                { value: 'shelter_does_not_know_citizen_cpr_number', label:  `${t('inquiries.form.options.cprMissingReason.shelterDoesntHaveNumber')}` },
            ],
            nonAdmissionReason: [
                { value: 'expelled_due_to_violent_behavior', label: `${t('inquiries.form.options.nonAdmissionReason.expelledDueToViolentBehavior')}` },
                { value: 'citizen_declined_offer', label: `${t('inquiries.form.options.nonAdmissionReason.citizenDeclinedOffer')}` },
                { value: 'other', label: `${t('inquiries.form.options.nonAdmissionReason.other')}` },
            ],
            notInServiceTargetGroupReason:  [
                { value: 'active_substance_abuse_problem', label: `${t('inquiries.form.options.notInServiceTargetGroupReason.activeSubstanceAbuseProblem')}` },
                { value: 'inactive_substance_abuse_problem', label: `${t('inquiries.form.options.notInServiceTargetGroupReason.inactiveSubstanceAbuseProblem')}` },
                { value: 'mental_difficulties', label: `${t('inquiries.form.options.notInServiceTargetGroupReason.mentalDifficulties')}` },
                { value: 'mental_functional_impairment', label: `${t('inquiries.form.options.notInServiceTargetGroupReason.mentalFunctionalImpairment')}` },
                { value: 'expose_to_violence', label: `${t('inquiries.form.options.notInServiceTargetGroupReason.exposeToViolence')}` },
                { value: 'unexposed_to_violence', label:  `${t('inquiries.form.options.notInServiceTargetGroupReason.unexposeToViolence')}` },
                { value: 'children_accompany', label: `${t('inquiries.form.options.notInServiceTargetGroupReason.childrenAccompany')}` },
                { value: 'pets_accompany', label: `${t('inquiries.form.options.notInServiceTargetGroupReason.petsAccompany')}` },
                { value: 'not_within_gender_framework', label: `${t('inquiries.form.options.notInServiceTargetGroupReason.notWithinGenderFramework')}` },
                { value: 'not_within_age_framework', label: `${t('inquiries.form.options.notInServiceTargetGroupReason.notWithinAgeFramework')}` },
                { value: 'physical_functional_impairment', label: `${t('inquiries.form.options.notInServiceTargetGroupReason.physicalFunctionalImpairment')}` },
                { value: 'not_within_service_target_group', label: `${t('inquiries.form.options.notInServiceTargetGroupReason.notWithinServiceTargetGroup')}` },
            ],
            referralDestination:  [
                { value: 'shelter_via_vacancy_overview', label: `${t('inquiries.form.options.referralDestination.shelterViaVacancyOverview')}` },
                { value: 'shelter_unused_vacancy_overview', label: `${t('inquiries.form.options.referralDestination.shelterUnusedVacancyOverview')}` },
                { value: 'night_cafe_warming_center', label: `${t('inquiries.form.options.referralDestination.nightCafeWarmingCenter')}` },
                { value: 'boarding_house_hostel', label: `${t('inquiries.form.options.referralDestination.boardingHouseHostel')}` },
                { value: 'womens_crisis_center', label: `${t('inquiries.form.options.referralDestination.womensCrisisCenter')}` },
                { value: 'self_solution', label: `${t('inquiries.form.options.referralDestination.selfSolution')}` },
                { value: 'other', label: `${t('inquiries.form.options.referralDestination.other')}` },
            ],
        },
})

const emit = defineEmits(['close'])

function closeModal() {
    emit('close')
}

// Computed properties to determine inquiry type
const isCrisisCenterInquiry = computed(() => {
    return props?.selectedCitizen?.data?.inquiry_data?.inquiry_type === 'crisis_center'
})

const isShelterInquiry = computed(() => {
    return props?.selectedCitizen?.data?.inquiry_data?.inquiry_type === 'shelter'
})

// Crisis Center - Topics (multiple selection)
const topics = computed(() => {
    if (! isCrisisCenterInquiry.value) return ''
    
    const topicsData = props?.selectedCitizen?.data?.inquiry_data?.topics
    if (!topicsData || topicsData.length === 0) return ''
    
    const topicLabels = topicsData?.map((topicValue: any) => {
        return locale.value === 'dk' 
            ? topicValue?.dk_name 
            : topicValue?.en_name
    })
    return topicLabels ?  topicLabels.join(', ') : ''
})

// Crisis Center - No Assessment Reasons (multiple selection)
const noAssessmentReasons = computed(() => {
    if (!isCrisisCenterInquiry.value) return ''
    
    const assessmentData = props?.selectedCitizen?.data?.inquiry_data?.no_assessment_reasons
    if (! assessmentData || assessmentData.length === 0) return ''
    
    const reasonLabels = assessmentData?.map((reasonValue: any) => {
        return locale.value === 'dk' 
            ? reasonValue?.dk_name 
            : reasonValue?.en_name
    })
    return reasonLabels ? reasonLabels.join(', ') : ''
})

// Crisis Center - Guidances (multiple selection)
const guidances = computed(() => {
    if (!isCrisisCenterInquiry.value) return ''
    
    const guidanceData = props?.selectedCitizen?.data?.inquiry_data?.guidances
    if (!guidanceData || guidanceData.length === 0) return ''
    
    const guidanceLabels = guidanceData?.map((guidanceValue: any) => {
        return locale.value === 'dk' 
            ? guidanceValue?.dk_name 
            : guidanceValue?.en_name
    })
    return guidanceLabels ? guidanceLabels.join(', ') : ''
})
</script>