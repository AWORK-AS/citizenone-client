/**
 * Unit tests for composables/companyInvite.ts -- reading the signed company
 * invitation link and mapping the accept call's refusal to a page state.
 *
 *   node --test tests/unit/companyInvite.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const {
    readCompanyInviteParams,
    parseInviteFragment,
    initialCompanyInviteState,
    companyInviteOutcomeOf,
} = await import('../../composables/companyInvite.ts')

const full = { invite: 'i-uuid', company: 'c-uuid', user: 'u-uuid', expires: '1760000000', signature: 'abc123' }

describe('parseInviteFragment', () => {
    test('reads the signed parameters from the fragment', () => {
        const hash = '#invite=i-uuid&company=c-uuid&user=u-uuid&expires=1760000000&signature=abc123'
        assert.deepEqual(parseInviteFragment(hash), full)
        assert.deepEqual(readCompanyInviteParams(parseInviteFragment(hash))?.invite_uuid, 'i-uuid')
    })

    test('works without the leading #, and on an empty fragment', () => {
        assert.equal(parseInviteFragment('company=c-uuid').company, 'c-uuid')
        assert.deepEqual(parseInviteFragment(''), {})
        assert.deepEqual(parseInviteFragment(undefined), {})
    })

    test('a repeated key keeps the first value', () => {
        assert.equal(parseInviteFragment('#user=a&user=b').user, 'a')
    })
})

describe('initialCompanyInviteState (button flow)', () => {
    const invite = readCompanyInviteParams(full)

    test('a valid link waits for the button instead of accepting on load', () => {
        assert.equal(initialCompanyInviteState(invite, null), 'ready')
    })

    test('signed in as the invited user is fine', () => {
        assert.equal(initialCompanyInviteState(invite, 'u-uuid'), 'ready')
    })

    test('signed in as someone else is refused', () => {
        assert.equal(initialCompanyInviteState(invite, 'someone-else'), 'wrongUser')
    })

    test('a broken link is invalid', () => {
        assert.equal(initialCompanyInviteState(null, null), 'invalid')
    })
})

describe('readCompanyInviteParams', () => {
    test('a complete signed link maps to the accept payload', () => {
        assert.deepEqual(readCompanyInviteParams(full), {
            invite_uuid: 'i-uuid',
            company_uuid: 'c-uuid',
            user_uuid: 'u-uuid',
            expires: 1760000000,
            signature: 'abc123',
        })
    })

    test('an old unsigned link is invalid', () => {
        assert.equal(readCompanyInviteParams({ company: 'c-uuid', user: 'u-uuid' }), null)
    })

    for (const key of ['invite', 'company', 'user', 'expires', 'signature']) {
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

describe('accept-company-invite page', () => {
    const page = readFileSync(new URL('../../pages/accept-company-invite.vue', import.meta.url), 'utf8')
    const onMounted = page.slice(page.indexOf('onMounted('), page.indexOf('})', page.indexOf('onMounted(')))

    test('does not accept on load', () => {
        assert.ok(onMounted.length > 0)
        assert.ok(!onMounted.includes('acceptInvitation'), 'onMounted must not call acceptInvitation')
    })

    test('accepts from the button and clears the fragment', () => {
        assert.match(page, /@click="acceptInvitation"/)
        assert.match(page, /history\.replaceState/)
    })
})
