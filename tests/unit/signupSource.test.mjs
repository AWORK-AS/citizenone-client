/**
 * Unit tests for composables/signupSource.ts -- what the register link tells us about where a
 * signup came from. The website adds the ad parameters, the landing page and the referrer; a
 * Salesflow sequence mail adds `sf`, so a signup from a sequence stops that sequence.
 *
 *   node --test tests/unit/signupSource.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

const { signupSourceFromQuery, signupChannel } = await import('../../composables/signupSource.ts')

const REF = '0b6f1c2e-1111-4222-8333-444455556666.0123456789abcdef'

describe('signupSourceFromQuery', () => {
    test('keeps the ad parameters, the landing page and the referrer', () => {
        assert.deepEqual(
            signupSourceFromQuery('?utm_source=google&utm_medium=cpc&utm_campaign=klinik&gclid=EAIa&landing=%2Fpriser&ref=www.google.com'),
            { utm_source: 'google', utm_medium: 'cpc', utm_campaign: 'klinik', gclid: 'EAIa', landing: '/priser', ref: 'www.google.com' },
        )
    })

    test('carries a Salesflow sequence reference', () => {
        assert.deepEqual(signupSourceFromQuery(`?utm_source=salesflow&sf=${REF}`), { utm_source: 'salesflow', sf: REF })
    })

    test('carries the code from a customer\'s "Del CitizenOne" link (task #16)', () => {
        assert.deepEqual(signupSourceFromQuery('?share=abc23xyz9k'), { share: 'abc23xyz9k' })
    })

    test('ignores parameters it does not know and empty values', () => {
        assert.deepEqual(signupSourceFromQuery('?email=a@b.dk&provider=google&utm_source='), {})
    })

    test('cuts a value at 255 characters', () => {
        assert.equal(signupSourceFromQuery(`?utm_campaign=${'x'.repeat(300)}`).utm_campaign.length, 255)
    })
})

// Same cases as App\Support\SignupSource::channel in citizenone-backend, so GA4 and superadmin agree.
describe('signupChannel', () => {
    test('an untagged visit from a search engine is organic search', () => {
        assert.equal(signupChannel({ ref: 'www.google.com', landing: '/priser' }), 'search')
        assert.equal(signupChannel({ ref: 'www.bing.com' }), 'search')
    })

    test('a Google click id is an ad, whatever else is present', () => {
        assert.equal(signupChannel({ gclid: 'EAIa', ref: 'www.google.com', utm_source: 'newsletter' }), 'google_ads')
        assert.equal(signupChannel({ utm_source: 'google', utm_medium: 'CPC' }), 'google_ads')
    })

    test('a share code wins over everything', () => {
        assert.equal(signupChannel({ share: 'abc23xyz9k', gclid: 'EAIa' }), 'share')
    })

    test('FindSocialeTilbud, the product and other tagged links', () => {
        assert.equal(signupChannel({ ref: 'findsocialetilbud.dk' }), 'findsocialetilbud')
        assert.equal(signupChannel({ utm_source: 'citizenone_product' }), 'product')
        assert.equal(signupChannel({ utm_source: 'salesflow', ref: 'www.google.com' }), 'campaign')
    })

    test('another site is a referral, and nothing at all is direct', () => {
        assert.equal(signupChannel({ ref: 'chatgpt.com' }), 'referral')
        assert.equal(signupChannel({}), 'direct')
    })
})
