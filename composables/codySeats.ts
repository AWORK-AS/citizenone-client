/**
 * Who may hand out Cody seats from the employee list, and what the seats
 * banner's button does.
 *
 * A customer bought eight seats and could not assign one: the action was
 * shown only to a user holding a seat, and their admin had none. The rule
 * here mirrors the backend's: whoever manages the seats, with or without one.
 *
 * Kept free of Nuxt so it runs under `node --test`.
 */
export function canGiveAiAccess(user: any, codyStatus: any): boolean {
    return !!user?.has_ai_access || !!(codyStatus?.company_has_cody && codyStatus?.can_manage)
}

/** The banner already sits on the page it points to: show the list instead of navigating to it. */
export function seatsActionOnPage(currentPath: string, targetPath: string): 'scroll' | 'navigate' {
    return currentPath.replace(/\/+$/, '') === targetPath.replace(/\/+$/, '') ? 'scroll' : 'navigate'
}
