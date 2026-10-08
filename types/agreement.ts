/**
 * Company agreements (binding period, billing plan, contract value).
 *
 * Mirrors the superadmin API contract. Amounts are numbers in DKK, excl. VAT.
 * Agreement data is internal: it is never returned by a customer endpoint and
 * must never be rendered on a customer-facing page.
 */
export type BillingPlan = 'monthly' | 'yearly' | 'prepaid_multi_year' | 'installments'
export type AgreementPaymentMethod = 'bank_transfer' | 'card'
export type RenewalValueSource = 'list_price' | 'override' | 'fallback'
export type AgreementStatus = 'active' | 'ended' | 'cancelled'

export interface AgreementInstallmentInvoice {
    uuid: string
    invoice_number: string
    is_paid: boolean
    paid_at: string | null
    total_amount_incl_vat: number
    economic_draft_number?: number | string | null
    economic_invoice_number?: number | string | null
    economic_sync_state?: string | null
    economic_sync_error?: string | null
    type?: string | null
    linked_to_installment?: boolean
    paid_source?: string | null
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
    /** Period the row counts towards contract MRR; the backend fills it when null. */
    covers_from?: string | null
    covers_to?: string | null
    product_number?: number | null
    quantity?: number | null
    unit_price?: number | null
}

/** A planned installment as sent to / returned by the API before it is saved. */
export interface InstallmentInput {
    due_on: string
    amount: number
    label: string | null
    covers_from?: string | null
    covers_to?: string | null
    /** Add-on (tilkoeb) row: shows product number, quantity and unit price. */
    is_add_on?: boolean
    /** UI only, never sent: the user typed covers_from, so it stops following due_on. */
    covers_from_manual?: boolean
    product_number?: number | string | null
    quantity?: number | string | null
    unit_price?: number | string | null
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

export interface CoveredInvoice {
    uuid: string
    invoice_number: string
    total_amount?: number
    is_paid?: boolean
    created_at?: string
}

/** How the renewal is invoiced; null follows the payment plan. */
export type RenewalBilling = 'upfront' | 'yearly' | 'monthly' | 'by_agreement'

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
    renewal_annual_value: number | null
    /** Where `estimated_renewal_annual_value` comes from. */
    renewal_value_source?: RenewalValueSource
    estimated_renewal_annual_value?: number | null
    /** Months a renewal runs for; null means 12. */
    renewal_term_months?: number | null
    renewal_billing?: RenewalBilling | null
    estimated_renewal_period_value?: number | null
    /** A renewal is agreed but its installment plan is not entered yet (renewal_billing 'by_agreement'). */
    renewal_plan_missing?: boolean
    renewal_plan_due?: string | null
    /** Contract MRR includes a renewal that is not planned yet. */
    contract_mrr_estimated?: boolean
    renewals_count: number
    covered_invoices?: CoveredInvoice[]
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
    /** Omitted when the binding is given as an end date (`ends_on`). */
    term_months?: number
    ends_on?: string
    notice_months: number
    auto_renews: boolean
    billing_plan: BillingPlan
    prepaid_years: number | null
    contract_value: number
    renewal_annual_value: number | null
    renewal_term_months: number | null
    renewal_billing: RenewalBilling | null
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

/** The superadmin-only `agreement` block on GET /superadmin/companies/{uuid}/subscriptions. */
export interface SubscriptionAgreement {
    uuid: string
    name: string
    starts_on: string | null
    ends_on: string | null
    term_months: number | null
    notice_deadline: string | null
    auto_renews: boolean
    billing_plan: string | null
    contract_value: number | string | null
    contract_mrr: number | string | null
    contract_arr: number | string | null
    estimated_renewal_annual_value: number | string | null
    renewal_term_months: number | null
    renewal_billing: RenewalBilling | null
    estimated_renewal_period_value: number | null
    renewal_value_source: string | null
    status: string | null
}

export interface RunningAgreement {
    uuid: string
    name: string
    starts_on: string | null
    ends_on: string | null
}
