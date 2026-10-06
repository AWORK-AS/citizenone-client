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
    bindingEndsOn,
    canCreateEconomicDraft,
    canRecreateEconomicDraft,
    economicDraftActionKey,
    economicDraftPayload,
    economicStatus,
    economicSyncState,
    shouldKeepPollingEconomic,
    isEconomicSyncedPayment,
    addOnAmount,
    addOnAmountIsComputed,
    addOnFields,
    ECONOMIC_SYNC_STATES,
    missingEconomicNumber,
    parseEconomicCustomerNumber,
    buildAddOnInstallment,
    withDefaultCoverage,
    buildPresetInstallments,
    forecastBucketTotals,
    installmentsDifference,
    installmentsMatchContract,
    installmentsSum,
    invoicePaymentState,
    isBankTransferInvoice,
    isInvoiceFree,
    isCancellationRemainder,
    AGREEMENT_TEMPLATES,
    noticeStatus,
    unwrapData,
    unwrapInstallments,
    unwrapPreview,
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
    settled_externally_before: '', settled_note: '', term_mode: 'months', ends_on: '', renewal_annual_value: '',
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
        assert.deepEqual(Object.keys(body.installments[0]).sort(), ['amount', 'covers_from', 'covers_to', 'due_on', 'label'])
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

    test('unwrapPreview reads the installments and the derived figures', () => {
        const preview = unwrapPreview({ data: {
            installments: [{ uuid: null, sequence: 1, due_on: '2026-07-12', amount: 284140.8, label: 'Rate 1' }],
            ends_on: '2030-07-12', notice_deadline: '2030-04-12', contract_value: 947136,
            contract_mrr: 19732, contract_arr: 236784, total: 947136,
        } })
        assert.equal(preview.installments.length, 1)
        assert.equal(preview.ends_on, '2030-07-12')
        assert.equal(preview.notice_deadline, '2030-04-12')
        assert.equal(preview.contract_mrr, 19732)
        assert.equal(preview.contract_arr, 236784)
    })

    test('the installment with an invoice is the locked one', () => {
        assert.ok(agreementResource.installments[0].invoice)
    })
})

describe('settled externally', () => {
    test('empty settled fields are sent as null, filled ones as given', () => {
        const empty = buildAgreementPayload(baseForm())
        assert.equal(empty.settled_externally_before, null)
        assert.equal(empty.settled_note, null)
        const filled = buildAgreementPayload({ ...baseForm(), settled_externally_before: '2026-10-01', settled_note: ' e-conomic 297637275 ' })
        assert.equal(filled.settled_externally_before, '2026-10-01')
        assert.equal(filled.settled_note, 'e-conomic 297637275')
    })

    test('agreement and bank-transfer invoices never take the card pay flow', () => {
        assert.equal(isBankTransferInvoice({ invoice_type: 'bank_transfer' }), true)
        assert.equal(isBankTransferInvoice({ type: 'agreement' }), true)
        assert.equal(isBankTransferInvoice({ type: 'new', invoice_type: null }), false)
        assert.equal(invoicePaymentState({ is_paid: false, status: 'pending', type: 'agreement' }), 'bank_transfer_unpaid')
    })
})

describe('end date, renewal value and covered invoices', () => {
    test('months mode sends term_months and no ends_on', () => {
        const body = buildAgreementPayload(baseForm())
        assert.equal(body.term_months, 48)
        assert.equal('ends_on' in body, false)
        assert.equal(body.renewal_annual_value, null)
    })

    test('end-date mode sends ends_on and leaves term_months to the backend', () => {
        // Langebjerg: 2025-06-10 to 2028-09-01.
        const body = buildAgreementPayload({ ...baseForm(), starts_on: '2025-06-10', term_mode: 'end_date', ends_on: '2028-09-01' })
        assert.equal(body.ends_on, '2028-09-01')
        assert.equal('term_months' in body, false)
    })

    test('a renewal value is sent as a number', () => {
        assert.equal(buildAgreementPayload({ ...baseForm(), renewal_annual_value: '236784.00' }).renewal_annual_value, 236784)
    })

    test('a covered invoice is its own payment state', () => {
        assert.equal(invoicePaymentState({ covered_by_agreement: true, is_paid: false, status: 'pending' }), 'covered')
    })

    test('pickers leave out invoices on an installment or already covered', () => {
        assert.equal(isInvoiceFree({ covered_by_agreement: true }), false)
        assert.equal(isInvoiceFree({ company_agreement_installment_id: 5 }), false)
        assert.equal(isInvoiceFree({ covered_by_agreement: false }), true)
        assert.equal(isInvoiceFree({}), true)
    })
})

