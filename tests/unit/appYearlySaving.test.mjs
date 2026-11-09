/**
 * Unit tests for composables/appYearlySaving.ts: the per-month price and the saving
 * of yearly billing, worked out from the app's own prices.
 *
 *   node --test tests/unit/appYearlySaving.test.mjs
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { yearlySaving } from '../../composables/appYearlySaving.ts'

test('info screen: 89 a month, 961.20 a year gives 80.10 a month and 10 % saved', () => {
    assert.deepEqual(yearlySaving({ monthly_price: '89.00', yearly_price: '961.20' }), { perMonth: 80.1, amount: 106.8, percent: 10 })
})

test('follows a changed price', () => {
    assert.deepEqual(yearlySaving({ monthly_price: 99, yearly_price: 990 }), { perMonth: 82.5, amount: 198, percent: 16.7 })
})

test('nothing when yearly is not cheaper than twelve months', () => {
    assert.equal(yearlySaving({ monthly_price: 50, yearly_price: 600 }), null)
    assert.equal(yearlySaving({ monthly_price: 50, yearly_price: 700 }), null)
})

test('nothing for a one-off, a free app or a missing price', () => {
    assert.equal(yearlySaving({ is_one_time_fee: true, monthly_price: 10, yearly_price: 100 }), null)
    assert.equal(yearlySaving({ is_free: true, monthly_price: 10, yearly_price: 100 }), null)
    assert.equal(yearlySaving({ monthly_price: 0, yearly_price: 100 }), null)
    assert.equal(yearlySaving({ monthly_price: 10, yearly_price: null }), null)
    assert.equal(yearlySaving(null), null)
})
