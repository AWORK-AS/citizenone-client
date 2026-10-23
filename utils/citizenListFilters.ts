// The properties the citizen list can be filtered on, in one place.
//
// The filter panel, the chips above the list and the saved filter are all
// built from this list, in this order. To offer a filter, add an entry here
// (and the key to CitizenListFilters on the backend, which decides what the
// server applies). To take one away, remove it here and there.
//
// `field` is the citizen card field (English name, as the settings store it)
// whose value the filter would reveal. Someone the company has not given that
// field does not get the filter; the server ignores it for them anyway.

export type CitizenListFilterType = 'select' | 'date' | 'number' | 'text' | 'checkbox'

/** Where a select's options come from: a list fetched from the API, or fixed values. */
export type CitizenListFilterOptions =
    | 'employees' | 'municipalities' | 'regions' | 'sections' | 'spokenLanguages' | 'genders'
    | 'coordinatorRoles' | 'phases' | 'startupStatuses' | 'riskLevels' | 'yesNo'

export interface CitizenListFilter {
    key: string
    label: string
    type: CitizenListFilterType
    options?: CitizenListFilterOptions
    /** Filters with the same group sit side by side, e.g. a from/to pair. */
    group?: string
    field?: string
}

export const CITIZEN_LIST_FILTERS: CitizenListFilter[] = [
    { key: 'phase', label: 'citizens.table.phase', type: 'select', options: 'phases' },
    { key: 'startup_status', label: 'citizens.table.startupStatus', type: 'select', options: 'startupStatuses' },
    { key: 'coordinator', label: 'citizens.coordinators.title', type: 'select', options: 'employees' },
    { key: 'coordinator_role', label: 'citizens.filters.coordinatorRole', type: 'select', options: 'coordinatorRoles' },
    { key: 'consultant', label: 'citizens.filters.consultant', type: 'select', options: 'employees' },
    { key: 'case_worker', label: 'citizens.filters.caseWorker', type: 'text' },
    { key: 'municipality_uuid', label: 'citizens.table.municipality', type: 'select', options: 'municipalities' },
    { key: 'paying_municipality_uuid', label: 'citizens.filters.payingMunicipality', type: 'select', options: 'municipalities' },
    { key: 'section_uuid', label: 'citizens.table.section', type: 'select', options: 'sections' },
    { key: 'region_uuid', label: 'citizens.filters.region', type: 'select', options: 'regions', field: 'Address' },
    { key: 'has_case_number', label: 'citizens.filters.hasCaseNumber', type: 'select', options: 'yesNo' },
    { key: 'admitted_from', label: 'citizens.filters.admittedFrom', type: 'date', group: 'admitted' },
    { key: 'admitted_to', label: 'citizens.filters.admittedTo', type: 'date', group: 'admitted' },
    { key: 'discharged_from', label: 'citizens.filters.dischargedFrom', type: 'date', group: 'discharged' },
    { key: 'discharged_to', label: 'citizens.filters.dischargedTo', type: 'date', group: 'discharged' },
    { key: 'contract_start_from', label: 'citizens.filters.contractStartFrom', type: 'date', group: 'contractStart' },
    { key: 'contract_start_to', label: 'citizens.filters.contractStartTo', type: 'date', group: 'contractStart' },
    { key: 'contract_end_from', label: 'citizens.filters.contractEndFrom', type: 'date', group: 'contractEnd' },
    { key: 'contract_end_to', label: 'citizens.filters.contractEndTo', type: 'date', group: 'contractEnd' },
    { key: 'weekly_hours_from', label: 'citizens.filters.weeklyHoursFrom', type: 'number', group: 'weeklyHours' },
    { key: 'weekly_hours_to', label: 'citizens.filters.weeklyHoursTo', type: 'number', group: 'weeklyHours' },
    { key: 'risk_level', label: 'citizens.filters.riskLevel', type: 'select', options: 'riskLevels' },
    { key: 'gender', label: 'citizens.form.gender', type: 'select', options: 'genders' },
    { key: 'spoken_language', label: 'citizens.filters.spokenLanguage', type: 'select', options: 'spokenLanguages' },
    { key: 'requires_interpreter', label: 'citizens.filters.requiresInterpreter', type: 'checkbox' },
]

/** The filters this person may use. */
export function availableCitizenListFilters(maySeeField: (field: string) => boolean): CitizenListFilter[] {
    return CITIZEN_LIST_FILTERS.filter((filter) => !filter.field || maySeeField(filter.field))
}

/**
 * Only the offered keys with a value set. Used both for what is sent to the
 * list and for what is saved, so a key taken off the list is dropped from a
 * saved filter the next time it is read.
 */
export function activeCitizenListFilters(filter: Record<string, any> | null | undefined, offered: CitizenListFilter[] = CITIZEN_LIST_FILTERS): Record<string, any> {
    const keys = new Set(offered.map((item) => item.key))
    const active: Record<string, any> = {}
    for (const [key, value] of Object.entries(filter ?? {})) {
        if (!keys.has(key)) continue
        if (value === null || value === undefined || value === '' || value === false) continue
        active[key] = value
    }

    return active
}
