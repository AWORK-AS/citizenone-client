/**
 * Unit tests for composables/invoiceBulkSend.ts - which invoices the bulk-send
 * checkbox offers, and how a long selection is split into requests of at most
 * 200 (the API's limit).
 *
 *   node --test tests/unit/invoiceBulkSend.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { chunk, isSendable, sendBlockReason } from '../../composables/invoiceBulkSend.ts'

describe('sendBlockReason', () => {
    test('an unsent draft or booked invoice is sendable', () => {
        assert.equal(sendBlockReason({ status: 'draft', sent_at: null }), null)
        assert.equal(isSendable({ status: 'sent' }), true)
    })

    test('an invoice that has gone out is already sent', () => {
        assert.equal(sendBlockReason({ status: 'sent', sent_at: '2026-10-01T10:00:00Z' }), 'already_sent')
    })

    test('cancelled and credited invoices are not sendable, whatever sent_at says', () => {
        assert.equal(sendBlockReason({ status: 'cancelled', sent_at: null }), 'not_sendable')
        assert.equal(sendBlockReason({ status: 'credited', sent_at: '2026-10-01' }), 'not_sendable')
    })
})

describe('chunk', () => {
    test('splits at the limit and keeps the order', () => {
        const items = Array.from({ length: 450 }, (_, i) => i)
        const batches = chunk(items, 200)

        assert.deepEqual(batches.map(b => b.length), [200, 200, 50])
        assert.deepEqual(batches.flat(), items)
    })

    test('nothing gives no batches', () => {
        assert.deepEqual(chunk([], 200), [])
    })
})
