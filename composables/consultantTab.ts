/**
 * The employee's consultant tab is for consultants only (a role that counts as
 * consultant, or employed as one). The profile answer says so in is_consultant.
 */

/** False only when the profile says no: a missing answer or an older backend keeps the tab. */
export function showsConsultantTab(profileAnswer: any): boolean {
    return profileAnswer?.data?.is_consultant !== false
}

/**
 * Where to go when the consultant tab is open but the employee is no
 * consultant: their details page. Null when the current page is fine.
 */
export function consultantTabRedirect(path: string, employeeUuid: string, shows: boolean): string | null {
    if (shows || !employeeUuid) return null
    return path.replace(/\/+$/, '') === `/employees/${employeeUuid}/consultant-profile`
        ? `/employees/${employeeUuid}/view-details`
        : null
}
