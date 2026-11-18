/**
 * Unit tests for composables/contactPrimaryParty.ts - the primary-party switch on a contact.
 *
 *   node --test tests/unit/contactPrimaryParty.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { primaryPartyParam, showsPrimaryParty } from '../../composables/contactPrimaryParty.ts'

describe('showsPrimaryParty', () => {
    test('a relative gets the switch', () => {
        assert.equal(showsPrimaryParty('relatives'), true)
    })

    test('a case manager gets the switch', () => {
        assert.equal(showsPrimaryParty('case_manager'), true)
    })

    test('our own contact person does not', () => {
        assert.equal(showsPrimaryParty('our_contact_person'), false)
    })

    test('no kind chosen yet shows no switch', () => {
        assert.equal(showsPrimaryParty(''), false)
        assert.equal(showsPrimaryParty(null), false)
        assert.equal(showsPrimaryParty(undefined), false)
    })
})

describe('primaryPartyParam', () => {
    test('switched on sends true', () => {
        assert.deepEqual(primaryPartyParam({ title: 'relatives', is_primary_party: true }), { is_primary_party: true })
    })

    test('switched off sends false, so an update can take it away', () => {
        assert.deepEqual(primaryPartyParam({ title: 'relatives', is_primary_party: false }), { is_primary_party: false })
    })

    test('only a real true counts', () => {
        assert.deepEqual(primaryPartyParam({ title: 'relatives', is_primary_party: 'true' }), { is_primary_party: false })
        assert.deepEqual(primaryPartyParam({ title: 'relatives' }), { is_primary_party: false })
    })

    test('our own contact person never sends the key, so the stored value stays', () => {
        assert.deepEqual(primaryPartyParam({ title: 'our_contact_person', is_primary_party: true }), {})
    })

    test('a missing form sends nothing', () => {
        assert.deepEqual(primaryPartyParam(undefined), {})
    })
})
