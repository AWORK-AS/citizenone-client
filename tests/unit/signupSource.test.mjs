/**
 * Unit tests for composables/signupSource.ts -- what the register link tells us about where a
 * signup came from. The website adds the ad parameters, the landing page and the referrer; a
 * Salesflow sequence mail adds `sf`, so a signup from a sequence stops that sequence.
 *
 *   node --test tests/unit/signupSource.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

const { signupSourceFromQuery } = await import('../../composables/signupSource.ts')

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

    test('ignores parameters it does not know and empty values', () => {
        assert.deepEqual(signupSourceFromQuery('?email=a@b.dk&provider=google&utm_source='), {})
    })

    test('cuts a value at 255 characters', () => {
        assert.equal(signupSourceFromQuery(`?utm_campaign=${'x'.repeat(300)}`).utm_campaign.length, 255)
    })
})