describe('templates and the cancellation remainder', () => {
    test('the A-customer template is 48 months, 25 / 3 / 12, bank transfer, fee 295', () => {
        const a4 = AGREEMENT_TEMPLATES.find((t) => t.key === 'a4').values
        assert.equal(a4.term_months, 48)
        assert.equal(a4.billing_plan, 'installments')
        assert.deepEqual(a4.preset, { upfront_percent: 25, remaining_count: 3, remaining_interval_months: 12 })
        assert.equal(a4.payment_method, 'bank_transfer')
        assert.equal(a4.fee_per_invoice, 295)
        assert.equal(a4.notice_months, 3)
        assert.equal(a4.auto_renews, true)
        const rows = buildPresetInstallments(400000, '2026-07-12', a4.preset)
        assert.deepEqual(rows.map((r) => r.amount), [100000, 100000, 100000, 100000])
    })

    test('the Memox template is 30 / 3 / 12 and the blank one has no values', () => {
        assert.deepEqual(AGREEMENT_TEMPLATES.find((t) => t.key === 'memox').values.preset,
            { upfront_percent: 30, remaining_count: 3, remaining_interval_months: 12 })
        assert.equal(AGREEMENT_TEMPLATES.find((t) => t.key === 'empty').values, null)
        assert.equal(AGREEMENT_TEMPLATES.find((t) => t.key === 'monthly').values.term_months, 12)
    })

    test('recognises the remainder installment label', () => {
        assert.equal(isCancellationRemainder('Restbeløb ved opsigelse'), true)
        assert.equal(isCancellationRemainder('Rate 1 af 4'), false)
        assert.equal(isCancellationRemainder(null), false)
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

describe('installment coverage', () => {
    const rows = [{ due_on: '2026-07-12', amount: 100, label: null }, { due_on: '2027-07-12', amount: 100, label: null }]

    test('installments plan covers start to end of the binding', () => {
        const out = withDefaultCoverage(rows, 'installments', '2026-07-12', '2030-07-12')
        for (const row of out) {
            assert.equal(row.covers_from, '2026-07-12')
            assert.equal(row.covers_to, '2030-07-12')
        }
    })

    test('other plans stay null so the backend fills them in', () => {
        const out = withDefaultCoverage(rows, 'yearly', '2026-07-12', '2030-07-12')
        assert.deepEqual(out.map((r) => [r.covers_from, r.covers_to]), [[null, null], [null, null]])
    })

    test('an explicit period is never overwritten', () => {
        const out = withDefaultCoverage([{ ...rows[0], covers_from: '2027-01-01', covers_to: '2027-12-31' }], 'installments', '2026-07-12', '2030-07-12')
        assert.equal(out[0].covers_from, '2027-01-01')
        assert.equal(out[0].covers_to, '2027-12-31')
    })

    test('binding end follows months or the typed end date', () => {
        assert.equal(bindingEndsOn({ starts_on: '2026-07-12', term_mode: 'months', ends_on: '', term_months: 48 }), '2030-07-12')
        assert.equal(bindingEndsOn({ starts_on: '2026-07-12', term_mode: 'end_date', ends_on: '2029-01-31', term_months: 48 }), '2029-01-31')
        assert.equal(bindingEndsOn({ starts_on: '', term_mode: 'months', ends_on: '', term_months: 48 }), '')
    })

    test('tilkoeb row is due today and covers today until the binding ends', () => {
        const row = buildAddOnInstallment('2027-03-01', '2030-07-12')
        assert.equal(row.due_on, '2027-03-01')
        assert.equal(row.covers_from, '2027-03-01')
        assert.equal(row.covers_to, '2030-07-12')
        assert.equal(row.label, 'Tilkøb')
    })

    test('payload carries coverage in the explicit list', () => {
        const form = {
            name: 'x', starts_on: '2026-07-12', term_months: 48, term_mode: 'months', ends_on: '', renewal_annual_value: '',
            notice_months: 3, auto_renews: true, billing_plan: 'installments', prepaid_years: null, contract_value: 200,
            fee_per_invoice: 0, payment_method: 'bank_transfer', internal_note: '', settled_externally_before: '', settled_note: '',
            preset: { upfront_percent: 0, remaining_count: 0, remaining_interval_months: 12 },
            installments: [...rows, buildAddOnInstallment('2027-03-01', '2030-07-12')], installmentsEdited: true, presetApplied: false,
        }
        const body = buildAgreementPayload(form)
        assert.equal(body.installments[0].covers_from, '2026-07-12')
        assert.equal(body.installments[0].covers_to, '2030-07-12')
        assert.equal(body.installments[2].covers_from, '2027-03-01')
    })
})

const agreementInvoice = { type: 'agreement', linked_to_installment: true }

describe('e-conomic status', () => {
    test('every sync state maps to a chip; unknown values and no state map to nothing', () => {
        assert.deepEqual(ECONOMIC_SYNC_STATES, ['pending', 'in_flight', 'created', 'unknown', 'failed', 'draft_missing', 'booked', 'paid'])
        for (const state of ECONOMIC_SYNC_STATES) {
            const chip = economicStatus({ economic_sync_state: state })
            assert.equal(chip.state, state)
            assert.ok(chip.color && chip.icon)
        }
        assert.equal(economicStatus({}), null)
        assert.equal(economicStatus(null), null)
        assert.equal(economicStatus({ economic_sync_state: 'bogus' }), null)
        assert.equal(economicSyncState({ economic_sync_state: 'bogus' }), null)
    })

    test('shows the draft number until booked, then the booked number', () => {
        const base = { economic_draft_number: 4711, economic_invoice_number: 90001 }
        assert.equal(economicStatus({ ...base, economic_sync_state: 'created' }).number, '4711')
        assert.equal(economicStatus({ ...base, economic_sync_state: 'booked' }).number, '90001')
        assert.equal(economicStatus({ ...base, economic_sync_state: 'paid' }).number, '90001')
        assert.equal(economicStatus({ economic_sync_state: 'in_flight' }).number, null)
        assert.equal(economicStatus({ economic_sync_state: 'failed', economic_sync_error: 'http_422' }).error, 'http_422')
    })

    test('the draft button needs an agreement instalment invoice, and never shows for shop or card invoices', () => {
        assert.equal(canCreateEconomicDraft({ ...agreementInvoice }), true)
        assert.equal(canCreateEconomicDraft({ ...agreementInvoice, economic_sync_state: 'pending' }), true)
        assert.equal(canCreateEconomicDraft({ ...agreementInvoice, economic_sync_state: 'failed' }), true)
        for (const state of ['in_flight', 'created', 'unknown', 'draft_missing', 'booked', 'paid']) {
            assert.equal(canCreateEconomicDraft({ ...agreementInvoice, economic_sync_state: state }), false, state)
        }
        for (const type of ['monthly', 'yearly', 'recurring', 'new', 'card', null, undefined]) {
            assert.equal(canCreateEconomicDraft({ type, linked_to_installment: true }), false, String(type))
        }
        assert.equal(canCreateEconomicDraft({ type: 'agreement', linked_to_installment: false }), false)
        assert.equal(canCreateEconomicDraft({ type: 'agreement' }), false)
        assert.equal(canCreateEconomicDraft({ ...agreementInvoice, covered_by_agreement: true }), false)
        assert.equal(canCreateEconomicDraft({ ...agreementInvoice, is_paid: true }), false)
        assert.equal(canCreateEconomicDraft(null), false)
        assert.equal(economicDraftActionKey({ economic_sync_state: 'failed' }), 'retry')
        assert.equal(economicDraftActionKey({ economic_sync_state: 'pending' }), 'create')
    })

    test('"create again" is for draft_missing only and sends recreate: true', () => {
        assert.equal(canRecreateEconomicDraft({ ...agreementInvoice, economic_sync_state: 'draft_missing' }), true)
        for (const state of ['pending', 'in_flight', 'created', 'unknown', 'failed', 'booked', 'paid']) {
            assert.equal(canRecreateEconomicDraft({ ...agreementInvoice, economic_sync_state: state }), false, state)
        }
        assert.equal(canRecreateEconomicDraft({ type: 'monthly', linked_to_installment: true, economic_sync_state: 'draft_missing' }), false)
        assert.deepEqual(economicDraftPayload(true), { recreate: true })
        assert.equal(economicDraftPayload(false), undefined)
    })

    test('polls only while in flight, and gives up after the attempt budget', () => {
        assert.equal(shouldKeepPollingEconomic({ economic_sync_state: 'in_flight' }, 0), true)
        assert.equal(shouldKeepPollingEconomic({ economic_sync_state: 'in_flight' }, 19), true)
        assert.equal(shouldKeepPollingEconomic({ economic_sync_state: 'in_flight' }, 20), false)
        assert.equal(shouldKeepPollingEconomic({ economic_sync_state: 'created' }, 0), false)
        assert.equal(shouldKeepPollingEconomic({ economic_sync_state: 'failed' }, 0), false)
    })

    test('synced payments are recognised by paid_source', () => {
        assert.equal(isEconomicSyncedPayment({ paid_source: 'economic_sync' }), true)
        assert.equal(isEconomicSyncedPayment({ paid_source: 'manual' }), false)
        assert.equal(isEconomicSyncedPayment({}), false)
    })

    test('customer number is null or a positive integer', () => {
        assert.equal(parseEconomicCustomerNumber(''), null)
        assert.equal(parseEconomicCustomerNumber(null), null)
        assert.equal(parseEconomicCustomerNumber('1042'), 1042)
        assert.equal(parseEconomicCustomerNumber(12.5), null)
        assert.equal(parseEconomicCustomerNumber(0), null)
    })

    test('warns only for a running agreement without a number', () => {
        assert.equal(missingEconomicNumber({ economic_customer_number: null }, [{ status: 'active' }]), true)
        assert.equal(missingEconomicNumber({ economic_customer_number: 1042 }, [{ status: 'active' }]), false)
        assert.equal(missingEconomicNumber({ economic_customer_number: null }, [{ status: 'ended' }, { status: 'cancelled' }]), false)
        assert.equal(missingEconomicNumber(null, [{ status: 'active' }]), false)
        assert.equal(missingEconomicNumber({}, [{ status: 'active' }]), false)
    })
})

describe('add-on rows: product number, quantity, unit price', () => {
    test('amount is quantity x unit price, rounded to oere, null until both are set', () => {
        assert.equal(addOnAmount(10, 150), 1500)
        assert.equal(addOnAmount('2.5', '99.99'), 249.98)
        assert.equal(addOnAmount(3, 0.1), 0.3)
        assert.equal(addOnAmount(1.5, 33.33), 50)
        assert.equal(addOnAmount(10, ''), null)
        assert.equal(addOnAmount(null, 150), null)
        assert.equal(addOnAmount(undefined, undefined), null)
    })

    test('the amount is read-only only while both are set', () => {
        assert.equal(addOnAmountIsComputed({ quantity: 5, unit_price: 100 }), true)
        assert.equal(addOnAmountIsComputed({ quantity: 5, unit_price: '' }), false)
        assert.equal(addOnAmountIsComputed({}), false)
    })

    test('fields are numbers or null', () => {
        assert.deepEqual(addOnFields({ product_number: '3174', quantity: '5', unit_price: '100.5' }),
            { product_number: 3174, quantity: 5, unit_price: 100.5 })
        assert.deepEqual(addOnFields({ product_number: '', quantity: '', unit_price: null }),
            { product_number: null, quantity: null, unit_price: null })
        assert.equal(addOnFields({ product_number: 'abc' }).product_number, null)
    })

    test('the explicit installments[] carries the three fields on add-on rows only, with the computed amount', () => {
        const form = {
            name: 'A', starts_on: '2026-10-01', term_months: 36, term_mode: 'months', ends_on: '',
            renewal_annual_value: '', notice_months: 3, auto_renews: true, billing_plan: 'installments',
            prepaid_years: null, contract_value: 2000, fee_per_invoice: 295, payment_method: 'bank_transfer',
            internal_note: '', settled_externally_before: '', settled_note: '',
            preset: { upfront_percent: 30, remaining_count: 3, remaining_interval_months: 12 },
            installmentsEdited: true, presetApplied: false,
            installments: [
                { due_on: '2026-10-01', amount: 500, label: 'Rate 1' },
                { ...buildAddOnInstallment('2026-11-01', '2029-10-01'), product_number: '3174', quantity: 10, unit_price: 150, amount: 1 },
            ],
        }
        const rows = buildAgreementPayload(form).installments
        assert.equal('product_number' in rows[0], false)
        assert.equal('quantity' in rows[0], false)
        assert.equal(rows[1].product_number, 3174)
        assert.equal(rows[1].quantity, 10)
        assert.equal(rows[1].unit_price, 150)
        assert.equal(rows[1].amount, 1500)
    })
})
