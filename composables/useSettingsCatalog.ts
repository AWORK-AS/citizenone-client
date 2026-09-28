import { useCustomPagesStore } from '@/store/custom-pages'
import { useUserStore } from '@/store/user'

export interface SettingsCatalogItem {
    /** Category the item sits in on the settings catalog page. */
    group: string
    /** Either an i18n key or, when `isTranslateName` is false, a ready label. */
    name: string
    isTranslateName: boolean
    href: string
    routeNames: string[]
}

/**
 * The company's settings catalog: every configurable list the company owns,
 * already filtered by the flags that decide whether it exists at all.
 *
 * It lives here rather than inside the settings page because two places need
 * the same list - the catalog page's left rail, and the per-page settings
 * shortcut in the navbar, which has to name the pages it links to. A second
 * copy would drift the moment someone adds a setting.
 */
export function useSettingsCatalog() {
    const userStore = useUserStore() as any
    const customPagesStore = useCustomPagesStore() as any

    /** Exactly the rail on the settings catalog page, in its own order. */
    const catalogItems = computed<SettingsCatalogItem[]>(() => {
        const user = userStore.getUser
        if (!user) return []

        const isEmploymentServices = user?.company?.industry?.system_name === 'employment_services'
        const isSocialWelfare = user?.company?.industry?.system_name === 'social_welfare'
        const hasInquiries = !!user?.company?.inquiry_pipeline_enabled
        const hasTasks = !!user?.company?.tasks_workflow_enabled
        const hasSurveys = user?.is_surveys_active !== false
        const hasExtendedDutySchedule = !!user?.is_extended_duty_schedule_active

        const when = (condition: boolean, item: SettingsCatalogItem) => condition ? [item] : []
        const item = (group: string, name: string, href: string, routeNames: string[], isTranslateName = true): SettingsCatalogItem =>
            ({ group, name, isTranslateName, href, routeNames })

        return [
            item('schedule', 'settings.tabs.absences', '/settings/absences', ['settings-absences']),
            item('citizens', customPagesStore.getCustomPagesName?.addictions, '/settings/addictions', ['settings-addictions'], false),
            item('citizens', 'settings.tabs.addressBook', '/settings/address-book', ['settings-address-book']),
            ...when(isEmploymentServices, item('employment', 'settings.tabs.employmentAgreements', '/settings/employment-agreements', ['settings-employment-agreements'])),
            ...when(isEmploymentServices, item('employment', 'settings.tabs.employmentBillingRules', '/settings/employment-billing-rules', ['settings-employment-billing-rules'])),
            item('booking', 'settings.tabs.bookingTags', '/settings/booking-tags', ['settings-booking-tags']),
            item('booking', 'settings.tabs.calendarTags', '/settings/calendar-tags', ['settings-calendar-tags']),
            ...when(isEmploymentServices, item('employment', 'settings.tabs.employmentCaseTypes', '/settings/employment-case-types', ['settings-employment-case-types'])),
            item('journal', 'settings.tabs.consentDeclarationTypes', '/settings/consent-declaration-types', ['settings-consent-declaration-types']),
            item('access', 'settings.tabs.contactJobTitles', '/settings/contact-job-titles', ['settings-contact-job-titles']),
            item('citizens', 'settings.tabs.timelineEventTypes', '/settings/timeline-event-types', ['settings-timeline-event-types']),
            item('access', 'settings.tabs.customLinks', '/settings/custom-links', ['settings-custom-links', 'settings-custom-links-new', 'settings-custom-links-uuid-edit']),
            item('communication', 'settings.tabs.messageTemplates', '/settings/message-templates', ['settings-message-templates']),
            item('access', 'settings.tabs.departments', '/settings/departments', ['settings-departments']),
            ...when(isSocialWelfare, item('citizens', 'settings.tabs.customerDepartments', '/settings/customer-departments', ['settings-customer-departments'])),
            item('health', 'settings.tabs.diagnoses', '/settings/diagnoses', ['settings-diagnoses']),
            item('health', 'settings.tabs.dosageForms', '/settings/dosage-forms', ['settings-dosage-forms']),
            item('schedule', 'settings.tabs.dutyShiftRules', '/settings/duty-shift-rules', ['settings-duty-shift-rules']),
            item('access', 'settings.tabs.employeeGroups', '/settings/employee-groups', ['settings-employee-groups']),
            item('access', 'settings.tabs.employmentOptions', '/settings/employment-options', ['settings-employment-options']),
            ...when(hasInquiries, item('access', 'settings.tabs.consultantSkills', '/settings/consultant-skills', ['settings-consultant-skills'])),
            item('citizens', 'settings.tabs.expenseCategories', '/settings/expense-categories', ['settings-expense-categories']),
            item('schedule', 'settings.tabs.extraHoursTags', '/settings/extra-hours-tags', ['settings-extra-hours-tags']),
            item('citizens', 'settings.tabs.foreignCities', '/settings/foreign-cities', ['settings-foreign-cities']),
            item('access', 'settings.tabs.jobTitles', '/settings/job-titles', ['settings-job-titles', 'settings-job-titles-job_title_uuid']),
            ...when(isEmploymentServices, item('employment', 'settings.tabs.employmentJobcenters', '/settings/employment-jobcenters', ['settings-employment-jobcenters'])),
            item('journal', 'settings.tabs.journalContents', '/settings/journal-contents', ['settings-journal-contents']),
            item('journal', 'settings.tabs.journalNoteTags', '/settings/journal-note-tags', ['settings-journal-note-tags']),
            item('journal', 'settings.tabs.journalTitles', '/settings/journal-titles', ['settings-journal-titles']),
            ...when(hasInquiries, item('citizens', 'settings.tabs.inquiryPipelineStages', '/settings/inquiry-pipeline-stages', ['settings-inquiry-pipeline-stages'])),
            ...when(hasInquiries, item('citizens', 'settings.tabs.inquiryFields', '/settings/inquiry-fields', ['settings-inquiry-fields'])),
            ...when(hasInquiries, item('citizens', 'settings.tabs.inquiryServiceTypes', '/settings/inquiry-service-types', ['settings-inquiry-service-types'])),
            ...when(hasInquiries, item('citizens', 'settings.tabs.inquiryOffers', '/settings/inquiry-offers', ['settings-inquiry-offers'])),
            ...when(hasTasks, item('access', 'settings.tabs.taskTypes', '/settings/task-types', ['settings-task-types'])),
            ...when(hasTasks, item('access', 'settings.tabs.taskRules', '/settings/task-rules', ['settings-task-rules'])),
            ...when(hasSurveys, item('journal', 'settings.tabs.surveys', '/surveys', ['surveys', 'surveys-new', 'surveys-survey_uuid-edit', 'surveys-survey_uuid-assignments', 'surveys-survey_uuid-fill'])),
            item('health', 'settings.tabs.massUnits', '/settings/mass-units', ['settings-mass-units']),
            item('health', 'settings.tabs.medicationAllergies', '/settings/medication-allergies', ['settings-medication-allergies']),
            item('health', 'settings.tabs.medicines', '/settings/medicines', ['settings-medicines']),
            item('schedule', 'settings.tabs.normPeriods', '/settings/norm-periods', ['settings-norm-periods']),
            item('health', 'settings.tabs.nursingProfessionalRecordTemplates', '/settings/nursing-professional-record-templates', ['settings-nursing-professional-record-templates']),
            item('citizens', 'settings.tabs.relationships', '/settings/relationships', ['settings-relationships']),
            ...when(isEmploymentServices, item('employment', 'settings.tabs.reportTemplates', '/settings/report-templates', ['settings-report-templates', 'settings-report-templates-new', 'settings-report-templates-uuid-edit'])),
            item('access', 'settings.tabs.roles', '/settings/roles', ['settings-roles']),
            item('booking', 'settings.tabs.rooms', '/settings/rooms', ['settings-rooms']),
            item('schedule', 'settings.tabs.scheduleTags', '/settings/schedule-tags', ['settings-schedule-tags']),
            item('access', 'settings.tabs.sections', '/settings/sections', ['settings-sections']),
            item('schedule', 'settings.tabs.shifts', '/settings/shifts', ['settings-shifts']),
            ...when(hasExtendedDutySchedule, item('schedule', 'settings.tabs.wageSupplementRules', '/settings/wage-supplement-rules', ['settings-wage-supplement-rules'])),
            ...when(isEmploymentServices, item('employment', 'settings.tabs.employmentStatusTypes', '/settings/employment-status-types', ['settings-employment-status-types'])),
            item('schedule', 'settings.tabs.timeAccounts', '/settings/time-accounts', ['settings-time-accounts']),
            item('health', 'settings.tabs.treatmentTemplates', '/settings/treatment-templates', ['settings-treatment-templates']),
            item('health', 'settings.tabs.units', '/settings/units', ['settings-units']),

        ]
    })

    /**
     * The catalog plus the settings that have their own tab rather than a place
     * in the catalog rail. Only for looking a page up by href - the rail keeps
     * showing the catalog alone, or these would appear twice in the settings UI.
     */
    const allItems = computed<SettingsCatalogItem[]>(() => {
        const named = (name: string, href: string, routeName: string): SettingsCatalogItem =>
            ({ group: 'access', name, isTranslateName: true, href, routeNames: [routeName] })
        return [
            ...catalogItems.value,
            named('settings.tabs.company', '/settings/company', 'settings-company'),
            named('settings.tabs.storage', '/settings/storage', 'settings-storage'),
            named('settings.tabs.gdprRetention', '/settings/gdpr-retention', 'settings-gdpr-retention'),
            named('settings.tabs.smsNotifications', '/settings/sms-notifications', 'settings-sms-notifications'),
            named('settings.tabs.customPages', '/settings/custom-pages', 'settings-custom-pages'),
        ]
    })

    function byHref(href: string): SettingsCatalogItem | undefined {
        return allItems.value.find((entry) => entry.href === href)
    }

    return { catalogItems, allItems, byHref }
}
