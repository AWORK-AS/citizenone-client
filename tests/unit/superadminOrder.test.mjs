/**
 * Unit tests for composables/superadminOrder.ts.
 *
 *   node --test tests/unit/superadminOrder.test.mjs
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
    availableProducts,
    offersOrderFlow,
    orderCanComplete,
    orderConfirmKey,
    orderEconomicLabel,
    orderLinePayload,
    orderSeatCount,
    orderStatusKey,
    orderStatusVariant,
    productKey,
} from '../../composables/superadminOrder.ts'

const users = { type: 'user', product_uuid: 'u-1', name: 'Extra User', generic_name: null, yearly_price: 468, monthly_price: 39 }
const cody = { type: 'application', product_uuid: 'c-1', name: 'Cody AI', generic_name: 'citizenone-ai', yearly_price: 690, monthly_price: 69 }

test('only invoice companies get the order flow', () => {
    assert.equal(offersOrderFlow('invoice'), true)
    assert.equal(offersOrderFlow('card'), false)
    assert.equal(offersOrderFlow(undefined), false)
})

test('status keys and pill variants', () => {
    assert.equal(orderStatusKey('transferred'), 'superadmin.companyOrders.status.transferred')
    assert.equal(orderStatusKey('nonsense'), 'superadmin.companyOrders.status.draft')
    assert.equal(orderStatusVariant('transferred'), 'success')
    assert.equal(orderStatusVariant('failed'), 'danger')
    assert.equal(orderStatusVariant('completed'), 'warning')
    assert.equal(orderStatusVariant('cancelled'), 'neutral')
    assert.equal(orderStatusVariant(null), 'neutral')
})

test('line payload: licences need no product uuid, an app does', () => {
    assert.deepEqual(orderLinePayload(productKey(users), '10'), { type: 'user', quantity: 10 })
    assert.deepEqual(orderLinePayload(productKey(cody), 10), { type: 'application', product_uuid: 'c-1', quantity: 10 })
    assert.equal(orderLinePayload(productKey(cody), 0), null)
    assert.equal(orderLinePayload(productKey(cody), 1001), null)
    assert.equal(orderLinePayload('storage:x', 1), null)
    assert.equal(orderLinePayload('', 1), null)
})

test('complete only for a priced draft with lines', () => {
    const order = { status: 'draft', lines: [{}], quote: { total_amount: 1 }, quote_error: null }
    assert.equal(orderCanComplete(order), true)
    assert.equal(orderCanComplete({ ...order, lines: [] }), false)
    assert.equal(orderCanComplete({ ...order, status: 'completed' }), false)
    assert.equal(orderCanComplete({ ...order, quote: null, quote_error: { code: 'x' } }), false)
    assert.equal(orderCanComplete(null), false)
})

test('seat count and confirmation text', () => {
    const quote = { lines: [{ quantity: 10 }, { quantity: 10 }], total_amount: 54115.94 }
    assert.equal(orderSeatCount(quote), 20)
    assert.equal(orderSeatCount(null), 0)
    assert.equal(orderConfirmKey(quote), 'superadmin.companyOrders.confirm.body')
    assert.equal(orderConfirmKey({ total_amount: 0 }), 'superadmin.companyOrders.confirm.bodyFree')
})

test('a product already on the order is not offered again', () => {
    const left = availableProducts([users, cody], [{ type: 'user', product_uuid: 'u-1' }])
    assert.deepEqual(left.map(p => p.name), ['Cody AI'])
})

test('e-conomic label follows the status', () => {
    assert.deepEqual(orderEconomicLabel({ status: 'transferred', invoice: { economic_draft_number: 9001 } }),
        { key: 'superadmin.companyOrders.economic.draft', params: { number: 9001 } })
    assert.deepEqual(orderEconomicLabel({ status: 'transferred', invoice: { economic_draft_number: 9001, economic_invoice_number: 7101 } }),
        { key: 'superadmin.companyOrders.economic.booked', params: { number: 7101 } })
    assert.deepEqual(orderEconomicLabel({ status: 'failed', invoice: { economic_error: 'post_unknown' } }),
        { key: 'superadmin.companyOrders.economic.failed', params: { reason: 'post_unknown' } })
    assert.equal(orderEconomicLabel({ status: 'completed', invoice: {} }).key, 'superadmin.companyOrders.economic.pending')
    assert.equal(orderEconomicLabel({ status: 'completed', invoice: null }).key, 'superadmin.companyOrders.economic.none')
    assert.equal(orderEconomicLabel({ status: 'draft', invoice: null }).key, 'superadmin.companyOrders.economic.notYet')
})
