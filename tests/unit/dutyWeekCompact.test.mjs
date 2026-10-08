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

describe('month, half year and year cap a day at three shifts', () => {
    // Measured at 1440x782 with seven employees, production -> now:
    // month 8,518 -> 2,418px, half year 26,533 -> 8,819px, year 67,307 -> 19,180px.
    for (const view of ['month-view', 'half-year-view', 'year-view']) {
        const src = read(`components/modules/user/duty-schedule/${view}.vue`)
        test(`${view}: a capped prefix per employee, "+N" for the day`, () => {
            assert.match(src, /const MAX_DAY_SHIFTS = 3/)
            assert.match(src, /\.slice\(0, visibleShiftCount\(/)
            assert.match(src, /\$t\('dutySchedules\.moreShifts', \{ count: hiddenShiftCount\(/)
            assert.match(src, /let budget = MAX_DAY_SHIFTS - 1/)
        })
        test(`${view}: a compact toolbar with tooltips`, () => {
            assert.doesNotMatch(src, /bg-blue-50 ring-1 ring-blue-200 rounded-lg px-3 py-1/)
            assert.match(src, /<Tooltip v-if="hasManageFavoritesAccess"/)
            assert.match(src, /<Tooltip :text="\$t\('entriesPerPage'\)">/)
        })
    }
})

describe('a one-time notice says the schedule changed', () => {
    const notice = read('components/modules/user/duty-schedule/notice-optimized.vue')

    test('shows once per person, then never again', () => {
        assert.match(notice, /c1:duty-optimized-notice:\$\{VERSION\}:\$\{userStore\.getUser\?\.uuid/)
        assert.match(notice, /visible\.value = !localStorage\.getItem\(storageKey\.value\)/)
        assert.match(notice, /localStorage\.setItem\(storageKey\.value/)
    })

    test('is mounted on the duty schedule and offers Milo', () => {
        assert.match(page, /<ModulesUserDutyScheduleNoticeOptimized \/>/)
        assert.match(notice, /useObiyenChat\(\)\.revealAndOpenChat\(\)/)
    })

    test('"show less" has a tooltip in every view', () => {
        for (const view of ['week-view', 'month-view', 'half-year-view', 'year-view']) {
            assert.match(read(`components/modules/user/duty-schedule/${view}.vue`), /:text="\$t\('dutySchedules\.showFewerShifts'\)"/, view)
        }
    })
})

describe('the "?" on calendar, overview, citizens and employees asks Milo', () => {
    for (const page of ['pages/calendar/index.vue', 'pages/overview/index.vue', 'pages/citizens/index.vue', 'pages/employees/index.vue']) {
        test(`${page}: a real button with a general tooltip, no 2025 video`, () => {
            const src = read(page)
            assert.match(src, /<button type="button" :aria-label="\$t\('helpGuide\.askMiloGeneral'\)"[^>]*@click="askMilo\(\)">/)
            assert.doesNotMatch(src, /openGuidedTour|ModulesUserGuidedTourModal/)
            assert.doesNotMatch(src, /askMiloTooltip/) // that one says "the duty schedule"
        })
    }
})

describe('the guided tour has no duty-schedule video', () => {
    // The step showed a recording of the 2025 interface.
    test('calendar leads to employees and back', () => {
        assert.match(read('components/modules/user/guided-tour/modal-calendar.vue'), /emit\('next', 'employees'\)/)
        assert.match(read('components/modules/user/guided-tour/modal-employees.vue'), /emit\('back', 'calendar'\)/)
    })

    test('no tour host still opens the duty-schedule step', () => {
        for (const host of ['layouts/user.vue', 'components/modules/user/support/slide-over.vue']) {
            assert.doesNotMatch(read(host), /ModulesUserGuidedTourModalDutySchedule|isGuidedTourDutyScheduleOpen/, host)
        }
    })
})

describe('help on the duty schedule is Milo', () => {
    // vagtplan-guide.html described the 2025 interface; Milo answers from the
    // help-desk articles instead.
    for (const page of ['pages/schedules/index.vue', 'pages/schedules/draft/index.vue', 'pages/schedules/draft/templates/index.vue', 'pages/schedules/draft/published/index.vue']) {
        test(`${page} asks Milo and no longer frames the old guide`, () => {
            const src = read(page)
            assert.match(src, /useObiyenChat\(\)\.revealAndOpenChat\(\)/)
            assert.match(src, /\$t\('helpGuide\.askMiloTooltip'\)/)
            assert.doesNotMatch(src, /<iframe src="\/vagtplan-guide\.html"/)
        })
    }
})

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

    test('asks the backend for whole groups per page', () => {
        assert.match(week, /params\.group_by_department = true/)
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

    test('a multi-day shift leaves room for a compact card, so the next day does not cover it', () => {
        // 3.625rem was set for 107-133px cards; on production the next day's
        // card overlapped the multi-day one.
        assert.match(week, /return overlapCount \* 4\.5/)
    })

    test('closing a quick edit without a change sends nothing', () => {
        assert.match(week, /if \(value === current\) \{\s*cancelQuickEditTime\(\)\s*return\s*\}/)
    })

    test('the hours line opens the shift, since the times are a quick edit', () => {
        assert.match(week, /class="flex items-center gap-1 px-1\.5 sm:px-2 pb-1 cursor-pointer"\s*@click="\(\(hasUpdatePermission/)
    })

    test('"moreShifts" exists in all four languages', () => {
        for (const lang of ['dk', 'en', 'no', 'sv']) {
            const json = JSON.parse(read(`lang/${lang}.json`))
            assert.match(json.dutySchedules.moreShifts, /\{count\}/, lang)
        }
    })
})
