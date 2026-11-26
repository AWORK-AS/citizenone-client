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
    // Withdrawn in FMK only matters while CitizenOne still has the medicine.
    if (row.status === 'withdrawn_in_fmk') return row.local !== null
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
    dosage_text?: { short: string | null, long: string | null } | null
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

    const dosage = (p: HistoryPeriod) => (p.dosage_by_local_schema ? 'local-schema' : p.dosage_free_text ?? p.dosage_text?.long ?? p.dosage_text?.short ?? p.dosage_type ?? null)
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

interface DosagePeriodLike {
    start: string | null
    end: string | null
    undetermined: boolean
    iteration_days: number | null
    empty: boolean
}

function periodIsCurrent(p: DosagePeriodLike, today: string): boolean {
    return (p.start ?? '') <= today && (p.undetermined || !p.end || p.end >= today)
}

/**
 * Which dosage period applies today (GK 5.3), the periods after it that must
 * be findable (GK 5.4), and, when none applies, whether the dosage is in the
 * future or has ended (GK 5.8).
 */
export function fmkDosageNow<P extends DosagePeriodLike>(periods: P[], today: string): {
    state: 'current' | 'future' | 'ended' | 'none', current: P | null, later: P[], nextStart: string | null, lastEnd: string | null
} {
    const current = periods.find(p => periodIsCurrent(p, today)) ?? null
    const later = periods.filter(p => (p.start ?? '') > today)
    const ends = periods.map(p => p.end).filter((e): e is string => Boolean(e)).sort()
    const state = current ? 'current' : later.length ? 'future' : periods.length ? 'ended' : 'none'
    return { state, current, later, nextStart: later[0]?.start ?? null, lastEnd: ends[ends.length - 1] ?? null }
}

