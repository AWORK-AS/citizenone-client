/**
 * Unit tests for composables/bookingAccess.ts - when a booking page sends the
 * person back to the calendar. The user store is `{}` until the user has loaded.
 *
 *   node --test tests/unit/bookingAccess.test.mjs
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { shouldLeaveBookingPages } from '../../composables/bookingAccess.ts'

test('an empty store (cold load, user not loaded yet) does not send anyone away', () => {
    assert.equal(shouldLeaveBookingPages({}), false)
    assert.equal(shouldLeaveBookingPages(undefined), false)
    assert.equal(shouldLeaveBookingPages(null), false)
})

test('a loaded user with booking access stays', () => {
    assert.equal(shouldLeaveBookingPages({ uuid: 'u1', has_booking_app_access: true }), false)
})

test('a loaded user without booking access is sent back', () => {
    assert.equal(shouldLeaveBookingPages({ uuid: 'u1', has_booking_app_access: false }), true)
    assert.equal(shouldLeaveBookingPages({ uuid: 'u1' }), true)
})
