/**
 * Unit tests for composables/superadminToday.ts.
 *
 *   node --test tests/unit/superadminToday.test.mjs
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
    normalizeToday,
    splitSections,
    allClear,
    hiddenCount,
    rowHref,
    reasonTone,
    toneBadgeClass,
    reasonKey,
    dateLabelKey,
    sectionKey,
    greetingKey,
    formatKroner,
    todayDate,
    kpiChips,
    SECTION_ORDER,
} from '../../composables/superadminToday.ts'

const row = (overrides = {}) => ({
    id: 'r1',
    company: { uuid: 'c1', name: 'Bostedet Lyset' },
    title: 'Bostedet Lyset',
    amount: 500,
    date: '2026-12-01',
    date_kind: 'ends',
    reason: 'no_auto_renew',
    meta: {},
    ...overrides,
})

const payload = {
    data: {
        date: '2026-11-08',
        kpis: { open_items: 3, outstanding_amount: '1500.5', orders_awaiting_economic: 2, new_inquiries: null },
        sections: [
            { key: 'overdue_invoices', count: 1, amount: 1500.5, rows: [row({ date_kind: 'due', reason: 'ready_to_close' })] },
            { key: 'payment_problems', count: 0, amount: 0, rows: [] },
            { key: 'something_new', count: 9, rows: [] },
            { key: 'license_orders', count: 2, amount: null, rows: [row({ company: null })] },
        ],
    },
}

test('normalizeToday keeps known sections in a fixed order and coerces numbers', () => {
    const today = normalizeToday(payload)
    assert.deepEqual(today.sections.map((s) => s.key), ['payment_problems', 'license_orders', 'overdue_invoices'])
    assert.equal(today.kpis.outstanding_amount, 1500.5)
    assert.equal(today.kpis.new_inquiries, null)
    assert.equal(today.date, '2026-11-08')
    assert.equal(today.sections[1].rows[0].company, null)
    assert.equal(today.sections[1].amount, null)
})

test('normalizeToday survives an empty or broken payload', () => {
    const today = normalizeToday(undefined)
    assert.deepEqual(today.sections, [])
    assert.equal(today.kpis.open_items, 0)
    assert.equal(normalizeToday({ data: { sections: 'nope' } }).sections.length, 0)
})

test('splitSections and allClear separate work from calm', () => {
    const { sections } = normalizeToday(payload)
    const { open, calm } = splitSections(sections)
    assert.deepEqual(open.map((s) => s.key), ['license_orders', 'overdue_invoices'])
    assert.deepEqual(calm.map((s) => s.key), ['payment_problems'])
    assert.equal(allClear(sections), false)
    assert.equal(allClear(calm), true)
    assert.equal(allClear([]), true)
})

test('hiddenCount is what "Se alle" adds beyond the rows shown', () => {
    assert.equal(hiddenCount({ key: 'agreements', count: 7, amount: null, rows: [row(), row(), row(), row(), row()] }), 2)
    assert.equal(hiddenCount({ key: 'agreements', count: 1, amount: null, rows: [row()] }), 0)
})

test('rowHref goes straight to the task', () => {
    assert.equal(rowHref('agreements', row()), '/superadmin/companies/c1/agreements')
    assert.equal(rowHref('overdue_invoices', row()), '/superadmin/companies/c1/invoices')
    assert.equal(rowHref('payment_problems', row()), '/superadmin/billing-problems')
    assert.equal(rowHref('license_orders', row()), '/superadmin/orders')
    assert.equal(rowHref('sales_inquiries', row({ id: 'abc' })), '/superadmin/sales-inquiries?inquiry=abc')
    assert.equal(rowHref('agreements', row({ company: null })), '/superadmin/companies')
})

test('danger is kept for real problems', () => {
    assert.equal(reasonTone('reminder_3'), 'danger')
    assert.equal(reasonTone('ready_to_close'), 'danger')
    assert.equal(reasonTone('economic_error'), 'danger')
    assert.equal(reasonTone('reminder_1'), 'warning')
    assert.equal(reasonTone('no_auto_renew'), 'warning')
    assert.equal(reasonTone('source_book_demo'), 'neutral')
    assert.equal(toneBadgeClass('danger'), 'co-badge-red')
    assert.equal(toneBadgeClass('neutral'), 'co-badge-gray')
})

test('i18n keys', () => {
    assert.equal(reasonKey('reminder_2'), 'superadmin.today.reason.reminder_2')
    assert.equal(reasonKey(''), 'superadmin.today.reason.unknown')
    assert.equal(dateLabelKey('ends'), 'superadmin.today.date.ends')
    assert.equal(sectionKey('agreements', 'title'), 'superadmin.today.section.agreements.title')
})

test('greetingKey follows the clock', () => {
    assert.equal(greetingKey(new Date(2026, 10, 8, 7)), 'superadmin.today.greeting.morning')
    assert.equal(greetingKey(new Date(2026, 10, 8, 12)), 'superadmin.today.greeting.day')
    assert.equal(greetingKey(new Date(2026, 10, 8, 19)), 'superadmin.today.greeting.evening')
})

test('formatKroner and todayDate', () => {
    assert.equal(formatKroner(12345.6), '12.346 kr.')
    assert.equal(formatKroner(0), '0 kr.')
    assert.equal(formatKroner(-1500), '-1.500 kr.')
    assert.equal(formatKroner(null), '—')
    assert.equal(todayDate('2026-12-01'), '01.12.2026')
    assert.equal(todayDate(null), '')
})

test('kpiChips leaves out figures the colleague may not see', () => {
    const chips = kpiChips(normalizeToday(payload).kpis)
    assert.deepEqual(chips.map((c) => c.key), ['open_items', 'outstanding_amount', 'orders_awaiting_economic'])
    assert.equal(chips[1].value, '1.501 kr.')
    assert.deepEqual(kpiChips({ open_items: 0, outstanding_amount: null, orders_awaiting_economic: null, new_inquiries: 4 }).map((c) => c.key), ['open_items', 'new_inquiries'])
})

test('SECTION_ORDER matches the API order', () => {
    assert.deepEqual(SECTION_ORDER, ['meetings_today', 'missed_demos', 'payment_problems', 'license_orders', 'agreements', 'sales_inquiries', 'overdue_invoices'])
})

test('a meeting row opens the host page, a missed demo its inquiry', () => {
    const row = (meta, id = 'abc') => ({ id, company: null, title: null, amount: null, date: null, date_kind: 'starts', reason: '', meta })
    assert.equal(rowHref('meetings_today', row({ path: '/meetings/u-1' })), '/meetings/u-1')
    // Never an outside address from the payload.
    assert.equal(rowHref('meetings_today', row({ path: 'https://evil.test/meetings/x' })), '/superadmin/meetings')
    assert.equal(rowHref('missed_demos', row({}, 'inq-1')), '/superadmin/sales-inquiries?inquiry=inq-1')
    assert.equal(reasonTone('demo_missed'), 'danger')
})
