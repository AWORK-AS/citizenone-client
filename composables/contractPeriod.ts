/**
 * Pure helpers behind the contract period form: how the hours per type, the
 * three preset lines and the custom fields map to and from the API.
 *
 * Kept free of Vue and of auto-imports so the mapping can be unit tested with
 * `node --test tests/unit/contractPeriod.test.mjs`.
 */
import type { LineKind, PresetLineKind } from '../types/contract'

export const PRESET_KINDS: PresetLineKind[] = ['startup_fee', 'room_rent', 'status_report']

// A start-up fee and a status report are billed once, room rent every period.
export const PRESET_DEFAULT_RECURRENCE: Record<PresetLineKind, 'one_off' | 'recurring'> = {
    startup_fee: 'one_off',
    room_rent: 'recurring',
    status_report: 'one_off',
}

export interface HourEntry {
    hour_type_uuid: string
    selected: boolean
    hours: number | string | null
}

export interface PresetState {
    enabled: boolean
    uuid: string | null
    description: string
    amount: number | string
    recurrence: 'one_off' | 'recurring'
    economic_product_number: string
}

export type PresetStates = Record<PresetLineKind, PresetState>

const numberOrNull = (value: any): number | null =>
    value === '' || value === null || value === undefined ? null : Number(value)

const textOrNull = (value: any): string | null =>
    value === '' || value === undefined || value === null ? null : String(value)

export function blankPreset(kind: PresetLineKind): PresetState {
    return {
        enabled: false,
        uuid: null,
        description: '',
        amount: '',
        recurrence: PRESET_DEFAULT_RECURRENCE[kind],
        economic_product_number: '',
    }
}

export function blankPresets(): PresetStates {
    return {
        startup_fee: blankPreset('startup_fee'),
        room_rent: blankPreset('room_rent'),
        status_report: blankPreset('status_report'),
    }
}

/**
 * The hours a period grants, one entry per type. A period from before hour
 * types existed (or the stay's fallback) only carries the three legacy fields,
 * which belong to the system types.
 */
export function hourEntriesFromPeriod(source: any, hourTypes: Array<{ uuid: string, system_key: string | null }>): HourEntry[] {
    if (!source) return []

    if (Array.isArray(source.hours)) {
        return source.hours.map((row: any) => ({
            hour_type_uuid: row.hour_type_uuid,
            selected: true,
            hours: row.hours ?? '',
        }))
    }

    const legacy: Array<[string, any]> = [
        ['contact', source.contact_hours],
        ['admin', source.admin_hours],
        ['transport', source.transport_hours],
    ]

    return legacy.flatMap(([key, hours]) => {
        const type = hourTypes.find(item => item.system_key === key)

        if (!type || hours === null || hours === undefined || hours === '') return []

        return [{ hour_type_uuid: type.uuid, selected: true, hours }]
    })
}

/** Only the ticked types are sent; the API replaces the whole set. */
export function hoursPayload(entries: HourEntry[]): Array<{ hour_type_uuid: string, hours: number }> {
    return entries
        .filter(entry => entry.selected)
        .map(entry => ({ hour_type_uuid: entry.hour_type_uuid, hours: Number(entry.hours || 0) }))
}

export function grantedTotal(entries: HourEntry[]): number {
    return Math.round(entries.filter(entry => entry.selected)
        .reduce((sum, entry) => sum + Number(entry.hours || 0), 0) * 100) / 100
}

/** Splits a period's lines into the three presets and the custom ones. */
export function splitLines(lines: any[], asNew: boolean): { presets: PresetStates, custom: any[] } {
    const presets = blankPresets()
    const custom: any[] = []

    for (const line of lines ?? []) {
        // A copied one-off fee has usually been billed already, so only the
        // recurring lines travel into a new period.
        if (asNew && line.recurrence !== 'recurring') continue

        const kind = (line.kind ?? 'custom') as LineKind

        if (kind !== 'custom' && (PRESET_KINDS as string[]).includes(kind)) {
            presets[kind as PresetLineKind] = {
                enabled: true,
                uuid: asNew ? null : line.uuid,
                description: line.description ?? '',
                amount: line.amount,
                recurrence: line.recurrence,
                economic_product_number: line.economic_product_number ?? '',
            }
        } else {
            custom.push(line)
        }
    }

    return { presets, custom }
}

/** Presets first (in a fixed order), then the custom lines as they were typed. */
export function linesPayload(presets: PresetStates, custom: any[]): any[] {
    const preset = PRESET_KINDS
        .filter(kind => presets[kind].enabled)
        .map(kind => ({
            uuid: presets[kind].uuid,
            kind,
            // A preset has no text field: the API writes its translated name,
            // so the line follows the language of whoever saves it.
            description: null,
            amount: Number(presets[kind].amount),
            recurrence: presets[kind].recurrence,
            economic_product_number: textOrNull(presets[kind].economic_product_number),
        }))

    const own = custom.map(line => ({
        uuid: line.uuid ?? null,
        kind: 'custom',
        description: line.description,
        amount: Number(line.amount),
        recurrence: line.recurrence,
        economic_product_number: textOrNull(line.economic_product_number),
    }))

    return [...preset, ...own]
}

/** Values keyed by field uuid, from the period's `custom_fields`. */
export function customFieldValues(source: any): Record<string, string | number | null> {
    const values: Record<string, string | number | null> = {}

    for (const field of source?.custom_fields ?? []) {
        values[field.field_uuid] = field.value ?? null
    }

    return values
}

/** An empty input is sent as null so a cleared value is cleared. */
export function customFieldsPayload(
    definitions: Array<{ uuid: string, field_type: string }>,
    values: Record<string, any>,
): Array<{ field_uuid: string, value: string | number | null }> {
    return definitions.map(definition => {
        const raw = values[definition.uuid]

        return {
            field_uuid: definition.uuid,
            value: definition.field_type === 'number' ? numberOrNull(raw) : textOrNull(raw),
        }
    })
}
