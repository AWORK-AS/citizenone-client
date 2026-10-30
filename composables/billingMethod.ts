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
    | 'revoke_security_card'
    | 'retry_unknown_charge'

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

export type CardSecurityInvoiceStatus = 'noticed' | 'charging' | 'pending' | 'unknown' | 'charged' | 'declined' | 'over_cap'

export type DunningInvoice = {
    uuid: string
    invoice_number: string
    total_amount: number
    due_on: string | null
    card_security_status: CardSecurityInvoiceStatus | null
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
    /** A security charge Nexi never answered: check the charge in the Nexi portal. */
    needs_nexi_check: boolean
    /** Masked security card, only while the feature is on. */
    security_card: { last_four: string | null; expiry: string | null } | null
    /** Invoice customers: each unpaid invoice and where its security-card charge stands. */
    invoices: DunningInvoice[]
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
    // `card_security` is the customer standing's block (null while the feature is off or the
    // company is not an invoice customer with card security); `security_card` the older name.
    const cardSecurity = data.card_security ?? null
    const card = cardSecurity?.status === 'active' || (cardSecurity && cardSecurity.last_four)
        ? { masked: cardSecurity.last_four ? `•••• ${cardSecurity.last_four}` : null, expiry: cardSecurity.expiry ?? null }
        : (data.security_card ?? data.card ?? null)

    return {
        billing_method: normalizeBillingMethod(data.billing_method),
        invoice_card_security: !!data.invoice_card_security || (cardSecurity !== null && typeof cardSecurity === 'object'),
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

const ACTION_ORDER: DunningAction[] = ['retry', 'send_card_link', 'charge_security_card', 'retry_unknown_charge', 'revoke_security_card', 'close', 'reopen', 'postpone']

/**
 * What a row in "Betalingsproblemer" offers: exactly what the API's `actions` map
 * allows, in a fixed order. The screen never works out for itself whether a
 * company may be closed or charged; a missing map offers nothing.
 */
export function dunningActions(row: { actions?: Partial<Record<DunningAction, boolean>> | null; security_card?: unknown; needs_nexi_check?: boolean }): DunningAction[] {
    return ACTION_ORDER.filter((action) => {
        // Nexi never answered the last attempt: finance checks the Nexi portal first, and the
        // same attempt may only be reposted through the explicit action, never a plain charge.
        if (action === 'retry_unknown_charge') return row.needs_nexi_check === true
        if (action === 'charge_security_card' && row.needs_nexi_check === true) return false
        // The API does not list this one in `actions`: it applies whenever a card is on file.
        if (action === 'revoke_security_card') return !!row.security_card
        return row.actions?.[action] === true
    })
}

/**
 * "Træk sikkerhedskort nu" is shown disabled, with the reason, for an invoice
 * customer who has card security on but where the API does not allow the charge.
 */
export function securityChargeUnavailable(row: Pick<DunningRow, 'billing_method' | 'invoice_card_security' | 'actions'>): boolean {
    return row.billing_method === 'invoice' && row.invoice_card_security && row.actions?.charge_security_card !== true
}

/**
 * Which actions carry a note. The API takes one on reopen (optional) and postpone
 * (required, up to 500 characters); close takes none, so its dialog is a plain confirm.
 */
export function actionTakesNote(action: DunningAction): boolean {
    return action === 'reopen' || action === 'postpone'
}

export function actionNeedsNote(action: DunningAction): boolean {
    return action === 'postpone'
}

export const POSTPONE_MIN_DAYS = 1
export const POSTPONE_MAX_DAYS = 90

export function actionNeedsDays(action: DunningAction): boolean {
    return action === 'postpone' || action === 'reopen'
}

export function validateDunningAction(action: DunningAction, input: { note: string; days?: number | null }): 'note' | 'days' | null {
    const note = (input.note ?? '').trim()
    if (actionNeedsNote(action) && note.length < 1) return 'note'
    if (actionTakesNote(action) && note.length > 500) return 'note'

    if (action === 'postpone') {
        const days = Number(input.days)
        if (!Number.isInteger(days) || days < POSTPONE_MIN_DAYS || days > POSTPONE_MAX_DAYS) return 'days'
    }

    // Reopen defaults to 7 days when none is given; a value that is given must be valid.
    if (action === 'reopen' && input.days !== null && input.days !== undefined && String(input.days) !== '') {
        const days = Number(input.days)
        if (!Number.isInteger(days) || days < POSTPONE_MIN_DAYS || days > POSTPONE_MAX_DAYS) return 'days'
    }

    return null
}

/**
 * The invoice list's header counts, from whatever the API sent. An older backend lacks
 * some of them, so every count is a finite number (never NaN or undefined) and
 * `resolved` is null when the API does not report it at all, which hides its tab.
 * `failed` is already unresolved-only on the server; the total includes resolved ones
 * when it has to be summed.
 */
export type InvoiceCounts = {
    total: number
    paid: number
    pending: number
    failed: number
    covered: number
    resolved: number | null
}

function count(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null
    const n = Number(value)
    return Number.isFinite(n) ? n : null
}

export function invoiceCounts(response: any): InvoiceCounts {
    const paid = count(response?.paid_invoices_count) ?? 0
    const pending = count(response?.pending_invoices_count) ?? 0
    const failed = count(response?.failed_invoices_count) ?? 0
    const covered = count(response?.covered_invoices_count) ?? 0
    const resolved = count(response?.resolved_invoices_count) ?? count(response?.meta?.resolved_invoices_count)

    return {
        total: count(response?.total_invoices_count) ?? (paid + pending + failed + covered + (resolved ?? 0)),
        paid,
        pending,
        failed,
        covered,
        resolved,
    }
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
export type WallMode = 'none' | 'update_card' | 'invoice_overdue' | 'contact_admin' | 'notice'

export function wallMode(
    status: { status?: string; can_manage?: boolean; billing_method?: string | null; can_renew?: boolean } | null | undefined,
    onPayPage = false,
): WallMode {
    const overdue = status?.status === 'past_due' || status?.status === 'suspended'
    if (!overdue || onPayPage) return 'none'

    if (status?.can_manage) {
        // An invoice company has no card to update, and a suspended company whose admin got
        // no renewal token has nothing the card flow can pay: both are told the invoice is
        // unpaid and to contact us, instead of being offered a button that goes nowhere.
        const noCardFlow = status?.billing_method === 'invoice'
            || (status?.status === 'suspended' && status?.can_renew !== true && status?.billing_method !== 'card')
        return noCardFlow ? 'invoice_overdue' : 'update_card'
    }

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
export type SuspendedLogin = { view: 'update_card' | 'invoice_overdue' | 'contact_admin' | 'two_factor'; token: string | null; message: string }

export function suspendedLogin(error: any): SuspendedLogin | null {
    if (error?.code !== 'subscription_suspended') return null

    const token = typeof error?.renewal_token === 'string' && error.renewal_token.length > 0 ? error.renewal_token : null
    // An admin with 2FA gets no token at the password step: the code step comes next, and
    // only its answer carries the renewal token.
    if (error?.requires_2fa === true && token === null && error?.can_manage === true) {
        return { view: 'two_factor', token: null, message: typeof error?.message === 'string' ? error.message : '' }
    }

    // An admin without a token (an invoice company, or no payable invoice) has no card flow.
    const view = error?.can_manage !== true ? 'contact_admin' : token !== null ? 'update_card' : 'invoice_overdue'

    return {
        view,
        token: view === 'update_card' ? token : null,
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

/**
 * Messages for the API's refusal `code`s, as i18n keys. Every refusal carries `code` next
 * to its (Danish) message, so the client shows its own text in the user's language and
 * falls back to the server's message only for a code it does not know.
 */
const ERROR_CODES = new Set([
    'payment_provider_unavailable',
    'payment_problem_no_card',
    'payment_problem_action_not_available',
    'payment_problem_close_blocked',
    'card_security_disabled',
    'card_security_over_cap',
    'card_security_consent_required',
    'card_security_not_applicable',
    'card_security_agreement_changed',
    'renewal_not_available',
    'impersonation_not_allowed',
    'plan_change_invoice_company',
])

export function errorMessageKey(error: any): string | null {
    const code = error?.code
    return typeof code === 'string' && ERROR_CODES.has(code) ? `paymentDunning.errors.${code}` : null
}

/** How a retry (customer or superadmin) or a security charge ended. */
export type RetryStatus = 'paid' | 'pending' | 'declined' | 'no_card' | 'not_applicable' | 'unknown'
/** `unknown`: Nexi did not answer in time. The charge must not be repeated; it is reconciled later. */
export type ChargeStatus = 'charged' | 'pending' | 'declined' | 'unknown'
export type OutcomeTone = 'success' | 'info' | 'error'

export function retryStatus(result: any): RetryStatus {
    const status = result?.status
    if (status === 'paid' || status === 'pending' || status === 'declined' || status === 'no_card' || status === 'not_applicable') return status
    // An older API sent only `paid`.
    if (status === undefined && result?.paid === true) return 'paid'
    return 'unknown'
}

export function chargeStatus(result: any): ChargeStatus {
    const status = result?.status
    return status === 'charged' || status === 'pending' || status === 'declined' ? status : 'unknown'
}

/** A security charge that Nexi has not answered is "wait", not a failure. */
export function chargeTone(status: ChargeStatus): OutcomeTone {
    if (status === 'charged') return 'success'
    if (status === 'declined') return 'error'
    return 'info'
}

export function outcomeTone(status: RetryStatus | ChargeStatus): OutcomeTone {
    if (status === 'paid' || status === 'charged') return 'success'
    if (status === 'pending' || status === 'not_applicable') return 'info'
    return 'error'
}

/**
 * Any `/user/*` call from a suspended company's session answers 400 `subscription_suspended`.
 * The billing routes stay open so the suspended page can read its own standing and pay,
 * and the pages that already are the suspended flow must not redirect to themselves.
 */
export function shouldRouteToSuspended(url: string, error: any, currentPath = ''): boolean {
    if (error?.code !== 'subscription_suspended') return false
    if (!url.startsWith('/user/')) return false
    if (url.startsWith('/user/billing/')) return false
    if (currentPath === '/' || currentPath.startsWith('/subscription/')) return false
    return true
}

/**
 * Renewal tokens rotate: every issue (suspension mail, login, status call) invalidates the
 * previous one, so a token is only ever used straight from the response that carried it.
 * There is deliberately no fallback to an earlier value.
 */
export function latestRenewalToken(source: { renewal_token?: unknown } | null | undefined): string | null {
    const token = source?.renewal_token
    return typeof token === 'string' && token.length > 0 ? token : null
}

/**
 * The token from `POST /user/billing/renewal-link`. The status call no longer carries one
 * (it only says `can_renew`), and each link replaces the last, so it is minted only when
 * the admin clicks and used straight away.
 */
export function renewalLinkToken(response: any): string | null {
    return latestRenewalToken(response?.data ?? response)
}

/** The renew button shows only when the API says this user may renew. */
export function canRenew(source: { can_renew?: unknown } | null | undefined): boolean {
    return source?.can_renew === true
}
