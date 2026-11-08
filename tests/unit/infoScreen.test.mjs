/**
 * Unit tests for composables/infoScreen.ts: now and next on the day's program,
 * the timeline's span, weather icons, the temperature curve and poll shares.
 *
 *   node --test tests/unit/infoScreen.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
    activityStates, pollShares, timelinePercent, timelineRange, toMinutes, weatherCurve, weatherIcon,
    ACTIVITY_ICONS, activityIcon, isNightTime, isOffline, msUntilNextReload, copyDayProgram,
    upcomingReminder, reminderShowing, initials, moodShares,
} from '../../composables/infoScreen.ts'

const program = [
    { time: '14:00', title: 'Værksted' },
    { time: '09:30', title: 'Morgenmad' },
    { time: null, title: 'Frisør (hele dagen)' },
    { time: '11:00', title: 'Gåtur' },
]

describe('activityStates', () => {
    test('sorts by time and marks past, now and next', () => {
        const states = activityStates(program, toMinutes('11:20'))
        assert.deepEqual(states.map((a) => [a.title, a.state]), [
            ['Morgenmad', 'past'],
            ['Gåtur', 'now'],
            ['Værksted', 'next'],
            ['Frisør (hele dagen)', 'later'],
        ])
        assert.equal(states[2].minutesUntil, 160)
    })

    test('before the first activity only the first is next', () => {
        const states = activityStates(program, toMinutes('07:00'))
        assert.deepEqual(states.map((a) => a.state), ['next', 'later', 'later', 'later'])
    })

    test('the last activity stays now for a while, then is past', () => {
        assert.equal(activityStates(program, toMinutes('15:00'))[2].state, 'now')
        assert.equal(activityStates(program, toMinutes('15:31'))[2].state, 'past')
    })
})

describe('timeline', () => {
    test('spans at least 07-22 and widens for a late program', () => {
        assert.deepEqual(timelineRange(program), { start: 420, end: 1320 })
        assert.deepEqual(timelineRange([{ time: '06:15', title: 'x' }, { time: '22:30', title: 'y' }]), { start: 360, end: 1440 })
    })

    test('positions are clamped to the range', () => {
        const range = { start: 420, end: 1320 }
        assert.equal(timelinePercent(420, range), 0)
        assert.equal(timelinePercent(870, range), 50)
        assert.equal(timelinePercent(100, range), 0)
        assert.equal(timelinePercent(2000, range), 100)
    })
})

describe('weatherIcon', () => {
    test('maps MET Norway symbols, day and night', () => {
        assert.equal(weatherIcon('clearsky_day'), 'ph:sun')
        assert.equal(weatherIcon('clearsky_night'), 'ph:moon-stars')
        assert.equal(weatherIcon('partlycloudy_day'), 'ph:cloud-sun')
        assert.equal(weatherIcon('lightrainshowers_day'), 'ph:cloud-rain')
        assert.equal(weatherIcon('heavysnow'), 'ph:snowflake')
        assert.equal(weatherIcon('rainandthunder'), 'ph:cloud-lightning')
        assert.equal(weatherIcon(null), 'ph:thermometer-simple')
    })
})

describe('weatherCurve', () => {
    test('draws a path through every hour inside the box', () => {
        const hours = [7, 9, 12, 10].map((temperature, i) => ({ time: `${10 + i}:00`, temperature, symbol: null }))
        const curve = weatherCurve(hours, 400, 200)
        assert.equal(curve.points.length, 4)
        assert.equal(curve.min, 7)
        assert.equal(curve.max, 12)
        assert.ok(curve.line.startsWith('M 24.0'))
        assert.ok(curve.area.endsWith('Z'))
        for (const point of curve.points) {
            assert.ok(point.y >= 28 && point.y <= 172)
        }
        // Warmest hour is highest on screen.
        assert.equal(Math.min(...curve.points.map((p) => p.y)), curve.points[2].y)
    })

    test('one hour is not a curve', () => {
        assert.equal(weatherCurve([{ time: '10:00', temperature: 5, symbol: null }], 400, 200).line, '')
    })
})

describe('pollShares', () => {
    test('whole percentages, zeros without votes', () => {
        assert.deepEqual(pollShares([{ title: 'a', votes: 1 }, { title: 'b', votes: 3 }]), [25, 75])
        assert.deepEqual(pollShares([{ title: 'a', votes: 0 }, { title: 'b', votes: 0 }]), [0, 0])
    })
})

describe('edge cases', () => {
    test('two activities at the same time are both now', () => {
        const states = activityStates([{ time: '10:00', title: 'a' }, { time: '10:00', title: 'b' }, { time: '12:00', title: 'c' }], 10 * 60 + 5)
        assert.deepEqual(states.map((s) => s.state), ['now', 'now', 'next'])
    })

    test('a late activity never pushes the timeline past midnight', () => {
        assert.equal(timelineRange([{ time: '23:30', title: 'Nat' }]).end, 24 * 60)
    })

    test('poll shares always add up to 100', () => {
        const shares = pollShares([{ title: 'a', votes: 1 }, { title: 'b', votes: 1 }, { title: 'c', votes: 1 }])
        assert.equal(shares.reduce((a, b) => a + b, 0), 100)
        assert.deepEqual(pollShares([{ title: 'a', votes: 2 }, { title: 'b', votes: 1 }, { title: 'c', votes: 0 }]), [67, 33, 0])
    })
})

describe('isNightTime', () => {
    test('a night across midnight', () => {
        assert.equal(isNightTime(23 * 60, '22:00', '06:00'), true)
        assert.equal(isNightTime(3 * 60, '22:00', '06:00'), true)
        assert.equal(isNightTime(6 * 60, '22:00', '06:00'), false)
        assert.equal(isNightTime(12 * 60, '22:00', '06:00'), false)
    })

    test('a night within one day, and no night when from equals to', () => {
        assert.equal(isNightTime(2 * 60, '01:00', '05:00'), true)
        assert.equal(isNightTime(23 * 60, '01:00', '05:00'), false)
        assert.equal(isNightTime(23 * 60, '22:00', '22:00'), false)
        assert.equal(isNightTime(23 * 60, null, '06:00'), false)
    })
})

describe('isOffline', () => {
    const now = Date.parse('2026-11-18T12:00:00Z')

    test('a paired screen not seen for 15 minutes is offline', () => {
        assert.equal(isOffline({ is_paired: true, last_seen_at: '2026-11-18T11:50:00Z' }, now), false)
        assert.equal(isOffline({ is_paired: true, last_seen_at: '2026-11-18T11:44:00Z' }, now), true)
        assert.equal(isOffline({ is_paired: true, last_seen_at: null }, now), true)
    })

    test('an unpaired screen is never offline', () => {
        assert.equal(isOffline({ is_paired: false, last_seen_at: null }, now), false)
    })
})

describe('msUntilNextReload', () => {
    test('waits for the next 04:00 plus the jitter', () => {
        const at = new Date(2026, 10, 18, 3, 0, 0)
        assert.equal(msUntilNextReload(at, 0), 60 * 60 * 1000)
        assert.equal(msUntilNextReload(at, 5 * 60 * 1000), 65 * 60 * 1000)
    })

    test('after 04:00 it waits for tomorrow', () => {
        const at = new Date(2026, 10, 18, 4, 30, 0)
        assert.equal(msUntilNextReload(at, 0), 23.5 * 60 * 60 * 1000)
    })
})

describe('activityIcon', () => {
    test('every pictogram has an icon, unknown ones none', () => {
        for (const key of Object.keys(ACTIVITY_ICONS)) assert.match(activityIcon(key), /^ph:/)
        assert.equal(activityIcon('rocket'), null)
        assert.equal(activityIcon(null), null)
    })
})

describe('copyDayProgram', () => {
    const week = [
        { weekday: 1, time: '10:00', title: 'Gåtur', icon: 'walk' },
        { weekday: 1, time: '08:00', title: 'Morgenmad' },
        { weekday: 1, time: '12:00', title: '  ' },
        { weekday: 2, time: '09:00', title: 'Bad' },
        { weekday: 6, time: '11:00', title: 'Brunch' },
    ]

    test('copies Monday to the weekdays and replaces what they had', () => {
        const copied = copyDayProgram(week, 1, [1, 2, 3, 4, 5])
        assert.deepEqual(copied.filter((row) => row.weekday === 2).map((row) => row.title), ['Morgenmad', 'Gåtur'])
        assert.equal(copied.filter((row) => row.weekday === 5).length, 2)
        assert.equal(copied.find((row) => row.weekday === 3 && row.title === 'Gåtur').icon, 'walk')
    })

    test('leaves the source day and other days alone, and skips empty rows', () => {
        const copied = copyDayProgram(week, 1, [3])
        assert.equal(copied.filter((row) => row.weekday === 1).length, 3)
        assert.deepEqual(copied.filter((row) => row.weekday === 6).map((row) => row.title), ['Brunch'])
        assert.equal(copied.filter((row) => row.weekday === 3).length, 2)
        assert.equal(copied.filter((row) => row.weekday === 2).length, 1)
    })
})

describe('activityStates over a long gap', () => {
    test('a morning activity is not "now" all afternoon', () => {
        const day = [{ time: '10:00', title: 'Gudstjeneste' }, { time: '16:00', title: 'Kaffe' }]
        assert.deepEqual(activityStates(day, toMinutes('11:00')).map((a) => a.state), ['now', 'next'])
        assert.deepEqual(activityStates(day, toMinutes('15:00')).map((a) => a.state), ['past', 'next'])
    })
})

describe('upcomingReminder', () => {
    const day = [
        { time: '10:00', title: 'Gåtur' },
        { time: '10:05', title: 'Kaffe' },
        { time: null, title: 'Frisør' },
    ]

    test('finds the soonest activity within the window', () => {
        assert.deepEqual(upcomingReminder(day, toMinutes('09:52'), 10), { activity: day[0], minutesLeft: 8 })
        assert.equal(upcomingReminder(day, toMinutes('10:00'), 10).activity.title, 'Gåtur')
        assert.equal(upcomingReminder(day, toMinutes('10:00'), 10).minutesLeft, 0)
        assert.equal(upcomingReminder(day, toMinutes('10:01'), 10).activity.title, 'Kaffe')
    })

    test('is null outside the window, after the start or when off', () => {
        assert.equal(upcomingReminder(day, toMinutes('09:40'), 10), null)
        assert.equal(upcomingReminder(day, toMinutes('10:06'), 10), null)
        assert.equal(upcomingReminder(day, toMinutes('09:55'), 0), null)
        assert.equal(upcomingReminder([], toMinutes('09:55'), 10), null)
    })

    test('shows part of each minute only', () => {
        assert.equal(reminderShowing(0), true)
        assert.equal(reminderShowing(24), true)
        assert.equal(reminderShowing(25), false)
        assert.equal(reminderShowing(59), false)
    })
})

describe('initials', () => {
    test('takes one or two letters', () => {
        assert.equal(initials('mette'), 'M')
        assert.equal(initials('Anne-Marie'), 'AM')
        assert.equal(initials('  Øjvind Bo Lund '), 'ØB')
        assert.equal(initials(''), '')
        assert.equal(initials(null), '')
    })
})

describe('moodShares', () => {
    test('sums to 100 and survives no answers', () => {
        assert.deepEqual(moodShares([1, 1, 1]), [34, 33, 33])
        assert.deepEqual(moodShares([0, 0, 4]), [0, 0, 100])
        assert.deepEqual(moodShares(null), [0, 0, 0])
    })
})
