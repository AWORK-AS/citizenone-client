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
