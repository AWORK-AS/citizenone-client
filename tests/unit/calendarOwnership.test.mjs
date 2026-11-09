/**
 * Unit tests for composables/calendarOwnership.ts - whether the calendar offers
 * edit, delete, cancel and done/not done on an event (AW-2026-9924).
 *
 * The API sends can_manage on the calendar list. Only an explicit false hides
 * the actions; a missing flag (an older API, a list that doesn't send it) keeps
 * today's behaviour.
 *
 * Run with:
 *
 *   node --test tests/unit/calendarOwnership.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { canManageEvent } from '../../composables/calendarOwnership.ts'

describe('canManageEvent', () => {
    test('a colleague\'s event the company keeps read-only cannot be changed', () => {
        assert.equal(canManageEvent({ uuid: 'a', can_manage: false }), false)
    })

    test('an event the user may change can be changed', () => {
        assert.equal(canManageEvent({ uuid: 'a', can_manage: true }), true)
    })

    test('a missing flag keeps today\'s behaviour', () => {
        assert.equal(canManageEvent({ uuid: 'a' }), true)
        assert.equal(canManageEvent(null), true)
        assert.equal(canManageEvent(undefined), true)
    })
})
