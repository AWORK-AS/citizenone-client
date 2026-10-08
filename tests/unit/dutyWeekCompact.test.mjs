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

    test('"All departments" groups rows by department without moving their index', () => {
        // Rows are reordered at fetch time, before expandedRecords and the
        // copy/paste state index into them.
        assert.match(week, /if \(Array\.isArray\(response\.data\)\) response\.data = orderByDepartmentGroup\(response\.data\)\s*\n\s*state\.weeklySchedules = response/)
        assert.match(week, /return !selected\?\.uuid \|\| selected\.uuid === 'all-departments'/)
        assert.match(week, /v-if="isGroupingActive && groupStartsAt\(employeeIndex as number\)"/)
        assert.match(week, /v-if="!isGroupingActive \|\| !isGroupCollapsed\(groupOf\(employee\)\)"/)
    })

    test('a folded group still shows each day\'s shifts and conflicts, and is a real button', () => {
        assert.match(week, /dutySchedules\.groups\.shifts/)
        assert.match(week, /dutySchedules\.groups\.conflicts/)
        assert.match(week, /role="button" tabindex="0"/)
        assert.match(week, /:aria-expanded="!isGroupCollapsed\(groupOf\(employee\)\)"/)
    })

    test('the viewer\'s own departments open by default, and the choice is remembered', () => {
        assert.match(week, /return own\.size > 0 && !own\.has\(name\)/)
        const store = read('store/duty-schedule.js')
        assert.match(store, /persist: true/)
        assert.match(store, /departmentGroupsOpen: \{\}/)
    })

    test('"moreShifts" and the group strings exist in all four languages', () => {
        for (const lang of ['dk', 'en', 'no', 'sv']) {
            const json = JSON.parse(read(`lang/${lang}.json`))
            for (const key of ['expand', 'collapse', 'noDepartment', 'employees', 'shifts', 'conflicts']) {
                assert.ok(json.dutySchedules.groups?.[key], `${lang}: dutySchedules.groups.${key}`)
            }
        }
    })

    test('"moreShifts" exists in all four languages', () => {
        for (const lang of ['dk', 'en', 'no', 'sv']) {
            const json = JSON.parse(read(`lang/${lang}.json`))
            assert.match(json.dutySchedules.moreShifts, /\{count\}/, lang)
        }
    })
})
