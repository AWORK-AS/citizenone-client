const KB = 1024
const MB = 1024 ** 2
const GB = 1024 ** 3

const LOCALES: Record<string, string> = { dk: 'da-DK', da: 'da-DK', en: 'en-GB', no: 'nb-NO', sv: 'sv-SE' }

/** Maps an app locale code (dk/en/no/sv) to a BCP 47 tag for number formatting. */
export function storageLocale(appLocale?: string): string {
    return LOCALES[appLocale ?? ''] ?? appLocale ?? 'da-DK'
}

/**
 * Storage usage for display. Below 1 GB the figure is whole megabytes, so a
 * small account visibly moves (GB with two decimals only changes per ~10 MB);
 * from 1 GB it is gigabytes with up to two decimals. Under 1 MB: "<1 MB".
 */
export function formatStorage(bytes: any, locale = 'da-DK'): string {
    const value = Math.max(0, Number(bytes) || 0)

    if (value >= GB) {
        return `${(value / GB).toLocaleString(locale, { maximumFractionDigits: 2 })} GB`
    }
    if (value > 0 && value < MB) {
        return '<1 MB'
    }

    return `${Math.round(value / MB).toLocaleString(locale)} MB`
}

/**
 * Prefers the exact byte count and falls back to the rounded GB field, so the
 * screens keep working against a backend that does not send bytes yet.
 */
export function formatStorageUsed(bytes: any, gb: any, locale = 'da-DK'): string {
    if (bytes !== null && bytes !== undefined && bytes !== '' && !Number.isNaN(Number(bytes))) {
        return formatStorage(bytes, locale)
    }

    return `${Number(gb ?? 0).toLocaleString(locale, { maximumFractionDigits: 2 })} GB`
}

/** Quotas are whole or half gigabytes, so they stay in GB. */
export function formatQuotaGb(gb: any, locale = 'da-DK'): string {
    return `${Number(gb ?? 0).toLocaleString(locale, { maximumFractionDigits: 2 })} GB`
}

export { KB as STORAGE_KB, MB as STORAGE_MB, GB as STORAGE_GB }
