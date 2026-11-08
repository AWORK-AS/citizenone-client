/**
 * Unit tests for composables/licenseGrant.ts.
 *
 *   node --test tests/unit/licenseGrant.test.mjs
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
    CREATE_AGREEMENT,
    defaultGrantTerm,
    grantBillingTextKey,
    grantCanSave,
    grantNeedsReason,
    grantReasonValid,
    grantSaveLabel,
    grantTermOptions,
    grantToast,
    isGrantTerm,
    licenseOrderItems,
    licenseOrderStatusKey,
    licenseOrderTone,
} from '../../composables/licenseGrant.ts'

const agreement = { uuid: 'a-1', name: 'Rammeaftale', ends_on: '2030-07-14', last_day: '2030-07-13' }
const billing = (method, text_key = method) => ({ method, text_key, customer_number: 3815, invoice_email: null, finance_notified: false, no_charge_reason: null })

test('term options: agreements, 1-4 years, then create', () => {
    const options = grantTermOptions({ agreements: [agreement], yearly: true, formatDate: d => d.split('-').reverse().join('.') })
    assert.deepEqual(options.map(o => o.value), ['agreement:a-1', 'years:1', 'years:2', 'years:3', 'years:4', CREATE_AGREEMENT])
    assert.deepEqual(options[0].params, { name: 'Rammeaftale', date: '13.07.2030' })
})

test('a monthly grant has no years to choose', () => {
    const options = grantTermOptions({ agreements: [], yearly: false, formatDate: d => d })
    assert.deepEqual(options.map(o => o.value), ['years:1', CREATE_AGREEMENT])
    assert.match(options[0].labelKey, /term\.monthly$/)
})

test('default term follows the agreement only when the flag is on for an invoice company', () => {
    assert.equal(defaultGrantTerm({ agreements: [agreement], followsAgreement: true, paysByInvoice: true }), 'agreement:a-1')
    assert.equal(defaultGrantTerm({ agreements: [agreement], followsAgreement: false, paysByInvoice: true }), 'years:1')
    assert.equal(defaultGrantTerm({ agreements: [agreement], followsAgreement: true, paysByInvoice: false }), 'years:1')
    assert.equal(defaultGrantTerm({ agreements: [], followsAgreement: true, paysByInvoice: true }), 'years:1')
})

test('only real terms are sent', () => {
    assert.ok(isGrantTerm('years:4'))
    assert.ok(isGrantTerm('agreement:x'))
    assert.ok(!isGrantTerm('years:5'))
    assert.ok(!isGrantTerm(CREATE_AGREEMENT))
})

test('billing sentence key per method, unknown falls back', () => {
    assert.match(grantBillingTextKey(billing('economic_auto')), /billing\.economic_auto$/)
    assert.match(grantBillingTextKey({ text_key: 'weird' }), /billing\.unknown$/)
    assert.match(grantBillingTextKey(null), /billing\.unknown$/)
})

test('a not-billable customer needs a reason of 5 to 500 characters', () => {
    assert.ok(grantNeedsReason(billing('none', 'none_customer_number')))
    assert.ok(!grantNeedsReason(billing('economic_auto')))
    assert.ok(!grantReasonValid('abc'))
    assert.ok(grantReasonValid('  Kompensation  '))
    assert.ok(!grantReasonValid('x'.repeat(501)))
})

test('save is disabled until the quote is in and, if needed, a reason is given', () => {
    const base = { quantity: 2, quote: { billing: billing('economic_auto') }, quoteLoading: false, reason: '', term: 'years:1', saving: false }
    assert.ok(grantCanSave(base))
    assert.ok(!grantCanSave({ ...base, quoteLoading: true }))
    assert.ok(!grantCanSave({ ...base, quote: null }))
    assert.ok(!grantCanSave({ ...base, quantity: 0 }))
    assert.ok(!grantCanSave({ ...base, term: CREATE_AGREEMENT }))
    const none = { ...base, quote: { billing: billing('none', 'none_customer_number') } }
    assert.ok(!grantCanSave(none))
    assert.ok(grantCanSave({ ...none, reason: 'Aftalt med kunden' }))
})

test('save label shows the amount when the customer is billed', () => {
    assert.deepEqual(grantSaveLabel({ billing: billing('economic_auto'), total_amount: 2526.33 }), { key: 'superadmin.companies.licenseOverview.grant.save.invoice', withAmount: true })
    assert.equal(grantSaveLabel({ billing: billing('none'), total_amount: 100 }).key, 'superadmin.companies.licenseOverview.grant.save.noCharge')
    assert.equal(grantSaveLabel({ billing: billing('included'), total_amount: 0 }).withAmount, false)
    assert.equal(grantSaveLabel(null).withAmount, false)
})

test('toast names invoice, amount and how it is billed', () => {
    const toast = grantToast({ billing: billing('economic_auto'), invoice_number: '20261003', invoice_total: 2526.33 })
    assert.equal(toast.key, 'superadmin.companies.licenseOverview.grant.toast.economic_auto')
    assert.deepEqual(toast.params, { number: '20261003', amount: 2526.33, customer: 3815 })
    assert.match(grantToast({ billing: billing('none', 'no_charge') }).key, /toast\.noCharge$/)
    assert.match(grantToast({ billing: billing('included'), invoice_number: null }).key, /toast\.included$/)
    assert.equal(grantToast({}), null)
})

test('licence order status badges', () => {
    assert.equal(licenseOrderTone('booked'), 'green')
    assert.equal(licenseOrderTone('error'), 'red')
    assert.equal(licenseOrderTone('finance'), 'amber')
    assert.equal(licenseOrderTone('no_invoice'), 'gray')
    assert.equal(licenseOrderStatusKey('bogus'), 'superadmin.orders.licenseOrders.status.pending')
    assert.equal(licenseOrderItems([{ name: 'Extra User', quantity: 2 }, { name: 'Servicegebyr', quantity: 1 }]), '2 × Extra User, 1 × Servicegebyr')
})
