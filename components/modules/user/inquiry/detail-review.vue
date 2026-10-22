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

            <!-- The fields this company has set up for its own pipeline. Editable
                 in place: the usual reason for opening an inquiry is to fill one
                 of these in so the case can move on. -->
            <ModulesUserInquiryFieldsBlock :inquiryUuid="props.inquiry.uuid" @saved="emit('fieldsSaved')" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { CONTACTED_BY_LABELS, formLabel, listItemName, shownOnInquiry } from '@/composables/inquiryForms'
import { useSpokenLanguages } from '@/composables/useSpokenLanguages'
import { useI18n } from 'vue-i18n'
import { useCustomPagesStore } from '@/store/custom-pages'

const { t, locale } = useI18n()
const customPagesStore = useCustomPagesStore() as any

const props = defineProps({
    inquiry: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(['edit', 'fieldsSaved'])

const { formatDateToReadable } = useDatetimeFormatter()
const { labelFor: spokenLanguageLabel, fetchAll: fetchSpokenLanguages } = useSpokenLanguages()

// The inquiry carries a language's English name only; the register has the
// Danish one too. Until it has loaded (or if it can't), the English name shows.
const spokenLanguages = ref<any[]>([])

onMounted(async () => {
    try {
        spokenLanguages.value = await fetchSpokenLanguages()
    } catch {
        spokenLanguages.value = []
    }
})

function languageName(language: any) {
    if (!language) return ''

    return spokenLanguageLabel(spokenLanguages.value.find((item: any) => item.uuid === language.uuid)) || language.name || ''
}

// The same option values the two forms offer, so a stored value reads here
// exactly as it read in the dropdown that set it.
const OPTION_LABELS: Record<string, Record<string, string>> = {
    contacted_by: CONTACTED_BY_LABELS,
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
    // The yes/no questions are stored as booleans: false is an answer ("No"),
    // only null means nobody answered.
    if (typeof value === 'boolean') value = value ? 'yes' : 'no'
    if (!value) return ''
    const key = OPTION_LABELS[group]?.[value]
    // An unmapped value is still worth showing raw - better than an empty box
    // that suggests nothing was ever recorded.
    return key ? t(key) : String(value)
}

function contactSummary(contact: any) {
    if (!contact) return ''

    const name = `${contact.firstname ?? ''} ${contact.lastname ?? ''}`.trim()

    return [name, contact.company_name, contact.email, contact.phone].filter(Boolean).join(' · ')
}

// 'every_three_months' -> 'everyThreeMonths', the key citizens.form uses.
function reportingKey(value: string) {
    return value.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
}

// Departments have a name; topics, reasons and guidance an en_name/dk_name.
function names(list: any) {
    return (list ?? []).map((item: any) => listItemName(item, locale.value)).filter(Boolean).join(', ')
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
    // The form it was taken on; an inquiry from before forms by its type.
    props.inquiry?.form
        ? formLabel(props.inquiry.form, { shelter: shelterName.value, crisisCenter: crisisCenterName.value })
        : isShelter.value ? shelterName.value : crisisCenterName.value,
    props.inquiry?.inquiry_date ? formatDateToReadable(props.inquiry.inquiry_date) : '',
    names(props.inquiry?.departments),
].filter(Boolean).join(' · '))

// The rows the page shows. A built-in field (one with a key) shows when the
// inquiry's form asks for it or it already has an answer; an inquiry from
// before forms shows them all. A section left with no rows is not shown.
const sections = computed(() => allSections.value
    .map((section) => ({
        ...section,
        fields: section.fields.filter((field: any) => !field.key || shownOnInquiry(field.key, props.inquiry?.form, props.inquiry)),
    }))
    .filter((section) => section.fields.length > 0))

const allSections = computed(() => {
    const inq = props.inquiry ?? {}

    const assessment = isShelter.value
        ? [
            { key: 'vacant_place_available', label: t('inquiries.form.shelter.fields.vacantPlaceAvailable'), value: option('yes_no', inq.vacant_place_available) },
            { key: 'in_shelter_target_group', label: t('inquiries.form.shelter.fields.inShelterTargetGroup'), value: option('yes_no', inq.in_shelter_target_group) },
            { key: 'fits_in_target_group', label: t('inquiries.form.shelter.fields.fitsInTargetGroup'), value: option('yes_no', inq.fits_in_target_group) },
            { key: 'non_admission_reason', label: t('inquiries.form.shelter.fields.nonAdmissionReason'), value: option('non_admission_reason', inq.non_admission_reason), wide: true },
            { key: 'not_in_service_target_group_reason', label: t('inquiries.form.shelter.fields.notInServiceTargetGroupReason'), value: option('not_in_service_target_group_reason', inq.not_in_service_target_group_reason), wide: true },
            { key: 'referral_destination', label: t('inquiries.form.shelter.fields.referralDestination'), value: option('referral_destination', inq.referral_destination), wide: true },
        ]
        : [
            { key: 'topic', label: t('inquiries.form.crisisCenter.fields.topic'), value: names(inq.topics), wide: true },
            { key: 'assessment', label: t('inquiries.form.crisisCenter.fields.assessment'), value: option('assessment', inq.target_group_crisis_center) },
            { key: 'received_visit', label: t('inquiries.form.crisisCenter.fields.receivedVisit'), value: option('yes_no', inq.received_visit) },
            { key: 'assessment_reason', label: t('inquiries.form.crisisCenter.fields.notOfferedInterview'), value: names(inq.no_assessment_reasons), wide: true },
            { key: 'guidance', label: t('inquiries.form.crisisCenter.fields.guidance'), value: names(inq.guidances), wide: true },
        ]

    const citizen = [
        { key: 'cpr', label: t('inquiries.form.cpr'), value: inq.cpr },
        ...(isShelter.value
            ? [{ key: 'cpr_missing_reason', label: t('inquiries.form.shelter.fields.cprMissingReason'), value: option('cpr_missing_reason', inq.cpr_missing_reason) }]
            : []),
        { key: 'first_name', label: t('inquiries.form.firstname'), value: inq.firstname },
        { key: 'last_name', label: t('inquiries.form.lastname'), value: inq.lastname },
    ]

    return [
        {
            key: 'inquiry',
            fields: [
                { key: 'inquiry_date', label: t('inquiries.table.dateOfInquiry'), value: inq.inquiry_date ? formatDateToReadable(inq.inquiry_date) : '' },
                { key: 'department_uuid', label: departmentLabel.value, value: names(inq.departments) },
                ...(isShelter.value
                    ? []
                    : [{ key: 'contacted_by', label: t('inquiries.form.crisisCenter.fields.contactedBy'), value: option('contacted_by', inq.contacted_by) }]),
                // Citizen-initiated or authority-initiated (paragraph 75).
                { label: t('inquiryOrigin.label'), value: inq.origin ? t('inquiryOrigin.' + inq.origin) : '' },
                { label: t('inquiryServiceTypes.single'), value: inq.service_type?.label ?? '' },
                { key: 'company_contact', label: t('inquiryContact.label'), value: contactSummary(inq.company_contact), wide: true },
                { key: 'inquirer_name', label: t('inquiries.table.inquirerName'), value: inq.inquirer_name },
            ],
        },
        { key: 'citizen', fields: citizen },
        {
            key: 'matchNeeds',
            fields: [
                { label: t('inquiryMatchNeeds.primaryLanguage'), value: languageName(inq.primary_spoken_language) },
                { label: t('inquiryMatchNeeds.secondaryLanguage'), value: languageName(inq.secondary_spoken_language) },
                {
                    label: t('inquiryMatchNeeds.location'),
                    value: [inq.location_address, inq.location_postal_code].filter(Boolean).join(', '),
                    wide: true,
                },
                {
                    label: t('citizens.form.reportingFrequency'),
                    value: inq.reporting_frequency ? t('citizens.form.reportingOptions.' + reportingKey(inq.reporting_frequency)) : '',
                },
                {
                    label: t('citizens.form.reportDraftDaysBefore'),
                    value: inq.reporting_frequency && inq.report_draft_days_before
                        ? t('citizens.form.reportDraftDaysBeforeValue', { days: inq.report_draft_days_before })
                        : '',
                },
            ],
        },
        { key: 'assessment', fields: assessment },
        {
            key: 'outcome',
            fields: [
                { key: 'outcome', label: t('inquiries.table.outcome'), value: inq.outcome },
                { key: 'purpose', label: t('inquiries.table.purpose'), value: inq.purpose },
                { key: 'notes', label: t('inquiries.form.notes'), value: inq.notes, wide: true },
                { key: 'conversation_summary', label: t('inquiries.table.conversationSummary'), value: inq.conversation_summary, wide: true },
            ],
        },
    ]
})
</script>
