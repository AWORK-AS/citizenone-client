<template>
    <div>
        <div class="mb-3 max-w-xs">
            <div class="relative">
                <Icon name="ph:magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
                <input v-model="search" type="text" :placeholder="$t('search') + '…'"
                    class="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </div>
        </div>
        <Tabs :id="props?.id" :tabs="filteredTabs" :isJustifyBetween="false" :isSwipeable="true" @changeTab="changeTab" />
        <p v-if="search && filteredTabs.length === 0" class="mt-3 text-sm text-slate-400">
            Ingen indstillinger matcher “{{ search }}”.
        </p>
    </div>
</template>

<script setup lang="ts">
import { useCustomPagesStore } from '@/store/custom-pages'
import { useI18n } from "vue-i18n"
import { useUserStore } from '@/store/user'

const props = defineProps({
    id: {
        type: String,
        required: false,
    },
})

const customPagesStore = useCustomPagesStore() as any
const userStore = useUserStore()
const { t } = useI18n()

const state = reactive({
    tabs: [] as any
})

// Filter the long catalog list by name so users can find a setting fast.
const search = ref('')
const filteredTabs = computed(() => {
    const q = search.value.trim().toLowerCase()
    if (!q) return state.tabs
    return state.tabs.filter((tab: any) => {
        const label = (tab.isTranslateName ? t(tab.name) : tab.name) || ''
        return label.toLowerCase().includes(q)
    })
})

