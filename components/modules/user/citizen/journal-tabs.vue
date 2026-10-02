<template>
    <ModulesUserCitizenSectionNav :tabs="state.tabs" />
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'
import { useAlert } from '@/composables/alert'
import { useTerminology } from '@/composables/useTerminology'
import { useI18n } from "vue-i18n"

const route = useRoute()
const citizenUuid = route?.params?.uuid
const userStore = useUserStore()
const { t, locale } = useI18n()
const { term } = useTerminology()
const { errorAlert } = useAlert()
const { industryHasFeature } = useIndustryFeatures()

const state = reactive({
    tabs: [] as any[],
})

watch([() => userStore.getUser, locale], ([newValue]: any[]) => {
    if (!newValue) return

    const pages = newValue.pages || []
    // Company-level module enablement: no list (empty) = every module on
    // (default), matching the same opt-out convention used for the sidebar
    // (layouts/user.vue). A tab needs BOTH the user's role to have page
    // access AND the company to not have opted the module out.
    const companyModulePages = newValue?.company?.module_pages
    const companyHasModule = (name: string) => !Array.isArray(companyModulePages) || companyModulePages.length === 0 || companyModulePages.includes(name)
    const can = (name: string) => companyHasModule(name) && pages.some((page: any) => page.name === name)
    const systemName = newValue?.company?.industry?.system_name
    const isEmploymentServices = systemName === 'employment_services'
    const isDental = systemName === 'dental'

    const tabs: any[] = []

    if (can('Journals')) {
        tabs.push({
            name: term('journals', t('citizens.tabs.journals')), icon: 'ph:notebook', isTranslateName: false,
            category: 'documentation', primary: true,
            href: `/citizens/${citizenUuid}/journals`,
            routeNames: ['citizens-uuid-journals'],
        })
    }
    // Wellbeing measured over time, for the citizen and whoever is related to
    // them. Its own module, so an admin can switch it off under Settings ->
    // Company -> Moduler. Dental patients are not measured this way.
    if (can('Wellbeing') && !isDental) {
        tabs.push({
            name: 'wellbeing.tab', icon: 'ph:chart-line-up', isTranslateName: true,
            category: 'documentation', primary: false,
            href: `/citizens/${citizenUuid}/wellbeing`,
            routeNames: ['citizens-uuid-wellbeing'],
        })
    }
    if (industryHasFeature('toothChart')) {
        tabs.push({
            name: 'citizens.tabs.toothChart', icon: 'ph:tooth', isTranslateName: true,
            category: 'care', primary: true,
            href: `/citizens/${citizenUuid}/tooth-chart`,
            routeNames: ['citizens-uuid-tooth-chart'],
        })
    }
    // Forms sent to the patient to fill in themselves. Only where there is a portal to send
    // them to; a clinic without it would get a tab that cannot do anything.
    if (isDental && newValue?.has_patient_app) {
        tabs.push({
            name: 'citizens.tabs.patientForms', icon: 'ph:note-pencil', isTranslateName: true,
            href: `/citizens/${citizenUuid}/patient-forms`,
            routeNames: ['citizens-uuid-patient-forms'],
            category: 'documentation', primary: false,
        })
    }

    // Quoting before treatment is a way of working rather than something every
    // clinic does, so it follows the company's own choice like the medicine card
    // and the documents tab do - not the industry alone.
    if (industryHasFeature('priceEstimates') && newValue?.company?.onboarding_preferences?.modules?.priceEstimates !== false) {
        tabs.push({
            name: 'citizens.tabs.priceEstimates', icon: 'ph:receipt', isTranslateName: true,
            category: 'admin', primary: false,
            href: `/citizens/${citizenUuid}/price-estimates`,
            routeNames: ['citizens-uuid-price-estimates'],
        })
    }
    // Invoicing is a module a company switches on, so the tab follows the app
    // rather than the industry.
    if (newValue?.has_invoice_app) {
        tabs.push({
            name: 'citizens.tabs.invoices', icon: 'ph:currency-circle-dollar', isTranslateName: true,
            category: 'admin', primary: false,
            href: `/citizens/${citizenUuid}/invoices`,
            routeNames: ['citizens-uuid-invoices'],
        })
    }
    // Not rendered in the nav/"More" dropdown anymore (surfaced in the details card instead),
    // but kept in `tabs` so direct navigation to the full timeline page isn't treated as inaccessible.
    tabs.push({
        name: 'citizens.tabs.timeline', icon: 'ph:clock-counter-clockwise', isTranslateName: true,
        category: 'documentation', primary: false, hidden: true,
        href: `/citizens/${citizenUuid}/timeline`,
        routeNames: ['citizens-uuid-timeline'],
    })
    // can('Medicine card') already reflects the company's real module_pages
    // choice (what Settings -> Company actually manages). A redundant check
    // against onboarding_preferences.modules.medicin used to also gate this -
    // but Settings -> Company updates module_pages without ever touching
    // onboarding_preferences, so a company that answered "no" during initial
    // onboarding and later turned Medicine card on via Settings kept this tab
    // permanently hidden despite the module being genuinely enabled and used.
    if (can('Medicine card')) {
        tabs.push({
            name: 'citizens.tabs.medicineCard', icon: 'ph:pill', isTranslateName: true,
            category: 'care', primary: true,
            href: `/citizens/${citizenUuid}/medicine-journals`,
            routeNames: ['citizens-uuid-medicine-journals'],
        })
    }
    // Same stale-flag issue as Medicine card above - can('Documents') is
    // already the authoritative, up-to-date check.
    if (can('Documents')) {
        tabs.push({
            name: 'citizens.tabs.documents', icon: 'ph:files', isTranslateName: true,
            category: 'documentation', primary: true,
            href: `/citizens/${citizenUuid}/documents`,
            routeNames: ['citizens-uuid-documents'],
        })
    }
    if (can('Health')) {
        tabs.push({
            name: 'citizens.tabs.health', icon: 'ph:heartbeat', isTranslateName: true,
            category: 'care', primary: true,
            href: `/citizens/${citizenUuid}/nursing-areas?open=laegejournal`,
            routeNames: [
                'citizens-uuid-nursing-areas',
                'citizens-uuid-nursing-areas-new',
                'citizens-uuid-nursing-areas-record_uuid-edit',
            ],
        })
    }
    // Same stale-flag issue as Medicine card/Documents above.
    if (can('Plans and goals')) {
        tabs.push({
            name: 'citizens.tabs.plansAndGoals', icon: 'ph:target', isTranslateName: true,
            category: 'care', primary: false,
            href: `/citizens/${citizenUuid}/plans-and-goals/all`,
            routeNames: [
                'citizens-uuid-plans-and-goals-all',
                'citizens-uuid-plans-and-goals-active',
                'citizens-uuid-plans-and-goals-archived',
            ],
        })
    }
    if (newValue?.is_surveys_active) {
        tabs.push({
            name: 'citizens.tabs.surveys', icon: 'ph:clipboard-text', isTranslateName: true,
            category: 'documentation', primary: true,
            href: `/citizens/${citizenUuid}/surveys`,
            routeNames: ['citizens-uuid-surveys'],
        })
    }
    if (can('Emails')) {
        tabs.push({
            name: 'citizens.tabs.emails', icon: 'ph:envelope', isTranslateName: true,
            category: 'documentation', primary: false,
            href: `/citizens/${citizenUuid}/emails`,
            routeNames: ['citizens-uuid-emails'],
        })
    }
    if (can('Attendance')) {
        tabs.push({
            name: 'citizens.tabs.attendance', icon: 'ph:clock', isTranslateName: true,
            category: 'time', primary: false,
            href: `/citizens/${citizenUuid}/attendance`,
            routeNames: ['citizens-uuid-attendance', 'citizens-uuid-attendance-citizen_protocol_uuid'],
        })
    }
    if (can('Calendar')) {
        tabs.push({
            name: 'citizens.tabs.calendar', icon: 'ph:calendar-blank', isTranslateName: true,
            category: 'time', primary: false,
            href: `/citizens/${citizenUuid}/calendar`,
            routeNames: ['citizens-uuid-calendar'],
        })
    }
    if (can('Economy')) {
        tabs.push({
            name: 'citizens.tabs.economy', icon: 'ph:wallet', isTranslateName: true,
            category: 'admin', primary: false,
            href: `/citizens/${citizenUuid}/wallets`,
            routeNames: ['citizens-uuid-wallets', 'citizens-uuid-wallets-wallet_uuid', 'citizens-uuid-expenses', 'citizens-uuid-contract'],
        })
    }
    if (can('Contacts')) {
        tabs.push({
            name: 'citizens.tabs.contacts', icon: 'ph:address-book', isTranslateName: true,
            category: 'admin', primary: false,
            href: `/citizens/${citizenUuid}/contacts`,
            routeNames: ['citizens-uuid-contacts'],
        })
        tabs.push({
            name: 'citizenRelations.tab', icon: 'ph:users-three', isTranslateName: true,
            category: 'admin', primary: false,
            href: `/citizens/${citizenUuid}/relations`,
            routeNames: ['citizens-uuid-relations'],
        })
    }
    if (can('Employee Group')) {
        tabs.push({
            name: 'citizens.tabs.employeeGroups', icon: 'ph:users-three', isTranslateName: true,
            category: 'admin', primary: false,
            href: `/citizens/${citizenUuid}/employee-groups`,
            routeNames: ['citizens-uuid-employee-groups'],
        })
    }
    if (can('Reports') && isEmploymentServices) {
        tabs.push({
            name: 'citizens.tabs.reports', icon: 'ph:chart-bar', isTranslateName: true,
            category: 'documentation', primary: false,
            href: `/citizens/${citizenUuid}/reports`,
            routeNames: ['citizens-uuid-reports'],
        })
    }
    if (systemName === 'social_welfare'
        && ['Crisis center', 'Shelter'].includes(newValue?.company?.facility_type?.en_name)) {
        tabs.push({
            name: 'citizens.tabs.children', icon: 'ph:baby', isTranslateName: true,
            category: 'care', primary: false,
            href: `/citizens/${citizenUuid}/children`,
            routeNames: ['citizens-uuid-children'],
        })
    }
    if (isEmploymentServices) {
        tabs.push({
            name: 'citizens.tabs.employmentCases', icon: 'ph:briefcase', isTranslateName: true,
            category: 'admin', primary: false,
            href: `/citizens/${citizenUuid}/employment-cases`,
            routeNames: ['citizens-uuid-employment-cases'],
        })
        tabs.push({
            name: 'citizens.tabs.outcomes', icon: 'ph:flag', isTranslateName: true,
            category: 'admin', primary: false,
            href: `/citizens/${citizenUuid}/outcomes`,
            routeNames: ['citizens-uuid-outcomes'],
        })
    }

    state.tabs = tabs

    // Redirect away from a section the user can't access.
    const currentRouteName = route.name as string
    const isCurrentRouteAccessible = tabs.some((tab) =>
        tab.routeNames.some((name: string) => currentRouteName?.startsWith(name)),
    )
    if (!isCurrentRouteAccessible) {
        if (tabs[0]) {
            navigateTo(tabs[0].href)
        } else {
            navigateTo('/citizens')
            errorAlert(`${t('alert.somethingWentWrong')}!`, `${t('youDontHaveAccessToThisPage')}.`)
        }
    }
}, { immediate: true })
</script>
