/**
 * Which invoices the bulk-send action may offer, and how a long selection is
 * split into the requests the API accepts. Pure, so it can be unit tested with
 * `node --test tests/unit/invoiceBulkSend.test.mjs`.
 *
 * This only keeps the checkbox from offering what would be refused. The API
 * decides: it re-checks every invoice and reports a reason for each skipped one.
 */

export type SendBlockReason = 'already_sent' | 'not_sendable'

const DEAD_STATUSES = ['cancelled', 'credited']

export function sendBlockReason(invoice: { status?: string | null, sent_at?: string | null }): SendBlockReason | null {
    if (invoice.status && DEAD_STATUSES.includes(invoice.status)) return 'not_sendable'
    if (invoice.sent_at) return 'already_sent'

    return null
}

export function isSendable(invoice: { status?: string | null, sent_at?: string | null }): boolean {
    return sendBlockReason(invoice) === null
}

export function chunk<T>(items: T[], size: number): T[][] {
    const batches: T[][] = []

    for (let i = 0; i < items.length; i += size) {
        batches.push(items.slice(i, i + size))
    }

    return batches
}
