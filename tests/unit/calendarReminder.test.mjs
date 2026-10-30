/**
 * Unit tests for utils/calendarReminder.ts - the reminder picked on a calendar event.
 *
 *   node --test tests/unit/calendarReminder.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { CALENDAR_REMINDER_OPTIONS, DEFAULT_CALENDAR_REMINDER, reminderLabel, reminderOf } from '../../utils/calendarReminder.ts'

describe('calendar reminder', () => {
    test('offers what the backend accepts, and a new event gets 15 minutes', () => {
        assert.deepEqual([...CALENDAR_REMINDER_OPTIONS], [0, 5, 10, 15, 30, 60, 120, 1440, 2880])
        assert.equal(DEFAULT_CALENDAR_REMINDER, 15)
    })

    test('an edited event keeps its own reminder, or none', () => {
        assert.equal(reminderOf({ reminder_minutes: 30 }), 30)
        assert.equal(reminderOf({ reminder_minutes: '60' }), 60)
        assert.equal(reminderOf({ reminder_minutes: 0 }), 0)
        assert.equal(reminderOf({ reminder_minutes: null }), null)
        assert.equal(reminderOf({}), null, 'saved before reminders existed')
        assert.equal(reminderOf({ reminder_minutes: 7 }), null, 'not a choice on the form')
    })

    test('each choice is labelled in the largest whole unit', () => {
        assert.deepEqual(reminderLabel(null), { key: 'events.form.reminder.none' })
        assert.deepEqual(reminderLabel(0), { key: 'events.form.reminder.atStart' })
        assert.deepEqual(reminderLabel(15), { key: 'events.form.reminder.minutesBefore', count: 15 })
        assert.deepEqual(reminderLabel(120), { key: 'events.form.reminder.hoursBefore', count: 2 })
        assert.deepEqual(reminderLabel(1440), { key: 'events.form.reminder.daysBefore', count: 1 })
    })
})
