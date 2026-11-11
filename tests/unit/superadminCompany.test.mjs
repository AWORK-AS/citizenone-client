/**
 * Unit tests for composables/superadminCompany.ts.
 *
 *   node --test tests/unit/superadminCompany.test.mjs
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
    activeCompanyTab,
    appendEvents,
    billingLabel,
    companyStatusPill,
    companyTabs,
    upcomingMeetingsBadge,
    eventIcon,
    eventParams,
    eventTone,
    groupEventsByMonth,
    toggleType,
    typesQuery,
} from '../../composables/superadminCompany.ts'

test('status pill: tone per status, the stage only on a reminder', () => {
    assert.deepEqual(companyStatusPill({ status: 'reminder', reminder_stage: 2 }), {
        status: 'reminder', tone: 'pending', labelKey: 'superadmin.companyHeader.status.reminder', params: { stage: 2 },
    })
    assert.equal(companyStatusPill({ status: 'active', reminder_stage: null }).tone, 'ok')
    assert.equal(companyStatusPill({ status: 'collection', reminder_stage: null }).tone, 'failure')
    assert.equal(companyStatusPill({ status: 'closed', reminder_stage: null }).tone, 'muted')
    assert.equal(companyStatusPill({ status: 'written_off', reminder_stage: null }).tone, 'muted')
    assert.equal(companyStatusPill({ status: 'trial', reminder_stage: null }).tone, 'info')
    assert.deepEqual(companyStatusPill({ status: 'collection', reminder_stage: 3 }).params, {})
})

test('status pill: a reminder without a stage says stage 1, an unknown status reads as active, none is null', () => {
    assert.equal(companyStatusPill({ status: 'reminder', reminder_stage: null }).params.stage, 1)
    assert.equal(companyStatusPill({ status: 'something_new', reminder_stage: null }).status, 'active')
    assert.equal(companyStatusPill(null), null)
})

test('billing label: card, invoice, Leverandørservice, billed from e-conomic', () => {
    assert.equal(billingLabel({ billing_method: 'card', leverandorservice: true, billed_from_economic: false }), 'card')
    assert.equal(billingLabel({ billing_method: 'invoice', leverandorservice: false, billed_from_economic: false }), 'invoice')
    assert.equal(billingLabel({ billing_method: 'invoice', leverandorservice: true, billed_from_economic: false }), 'leverandorservice')
    assert.equal(billingLabel({ billing_method: 'invoice', leverandorservice: true, billed_from_economic: true }), 'economic')
    assert.equal(billingLabel(null), null)
})

test('tabs: in order, filtered by permission, with the company in every link', () => {
    const all = companyTabs('abc', () => true)
    assert.deepEqual(all.map((t) => t.key), ['overview', 'accounts', 'licenses', 'apps', 'agreements', 'invoices', 'history', 'meetings', 'edit', 'migration'])
    assert.equal(all.find((t) => t.key === 'licenses').href, '/superadmin/companies/abc/license-overview')
    assert.equal(all.find((t) => t.key === 'history').labelKey, 'superadmin.companyHeader.tabs.history')

    const supporter = companyTabs('abc', (p) => ['view_companies', 'view_accounts', 'manage_imports'].includes(p))
    assert.deepEqual(supporter.map((t) => t.key), ['overview', 'accounts', 'licenses', 'apps', 'history', 'meetings', 'migration'])
})

test('active tab: sub-pages count as their tab', () => {
    assert.equal(activeCompanyTab('superadmin-companies-company_uuid-accounts-new'), 'accounts')
    assert.equal(activeCompanyTab('superadmin-companies-company_uuid-invoices-invoice_uuid-invoice-details'), 'invoices')
    assert.equal(activeCompanyTab('superadmin-companies-company_uuid-history'), 'history')
    assert.equal(activeCompanyTab('superadmin-dashboard'), null)
    assert.equal(activeCompanyTab(undefined), null)
})

const ev = (id, occurred_at, extra = {}) => ({ id, type: 'invoice', kind: 'invoice_created', occurred_at, title: '', params: {}, detail: null, amount: null, actor: null, link: null, ...extra })

test('grouping by month: newest month first, order within a month kept', () => {
    const groups = groupEventsByMonth([
        ev('a', '2026-11-03T10:00:00+01:00'),
        ev('b', '2026-11-01T09:00:00+01:00'),
        ev('c', '2026-10-30T12:00:00+01:00'),
        ev('d', '2025-12-24T12:00:00+01:00'),
    ], 'Europe/Copenhagen')
    assert.deepEqual(groups.map((g) => g.key), ['2026-11', '2026-10', '2025-12'])
    assert.deepEqual(groups[0].events.map((e) => e.id), ['a', 'b'])
    assert.equal(groups[2].year, 2025)
    assert.equal(groups[2].month, 12)
})

test('grouping by month: the local month, not the UTC one, and bad dates skipped', () => {
    // 23:30 UTC on 31 October is 00:30 on 1 November in Copenhagen.
    const groups = groupEventsByMonth([ev('late', '2026-10-31T23:30:00Z'), ev('bad', 'not a date')], 'Europe/Copenhagen')
    assert.deepEqual(groups.map((g) => g.key), ['2026-11'])
    assert.equal(groups[0].events.length, 1)
})

test('paging: a repeated event is shown once', () => {
    const merged = appendEvents([ev('a', '2026-11-03T10:00:00Z'), ev('b', '2026-11-02T10:00:00Z')], [ev('b', '2026-11-02T10:00:00Z'), ev('c', '2026-11-01T10:00:00Z')])
    assert.deepEqual(merged.map((e) => e.id), ['a', 'b', 'c'])
})

test('filter chips: toggle keeps the canonical order; all or none is no filter', () => {
    assert.deepEqual(toggleType(['payment'], 'invoice'), ['invoice', 'payment'])
    assert.deepEqual(toggleType(['invoice', 'payment'], 'invoice'), ['payment'])

    const available = ['company', 'license', 'access']
    assert.equal(typesQuery([], available), undefined)
    assert.equal(typesQuery(['company', 'license', 'access'], available), undefined)
    assert.equal(typesQuery(['license', 'access'], available), 'license,access')
    assert.equal(typesQuery(['invoice'], available), undefined, 'a type the viewer cannot see is ignored')
})

test('event tone and icon', () => {
    assert.equal(eventTone('payment_failed'), 'failure')
    assert.equal(eventTone('invoice_reminder_sent'), 'pending')
    assert.equal(eventTone('invoice_paid'), 'ok')
    assert.equal(eventTone('written_off'), 'muted')
    assert.equal(eventTone('invoice_created'), 'info')
    assert.equal(eventIcon('payment'), 'ph:credit-card')
    assert.equal(eventIcon('unknown'), 'ph:circle')
})

test('event params: nulls dropped, booleans as numbers', () => {
    assert.deepEqual(eventParams({ params: { number: 1001, name: null, agreement: true, empty: '' } }), { number: 1001, agreement: 1 })
    assert.deepEqual(eventParams({ params: undefined }), {})
})

test('the Meetings tab counts meetings still to come and pulses for today', () => {
    const now = new Date('2026-11-11T10:00:00')
    const meetings = [
        { status: 'scheduled', starts_at: '2026-11-11T14:00:00', ends_at: '2026-11-11T14:30:00' },
        { status: 'scheduled', starts_at: '2026-11-20T09:00:00', ends_at: '2026-11-20T09:30:00' },
        { status: 'finished', starts_at: '2026-11-10T09:00:00', ends_at: '2026-11-10T09:30:00' },
        { status: 'cancelled', starts_at: '2026-11-12T09:00:00', ends_at: '2026-11-12T09:30:00' },
    ]
    assert.deepEqual(upcomingMeetingsBadge(meetings, now), { count: 2, soon: true })
    assert.deepEqual(upcomingMeetingsBadge(meetings.slice(1), now), { count: 1, soon: false })
    assert.deepEqual(upcomingMeetingsBadge([], now), { count: 0, soon: false })
})
