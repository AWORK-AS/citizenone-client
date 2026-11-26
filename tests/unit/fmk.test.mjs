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

const { fmkHistoryChanges } = await import('../../utils/fmk.ts')

describe('fmkHistoryChanges', () => {
    const period = (version, over = {}) => ({ version, drug_name: 'Ibumetin', form: 'tabletter', strength: '400 mg', dosage_free_text: '1 tablet 2 gange dagligt', dosage_type: 'Fast', dosage_by_local_schema: false, paused: null, ...over })

    test('dosage and pause changed since our version', () => {
        const result = fmkHistoryChanges([period('1', { strength: '200 mg' }), period('2'), period('3', { dosage_free_text: '1 tablet 3 gange dagligt', paused: { from: '2026-11-24', to: '2026-12-01' } })], '2')
        assert.deepEqual(result, {
            from: '2', to: '3',
            changes: [
                { field: 'dosage', before: '1 tablet 2 gange dagligt', after: '1 tablet 3 gange dagligt' },
                { field: 'paused', before: null, after: '2026-11-24|2026-12-01' },
            ],
        })
    })
    test('from an older version every change since is included', () => {
        const result = fmkHistoryChanges([period('1', { strength: '200 mg' }), period('2'), period('3')], '1')
        assert.deepEqual(result.changes, [{ field: 'strength', before: '200 mg', after: '400 mg' }])
    })
    test('unknown version compares the last two', () => assert.equal(fmkHistoryChanges([period('4'), period('5', { form: 'brusetabletter' })], '2').from, '4'))
    test('only one version: nothing to compare', () => assert.deepEqual(fmkHistoryChanges([period('1')], '1').changes, []))
    test('case and spacing are not changes', () => assert.deepEqual(fmkHistoryChanges([period('1'), period('2', { drug_name: ' ibumetin ' })], '1').changes, []))
})

const { fmkOrganisation, fmkRelation } = await import('../../utils/fmk.ts')

describe('fmkRelation', () => {
    test('a hospital admission stands out with the hospital\'s SKS code and phone', () => {
        const r = fmkRelation({ Type: 'Indlagt', Organisation: { Name: 'Aarhus Universitetshospital', Identifier: { '#text': '6620', '@source': 'SKS' }, TelephoneNumber: '78450000' } })
        assert.deepEqual(r, { admitted: true, type: 'Indlagt', organisation: { name: 'Aarhus Universitetshospital', identifier: 'SKS 6620', phone: '78450000' } })
    })
    test('home nursing is a relation, not an admission', () => {
        const r = fmkRelation({ Type: 'Visiteret til hjemmesygeplejen', Organisation: { Name: 'Favrskov Kommune' } })
        assert.equal(r.admitted, false)
        assert.equal(r.type, 'Visiteret til hjemmesygeplejen')
        assert.deepEqual(r.organisation, { name: 'Favrskov Kommune', identifier: null, phone: null })
    })
    test('missing parts give nulls, not errors', () => {
        assert.deepEqual(fmkRelation(null), { admitted: false, type: null, organisation: { name: null, identifier: null, phone: null } })
        assert.deepEqual(fmkOrganisation({ Name: 'X', Identifier: '123' }), { name: 'X', identifier: '123', phone: null })
    })
})

const { fmkDosageNow, fmkVkaNotes } = await import('../../utils/fmk.ts')

describe('fmkDosageNow', () => {
    const p = (start, end, extra = {}) => ({ start, end, undetermined: end === null, iteration_days: 1, empty: false, ...extra })
    const taper = [p('2026-11-01', '2026-11-30'), p('2026-12-01', '2026-12-14')]

    test('the period that applies today, with the later ones findable', () => {
        const r = fmkDosageNow(taper, '2026-11-26')
        assert.equal(r.state, 'current')
        assert.equal(r.current.start, '2026-11-01')
        assert.deepEqual(r.later.map(x => x.start), ['2026-12-01'])
    })
    test('no current dosage yet: future, with its start', () => {
        const r = fmkDosageNow(taper, '2026-10-15')
        assert.equal(r.state, 'future')
        assert.equal(r.nextStart, '2026-11-01')
    })
    test('no current dosage any more: ended, with its end', () => {
        const r = fmkDosageNow(taper, '2026-12-20')
        assert.equal(r.state, 'ended')
        assert.equal(r.lastEnd, '2026-12-14')
    })
    test('an undetermined period applies from its start on', () => assert.equal(fmkDosageNow([p('2026-01-01', null)], '2030-01-01').state, 'current'))
    test('a period without dosage can be the current one', () => assert.equal(fmkDosageNow([p('2026-11-01', '2026-12-01', { empty: true })], '2026-11-26').current.empty, true))
    test('no periods at all', () => assert.equal(fmkDosageNow([], '2026-11-26').state, 'none'))
})

