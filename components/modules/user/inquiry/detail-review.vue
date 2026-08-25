<template>
    <div>
        <!-- What this inquiry is, before anything else -->
        <div class="flex flex-wrap items-start justify-between gap-3 border-b border-surface-200 pb-4">
            <div class="min-w-0">
                <p class="text-[11px] font-bold text-secondary">
                    {{ inquiry?.inquirer_name || $t('inquiries.inquiries') }}
                </p>
                <p class="mt-0.5 text-[17px] font-bold leading-snug text-slate-900">
                    {{ headline }}
                </p>
                <p class="mt-1 text-xs text-slate-500">
                    {{ subline }}
                </p>
            </div>
            <div class="flex shrink-0 items-center gap-2">
                <FormButton type="button" buttonStyle="action" @click="emit('edit')">
                    <Icon name="ph:pencil-simple" class="size-4" />
                    {{ $t('inquiries.review.edit') }}
                </FormButton>
            </div>
        </div>

        <div class="mt-5 space-y-6">
            <section v-for="section in sections" :key="section.key">
                <h3 class="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {{ $t('inquiries.form.sections.' + section.key) }}
                </h3>
                <div class="grid grid-cols-1 gap-x-4 gap-y-3.5 sm:grid-cols-2">
                    <div v-for="field in section.fields" :key="field.label"
                        :class="field.wide ? 'sm:col-span-2' : ''">
                        <p class="mb-1.5 text-xs font-bold text-slate-500">{{ field.label }}</p>
                        <p v-if="field.value"
                            class="whitespace-pre-line rounded-[9px] border border-surface-200 bg-[#f6f9fa] px-3 py-2.5 text-[13px] font-semibold text-slate-800">
                            {{ field.value }}
                        </p>
                        <p v-else
                            class="rounded-[9px] border border-dashed border-surface-200 px-3 py-2.5 text-[13px] text-slate-400">
                            {{ $t('inquiries.review.notFilled') }}
                        </p>
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useCustomPagesStore } from '@/store/custom-pages'

const { t } = useI18n()
const customPagesStore = useCustomPagesStore() as any

