/**
 * Unit tests for composables/medicineDoseTiming.ts — the overdue/due-soon
 * timing logic shared between the two medicine-journals pages.
 *
 * No server, no browser, no build step: Node 22+ strips the composable's
 * type annotations at import time. Run with:
 *
 *   node --test tests/unit/medicineDoseTiming.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { medicineDoseTiming } from '../../composables/medicineDoseTiming.ts'

const { isMissed, isDueSoon, minutesSince, minutesUntil } = medicineDoseTiming()

// Monday 24 Aug 2026, 15:34 — matches the live screenshot this suite was
// written from (an Ibuprofen dose scheduled at 10:00 shown as "+5h 34min").
const NOW = new Date('2026-08-24T15:34:00')

describe('isMissed / isDueSoon — point-time "HH:mm" doses (unchanged behaviour)', () => {
    test('a time earlier today is missed', () => {
        assert.equal(isMissed('10:00', NOW), true)
    })

    test('a time later today is not missed', () => {
        assert.equal(isMissed('17:00', NOW), false)
    })

    test('a time within the next 60 minutes is due soon', () => {
        assert.equal(isDueSoon('16:00', NOW), true)
    })

    test('a time more than 60 minutes out is not due soon', () => {
        assert.equal(isDueSoon('17:00', NOW), false)
    })

    test('an already-passed time is not due soon', () => {
        assert.equal(isDueSoon('10:00', NOW), false)
    })

    test('minutesSince/minutesUntil agree with the screenshot (5h34m = 334min)', () => {
        assert.equal(minutesSince('10:00', NOW), 334)
        assert.equal(minutesUntil('16:00', NOW), 26)
    })

    test('no time means not missed and not due soon', () => {
        assert.equal(isMissed('', NOW), false)
        assert.equal(isDueSoon('', NOW), false)
    })
})

describe('range-format dose times — fixed 2026-08-24 (deadline = window end)', () => {
    // Chosen semantic, documented in the composable: a range's deadline is
    // its END time, treated exactly like a point-time dose's only time.
    // These are the same live values from the screenshot that originally
    // exposed the bug (06:00-10:00 and 10:00-13:00 windows, both closed by
    // 15:34; 17:00-22:00 still open).

    test('a window that closed hours ago is missed', () => {
        assert.equal(isMissed('06:00 - 10:00', NOW), true)
        assert.equal(isMissed('10:00 - 13:00', NOW), true)
    })

    test('a window not yet open is not missed', () => {
        assert.equal(isMissed('17:00 - 22:00', NOW), false)
    })

    test('a window closing within 60 minutes is due soon, even while still open', () => {
        // Window is 14:00-16:00; NOW (15:34) is inside it, 26 minutes from
        // closing — the "hurry, last chance" case.
        assert.equal(isMissed('14:00 - 16:00', NOW), false)
        assert.equal(isDueSoon('14:00 - 16:00', NOW), true)
    })

    test('a window open with plenty of time left is neither missed nor due soon', () => {
        // Window is 14:00-19:00; NOW (15:34) is inside it, closes in 3h26m.
        assert.equal(isMissed('14:00 - 19:00', NOW), false)
        assert.equal(isDueSoon('14:00 - 19:00', NOW), false)
    })

    test('a window that has not opened yet, but closes within 60 minutes, is due soon', () => {
        // Edge case: NOW is 15:34, window is 16:00-16:20 — hasn't started,
        // but its deadline (16:20) is 46 minutes out.
        assert.equal(isDueSoon('16:00 - 16:20', NOW), true)
    })

    test('minutesSince/minutesUntil are computed against the window end', () => {
        assert.equal(minutesSince('06:00 - 10:00', NOW), 334) // same as isMissed('10:00', NOW) above
        assert.equal(minutesUntil('17:00 - 22:00', NOW), 386)
    })

    test('a malformed value with no HH:mm anywhere is treated as no time, not a crash', () => {
        assert.equal(isMissed('as needed', NOW), false)
        assert.equal(isDueSoon('as needed', NOW), false)
    })
})

describe('overnight-wrap window "22:00 - 06:00" — seeded platform-wide, easy to get wrong', () => {
    // This is real seeded data (TimeIntervalSeeder.php), not a made-up edge
    // case: every company has this exact interval available. A naive
    // "deadline = last HH:mm found" fix (this file's first cut) resolves the
    // deadline to 06:00 *today*, which is almost always already in the past
    // — so a window that had just opened at 22:00 was immediately flagged as
    // hours overdue. That would have been a worse regression than the bug it
    // replaced.
    //
    // All of these evaluate "today's" bucket entry (the only one any call
    // site ever passes), so its deadline is always tomorrow's end-time,
    // regardless of what time it currently is — see the composable's header
    // comment for why an earlier draft that made this conditional on the
    // current clock time was wrong.

    test('the window is not missed the moment it opens', () => {
        const justOpened = new Date('2026-08-24T22:05:00')
        assert.equal(isMissed('22:00 - 06:00', justOpened), false)
    })

    test('the window is not missed an hour after it opens', () => {
        const anHourIn = new Date('2026-08-24T23:00:00')
        assert.equal(isMissed('22:00 - 06:00', anHourIn), false)
    })

    test("today's occurrence is not due soon or missed in the early hours (it hasn't opened yet)", () => {
        // At 05:00 the calendar has already rolled over to a new "today" —
        // this is evaluating that new day's slot, whose window doesn't open
        // until tonight, ~17 hours away. It is NOT evaluating the *previous*
        // night's still-technically-open window; nothing in the app does
        // that (see the composable's header comment on that gap).
        const earlyMorning = new Date('2026-08-25T05:00:00')
        assert.equal(isMissed('22:00 - 06:00', earlyMorning), false)
        assert.equal(isDueSoon('22:00 - 06:00', earlyMorning), false)
    })

    test('due soon fires in the hour before tonight\'s window opens and closes tomorrow', () => {
        // 21:30 today: today's window (opens 22:00, closes tomorrow 06:00)
        // is 30 minutes from opening — but the deadline being checked is
        // still the close time, ~8.5 hours out, so this should NOT be
        // "due soon" yet. Due-soon only means "closing within the hour".
        const beforeOpen = new Date('2026-08-24T21:30:00')
        assert.equal(isDueSoon('22:00 - 06:00', beforeOpen), false)
    })

    test("today's occurrence has not started yet during the daytime", () => {
        const midAfternoon = new Date('2026-08-24T14:00:00')
        assert.equal(isMissed('22:00 - 06:00', midAfternoon), false)
        assert.equal(isDueSoon('22:00 - 06:00', midAfternoon), false)
    })

    test('minutesUntil counts down to tomorrow\'s close, not a same-day time', () => {
        // 23:00 today -> tomorrow 06:00 is 7 hours = 420 minutes.
        const anHourIn = new Date('2026-08-24T23:00:00')
        assert.equal(minutesUntil('22:00 - 06:00', anHourIn), 420)
    })
})
