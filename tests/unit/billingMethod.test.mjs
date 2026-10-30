/**
 * Unit tests for composables/billingMethod.ts.
 *
 *   node --test tests/unit/billingMethod.test.mjs
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
    actionNeedsNote,
    billingMethodDirty,
    billingMethodPayload,
    cardSecurityState,
    dunningActions,
    grantNotice,
    invoiceChip,
    normalizeCompanyBilling,
    normalizeDunningStatus,
    pausedServices,
    problemCount,
    suspendedView,
    validateDunningAction,
} from '../../composables/billingMethod.ts'

test('a company with no billing fields is a card company with no security card', () => {
    const billing = normalizeCompanyBilling({})
    assert.equal(billing.billing_method, 'card')
    assert.equal(billing.invoice_card_security, false)
    assert.equal(billing.card_masked, null)
    assert.equal(normalizeCompanyBilling(null).billing_method, 'card')
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
    assert.equal(invoiceChip({ status: 'paid' }), 'paid')
    assert.equal(invoiceChip({ is_paid: true, status: 'failed' }), 'paid')
    assert.equal(invoiceChip({ covered_by_agreement: true, status: 'failed' }), 'covered')
    assert.equal(invoiceChip({ status: 'pending' }), 'pending')
    assert.equal(invoiceChip(null), 'pending')
})

test('dunning actions follow billing method and card security', () => {
    const open = { status: 'behind', over_cap: false, has_security_card: false, invoice_card_security: false }
    assert.deepEqual(dunningActions({ ...open, billing_method: 'card' }), ['retry', 'send_card_link', 'close', 'snooze'])
    assert.deepEqual(dunningActions({ ...open, billing_method: 'invoice' }), ['close', 'snooze'])
    assert.deepEqual(
        dunningActions({ ...open, billing_method: 'invoice', invoice_card_security: true, has_security_card: true }),
        ['charge_security_card', 'send_card_link', 'close', 'snooze'],
    )
    assert.deepEqual(
        dunningActions({ ...open, billing_method: 'invoice', invoice_card_security: true, has_security_card: true, over_cap: true }),
        ['send_card_link', 'close', 'snooze'],
    )
    assert.deepEqual(dunningActions({ ...open, billing_method: 'card', status: 'closed' }), ['retry', 'send_card_link', 'reopen'])
})

test('state changing actions require a note; snooze also needs days', () => {
    assert.equal(actionNeedsNote('retry'), false)
    assert.equal(actionNeedsNote('close'), true)
    assert.equal(validateDunningAction('close', { note: '  ' }), 'note')
    assert.equal(validateDunningAction('close', { note: 'Aftalt med kunden' }), null)
    assert.equal(validateDunningAction('snooze', { note: 'Aftalt', days: 0 }), 'days')
    assert.equal(validateDunningAction('snooze', { note: 'Aftalt', days: 7 }), null)
    assert.equal(validateDunningAction('snooze', { note: 'Aftalt', days: 400 }), 'days')
    assert.equal(validateDunningAction('retry', { note: '' }), null)
})

test('badge counts what waits on a human, not snoozed rows', () => {
    assert.equal(problemCount([{ status: 'behind' }, { status: 'snoozed' }, { status: 'ready_to_close' }, { status: 'closed' }]), 3)
    assert.equal(normalizeDunningStatus('nonsense'), 'behind')
})

test('only an Admin gets the update-card flow', () => {
    assert.equal(suspendedView({ roles: [{ name: 'Admin' }] }), 'update_card')
    assert.equal(suspendedView({ roles: [{ name: 'Employee' }] }), 'contact_admin')
    assert.equal(suspendedView(null), 'contact_admin')
})

test('paused services', () => {
    assert.deepEqual(pausedServices({ ai_payment_missing: true }), ['ai'])
    assert.deepEqual(pausedServices({ sms_paused: true, ai_paused: true }), ['ai', 'sms'])
    assert.deepEqual(pausedServices(null), [])
})
