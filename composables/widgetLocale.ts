/**
 * Language selection for the public website booking widget.
 *
 * The widget is shown to members of the public, not logged-in users, so
 * there is no saved user language to use. Priority, highest first:
 *
 *   1. the visitor's own pick from the language switch (remembered locally),
 *   2. a language the clinic set on purpose (data-locale / ?locale=),
 *   3. the visitor's browser languages (navigator.languages), in order,
 *   4. English.
 *
 * Browser language rather than geo-IP on purpose: it reflects what the
 * visitor actually reads (an English speaker living in Denmark gets English)
 * and needs no third-party lookup.
 */

export const WIDGET_LOCALES = ['dk', 'en', 'no', 'sv'] as const
export type WidgetLocale = (typeof WIDGET_LOCALES)[number]

export const WIDGET_LOCALE_STORAGE_KEY = 'citizenone-booking-locale'

/** Short label and native name for each locale, used by the language switch. */
export const WIDGET_LOCALE_OPTIONS: { value: WidgetLocale, short: string, name: string }[] = [
    { value: 'dk', short: 'DA', name: 'Dansk' },
    { value: 'en', short: 'EN', name: 'English' },
    { value: 'no', short: 'NO', name: 'Norsk' },
    { value: 'sv', short: 'SV', name: 'Svenska' },
]

/**
 * Maps any locale-ish string (our own codes, or BCP 47 tags from the
 * browser such as "da-DK", "nb-NO", "en-GB") to a widget locale, or null
 * when we have no translation for it.
 */
export function normalizeWidgetLocale(raw: unknown): WidgetLocale | null {
    if (typeof raw !== 'string') return null
    const primary = raw.trim().toLowerCase().split(/[-_]/)[0]
    switch (primary) {
        case 'dk':
        case 'da':
            return 'dk'
        case 'en':
            return 'en'
        case 'no':
        case 'nb':
        case 'nn':
            return 'no'
        case 'sv':
            return 'sv'
        default:
            return null
    }
}

export function resolveWidgetLocale(options: {
    stored?: unknown
    explicit?: unknown
    browserLanguages?: readonly unknown[]
}): WidgetLocale {
    const stored = normalizeWidgetLocale(options.stored)
    if (stored) return stored

    const explicit = normalizeWidgetLocale(options.explicit)
    if (explicit) return explicit

    for (const language of options.browserLanguages ?? []) {
        const match = normalizeWidgetLocale(language)
        if (match) return match
    }

    return 'en'
}

/** The browser's preferred languages, or [] outside a browser. */
export function browserLanguages(): string[] {
    if (typeof navigator === 'undefined') return []
    if (Array.isArray(navigator.languages) && navigator.languages.length) return [...navigator.languages]
    return navigator.language ? [navigator.language] : []
}

/** Storage can throw (private mode, blocked site data) - never let that break booking. */
export function readStoredWidgetLocale(): string | null {
    try {
        return typeof localStorage === 'undefined' ? null : localStorage.getItem(WIDGET_LOCALE_STORAGE_KEY)
    } catch {
        return null
    }
}

export function storeWidgetLocale(locale: WidgetLocale): void {
    try {
        if (typeof localStorage !== 'undefined') localStorage.setItem(WIDGET_LOCALE_STORAGE_KEY, locale)
    } catch {
        // ignore - the choice just won't survive a reload
    }
}
