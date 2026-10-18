/**
 * Unit tests for composables/bookingCalendar.ts - the month grid the patient
 * picks a booking day from. Monday first; only dates with a free time can be
 * picked. It replaced a long list of date buttons (customer request).
 *
 *   node --test tests/unit/bookingCalendar.test.mjs
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { bookableMonths, monthGrid, monthOf } from '../../composables/bookingCalendar.ts'

test('the week starts on Monday', () => {
    // October 2026 starts on a Thursday, so three days of September come first.
    const weeks = monthGrid({ year: 2026, month: 9 }, new Set())
    assert.deepEqual(weeks[0].map((d) => d.key), [
        '2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04',
    ])
    assert.equal(weeks[0][0].inMonth, false)
    assert.equal(weeks[0][3].inMonth, true)
})

test('every day of the month is there, in whole weeks', () => {
    const weeks = monthGrid({ year: 2026, month: 1 }, new Set())
    assert.equal(weeks.flat().filter((d) => d.inMonth).length, 28)
    weeks.forEach((week) => assert.equal(week.length, 7))
})

test('only the bookable dates of this month can be picked', () => {
    const weeks = monthGrid({ year: 2026, month: 9 }, new Set(['2026-10-09', '2026-09-30']))
    assert.deepEqual(weeks.flat().filter((d) => d.available).map((d) => d.key), ['2026-10-09'])
})

test('the arrows walk from the first to the last bookable month', () => {
    assert.deepEqual(bookableMonths(['2026-12-02', '2026-10-09', '2026-10-13']), [
        { year: 2026, month: 9 }, { year: 2026, month: 10 }, { year: 2026, month: 11 },
    ])
    assert.deepEqual(bookableMonths(['2026-12-30', '2027-01-04']), [{ year: 2026, month: 11 }, { year: 2027, month: 0 }])
    assert.deepEqual(bookableMonths([]), [])
})

test('a date is read without shifting it a day', () => {
    assert.deepEqual(monthOf('2026-11-01'), { year: 2026, month: 10 })
})
