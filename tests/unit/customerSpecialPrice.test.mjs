/**
 * Unit tests for composables/customerSpecialPrice.ts - special prices kept on
 * a customer and the customer chosen on an offer.
 *
 *   node --test tests/unit/customerSpecialPrice.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
    customerChoices, customerLabel, emptySpecialPriceRow, formatPrice, knownCustomerUuid, specialPriceApplies,
    specialPricePayload, specialPriceRow,
} from '../../composables/customerSpecialPrice.ts'

const customers = [
    { uuid: 'a', customer_label: 'Kommune A', name: 'Børn', is_active: true },
    { uuid: 'b', customer_label: null, name: 'Privat', is_active: true },
    { uuid: 'c', customer_label: 'Kommune C', name: 'Voksne', is_active: false },
]

describe('choosing the customer on an offer', () => {
    test('a customer reads as customer and department', () => {
        assert.equal(customerLabel(customers[0]), 'Kommune A, Børn')
        assert.equal(customerLabel(customers[1]), 'Privat')
        assert.equal(customerLabel(null), '')
    })

    test('only active customers are offered, unless an inactive one is already chosen', () => {
        assert.deepEqual(customerChoices(customers, null).map(choice => choice.value), ['a', 'b'])
        assert.deepEqual(customerChoices(customers, 'c').map(choice => choice.value), ['a', 'b', 'c'])
        assert.deepEqual(customerChoices(customers, 'a')[0], { value: 'a', label: 'Kommune A, Børn' })
        assert.deepEqual(customerChoices(undefined, null), [])
    })

    test('a customer no longer in the list is not sent', () => {
        assert.equal(knownCustomerUuid('a', customers), 'a')
        assert.equal(knownCustomerUuid('c', customers), 'c')
        assert.equal(knownCustomerUuid('gone', customers), null)
        assert.equal(knownCustomerUuid(null, customers), null)
        assert.equal(knownCustomerUuid('', customers), null)
        assert.equal(knownCustomerUuid('a', []), null)
    })

    test('the special price applies when any hourly rate came from the customer', () => {
        const result = (sources) => ({
            assumptions: Object.entries(sources).map(([key, source]) => ({ key, source })),
        })

        assert.equal(specialPriceApplies(result({ hourly_rate: 'customer', admin_hourly_rate: 'fallback' })), true)
        assert.equal(specialPriceApplies(result({ hourly_rate: 'manual', transport_hourly_rate: 'customer' })), true)
        assert.equal(specialPriceApplies(result({ hourly_rate: 'catalogue', admin_hourly_rate: 'fallback' })), false)
        // Only the three hourly rates count.
        assert.equal(specialPriceApplies(result({ weeks_per_month: 'customer' })), false)
        assert.equal(specialPriceApplies(null), false)
    })
})

describe('special price rows', () => {
    test('a new row starts today with nothing else filled in', () => {
        const row = emptySpecialPriceRow('2026-10-14')

        assert.equal(row.valid_from, '2026-10-14')
        assert.equal(row.inquiry_service_type_uuid, null)
        assert.equal(row.hourly_rate, '')
        assert.equal(row.uuid, '')
    })

    test('a saved price maps onto the row, missing amounts as empty fields', () => {
        const row = specialPriceRow({
            uuid: 'p1', service_type: { uuid: 't1', label: 'Familiebehandling (§ 32)' }, valid_from: '2026-08-01',
            hourly_rate: '700.00', admin_hourly_rate: null, transport_hourly_rate: '350.00', note: null,
        })

        assert.deepEqual(row, {
            uuid: 'p1', inquiry_service_type_uuid: 't1', valid_from: '2026-08-01',
            hourly_rate: '700.00', admin_hourly_rate: '', transport_hourly_rate: '350.00', note: '',
        })
    })

    test('the payload sends every field, numbers as numbers and blanks as null', () => {
        assert.deepEqual(specialPricePayload({
            inquiry_service_type_uuid: 't1', valid_from: '2026-08-01', hourly_rate: '650,50',
            admin_hourly_rate: '', transport_hourly_rate: ' 300 ', note: '  ',
        }), {
            inquiry_service_type_uuid: 't1', valid_from: '2026-08-01', hourly_rate: 650.5,
            admin_hourly_rate: null, transport_hourly_rate: 300, note: null,
        })
    })

    test('text that is not an amount is sent as typed, for the server to reject', () => {
        assert.equal(specialPricePayload({ hourly_rate: 'abc' }).hourly_rate, 'abc')
        assert.equal(specialPricePayload({}).inquiry_service_type_uuid, null)
        assert.equal(specialPricePayload({}).valid_from, null)
    })

    test('amounts read the way the offer shows them', () => {
        assert.equal(formatPrice('550.00'), (550).toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' kr.')
        assert.equal(formatPrice(null), '')
        assert.equal(formatPrice(''), '')
    })
})
