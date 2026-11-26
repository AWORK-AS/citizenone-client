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

/**
 * Whether a row still needs the staff member: FMK and CitizenOne differ, or a
 * medicine taken over from FMK is a draft without a dosage plan.
 */
export function fmkNeedsAction(row: { status: string, local: { is_draft: boolean } | null }): boolean {
    return row.status !== 'same' || row.local?.is_draft === true
}

export type FmkDifferenceField = 'strength' | 'reason' | 'start' | 'end'

export interface FmkFieldDifference {
    field: FmkDifferenceField
    fmk: string | null
    local: string | null
}

/**
 * The fields where CitizenOne differs from FMK on the same row, so staff see
 * what to correct without comparing both sides themselves. Strength compares
 * the number only (CitizenOne keeps the unit apart); dates as YYYY-MM-DD.
 */
export function fmkDifferences(row: {
    fmk: { strength: string | null, indication: string | null, treatment_start: string | null, treatment_end: string | null } | null
    local: { strength: string | null, treatment_reason: string | null, start_date: string | null, end_date: string | null } | null
}): FmkFieldDifference[] {
    const { fmk, local } = row
    if (!fmk || !local) return []

    const list: FmkFieldDifference[] = []
    const text = (v: string | null) => (v ?? '').trim().toLowerCase().replace(/\s+/g, ' ')
    const day = (v: string | null) => (v ? v.slice(0, 10) : '')
    const number = (v: string | null) => {
        const match = (v ?? '').match(/\d+(?:[.,]\d+)?/)
        return match ? String(Number(match[0].replace(',', '.'))) : text(v)
    }

    if (fmk.strength && number(fmk.strength) !== number(local.strength)) list.push({ field: 'strength', fmk: fmk.strength, local: local.strength })
    if (fmk.indication && text(fmk.indication) !== text(local.treatment_reason)) list.push({ field: 'reason', fmk: fmk.indication, local: local.treatment_reason })
    if (fmk.treatment_start && day(fmk.treatment_start) !== day(local.start_date)) list.push({ field: 'start', fmk: day(fmk.treatment_start), local: day(local.start_date) || null })
    if (day(fmk.treatment_end) !== day(local.end_date)) list.push({ field: 'end', fmk: day(fmk.treatment_end) || null, local: day(local.end_date) || null })

    return list
}
