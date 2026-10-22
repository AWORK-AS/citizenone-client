/**
 * Unit tests for composables/referralProgram.ts -- "Giv en måned, få en måned".
 *
 *   node --test tests/unit/referralProgram.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const { isPromoter, referralOfferFrom, monthsToCome, creditsToApply } = await import('../../composables/referralProgram.ts')

describe('isPromoter', () => {
    test('is 9 and 10 only', () => {
        assert.equal(isPromoter(9), true)
        assert.equal(isPromoter(10), true)
        assert.equal(isPromoter(8), false)
        assert.equal(isPromoter(0), false)
    })
    test('is nothing without a score', () => {
        assert.equal(isPromoter(null), false)
        assert.equal(isPromoter(undefined), false)
        assert.equal(isPromoter(11), false)
    })
})

describe('referralOfferFrom', () => {
    const offer = { url: 'https://app.citizenone.dk/register?share=abc23xyz9k', months_per_referral: 1, yearly_cap: 12 }

    test('takes our own signup link', () => {
        assert.deepEqual(referralOfferFrom(offer), offer)
    })
    test('shows nothing for an older backend or a user without the programme', () => {
        assert.equal(referralOfferFrom(null), null)
        assert.equal(referralOfferFrom(undefined), null)
        assert.equal(referralOfferFrom({}), null)
    })
    test('refuses anything that is not a signup link with a code', () => {
        assert.equal(referralOfferFrom({ url: 'javascript:alert(1)' }), null)
        assert.equal(referralOfferFrom({ url: 'http://app.citizenone.dk/register?share=abc' }), null)
        assert.equal(referralOfferFrom({ url: 'https://app.citizenone.dk/login?share=abc' }), null)
        assert.equal(referralOfferFrom({ url: 'https://app.citizenone.dk/register' }), null)
    })
    test('falls back to one month and a cap of twelve', () => {
        assert.deepEqual(referralOfferFrom({ url: offer.url }), offer)
    })
})

describe('monthsToCome', () => {
    test('is what has been earned and not yet given', () => {
        assert.equal(monthsToCome({ referred: 3, pending: 1, rewarded: 2, earned_months: 2, applied_months: 1 }), 1)
    })
    test('is never negative and copes with nothing', () => {
        assert.equal(monthsToCome({ referred: 0, pending: 0, rewarded: 0, earned_months: 0, applied_months: 2 }), 0)
        assert.equal(monthsToCome(null), 0)
    })
})

describe('creditsToApply', () => {
    test('counts the earned credits across referrals', () => {
        assert.equal(creditsToApply([
            { credits: [{ status: 'earned' }, { status: 'applied' }] },
            { credits: [{ status: 'earned' }] },
            {},
        ]), 2)
    })
})

describe('copy', () => {
    const langs = ['dk', 'en', 'no', 'sv'].map((code) => [code, JSON.parse(fs.readFileSync(path.resolve('lang', `${code}.json`), 'utf8'))])
    const keysOf = (obj, prefix = '') => Object.entries(obj).flatMap(([k, v]) => (v && typeof v === 'object' ? keysOf(v, `${prefix}${k}.`) : [`${prefix}${k}`]))

    test('every locale has the same referral texts, without em dashes', () => {
        const [, en] = langs.find(([code]) => code === 'en')
        const expected = keysOf(en.referralProgram).sort()
        assert.ok(expected.length > 5)
        for (const [code, lang] of langs) {
            assert.deepEqual(keysOf(lang.referralProgram ?? {}).sort(), expected, code)
            assert.deepEqual(keysOf(lang.superadmin?.referrals ?? {}).sort(), keysOf(en.superadmin.referrals).sort(), code)
            for (const text of [...Object.values(lang.referralProgram), JSON.stringify(lang.superadmin.referrals)]) {
                assert.ok(!String(text).includes('—'), `${code}: em dash`)
            }
        }
    })
})
