export interface SettingsHint {
    /** Stable id, used to remember that this note was dismissed. */
    key: string
    titleKey: string
    bodyKey: string
}

/**
 * The short "what is this page for" note that sits above a settings page.
 *
 * Settings pages are the ones people open rarely and unsure, and their titles
 * are nouns - Paragraffer, Normperioder, Ordliste - that say what the list is
 * called rather than what it does. The note answers that in one line, and the
 * reader can dismiss it for good once it has done its job.
 *
 * Pages that configure one of the catalog's lists fall back to a note for their
 * whole category, so a new list added to the catalog is explained the day it
 * ships rather than the day someone writes copy for it.
 */
export function useSettingsHints() {
    /** Pages with an answer of their own. */
    const BY_ROUTE: Record<string, string> = {
        'settings-profile': 'profile',
        'settings-company': 'company',
        'settings-import': 'import',
        'settings-subscription': 'subscription',
        'settings-invoices': 'invoices',
        'settings-license-overview': 'licenses',
        'settings-storage': 'storage',
        'settings-portal-access': 'portalAccess',
        'settings-activity-logs': 'activityLogs',
        'settings-time-logs': 'timeLogs',
        'settings-mileage-log': 'mileageLog',
        'settings-support-access': 'supportAccess',
        'settings-gdpr-retention': 'gdprRetention',
        'settings-sms-notifications': 'smsNotifications',
        'settings-power-bi': 'powerBi',
        'settings-economic': 'economic',
        'settings-fst': 'fst',
        'settings-custom-pages': 'customPages',
        'settings-transactions': 'transactions',
        'settings-custom-links': 'customLinks',
        'settings-roles': 'roles',
        'settings-departments': 'departments',
        'settings-employee-groups': 'employeeGroups',
        'settings-archived-citizens': 'archived',
        'settings-archived-employees': 'archived',
        'settings-archived-documents': 'archived',
        'settings-archived-goals': 'archived',
        'settings-archived-plans': 'archived',
        'settings-archived-subgoals': 'archived',
    }

    const { catalogItems } = useSettingsCatalog()

    function hintForRoute(routeName: string): SettingsHint | null {
        if (!routeName) return null

        const own = BY_ROUTE[routeName]
        if (own) return hint(own)

        // A catalog page: explained by its category, matching the rail's sections.
        const entry = catalogItems.value.find((item) =>
            item.routeNames.some((name) => routeName === name || routeName.startsWith(`${name}-`)))

        return entry ? hint(`catalog.${entry.group}`) : null
    }

    function hint(key: string): SettingsHint {
        return { key, titleKey: `settings.hints.${key}.title`, bodyKey: `settings.hints.${key}.body` }
    }

    return { hintForRoute }
}
