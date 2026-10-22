/**
 * The module card in Settings -> Company: which group each module sits in, and
 * the key of its one-line explanation.
 *
 * Feedback from a psychologist: the system could do far more than he would ever
 * use, and the card was a flat list of nineteen Danish names with nothing to
 * say what any of them was. Grouping and a line each make it something a small
 * clinic can actually go through.
 *
 * Keyed by `pages.name`, the same name `module_pages` carries. A page added on
 * the server and not listed here still shows, under "Other", rather than
 * vanishing from the card.
 */

export type ModuleGroupKey = 'clients' | 'daily' | 'staff' | 'economy' | 'other'

/** Page name -> group, and the key under `companyModulesCard.help`. */
export const COMPANY_MODULES: Record<string, { group: ModuleGroupKey; help: string }> = {
    'Journals': { group: 'clients', help: 'journals' },
    'Documents': { group: 'clients', help: 'documents' },
    'Contacts': { group: 'clients', help: 'contacts' },
    'Emails': { group: 'clients', help: 'emails' },
    'Medicine card': { group: 'clients', help: 'medicineCard' },
    'Health': { group: 'clients', help: 'health' },
    'Plans and goals': { group: 'clients', help: 'plansAndGoals' },
    'Wellbeing': { group: 'clients', help: 'wellbeing' },
    'Reports': { group: 'clients', help: 'reports' },

    'Calendar': { group: 'daily', help: 'calendar' },
    'Messages': { group: 'daily', help: 'messages' },
    'Reminders': { group: 'daily', help: 'reminders' },
    'AI assistant': { group: 'daily', help: 'aiAssistant' },
    'Forms': { group: 'daily', help: 'forms' },
    'Tasks': { group: 'daily', help: 'tasks' },
    'Bullet Board': { group: 'daily', help: 'bulletBoard' },
    'Inquiries': { group: 'daily', help: 'inquiries' },
    'Findsocialetilbud': { group: 'daily', help: 'findsocialetilbud' },

    'Duty Schedule': { group: 'staff', help: 'dutySchedule' },
    'Attendance': { group: 'staff', help: 'attendance' },
    'Employee Group': { group: 'staff', help: 'employeeGroup' },
    'Staff workload': { group: 'staff', help: 'staffWorkload' },

    'Billing': { group: 'economy', help: 'billing' },
    'Revenue report': { group: 'economy', help: 'revenueReport' },
    'Economy': { group: 'economy', help: 'economy' },
    'Management & Economy': { group: 'economy', help: 'managementEconomy' },
}

export const MODULE_GROUP_ORDER: ModuleGroupKey[] = ['clients', 'daily', 'staff', 'economy', 'other']

/**
 * Stands in `module_pages` for a company that switched every module off, as
 * the server sends it (`Company::NO_MODULES`). An empty list means "every
 * module" to every reader of `module_pages`, so "none" has to name something.
 */
export const NO_MODULES = '__none__'

/** The pages in card order, grouped. Empty groups are left out. */
export function groupModules<T extends { name: string }>(pages: T[]): { key: ModuleGroupKey; pages: T[] }[] {
    const order = Object.keys(COMPANY_MODULES)
    const position = (name: string) => {
        const i = order.indexOf(name)
        return i === -1 ? order.length : i
    }

    return MODULE_GROUP_ORDER
        .map(key => ({
            key,
            pages: pages
                .filter(page => (COMPANY_MODULES[page.name]?.group ?? 'other') === key)
                .sort((a, b) => position(a.name) - position(b.name) || a.name.localeCompare(b.name)),
        }))
        .filter(group => group.pages.length > 0)
}

/** What to put in the in-memory `module_pages` after a save, so the menu updates without a reload. */
export function modulePagesAfterSave(enabledNames: string[]): string[] {
    return enabledNames.length ? enabledNames : [NO_MODULES]
}
