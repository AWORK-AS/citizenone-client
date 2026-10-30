/**
 * Unit tests for composables/billingMethod.ts.
 *
 *   node --test tests/unit/billingMethod.test.mjs
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
    actionNeedsNote,
    actionTakesNote,
    billingMethodDirty,
    billingMethodPayload,
    cardSecurityState,
    dunningActions,
    grantNotice,
    invoiceChip,
    normalizeCompanyBilling,
    normalizeDunningStatus,
    pausedServices,
    invoiceCounts,
    grantChargesCardNow,
    securityChargeUnavailable,
    suspendedLogin,
    wallMode,
    validateDunningAction,
} from '../../composables/billingMethod.ts'

test('a company with no billing fields is a card company with no security card', () => {
    const billing = normalizeCompanyBilling({})
    assert.equal(billing.billing_method, 'card')
    assert.equal(billing.invoice_card_security, false)
    assert.equal(billing.card_masked, null)
    assert.equal(normalizeCompanyBilling(null).billing_method, 'card')
    assert.equal(normalizeCompanyBilling({ data: { economic_customer_number: 1234 } }).economic_draft, true)
    assert.equal(normalizeCompanyBilling({ data: {} }).economic_draft, false)
})

test('a null billing method on the customer standing means a running agreement', () => {
    assert.equal(normalizeCompanyBilling({ data: { billing_method: null } }).under_agreement, true)
    assert.equal(normalizeCompanyBilling({ data: { billing_method: 'invoice' } }).under_agreement, false)
    assert.equal(normalizeCompanyBilling({ data: {} }).under_agreement, false)
})

test('an unknown billing method falls back to card, never to invoice', () => {
    assert.equal(normalizeCompanyBilling({ billing_method: 'wire' }).billing_method, 'card')
    assert.equal(normalizeCompanyBilling({ data: { billing_method: 'invoice' } }).billing_method, 'invoice')
})

test('switching to card clears the invoice-only flags', () => {
    assert.deepEqual(
        billingMethodPayload({ billing_method: 'card', invoice_card_security: true, leverandorservice: true }),
        { billing_method: 'card', invoice_card_security: false, leverandorservice: false },
    )
    assert.deepEqual(
        billingMethodPayload({ billing_method: 'invoice', invoice_card_security: true, leverandorservice: false }),
        { billing_method: 'invoice', invoice_card_security: true, leverandorservice: false },
    )
})

test('dirty ignores flags that a card company cannot have', () => {
    const saved = { billing_method: 'card', invoice_card_security: false, leverandorservice: false }
    assert.equal(billingMethodDirty(saved, { ...saved, invoice_card_security: true }), false)
    assert.equal(billingMethodDirty(saved, { ...saved, billing_method: 'invoice' }), true)
})

test('card security state', () => {
    assert.equal(cardSecurityState({ invoice_card_security: false, card_masked: null }), 'off')
    assert.equal(cardSecurityState({ invoice_card_security: true, card_masked: null }), 'missing')
    assert.equal(cardSecurityState({ invoice_card_security: true, card_masked: '•••• 1234' }), 'attached')
})

test('grant notice: agreement wins over billing method', () => {
    const base = { economicDraft: true }
    assert.equal(grantNotice({ ...base, billingMethod: 'invoice', underAgreement: true }), 'agreement')
    assert.equal(grantNotice({ ...base, billingMethod: 'card', underAgreement: true }), 'agreement')
    assert.equal(grantNotice({ ...base, billingMethod: 'card', underAgreement: false }), 'card')
    assert.equal(grantNotice({ ...base, billingMethod: 'invoice', underAgreement: false }), 'invoice_economic')
    assert.equal(grantNotice({ economicDraft: false, billingMethod: 'invoice', underAgreement: false }), 'invoice')
})

test('invoice chip: only unresolved failures are rejected', () => {
    assert.equal(invoiceChip({ status: 'failed' }), 'failed')
    assert.equal(invoiceChip({ status: 'failed', resolved_at: '2026-10-01' }), 'resolved')
    assert.equal(invoiceChip({ status: 'resolved' }), 'resolved')
    assert.equal(invoiceChip({ status: 'failed', is_resolved: true }), 'resolved')
    assert.equal(invoiceChip({ status: 'paid' }), 'paid')
    assert.equal(invoiceChip({ is_paid: true, status: 'failed' }), 'paid')
    assert.equal(invoiceChip({ covered_by_agreement: true, status: 'failed' }), 'covered')
    assert.equal(invoiceChip({ status: 'pending' }), 'pending')
    assert.equal(invoiceChip(null), 'pending')
})

test('dunning actions are exactly what the API allows, in a fixed order', () => {
    assert.deepEqual(
        dunningActions({ actions: { retry: true, send_card_link: true, charge_security_card: false, close: true, reopen: false, postpone: true } }),
        ['retry', 'send_card_link', 'close', 'postpone'],
    )
    assert.deepEqual(dunningActions({ actions: { postpone: true, reopen: true } }), ['reopen', 'postpone'])
    assert.deepEqual(dunningActions({ actions: {} }), [])
    assert.deepEqual(dunningActions({}), [])
})

test('the security charge is shown disabled for invoice customers with card security', () => {
    assert.equal(securityChargeUnavailable({ billing_method: 'invoice', invoice_card_security: true, actions: { charge_security_card: false } }), true)
    assert.equal(securityChargeUnavailable({ billing_method: 'invoice', invoice_card_security: true, actions: { charge_security_card: true } }), false)
    assert.equal(securityChargeUnavailable({ billing_method: 'invoice', invoice_card_security: false, actions: {} }), false)
    assert.equal(securityChargeUnavailable({ billing_method: 'card', invoice_card_security: false, actions: {} }), false)
})

test('only postpone needs a note; reopen takes an optional one; close takes none', () => {
    assert.equal(actionNeedsNote('postpone'), true)
    assert.equal(actionNeedsNote('close'), false)
    assert.equal(actionNeedsNote('reopen'), false)
    assert.equal(actionTakesNote('reopen'), true)
    assert.equal(actionTakesNote('close'), false)
    assert.equal(validateDunningAction('close', { note: '' }), null)
    assert.equal(validateDunningAction('reopen', { note: '' }), null)
    assert.equal(validateDunningAction('reopen', { note: '', days: '' }), null)
    assert.equal(validateDunningAction('reopen', { note: '', days: 0 }), 'days')
    assert.equal(validateDunningAction('reopen', { note: 'Betalt', days: 7 }), null)
    assert.equal(validateDunningAction('reopen', { note: 'x'.repeat(501), days: 7 }), 'note')
    assert.equal(validateDunningAction('postpone', { note: '  ', days: 7 }), 'note')
    assert.equal(validateDunningAction('postpone', { note: 'Aftalt', days: 0 }), 'days')
    assert.equal(validateDunningAction('postpone', { note: 'Aftalt', days: 7 }), null)
    assert.equal(validateDunningAction('postpone', { note: 'Aftalt', days: 91 }), 'days')
    assert.equal(validateDunningAction('postpone', { note: 'Aftalt', days: 2.5 }), 'days')
    assert.equal(validateDunningAction('postpone', { note: 'Aftalt', days: null }), 'days')
    assert.equal(validateDunningAction('retry', { note: '' }), null)
})

test('normalizeDunningStatus falls back to past_due', () => {
    assert.equal(normalizeDunningStatus('nonsense'), 'past_due')
    assert.equal(normalizeDunningStatus(undefined), 'past_due')
    assert.equal(normalizeDunningStatus('suspended'), 'suspended')
})

test('invoice counts never yield NaN, and resolved is null when not reported', () => {
    assert.deepEqual(invoiceCounts(undefined), { total: 0, paid: 0, pending: 0, failed: 0, covered: 0, resolved: null })
    assert.deepEqual(invoiceCounts({}), { total: 0, paid: 0, pending: 0, failed: 0, covered: 0, resolved: null })
    const old = invoiceCounts({ paid_invoices_count: 5, pending_invoices_count: 2, failed_invoices_count: 1, covered_invoices_count: 1 })
    assert.equal(old.total, 9)
    assert.equal(old.resolved, null)
    assert.equal(invoiceCounts({ total_invoices_count: 40, paid_invoices_count: 'x' }).paid, 0)
    assert.equal(invoiceCounts({ total_invoices_count: 40 }).total, 40)
    assert.equal(invoiceCounts({ resolved_invoices_count: 0 }).resolved, 0)
    assert.equal(invoiceCounts({ meta: { resolved_invoices_count: 3 } }).resolved, 3)
    // Summed totals include resolved attempts, which are no longer in the failed count.
    assert.equal(invoiceCounts({ paid_invoices_count: 1, failed_invoices_count: 1, resolved_invoices_count: 2 }).total, 4)
    for (const value of Object.values(invoiceCounts({ paid_invoices_count: undefined, failed_invoices_count: null }))) {
        assert.ok(value === null || Number.isFinite(value))
    }
})

test('wall: an admin gets the card flow, others are told to contact the admin', () => {
    assert.equal(wallMode({ status: 'suspended', can_manage: true, billing_method: 'card', renewal_token: 't' }), 'update_card')
    assert.equal(wallMode({ status: 'suspended', can_manage: false }), 'contact_admin')
    assert.equal(wallMode({ status: 'past_due', can_manage: true, billing_method: 'card' }), 'update_card')
    assert.equal(wallMode({ status: 'past_due', can_manage: true }), 'update_card')
    assert.equal(wallMode({ status: 'past_due', can_manage: false }), 'notice')
    assert.equal(wallMode({ status: 'ok', can_manage: true }), 'none')
    assert.equal(wallMode(null), 'none')
    assert.equal(wallMode(undefined), 'none')
    assert.equal(wallMode({ status: 'suspended', can_manage: true }, true), 'none')
})

test('wall: an invoice company admin gets no card flow, only "invoice unpaid, contact us"', () => {
    assert.equal(wallMode({ status: 'suspended', can_manage: true, billing_method: 'invoice' }), 'invoice_overdue')
    assert.equal(wallMode({ status: 'past_due', can_manage: true, billing_method: 'invoice' }), 'invoice_overdue')
    // A suspended admin with no renewal token has nothing the card flow can pay.
    assert.equal(wallMode({ status: 'suspended', can_manage: true }), 'invoice_overdue')
    assert.equal(wallMode({ status: 'suspended', can_manage: true, billing_method: 'card' }), 'update_card')
    // Non-admins of an invoice company still just contact their administrator.
    assert.equal(wallMode({ status: 'suspended', can_manage: false, billing_method: 'invoice' }), 'contact_admin')
})

test('a suspended login gives an admin the renewal link and everyone else the contact text', () => {
    const admin = suspendedLogin({ code: 'subscription_suspended', can_manage: true, renewal_token: 'abc', message: 'm' })
    assert.deepEqual(admin, { view: 'update_card', token: 'abc', message: 'm' })
    assert.equal(suspendedLogin({ code: 'subscription_suspended', can_manage: false, message: 'm' }).view, 'contact_admin')
    assert.equal(suspendedLogin({ code: 'subscription_suspended', can_manage: false, renewal_token: 'abc' }).view, 'contact_admin')
    assert.equal(suspendedLogin({ code: 'subscription_suspended', can_manage: false, renewal_token: 'abc' }).token, null)
    assert.equal(suspendedLogin({ code: 'other' }), null)
    assert.equal(suspendedLogin(null), null)
})

test('a suspended invoice-company admin (no token) gets invoice_overdue, not a dead end', () => {
    const login = suspendedLogin({ code: 'subscription_suspended', can_manage: true, message: 'm' })
    assert.deepEqual(login, { view: 'invoice_overdue', token: null, message: 'm' })
    assert.equal(suspendedLogin({ code: 'subscription_suspended', can_manage: true, renewal_token: '' }).view, 'invoice_overdue')
})

test('paused services', () => {
    assert.deepEqual(pausedServices({ ai_payment_missing: true }), ['ai'])
    assert.deepEqual(pausedServices({ sms_paused: true, ai_paused: true }), ['ai', 'sms'])
    assert.deepEqual(pausedServices(null), [])
})


test('normalizeCompanyBilling tolerates undefined, empty and wrapped payloads', () => {
    for (const input of [undefined, {}, { data: {} }, { data: undefined }]) {
        const billing = normalizeCompanyBilling(input)
        assert.equal(billing.billing_method, 'card')
        assert.equal(billing.invoice_card_security, false)
        assert.equal(billing.leverandorservice, false)
        assert.equal(billing.card_masked, null)
        assert.equal(billing.under_agreement, false)
    }
    assert.equal(normalizeCompanyBilling({ data: { billing_method: null } }).under_agreement, true)
    assert.equal(normalizeCompanyBilling({ data: { billing_method: null } }).billing_method, 'card')
    assert.equal(normalizeCompanyBilling({ data: { security_card: { masked: '•••• 1234', expiry: '08/28' } } }).card_expiry, '08/28')
})

test('grant notice over the full method x agreement x e-conomic matrix', () => {
    for (const billingMethod of ['card', 'invoice']) {
        for (const underAgreement of [true, false]) {
            for (const economicDraft of [true, false]) {
                const expected = underAgreement ? 'agreement'
                    : billingMethod === 'card' ? 'card'
                        : economicDraft ? 'invoice_economic' : 'invoice'
                assert.equal(grantNotice({ billingMethod, underAgreement, economicDraft }), expected,
                    `${billingMethod}/${underAgreement}/${economicDraft}`)
            }
        }
    }
})

test('only the card notice charges the card now', () => {
    assert.equal(grantChargesCardNow('card'), true)
    for (const notice of ['invoice', 'invoice_economic', 'agreement']) assert.equal(grantChargesCardNow(notice), false)
})

test('invoice chip: is_resolved undefined or false does not resolve a failure', () => {
    assert.equal(invoiceChip({ status: 'failed', is_resolved: undefined }), 'failed')
    assert.equal(invoiceChip({ status: 'failed', is_resolved: false, resolved_at: null }), 'failed')
    assert.equal(invoiceChip({ status: 'failed', is_resolved: true }), 'resolved')
})

test('dunning actions: a null actions map offers nothing', () => {
    assert.deepEqual(dunningActions({ actions: null }), [])
    assert.deepEqual(dunningActions({ actions: { retry: 'yes' } }), [])
})

test('paused services: null, empty and the SMS flag', () => {
    assert.deepEqual(pausedServices(null), [])
    assert.deepEqual(pausedServices(undefined), [])
    assert.deepEqual(pausedServices({}), [])
    assert.deepEqual(pausedServices({ payment_paused: true }), ['sms'])
})
