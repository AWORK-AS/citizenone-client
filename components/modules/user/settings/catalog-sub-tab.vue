<template>
    <nav class="catalog-shell">
        <!-- Search filters the whole catalog by label -->
        <div class="mb-4">
            <div class="relative">
                <Icon name="ph:magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
                <input v-model="search" type="text" :placeholder="$t('search') + '…'"
                    class="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </div>
        </div>

        <div class="space-y-5">
            <div v-for="group in filteredGroups" :key="group.key">
                <p class="px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    {{ group.label }}
                </p>
                <ul class="space-y-0.5">
                    <li v-for="tab in group.items" :key="tab.href">
                        <button type="button" @click="changeTab(tab.href)"
                            class="w-full text-left rounded-lg px-3 py-2 text-sm transition-colors"
                            :class="isActive(tab)
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'">
                            {{ tab.isTranslateName ? $t(tab.name) : tab.name }}
                        </button>
                    </li>
                </ul>
            </div>
        </div>

        <p v-if="search && filteredGroups.length === 0" class="mt-3 px-2 text-sm text-slate-400">
            Ingen indstillinger matcher “{{ search }}”.
        </p>
    </nav>
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
const { t, locale } = useI18n()
const route = useRoute()

const state = reactive({
    tabs: [] as any
})

const search = ref('')

// Category headers — keeps the long catalog scannable instead of one flat strip.
const groupOrder = ['access', 'journal', 'health', 'schedule', 'booking', 'citizens', 'employment']
const groupLabels: Record<string, Record<string, string>> = {
    access: { dk: 'Adgang & organisation', en: 'Access & organisation', no: 'Tilgang & organisasjon', sv: 'Åtkomst & organisation' },
    journal: { dk: 'Journal & samtykke', en: 'Journals & consent', no: 'Journal & samtykke', sv: 'Journal & samtycke' },
    health: { dk: 'Medicin & helbred', en: 'Medicine & health', no: 'Medisin & helse', sv: 'Medicin & hälsa' },
    schedule: { dk: 'Vagtplan & tid', en: 'Scheduling & time', no: 'Vaktplan & tid', sv: 'Schema & tid' },
    booking: { dk: 'Booking & kalender', en: 'Booking & calendar', no: 'Booking & kalender', sv: 'Bokning & kalender' },
    citizens: { dk: 'Borgere & adresser', en: 'Citizens & addresses', no: 'Borgere & adresser', sv: 'Medborgare & adresser' },
    employment: { dk: 'Jobcenter', en: 'Jobcenter', no: 'Jobbsenter', sv: 'Jobbcenter' },
}
function groupLabel(key: string): string {
    const byLocale = groupLabels[key] || {}
    return byLocale[locale.value] || byLocale.en || key
}

function isActive(tab: any): boolean {
    return Array.isArray(tab.routeNames) && tab.routeNames.includes(route.name as string)
}

// Group the flat tab list, in a stable category order, filtered by the search box.
const filteredGroups = computed(() => {
    const q = search.value.trim().toLowerCase()
    const matches = (tab: any) => {
        if (!q) return true
        const label = (tab.isTranslateName ? t(tab.name) : tab.name) || ''
        return label.toLowerCase().includes(q)
    }
    return groupOrder
        .map((key) => ({
            key,
            label: groupLabel(key),
            items: state.tabs.filter((tab: any) => tab.group === key && matches(tab)),
        }))
        .filter((group) => group.items.length > 0)
})

