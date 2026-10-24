/**
 * Pure helpers for the filters on a citizen's Indsatstimer: hour types, work
 * or transport, and who registered the time. The list, the totals and the
 * download send the same filters, so they always show the same rows. Free of
 * Vue and auto-imports so they can be tested with
 * `node --test tests/unit/careHourFilters.test.mjs`.
 */

export type CareHourFilters = {
    /** Hour type uuids; 'none' is rows without a type. */
    types: string[]
    kind: '' | 'work' | 'transport'
    /** Uuids of the employees who registered the time. */
    users: string[]
}

export const NO_HOUR_TYPE = 'none'

export function emptyCareHourFilters(): CareHourFilters {
    return { types: [], kind: '', users: [] }
}

/** How many filters are set, for "Ryd filtre" and the download note. */
export function activeCareHourFilterCount(filters: CareHourFilters): number {
    return (filters.types.length ? 1 : 0) + (filters.kind ? 1 : 0) + (filters.users.length ? 1 : 0)
}

/**
 * The query the API reads. Arrays go as `name[]`, as Laravel reads a list;
 * nothing is sent for a filter that is not set.
 */
export function careHourFilterParams(filters: CareHourFilters): Record<string, string | string[]> {
    const params: Record<string, string | string[]> = {}
    if (filters.types.length) params['hour_type_uuids[]'] = [...filters.types]
    if (filters.kind) params.kind = filters.kind
    if (filters.users.length) params['user_uuids[]'] = [...filters.users]
    return params
}

/** The hour type picker's options: the company's types, then "without a type". */
export function hourTypeFilterOptions(types: { uuid: string, name: string }[], withoutTypeLabel: string): { value: string, label: string }[] {
    return [
        ...(types ?? []).map((type) => ({ value: type.uuid, label: type.name })),
        { value: NO_HOUR_TYPE, label: withoutTypeLabel },
    ]
}

/**
 * What a row's type badge says: its hour type, else work or transport as
 * before.
 */
export function careHourTypeLabel(row: any, workLabel: string, transportLabel: string): string {
    return row?.contract_hour_type?.name || (row?.is_transportation ? transportLabel : workLabel)
}

/** A line in "hours per type": the type's name, else work or transport. */
export function hoursByTypeLabel(entry: { name: string | null, is_transportation: boolean }, workLabel: string, transportLabel: string): string {
    return entry?.name || (entry?.is_transportation ? transportLabel : workLabel)
}
