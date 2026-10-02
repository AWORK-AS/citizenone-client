/**
 * Company agreements (binding period, billing plan, contract value).
 *
 * Mirrors the superadmin API contract. Amounts are numbers in DKK, excl. VAT.
 * Agreement data is internal: it is never returned by a customer endpoint and
 * must never be rendered on a customer-facing page.
 */
export type BillingPlan = 'monthly' | 'yearly' | 'prepaid_multi_year' | 'installments'
export type AgreementPaymentMethod = 'bank_transfer' | 'card'
export type AgreementStatus = 'active' | 'ended' | 'cancelled'

export interface AgreementInstallmentInvoice {
    uuid: string
    invoice_number: string
    is_paid: boolean
    paid_at: string | null
    total_amount_incl_vat: number
}

export interface AgreementInstallment {
    uuid: string
    sequence: number
    due_on: string
    amount: number
    label: string | null
    invoice: AgreementInstallmentInvoice | null
    /** Settled outside CitizenOne (e.g. in e-conomic): never invoiced. */
    settled_externally_at: string | null
    settled_note: string | null
}

/** A planned installment as sent to / returned by the API before it is saved. */
export interface InstallmentInput {
    due_on: string
    amount: number
    label: string | null
}

export interface AgreementSubscription {
    uuid: string
    type: string
    label: string
    user_name: string | null
}

export interface LinkableSubscription {
    uuid: string
    type: string
    label: string
    deal_type: 'deal' | 'add_on_deal' | 'application'
    user_name: string | null
    /** Set when the subscription already belongs to an agreement. */
    company_agreement_uuid: string | null
}

export interface SchedulePreview {
    installments: InstallmentInput[]
    ends_on?: string
    notice_deadline?: string
    contract_value?: number
    contract_mrr?: number
    contract_arr?: number
    total?: number
}

export interface InstallmentPreset {
    upfront_percent: number
    remaining_count: number
    remaining_interval_months: number
}

export interface Agreement {
    uuid: string
    company_uuid: string
    name: string
    starts_on: string
    ends_on: string
    term_months: number
    notice_months: number
    notice_deadline: string
    auto_renews: boolean
    billing_plan: BillingPlan
    prepaid_years: number | null
    contract_value: number
    fee_per_invoice: number
    payment_method: AgreementPaymentMethod
    status: AgreementStatus
    cancelled_at: string | null
    internal_note: string | null
    settled_externally_before?: string | null
    settled_note?: string | null
    contract_mrr: number
    contract_arr: number
    invoiced_total: number
    paid_total: number
    backlog: number
    installments: AgreementInstallment[]
    subscriptions: AgreementSubscription[]
    created_at: string
}

/** Body of POST / PUT /superadmin/.../agreements and of preview-schedule. */
export interface AgreementPayload {
    name: string
    starts_on: string
    term_months: number
    notice_months: number
    auto_renews: boolean
    billing_plan: BillingPlan
    prepaid_years: number | null
    contract_value: number
    fee_per_invoice: number
    payment_method: AgreementPaymentMethod
    internal_note: string | null
    settled_externally_before: string | null
    settled_note: string | null
    installment_preset: InstallmentPreset | null
    installments: InstallmentInput[] | null
}

export interface RegisterPaymentPayload {
    paid_at: string
    paid_amount: number
    payment_note: string | null
}

export interface BindingsEnding {
    within_3_months: number
    within_6_months: number
    within_12_months: number
}
