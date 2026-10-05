// The social-welfare contract catalogues and the bulk-send answer, as the API
// sends them. Kept narrow on purpose: new service methods return these, not any.

export type HourBillingBasis = 'delivered' | 'granted'

export interface ContractHourType {
    uuid: string
    name: string
    system_key: 'contact' | 'admin' | 'transport' | null
    economic_product_number: string | null
    billing_basis: HourBillingBasis
    sort_order: number | null
    is_active: boolean
}

export interface PaymentTerm {
    uuid: string
    days: number
    label: string | null
    display_label: string
    sort_order: number | null
    is_active: boolean
}

export type ContractFieldType = 'text' | 'number'

export interface ContractFieldDefinition {
    uuid: string
    label: string
    field_type: ContractFieldType
    show_on_contract: boolean
    show_on_invoice: boolean
    sort_order: number | null
    is_active: boolean
}

export interface DataEnvelope<T> {
    data: T
    message?: string
}

export type BulkSendReason =
    | 'not_found'
    | 'forbidden'
    | 'no_email'
    | 'already_sent'
    | 'not_sendable'
    | 'error'

export interface BulkSendResult {
    uuid: string
    invoice_number: string | null
    status: 'queued' | 'skipped'
    sent_to?: string
    reason?: BulkSendReason
    message?: string
}

export interface BulkSendSummary {
    results: BulkSendResult[]
    queued: number
    skipped: number
}

export type PresetLineKind = 'startup_fee' | 'room_rent' | 'status_report'
export type LineKind = 'custom' | PresetLineKind

export type ReviewItem = 'price' | 'granted_hours' | 'hours_split'
