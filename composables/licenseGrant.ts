/**
 * Pure helpers for the superadmin "Tilføj licenser" dialog (contract length,
 * the quote's "Sådan faktureres kunden" box, the save button and the toast)
 * and the "Licensordrer" list.
 *
 * Kept free of Nuxt auto-imports so they can be unit tested with `node --test`
 * (see tests/unit/licenseGrant.test.mjs). Nothing here is access control: the
 * API refuses a grant the customer cannot be billed for (`grant_not_billable`).
 */

export type GrantBillingMethod = 'card' | 'economic_auto' | 'economic_finance' | 'manual_invoice' | 'none' | 'included'

export type GrantBilling = {
    method: GrantBillingMethod
    text_key: string
    customer_number: number | null
    invoice_email: string | null
    finance_notified: boolean
    no_charge_reason: string | null
}

export type GrantAgreement = { uuid: string; name: string | null; ends_on: string; last_day: string }

export type GrantQuote = {
    lines: { type: string; name: string; quantity: number; free: number; paid: number; unit_price: number; amount: number }[]
    fee: number
    total_excl_vat: number
    vat: number
    total_amount: number
    term: string
    prorated: boolean
    period_from: string
    period_to: string
    agreement: GrantAgreement | null
    agreements: GrantAgreement[]
    follows_agreement: boolean
    billing: GrantBilling
}

/** The dropdown's last option: go to the company's agreements page. */
export const CREATE_AGREEMENT = 'create_agreement'

const KEY = 'superadmin.companies.licenseOverview.grant'

export type TermOption = { value: string; labelKey: string; params: Record<string, string | number> }

/**
 * Each running agreement (pro rata to its end), then 1-4 years, then
 * "Opret aftale…". A monthly grant has no term in years: it runs month by
 * month, so the years collapse into one option.
 */
export function grantTermOptions(args: {
    agreements: GrantAgreement[]
    yearly: boolean
    formatDate: (date: string) => string
}): TermOption[] {
    const options: TermOption[] = (args.agreements ?? []).map(agreement => ({
        value: `agreement:${agreement.uuid}`,
        labelKey: `${KEY}.term.agreement`,
        params: { name: agreement.name || '—', date: args.formatDate(agreement.last_day) },
    }))

    if (args.yearly) {
        for (const years of [1, 2, 3, 4]) {
            options.push({ value: `years:${years}`, labelKey: years === 1 ? `${KEY}.term.year` : `${KEY}.term.years`, params: { years } })
        }
    } else {
        options.push({ value: 'years:1', labelKey: `${KEY}.term.monthly`, params: {} })
    }

    options.push({ value: CREATE_AGREEMENT, labelKey: `${KEY}.term.createAgreement`, params: {} })

    return options
}

/**
 * The agreement when the company has a running one and its licences follow
 * it (invoice companies only), otherwise 1 year.
 */
export function defaultGrantTerm(args: { agreements: GrantAgreement[]; followsAgreement: boolean; paysByInvoice: boolean }): string {
    const first = args.agreements?.[0]

    return first && args.followsAgreement && args.paysByInvoice ? `agreement:${first.uuid}` : 'years:1'
}

/** A term the API takes; never the "create" option. */
export function isGrantTerm(value: unknown): value is string {
    return typeof value === 'string' && /^(agreement:.+|years:[1-4])$/.test(value)
}

export function grantBillingTextKey(billing: Pick<GrantBilling, 'text_key'> | null | undefined): string {
    const known = ['economic_auto', 'economic_finance', 'agreement_add_on', 'card_manual_invoice', 'none_customer_number', 'none_economic_off', 'no_charge', 'included']
    return `${KEY}.billing.${known.includes(billing?.text_key ?? '') ? billing!.text_key : 'unknown'}`
}

/** The red box and the required reason: the customer cannot be billed. */
export function grantNeedsReason(billing: Pick<GrantBilling, 'method'> | null | undefined): boolean {
    return billing?.method === 'none'
}

export function grantReasonValid(reason: unknown): boolean {
    const text = typeof reason === 'string' ? reason.trim() : ''
    return text.length >= 5 && text.length <= 500
}

export function grantCanSave(args: {
    quantity: unknown
    quote: Pick<GrantQuote, 'billing'> | null
    quoteLoading: boolean
    reason: string
    term: unknown
    saving: boolean
}): boolean {
    const quantity = Number(args.quantity)
    if (args.saving || args.quoteLoading || !args.quote) return false
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 1000) return false
    if (!isGrantTerm(args.term)) return false
    if (grantNeedsReason(args.quote.billing) && !grantReasonValid(args.reason)) return false
    return true
}

/** "Tilføj og fakturer 2.526,33 kr.", "Tilføj uden betaling" or "Tilføj". */
export function grantSaveLabel(quote: Pick<GrantQuote, 'billing' | 'total_amount'> | null): { key: string; withAmount: boolean } {
    if (!quote) return { key: `${KEY}.save.plain`, withAmount: false }
    if (grantNeedsReason(quote.billing)) return { key: `${KEY}.save.noCharge`, withAmount: false }
    if (quote.billing.method === 'included' || !(Number(quote.total_amount) > 0)) return { key: `${KEY}.save.plain`, withAmount: false }
    return { key: `${KEY}.save.invoice`, withAmount: true }
}

/**
 * The toast after a grant: invoice number, amount and how it is billed.
 * `billing` and the invoice fields come from the grant response.
 */
export function grantToast(data: any): { key: string; params: Record<string, string | number | null> } | null {
    const billing: GrantBilling | null = data?.billing ?? null
    if (!billing) return null
    if (billing.method === 'none') return { key: `${KEY}.toast.noCharge`, params: {} }
    if (!data?.invoice_number) return { key: `${KEY}.toast.included`, params: {} }
    return {
        key: `${KEY}.toast.${billing.method}`,
        params: { number: data.invoice_number, amount: data.invoice_total ?? 0, customer: billing.customer_number ?? '—' },
    }
}

export type LicenseOrderStatus = 'no_invoice' | 'finance' | 'pending' | 'draft' | 'booked' | 'paid' | 'error'

export const LICENSE_ORDER_STATUSES: LicenseOrderStatus[] = ['pending', 'draft', 'booked', 'paid', 'finance', 'error', 'no_invoice']

/** Badge colour for an order's e-conomic status. */
export function licenseOrderTone(status: unknown): 'green' | 'blue' | 'amber' | 'red' | 'gray' {
    switch (status) {
        case 'paid':
        case 'booked': return 'green'
        case 'draft': return 'blue'
        case 'pending':
        case 'finance': return 'amber'
        case 'error': return 'red'
        default: return 'gray'
    }
}

export function licenseOrderStatusKey(status: unknown): string {
    return `superadmin.orders.licenseOrders.status.${(LICENSE_ORDER_STATUSES as string[]).includes(String(status)) ? status : 'pending'}`
}

/** "2 × Extra User, 1 × Servicegebyr". */
export function licenseOrderItems(lines: { name: string; quantity: number }[] | null | undefined): string {
    return (lines ?? []).map(line => `${Number(line.quantity)} × ${line.name}`).join(', ')
}