/** Monday of the ISO week of a YYYY-MM-DD date, as YYYY-MM-DD. */
function weekStart(day: string): string {
    const d = new Date(`${day}T12:00:00`)
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * GK 5.2.1 for vitamin K antagonists: say that a week schedule repeats (not
 * when treatment ends this week), say "dosage after this is not given" after
 * a start-up/adjustment course without a repeating schedule after it, and
 * flag a dosage end date that has passed.
 */
export function fmkVkaNotes(periods: DosagePeriodLike[], today: string, treatmentEnd: string | null): { repeats: boolean, notSpecifiedAfter: boolean, endPassed: boolean } {
    const { current } = fmkDosageNow(periods, today)
    const endsThisWeek = Boolean(treatmentEnd) && weekStart(treatmentEnd!) === weekStart(today)
    const repeats = Boolean(current && current.iteration_days === 7 && !endsThisWeek)
    const last = periods[periods.length - 1]
    const notSpecifiedAfter = Boolean(last && !last.undetermined && last.end && !last.iteration_days)
    const endPassed = Boolean(last && !last.undetermined && last.end && last.end < today)
    return { repeats, notSpecifiedAfter, endPassed }
}

const OPEN_PRESCRIPTION_STATUSES = ['åben', 'delvist udleveret', 'under behandling', 'web ekspederet']

/**
 * GK 6.3/6.4: whether a prescription can still be dispensed, and whether it
 * is a future one (open, valid from a later date), which must stand out.
 */
export function fmkPrescriptionState(p: { status: string | null, valid_from: string | null, valid_to: string | null }, today: string): { open: boolean, future: boolean, expired: boolean } {
    const open = OPEN_PRESCRIPTION_STATUSES.includes((p.status ?? '').toLowerCase())
    return {
        open,
        future: open && Boolean(p.valid_from) && p.valid_from! > today,
        expired: Boolean(p.valid_to) && p.valid_to! < today,
    }
}

/**
 * GK 3.15: the follow-up date that has passed (shown as overdue) and the next
 * one to come.
 */
export function fmkFollowUp(dates: string[], today: string): { overdue: string | null, next: string | null } {
    const past = dates.filter(d => d < today)
    return { overdue: past[past.length - 1] ?? null, next: dates.find(d => d >= today) ?? null }
}

/**
 * GK 16.1: suggested receivers for a prescription request, taken from the
 * card: the organisation that created the drug medication and those that
 * issued its prescriptions, when FMK gave their identifier (yder number, SOR
 * or SKS). Staff can always type another one.
 */
/**
 * The citizen's own GP first (from the CPR register), then who created the
 * medication or its prescriptions; the GP is not listed twice.
 */
export function fmkWithOwnGp<T extends { id_source: string, id: string }>(gp: { yder: string | null, name: string | null } | null | undefined, list: T[]): (T | { name: string, type: 'Yder', id_source: 'Yder', id: string, own: true })[] {
    if (!gp?.yder || !gp.name) return list
    const yder = gp.yder.replace(/^0+/, '')
    return [{ name: gp.name, type: 'Yder', id_source: 'Yder', id: gp.yder, own: true }, ...list.filter(s => !(s.id_source === 'Yder' && s.id.replace(/^0+/, '') === yder))]
}

export function fmkAddresseeSuggestions(medication: { created: any, prescription_list?: { created: any }[] }): { name: string, type: 'Yder' | 'Sygehus' | 'Kommune', id_source: 'Yder' | 'SOR' | 'SKS', id: string }[] {
    const sources = [medication.created, ...(medication.prescription_list ?? []).map(p => p.created)]
    const seen = new Set<string>()
    const list: { name: string, type: 'Yder' | 'Sygehus' | 'Kommune', id_source: 'Yder' | 'SOR' | 'SKS', id: string }[] = []
    for (const entry of sources) {
        const by = entry?.By
        const org = by?.Organisation ?? by?.AuthorisedHealthcareProfessional?.Organisation
        const id = org?.Identifier
        const value = fmkText(id)
        const source = id && typeof id === 'object' ? id['@source'] : null
        const name = fmkText(org?.Name)
        if (!name || !value || !['Yder', 'SOR', 'SKS'].includes(source)) continue
        const key = `${source}:${value}`
        if (seen.has(key)) continue
        seen.add(key)
        list.push({ name, type: source === 'SKS' ? 'Sygehus' : 'Yder', id_source: source, id: value })
    }
    return list
}

/**
 * GK 16.2/16.5: pharmacies to suggest for an order, from the card: those
 * that dispensed the citizen's medicine and the dose dispensing pharmacy,
 * when FMK gave an identifier the order can use (SOR, EAN or CVR-P).
 */
export function fmkPharmacySuggestions(card: { drug_medications: { effectuation_list?: { created: any }[], prescription_list?: { effectuations?: { created: any }[] }[] }[], dose_dispensing_summary?: { ordered_at_pharmacy: any } | null }): { name: string, id_source: 'SOR' | 'EAN-Lokationsnummer' | 'CVR-P', id: string }[] {
    const orgs: any[] = [card.dose_dispensing_summary?.ordered_at_pharmacy]
    for (const m of card.drug_medications) {
        for (const e of m.effectuation_list ?? []) orgs.push(e.created?.By?.Organisation)
        for (const p of m.prescription_list ?? []) for (const e of p.effectuations ?? []) orgs.push(e.created?.By?.Organisation)
    }
    const seen = new Set<string>()
    const list: { name: string, id_source: 'SOR' | 'EAN-Lokationsnummer' | 'CVR-P', id: string }[] = []
    for (const org of orgs) {
        const id = org?.Identifier
        const value = fmkText(id)
        const source = id && typeof id === 'object' ? id['@source'] : null
        const name = fmkText(org?.Name)
        if (!name || !value || !['SOR', 'EAN-Lokationsnummer', 'CVR-P'].includes(source) || seen.has(`${source}:${value}`)) continue
        seen.add(`${source}:${value}`)
        list.push({ name, id_source: source, id: value })
    }
    return list
}
