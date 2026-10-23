// Helpers for "employees who have been inactive for 3 months": the pop-up
// (ModulesUserEmployeeInactivePrompt) and the "Last active" column on the employee list.
// Pure apart from the storage helpers, so the date logic can be tested on its own.

const CHECKED_ON_KEY = 'inactive_employees_prompt_checked_on'

/** The language code the app uses (dk, no, sv, en) as a code Intl understands. */
export function intlLocale(locale: string): string {
    if (locale === 'dk') return 'da-DK'
    if (locale === 'no') return 'nb-NO'
    if (locale === 'sv') return 'sv-SE'
    return 'en-GB'
}

/** "3 months ago", "yesterday": Intl does the wording for every language. */
export function formatRelativeFromNow(iso: string, locale: string, now: Date = new Date()): string {
    const then = new Date(iso)
    if (Number.isNaN(then.getTime())) return ''

    const formatter = new Intl.RelativeTimeFormat(intlLocale(locale), { numeric: 'auto' })
    const minutes = Math.round((now.getTime() - then.getTime()) / 60_000)

    if (minutes < 60) return formatter.format(-Math.max(minutes, 0), 'minute')

    const hours = Math.floor(minutes / 60)
    if (hours < 24) return formatter.format(-hours, 'hour')

    const days = Math.floor(hours / 24)
    if (days < 30) return formatter.format(-days, 'day')
    if (days < 365) return formatter.format(-Math.floor(days / 30), 'month')

    return formatter.format(-Math.floor(days / 365), 'year')
}

/** "12 July 2026". */
export function formatLongDate(iso: string, locale: string): string {
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return ''

    return date.toLocaleDateString(intlLocale(locale), { day: 'numeric', month: 'long', year: 'numeric' })
}

/** The local calendar day as YYYY-MM-DD. */
export function localDayKey(now: Date = new Date()): string {
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')

    return `${now.getFullYear()}-${month}-${day}`
}

function storageKey(userId: string | null | undefined): string {
    return userId ? `${CHECKED_ON_KEY}:${userId}` : CHECKED_ON_KEY
}

/** Storage can be blocked (private mode, policy): then every check simply asks the server. */
export function hasHandledToday(userId: string | null | undefined, now: Date = new Date()): boolean {
    try {
        return localStorage.getItem(storageKey(userId)) === localDayKey(now)
    } catch (e) {
        return false
    }
}

export function markHandledToday(userId: string | null | undefined, now: Date = new Date()): void {
    try {
        localStorage.setItem(storageKey(userId), localDayKey(now))
    } catch (e) { /* the server rules still decide */ }
}
