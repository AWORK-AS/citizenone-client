/**
 * Roadmap #303: week numbers follow the ISO / Danish standard (Monday first,
 * week 1 holds the year's first Thursday).
 *
 *   node --test tests/unit/isoWeek.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import moment from 'moment'
import { isoWeekOf } from '../../composables/isoWeek.ts'

describe('isoWeekOf', () => {
    test('around new year 2026/2027: week 53 runs from 28 Dec to 3 Jan, week 1 starts 4 Jan', () => {
        assert.equal(isoWeekOf('2026-12-28'), 53)
        assert.equal(isoWeekOf('2027-01-01'), 53) // a Friday, still week 53 of 2026
        assert.equal(isoWeekOf('2027-01-03'), 53)
        assert.equal(isoWeekOf('2027-01-04'), 1)
    })

    test('an ordinary day', () => {
        assert.equal(isoWeekOf('2026-11-19'), 47)
    })

    test('1 January 2026 is a Thursday, so it is week 1', () => {
        assert.equal(isoWeekOf('2026-01-01'), 1)
        assert.equal(isoWeekOf('2025-12-29'), 1) // the Monday before belongs to it
    })

    test('the week changes on Monday, not Sunday', () => {
        assert.equal(isoWeekOf('2026-11-22'), 47) // Sunday
        assert.equal(isoWeekOf('2026-11-23'), 48) // Monday
    })

    test('a moment or a Date gives the same answer as the string', () => {
        assert.equal(isoWeekOf(moment('2026-11-19')), 47)
        assert.equal(isoWeekOf(new Date(2026, 10, 19)), 47)
    })
})

const read = (path) => readFileSync(new URL('../../' + path, import.meta.url), 'utf8')

describe('week numbers are shown in all six calendar views', () => {
    const FOLDERS = ['my-calendar', 'citizen/calendar']
    const KINDS = ['default-view', 'week-view', 'month-view']
    const viewPath = (folder, kind) => 'components/modules/user/' + folder + '/' + kind + '.vue'

    for (const folder of FOLDERS) {
        for (const kind of KINDS) {
            test(viewPath(folder, kind), () => {
                assert.match(read(viewPath(folder, kind)), /calendar\.week(Number|Short)'/)
            })
        }
    }

    test('both day views: header badge and a week number in front of every row of the mini calendar', () => {
        for (const folder of FOLDERS) {
            const view = read(viewPath(folder, 'default-view'))
            assert.match(view, /data-testid="week-number-badge"/, folder)
            assert.match(view, /v-if="dayIdx % 7 === 0"/, folder)
            assert.match(view, /grid-cols-\[1\.75rem_repeat\(7,minmax\(0,1fr\)\)\]/, folder)
            assert.match(view, /isoWeekOf\(day\.date\)/, folder)
        }
    })

    test('both month views mark each Monday', () => {
        for (const folder of FOLDERS) {
            const view = read(viewPath(folder, 'month-view'))
            assert.match(view, /v-if="index % 7 === 0"[^>]*>[\s\S]*?isoWeekOf\(day\.date\)/, folder)
        }
    })

    test('the duplicated helper is gone: every view uses the shared one', () => {
        assert.doesNotMatch(read(viewPath('my-calendar', 'month-view')), /function isoWeek\(/)
        assert.match(read(viewPath('my-calendar', 'week-view')), /isoWeekOf\(state\.selectedDate\)/)
        assert.match(read(viewPath('citizen/calendar', 'week-view')), /isoWeekOf\(currentDate\.value\)/)
    })
})
