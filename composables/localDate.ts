/**
 * Local calendar dates.
 *
 * `new Date().toISOString().slice(0, 10)` gives the UTC date, which between
 * 00:00 and 02:00 Danish time is still yesterday. Anywhere the user means
 * "today" or a calendar day, use these helpers instead. Instants that are sent
 * to the API as timestamps keep using toISOString().
 */

function pad(n: number): string {
    return String(n).padStart(2, '0')
}

/** YYYY-MM-DD for the given instant in the viewer's local time zone. */
export function localDateString(date: Date = new Date()): string {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** YYYY-MM for the given instant in the viewer's local time zone. */
export function localMonthString(date: Date = new Date()): string {
    return localDateString(date).slice(0, 7)
}

/**
 * Parses a YYYY-MM-DD string as a local calendar day (at noon, so a DST shift
 * can never move it to another day). Returns null for anything else.
 */
export function parseLocalDate(value: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value ?? '')
    if (!match) return null
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12, 0, 0)

    return Number.isNaN(date.getTime()) ? null : date
}

/** Adds whole days to a YYYY-MM-DD string. Returns '' for an invalid input. */
export function addDaysToLocalDate(value: string, days: number): string {
    const date = parseLocalDate(value)
    if (!date) return ''
    date.setDate(date.getDate() + days)

    return localDateString(date)
}

/** Adds whole years to a YYYY-MM-DD string. Returns '' for an invalid input. */
export function addYearsToLocalDate(value: string, years: number): string {
    const date = parseLocalDate(value)
    if (!date) return ''
    date.setFullYear(date.getFullYear() + years)

    return localDateString(date)
}
