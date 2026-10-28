/**
 * Unit tests for composables/codyNudge.ts: which Cody banner an admin sees, when a dismissed
 * one comes back, the price line and the superadmin report rows. A company that has Cody is
 * never offered it.
 *
 *   node --test tests/unit/codyNudge.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import {
    DISMISS_DAYS, bannerSurface, bannerVariant, demandCount, isBannerDismissed, nudgeReportRows,
    parseDismissRecord, priceLine,
} from '../../composables/codyNudge.ts'

const DAY = 86400000
const NOW = Date.UTC(2026, 9, 27, 12)

const base = { canPurchase: true, hasAccess: false, trialDismissed: false, bannerDismissed: false, seatsDismissed: false }
const admin = (extra = {}) => ({ can_manage: true, company_has_cody: false, has_access: false, trial: { active: false, available: true }, ...extra })
const variant = (status, opts = {}) => bannerVariant({ ...base, status, ...opts })

describe('bannerVariant', () => {
    test('no status, or someone who cannot buy: nothing', () => {
        assert.equal(variant(null), null)
        assert.equal(variant(admin(), { canPurchase: false }), null)
    })
    test('admin without Cody: try free when the trial is open, else turn on', () => {
        assert.equal(variant(admin()), 'adminTrial')
        assert.equal(variant(admin({ trial: { active: false, available: false } })), 'adminEnable')
    })
    test('a running trial keeps its countdown, demand or not', () => {
        assert.equal(variant(admin({ trial: { active: true }, demand: { staff_count: 4 } })), 'trial')
        assert.equal(variant(admin({ trial: { active: true } }), { trialDismissed: true }), null)
    })
    test('a company that has Cody is never offered it', () => {
        assert.equal(variant(admin({ company_has_cody: true })), null)
        assert.equal(variant(admin({ company_has_cody: true, has_access: false }), { hasAccess: false }), null)
        assert.equal(variant({ ...admin({ company_has_cody: true }), can_manage: false }), null)
    })
    test('a company with Cody and waiting staff: the seats banner, for the licence admin only', () => {
        const s = admin({ company_has_cody: true, has_access: true, demand: { staff_count: 3 } })
        assert.equal(variant(s, { hasAccess: true }), 'seats')
        assert.equal(variant({ ...s, can_manage: false }, { hasAccess: true }), null)
        assert.equal(variant(s, { seatsDismissed: true }), null)
        // Closing the buy banner does not hide the seats one.
        assert.equal(variant(s, { bannerDismissed: true }), 'seats')
    })
    test('a seat of your own or a closed banner: nothing', () => {
        assert.equal(variant(admin(), { hasAccess: true }), null)
        assert.equal(variant(admin(), { bannerDismissed: true }), null)
    })
    test('only the admin banners and the seats banner are measured', () => {
        assert.equal(bannerSurface('adminTrial'), 'banner')
        assert.equal(bannerSurface('adminEnable'), 'banner')
        assert.equal(bannerSurface('seats'), 'seats')
        assert.equal(bannerSurface('trial'), null)
        assert.equal(bannerSurface(null), null)
    })
})

describe('banner reappearance', () => {
    test('closed stays closed while demand has not grown', () => {
        assert.equal(isBannerDismissed({ at: NOW - DAY, count: 3 }, 3, NOW), true)
        assert.equal(isBannerDismissed({ at: NOW - DAY, count: 3 }, 2, NOW), true)
    })
    test('comes back when more staff have asked since', () => {
        assert.equal(isBannerDismissed({ at: NOW - DAY, count: 3 }, 4, NOW), false)
        assert.equal(isBannerDismissed({ at: NOW - DAY, count: 0 }, 1, NOW), false)
    })
    test('comes back after the dismissal period anyway', () => {
        assert.equal(isBannerDismissed({ at: NOW - DISMISS_DAYS * DAY, count: 5 }, 0, NOW), false)
    })
    test('never closed: shown', () => {
        assert.equal(isBannerDismissed(null, 0, NOW), false)
    })
    test('reads the old bare timestamp and the new record', () => {
        assert.deepEqual(parseDismissRecord(String(NOW)), { at: NOW, count: 0 })
        assert.deepEqual(parseDismissRecord(JSON.stringify({ at: NOW, count: 2 })), { at: NOW, count: 2 })
        assert.equal(parseDismissRecord(null), null)
        assert.equal(parseDismissRecord('garbage'), null)
    })
    test('demand count is a whole non-negative number', () => {
        assert.equal(demandCount({ demand: { staff_count: 3 } }), 3)
        assert.equal(demandCount({ demand: null }), 0)
        assert.equal(demandCount({ demand: { staff_count: -1 } }), 0)
        assert.equal(demandCount(null), 0)
    })
})

describe('priceLine', () => {
    const fmt = (a) => (a == null ? '' : `${a} kr.`)
    const priced = admin({ price: { amount_gross: 128.5, per: 'month', seats: 3 } })

    test('per month with the seat count, as a plural', () => {
        assert.deepEqual(priceLine(priced, true, fmt), { key: 'cody.adoption.price.monthSeats', params: { amount: '128.5 kr.', count: 3 }, count: 3 })
    })
    test('without a seat count, and yearly', () => {
        assert.deepEqual(priceLine(admin({ price: { amount_gross: 100, per: 'month' } }), true, fmt), { key: 'cody.adoption.price.month', params: { amount: '100 kr.' } })
        assert.equal(priceLine(admin({ price: { amount_gross: 1000, per: 'year', seats: 1 } }), true, fmt).key, 'cody.adoption.price.yearSeats')
    })
    test('never to someone who cannot buy', () => {
        assert.equal(priceLine(priced, false, fmt), null)
    })
    test('never to a company that has Cody, nor during a trial', () => {
        assert.equal(priceLine({ ...priced, company_has_cody: true }, true, fmt), null)
        assert.equal(priceLine({ ...priced, trial: { active: true } }, true, fmt), null)
    })
    test('nothing without a price', () => {
        assert.equal(priceLine(admin(), true, fmt), null)
        assert.equal(priceLine(admin({ price: { amount_gross: null } }), true, fmt), null)
    })
})

describe('nudgeReportRows', () => {
    const zero = { impressions: 0, viewers: 0, clicks: 0, try_free: 0, buy: 0, companies: 0, trial_started: 0, bought: 0 }
    test('newest week first, empty cells left out', () => {
        const report = {
            surfaces: ['banner', 'prompt'],
            weeks: [
                { week: '2026-W41', starts_on: '2026-10-05', surfaces: { banner: { ...zero, impressions: 2, companies: 2, bought: 1 }, prompt: zero } },
                { week: '2026-W42', starts_on: '2026-10-12', surfaces: { banner: zero, prompt: { ...zero, clicks: 1 } } },
            ],
            totals: {},
        }
        assert.deepEqual(nudgeReportRows(report).map(r => `${r.week}:${r.surface}`), ['2026-W42:prompt', '2026-W41:banner'])
        assert.deepEqual(nudgeReportRows(null), [])
    })
})

describe('copy', () => {
    const root = path.resolve(import.meta.dirname, '../..')
    const langs = Object.fromEntries(['dk', 'en', 'no', 'sv'].map(l =>
        [l, JSON.parse(fs.readFileSync(path.join(root, 'lang', `${l}.json`), 'utf8'))]))
    const keys = ['cody.adoption.demand', 'cody.adoption.price.month', 'cody.adoption.price.monthSeats', 'cody.adoption.price.year',
        'cody.adoption.price.yearSeats', 'cody.adoption.seats.title', 'cody.adoption.seats.assign', 'cody.preview.askAdminAccess',
        'cody.preview.assignSelf', 'cody.preview.goToSeats', 'superadmin.funnel.codyNudges.title']
    const get = (o, k) => k.split('.').reduce((a, p) => a?.[p], o)

    test('every key in every language, plurals with two forms, no em-dash', () => {
        for (const [lang, messages] of Object.entries(langs)) {
            for (const key of keys) {
                const value = get(messages, key)
                assert.equal(typeof value, 'string', `${lang}: ${key}`)
                assert.ok(!value.includes('—'), `${lang}: ${key} has an em-dash`)
            }
            for (const key of ['cody.adoption.demand', 'cody.adoption.price.monthSeats', 'cody.adoption.seats.title', 'cody.adoption.seats.assign']) {
                assert.equal(get(messages, key).split(' | ').length, 2, `${lang}: ${key} plural`)
            }
        }
    })
    test('the Danish wording', () => {
        assert.equal(get(langs.dk, 'cody.adoption.demand').split(' | ')[1], '{count} af jeres medarbejdere har bedt om Cody AI de sidste 30 dage')
        assert.equal(get(langs.dk, 'cody.adoption.price.month'), 'Derefter {amount}/md.')
        // The seats banner never sells.
        assert.doesNotMatch(get(langs.dk, 'cody.adoption.seats.title') + get(langs.dk, 'cody.adoption.seats.assign'), /køb|pris|kr\./i)
    })
})
