/**
 * Pure helpers for the customer department form, list and WorkZone import.
 * Free of Vue and auto-imports so they can be tested with
 * `node --test tests/unit/customerDepartment.test.mjs`.
 */

const blankToNull = (value: any) => (value === '' || value === undefined ? null : value)

export function emptyDepartmentForm() {
    return {
        // Stamdata
        external_id: '',
        customer_name: '',
        name: '',
        street: '',
        address_line_2: '',
        post_code: '',
        city: '',
        address_type: '',
        municipality_uuid: null as string | null,
        region: '',
        email: '',
        phone: '',
        mobile_phone: '',
        contact_person: '',
        // Okonomi
        ean_number: '',
        customer_number: '',
        customer_group: '',
        customer_division: '',
        has_special_contract: false,
        payment_terms_days: '' as any,
        payment_terms_text: '',
        // Vilkar
        price_regulation: '',
        notice_terms: '',
        // Samarbejde
        cooperation_status: '',
        cooperation_status_date: '',
        cooperation_protection_start: '',
        cooperation_protection_end: '',
        is_active: true,
    }
}

export function formFromDepartment(d: any) {
    const form: any = emptyDepartmentForm()

    if (!d) return form

    for (const key of Object.keys(form)) {
        if (key === 'is_active') {
            form.is_active = d.is_active !== false
        } else if (key === 'has_special_contract') {
            form.has_special_contract = !!d.has_special_contract
        } else if (key === 'municipality_uuid') {
            form.municipality_uuid = d.municipality_uuid ?? null
        } else {
            form[key] = d[key] ?? ''
        }
    }

    return form
}

const TEXT_KEYS = [
    'external_id', 'customer_name', 'street', 'address_line_2', 'post_code', 'city', 'address_type', 'region',
    'email', 'phone', 'mobile_phone', 'contact_person', 'customer_number', 'customer_group', 'customer_division',
    'payment_terms_text', 'price_regulation', 'notice_terms', 'cooperation_status',
    'cooperation_status_date', 'cooperation_protection_start', 'cooperation_protection_end',
]

/** Empty strings go to the server as null, so a cleared field clears. */
export function departmentPayload(form: any) {
    const payload: Record<string, any> = {
        name: form.name,
        municipality_uuid: blankToNull(form.municipality_uuid),
        ean_number: blankToNull(String(form.ean_number ?? '').replace(/\s/g, '')),
        payment_terms_days: blankToNull(form.payment_terms_days) === null ? null : Number(form.payment_terms_days),
        has_special_contract: !!form.has_special_contract,
        is_active: !!form.is_active,
    }

    for (const key of TEXT_KEYS) {
        payload[key] = blankToNull(form[key])
    }

    return payload
}

/** The list filter: name, customer, EAN, customer number and WorkZone id. */
export function filterDepartments(departments: any[], query: string): any[] {
    const needle = query.trim().toLowerCase()

    if (!needle) return departments

    return departments.filter(department =>
        [department.name, department.customer_label, department.customer_name, department.ean_number,
            department.customer_number, department.external_id, department.region]
            .some(value => String(value ?? '').toLowerCase().includes(needle))
    )
}

export function isImportFile(name: string): boolean {
    return /\.(xlsx|xls|csv|txt)$/i.test(name)
}

export const MAX_IMPORT_BYTES = 5 * 1024 * 1024

/** What "Importer N" will write: rows that are created or updated. */
export function applyCount(counts: { create?: number, update?: number } | null | undefined): number {
    return Number(counts?.create ?? 0) + Number(counts?.update ?? 0)
}
