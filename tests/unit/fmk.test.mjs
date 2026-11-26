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

const { fmkNeedsAction, fmkDifferences } = await import('../../utils/fmk.ts')

describe('fmkNeedsAction', () => {
    test('a difference needs action', () => assert.equal(fmkNeedsAction({ status: 'only_fmk', local: null }), true))
    test('the same medicine needs nothing', () => assert.equal(fmkNeedsAction({ status: 'same', local: { is_draft: false } }), false))
    test('a taken-over draft still needs its dosage plan', () => assert.equal(fmkNeedsAction({ status: 'same', local: { is_draft: true } }), true))
})

describe('fmkDifferences', () => {
    const fmk = { strength: '400 mg', indication: 'mod smerter', treatment_start: '2026-01-02', treatment_end: null }
    const local = { strength: '400', treatment_reason: 'Mod smerter ', start_date: '2026-01-02T00:00:00.000000Z', end_date: null }

    test('unit, case, spacing and time of day are not differences', () => assert.deepEqual(fmkDifferences({ fmk, local }), []))
    test('each differing field is listed with both values', () => {
        const diffs = fmkDifferences({ fmk: { ...fmk, strength: '200 mg', treatment_end: '2026-12-31' }, local: { ...local, treatment_reason: 'mod feber' } })
        assert.deepEqual(diffs, [
            { field: 'strength', fmk: '200 mg', local: '400' },
            { field: 'reason', fmk: 'mod smerter', local: 'mod feber' },
            { field: 'end', fmk: '2026-12-31', local: null },
        ])
    })
    test('decimal comma and point are the same strength', () => assert.deepEqual(fmkDifferences({ fmk: { ...fmk, strength: '2,5 mg' }, local: { ...local, strength: '2.5' } }), []))
    test('a row with only one side has no field differences', () => assert.deepEqual(fmkDifferences({ fmk, local: null }), []))
})
