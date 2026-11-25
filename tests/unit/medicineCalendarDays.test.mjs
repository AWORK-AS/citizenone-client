/**
 * Unit tests for composables/medicineCalendarDays.ts (Roadmap #317): the Give
 * medicine calendar marks a past day red only when the medicine was due that
 * day and not fully logged.
 *
 *   node --test tests/unit/medicineCalendarDays.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { medicineCalendarDays } from '../../composables/medicineCalendarDays.ts'

const { isDueOnDate, dayMarker } = medicineCalendarDays()

// Every other day from 2 Nov: due 2, 4, 6 ... (what the API's occurs_dates lists).
const everyOtherDay = {
    created_at: '2026-11-02T10:00:00.000000Z',
    start_date: '2026-11-02',
    occurs_dates: ['2026-11-02', '2026-11-04', '2026-11-06', '2026-11-08'],
}

describe('isDueOnDate', () => {
    test('an every-other-day medicine is due on the listed days only', () => {
        assert.equal(isDueOnDate(everyOtherDay, '2026-11-04'), true)
        assert.equal(isDueOnDate(everyOtherDay, '2026-11-05'), false)
    })

    test('without occurs_dates every day counts as due, as before', () => {
        assert.equal(isDueOnDate({ start_date: '2026-11-02' }, '2026-11-05'), true)
        assert.equal(isDueOnDate({ start_date: '2026-11-02', occurs_dates: null }, '2026-11-05'), true)
    })

    test('not due before the start date', () => {
        assert.equal(isDueOnDate({ ...everyOtherDay, occurs_dates: null }, '2026-11-01'), false)
    })

    test('with no start date the medicine starts on its creation day', () => {
        assert.equal(isDueOnDate({ created_at: '2026-11-02T10:00:00.000000Z' }, '2026-11-01'), false)
        assert.equal(isDueOnDate({ created_at: '2026-11-02T10:00:00.000000Z' }, '2026-11-02'), true)
    })

    test('not due after the end date', () => {
        const medicine = { start_date: '2026-11-02', end_date: '2026-11-10' }
        assert.equal(isDueOnDate(medicine, '2026-11-10'), true)
        assert.equal(isDueOnDate(medicine, '2026-11-11'), false)
    })

    test('a repeat end date replaces the end date', () => {
        const medicine = { start_date: '2026-11-02', end_date: '2026-11-10', recurring_until: '2026-11-20' }
        assert.equal(isDueOnDate(medicine, '2026-11-15'), true)
        assert.equal(isDueOnDate(medicine, '2026-11-21'), false)
    })

    test('not due outside its treatment periods', () => {
        const medicine = {
            start_date: '2026-11-01',
            treatment_periods: [{ start: '2026-11-01', end: '2026-11-07' }, { start: '2026-11-15', end: '' }],
        }
        assert.equal(isDueOnDate(medicine, '2026-11-05'), true)
        assert.equal(isDueOnDate(medicine, '2026-11-10'), false)
    })

    test('a missing medicine never counts as due', () => {
        assert.equal(isDueOnDate(null, '2026-11-05'), false)
    })
})

describe('isDueOnDate and extra dates', () => {
    test('an extra date counts inside a treatment pause, as on the medicine tab', () => {
        const medicine = {
            start_date: '2026-11-01',
            treatment_periods: [{ start: '2026-11-01', end: '2026-11-07' }],
            extra_dates: ['2026-11-10'],
        }
        assert.equal(isDueOnDate(medicine, '2026-11-10'), true)
    })
})

const given = (time) => ({ time, status: 'given' })
const open = (time) => ({ time, status: null })

describe('dayMarker', () => {
    const today = '2026-11-25'
    const base = { today, nowTime: '12:00', doseTimes: ['08:00', '20:00'] }

    test('a past due day with no log is red', () => {
        assert.equal(dayMarker({ ...base, dateStr: '2026-11-20', due: true, entries: [open('08:00'), open('20:00')] }), 'overdue')
    })

    test('a past off day with no log has no marker', () => {
        assert.equal(dayMarker({ ...base, dateStr: '2026-11-21', due: false, entries: [open('08:00'), open('20:00')] }), null)
    })

    test('a fully logged due day shows the given marker', () => {
        assert.equal(dayMarker({ ...base, dateStr: '2026-11-20', due: true, entries: [given('08:00'), { time: '20:00', status: 'delivered' }] }), 'given')
    })

    test('a partly logged past due day is red', () => {
        assert.equal(dayMarker({ ...base, dateStr: '2026-11-20', due: true, entries: [given('08:00'), open('20:00')] }), 'overdue')
    })

    test('a past due day logged only as deviated is red', () => {
        assert.equal(dayMarker({ ...base, dateStr: '2026-11-20', due: true, entries: [{ time: '08:00', status: 'deviated' }] }), 'overdue')
    })

    test('a past due day with no entries at all is red', () => {
        assert.equal(dayMarker({ ...base, dateStr: '2026-11-20', due: true, entries: undefined }), 'overdue')
    })

    test('a dose logged on an off day still shows as given', () => {
        assert.equal(dayMarker({ ...base, dateStr: '2026-11-21', due: false, entries: [given('08:00'), open('20:00')] }), 'given')
    })

    test('today is red once a dose time has passed without a log', () => {
        assert.equal(dayMarker({ ...base, dateStr: today, due: true, entries: [open('08:00'), open('20:00')] }), 'overdue')
    })

    test('today stays amber when the passed dose is logged and the next is still ahead', () => {
        assert.equal(dayMarker({ ...base, dateStr: today, due: true, entries: [given('08:00'), open('20:00')] }), 'scheduled')
    })

    test('today is amber before the first dose time', () => {
        assert.equal(dayMarker({ ...base, nowTime: '07:00', dateStr: today, due: true, entries: [open('08:00'), open('20:00')] }), 'scheduled')
    })

    test('today is red when a dose is logged as deviated', () => {
        assert.equal(dayMarker({ ...base, nowTime: '07:00', dateStr: today, due: true, entries: [{ time: '08:00', status: 'deviated' }, open('20:00')] }), 'overdue')
    })

    test('today without entries falls back to the schedule times', () => {
        assert.equal(dayMarker({ ...base, dateStr: today, due: true, entries: [] }), 'overdue')
        assert.equal(dayMarker({ ...base, nowTime: '07:00', dateStr: today, due: true, entries: [] }), 'scheduled')
    })

    test('today is not due: no marker', () => {
        assert.equal(dayMarker({ ...base, dateStr: today, due: false, entries: [open('08:00')] }), null)
    })

    test('a future due day is amber, a future off day has no marker', () => {
        assert.equal(dayMarker({ ...base, dateStr: '2026-11-27', due: true, entries: [open('08:00')] }), 'scheduled')
        assert.equal(dayMarker({ ...base, dateStr: '2026-11-28', due: false, entries: [open('08:00')] }), null)
    })
})
