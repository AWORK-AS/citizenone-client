/**
 * Pure helpers for superadmin orders: several lines, one invoice, one fee,
 * one e-conomic draft that finance books and sends.
 *
 * Kept free of Nuxt auto-imports so they can be unit tested with `node --test`
 * (see tests/unit/superadminOrder.test.mjs). Nothing here is access control:
 * the API refuses an order the customer cannot have (`superadmin_order_*`).
 */

export type OrderStatus = 'draft' | 'completed' | 'transferred' | 'failed' | 'cancelled'

export type OrderLineType = 'user' | 'department' | 'application'

export type OrderProduct = {
    type: OrderLineType
    product_uuid: string
    name: string
    generic_name: string | null
    yearly_price: number
    monthly_price: number
}

export type OrderQuoteLine = {
    uuid: string
    type: OrderLineType
    name: string
    quantity: number
    free: number
    paid: number
    /** The catalogue (or co-term) price; unit_price is the net price billed. */
    list_unit_price?: number
    discount_percent?: number
    discount_reason?: string | null
    discount_amount?: number
    unit_price: number
    amount: number
    period_from: string | null
    period_to: string | null
}

export type OrderQuote = {
    lines: OrderQuoteLine[]
    discount_total?: number
    fee: number
    total_excl_vat: number
    vat: number
    total_amount: number
    term: string
    prorated: boolean
    period_from: string | null
    period_to: string | null
}

export const ORDER_STATUSES: OrderStatus[] = ['draft', 'completed', 'transferred', 'failed', 'cancelled']

const KEY = 'superadmin.companyOrders'

/** The i18n key of a status. */
export function orderStatusKey(status: unknown): string {
    return ORDER_STATUSES.includes(status as OrderStatus) ? `${KEY}.status.${status}` : `${KEY}.status.draft`
}

/** ModulesSuperadminStatusPill variant: meaning, not colour. */
export function orderStatusVariant(status: unknown): 'success' | 'info' | 'warning' | 'danger' | 'neutral' {
    return ({
        draft: 'info',
        completed: 'warning',
        transferred: 'success',
        failed: 'danger',
        cancelled: 'neutral',
    } as const)[status as OrderStatus] ?? 'neutral'
}

/**
 * The order flow is for companies superadmin set to pay by invoice. Any other
 * company keeps the one-off "Tilføj licenser" dialog.
 */
export function offersOrderFlow(billingMethod: unknown): boolean {
    return billingMethod === 'invoice'
}

/** A product picker value is `{type}:{uuid}`, as two products may share a type. */
export function productKey(product: Pick<OrderProduct, 'type' | 'product_uuid'>): string {
    return `${product.type}:${product.product_uuid}`
}

/** The body for POST .../lines from a picker value and a quantity, or null when incomplete. */
export function orderLinePayload(key: string, quantity: unknown): { type: OrderLineType; product_uuid?: string; quantity: number } | null {
    const [type, uuid] = String(key ?? '').split(':')
    // A whole number, as the API takes it: 2.5 is refused, never sent as 2.
    const count = typeof quantity === 'number' || (typeof quantity === 'string' && quantity.trim() !== '') ? Number(quantity) : NaN

    if (!['user', 'department', 'application'].includes(type) || !uuid || !Number.isInteger(count) || count < 1 || count > 1000) {
        return null
    }

    return type === 'application'
        ? { type: 'application', product_uuid: uuid, quantity: count }
        : { type: type as OrderLineType, quantity: count }
}

/** "Gennemfør ordre" is offered for a draft with lines and a quote. */
export function orderCanComplete(order: { status?: string; lines?: unknown[]; quote?: unknown; quote_error?: unknown } | null | undefined): boolean {
    return !!order
        && order.status === 'draft'
        && (order.lines?.length ?? 0) > 0
        && !!order.quote
        && !order.quote_error
}

/** Seats granted on completion: every line's quantity, free seats included. */
export function orderSeatCount(quote: Pick<OrderQuote, 'lines'> | null | undefined): number {
    return (quote?.lines ?? []).reduce((sum, line) => sum + (Number(line.quantity) || 0), 0)
}

/** The confirmation's text key: with or without an invoice. */
export function orderConfirmKey(quote: Pick<OrderQuote, 'total_amount'> | null | undefined): string {
    return Number(quote?.total_amount ?? 0) > 0 ? `${KEY}.confirm.body` : `${KEY}.confirm.bodyFree`
}

/** Products not on the order yet, so a product is never picked twice by accident. */
export function availableProducts(products: OrderProduct[], lines: { type: string; product_uuid: string | null }[]): OrderProduct[] {
    const taken = new Set((lines ?? []).map(line => `${line.type}:${line.product_uuid}`))

    return (products ?? []).filter(product => !taken.has(productKey(product)))
}

/**
 * What the e-conomic column says: the e-conomic order number (an order is
 * sent as an order, finance invoices it there), an invoice draft finance made
 * from it, the booked invoice, the error, or that it is waiting.
 */