watch(() => userStore.getUser, (newValue: any) => {
    if (newValue != null) {
        const isEmploymentServices = newValue?.company?.industry?.system_name === 'employment_services'

        state.tabs = [
            {
                name: 'settings.tabs.absences',
                isTranslateName: true,
                href: `/settings/absences`,
                routeNames: [
                    'settings-absences'
                ]
            },
            {
                name: customPagesStore.getCustomPagesName?.addictions,
                isTranslateName: false,
                href: `/settings/addictions`,
                routeNames: [
                    'settings-addictions'
                ]
            },
            {
                name: 'settings.tabs.addressBook',
                isTranslateName: true,
                href: `/settings/address-book`,
                routeNames: [
                    'settings-address-book'
                ]
            },
            // Agreements (A) comes after Address book
            ...(isEmploymentServices ? [{
                name: 'settings.tabs.employmentAgreements',
                isTranslateName: true,
                href: `/settings/employment-agreements`,
                routeNames: ['settings-employment-agreements']
            }] : []),
            // Billing Rules (Bi) comes before Booking tags (Bo)
            ...(isEmploymentServices ? [{
                name: 'settings.tabs.employmentBillingRules',
                isTranslateName: true,
                href: `/settings/employment-billing-rules`,
                routeNames: ['settings-employment-billing-rules']
            }] : []),
            {
                name: 'settings.tabs.bookingTags',
                isTranslateName: true,
                href: `/settings/booking-tags`,
                routeNames: [
                    'settings-booking-tags'
                ]
            },
            {
                name: 'settings.tabs.calendarTags',
                isTranslateName: true,
                href: `/settings/calendar-tags`,
                routeNames: [
                    'settings-calendar-tags'
                ]
            },
            // Case Types (Ca-s) comes after Calendar tags (Ca-l)
            ...(isEmploymentServices ? [{
                name: 'settings.tabs.employmentCaseTypes',
                isTranslateName: true,
                href: `/settings/employment-case-types`,
                routeNames: ['settings-employment-case-types']
            }] : []),
            {
                name: 'settings.tabs.consentDeclarationTypes',
                isTranslateName: true,
                href: `/settings/consent-declaration-types`,
                routeNames: [
                    'settings-consent-declaration-types'
                ]
            },
            {
                name: 'settings.tabs.contactJobTitles',
                isTranslateName: true,
                href: `/settings/contact-job-titles`,
                routeNames: [
                    'settings-contact-job-titles'
                ]
            },
            {
                name: 'settings.tabs.departments',
                isTranslateName: true,
                href: `/settings/departments`,
                routeNames: [
                    'settings-departments'
                ]
            },
            {
                name: 'settings.tabs.diagnoses',
                isTranslateName: true,
                href: `/settings/diagnoses`,
                routeNames: [
                    'settings-diagnoses'
                ]
            },
            {
                name: 'settings.tabs.dosageForms',
                isTranslateName: true,
                href: `/settings/dosage-forms`,
                routeNames: [
                    'settings-dosage-forms'
                ]
            },
            {
                name: 'settings.tabs.dutyShiftRules',
                isTranslateName: true,
                href: `/settings/duty-shift-rules`,
                routeNames: [
                    'settings-duty-shift-rules'
                ]
            },
            {
                name: 'settings.tabs.employeeGroups',
                isTranslateName: true,
                href: `/settings/employee-groups`,
                routeNames: [
                    'settings-employee-groups'
                ]
            },
            {
                name: 'settings.tabs.expenseCategories',
                isTranslateName: true,
                href: `/settings/expense-categories`,
                routeNames: [
                    'settings-expense-categories'
                ]
            },
            {
                name: 'settings.tabs.extraHoursTags',
                isTranslateName: true,
                href: `/settings/extra-hours-tags`,
                routeNames: [
                    'settings-extra-hours-tags'
                ]
            },
            {
                name: 'settings.tabs.foreignCities',
                isTranslateName: true,
                href: `/settings/foreign-cities`,
                routeNames: [
                    'settings-foreign-cities'
                ]
            },
            {
                name: 'settings.tabs.jobTitles',
                isTranslateName: true,
                href: `/settings/job-titles`,
                routeNames: [
                    'settings-job-titles',
                    'settings-job-titles-job_title_uuid'
                ]
            },
            // Jobcenters (Job-c) comes after Job titles (Job- )
            ...(isEmploymentServices ? [{
                name: 'settings.tabs.employmentJobcenters',
                isTranslateName: true,
                href: `/settings/employment-jobcenters`,
                routeNames: ['settings-employment-jobcenters']
            }] : []),
            {
                name: 'settings.tabs.journalContents',
                isTranslateName: true,
                href: `/settings/journal-contents`,
                routeNames: [
                    'settings-journal-contents'
                ]
            },
            {
                name: 'settings.tabs.journalNoteTags',
                isTranslateName: true,
                href: `/settings/journal-note-tags`,
                routeNames: [
                    'settings-journal-note-tags'
                ]
            },
            {
                name: 'settings.tabs.journalTitles',
                isTranslateName: true,
                href: `/settings/journal-titles`,
                routeNames: [
                    'settings-journal-titles'
                ]
            },
            {
                name: 'settings.tabs.massUnits',
                isTranslateName: true,
                href: `/settings/mass-units`,
                routeNames: [
                    'settings-mass-units'
                ]
            },
            {
                name: 'settings.tabs.medicationAllergies',
                isTranslateName: true,
                href: `/settings/medication-allergies`,
                routeNames: [
                    'settings-medication-allergies'
                ]
            },
            {
                name: 'settings.tabs.medicines',
                isTranslateName: true,
                href: `/settings/medicines`,
                routeNames: [
                    'settings-medicines'
                ]
            },
            {
                name: 'settings.tabs.normPeriods',
                isTranslateName: true,
                href: `/settings/norm-periods`,
                routeNames: [
                    'settings-norm-periods'
                ]
            },
            {
                name: 'settings.tabs.nursingProfessionalRecordTemplates',
                isTranslateName: true,
                href: `/settings/nursing-professional-record-templates`,
                routeNames: [
                    'settings-nursing-professional-record-templates'
                ]
            },
            {
                name: 'settings.tabs.relationships',
                isTranslateName: true,
                href: `/settings/relationships`,
                routeNames: [
                    'settings-relationships'
                ]
            },
            ...(isEmploymentServices ? [{
                name: 'settings.tabs.reportTemplates',
                isTranslateName: true,
                href: `/settings/report-templates`,
                routeNames: [
                    'settings-report-templates',
                    'settings-report-templates-new',
                    'settings-report-templates-uuid-edit',
                ]
            }] : []),
            {
                name: 'settings.tabs.roles',
                isTranslateName: true,
                href: `/settings/roles`,
                routeNames: [
                    'settings-roles'
                ]
            },
            {
                name: 'settings.tabs.rooms',
                isTranslateName: true,
                href: `/settings/rooms`,
                routeNames: [
                    'settings-rooms'
                ]
            },
            {
                name: 'settings.tabs.scheduleTags',
                isTranslateName: true,
                href: `/settings/schedule-tags`,
                routeNames: [
                    'settings-schedule-tags'
                ]
            },
            {
                name: 'settings.tabs.sections',
                isTranslateName: true,
                href: `/settings/sections`,
                routeNames: [
                    'settings-sections'
                ]
            },
            {
                name: 'settings.tabs.shifts',
                isTranslateName: true,
                href: `/settings/shifts`,
                routeNames: [
                    'settings-shifts'
                ]
            },
            // Status Types (St) comes after Shifts (Sh)
            ...(isEmploymentServices ? [{
                name: 'settings.tabs.employmentStatusTypes',
                isTranslateName: true,
                href: `/settings/employment-status-types`,
                routeNames: ['settings-employment-status-types']
            }] : []),
            {
                name: 'settings.tabs.timeAccounts',
                isTranslateName: true,
                href: `/settings/time-accounts`,
                routeNames: [
                    'settings-time-accounts'
                ]
            },
            {
                name: 'settings.tabs.treatmentTemplates',
                isTranslateName: true,
                href: `/settings/treatment-templates`,
                routeNames: [
                    'settings-treatment-templates'
                ]
            },
            {
                name: 'settings.tabs.units',
                isTranslateName: true,
                href: `/settings/units`,
                routeNames: [
                    'settings-units'
                ]
            },
        ];

        if (newValue?.company?.industry?.system_name === 'employment_services') {
            state.tabs.push(
                {
                    name: 'settings.tabs.employmentStatusTypes',
                    isTranslateName: true,
                    href: `/settings/employment-status-types`,
                    routeNames: ['settings-employment-status-types']
                },
                {
                    name: 'settings.tabs.employmentCaseTypes',
                    isTranslateName: true,
                    href: `/settings/employment-case-types`,
                    routeNames: ['settings-employment-case-types']
                },
                {
                    name: 'settings.tabs.employmentBillingRules',
                    isTranslateName: true,
                    href: `/settings/employment-billing-rules`,
                    routeNames: ['settings-employment-billing-rules']
                },
            )
        }
    }
})


