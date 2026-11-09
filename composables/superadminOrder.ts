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
    unit_price: number
    amount: number
    period_from: string | null
    period_to: string | null
}

export type OrderQuote = {
    lines: OrderQuoteLine[]
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
    const count = Math.floor(Number(quantity))

    if (!['user', 'department', 'application'].includes(type) || !uuid || !Number.isFinite(count) || count < 1 || count > 1000) {
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

/** What the e-conomic column says: the draft number, the error, or that it is waiting. */
export function orderEconomicLabel(order: { status?: string; invoice?: { economic_draft_number?: number | null; economic_invoice_number?: number | null; economic_error?: string | null } | null }): { key: string; params: Record<string, string | number> } {
    const invoice = order?.invoice

    switch (order?.status) {
        case 'transferred':
            return invoice?.economic_invoice_number
                ? { key: `${KEY}.economic.booked`, params: { number: invoice.economic_invoice_number } }
                : { key: `${KEY}.economic.draft`, params: { number: invoice?.economic_draft_number ?? '—' } }
        case 'failed':
            return { key: `${KEY}.economic.failed`, params: { reason: invoice?.economic_error ?? '—' } }
        case 'completed':
            return invoice ? { key: `${KEY}.economic.pending`, params: {} } : { key: `${KEY}.economic.none`, params: {} }
        default:
            return { key: `${KEY}.economic.notYet`, params: {} }
    }
}
