/**
 * Unit tests for composables/localDate.ts. Run with TZ=Europe/Copenhagen:
 *
 *   TZ=Europe/Copenhagen node --test tests/unit/localDate.test.mjs
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
    addDaysToLocalDate,
    addYearsToLocalDate,
    localDateString,
    localMonthString,
    parseLocalDate,
} from '../../composables/localDate.ts'

test('00:30 local time is still today, not yesterday (the UTC bug)', () => {
    const justAfterMidnight = new Date(2026, 9, 20, 0, 30, 0)
    assert.equal(localDateString(justAfterMidnight), '2026-10-20')
    if (new Date().getTimezoneOffset() < 0) {
        // In Denmark the UTC date is one day behind at this hour.
        assert.equal(justAfterMidnight.toISOString().slice(0, 10), '2026-10-19')
    }
})

test('23:59 local time keeps the same day', () => {
    assert.equal(localDateString(new Date(2026, 11, 31, 23, 59, 59)), '2026-12-31')
})

test('single digit months and days are zero padded', () => {
    assert.equal(localDateString(new Date(2026, 0, 5, 1, 0, 0)), '2026-01-05')
})

test('month string follows the local date at a month boundary', () => {
    assert.equal(localMonthString(new Date(2026, 10, 1, 0, 15, 0)), '2026-11')
})

test('parseLocalDate rejects non dates', () => {
    assert.equal(parseLocalDate(''), null)
    assert.equal(parseLocalDate('soon'), null)
    assert.equal(parseLocalDate('2026-10-20T08:00:00Z')?.getDate(), 20)
})

test('addDays crosses month, year and DST changes without drifting', () => {
    assert.equal(addDaysToLocalDate('2026-10-31', 1), '2026-11-01')
    assert.equal(addDaysToLocalDate('2026-12-31', 1), '2027-01-01')
    assert.equal(addDaysToLocalDate('2026-03-28', 1), '2026-03-29')
    assert.equal(addDaysToLocalDate('2026-03-29', 1), '2026-03-30')
    assert.equal(addDaysToLocalDate('2026-10-24', 2), '2026-10-26')
    assert.equal(addDaysToLocalDate('nope', 1), '')
})

test('addYears keeps the calendar day across the DST boundary', () => {
    assert.equal(addYearsToLocalDate('2026-03-10', 1), '2027-03-10')
    assert.equal(addYearsToLocalDate('2026-07-01', 1), '2027-07-01')
    assert.equal(addYearsToLocalDate('', 1), '')
})