watch(() => userStore.getUser, (newValue: any) => {
    if (newValue != null) {
        const isEmploymentServices = newValue?.company?.industry?.system_name === 'employment_services'

        state.tabs = [
            { group: 'schedule', name: 'settings.tabs.absences', isTranslateName: true, href: `/settings/absences`, routeNames: ['settings-absences'] },
            { group: 'citizens', name: customPagesStore.getCustomPagesName?.addictions, isTranslateName: false, href: `/settings/addictions`, routeNames: ['settings-addictions'] },
            { group: 'citizens', name: 'settings.tabs.addressBook', isTranslateName: true, href: `/settings/address-book`, routeNames: ['settings-address-book'] },
            ...(isEmploymentServices ? [{ group: 'employment', name: 'settings.tabs.employmentAgreements', isTranslateName: true, href: `/settings/employment-agreements`, routeNames: ['settings-employment-agreements'] }] : []),
            ...(isEmploymentServices ? [{ group: 'employment', name: 'settings.tabs.employmentBillingRules', isTranslateName: true, href: `/settings/employment-billing-rules`, routeNames: ['settings-employment-billing-rules'] }] : []),
            { group: 'booking', name: 'settings.tabs.bookingTags', isTranslateName: true, href: `/settings/booking-tags`, routeNames: ['settings-booking-tags'] },
            { group: 'booking', name: 'settings.tabs.calendarTags', isTranslateName: true, href: `/settings/calendar-tags`, routeNames: ['settings-calendar-tags'] },
            ...(isEmploymentServices ? [{ group: 'employment', name: 'settings.tabs.employmentCaseTypes', isTranslateName: true, href: `/settings/employment-case-types`, routeNames: ['settings-employment-case-types'] }] : []),
            { group: 'journal', name: 'settings.tabs.consentDeclarationTypes', isTranslateName: true, href: `/settings/consent-declaration-types`, routeNames: ['settings-consent-declaration-types'] },
            { group: 'access', name: 'settings.tabs.contactJobTitles', isTranslateName: true, href: `/settings/contact-job-titles`, routeNames: ['settings-contact-job-titles'] },
            { group: 'access', name: 'settings.tabs.departments', isTranslateName: true, href: `/settings/departments`, routeNames: ['settings-departments'] },
            { group: 'health', name: 'settings.tabs.diagnoses', isTranslateName: true, href: `/settings/diagnoses`, routeNames: ['settings-diagnoses'] },
            { group: 'health', name: 'settings.tabs.dosageForms', isTranslateName: true, href: `/settings/dosage-forms`, routeNames: ['settings-dosage-forms'] },
            { group: 'schedule', name: 'settings.tabs.dutyShiftRules', isTranslateName: true, href: `/settings/duty-shift-rules`, routeNames: ['settings-duty-shift-rules'] },
            { group: 'access', name: 'settings.tabs.employeeGroups', isTranslateName: true, href: `/settings/employee-groups`, routeNames: ['settings-employee-groups'] },
            { group: 'citizens', name: 'settings.tabs.expenseCategories', isTranslateName: true, href: `/settings/expense-categories`, routeNames: ['settings-expense-categories'] },
            { group: 'schedule', name: 'settings.tabs.extraHoursTags', isTranslateName: true, href: `/settings/extra-hours-tags`, routeNames: ['settings-extra-hours-tags'] },
            { group: 'citizens', name: 'settings.tabs.foreignCities', isTranslateName: true, href: `/settings/foreign-cities`, routeNames: ['settings-foreign-cities'] },
            { group: 'access', name: 'settings.tabs.jobTitles', isTranslateName: true, href: `/settings/job-titles`, routeNames: ['settings-job-titles', 'settings-job-titles-job_title_uuid'] },
            ...(isEmploymentServices ? [{ group: 'employment', name: 'settings.tabs.employmentJobcenters', isTranslateName: true, href: `/settings/employment-jobcenters`, routeNames: ['settings-employment-jobcenters'] }] : []),
            { group: 'journal', name: 'settings.tabs.journalContents', isTranslateName: true, href: `/settings/journal-contents`, routeNames: ['settings-journal-contents'] },
            { group: 'journal', name: 'settings.tabs.journalNoteTags', isTranslateName: true, href: `/settings/journal-note-tags`, routeNames: ['settings-journal-note-tags'] },
            { group: 'journal', name: 'settings.tabs.journalTitles', isTranslateName: true, href: `/settings/journal-titles`, routeNames: ['settings-journal-titles'] },
            { group: 'health', name: 'settings.tabs.massUnits', isTranslateName: true, href: `/settings/mass-units`, routeNames: ['settings-mass-units'] },
            { group: 'health', name: 'settings.tabs.medicationAllergies', isTranslateName: true, href: `/settings/medication-allergies`, routeNames: ['settings-medication-allergies'] },
            { group: 'health', name: 'settings.tabs.medicines', isTranslateName: true, href: `/settings/medicines`, routeNames: ['settings-medicines'] },
            { group: 'schedule', name: 'settings.tabs.normPeriods', isTranslateName: true, href: `/settings/norm-periods`, routeNames: ['settings-norm-periods'] },
            { group: 'health', name: 'settings.tabs.nursingProfessionalRecordTemplates', isTranslateName: true, href: `/settings/nursing-professional-record-templates`, routeNames: ['settings-nursing-professional-record-templates'] },
            { group: 'citizens', name: 'settings.tabs.relationships', isTranslateName: true, href: `/settings/relationships`, routeNames: ['settings-relationships'] },
            ...(isEmploymentServices ? [{ group: 'employment', name: 'settings.tabs.reportTemplates', isTranslateName: true, href: `/settings/report-templates`, routeNames: ['settings-report-templates', 'settings-report-templates-new', 'settings-report-templates-uuid-edit'] }] : []),
            { group: 'access', name: 'settings.tabs.roles', isTranslateName: true, href: `/settings/roles`, routeNames: ['settings-roles'] },
            { group: 'booking', name: 'settings.tabs.rooms', isTranslateName: true, href: `/settings/rooms`, routeNames: ['settings-rooms'] },
            { group: 'schedule', name: 'settings.tabs.scheduleTags', isTranslateName: true, href: `/settings/schedule-tags`, routeNames: ['settings-schedule-tags'] },
            { group: 'access', name: 'settings.tabs.sections', isTranslateName: true, href: `/settings/sections`, routeNames: ['settings-sections'] },
            { group: 'schedule', name: 'settings.tabs.shifts', isTranslateName: true, href: `/settings/shifts`, routeNames: ['settings-shifts'] },
            ...(isEmploymentServices ? [{ group: 'employment', name: 'settings.tabs.employmentStatusTypes', isTranslateName: true, href: `/settings/employment-status-types`, routeNames: ['settings-employment-status-types'] }] : []),
            { group: 'schedule', name: 'settings.tabs.timeAccounts', isTranslateName: true, href: `/settings/time-accounts`, routeNames: ['settings-time-accounts'] },
            { group: 'health', name: 'settings.tabs.treatmentTemplates', isTranslateName: true, href: `/settings/treatment-templates`, routeNames: ['settings-treatment-templates'] },
            { group: 'health', name: 'settings.tabs.units', isTranslateName: true, href: `/settings/units`, routeNames: ['settings-units'] },
        ]
    }
}, { immediate: true })

function changeTab(href: string) {
    if (href) navigateTo(href)
}
</script>

<style>
/* The catalog nav floats as a left rail; the page content that follows it
   (always the `.mt-8` block on every settings catalog page) flows beside it. */
@media (min-width: 1024px) {
    .catalog-shell {
        float: left;
        width: 15rem;
        position: sticky;
        top: 1rem;
    }
    .catalog-shell + .mt-8 {
        margin-left: 16.5rem;
        margin-top: 0;
    }
}
</style>