function changeTab(value: any) {
    if (value === '/settings/absences') {
        navigateTo(`/settings/absences`)
    }
    else if (value === '/settings/addictions') {
        navigateTo(`/settings/addictions`)
    }
    else if (value === '/settings/address-book') {
        navigateTo(`/settings/address-book`)
    }
    else if (value === '/settings/booking-tags') {
        navigateTo(`/settings/booking-tags`)
    }
    else if (value === '/settings/calendar-tags') {
        navigateTo(`/settings/calendar-tags`)
    }
    else if (value === '/settings/consent-declaration-types') {
        navigateTo(`/settings/consent-declaration-types`)
    }
    else if (value === '/settings/contact-job-titles') {
        navigateTo(`/settings/contact-job-titles`)
    }
    else if (value === '/settings/departments') {
        navigateTo(`/settings/departments`)
    }
    else if (value === '/settings/diagnoses') {
        navigateTo(`/settings/diagnoses`)
    }
    else if (value === '/settings/duty-shift-rules') {
        navigateTo(`/settings/duty-shift-rules`)
    }
    else if (value === '/settings/employee-groups') {
        navigateTo(`/settings/employee-groups`)
    }
    else if (value === '/settings/expense-categories') {
        navigateTo(`/settings/expense-categories`)
    }
    else if (value === '/settings/extra-hours-tags') {
        navigateTo(`/settings/extra-hours-tags`)
    }
    else if (value === '/settings/foreign-cities') {
        navigateTo(`/settings/foreign-cities`)
    }
    else if (value === '/settings/job-titles') {
        navigateTo(`/settings/job-titles`)
    }
    else if (value === '/settings/journal-note-tags') {
        navigateTo(`/settings/journal-note-tags`)
    }
    else if (value === '/settings/journal-titles') {
        navigateTo(`/settings/journal-titles`)
    }
    else if (value === '/settings/journal-contents') {
        navigateTo(`/settings/journal-contents`)
    }
    else if (value === '/settings/mass-units') {
        navigateTo(`/settings/mass-units`)
    }
    else if (value === '/settings/medication-allergies') {
        navigateTo(`/settings/medication-allergies`)
    }
    else if (value === '/settings/medicines') {
        navigateTo(`/settings/medicines`)
    }
    else if (value === '/settings/norm-periods') {
        navigateTo(`/settings/norm-periods`)
    }
    else if (value === '/settings/nursing-professional-record-templates') {
        navigateTo(`/settings/nursing-professional-record-templates`)
    }
    else if (value === '/settings/report-templates') {
        navigateTo(`/settings/report-templates`)
    }
    else if (value === '/settings/treatment-templates') {
        navigateTo(`/settings/treatment-templates`)
    }
    else if (value === '/settings/relationships') {
        navigateTo(`/settings/relationships`)
    }
    else if (value === '/settings/roles') {
        navigateTo(`/settings/roles`)
    }
    else if (value === '/settings/rooms') {
        navigateTo(`/settings/rooms`)
    }
    else if (value === '/settings/schedule-tags') {
        navigateTo(`/settings/schedule-tags`)
    }
    else if (value === '/settings/sections') {
        navigateTo(`/settings/sections`)
    }
    else if (value === '/settings/shifts') {
        navigateTo(`/settings/shifts`)
    }
    else if (value === '/settings/time-accounts') {
        navigateTo(`/settings/time-accounts`)
    }
    else if (value === '/settings/units') {
        navigateTo(`/settings/units`)
    }
    else if (value === '/settings/employment-status-types') {
        navigateTo(`/settings/employment-status-types`)
    }
    else if (value === '/settings/employment-case-types') {
        navigateTo(`/settings/employment-case-types`)
    }
    else if (value === '/settings/employment-billing-rules') {
        navigateTo(`/settings/employment-billing-rules`)
    }
    else if (value === '/settings/employment-jobcenters') {
        navigateTo(`/settings/employment-jobcenters`)
    }
    else if (value === '/settings/employment-agreements') {
        navigateTo(`/settings/employment-agreements`)
    }
}
</script>