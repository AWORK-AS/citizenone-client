/**
 * Unit tests for composables/medicineDosage.ts — the PN (as-needed) dose
 * limit check fixed under AW-2026-3581.
 *
 * The regression this suite exists to pin down: validateForm() in
 * components/modules/user/citizen/medicine/history/form.vue used to compare
 * a sum over the SCHEDULED-slot array (always empty for PN) against
 * max_daily_dose, so the "did you enter the right dose?" confirmation fired
 * on effectively every PN save regardless of what was actually typed.
 * exceededDoseLimit() replaces that check with one that looks at the real
 * entered dose against the medicine's own limits.
 *
 * No server, no browser, no build step: Node 22+ strips the composable's
 * type annotations at import time. Run with:
 *
 *   node --test tests/unit/medicineDosage.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { medicineDosage } from '../../composables/medicineDosage.ts'

const { parseDosage, isValidDosage, exceededDoseLimit } = medicineDosage()

describe('parseDosage — comma- and dot-decimal strings', () => {
    test('plain integers and decimals parse', () => {
        assert.equal(parseDosage('1'), 1)
        assert.equal(parseDosage('2.5'), 2.5)
    })
    test('a comma decimal (dk/no/sv locale input) parses like a dot decimal', () => {
        assert.equal(parseDosage('2,5'), 2.5)
    })
    test('surrounding whitespace is tolerated', () => {
        assert.equal(parseDosage(' 3 '), 3)
    })
    test('non-numeric text is NaN, not silently coerced to 0', () => {
        assert.ok(Number.isNaN(parseDosage('en halv')))
    })
    test('empty/nullish input is NaN', () => {
        assert.ok(Number.isNaN(parseDosage('')))
        assert.ok(Number.isNaN(parseDosage(null)))
        assert.ok(Number.isNaN(parseDosage(undefined)))
    })
    test('a negative number is rejected', () => {
        assert.ok(Number.isNaN(parseDosage('-1')))
    })
    test('more than one separator is rejected', () => {
        assert.ok(Number.isNaN(parseDosage('1,5,5')))
    })
    test('a trailing bare separator is rejected', () => {
        assert.ok(Number.isNaN(parseDosage('1,')))
    })
})

describe('isValidDosage', () => {
    test('a positive number is valid', () => {
        assert.equal(isValidDosage('1'), true)
        assert.equal(isValidDosage('0,5'), true)
    })
    test('zero is not valid', () => {
        assert.equal(isValidDosage('0'), false)
    })
    test('non-numeric text is not valid', () => {
        assert.equal(isValidDosage('en halv'), false)
    })
})

describe('exceededDoseLimit — the AW-2026-3581 regression', () => {
    test('a normal PN dose under both limits raises nothing (the core regression case)', () => {
        assert.equal(exceededDoseLimit('1', { maxPerAdministration: '2', maxDaily: '10' }), null)
    })
    test('a dose exactly at the limit is not "exceeded"', () => {
        assert.equal(exceededDoseLimit('2', { maxPerAdministration: '2', maxDaily: '10' }), null)
    })
    test('a dose over max_dose_per_administration is reported, with the numbers', () => {
        assert.deepEqual(
            exceededDoseLimit('5', { maxPerAdministration: '2', maxDaily: '10' }),
            { limit: 'max_dose_per_administration', entered: 5, max: 2 }
        )
    })
    test('max_dose_per_administration is checked ahead of max_daily_dose', () => {
        const result = exceededDoseLimit('5', { maxPerAdministration: '2', maxDaily: '100' })
        assert.equal(result.limit, 'max_dose_per_administration')
    })
    test('falls back to max_daily_dose when per-administration is fine but the daily cap is not', () => {
        assert.deepEqual(
            exceededDoseLimit('8', { maxPerAdministration: '10', maxDaily: '6' }),
            { limit: 'max_daily_dose', entered: 8, max: 6, total: 8 }
        )
    })
    test('comma-decimal entered dose and limits are compared correctly', () => {
        assert.deepEqual(
            exceededDoseLimit('2,5', { maxPerAdministration: '2', maxDaily: '10' }),
            { limit: 'max_dose_per_administration', entered: 2.5, max: 2 }
        )
    })
    test('a missing max_dose_per_administration does not invent a warning', () => {
        assert.equal(exceededDoseLimit('50', { maxPerAdministration: null, maxDaily: '100' }), null)
    })
    test('a missing/zero max_daily_dose does not invent a warning when per-administration is also absent', () => {
        assert.equal(exceededDoseLimit('50', { maxPerAdministration: undefined, maxDaily: 0 }), null)
        assert.equal(exceededDoseLimit('50', {}), null)
    })
    test('an unparseable entered dose returns null (that case is a required-field/validation error, not a limit warning)', () => {
        assert.equal(exceededDoseLimit('en halv', { maxPerAdministration: '2', maxDaily: '10' }), null)
    })
})

describe('exceededDoseLimit — cumulative max_daily_dose (the manual-QA regression, repeated 2s against a 6 cap)', () => {
    test('a dose that alone is fine still trips the daily cap once added to what was already given today', () => {
        // The exact scenario a manual click-through caught: max_dose_per_administration
        // 2, max_daily_dose 6, doses of 2 entered one after another. Each single
        // dose is AT (not over) the per-administration cap, so that check never
        // fires on its own -- only the cumulative daily total catches the 4th one.
        assert.equal(exceededDoseLimit('2', { maxPerAdministration: '2', maxDaily: '6', alreadyGivenToday: 0 }), null)
        assert.equal(exceededDoseLimit('2', { maxPerAdministration: '2', maxDaily: '6', alreadyGivenToday: 2 }), null)
        assert.equal(exceededDoseLimit('2', { maxPerAdministration: '2', maxDaily: '6', alreadyGivenToday: 4 }), null)
        assert.deepEqual(
            exceededDoseLimit('2', { maxPerAdministration: '2', maxDaily: '6', alreadyGivenToday: 6 }),
            { limit: 'max_daily_dose', entered: 2, max: 6, total: 8 }
        )
    })
    test('total is exactly at the cap, not over it, when already-given plus entered equals max', () => {
        assert.equal(exceededDoseLimit('2', { maxPerAdministration: '2', maxDaily: '6', alreadyGivenToday: 4 }), null)
    })
    test('a missing/absent alreadyGivenToday defaults to 0 (same as passing nothing at all)', () => {
        assert.equal(
            exceededDoseLimit('5', { maxPerAdministration: '10', maxDaily: '4' }).total,
            5
        )
    })
    test('max_dose_per_administration is still checked on the single dose alone, never accumulated', () => {
        // A dose of 2 against a per-administration cap of 2 is fine no matter
        // how much has already been given today -- that limit is per-event.
        assert.equal(exceededDoseLimit('2', { maxPerAdministration: '2', maxDaily: '100', alreadyGivenToday: 50 }), null)
    })
    test('a negative alreadyGivenToday (defensive -- should never happen) is clamped to 0, not subtracted', () => {
        // If -3 were subtracted instead of clamped, total would be 5 + -3 = 2,
        // under the cap of 4, and this would wrongly return null.
        assert.deepEqual(
            exceededDoseLimit('5', { maxPerAdministration: '10', maxDaily: '4', alreadyGivenToday: -3 }),
            { limit: 'max_daily_dose', entered: 5, max: 4, total: 5 }
        )
    })
})
