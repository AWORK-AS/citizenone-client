/**
 * Pure helpers for payment method, card-as-security and dunning.
 *
 * Kept free of Nuxt auto-imports so they can be unit tested with `node --test`
 * (see tests/unit/billingMethod.test.mjs).
 *
 * Nothing here is access control. Which company may be closed, charged or
 * reopened is decided by the API; these helpers only decide what the screen
 * offers, so a row is not shown a button the server will answer 403/422 on.
 */

export type BillingMethod = 'card' | 'invoice'

export type DunningStatus = 'behind' | 'ready_to_close' | 'closed' | 'snoozed'

export type DunningAction =
    | 'retry'
    | 'send_card_link'
    | 'charge_security_card'
    | 'close'
    | 'reopen'
    | 'snooze'

export type BillingMethodForm = {
    billing_method: BillingMethod
    invoice_card_security: boolean
    leverandorservice: boolean
}

export type CompanyBilling = BillingMethodForm & {
    /** Masked card on file for card-as-security, e.g. "•••• 1234". Never a full number. */
    card_masked: string | null
    /** "MM/YY". */
    card_expiry: string | null
    under_agreement: boolean
    /** True when an e-conomic draft is also created for invoices (integration on and customer number set). */
    economic_draft: boolean
}

export type DunningRow = {
    company_uuid: string
    company_name: string
    billing_method: BillingMethod
    amount_outstanding: number
    days_overdue: number
    warnings_sent: number
    closes_on: string | null
    status: DunningStatus
    invoice_card_security: boolean
    has_security_card: boolean
    /** True when the amount is above billing.card_security.max_amount. */
    over_cap: boolean
}

export function normalizeBillingMethod(value: unknown): BillingMethod {
    return value === 'invoice' ? 'invoice' : 'card'
}

/** Anything the API does not name as a known status is shown as "behind". */
export function normalizeDunningStatus(value: unknown): DunningStatus {
    return value === 'ready_to_close' || value === 'closed' || value === 'snoozed' ? value : 'behind'
}

/**
 * The company's billing state as the screen holds it. Tolerates a missing or
 * partial payload: a company with none of the fields is a card company with no
 * security card, which is also what the database default says.
 */
export function normalizeCompanyBilling(raw: any): CompanyBilling {
    const data = raw?.data ?? raw ?? {}
    const card = data.security_card ?? data.card ?? null

    return {
        billing_method: normalizeBillingMethod(data.billing_method),
        invoice_card_security: !!data.invoice_card_security,
        leverandorservice: !!data.leverandorservice,
        card_masked: card?.masked ?? card?.masked_pan ?? data.card_masked ?? null,
        card_expiry: card?.expiry ?? data.card_expiry ?? null,
        under_agreement: !!data.under_agreement,
        economic_draft: !!(data.economic_draft ?? data.economic_draft_enabled),
    }
}

/**
 * What a save sends. Switching to card clears the two invoice-only flags, so
 * a company moved back to card does not keep a security-card flag that nothing
 * will ever read.
 */
export function billingMethodPayload(form: BillingMethodForm): BillingMethodForm {
    if (form.billing_method !== 'invoice') {
        return { billing_method: 'card', invoice_card_security: false, leverandorservice: false }
    }

    return {
        billing_method: 'invoice',
        invoice_card_security: !!form.invoice_card_security,
        leverandorservice: !!form.leverandorservice,
    }
}

export function billingMethodDirty(saved: BillingMethodForm, form: BillingMethodForm): boolean {
    const a = billingMethodPayload(saved)
    const b = billingMethodPayload(form)

    return a.billing_method !== b.billing_method
        || a.invoice_card_security !== b.invoice_card_security
        || a.leverandorservice !== b.leverandorservice
}

/** "•••• 1234 (udløber 08/28)" is built by the caller's translation; this is the data. */
export function cardSecurityState(billing: Pick<CompanyBilling, 'invoice_card_security' | 'card_masked'>): 'off' | 'missing' | 'attached' {
    if (!billing.invoice_card_security) return 'off'
    return billing.card_masked ? 'attached' : 'missing'
}

/**
 * Which paragraph "Tilføj licenser" shows. An agreement customer is added to the
 * agreement as an add-on whatever the billing method says, because the backend
 * links new licences to a running agreement first.
 */
export type GrantNotice = 'agreement' | 'invoice' | 'invoice_economic' | 'card'

