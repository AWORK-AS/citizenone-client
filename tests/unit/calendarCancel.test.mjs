/**
 * Unit tests for composables/calendarCancel.ts: cancelling a calendar event
 * and moving it to a new time.
 *
 *   node --test tests/unit/calendarCancel.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { canMarkStatus, cancelPayload, isCancelled, suggestedNewTime } from '../../composables/calendarCancel.ts'

describe('isCancelled / canMarkStatus', () => {
    test('a cancelled event is cancelled and cannot be marked', () => {
        const event = { uuid: 'e-1', completion_status: 'cancelled' }
        assert.equal(isCancelled(event), true)
        assert.equal(canMarkStatus(event), false)
    })
    test('an open or done event can be marked', () => {
        assert.equal(canMarkStatus({ uuid: 'e-1', completion_status: null }), true)
        assert.equal(canMarkStatus({ uuid: 'e-1', completion_status: 'completed' }), true)
    })
    test('a shift or an unsaved event cannot be marked', () => {
        assert.equal(canMarkStatus({ uuid: 'e-1', is_shift: true }), false)
        assert.equal(canMarkStatus({}), false)
        assert.equal(isCancelled(null), false)
    })
})

describe('suggestedNewTime', () => {
    test('the same time a week later', () => {
        assert.deepEqual(suggestedNewTime('2026-10-21 10:00:00', '2026-10-21 12:00:00'), { start: '2026-10-28 10:00', end: '2026-10-28 12:00' })
    })
    test('across a month end', () => {
        assert.deepEqual(suggestedNewTime('2026-10-29 09:30', '2026-10-29 10:15'), { start: '2026-11-05 09:30', end: '2026-11-05 10:15' })
    })
    test('empty for no time', () => {
        assert.deepEqual(suggestedNewTime('', ''), { start: '', end: '' })
    })
})

describe('cancelPayload', () => {
    test('a reason only', () => {
        assert.deepEqual(cancelPayload('  Sick  ', false, '2026-10-28 10:00', '2026-10-28 12:00'), { reason: 'Sick' })
    })
    test('no reason is null', () => {
        assert.deepEqual(cancelPayload('', false, '', ''), { reason: null })
    })
    test('with a new time when moving', () => {
        assert.deepEqual(cancelPayload('Sick', true, '2026-10-28 10:00', '2026-10-28 12:00'),
            { reason: 'Sick', reschedule_start: '2026-10-28 10:00', reschedule_end: '2026-10-28 12:00' })
    })
    test('moving without both times sends no new time', () => {
        assert.deepEqual(cancelPayload('Sick', true, '2026-10-28 10:00', ''), { reason: 'Sick' })
    })
})