describe('fmkVkaNotes', () => {
    const week = { start: '2026-11-02', end: null, undetermined: true, iteration_days: 7, empty: false }
    const course = { start: '2026-11-20', end: '2026-11-29', undetermined: false, iteration_days: null, empty: false }

    test('a week schedule repeats', () => assert.deepEqual(fmkVkaNotes([week], '2026-11-26', null), { repeats: true, notSpecifiedAfter: false, endPassed: false }))
    test('not when treatment ends this week', () => assert.equal(fmkVkaNotes([week], '2026-11-26', '2026-11-28').repeats, false))
    test('a start-up course without a schedule after it says dosage after is not given', () => assert.equal(fmkVkaNotes([course], '2026-11-26', null).notSpecifiedAfter, true))
    test('a course followed by a repeating schedule does not', () => assert.equal(fmkVkaNotes([course, { ...week, start: '2026-11-30' }], '2026-11-26', null).notSpecifiedAfter, false))
    test('a passed dosage end date is flagged', () => assert.equal(fmkVkaNotes([course], '2026-12-02', null).endPassed, true))
})

const { fmkPrescriptionState } = await import('../../utils/fmk.ts')

describe('fmkPrescriptionState', () => {
    test('partly dispensed can still be dispensed', () => assert.deepEqual(fmkPrescriptionState({ status: 'delvist udleveret', valid_from: '2026-11-01', valid_to: '2027-11-01' }, '2026-11-26'), { open: true, future: false, expired: false }))
    test('an open prescription valid from a later date is a future one', () => assert.equal(fmkPrescriptionState({ status: 'åben', valid_from: '2026-12-01', valid_to: null }, '2026-11-26').future, true))
    test('a closed one is never future', () => assert.deepEqual(fmkPrescriptionState({ status: 'afsluttet', valid_from: '2026-12-01', valid_to: '2026-11-01' }, '2026-11-26'), { open: false, future: false, expired: true }))
})

const { fmkFollowUp } = await import('../../utils/fmk.ts')

describe('withdrawn in FMK and follow-up dates', () => {
    test('withdrawn needs action only while CitizenOne still has it', () => {
        assert.equal(fmkNeedsAction({ status: 'withdrawn_in_fmk', local: { is_draft: false } }), true)
        assert.equal(fmkNeedsAction({ status: 'withdrawn_in_fmk', local: null }), false)
    })
    test('a passed follow-up date is overdue, the next one is shown', () => assert.deepEqual(fmkFollowUp(['2026-11-20', '2027-01-15'], '2026-11-26'), { overdue: '2026-11-20', next: '2027-01-15' }))
    test('only future dates', () => assert.deepEqual(fmkFollowUp(['2027-01-15'], '2026-11-26'), { overdue: null, next: '2027-01-15' }))
    test('no dates', () => assert.deepEqual(fmkFollowUp([], '2026-11-26'), { overdue: null, next: null }))
})

const { fmkAddresseeSuggestions } = await import('../../utils/fmk.ts')

describe('fmkAddresseeSuggestions', () => {
    const doctor = { By: { AuthorisedHealthcareProfessional: { Name: 'Læge Test', Organisation: { Name: 'Lægehuset Test', Identifier: { '#text': '012345', '@source': 'Yder' } } } } }
    test('the practice that created it, once even when it also issued the prescription', () => {
        assert.deepEqual(fmkAddresseeSuggestions({ created: doctor, prescription_list: [{ created: doctor }] }), [{ name: 'Lægehuset Test', type: 'Yder', id_source: 'Yder', id: '012345' }])
    })
    test('a hospital by SKS code', () => {
        const hospital = { By: { Organisation: { Name: 'Testsygehus', Identifier: { '#text': '1301011', '@source': 'SKS' } } } }
        assert.deepEqual(fmkAddresseeSuggestions({ created: hospital }), [{ name: 'Testsygehus', type: 'Sygehus', id_source: 'SKS', id: '1301011' }])
    })
    test('no identifier, no suggestion', () => assert.deepEqual(fmkAddresseeSuggestions({ created: { By: { AuthorisedHealthcareProfessional: { Name: 'Læge Test' } } } }), []))
})