export function grantNotice(args: {
    billingMethod: BillingMethod
    underAgreement: boolean
    economicDraft: boolean
}): GrantNotice {
    if (args.underAgreement) return 'agreement'
    if (args.billingMethod === 'invoice') {
        return args.economicDraft ? 'invoice_economic' : 'invoice'
    }
    return 'card'
}

/** The Nexi-charged variants use the existing per-licence price; only card charges at once. */
export function grantChargesCardNow(notice: GrantNotice): boolean {
    return notice === 'card'
}

/**
 * Invoice chip for the superadmin list. "Afvist" is only an unresolved failure;
 * a failure a later retry cleared is "Løst ved genforsøg".
 */
export type InvoiceChip = 'covered' | 'paid' | 'resolved' | 'failed' | 'pending'

export function invoiceChip(invoice: any): InvoiceChip {
    if (invoice?.covered_by_agreement) return 'covered'
    if (invoice?.is_paid || invoice?.status === 'paid') return 'paid'
    if (invoice?.status === 'resolved' || (invoice?.status === 'failed' && invoice?.resolved_at)) return 'resolved'
    if (invoice?.status === 'failed') return 'failed'
    return 'pending'
}

/**
 * What a row in "Betalingsproblemer" can be given. Mirrors the spec:
 * - card companies can be retried and sent a card link,
 * - the security card is only for invoice companies that have one attached
 *   and where the amount is under the cap,
 * - a closed company can be reopened, an open one closed,
 * - a snooze only makes sense while the company is still open.
 */
export function dunningActions(row: Pick<DunningRow,
    'billing_method' | 'status' | 'invoice_card_security' | 'has_security_card' | 'over_cap'>): DunningAction[] {
    const actions: DunningAction[] = []
    const closed = row.status === 'closed'

    if (row.billing_method === 'card') {
        actions.push('retry', 'send_card_link')
    } else if (row.invoice_card_security) {
        if (row.has_security_card && !row.over_cap) actions.push('charge_security_card')
        actions.push('send_card_link')
    }

    if (closed) {
        actions.push('reopen')
    } else {
        actions.push('close', 'snooze')
    }

    return actions
}

/** Actions that change state need a reason; the note is required for these. */
export function actionNeedsNote(action: DunningAction): boolean {
    return action === 'close' || action === 'reopen' || action === 'snooze' || action === 'charge_security_card'
}

export const SNOOZE_MIN_DAYS = 1
export const SNOOZE_MAX_DAYS = 60

export function validateDunningAction(action: DunningAction, input: { note: string; days?: number | null }): string | null {
    const note = (input.note ?? '').trim()
    if (actionNeedsNote(action) && note.length < 3) return 'note'

    if (action === 'snooze') {
        const days = Number(input.days)
        if (!Number.isInteger(days) || days < SNOOZE_MIN_DAYS || days > SNOOZE_MAX_DAYS) return 'days'
    }

    return null
}

/** Rows for the sidebar badge: everything that is waiting on a human. */
export function problemCount(rows: Array<Pick<DunningRow, 'status'>>): number {
    return rows.filter((row) => row.status !== 'snoozed').length
}

/**
 * What the customer's payment wall shows, from the standing the API reports.
 *
 * `can_manage` is the server's answer to "may this user fix the card", so the
 * role is never guessed here. An Admin is blocked until the card is fixed. A
 * suspended company blocks everybody, but only an Admin gets the update-card
 * flow: the rest are told to contact their administrator. Past due and not an
 * Admin is a plain notice, because blocking someone who cannot pay fixes nothing.
 */
export type WallMode = 'none' | 'update_card' | 'contact_admin' | 'notice'

export function wallMode(status: { status?: string; can_manage?: boolean } | null | undefined, onPayPage = false): WallMode {
    const overdue = status?.status === 'past_due' || status?.status === 'suspended'
    if (!overdue || onPayPage) return 'none'

    if (status?.can_manage) return 'update_card'
    return status?.status === 'suspended' ? 'contact_admin' : 'notice'
}

/** AI/SMS paused for a failed top-up. Only that service is stopped. */
export type PausedService = 'ai' | 'sms'

export function pausedServices(flags: any): PausedService[] {
    const out: PausedService[] = []
    if (flags?.ai_payment_missing || flags?.ai_paused) out.push('ai')
    if (flags?.sms_payment_missing || flags?.sms_paused) out.push('sms')
    return out
}
