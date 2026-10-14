/**
 * Pure helpers for special prices (særpriser): what one customer department
 * pays per hour for an indsatstype, kept on the customer and used by an offer
 * for that customer. Free of Vue and auto-imports so they can be tested with
 * `node --test tests/unit/customerSpecialPrice.test.mjs`.
 */

const blankToNull = (value: any) => (value === '' || value === undefined || value === null ? null : value)

/** A typed amount as a number; "650,50" is read as 650.50. Text is kept, so the server says what is wrong. */
function amount(value: any): number | string | null {
    const text = String(blankToNull(value) ?? '').trim()

    if (text === '') return null

    const parsed = Number(text.replace(',', '.'))

    return Number.isFinite(parsed) ? parsed : text
}

/** How a customer department reads in one line, as the contract period shows it. */
export function customerLabel(department: any): string {
    return [department?.customer_label, department?.name].filter(Boolean).join(', ')
}

/**
 * The customers an offer can be for: the active ones, plus the one already
 * chosen if it has been made inactive since, so an older offer still shows it.
 */
export function customerChoices(departments: any[], selectedUuid: string | null): { value: string, label: string }[] {
    return (departments ?? [])
        .filter(department => department?.uuid && (department.is_active !== false || department.uuid === selectedUuid))
        .map(department => ({ value: department.uuid, label: customerLabel(department) }))
}

/**
 * The customer to send with a calculation: only one still in the list, so a
 * customer deleted since an older offer is dropped instead of refused.
 */
export function knownCustomerUuid(uuid: string | null | undefined, departments: any[]): string | null {
    if (!uuid) return null

    return (departments ?? []).some(department => department?.uuid === uuid) ? uuid : null
}

const RATE_KEYS = ['hourly_rate', 'admin_hourly_rate', 'transport_hourly_rate']

/** Whether a calculation used the customer's special price for any of the three hourly rates. */
export function specialPriceApplies(result: any): boolean {
    return (result?.assumptions ?? []).some((item: any) => RATE_KEYS.includes(item?.key) && item?.source === 'customer')
}

/** A new, empty row; the start date defaults to the given day. */
export function emptySpecialPriceRow(today: string) {
    return {
        uuid: '',
        inquiry_service_type_uuid: null as string | null,
        valid_from: today,
        hourly_rate: '',
        admin_hourly_rate: '',
        transport_hourly_rate: '',
        note: '',
    }
}

/** A saved special price as an editable row; missing amounts become empty fields. */
export function specialPriceRow(price: any) {
    const text = (value: any) => (value === null || value === undefined ? '' : String(value))

    return {
        uuid: price?.uuid ?? '',
        inquiry_service_type_uuid: price?.service_type?.uuid ?? null,
        valid_from: price?.valid_from ?? '',
        hourly_rate: text(price?.hourly_rate),
        admin_hourly_rate: text(price?.admin_hourly_rate),
        transport_hourly_rate: text(price?.transport_hourly_rate),
        note: price?.note ?? '',
    }
}

/** The body the special-price endpoints take: every field, blanks as null. */
export function specialPricePayload(row: any) {
    const note = String(row?.note ?? '').trim()

    return {
        inquiry_service_type_uuid: blankToNull(row?.inquiry_service_type_uuid),
        valid_from: blankToNull(row?.valid_from),
        hourly_rate: amount(row?.hourly_rate),
        admin_hourly_rate: amount(row?.admin_hourly_rate),
        transport_hourly_rate: amount(row?.transport_hourly_rate),
        note: note === '' ? null : note,
    }
}

/** "1.234,50 kr." the way the offer shows amounts, or '' for none. */
export function formatPrice(value: any): string {
    if (value === null || value === undefined || value === '') return ''

    return Number(value).toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' kr.'
}
