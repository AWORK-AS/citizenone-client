import { useUserStore } from '@/store/user'
import { usePermissions } from '@/composables/usePermissions'

export interface SettingsNavItem {
    /** Either an i18n key or, when `isTranslateName` is false, a ready label. */
    name: string
    isTranslateName: boolean
    href: string
    routeNames: string[]
}

export interface SettingsNavSection {
    key: string
    /** i18n key for the section heading. */
    labelKey: string
    /**
     * Whether the section starts folded. The six sections a company configures
     * once stay open; the catalog's eight - fifty lists between them - start
     * folded so the rail reads as a map you can take in at a glance rather than
     * a wall you scroll. The section holding the open page always unfolds, and
     * so does anything a search matches.
     */
    startsCollapsed?: boolean
    items: SettingsNavItem[]
}

/**
 * Every settings page the signed-in user may open, in the order the settings
 * rail shows them.
 *
 * It replaces the old menubar of hover dropdowns: that one had room for twenty
 * destinations, so the remaining fifty lived behind a single "Catalog" entry
 * three levels down, and nothing on screen told you they existed. Here the
 * catalog's own categories are sections of the same rail, so the rail is the
 * whole map of settings and there is one place to look.
 */
export function useSettingsNav() {
    const userStore = useUserStore() as any
    const { catalogItems } = useSettingsCatalog()
    const { can } = usePermissions()

    const isAdmin = computed(() => !!userStore.getUser?.roles?.some((role: any) => role.name === 'Admin'))

    const sections = computed<SettingsNavSection[]>(() => {
        const user = userStore.getUser
        if (!user) return []

        const item = (name: string, href: string, routeNames: string[]): SettingsNavItem =>
            ({ name, isTranslateName: true, href, routeNames })

        // Each entry is named with the page's own title key: the word you click is then
        // the word at the top of the page you land on, in every language, and stays so
        // when either side is retranslated.
        const profile = item('settings.tabs.profile', '/settings/profile', ['settings-profile'])
        const timeLogs = item('timeLogs.timeLogs', '/settings/time-logs', ['settings-time-logs'])
        const mileageLog = item('mileageLog.mileageLog', '/settings/mileage-log', ['settings-mileage-log'])

        // Admin-set Daily Overview layouts. Also offered to a non-admin whose role
        // was given manage_daily_overview, e.g. a department manager.
        const dailyOverview = item('dailyOverviewLayouts.title', '/settings/daily-overview', ['settings-daily-overview'])

        // Everyone who is not an admin has these three pages and nothing else,
        // so they get one unlabelled section rather than a rail of headings.
        if (!isAdmin.value) {
            const own = [profile, timeLogs, mileageLog]
            if (can('manage_daily_overview')) own.push(dailyOverview)
            return [{ key: 'me', labelKey: 'settings.groups.me', items: own }]
        }

        const isEmploymentServices = user?.company?.industry?.system_name === 'employment_services'
        const company: SettingsNavItem[] = [
            item('settings.tabs.company', '/settings/company', ['settings-company']),
            // The subscription, its licences, its storage and its invoices are the
            // company's account, so they sit with the company rather than beside the
            // reader's own profile. One entry: the four pages carry a tab row.
            item('settings.groups.billing', '/settings/subscription', ['settings-subscription', 'settings-license-overview', 'settings-storage', 'settings-invoices', 'settings-ai-usage']),
            item('settings.tabs.import', '/settings/import', ['settings-import']),
            item('whistleblower.settings.title', '/settings/whistleblower', ['settings-whistleblower']),
            dailyOverview,
        ]
        if (isEmploymentServices) {
            company.push(
                item('settings.tabs.gdprRetention', '/settings/gdpr-retention', ['settings-gdpr-retention']),
                item('settings.tabs.smsNotifications', '/settings/sms-notifications', ['settings-sms-notifications']),
            )
        }

        // The catalog keeps its own categories, one rail section each, so a
        // medicine list is found under medicine rather than under "Catalog".
        const catalogOrder = ['access', 'communication', 'journal', 'health', 'schedule', 'booking', 'citizens', 'employment']
        const catalogSections = catalogOrder
            .map((key) => ({
                key: `catalog-${key}`,
                labelKey: `settings.groups.${key}`,
                startsCollapsed: true,
                items: catalogItems.value
                    .filter((entry) => entry.group === key)
                    .map(({ name, isTranslateName, href, routeNames }) => ({ name, isTranslateName, href, routeNames })),
            }))
            .filter((section) => section.items.length > 0)

        return [
            { key: 'me', labelKey: 'settings.groups.me', items: [profile] },
            { key: 'company', labelKey: 'settings.groups.company', items: company },
            ...catalogSections,
            {
                key: 'apps', labelKey: 'settings.groups.apps', items: [
                    item('portalAccess.title', '/settings/portal-access', ['settings-portal-access']),
                    item('settings.tabs.powerBi', '/settings/power-bi', ['settings-power-bi']),
                    item('settings.tabs.economic', '/settings/economic', ['settings-economic']),
                    item('settings.tabs.fst', '/settings/fst', ['settings-fst']),
                ]
            },
            {
                key: 'data', labelKey: 'settings.groups.data', items: [
                    item('settings.tabs.archived', '/settings/archived/citizens', ['settings-archived-citizens', 'settings-archived-employees', 'settings-archived-documents', 'settings-archived-goals', 'settings-archived-plans', 'settings-archived-subgoals']),
                    item('settings.tabs.customPages', '/settings/custom-pages', ['settings-custom-pages']),
                    item('settings.tabs.transactions', '/settings/transactions', ['settings-transactions']),
                ]
            },
            {
                key: 'logs', labelKey: 'settings.groups.logs', items: [
                    item('activityLogs.activityLogs', '/settings/activity-logs', ['settings-activity-logs']),
                    timeLogs,
                    mileageLog,
                    item('supportAccess.title', '/settings/support-access', ['settings-support-access']),
                ]
            },
        ]
    })

    /**
     * Whether a rail entry owns the current route. A page's own new/edit routes
     * count as the page: adding a shift is still the shift setting, and the old
     * exact-match check left the rail with nothing marked the moment you opened
     * a form.
     */
    function isItemActive(item: SettingsNavItem, routeName: string): boolean {
        if (!routeName) return false
        return item.routeNames.some((name) => routeName === name || routeName.startsWith(`${name}-`))
    }

    return { sections, isAdmin, isItemActive }
}
