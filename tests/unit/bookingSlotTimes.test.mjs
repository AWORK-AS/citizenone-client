/**
 * Unit tests for composables/bookingSlotTimes.ts -- how the services screen
 * cuts a clinic's day ("08:00 to 12:00, 20 minutes each") into bookable times.
 *
 * No server, no browser, no build step: Node 22+ strips the type annotations
 * at import time. Run with:
 *
 *   node --test tests/unit/bookingSlotTimes.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

import { bookingSlotTimes, MAX_SLOT_TIMES_PER_DAY } from '../../composables/bookingSlotTimes.ts'

describe('bookingSlotTimes', () => {
    test('cuts a window into back-to-back times', () => {
        assert.deepEqual(bookingSlotTimes('08:00', '09:00', 20), [
            { start_time: '08:00', end_time: '08:20', capacity: 1 },
            { start_time: '08:20', end_time: '08:40', capacity: 1 },
            { start_time: '08:40', end_time: '09:00', capacity: 1 },
        ])
    })

    test('leaves the gap between times and drops a last time that would run over', () => {
        const times = bookingSlotTimes('08:00', '09:00', 20, 5)

        assert.deepEqual(times.map((time) => `${time.start_time}-${time.end_time}`), [
            '08:00-08:20',
            '08:25-08:45',
        ])
    })

    test('carries the capacity onto every time', () => {
        const times = bookingSlotTimes('13:00', '14:00', 30, 0, 3)

        assert.deepEqual(times.map((time) => time.capacity), [3, 3])
    })

    test('pads single-digit hours the way the API expects', () => {
        assert.equal(bookingSlotTimes('7:30', '8:00', 30)[0].start_time, '07:30')
    })

    test('gives nothing back for a window that ends before it starts, or no length', () => {
        assert.deepEqual(bookingSlotTimes('12:00', '08:00', 20), [])
        assert.deepEqual(bookingSlotTimes('08:00', '12:00', 0), [])
        assert.deepEqual(bookingSlotTimes('', '12:00', 20), [])
        assert.deepEqual(bookingSlotTimes('25:00', '26:00', 20), [])
    })

    test('stops at the number of times the API takes in one day', () => {
        assert.equal(bookingSlotTimes('00:00', '23:59', 5).length, MAX_SLOT_TIMES_PER_DAY)
    })
})
