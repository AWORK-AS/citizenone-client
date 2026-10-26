/**
 * The Nexi checkout speaks its own language codes, not ours. Anything we do
 * not recognise reads Danish, which is what every checkout used before this.
 */
const NEXI_LANGUAGES: Record<string, string> = {
    dk: 'da-DK',
    en: 'en-GB',
    no: 'nb-NO',
    sv: 'sv-SE',
}

export function nexiCheckoutLanguage(locale?: string): string {
    return NEXI_LANGUAGES[locale ?? ''] ?? 'da-DK'
}
