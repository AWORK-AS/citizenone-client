/**
 * Unit tests for composables/illnessHealthcareProvider.ts -- AW-2026-3581 (2d):
 * the "our contact person" checkbox on a citizen's illness/functional-impairment
 * record used to default ON for every new record and switch in a dropdown that
 * is a hard-required vuelidate field with, frequently, zero options -- an
 * unsavable form with no visible error.
 *
 * No server, no browser, no build step: Node 22+ strips the composable's type
 * annotations at import time. Run with:
 *
 *   node --test tests/unit/illnessHealthcareProvider.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { illnessHealthcareProvider } from '../../composables/illnessHealthcareProvider.ts'

const { contactPersonModeFor, contactPersonOptions } = illnessHealthcareProvider()

describe('contactPersonModeFor -- the default-mode regression', () => {
    test('a brand-new record (no data at all) opens in free-text mode', () => {
        assert.equal(contactPersonModeFor({}, true), false)
        assert.equal(contactPersonModeFor(null, true), false)
        assert.equal(contactPersonModeFor(undefined, false), false)
    })

    test('a record with neither healthcare_provider nor a linked contact opens in free-text mode', () => {
        const record = { healthcare_provider: '', healthcare: null }
        assert.equal(contactPersonModeFor(record, true), false)
    })

    test('a record saved with free text opens in free-text mode, not contact-person mode', () => {
        const record = { healthcare_provider: 'Dr. Hansen', healthcare: null }
        assert.equal(contactPersonModeFor(record, true), false)
    })

    test('a record with a linked contact opens in contact-person mode when the picker has options', () => {
        const record = { healthcare_provider: null, healthcare: { uuid: 'contact-uuid-1' } }
        assert.equal(contactPersonModeFor(record, true), true)
    })

    test('a record with a linked contact still opens in free-text mode if the picker has no options', () => {
        // e.g. the linked contact was since removed from the citizen's list --
        // never land the user in a mode that cannot be satisfied.
        const record = { healthcare_provider: null, healthcare: { uuid: 'contact-uuid-1' } }
        assert.equal(contactPersonModeFor(record, false), false)
    })

    test('an empty-string linked uuid does not count as a real link', () => {
        const record = { healthcare: { uuid: '' } }
        assert.equal(contactPersonModeFor(record, true), false)
    })
})

describe('contactPersonOptions -- the blank-label regression', () => {
    test('empty or missing rows produce no options', () => {
        assert.deepEqual(contactPersonOptions([]), [])
        assert.deepEqual(contactPersonOptions(null), [])
        assert.deepEqual(contactPersonOptions(undefined), [])
    })

    test('labels from the contact row itself', () => {
        const rows = [{ uuid: 'u1', firstname: 'Anna', lastname: 'Jensen' }]
        assert.deepEqual(contactPersonOptions(rows), [{ value: 'u1', label: 'Anna Jensen' }])
    })

    test('falls back to the linked employee\'s name when the contact row has none', () => {
        const rows = [{ uuid: 'u2', firstname: null, lastname: null, employee: { firstname: 'Bo', lastname: 'Nielsen' } }]
        assert.deepEqual(contactPersonOptions(rows), [{ value: 'u2', label: 'Bo Nielsen' }])
    })

    test('mixes contact-row and employee fields independently', () => {
        const rows = [{ uuid: 'u3', firstname: 'Carla', lastname: null, employee: { firstname: 'X', lastname: 'Olsen' } }]
        assert.deepEqual(contactPersonOptions(rows), [{ value: 'u3', label: 'Carla Olsen' }])
    })

    test('a row with no name anywhere is skipped rather than rendered blank', () => {
        const rows = [
            { uuid: 'u4', firstname: null, lastname: null, employee: null },
            { uuid: 'u5', firstname: 'Dan', lastname: 'Kristensen' },
        ]
        assert.deepEqual(contactPersonOptions(rows), [{ value: 'u5', label: 'Dan Kristensen' }])
    })

    test('a row with no uuid is skipped', () => {
        const rows = [{ uuid: null, firstname: 'Eva', lastname: 'Berg' }]
        assert.deepEqual(contactPersonOptions(rows), [])
    })
})
