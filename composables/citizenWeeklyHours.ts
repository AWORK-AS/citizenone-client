/**
 * Pure helpers for hours a week per citizen: what an employee is given on a
 * citizen they are assigned to, against the hours they used that week. Free of
 * Vue and auto-imports so they can be tested with
 * `node --test tests/unit/citizenWeeklyHours.test.mjs`.
 */

export type CitizenWeekRow = {
    citizen_uuid: string
    firstname: string | null
    lastname: string | null
    weekly_hours: number
    used_hours: number
    remaining_hours: number
}

/**
 * The company switch "Hours a week per citizen", off unless an Admin turned it
 * on in Settings. A company without the field (an older payload) counts as off.
 */
export function isContactWeeklyHoursOn(company: any): boolean {
    return company?.contact_weekly_hours_enabled === true
}

/** How full the week is, 0-100, for the bar. Over the hours given stays at 100. */
export function weekProgress(row: Pick<CitizenWeekRow, 'weekly_hours' | 'used_hours'>): number {
    if (!row.weekly_hours || row.weekly_hours <= 0) {
        return 0
    }

    return Math.max(0, Math.min(100, Math.round((row.used_hours / row.weekly_hours) * 100)))
}

/** 'over' past the hours given, 'done' at them, 'open' while hours are left. */
export function weekStatus(row: Pick<CitizenWeekRow, 'remaining_hours'>): 'over' | 'done' | 'open' {
    if (row.remaining_hours < 0) {
        return 'over'
    }

    return row.remaining_hours === 0 ? 'done' : 'open'
}

/**
 * The value the assign form sends: a number of hours, or null for none. An
 * empty field means none; a comma works as decimal mark, as Danish users type it.
 */
export function parseWeeklyHours(value: unknown): number | null {
    if (value === null || value === undefined) {
        return null
    }

    const text = String(value).trim().replace(',', '.')
    if (text === '') {
        return null
    }

    const hours = Number(text)

    return Number.isFinite(hours) ? hours : null
}

/** Hours with at most two decimals and no trailing zeros; a comma as decimal mark except in English. */
export function formatWeekHours(hours: number, language: string | undefined): string {
    const text = String(Math.round((Number(hours) || 0) * 100) / 100)

    return language?.startsWith('en') ? text : text.replace('.', ',')
}
