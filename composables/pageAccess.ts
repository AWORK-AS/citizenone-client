/**
 * Whether a user may open a page, as one decision instead of three copies of it.
 *
 * The same three checks are made in `layouts/user.vue` (to show or hide the nav
 * link) and in `middleware/require-page.ts` (to let the route load at all), and
 * the mobile app makes the first two in `hooks/useCompanyModule.ts`. Written out
 * a third time in the middleware, one of them had drifted: the guard demanded
 * `inquiry_pipeline_enabled` of every page, because it was written when
 * Inquiries was the only page using it. Any second page added to it would have
 * been refused to every company without the inquiry pipeline - a flag that has
 * nothing to do with, say, the medicine card.
 *
 * The flag is now something a route asks for by name, and the rest of the
 * decision is here where it can be tested without a browser.
 */

/** A company's own module set: `companies.module_pages`, via `/user`. */
export function companyHasModule(modulePages: unknown, name: string): boolean {
    // No rows means every module. That is the default for a company that has
    // never opened Settings -> Company -> Moduler, and the same reading the
    // server and the app both take, so the three cannot disagree. A company that
    // switched every module off is sent ['__none__'] instead, which names nothing.
    return !Array.isArray(modulePages) || modulePages.length === 0 || modulePages.includes(name)
}

/** The pages the user's roles were granted: `effective_pages`, served as `pages`. */
export function userHasPage(pages: unknown, name: string): boolean {
    return Array.isArray(pages) && pages.some((page: any) => page?.name === name)
}

/**
 * @param requiredCompanyFlag a boolean column on `companies` the page also needs,
 *   e.g. `inquiry_pipeline_enabled`. Omitted for pages that need no such flag.
 */
export function canOpenPage(user: any, requiredPage: string, requiredCompanyFlag?: string): boolean {
    if (requiredCompanyFlag && !user?.company?.[requiredCompanyFlag]) {
        return false
    }

    return companyHasModule(user?.company?.module_pages, requiredPage)
        && userHasPage(user?.pages, requiredPage)
}

/**
 * Sidebar entries that belong to a company module, by the entry's own name.
 * The sidebar used to check the module for only a handful of its entries, so a
 * company that had switched a module off in Settings -> Company still met the
 * link. The route guard and the backend stay the real enforcement; this keeps
 * the menu from advertising what the company has not got.
 */
export const NAV_ITEM_MODULE: Record<string, string> = {
    'Journal Notes': 'Journals',
    'Mail': 'Emails',
    'Reports': 'Reports',
    'Plans And Goals Export': 'Plans and goals',
    'Staff workload': 'Staff workload',
}

export function navItemModuleEnabled(itemName: string, modulePages: unknown): boolean {
    const module = NAV_ITEM_MODULE[itemName]

    return !module || companyHasModule(modulePages, module)
}

/**
 * The Economy entry. The two employment-service modules default to "on" for a
 * company with no module list, which made the entry appear for every user; it
 * now also needs the Economy page the user's role was granted.
 */
export function economyNavVisible(user: any): boolean {
    const modulePages = user?.company?.module_pages
    const hasOverview = userHasPage(user?.pages, 'Management & Economy')
        && companyHasModule(modulePages, 'Management & Economy')
    const hasEmploymentEconomy = userHasPage(user?.pages, 'Economy')
        && (companyHasModule(modulePages, 'Billing') || companyHasModule(modulePages, 'Revenue report'))

    return hasOverview || hasEmploymentEconomy
}
