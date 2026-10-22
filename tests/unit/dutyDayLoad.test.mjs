/**
 * Unit tests for composables/dutyDayLoad.ts (task #6): the load of each day on
 * the duty schedule against the departments' minimum staffing.
 *
 *   node --test tests/unit/dutyDayLoad.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { dutyDayLoad } from '../../composables/dutyDayLoad.ts'

const { loadStatus, missingStaff, formatHours } = dutyDayLoad()
const load = (staff, minimum) => ({ staff_count: staff, shift_count: staff, planned_hours: staff * 8, absent_count: 0, minimum_staff: minimum })

describe('loadStatus', () => {
    test('under the minimum', () => assert.equal(loadStatus(load(1, 3)), 'under'))
    test('at or over the minimum', () => {
        assert.equal(loadStatus(load(3, 3)), 'met')
        assert.equal(loadStatus(load(5, 3)), 'met')
    })
    test('no minimum set, or no data', () => {
        assert.equal(loadStatus(load(2, null)), 'none')
        assert.equal(loadStatus(load(2, 0)), 'none')
        assert.equal(loadStatus(null), 'none')
    })
})

describe('missingStaff', () => {
    test('counts the shortfall only when under', () => {
        assert.equal(missingStaff(load(1, 3)), 2)
        assert.equal(missingStaff(load(4, 3)), 0)
        assert.equal(missingStaff(load(4, null)), 0)
    })
})

describe('formatHours', () => {
    test('short figure in the locale', () => {
        assert.equal(formatHours(7.5, 'en-GB'), '7.5')
        assert.equal(formatHours(16, 'en-GB'), '16')
        assert.equal(formatHours(7.5, 'da-DK'), '7,5')
        assert.equal(formatHours(null, 'en-GB'), '0')
    })
    test('quarter hours are not rounded to one decimal', () => {
        assert.equal(formatHours(8.75, 'en-GB'), '8.75')
        assert.equal(formatHours(8.75, 'da-DK'), '8,75')
        assert.equal(formatHours(8.25 + 8.75, 'da-DK'), '17')
    })
})