const props = defineProps({
    inquiry: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(['edit'])

const { formatDateToReadable } = useDatetimeFormatter()

// The same option values the two forms offer, so a stored value reads here
// exactly as it read in the dropdown that set it.
const OPTION_LABELS: Record<string, Record<string, string>> = {
    contacted_by: {
        the_citizen_themselves: 'inquiries.form.options.contactedBy.theCitizenThemselves',
        family_friend_neighbor_colleague_acquaintance: 'inquiries.form.options.contactedBy.familyFriends',
        municipal_employee: 'inquiries.form.options.contactedBy.municipalEmployee',
        police_prison_and_probation_service: 'inquiries.form.options.contactedBy.police',
        healthcare_professional: 'inquiries.form.options.contactedBy.healthcareProfessional',
        employee_from_another_crisis_center: 'inquiries.form.options.contactedBy.employeeFromAnotherCrisisCenter',
        other: 'inquiries.form.options.contactedBy.other',
    },
    assessment: {
        yes: 'inquiries.form.options.assessment.yes',
        no: 'inquiries.form.options.assessment.no',
        unknown: 'inquiries.form.options.assessment.unknown',
    },
    yes_no: {
        yes: 'inquiries.form.options.yesNo.yes',
        no: 'inquiries.form.options.yesNo.no',
    },
    cpr_missing_reason: {
        citizen_does_not_have_cpr_number: 'inquiries.form.options.cprMissingReason.citizenDoesNotHaveCprNumber',
        shelter_does_not_know_citizen_cpr_number: 'inquiries.form.options.cprMissingReason.shelterDoesntHaveNumber',
    },
    non_admission_reason: {
        expelled_due_to_violent_behavior: 'inquiries.form.options.nonAdmissionReason.expelledDueToViolentBehavior',
        citizen_declined_offer: 'inquiries.form.options.nonAdmissionReason.citizenDeclinedOffer',
        other: 'inquiries.form.options.nonAdmissionReason.other',
    },
    not_in_service_target_group_reason: {
        active_substance_abuse_problem: 'inquiries.form.options.notInServiceTargetGroupReason.activeSubstanceAbuseProblem',
        inactive_substance_abuse_problem: 'inquiries.form.options.notInServiceTargetGroupReason.inactiveSubstanceAbuseProblem',
        mental_difficulties: 'inquiries.form.options.notInServiceTargetGroupReason.mentalDifficulties',
        mental_functional_impairment: 'inquiries.form.options.notInServiceTargetGroupReason.mentalFunctionalImpairment',
        expose_to_violence: 'inquiries.form.options.notInServiceTargetGroupReason.exposeToViolence',
        unexposed_to_violence: 'inquiries.form.options.notInServiceTargetGroupReason.unexposeToViolence',
        children_accompany: 'inquiries.form.options.notInServiceTargetGroupReason.childrenAccompany',
        pets_accompany: 'inquiries.form.options.notInServiceTargetGroupReason.petsAccompany',
        not_within_gender_framework: 'inquiries.form.options.notInServiceTargetGroupReason.notWithinGenderFramework',
        not_within_age_framework: 'inquiries.form.options.notInServiceTargetGroupReason.notWithinAgeFramework',
        physical_functional_impairment: 'inquiries.form.options.notInServiceTargetGroupReason.physicalFunctionalImpairment',
        not_within_service_target_group: 'inquiries.form.options.notInServiceTargetGroupReason.notWithinServiceTargetGroup',
    },
    referral_destination: {
        shelter_via_vacancy_overview: 'inquiries.form.options.referralDestination.shelterViaVacancyOverview',
        shelter_unused_vacancy_overview: 'inquiries.form.options.referralDestination.shelterUnusedVacancyOverview',
        night_cafe_warming_center: 'inquiries.form.options.referralDestination.nightCafeWarmingCenter',
        boarding_house_hostel: 'inquiries.form.options.referralDestination.boardingHouseHostel',
        womens_crisis_center: 'inquiries.form.options.referralDestination.womensCrisisCenter',
        self_solution: 'inquiries.form.options.referralDestination.selfSolution',
        other: 'inquiries.form.options.referralDestination.other',
    },
}

function option(group: string, value: any) {
    if (!value) return ''
    const key = OPTION_LABELS[group]?.[value]
    // An unmapped value is still worth showing raw - better than an empty box
    // that suggests nothing was ever recorded.
    return key ? t(key) : String(value)
}

function names(list: any) {
    return (list ?? []).map((item: any) => item?.name).filter(Boolean).join(', ')
}

const isShelter = computed(() => props.inquiry?.inquiry_type === 'shelter')

const shelterName = computed(() => customPagesStore.getCustomPagesName?.shelter || t('inquiries.form.options.inquiryType.shelter'))
const crisisCenterName = computed(() => customPagesStore.getCustomPagesName?.crisisCenter || t('inquiries.form.options.inquiryType.crisisCenter'))
const departmentLabel = computed(() => customPagesStore.getCustomPagesName?.department || t('department.department'))

const citizenName = computed(() =>
    `${props.inquiry?.firstname ?? ''} ${props.inquiry?.lastname ?? ''}`.trim()
)

const headline = computed(() =>
    props.inquiry?.purpose || citizenName.value || props.inquiry?.inquirer_name || t('inquiries.inquiries')
)

const subline = computed(() => [
    isShelter.value ? shelterName.value : crisisCenterName.value,
    props.inquiry?.inquiry_date ? formatDateToReadable(props.inquiry.inquiry_date) : '',
    names(props.inquiry?.departments),
].filter(Boolean).join(' · '))

const sections = computed(() => {
    const inq = props.inquiry ?? {}

    const assessment = isShelter.value
        ? [
            { label: t('inquiries.form.shelter.fields.vacantPlaceAvailable'), value: option('yes_no', inq.vacant_place_available) },
            { label: t('inquiries.form.shelter.fields.inShelterTargetGroup'), value: option('yes_no', inq.in_shelter_target_group) },
            { label: t('inquiries.form.shelter.fields.fitsInTargetGroup'), value: option('yes_no', inq.fits_in_target_group) },
            { label: t('inquiries.form.shelter.fields.nonAdmissionReason'), value: option('non_admission_reason', inq.non_admission_reason), wide: true },
            { label: t('inquiries.form.shelter.fields.notInServiceTargetGroupReason'), value: option('not_in_service_target_group_reason', inq.not_in_service_target_group_reason), wide: true },
            { label: t('inquiries.form.shelter.fields.referralDestination'), value: option('referral_destination', inq.referral_destination), wide: true },
        ]
        : [
            { label: t('inquiries.form.crisisCenter.fields.topic'), value: names(inq.topics), wide: true },
            { label: t('inquiries.form.crisisCenter.fields.assessment'), value: option('assessment', inq.target_group_crisis_center) },
            { label: t('inquiries.form.crisisCenter.fields.receivedVisit'), value: option('yes_no', inq.received_visit) },
            { label: t('inquiries.form.crisisCenter.fields.notOfferedInterview'), value: names(inq.no_assessment_reasons), wide: true },
            { label: t('inquiries.form.crisisCenter.fields.guidance'), value: names(inq.guidances), wide: true },
        ]

    const citizen = [
        { label: t('inquiries.form.cpr'), value: inq.cpr },
        ...(isShelter.value
            ? [{ label: t('inquiries.form.shelter.fields.cprMissingReason'), value: option('cpr_missing_reason', inq.cpr_missing_reason) }]
            : []),
        { label: t('inquiries.form.firstname'), value: inq.firstname },
        { label: t('inquiries.form.lastname'), value: inq.lastname },
    ]

    return [
        {
            key: 'inquiry',
            fields: [
                { label: t('inquiries.table.dateOfInquiry'), value: inq.inquiry_date ? formatDateToReadable(inq.inquiry_date) : '' },
                { label: departmentLabel.value, value: names(inq.departments) },
                ...(isShelter.value
                    ? []
                    : [{ label: t('inquiries.form.crisisCenter.fields.contactedBy'), value: option('contacted_by', inq.contacted_by) }]),
                { label: t('inquiries.table.inquirerName'), value: inq.inquirer_name },
            ],
        },
        { key: 'citizen', fields: citizen },
        { key: 'assessment', fields: assessment },
        {
            key: 'outcome',
            fields: [
                { label: t('inquiries.table.outcome'), value: inq.outcome },
                { label: t('inquiries.table.purpose'), value: inq.purpose },
                { label: t('inquiries.form.notes'), value: inq.notes, wide: true },
                { label: t('inquiries.table.conversationSummary'), value: inq.conversation_summary, wide: true },
            ],
        },
    ]
})
</script>
