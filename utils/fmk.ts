import type { FmkRaw } from '@/types/fmk'

/** Text of an FMK value that may carry attributes ({ '#text': ..., '@source': ... }). */
export function fmkText(value: FmkRaw | null | undefined): string | null {
    if (value === null || value === undefined) return null
    if (typeof value === 'string') return value || null
    const text = (value as any)['#text']
    return typeof text === 'string' && text ? text : null
}

/**
 * Who did something on FMK (modifikator, GK 3.6): an authorised health
 * professional and/or organisation, the citizen themselves, or another person.
 * Returns parts the UI joins, so codes stay findable (GK 3.4).
 */
export function fmkModificator(by: any): { who: string | null, organisation: string | null, authorisation: string | null, isPatient: boolean } {
    if (!by || typeof by !== 'object') return { who: null, organisation: null, authorisation: null, isPatient: false }
    const professional = by.AuthorisedHealthcareProfessional
    const other = by.Other
    const organisation = fmkText(by.Organisation?.Name) ?? fmkText(professional?.Organisation?.Name) ?? fmkText(other?.Organisation?.Name)
    return {
        who: fmkText(professional?.Name) ?? fmkPersonName(other?.Name) ?? fmkText(other?.Role),
        organisation,
        authorisation: fmkText(professional?.AuthorisationIdentifier),
        isPatient: fmkText(by.Patient) === 'true',
    }
}

function fmkPersonName(name: any): string | null {
    if (!name) return null
    if (typeof name === 'string') return name
    return [fmkText(name.GivenName), fmkText(name.Surname)].filter(Boolean).join(' ') || null
}

/** Today's date as YYYY-MM-DD in local time, for comparing FMK dates. */
export function fmkToday(): string {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
