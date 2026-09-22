/**
 * The built-in employment-dropdown labels, translated on this side because the
 * API deliberately does not pin them to one language (a company's own added
 * options come back with their own label already set).
 *
 * form.vue and view-details.vue each used to keep their own copy of this map -
 * form.vue's stayed correct, view-details.vue's read the raw value straight
 * from the API with no translation at all, so the same saved employment
 * status ("substitute") showed as "Timelønnet" on the edit form and the raw,
 * untranslated "Substitute" on the view page. One source now, so that drift
 * cannot happen again.
 */
export const EMPLOYMENT_STATUS_LABELS: Record<string, string> = {
    permanent: 'employees.employmentStatus.permanent',
    temporary: 'employees.employmentStatus.temporary',
    substitute: 'employees.employmentStatus.substitute',
    hourly: 'employees.employmentStatus.hourly',
}

export const WORKING_HOURS_LABELS: Record<string, string> = {
    full_time: 'employees.workingHours.fulltime',
    part_time: 'employees.workingHours.parttime',
}

/**
 * A built-in employment status's translation key, resolved to its label by
 * the caller's own $t. A company's own added option, or a value this map
 * does not (yet) know, is returned as-is rather than guessed at.
 */
export function resolveEmploymentStatusLabel(value: string | null | undefined, t: (key: string) => string): string {
    if (!value) {
        return ''
    }

    const key = EMPLOYMENT_STATUS_LABELS[value]

    return key ? t(key) : value
}

/**
 * One of the two built-in option lists (employment status or working hours),
 * translated into {value, label} pairs for a FormSelect - the shape every
 * call site building this list by hand already used.
 */
export function builtInOptions(labels: Record<string, string>, t: (key: string) => string) {
    return Object.entries(labels).map(([value, key]) => ({ value, label: t(key) }))
}
