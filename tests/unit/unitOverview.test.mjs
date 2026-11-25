/**
 * Roadmap #499: the units overview's grid.
 *
 *   node --test tests/unit/unitOverview.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
    periodFor, shiftDate, bookingsOnDay, placeInDay, hourSlots, timeLabel, bookingLabel, bookingDetails,
    phoneList, freeWindow, newEventStart, DAY_START_HOUR, DAY_END_HOUR,
} from '../../composables/unitOverview.ts'

const booking = (start, end, extra = {}) => ({ calendar_uuid: 'c', start, end, is_visible: true, title: 'Lægebesøg', employee: 'Mette', citizen: 'Louise', ...extra })

describe('the period a view shows', () => {
    test('a week runs Monday to Sunday', () => {
        const p = periodFor('week', '2026-12-03') // a Thursday
        assert.equal(p.from, '2026-11-30')
        assert.equal(p.to, '2026-12-06')
        assert.equal(p.days.length, 7)
    })
    test('a day is just that day, a month all its days', () => {
        assert.deepEqual(periodFor('day', '2026-12-03').days, ['2026-12-03'])
        const m = periodFor('month', '2026-02-10')
        assert.equal(m.from, '2026-02-01')
        assert.equal(m.to, '2026-02-28')
        assert.equal(m.days.length, 28)
    })
    test('back and forward move by the view', () => {
        assert.equal(shiftDate('day', '2026-12-03', 1), '2026-12-04')
        assert.equal(shiftDate('week', '2026-12-03', -1), '2026-11-26')
        assert.equal(shiftDate('month', '2026-01-31', 1), '2026-02-28')
    })
})

describe('bookings in a day', () => {
    test('only those touching the day, earliest first', () => {
        const list = [booking('2026-12-03 13:00:00', '2026-12-03 14:00:00'), booking('2026-12-03 10:00:00', '2026-12-03 12:00:00'), booking('2026-12-04 10:00:00', '2026-12-04 11:00:00')]
        assert.deepEqual(bookingsOnDay(list, '2026-12-03').map((b) => b.start), ['2026-12-03 10:00:00', '2026-12-03 13:00:00'])
    })
    test('one over midnight shows on both days', () => {
        const night = booking('2026-12-03 22:00:00', '2026-12-04 07:00:00')
        assert.equal(bookingsOnDay([night], '2026-12-03').length, 1)
        assert.equal(bookingsOnDay([night], '2026-12-04').length, 1)
        assert.equal(timeLabel(night, '2026-12-03'), '22:00–…')
        assert.equal(timeLabel(night, '2026-12-04'), '…–07:00')
    })
})

describe('placing a booking on the day axis', () => {
    test(`10–12 on a ${DAY_START_HOUR}–${DAY_END_HOUR} axis`, () => {
        // 16 hours wide; 10:00 is 4 hours in (25%), two hours long (12.5%).
        assert.deepEqual(placeInDay(booking('2026-12-03 10:00:00', '2026-12-03 12:00:00'), '2026-12-03'), { left: 25, width: 12.5 })
        assert.equal(hourSlots().length, DAY_END_HOUR - DAY_START_HOUR)
    })
    test('clamped to the axis, and never thinner than 2%', () => {
        assert.deepEqual(placeInDay(booking('2026-12-03 00:00:00', '2026-12-03 23:59:00'), '2026-12-03'), { left: 0, width: 100 })
        assert.equal(placeInDay(booking('2026-12-03 10:00:00', '2026-12-03 10:05:00'), '2026-12-03').width, 2)
    })
    test('a booking outside the axis has no place', () => {
        assert.equal(placeInDay(booking('2026-12-03 23:00:00', '2026-12-03 23:30:00'), '2026-12-03'), null)
    })
})

describe('what a booking says', () => {
    test('its title and people when the viewer may see it', () => {
        const b = booking('2026-12-03 10:00:00', '2026-12-03 12:00:00')
        assert.equal(bookingLabel(b, 'Optaget'), 'Lægebesøg')
        assert.equal(bookingDetails(b), 'Lægebesøg · Mette · Louise')
    })
    test('only "booked" and nothing on hover when not', () => {
        const hidden = booking('2026-12-03 10:00:00', '2026-12-03 12:00:00', { is_visible: false, title: null, employee: null, citizen: null })
        assert.equal(bookingLabel(hidden, 'Optaget'), 'Optaget')
        assert.equal(bookingDetails(hidden), '')
    })
})

describe('the phone list', () => {
    test('per unit, only the days with bookings; a unit without is free', () => {
        const rows = [
            { unit: { uuid: 'u1', name: 'Bil 1', color: '#DC2626' }, bookings: [booking('2026-12-03 10:00:00', '2026-12-03 12:00:00')] },
            { unit: { uuid: 'u2', name: 'Bil 2', color: null }, bookings: [] },
        ]
        const list = phoneList(rows, periodFor('week', '2026-12-03').days)
        assert.deepEqual(list[0].days.map((d) => d.date), ['2026-12-03'])
        assert.deepEqual(list[1].days, [])
    })
})

describe('the free window and a new event', () => {
    test('needs a date and an end after the start', () => {
        assert.deepEqual(freeWindow('2026-12-03', '10:00', '12:00'), { only_free_from: '2026-12-03 10:00', only_free_to: '2026-12-03 12:00' })
        assert.equal(freeWindow('2026-12-03', '12:00', '10:00'), null)
        assert.equal(freeWindow('', '10:00', '12:00'), null)
    })
    test('a click starts the event at the hour clicked, or 09:00', () => {
        assert.equal(newEventStart('2026-12-03', 14), '2026-12-03 14:00')
        assert.equal(newEventStart('2026-12-03'), '2026-12-03 09:00')
    })
})

const read = (path) => readFileSync(new URL('../../' + path, import.meta.url), 'utf8')

describe('the wiring', () => {
    test('a "Units" tab for everyone with the calendar; booking tabs still need the booking app', () => {
        const tabs = read('components/modules/user/calendar/tabs.vue')
        assert.match(tabs, /name: 'calendar\.tabs\.units'/)
        assert.match(tabs, /href: `\/calendar\/units`/)
        assert.match(tabs, /if \(!hasBookingApp\) \{\s*state\.tabs = state\.tabs\.filter/)
        assert.match(read('pages/calendar/index.vue'), /<ModulesUserCalendarTabs \/>/)
    })

    test('the calendar filter sends the chosen units, remembered on this device', () => {
        const page = read('pages/calendar/index.vue')
        const store = read('store/calendar.js')
        assert.match(store, /unitUuids: \[\]/)
        assert.match(store, /persist: true/)
        assert.match(page, /params\.unit_uuids = JSON\.stringify\(calendarStore\.getUnitUuids\)/)
        assert.match(page, /calendarStore\.setUnitUuids\(filter\.units \?\? \[\]\)/)
        assert.match(read('components/modules/user/citizen/calendar/modal-filter.vue'), /v-model="state\.formFilter\.units"/)
    })

    test('a free spot opens a new event with the unit and time filled in', () => {
        const page = read('pages/calendar/units.vue')
        const modal = read('components/modules/user/my-calendar/myself/modal-new.vue')
        assert.match(page, /:presetStart="state\.newEvent\.start" :presetUnitUuid="state\.newEvent\.unitUuid"/)
        assert.match(modal, /state\.formSchedule\.unit_uuid = props\.presetUnitUuid \|\| ''/)
        assert.match(read('components/modules/user/my-calendar/myself/form.vue'), /watch\(\(\) => props\.selectedSchedule\?\.unit_uuid/)
    })

    test('a booking the viewer may not see opens nothing', () => {
        assert.match(read('pages/calendar/units.vue'), /if \(!booking\.is_visible \|\| !booking\.calendar_uuid\) return/)
    })

    for (const code of ['dk', 'en', 'no', 'sv']) {
        test(`texts in ${code}`, () => {
            const j = JSON.parse(read(`lang/${code}.json`))
            for (const key of ['title', 'onlyFree', 'booked', 'free', 'noUnits', 'noneFree', 'newEventHere']) {
                assert.ok(j.units.overview[key], `${code} units.overview.${key}`)
            }
            assert.ok(j.calendar.tabs.units && j.calendar.filter.units && j.units.form.color, code)
        })
    }

    test('"Optaget" in Danish', () => {
        assert.equal(JSON.parse(read('lang/dk.json')).units.overview.booked, 'Optaget')
    })
})
