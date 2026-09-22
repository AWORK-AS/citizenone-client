/**
 * Unit tests for composables/recentJournalWindow.ts -- the window the
 * overview's recent journal notes feed opens on.
 *
 * The feed, the count badge and the "see all" link all have to agree on what
 * "the last seven days" is, including across a month or year boundary and
 * across the switch to and from summer time, where adding days to a timestamp
 * instead of to a calendar date lands an hour short and drops a day.
 *
 * No server, no browser, no build step: Node 22+ strips the type annotations
 * at import time. Run with:
 *
 *   node --test tests/unit/recentJournalWindow.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

import { recentJournalWindow } from '../../composables/recentJournalWindow.ts'

/** Local midnight, the way the browser builds "today". */
function day(year, month, date, hour = 12) {
    return new Date(year, month - 1, date, hour)
}

describe('recentJournalWindow', () => {
    test('ends today and reaches back seven days in total', () => {
        const window = recentJournalWindow(7, day(2026, 9, 20))

        assert.equal(window.end_date, '2026-09-20')
        assert.equal(window.start_date, '2026-09-14')
    })

    test('defaults to seven days', () => {
        assert.deepEqual(
            recentJournalWindow(undefined, day(2026, 9, 20)),
            recentJournalWindow(7, day(2026, 9, 20)),
        )
    })

    test('a one-day window is today alone', () => {
        const window = recentJournalWindow(1, day(2026, 9, 20))

        assert.equal(window.start_date, '2026-09-20')
        assert.equal(window.end_date, '2026-09-20')
    })

    test('crosses month and year boundaries', () => {
        assert.equal(recentJournalWindow(7, day(2026, 3, 3)).start_date, '2026-02-25')
        assert.equal(recentJournalWindow(7, day(2026, 1, 2)).start_date, '2025-12-27')
    })

    test('survives the daylight saving change', () => {
        // Danish summer time ends on the last Sunday of October: the 25th in
        // 2026. A window opened the day after still starts seven dates back.
        const window = recentJournalWindow(7, day(2026, 10, 26))

        assert.equal(window.start_date, '2026-10-20')
        assert.equal(window.end_date, '2026-10-26')
    })

    test('pads single digit months and days', () => {
        assert.equal(recentJournalWindow(1, day(2026, 1, 5)).start_date, '2026-01-05')
    })
})