export function orderEconomicLabel(order: { status?: string; invoice?: { economic_order_number?: number | null; economic_draft_number?: number | null; economic_invoice_number?: number | null; economic_error?: string | null } | null }): { key: string; params: Record<string, string | number> } {
    const invoice = order?.invoice

    switch (order?.status) {
        case 'transferred':
            if (invoice?.economic_invoice_number) {
                return { key: `${KEY}.economic.booked`, params: { number: invoice.economic_invoice_number } }
            }

            return invoice?.economic_draft_number && !invoice?.economic_order_number
                ? { key: `${KEY}.economic.draft`, params: { number: invoice.economic_draft_number } }
                : { key: `${KEY}.economic.order`, params: { number: invoice?.economic_order_number ?? '—' } }
        case 'failed':
            return { key: `${KEY}.economic.failed`, params: { reason: invoice?.economic_error ?? '—' } }
        case 'completed':
            return invoice ? { key: `${KEY}.economic.pending`, params: {} } : { key: `${KEY}.economic.none`, params: {} }
        case 'cancelled':
            return { key: `${KEY}.economic.none`, params: {} }
        default:
            return { key: `${KEY}.economic.notYet`, params: {} }
    }
}

/** The API's default ceiling (billing.order_max_discount_percent). */
export const DEFAULT_MAX_DISCOUNT_PERCENT = 50

export const DISCOUNT_REASON_MIN = 5
export const DISCOUNT_REASON_MAX = 500

/**
 * The net unit price, as the API computes it (OrderDiscount): in whole cents,
 * round(list × (1 − pct / 100)) half up, so the page never shows a price one
 * øre off the invoice.
 */
export function discountedUnitPrice(listUnit: unknown, percent: unknown): number {
    const list = Number(listUnit)
    const bp = Math.round(Number(percent) * 100)

    if (!Number.isFinite(list)) return 0
    if (!Number.isFinite(bp) || bp <= 0) return Math.round(list * 100) / 100

    const cents = Math.round(list * 100)

    return Math.floor((cents * (10000 - bp) + 5000) / 10000) / 100
}

/** What the discount takes off `paid` seats. */
export function lineDiscountAmount(listUnit: unknown, percent: unknown, paid: unknown): number {
    const seats = Number(paid)
    if (!Number.isInteger(seats) || seats <= 0) return 0
    const list = Math.round(Number(listUnit) * 100)
    const net = Math.round(discountedUnitPrice(listUnit, percent) * 100)

    return Number.isFinite(list) ? ((list - net) * seats) / 100 : 0
}

export type DiscountError = 'percentInvalid' | 'percentDecimals' | 'percentAboveMax' | 'reasonRequired' | 'reasonTooShort' | 'reasonTooLong'

/**
 * Why a discount cannot be saved, or null; the same rules the API applies.
 * 0 removes the discount and needs no reason.
 */
export function discountError(percent: unknown, reason: unknown, max: unknown = DEFAULT_MAX_DISCOUNT_PERCENT): DiscountError | null {
    const raw = typeof percent === 'string' ? percent.trim().replace(',', '.') : percent
    const value = typeof raw === 'number' || (typeof raw === 'string' && raw !== '') ? Number(raw) : NaN
    const ceiling = max !== null && max !== undefined && max !== '' && Number.isFinite(Number(max)) ? Number(max) : DEFAULT_MAX_DISCOUNT_PERCENT

    if (!Number.isFinite(value) || value < 0 || value > 100) return 'percentInvalid'
    if (Math.abs(Math.round(value * 100) - value * 100) > 1e-6) return 'percentDecimals'
    if (value > ceiling) return 'percentAboveMax'
    if (value === 0) return null

    const text = typeof reason === 'string' ? reason.trim() : ''
    if (text === '') return 'reasonRequired'
    if (text.length < DISCOUNT_REASON_MIN) return 'reasonTooShort'
    if (text.length > DISCOUNT_REASON_MAX) return 'reasonTooLong'

    return null
}

/** The body for PUT .../discount, or null when invalid. 0 clears the reason. */
export function discountPayload(percent: unknown, reason: unknown, onRenewal: unknown, max?: unknown): { discount_percent: number; discount_reason: string | null; discount_on_renewal: boolean } | null {
    if (discountError(percent, reason, max) !== null) return null
    const value = Number(typeof percent === 'string' ? percent.trim().replace(',', '.') : percent)

    return value === 0
        ? { discount_percent: 0, discount_reason: null, discount_on_renewal: false }
        : { discount_percent: value, discount_reason: String(reason).trim(), discount_on_renewal: onRenewal === true }
}

/** "12,5" or "10": the percentage as the line, the mails and e-conomic write it. */
export function discountLabel(percent: unknown): string {
    const value = Math.round(Number(percent) * 100) / 100
    if (!Number.isFinite(value)) return '0'

    return String(value).replace('.', ',')
}

/** The discounted lines of a quote, for the totals box and the confirmation. */
export function quoteDiscounts(quote: Pick<OrderQuote, 'lines'> | null | undefined): OrderQuoteLine[] {
    return (quote?.lines ?? []).filter(line => Number(line.discount_percent ?? 0) > 0 && Number(line.paid ?? 0) > 0)
}
