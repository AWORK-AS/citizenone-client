/**
 * An employee's job titles as one line ("Sygeplejerske, Læge"), so a journal
 * note's "Created by" can say whether a nurse or a doctor wrote it.
 *
 * Employees can hold several titles (user.job_titles). Empty when the author
 * has none, so callers can hide the suffix instead of showing "()".
 */
export function formatJobTitles(user: any): string {
    const titles = Array.isArray(user?.job_titles) ? user.job_titles : []

    return titles
        .map((jobTitle: any) => String(jobTitle?.title ?? '').trim())
        .filter(Boolean)
        .join(', ')
}
