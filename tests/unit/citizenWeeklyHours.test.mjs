/**
 * Unit tests for composables/citizenWeeklyHours.ts: hours a week per citizen
 * on "My day" and in the assign form.
 *
 *   node --test tests/unit/citizenWeeklyHours.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
    distributionStatus, formatWeekHours, isContactWeeklyHoursOn, shiftWeekDate, panelWeekDate, parseWeeklyHours, planProgress, planStatus, weekProgress, weekStatus,
} from '../../composables/citizenWeeklyHours.ts'

describe('isContactWeeklyHoursOn', () => {
    test('on only when the company switched it on', () => {
        assert.equal(isContactWeeklyHoursOn({ contact_weekly_hours_enabled: true }), true)
        assert.equal(isContactWeeklyHoursOn({ contact_weekly_hours_enabled: false }), false)
        assert.equal(isContactWeeklyHoursOn({}), false)
        assert.equal(isContactWeeklyHoursOn(null), false)
    })
})

describe('weekProgress', () => {
    test('share of the hours given', () => {
        assert.equal(weekProgress({ weekly_hours: 10, used_hours: 3.5 }), 35)
    })
    test('stays at 100 past the hours given', () => {
        assert.equal(weekProgress({ weekly_hours: 4, used_hours: 5 }), 100)
    })
    test('0 without hours given', () => {
        assert.equal(weekProgress({ weekly_hours: 0, used_hours: 2 }), 0)
    })
})

describe('weekStatus', () => {
    test('open, done, over', () => {
        assert.equal(weekStatus({ remaining_hours: 6.5 }), 'open')
        assert.equal(weekStatus({ remaining_hours: 0 }), 'done')
        assert.equal(weekStatus({ remaining_hours: -1 }), 'over')
    })
})

describe('parseWeeklyHours', () => {
    test('a number, with comma or point', () => {
        assert.equal(parseWeeklyHours('7,5'), 7.5)
        assert.equal(parseWeeklyHours('10'), 10)
        assert.equal(parseWeeklyHours(4), 4)
    })
    test('empty is none', () => {
        assert.equal(parseWeeklyHours(''), null)
        assert.equal(parseWeeklyHours('  '), null)
        assert.equal(parseWeeklyHours(null), null)
        assert.equal(parseWeeklyHours(undefined), null)
    })
    test('not a number is none', () => {
        assert.equal(parseWeeklyHours('abc'), null)
    })
})

describe('formatWeekHours', () => {
    test('trims zeros and uses a comma except in English', () => {
        assert.equal(formatWeekHours(6, 'dk'), '6')
        assert.equal(formatWeekHours(7.5, 'dk'), '7,5')
        assert.equal(formatWeekHours(7.5, 'en'), '7.5')
        assert.equal(formatWeekHours(1.234, 'sv'), '1,23')
    })
})

describe('planProgress / planStatus', () => {
    test('booked share of the hours given', () => {
        assert.equal(planProgress({ weekly_hours: 10, planned_hours: 6.5 }), 65)
        assert.equal(planProgress({ weekly_hours: 10 }), 0)
    })
    test('open, done, over by what is left to place', () => {
        assert.equal(planStatus({ unplanned_hours: 3.5 }), 'open')
        assert.equal(planStatus({ unplanned_hours: 0 }), 'done')
        assert.equal(planStatus({ unplanned_hours: -1 }), 'over')
    })
})

describe('panelWeekDate', () => {
    test('the week on screen', () => {
        assert.equal(panelWeekDate('week', { start_date: '2026-10-19', end_date: '2026-10-25' }, '2026-10-23'), '2026-10-19')
    })
    test('the day on screen', () => {
        assert.equal(panelWeekDate('default', { start_date: '2026-11-03', end_date: '2026-11-03' }, '2026-10-23'), '2026-11-03')
    })
    test('today for a month or nothing', () => {
        assert.equal(panelWeekDate('month', { start_date: '2026-09-28', end_date: '2026-11-08' }, '2026-10-23'), '2026-10-23')
        assert.equal(panelWeekDate('default', null, '2026-10-23'), '2026-10-23')
    })
})

describe('distributionStatus', () => {
    test('over, done or open against the grant', () => {
        assert.equal(distributionStatus(-5), 'over')
        assert.equal(distributionStatus(0), 'done')
        assert.equal(distributionStatus(30), 'open')
    })

    test('nothing without a grant', () => {
        assert.equal(distributionStatus(null), null)
        assert.equal(distributionStatus(undefined), null)
    })
})

describe('shiftWeekDate', () => {
    test('moves a week at a time, over month and year ends', () => {
        assert.equal(shiftWeekDate('2026-10-26', 1), '2026-11-02')
        assert.equal(shiftWeekDate('2026-10-26', -1), '2026-10-19')
        assert.equal(shiftWeekDate('2026-12-28', 1), '2027-01-04')
    })

    test('keeps the day across the end of summer time', () => {
        assert.equal(shiftWeekDate('2026-10-21', 1), '2026-10-28')
    })
})
