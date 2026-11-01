/**
 * Unit tests for composables/meetingSeat.ts - who may create online meetings.
 *
 *   node --test tests/unit/meetingSeat.test.mjs
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { canHostMeetings, needsMeetingsSeat } from '../../composables/meetingSeat.ts'

const company = { meetings_enabled: true }

test('a person with a seat at a company with the app can host', () => {
    assert.equal(canHostMeetings({ uuid: 'u1', company, has_meetings_seat: true }), true)
})

test('no seat, no hosting, and the person is told to ask for one', () => {
    const user = { uuid: 'u1', company, has_meetings_seat: false }
    assert.equal(canHostMeetings(user), false)
    assert.equal(needsMeetingsSeat(user), true)
})

test('a company without the app shows neither the buttons nor the seat note', () => {
    const user = { uuid: 'u1', company: { meetings_enabled: false }, has_meetings_seat: false }
    assert.equal(canHostMeetings(user), false)
    assert.equal(needsMeetingsSeat(user), false)
})

test('an empty store (user not loaded yet) shows no seat note', () => {
    assert.equal(needsMeetingsSeat({}), false)
    assert.equal(canHostMeetings({}), false)
})
