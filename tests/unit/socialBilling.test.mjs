/**
 * Unit tests for composables/socialBilling.ts - the period the invoice note
 * names, the extraction's optional filters, and which invoices can be deleted.
 *
 *   node --test tests/unit/socialBilling.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { billedSpan, deletableInvoices, extractionParams } from '../../composables/socialBilling.ts'

describe('billedSpan', () => {
    test('without anything dated it is the chosen window', () => {
        assert.deepEqual(billedSpan({ rows: [] }, '2026-09-01', '2026-09-30'), { from: '2026-09-01', to: '2026-09-30' })
    })

    test('an earlier unbilled month widens the start', () => {
        const group = {
            rows: [{
                used_hours: 0,
                period_from: '2026-09-01',
                period_to: '2026-09-30',
                contract_lines: [
                    { is_billed: false, period_from: '2026-08-01', period_to: '2026-09-30' },
                ],
            }],
        }

        assert.deepEqual(billedSpan(group, '2026-09-01', '2026-09-30'), { from: '2026-08-01', to: '2026-09-30' })
    })

    test('a period billed in advance widens the end; billed lines and rows without hours do not count', () => {
        const group = {
            rows: [
                { used_hours: 5, period_from: '2026-09-01', period_to: '2026-09-30', contract_lines: [
                    { is_billed: false, period_from: '2026-10-01', period_to: '2026-10-31' },
                    { is_billed: true, period_from: '2026-01-01', period_to: '2026-01-31' },
                ] },
                { used_hours: 0, period_from: '2025-01-01', period_to: '2025-01-31', contract_lines: [] },
            ],
        }

        assert.deepEqual(billedSpan(group, '2026-09-01', '2026-09-30'), { from: '2026-09-01', to: '2026-10-31' })
    })
})

describe('extractionParams', () => {
    test('leaves the billing filters out when none is chosen', () => {
        assert.deepEqual(
            extractionParams({ from_date: '2026-11-01', to_date: '2026-11-30', group_by: 'customer', billing_timing: '', billing_frequency: '' }),
            { from_date: '2026-11-01', to_date: '2026-11-30', group_by: 'customer' },
        )
    })

    test('sends the chosen filters', () => {
        const params = extractionParams({ from_date: 'a', to_date: 'b', group_by: 'customer', billing_timing: 'in_advance', billing_frequency: 'monthly' })

        assert.equal(params.billing_timing, 'in_advance')
        assert.equal(params.billing_frequency, 'monthly')
    })
})

describe('deletableInvoices', () => {
    test('only invoices the server marks deletable', () => {
        const invoices = [{ uuid: 'a', is_deletable: true }, { uuid: 'b', is_deletable: false }, { uuid: 'c' }]

        assert.deepEqual(deletableInvoices(invoices).map((invoice) => invoice.uuid), ['a'])
    })
})
