/**
 * Unit tests for composables/growthFunnel.ts - the rates on superadmin's growth funnel - and the
 * page's copy.
 *
 *   node --test tests/unit/growthFunnel.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { FUNNEL_STAGES, biggestDrop, isSmallSample, shareOfSignups, stepRate } from '../../composables/growthFunnel.ts'

const ads = { channel: 'google_ads', label: 'Google Ads', signed_up: 20, activated: 10, first_note: 8, paying: 2 }
const none = { channel: 'direct', label: 'Direkte', signed_up: 0, activated: 0, first_note: 0, paying: 0 }

describe('shareOfSignups', () => {
    test('is the share of the channel signups that reached the stage', () => {
        assert.equal(shareOfSignups(ads, 'activated'), 50)
        assert.equal(shareOfSignups(ads, 'paying'), 10)
        assert.equal(shareOfSignups(ads, 'signed_up'), 100)
    })
    test('is null with no signups rather than a division by zero', () => {
        assert.equal(shareOfSignups(none, 'paying'), null)
    })
})

describe('stepRate', () => {
    test('is the share of the previous stage that went on', () => {
        assert.equal(stepRate(ads, 'activated'), 50)
        assert.equal(stepRate(ads, 'first_note'), 80)
        assert.equal(stepRate(ads, 'paying'), 25)
    })
    test('has nothing to say about the first stage or an empty previous one', () => {
        assert.equal(stepRate(ads, 'signed_up'), null)
        assert.equal(stepRate({ ...ads, first_note: 0, paying: 0 }, 'paying'), null)
    })
})

describe('biggestDrop', () => {
    test('names the stage that lost the largest share of the one before', () => {
        assert.equal(biggestDrop(ads), 'paying')
        assert.equal(biggestDrop({ ...ads, activated: 2, first_note: 2, paying: 1 }), 'activated')
    })
    test('is null when nobody signed up or nothing was lost', () => {
        assert.equal(biggestDrop(none), null)
        assert.equal(biggestDrop({ ...ads, activated: 20, first_note: 20, paying: 20 }), null)
    })
})

describe('isSmallSample', () => {
    test('flags channels with fewer than five signups', () => {
        assert.equal(isSmallSample({ ...ads, signed_up: 4 }), true)
        assert.equal(isSmallSample(ads), false)
    })
})

describe('copy', () => {
    const root = path.resolve(import.meta.dirname, '../..')
    const page = fs.readFileSync(path.join(root, 'pages/superadmin/funnel/index.vue'), 'utf8')
    const keys = [...page.matchAll(/\$t\('(superadmin\.funnel\.[A-Za-z.]+)'/g)].map(m => m[1])
        .concat(FUNNEL_STAGES.map(s => `superadmin.funnel.stages.${s}`), ['superadmin.dashboard.tabs.funnel'])
    const get = (o, k) => k.split('.').reduce((a, p) => a?.[p], o)

    test('every key the page uses exists in all four languages, without em dash', () => {
        for (const lang of ['dk', 'en', 'no', 'sv']) {
            const t = JSON.parse(fs.readFileSync(path.join(root, 'lang', `${lang}.json`), 'utf8'))
            for (const key of keys) {
                assert.ok(get(t, key), `${lang}: ${key}`)
            }
            assert.ok(!JSON.stringify(t.superadmin.funnel).includes('—'), `${lang}: em dash`)
            assert.ok(t.superadmin.funnel.medianDays.includes('{days}'), `${lang}: medianDays placeholder`)
        }
    })
})

// ---------------------------------------------------------------- growth loops

const loops = await import('../../composables/growthFunnel.ts')

describe('suggestionConversion', () => {
    test('is bought within the window over the suggestions whose window has closed', () => {
        assert.equal(loops.suggestionConversion({ sends: 6, recipients: 9, suggested_apps: 5, converted: 2, open: 1 }), 50)
    })
    test('is null when no window has closed yet, or with nothing', () => {
        assert.equal(loops.suggestionConversion({ sends: 1, recipients: 1, suggested_apps: 2, converted: 0, open: 2 }), null)
        assert.equal(loops.suggestionConversion(null), null)
    })
})

describe('referralPaidRate', () => {
    test('is the share of referred signups that have paid', () => {
        assert.equal(loops.referralPaidRate({ shares: 10, signed_up: 4, paid: 1 }), 25)
    })
    test('is null without signups', () => {
        assert.equal(loops.referralPaidRate({ shares: 3, signed_up: 0, paid: 0 }), null)
        assert.equal(loops.referralPaidRate(undefined), null)
    })
})

describe('activeBuckets', () => {
    test('keeps only the periods where something happened', () => {
        const rows = [{ key: '2026-08', sends: 0, converted: 0 }, { key: '2026-09', sends: 2, converted: 0 }, { key: '2026-10', sends: 0, converted: 1 }]
        assert.deepEqual(loops.activeBuckets(rows, ['sends', 'converted']).map((r) => r.key), ['2026-09', '2026-10'])
        assert.deepEqual(loops.activeBuckets(null, ['sends']), [])
    })
})

describe('growth loop copy', () => {
    test('every locale has the same keys, without em dashes', () => {
        const read = (code) => JSON.parse(fs.readFileSync(path.resolve('lang', `${code}.json`), 'utf8')).superadmin.funnel.loops
        const keysOf = (obj, prefix = '') => Object.entries(obj).flatMap(([k, v]) => (v && typeof v === 'object' ? keysOf(v, `${prefix}${k}.`) : [`${prefix}${k}`]))
        const expected = keysOf(read('en')).sort()
        for (const code of ['dk', 'no', 'sv']) {
            assert.deepEqual(keysOf(read(code)).sort(), expected, code)
            assert.ok(!JSON.stringify(read(code)).includes('—'), `${code}: em dash`)
        }
    })
})
