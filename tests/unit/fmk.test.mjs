/**
 * Unit tests for utils/fmk.ts -- reading FMK values for the FMK screen:
 * text with attributes, who changed something on FMK (modifikator, GK 3.6)
 * and today's date for "paused", "not started yet" and "expired" markings.
 *
 *   node --test tests/unit/fmk.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

const { fmkText, fmkModificator, fmkToday } = await import('../../utils/fmk.ts')

describe('fmkText', () => {
    test('plain string', () => assert.equal(fmkText('mod smerter'), 'mod smerter'))
    test('value with attributes uses #text', () => assert.equal(fmkText({ '#text': '28100636372', '@source': 'Local' }), '28100636372'))
    test('empty and missing become null', () => {
        assert.equal(fmkText(''), null)
        assert.equal(fmkText(null), null)
        assert.equal(fmkText(undefined), null)
        assert.equal(fmkText({ '@source': 'Local' }), null)
    })
})

describe('fmkModificator', () => {
    test('authorised health professional with organisation and authorisation code', () => {
        const m = fmkModificator({
            AuthorisedHealthcareProfessional: { AuthorisationIdentifier: 'ABC12', Name: 'Læge Test', Organisation: { Name: 'Lægehuset' } },
        })
        assert.deepEqual(m, { who: 'Læge Test', organisation: 'Lægehuset', authorisation: 'ABC12', isPatient: false })
    })

    test('organisation only (e.g. "ikke ajourført" set by a hospital)', () => {
        const m = fmkModificator({ Organisation: { Name: 'Testsygehus', Identifier: { '#text': '1301011', '@source': 'SKS' } } })
        assert.equal(m.who, null)
        assert.equal(m.organisation, 'Testsygehus')
    })

    test('the citizen themselves', () => {
        assert.equal(fmkModificator({ Patient: 'true' }).isPatient, true)
    })

    test('another person with role', () => {
        const m = fmkModificator({ Other: { Name: { GivenName: 'Anna', Surname: 'Jensen' }, Role: 'Plejehjemsassistent' } })
        assert.equal(m.who, 'Anna Jensen')
    })

    test('missing or malformed input does not throw', () => {
        assert.deepEqual(fmkModificator(null), { who: null, organisation: null, authorisation: null, isPatient: false })
        assert.deepEqual(fmkModificator('x'), { who: null, organisation: null, authorisation: null, isPatient: false })
    })
})

describe('fmkToday', () => {
    test('local date as YYYY-MM-DD, comparable with FMK dates as strings', () => {
        const today = fmkToday()
        assert.match(today, /^\d{4}-\d{2}-\d{2}$/)
        assert.ok('2000-01-01' < today && today < '2999-12-31')
    })
})
