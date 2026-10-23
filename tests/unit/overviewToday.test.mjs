import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { countEventsOnDay } from '../../composables/overviewToday.ts'

const today = new Date(2026, 9, 19, 10, 0, 0)

describe('countEventsOnDay', () => {
    test('counts only events on the day, not the whole week', () => {
        const events = [
            { date_time_start: '2026-10-19 09:00:00', date_time_end: '2026-10-19 10:00:00' },
            { date_time_start: '2026-10-20 09:00:00', date_time_end: '2026-10-20 10:00:00' },
            { date_time_start: '2026-10-22 09:00:00', date_time_end: '2026-10-22 10:00:00' },
            { date_time_start: '2026-10-17 09:00:00', date_time_end: '2026-10-17 10:00:00' },
        ]
        assert.equal(countEventsOnDay(events, today), 1)
    })
    test('a multi-day event covering today counts', () => {
        assert.equal(countEventsOnDay([{ date_time_start: '2026-10-18 20:00:00', date_time_end: '2026-10-20 08:00:00' }], today), 1)
    })
    test('ISO timestamps and missing end work', () => {
        assert.equal(countEventsOnDay([{ date_time_start: '2026-10-19T08:00:00' }], today), 1)
    })
    test('junk input counts nothing', () => {
        assert.equal(countEventsOnDay(undefined, today), 0)
        assert.equal(countEventsOnDay([{ date_time_start: null }, {}], today), 0)
    })
})
