/**
 * Unit tests for composables/calendarNoteRequired.ts: when "done" on a
 * calendar booking opens the note form first (a company switch, CITIZE-100).
 *
 *   node --test tests/unit/calendarNoteRequired.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
    bookingStatusKey, hasNoteBody, isCalendarNoteRequiredOn, isNoteRequiredError, needsNoteBeforeDone,
} from '../../composables/calendarNoteRequired.ts'

const on = { calendar_note_required_enabled: true }
const off = { calendar_note_required_enabled: false }
// As both calendars list a booking (MyCalendarResource / the raw model).
const booking = { uuid: 'b-1', type: 'citizens', citizen_id: 7, journal_id: null, journal: null }

describe('isCalendarNoteRequiredOn', () => {
    test('only an explicit true counts', () => {
        assert.equal(isCalendarNoteRequiredOn(on), true)
        assert.equal(isCalendarNoteRequiredOn(off), false)
        assert.equal(isCalendarNoteRequiredOn({ calendar_note_required_enabled: 1 }), false)
        assert.equal(isCalendarNoteRequiredOn({}), false)
        assert.equal(isCalendarNoteRequiredOn(null), false)
        assert.equal(isCalendarNoteRequiredOn(undefined), false)
    })
})

describe('needsNoteBeforeDone', () => {
    test('a citizen booking without a note, with the switch on', () => {
        assert.equal(needsNoteBeforeDone(booking, on), true)
    })

    test('never with the switch off or missing', () => {
        assert.equal(needsNoteBeforeDone(booking, off), false)
        assert.equal(needsNoteBeforeDone(booking, {}), false)
        assert.equal(needsNoteBeforeDone(booking, null), false)
    })

    test('not once a note is linked, either way it shows', () => {
        assert.equal(needsNoteBeforeDone({ ...booking, journal_id: 3 }, on), false)
        assert.equal(needsNoteBeforeDone({ ...booking, journal: { uuid: 'j-1' } }, on), false)
    })

    test('not for shifts, own or employee events', () => {
        assert.equal(needsNoteBeforeDone({ ...booking, is_shift: true }, on), false)
        assert.equal(needsNoteBeforeDone({ ...booking, type: 'my_self', citizen_id: null }, on), false)
        assert.equal(needsNoteBeforeDone({ ...booking, type: 'employees', citizen_id: null }, on), false)
        assert.equal(needsNoteBeforeDone({ ...booking, citizen_id: null }, on), false)
        assert.equal(needsNoteBeforeDone(null, on), false)
    })
})

describe('isNoteRequiredError', () => {
    test('the server\'s 422 for a booking without a saved note', () => {
        assert.equal(isNoteRequiredError({ message: 'Write a journal note…', code: 'note_required' }), true)
        assert.equal(isNoteRequiredError({ message: 'Something else' }), false)
        assert.equal(isNoteRequiredError(null), false)
    })
})

describe('bookingStatusKey', () => {
    test('maps the three statuses', () => {
        assert.equal(bookingStatusKey('completed'), 'completed')
        assert.equal(bookingStatusKey('not_completed'), 'notCompleted')
        assert.equal(bookingStatusKey('planned'), 'planned')
        assert.equal(bookingStatusKey(null), 'planned')
        assert.equal(bookingStatusKey(undefined), 'planned')
    })
})

describe('hasNoteBody', () => {
    test('an editor nobody wrote in has no body', () => {
        for (const html of [undefined, null, '', '<p></p>', '<p> </p>', '<p>&nbsp;</p>', '<p>\u00A0</p>\n<p></p>']) {
            assert.equal(hasNoteBody(html), false, JSON.stringify(html))
        }
    })

    test('any text counts', () => {
        assert.equal(hasNoteBody('<p>Went well</p>'), true)
        assert.equal(hasNoteBody('<p>&nbsp;ok</p>'), true)
        assert.equal(hasNoteBody('<p><span class="mention">@Anna</span></p>'), true)
    })
})
