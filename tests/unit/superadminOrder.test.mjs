/**
 * Unit tests for composables/superadminOrder.ts.
 *
 *   node --test tests/unit/superadminOrder.test.mjs
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
    ORDER_STATUSES,
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

test('every status has its own key and pill variant', () => {
    const variants = { draft: 'info', completed: 'warning', transferred: 'success', failed: 'danger', cancelled: 'neutral' }
    for (const status of ORDER_STATUSES) {
        assert.equal(orderStatusKey(status), `superadmin.companyOrders.status.${status}`)
        assert.equal(orderStatusVariant(status), variants[status])
    }
    assert.equal(orderStatusVariant(undefined), 'neutral')
    assert.equal(orderStatusVariant('TRANSFERRED'), 'neutral')
    assert.equal(orderStatusKey(undefined), 'superadmin.companyOrders.status.draft')
})

test('line payload rejects quantities the API would refuse', () => {
    const key = productKey(users)
    for (const quantity of [0, -1, 1001, 1e6, NaN, Infinity, '', 'ten', null, undefined, 1.5, '2.5', true, []]) {
        assert.equal(orderLinePayload(key, quantity), null, `quantity ${String(quantity)}`)
    }
    assert.deepEqual(orderLinePayload(key, 1), { type: 'user', quantity: 1 })
    assert.deepEqual(orderLinePayload(key, 1000), { type: 'user', quantity: 1000 })
    assert.deepEqual(orderLinePayload(key, ' 7 '), { type: 'user', quantity: 7 })
})

test('line payload rejects a malformed picker value', () => {
    for (const key of [null, undefined, ':', 'user:', ':u-1', 'application:', 'Application:c-1', 'storage:s-1']) {
        assert.equal(orderLinePayload(key, 1), null, `key ${String(key)}`)
    }
    assert.deepEqual(orderLinePayload(productKey({ type: 'department', product_uuid: 'd-1' }), 2), { type: 'department', quantity: 2 })
})

test('complete is offered for nothing but a priced draft', () => {
    const order = { status: 'draft', lines: [{}], quote: { total_amount: 0 }, quote_error: null }
    // An order of only included seats has a zero quote and can still be completed.
    assert.equal(orderCanComplete(order), true)
    assert.equal(orderCanComplete(undefined), false)
    assert.equal(orderCanComplete({}), false)
    assert.equal(orderCanComplete({ status: 'draft' }), false)
    assert.equal(orderCanComplete({ ...order, lines: undefined }), false)
    assert.equal(orderCanComplete({ ...order, quote: undefined }), false)
    assert.equal(orderCanComplete({ ...order, quote_error: { code: 'superadmin_order_economic_off' } }), false)
    for (const status of ['completed', 'transferred', 'failed', 'cancelled', undefined]) {
        assert.equal(orderCanComplete({ ...order, status }), false, String(status))
    }
})

test('confirmation inputs from an empty, partial or string payload', () => {
    assert.equal(orderSeatCount(undefined), 0)
    assert.equal(orderSeatCount({}), 0)
    assert.equal(orderSeatCount({ lines: [] }), 0)
    // Free seats are granted too, so they count.
    assert.equal(orderSeatCount({ lines: [{ quantity: 5, free: 3, paid: 2 }, { quantity: '2' }, { quantity: null }, {}] }), 7)
    assert.equal(orderConfirmKey(undefined), 'superadmin.companyOrders.confirm.bodyFree')
    assert.equal(orderConfirmKey({}), 'superadmin.companyOrders.confirm.bodyFree')
    assert.equal(orderConfirmKey({ total_amount: '0.00' }), 'superadmin.companyOrders.confirm.bodyFree')
    assert.equal(orderConfirmKey({ total_amount: '2998.66' }), 'superadmin.companyOrders.confirm.body')
    assert.equal(orderConfirmKey({ total_amount: 0.01 }), 'superadmin.companyOrders.confirm.body')
})

test('available products survive null input and keep products of other types', () => {
    assert.deepEqual(availableProducts(null, null), [])
    assert.deepEqual(availableProducts([users, cody], null).map(p => p.name), ['Extra User', 'Cody AI'])
    assert.deepEqual(availableProducts([users, cody], []).length, 2)
    // Same uuid, other type: still offered.
    assert.deepEqual(availableProducts([users], [{ type: 'application', product_uuid: 'u-1' }]).map(p => p.name), ['Extra User'])
    // A line whose product was deleted (no uuid) hides nothing.
    assert.deepEqual(availableProducts([users, cody], [{ type: 'user', product_uuid: null }]).length, 2)
    assert.deepEqual(availableProducts([users, cody], [{ type: 'user', product_uuid: 'u-1' }, { type: 'application', product_uuid: 'c-1' }]), [])
})

test('e-conomic label for every state and partial payloads', () => {
    const label = order => orderEconomicLabel(order)
    assert.deepEqual(label({ status: 'transferred', invoice: null }), { key: 'superadmin.companyOrders.economic.draft', params: { number: '—' } })
    assert.deepEqual(label({ status: 'transferred', invoice: { economic_draft_number: null, economic_invoice_number: null } }),
        { key: 'superadmin.companyOrders.economic.draft', params: { number: '—' } })
    assert.deepEqual(label({ status: 'failed', invoice: null }), { key: 'superadmin.companyOrders.economic.failed', params: { reason: '—' } })
    assert.deepEqual(label({ status: 'failed', invoice: { economic_error: null } }), { key: 'superadmin.companyOrders.economic.failed', params: { reason: '—' } })
    assert.equal(label({ status: 'completed' }).key, 'superadmin.companyOrders.economic.none')
    assert.equal(label({ status: 'draft' }).key, 'superadmin.companyOrders.economic.notYet')
    // A cancelled order is never sent: it has no invoice, not one "not sent yet".
    assert.equal(label({ status: 'cancelled', invoice: null }).key, 'superadmin.companyOrders.economic.none')
    assert.equal(label({}).key, 'superadmin.companyOrders.economic.notYet')
    assert.equal(label(null).key, 'superadmin.companyOrders.economic.notYet')
    assert.equal(label(undefined).key, 'superadmin.companyOrders.economic.notYet')
})
