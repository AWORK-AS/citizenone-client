/**
 * Customer feedback on the duty schedule: "man skal scrolle i vagtplanen".
 *
 * Measured at 1440x782 with seven employees: the grid started 436px down, an
 * empty row was 120px, a shift card 107px plus 16px, and one employee with
 * twelve shifts on a day was a 1543px row. The page was 2824px - 3.6 screens.
 * After: grid at 334px, rows 76px, cards 40px, that row 125px, page 1032px.
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (p) => readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8')
const week = read('components/modules/user/duty-schedule/week-view.vue')
const page = read('pages/schedules/index.vue')

describe('the week grid stays compact', () => {
    test('a crowded cell shows a capped prefix and a "+N"', () => {
        assert.match(week, /const MAX_VISIBLE_SHIFTS = 2/)
        assert.match(week, /v-for="\(shift, shiftIndex\) in visibleShifts\(employee, weekIndex as string, week\?\.shifts\)"/)
        // A prefix, so shiftIndex still points at the same shift for edit and quick edit.
        assert.match(week, /return sorted\.slice\(0, Math\.max\(MAX_VISIBLE_SHIFTS - 1, multiDay\)\)/)
        assert.match(week, /\$t\('dutySchedules\.moreShifts'/)
    })

    test('a shift card puts its times on one line', () => {
        assert.doesNotMatch(week, /flex flex-col 2xl:flex-row 2xl:items-center 2xl:justify-between text-white/)
        assert.doesNotMatch(week, /'rounded-xl relative mb-4 shadow-sm/)
    })

    test('the name column does not give "show more" a line of its own', () => {
        assert.doesNotMatch(week, /<div class="px-2 pb-2 sm:px-3 sm:pb-3">/)
    })

    test('the toolbar shows labels only where they fit', () => {
        assert.doesNotMatch(page, /<span class="hidden xl:inline">/)
        assert.doesNotMatch(page, /<span class="hidden md:inline">\{\{ \$t\('dutySchedules\.showTheDistributionOfShiftTypes'\)/)
    })

    test('"moreShifts" exists in all four languages', () => {
        for (const lang of ['dk', 'en', 'no', 'sv']) {
            const json = JSON.parse(read(`lang/${lang}.json`))
            assert.match(json.dutySchedules.moreShifts, /\{count\}/, lang)
        }
    })
})
