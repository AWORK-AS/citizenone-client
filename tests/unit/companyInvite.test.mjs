/**
 * Unit tests for composables/companyInvite.ts -- reading the signed company
 * invitation link and mapping the accept call's refusal to a page state.
 *
 *   node --test tests/unit/companyInvite.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

const { readCompanyInviteParams, companyInviteOutcomeOf } = await import('../../composables/companyInvite.ts')

const full = { company: 'c-uuid', user: 'u-uuid', expires: '1760000000', signature: 'abc123' }

describe('readCompanyInviteParams', () => {
    test('a complete signed link maps to the accept payload', () => {
        assert.deepEqual(readCompanyInviteParams(full), {
            company_uuid: 'c-uuid',
            user_uuid: 'u-uuid',
            expires: 1760000000,
            signature: 'abc123',
        })
    })

    test('an old unsigned link is invalid', () => {
        assert.equal(readCompanyInviteParams({ company: 'c-uuid', user: 'u-uuid' }), null)
    })

    for (const key of ['company', 'user', 'expires', 'signature']) {
        test(`a link without ${key} is invalid`, () => {
            const query = { ...full }
            delete query[key]
            assert.equal(readCompanyInviteParams(query), null)
        })
    }

    test('a non-numeric expiry is invalid', () => {
        assert.equal(readCompanyInviteParams({ ...full, expires: '17abc' }), null)
    })

    test('a repeated query key uses the first value', () => {
        assert.equal(readCompanyInviteParams({ ...full, signature: ['first', 'second'] })?.signature, 'first')
    })
})

describe('companyInviteOutcomeOf', () => {
    test('maps the server reasons', () => {
        assert.equal(companyInviteOutcomeOf({ reason: 'expired' }), 'expired')
        assert.equal(companyInviteOutcomeOf({ reason: 'invalid' }), 'invalid')
        assert.equal(companyInviteOutcomeOf({ reason: 'not_admin' }), 'notAdmin')
    })

    test('a validation refusal of the signature is invalid', () => {
        assert.equal(companyInviteOutcomeOf({ errors: { signature: ['required'] } }), 'invalid')
    })

    test('anything else is a plain error', () => {
        assert.equal(companyInviteOutcomeOf({ message: 'Server error' }), 'error')
        assert.equal(companyInviteOutcomeOf(undefined), 'error')
    })
})
