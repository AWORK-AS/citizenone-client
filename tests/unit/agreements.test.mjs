/**
 * Unit tests for composables/agreements.ts - the pure logic behind the company
 * agreements screens, the manual payment registration and the invoice
 * payment-state text.
 *
 * Responses in this file are copied from the API contract in the agreements
 * spec (2026-10-02), so the client is exercised against the same JSON the
 * backend is built to.
 *
 *   node --test tests/unit/agreements.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
    addMonthsClamped,
    buildAgreementPayload,
    buildPresetInstallments,
    forecastBucketTotals,
    installmentsDifference,
    installmentsMatchContract,
    installmentsSum,
    invoicePaymentState,
    noticeStatus,
    unwrapData,
    unwrapInstallments,
} from '../../composables/agreements.ts'

// From the spec: the Memox example. 30 % upfront, then 3 equal installments
// every 12 months, contract value 947,136.
const memoxPreset = { upfront_percent: 30, remaining_count: 3, remaining_interval_months: 12 }

const agreementResource = {
    uuid: 'a1', company_uuid: 'c1', name: 'CitizenOne Pro inkl. AI - 180 brugere',
    starts_on: '2026-07-12', ends_on: '2030-07-12', term_months: 48,
    notice_months: 3, notice_deadline: '2030-04-12', auto_renews: true,
    billing_plan: 'installments', prepaid_years: null,
    contract_value: 947136.0, fee_per_invoice: 295.0, payment_method: 'bank_transfer',
    status: 'active', cancelled_at: null, internal_note: 'Aftaledokument juli 2026',
    contract_mrr: 19732.0, contract_arr: 236784.0,
    invoiced_total: 284140.8, paid_total: 284140.8, backlog: 662995.2,
    installments: [
        { uuid: 'i1', sequence: 1, due_on: '2026-07-12', amount: 284140.8, label: 'Rate 1 af 4',
          invoice: { uuid: 'inv1', invoice_number: '2026xxxx', is_paid: true, paid_at: '2026-07-23', total_amount_incl_vat: 355544.75 } },
    ],
    subscriptions: [{ uuid: 's1', type: 'yearly', label: 'CitizenOne Pro', user_name: null }],
}

const baseForm = () => ({
    name: ' Test ', starts_on: '2026-07-12', term_months: 48, notice_months: 3, auto_renews: true,
    billing_plan: 'installments', prepaid_years: null, contract_value: 947136, fee_per_invoice: 295,
    payment_method: 'bank_transfer', internal_note: '',
    preset: { ...memoxPreset }, installments: [], installmentsEdited: false, presetApplied: false,
})

describe('buildPresetInstallments', () => {
    test('30 / 3 / 12 reproduces the Memox schedule', () => {
        const rows = buildPresetInstallments(947136, '2026-07-12', memoxPreset)
        assert.deepEqual(rows.map((r) => r.due_on), ['2026-07-12', '2027-07-12', '2028-07-12', '2029-07-12'])
        assert.deepEqual(rows.map((r) => r.amount), [284140.8, 220998.4, 220998.4, 220998.4])
        assert.equal(installmentsSum(rows), 947136)
    })

    test('the last installment absorbs the cent difference', () => {
        const rows = buildPresetInstallments(100, '2026-01-01', { upfront_percent: 0, remaining_count: 3, remaining_interval_months: 1 })
        assert.deepEqual(rows.map((r) => r.amount), [33.33, 33.33, 33.34])
        assert.equal(installmentsSum(rows), 100)
        // Without an upfront share the first one is due on the start date.
        assert.deepEqual(rows.map((r) => r.due_on), ['2026-01-01', '2026-02-01', '2026-03-01'])
    })

    test('labels come from the callback', () => {
        const rows = buildPresetInstallments(100, '2026-01-01', memoxPreset, (n, total, pct) => `${n}/${total}/${pct}`)
        assert.equal(rows[0].label, '1/4/30')
        assert.equal(rows[1].label, '2/4/null')
    })

    test('nothing without a start date or a value', () => {
        assert.deepEqual(buildPresetInstallments(0, '2026-01-01', memoxPreset), [])
        assert.deepEqual(buildPresetInstallments(100, '', memoxPreset), [])
    })
})

describe('addMonthsClamped', () => {
    test('clamps to the end of a shorter month', () => {
        assert.equal(addMonthsClamped('2026-01-31', 1), '2026-02-28')
        assert.equal(addMonthsClamped('2027-12-31', 2), '2028-02-29')
        assert.equal(addMonthsClamped('2026-07-12', 12), '2027-07-12')
    })
})

describe('sum check', () => {
    test('matches within a cent, not beyond', () => {
        assert.equal(installmentsMatchContract([{ amount: 50 }, { amount: 49.99 }], 100), true)
        assert.equal(installmentsMatchContract([{ amount: 50 }, { amount: 49.98 }], 100), false)
    })

    test('0.1 + 0.2 never trips it', () => {
        assert.equal(installmentsMatchContract([{ amount: 0.1 }, { amount: 0.2 }], 0.3), true)
    })

    test('difference is contract minus list', () => {
        assert.equal(installmentsDifference([{ amount: 40 }], 100), 60)
        assert.equal(installmentsDifference([{ amount: 140 }], 100), -40)
    })
})

describe('buildAgreementPayload', () => {
    test('untouched preset is sent as the preset, with no explicit list', () => {
        const form = { ...baseForm(), presetApplied: true, installments: buildPresetInstallments(947136, '2026-07-12', memoxPreset) }
        const body = buildAgreementPayload(form)
        assert.deepEqual(body.installment_preset, memoxPreset)
        assert.equal(body.installments, null)
        assert.equal(body.name, 'Test')
        assert.equal(body.internal_note, null)
    })

    test('a hand-edited list is sent explicitly, never together with the preset', () => {
        const rows = buildPresetInstallments(947136, '2026-07-12', memoxPreset)
        rows[1].amount += 1
        const body = buildAgreementPayload({ ...baseForm(), presetApplied: true, installmentsEdited: true, installments: rows })
        assert.equal(body.installment_preset, null)
        assert.equal(body.installments.length, 4)
        assert.deepEqual(Object.keys(body.installments[0]).sort(), ['amount', 'due_on', 'label'])
    })

    test('other plans send neither a preset nor a list, and prepaid_years only for prepaid', () => {
        const yearly = buildAgreementPayload({ ...baseForm(), billing_plan: 'yearly', prepaid_years: 3 })
        assert.equal(yearly.installment_preset, null)
        assert.equal(yearly.installments, null)
        assert.equal(yearly.prepaid_years, null)
        const prepaid = buildAgreementPayload({ ...baseForm(), billing_plan: 'prepaid_multi_year', prepaid_years: '3' })
        assert.equal(prepaid.prepaid_years, 3)
    })

    test('numbers are numbers, as the contract says', () => {
        const body = buildAgreementPayload({ ...baseForm(), term_months: '48', contract_value: '947136.00', fee_per_invoice: '295' })
        assert.equal(body.term_months, 48)
        assert.equal(body.contract_value, 947136)
        assert.equal(body.fee_per_invoice, 295)
    })
})

describe('response shapes from the spec', () => {
    test('unwrapData accepts a wrapped and a bare resource', () => {
        assert.equal(unwrapData({ data: agreementResource }).uuid, 'a1')
        assert.equal(unwrapData(agreementResource).uuid, 'a1')
    })

    test('unwrapInstallments accepts a bare list, { installments } and { data: { installments } }', () => {
        const rows = agreementResource.installments
        assert.equal(unwrapInstallments(rows).length, 1)
        assert.equal(unwrapInstallments({ installments: rows }).length, 1)
        assert.equal(unwrapInstallments({ data: { installments: rows } }).length, 1)
        assert.deepEqual(unwrapInstallments(null), [])
    })

    test('the installment with an invoice is the locked one', () => {
        assert.ok(agreementResource.installments[0].invoice)
    })
})

describe('noticeStatus', () => {
    const today = new Date(2026, 9, 2)
    test('classifies by days to the deadline', () => {
        assert.equal(noticeStatus('2030-04-12', today).tone, 'ok')
        assert.equal(noticeStatus('2026-11-01', today).tone, 'soon')
        assert.equal(noticeStatus('2026-10-01', today).tone, 'passed')
        assert.equal(noticeStatus('2026-10-02', today).tone, 'soon')
        assert.equal(noticeStatus(null, today).tone, 'none')
    })
})

describe('invoicePaymentState - the "already paid" bug', () => {
    test('an unpaid invoice is never reported as paid', () => {
        // 20261275 was Unpaid in the list and still said "already paid".
        assert.equal(invoicePaymentState({ is_paid: false, status: 'pending', invoice_type: null }), 'unpaid')
        assert.equal(invoicePaymentState({ is_paid: false, status: 'pending', invoice_type: 'bank_transfer' }), 'bank_transfer_unpaid')
    })

    test('paid follows is_paid or status', () => {
        assert.equal(invoicePaymentState({ is_paid: true }), 'paid')
        assert.equal(invoicePaymentState({ is_paid: false, status: 'paid' }), 'paid')
    })

    test('a rejected payment is its own state', () => {
        assert.equal(invoicePaymentState({ is_paid: false, status: 'failed' }), 'failed')
    })

    test('no payment data means no claim', () => {
        assert.equal(invoicePaymentState({ invoice_number: '1' }), 'unknown')
        assert.equal(invoicePaymentState(null), 'unknown')
    })
})

describe('forecastBucketTotals', () => {
    test('sums the four buckets and treats a missing bucket as zero', () => {
        const months = [
            { month: '2026-11', contracted: 10, assumed: 5, installments: 100, assumed_renewal: 7 },
            { month: '2026-12', contracted: 10, assumed: 5 },
        ]
        assert.deepEqual(forecastBucketTotals(months), { contracted: 20, assumed: 10, installments: 100, assumed_renewal: 7 })
        assert.deepEqual(forecastBucketTotals(undefined), { contracted: 0, assumed: 0, installments: 0, assumed_renewal: 0 })
    })
})
