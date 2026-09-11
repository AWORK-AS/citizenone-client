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
    // server and the app both take, so the three cannot disagree.
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
