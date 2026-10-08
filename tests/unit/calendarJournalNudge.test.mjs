/**
 * Unit tests for composables/calendarJournalNudge.ts - which citizen bookings
 * show the "note missing" badge in the calendar. Mirrors the backend's
 * MyCalendar::scopeNeedingJournalNote.
 *
 *   node --test tests/unit/calendarJournalNudge.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { needsJournalNote } from '../../composables/calendarJournalNudge.ts'

const now = new Date('2026-10-08T12:00:00')

const booking = (overrides = {}) => ({
    type: 'citizens',
    citizen_id: 7,
    journal_id: null,
    completion_status: null,
    date_time_start: '2026-10-08 09:00:00',
    date_time_end: '2026-10-08 10:00:00',
    ...overrides,
})

describe('needsJournalNote', () => {
    test('an ended citizen booking without a note needs one', () => {
        assert.equal(needsJournalNote(booking(), now), true)
    })

    test('a completed one still needs its note', () => {
        assert.equal(needsJournalNote(booking({ completion_status: 'completed' }), now), true)
    })

    test('one with a linked note does not', () => {
        assert.equal(needsJournalNote(booking({ journal_id: 12 }), now), false)
    })

    test('one marked not completed does not', () => {
        assert.equal(needsJournalNote(booking({ completion_status: 'not_completed' }), now), false)
    })

    test('one still running or in the future does not', () => {
        assert.equal(needsJournalNote(booking({ date_time_end: '2026-10-08 12:30:00' }), now), false)
    })

    test('one that ended more than seven days ago does not', () => {
        assert.equal(needsJournalNote(booking({ date_time_end: '2026-09-30 10:00:00' }), now), false)
        assert.equal(needsJournalNote(booking({ date_time_end: '2026-10-01 13:00:00' }), now), true)
    })

    test('only citizen bookings, never shifts or other types', () => {
        assert.equal(needsJournalNote(booking({ type: 'my_self' }), now), false)
        assert.equal(needsJournalNote(booking({ type: 'employees' }), now), false)
        assert.equal(needsJournalNote(booking({ citizen_id: null }), now), false)
        assert.equal(needsJournalNote(booking({ is_shift: true }), now), false)
    })

    test('bad input is not a booking', () => {
        assert.equal(needsJournalNote(null, now), false)
        assert.equal(needsJournalNote(booking({ date_time_end: '' }), now), false)
        assert.equal(needsJournalNote(booking({ date_time_end: 'not a date' }), now), false)
    })
})
