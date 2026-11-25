// Roadmap #317: which status types a dose dialog offers.
//
// A company switches status types off under the medicine form settings
// (FormFieldConfig citizen_medicine_history / status_types, read from
// GET /user/form-field-configs). The rules, the same as the backend's
// App\Support\Medicine\MedicineStatusTypes and mirrored by the app:
//
// - Given is always offered (the settings page can't switch it off).
// - Settings not loaded (null), or a type missing from them, count as on.
// - A new dose only offers the types that are on.
// - An existing entry also offers its own type, even if it has since been
//   switched off, so a care worker can correct an old Deviated entry.
//
// Every dose dialog reads the settings through useMedicineStatusTypes()
// (composables/useMedicineStatusTypes.ts), which applies these rules.
//
// Kept dependency-free (no vue / Nuxt auto-imports), like
// composables/medicineSelfAdministration.ts, so tests/unit/*.test.mjs can
// import this .ts file directly under `node --test`.

export type MedicineStatusType = 'given' | 'delivered' | 'deviated'

export type StatusTypeFields = Record<string, boolean> | null | undefined

export const MEDICINE_STATUS_TYPES: readonly MedicineStatusType[] = ['given', 'delivered', 'deviated']

/** Whether a new dose may use this type. */
export function isStatusTypeEnabled(fields: StatusTypeFields, type: string): boolean {
    if (type === 'given') return true
    return fields?.[type] !== false
}

/**
 * The types to offer, in the standard order. Pass the entry's own type
 * (or a list of them) when editing something already logged.
 */
export function offeredStatusTypes(
    fields: StatusTypeFields,
    currentType?: string | null | Array<string | null | undefined>,
): MedicineStatusType[] {
    const own = Array.isArray(currentType) ? currentType : [currentType]
    return MEDICINE_STATUS_TYPES.filter((type) => isStatusTypeEnabled(fields, type) || own.includes(type))
}

/**
 * A dialog's own type options (label, icon, ...) narrowed to the offered
 * types, keeping the dialog's order.
 */
export function statusTypeOptions<T extends { value: string }>(
    fields: StatusTypeFields,
    options: readonly T[],
    currentType?: string | null | Array<string | null | undefined>,
): T[] {
    const offered: string[] = offeredStatusTypes(fields, currentType)
    return options.filter((option) => offered.includes(option.value))
}
