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

export type FmkHistoryField = 'drug' | 'strength' | 'form' | 'dosage' | 'paused'

export interface FmkHistoryChange {
    field: FmkHistoryField
    before: string | null
    after: string | null
}

interface HistoryPeriod {
    version: string | null
    drug_name: string | null
    form: string | null
    strength: string | null
    dosage_free_text: string | null
    dosage_type: string | null
    dosage_by_local_schema: boolean
    paused: { from: string | null, to: string | null } | null
}

/**
 * What changed in FMK between the version CitizenOne is based on and the
 * newest version. Falls back to the version before the newest when ours is
 * not in the history. Dates in a pause stay YYYY-MM-DD for the UI to format.
 */
export function fmkHistoryChanges(periods: HistoryPeriod[], fromVersion: string | null): { from: string | null, to: string | null, changes: FmkHistoryChange[] } {
    if (periods.length === 0) return { from: null, to: null, changes: [] }
    const latest = periods[periods.length - 1]
    const base = periods.find(p => p.version === fromVersion) ?? periods[periods.length - 2] ?? null
    if (!base || base === latest) return { from: base?.version ?? null, to: latest.version, changes: [] }

    const dosage = (p: HistoryPeriod) => (p.dosage_by_local_schema ? 'local-schema' : p.dosage_free_text ?? p.dosage_type ?? null)
    const pause = (p: HistoryPeriod) => (p.paused ? `${p.paused.from ?? ''}|${p.paused.to ?? ''}` : null)
    const same = (a: string | null, b: string | null) => (a ?? '').trim().toLowerCase() === (b ?? '').trim().toLowerCase()

    const fields: [FmkHistoryField, (p: HistoryPeriod) => string | null][] = [
        ['drug', p => p.drug_name],
        ['strength', p => p.strength],
        ['form', p => p.form],
        ['dosage', dosage],
        ['paused', pause],
    ]
    const changes = fields
        .filter(([, read]) => !same(read(base), read(latest)))
        .map(([field, read]) => ({ field, before: read(base), after: read(latest) }))

    return { from: base.version, to: latest.version, changes }
}

/**
 * An organisation as FMK sends it: name, identifier with its source (SKS,
 * SOR, yder number, CVR) and phone, so staff can call (GK 3.7.1, 3.17).
 */
export function fmkOrganisation(org: any): { name: string | null, identifier: string | null, phone: string | null } {
    if (!org || typeof org !== 'object') return { name: null, identifier: null, phone: null }
    const id = org.Identifier
    const source = id && typeof id === 'object' ? id['@source'] : null
    const value = fmkText(id)
    return {
        name: fmkText(org.Name),
        identifier: value ? [source, value].filter(Boolean).join(' ') : null,
        phone: fmkText(org.TelephoneNumber),
    }
}

/**
 * A patient-organisation relation on the medicine card (GK 3.7.1, 3.17).
 * "Indlagt" means the citizen is admitted to hospital, which must stand out;
 * other types (e.g. "Visiteret til hjemmesygeplejen") say who else gives the
 * citizen medicine.
 */
export function fmkRelation(relation: any): { admitted: boolean, type: string | null, organisation: ReturnType<typeof fmkOrganisation> } {
    const type = fmkText(relation?.Type)
    return {
        admitted: (type ?? '').trim().toLowerCase() === 'indlagt',
        type,
        organisation: fmkOrganisation(relation?.Organisation),
    }
}
