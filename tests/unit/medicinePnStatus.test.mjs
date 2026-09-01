/**
 * Unit tests for composables/medicinePnStatus.ts — the PN "wait N more
 * hours" badge fixed under AW-2026-3581 once the backend started exposing
 * last_given_at / pn_minimum_interval_minutes for PN medicine.
 *
 * No server, no browser, no build step: Node 22+ strips the composable's
 * type annotations at import time. Run with:
 *
 *   node --test tests/unit/medicinePnStatus.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { medicinePnStatus } from '../../composables/medicinePnStatus.ts'

const { minutesSinceLastGiven, minutesRemainingInInterval } = medicinePnStatus()

const NOW = new Date('2026-08-24T15:34:00Z')

describe('minutesSinceLastGiven', () => {
    test('null when no dose has ever been given', () => {
        assert.equal(minutesSinceLastGiven(null, NOW), null)
        assert.equal(minutesSinceLastGiven(undefined, NOW), null)
    })
    test('computes whole minutes elapsed', () => {
        assert.equal(minutesSinceLastGiven('2026-08-24T14:34:00Z', NOW), 60)
        assert.equal(minutesSinceLastGiven('2026-08-24T15:04:00Z', NOW), 30)
    })
    test('an unparseable timestamp is treated as "no time", not a crash', () => {
        assert.equal(minutesSinceLastGiven('not-a-date', NOW), null)
    })
    test('a timestamp in the future clamps to 0 rather than going negative', () => {
        assert.equal(minutesSinceLastGiven('2026-08-24T16:00:00Z', NOW), 0)
    })
})

describe('minutesRemainingInInterval — the badge regression', () => {
    test('null when no dose has ever been given (the badge never renders for a fresh PN medicine)', () => {
        assert.equal(minutesRemainingInInterval(null, 240, NOW), null)
    })
    test('a dose given 1 hour ago with a 4-hour interval leaves 3 hours (180 minutes)', () => {
        assert.equal(minutesRemainingInInterval('2026-08-24T14:34:00Z', 240, NOW), 180)
    })
    test('null once the interval has fully elapsed — no lingering warning', () => {
        assert.equal(minutesRemainingInInterval('2026-08-24T10:00:00Z', 240, NOW), null)
    })
    test('null exactly at the interval boundary', () => {
        assert.equal(minutesRemainingInInterval('2026-08-24T11:34:00Z', 240, NOW), null)
    })
    test('null when the interval is missing, zero, or not a number (no hardcoded 240 fallback)', () => {
        assert.equal(minutesRemainingInInterval('2026-08-24T14:34:00Z', null, NOW), null)
        assert.equal(minutesRemainingInInterval('2026-08-24T14:34:00Z', 0, NOW), null)
        assert.equal(minutesRemainingInInterval('2026-08-24T14:34:00Z', undefined, NOW), null)
    })
    test('honours whatever interval the backend sends, not a hardcoded 240', () => {
        assert.equal(minutesRemainingInInterval('2026-08-24T14:34:00Z', 90, NOW), 30)
    })
})
