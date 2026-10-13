/**
 * How a spoken language is named and ordered on screen. Kept free of Vue and
 * of the API so the unit tests can load it on its own (useSpokenLanguages is
 * the composable that screens use).
 *
 * The register carries English and Danish names. Norwegian and Swedish users
 * see the English name until those names are translated.
 */

interface Named {
    name?: string | null
    name_dk?: string | null
}

export function spokenLanguageName(item: Named | null | undefined, locale: string): string {
    if (!item) return ''

    return (locale === 'dk' ? (item.name_dk || item.name) : item.name) || ''
}

/**
 * An inquiry lookup option: its label is the English name, and a spoken
 * language also carries name_dk. Any other register has no name_dk and keeps
 * its label.
 */
export function lookupOptionLabel(option: { label?: string | null, name_dk?: string | null } | null | undefined, locale: string): string {
    if (!option) return ''

    return spokenLanguageName({ name: option.label, name_dk: option.name_dk }, locale)
}

/**
 * Options in the order a reader of the shown names expects, whatever order the
 * server sent: a Danish list puts "Tysk" among the T's, not under "German",
 * and Æ, Ø and Å after Z.
 */
export function sortByLabel<T extends { label: string }>(options: T[], locale: string): T[] {
    const collator = new Intl.Collator(locale === 'dk' ? 'da' : 'en', { sensitivity: 'base' })

    return [...options].sort((a, b) => collator.compare(a.label, b.label))
}

/**
 * Mother tongue first, then the rest by name, as one readable line: "Arabisk
 * (modersmål), Engelsk".
 */
export function spokenLanguageSummaryLine(
    items: (Named & { is_primary?: boolean })[] | null | undefined,
    locale: string,
    motherTongueLabel: string,
): string {
    if (!items?.length) return ''

    const named = items.map((item) => ({ label: spokenLanguageName(item, locale), is_primary: !!item.is_primary }))
    const ordered = [
        ...named.filter((item) => item.is_primary),
        ...sortByLabel(named.filter((item) => !item.is_primary), locale),
    ]

    return ordered
        .map((item) => item.is_primary ? `${item.label} (${motherTongueLabel})` : item.label)
        .join(', ')
}
