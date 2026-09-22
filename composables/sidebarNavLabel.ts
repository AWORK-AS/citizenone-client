// Extracted from layouts/user.vue's getNavItemLabel() so the sidebar-customization
// settings page can show the same labels as the sidebar itself without duplicating
// this name -> translation-key mapping.
//
// `t` and `customPagesStore` are passed in rather than resolved here via useI18n()/
// useCustomPagesStore(): vue-i18n's useI18n() may only be called synchronously at
// the top of a component's setup(), not lazily from a function invoked later (e.g.
// inside a computed's .map() callback) - the caller must call these composables
// once at the top of its own setup and pass the results through.
export function getSidebarNavItemLabel(item: any, t: (key: string) => string, customPagesStore: any): string {
    if (item.rawLabel) return item.name
    if (item.name === 'Overview') return t('sidebar.overview')
    if (item.name === 'Reminders') return t('navbar.reminders')
    // The store already holds the resolved word - see setCustomPageNames.
    if (item.name === 'Citizens') return customPagesStore.getCustomPagesName?.citizens || t('sidebar.citizens')
    if (item.name === 'Invoicing') return t('sidebar.invoicing')
    if (item.name === 'DentalOverview') return t('sidebar.dentalOverview')
    if (item.name === 'DentalRecalls') return t('sidebar.dentalRecalls')
    if (item.name === 'Calendar') return t('sidebar.calendar')
    if (item.name === 'Duty schedules') return customPagesStore.getCustomPagesName?.dutySchedules || t('sidebar.dutySchedules')
    if (item.name === 'My availability') return t('sidebar.myAvailability')
    if (item.name === 'My shift evaluations') return t('sidebar.myShiftEvaluations')
    if (item.name === 'Messages') return t('sidebar.messages')
    if (item.name === 'Procedures') return t('sidebar.procedures') || 'Procedurer'
    if (item.name === 'Protocols') return t('sidebar.protocols')
    if (item.name === 'Reports') return t('sidebar.reports')
    if (item.name === 'Plans And Goals Export') return t('sidebar.plansAndGoalsExport')
    if (item.name === 'Report Templates') return t('sidebar.reportTemplates')
    if (item.name === 'Documents') return t('sidebar.documents')
    if (item.name === 'Mail') return t('sidebar.mail')
    if (item.name === 'Leads') return t('sidebar.leads')
    if (item.name === 'Bullet Board') return t('sidebar.bulletBoard')
    // The string is a terminology link now, so it already carries the
    // company's own word, capitalised for a menu entry.
    if (item.name === 'Journal Notes') return t('sidebar.journalNotes')
    if (item.name === 'Forms') return t('sidebar.forms')
    if (item.name === 'Billing') return t('employment.billing.billing')
    if (item.name === 'Revenue report') return t('employment.revenue.report')
    if (item.name === 'Management & Economy') return t('managementEconomy.title')
    if (item.name === 'Economy') return t('economy.title')
    if (item.name === 'Inquiries') return t('inquiries.inquiries')
    if (item.name === 'Tasks') return t('taskBoards.title')
    if (item.name === 'Staff workload') return t('staffWorkloadReport.title')
    return item.name
}
