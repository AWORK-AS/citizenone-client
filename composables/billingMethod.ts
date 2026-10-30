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

export type DunningStatus = 'past_due' | 'overdue' | 'suspended' | 'ready_to_close'

export type DunningAction =
    | 'retry'
    | 'send_card_link'
    | 'charge_security_card'
    | 'close'
    | 'reopen'
    | 'postpone'

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
    /** Card customers only. Invoice customers are closed by hand, so this is null. */
    closes_on: string | null
    status: DunningStatus
    invoice_card_security: boolean
    /** YYYY-MM-DD while dunning is postponed. */
    postponed_until: string | null
    postpone_note: string | null
    /** What the API says may be done to this row. The server is the authority. */
    actions: Partial<Record<DunningAction, boolean>>
}

export function normalizeBillingMethod(value: unknown): BillingMethod {
    return value === 'invoice' ? 'invoice' : 'card'
}

/** Anything the API does not name as a known status is shown as "past due". */
export function normalizeDunningStatus(value: unknown): DunningStatus {
    return value === 'overdue' || value === 'suspended' || value === 'ready_to_close' ? value : 'past_due'
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
        // The customer standing sends `billing_method: null` for a running agreement (Elite).
        under_agreement: !!data.under_agreement || data.billing_method === null,
        // The API does not say whether the e-conomic integration is on; a customer number is
        // the closest signal, and the notice words the draft as conditional on the integration.
        economic_draft: !!(data.economic_draft ?? data.economic_customer_number),
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
    if (invoice?.is_resolved === true || invoice?.status === 'resolved' || (invoice?.status === 'failed' && invoice?.resolved_at)) return 'resolved'
    if (invoice?.status === 'failed') return 'failed'
    return 'pending'
}

const ACTION_ORDER: DunningAction[] = ['retry', 'send_card_link', 'charge_security_card', 'close', 'reopen', 'postpone']

/**
 * What a row in "Betalingsproblemer" offers: exactly what the API's `actions` map
 * allows, in a fixed order. The screen never works out for itself whether a
 * company may be closed or charged; a missing map offers nothing.
 */
export function dunningActions(row: Pick<DunningRow, 'actions'>): DunningAction[] {
    return ACTION_ORDER.filter((action) => row.actions?.[action] === true)
}

/**
 * "Træk sikkerhedskort nu" is shown disabled, with the reason, for an invoice
 * customer who has card security on but where the API does not allow the charge.
 */
export function securityChargeUnavailable(row: Pick<DunningRow, 'billing_method' | 'invoice_card_security' | 'actions'>): boolean {
    return row.billing_method === 'invoice' && row.invoice_card_security && row.actions?.charge_security_card !== true
}

/** Actions that change state need a reason; the note is required for these. */
export function actionNeedsNote(action: DunningAction): boolean {
    return action === 'close' || action === 'reopen' || action === 'postpone' || action === 'charge_security_card'
}

export const POSTPONE_MIN_DAYS = 1
export const POSTPONE_MAX_DAYS = 90

export function actionNeedsDays(action: DunningAction): boolean {
    return action === 'postpone' || action === 'reopen'
}

export function validateDunningAction(action: DunningAction, input: { note: string; days?: number | null }): 'note' | 'days' | null {
    const note = (input.note ?? '').trim()
    if (actionNeedsNote(action) && note.length < 3) return 'note'

    if (actionNeedsDays(action)) {
        const days = Number(input.days)
        if (!Number.isInteger(days) || days < POSTPONE_MIN_DAYS || days > POSTPONE_MAX_DAYS) return 'days'
    }

    return null
}

/** Rows waiting on a human: everything whose dunning is not currently postponed. */
export function problemCount(rows: Array<Pick<DunningRow, 'postponed_until'>>, today: string = new Date().toISOString().slice(0, 10)): number {
    return rows.filter((row) => !row.postponed_until || row.postponed_until < today).length
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

/**
 * A login refused because the company is closed for non-payment. The API sends
 * `code: 'subscription_suspended'` with `can_manage` (is this person an Admin) and,
 * for an Admin only, the one-time `renewal_token` that opens paying the outstanding
 * invoice with a new card. Anything else is an ordinary login error.
 *
 * The token is a link into /subscription/renew, never a session: it only pays.
 */
export type SuspendedLogin = { view: 'update_card' | 'contact_admin'; token: string | null; message: string }

export function suspendedLogin(error: any): SuspendedLogin | null {
    if (error?.code !== 'subscription_suspended') return null

    const token = typeof error?.renewal_token === 'string' && error.renewal_token.length > 0 ? error.renewal_token : null
    const canManage = error?.can_manage === true && token !== null

    return {
        view: canManage ? 'update_card' : 'contact_admin',
        token: canManage ? token : null,
        message: typeof error?.message === 'string' ? error.message : '',
    }
}

/** AI/SMS paused for a failed top-up. Only that service is stopped. */
export type PausedService = 'ai' | 'sms'

export function pausedServices(flags: any): PausedService[] {
    const out: PausedService[] = []
    if (flags?.ai_payment_missing || flags?.ai_paused) out.push('ai')
    if (flags?.sms_payment_missing || flags?.sms_paused || flags?.payment_paused) out.push('sms')
    return out
}
