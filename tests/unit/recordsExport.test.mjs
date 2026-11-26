/**
 * Roadmap #396: the export window for use of force and incidents.
 *
 *   node --test tests/unit/recordsExport.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { defaultPeriod, periodProblem, exportParams, filenameFrom, MAX_YEARS } from '../../composables/recordsExport.ts'

describe('the period', () => {
    test('starts from the statistics page range when there is one', () => {
        assert.deepEqual(defaultPeriod({ start_date: '2026-03-01', end_date: '2026-03-31' }, '2026-11-24'), { from: '2026-03-01', to: '2026-03-31' })
    })
    test('otherwise the last twelve months', () => {
        assert.deepEqual(defaultPeriod(null, '2026-11-24'), { from: '2025-11-25', to: '2026-11-24' })
    })
    test(`must be in order and at most ${MAX_YEARS} years, like the server`, () => {
        assert.equal(periodProblem('2026-01-01', '2026-12-31'), '')
        assert.equal(periodProblem('2026-12-31', '2026-01-01'), 'order')
        assert.equal(periodProblem('2021-01-01', '2026-01-01'), '')
        assert.equal(periodProblem('2021-01-01', '2026-01-02'), 'tooLong')
        assert.equal(periodProblem('', '2026-01-01'), 'missing')
    })
})

describe('what is sent', () => {
    test("a citizen's export sends the citizen and never a department", () => {
        assert.deepEqual(
            exportParams({ kind: 'useOfForce', format: 'xlsx', from: '2026-01-01', to: '2026-12-31', citizenUuid: 'c1', departmentUuid: 'd1', includeDrafts: true }),
            { format: 'xlsx', from: '2026-01-01', to: '2026-12-31', citizen_uuid: 'c1' },
        )
    })
    test('the company-wide export sends the department, and drafts only for incidents', () => {
        assert.deepEqual(
            exportParams({ kind: 'incidents', format: 'csv', from: '2026-01-01', to: '2026-12-31', departmentUuid: 'd1', includeDrafts: true }),
            { format: 'csv', from: '2026-01-01', to: '2026-12-31', department_uuid: 'd1', include_drafts: 1 },
        )
        assert.equal(exportParams({ kind: 'incidents', format: 'csv', from: 'a', to: 'b' }).include_drafts, undefined)
        assert.equal(exportParams({ kind: 'incidents', format: 'csv', from: 'a', to: 'b', departmentUuid: '' }).department_uuid, undefined)
    })
})

describe('the file name', () => {
    test("from the server's header, else the fallback", () => {
        assert.equal(filenameFrom('attachment; filename=magtanvendelser-2026-01-01-2026-12-31.xlsx', 'x'), 'magtanvendelser-2026-01-01-2026-12-31.xlsx')
        assert.equal(filenameFrom('attachment; filename="a b.csv"', 'x'), 'a b.csv')
        assert.equal(filenameFrom(null, 'fallback.xlsx'), 'fallback.xlsx')
    })
})

const read = (path) => readFileSync(new URL('../../' + path, import.meta.url), 'utf8')

describe('the wiring', () => {
    test('an Export button in both citizen panels, for that citizen', () => {
        for (const [file, kind] of [['use-of-force', 'useOfForce'], ['incidents', 'incidents']]) {
            const src = read(`components/modules/user/citizen/${file}/slide-over.vue`)
            assert.match(src, /\$t\('recordsExport\.export'\)/)
            assert.match(src, new RegExp(`<ModulesUserCitizenExportModal kind="${kind}" :citizenUuid=`))
        }
    })
    test('an Export button on both statistics cards, for every citizen', () => {
        for (const [file, kind] of [['use-of-force-statistics', 'useOfForce'], ['incident-reports-statistics', 'incidents']]) {
            const src = read(`components/modules/user/daily-overview/${file}.vue`)
            assert.match(src, new RegExp(`<ModulesUserCitizenExportModal kind="${kind}" :dateRange="props.dateRange"`))
            assert.doesNotMatch(src, /citizenUuid/)
        }
    })
    test('the window downloads through the export endpoints', () => {
        assert.match(read('components/api/user/UseOfForceService.ts'), /requestBlob\(`\/user\/citizen-use-of-force\/export`/)
        assert.match(read('components/api/user/IncidentService.ts'), /requestBlob\(`\/user\/citizen-incidents\/export`/)
        const modal = read('components/modules/user/citizen/export-modal.vue')
        assert.match(modal, /v-if="!props\.citizenUuid"[^>]*data-testid="records-export-department"/)
        assert.match(modal, /v-if="props\.kind === 'incidents'"/)
    })

    for (const code of ['dk', 'en', 'no', 'sv']) {
        test(`texts in ${code}`, () => {
            const t = JSON.parse(read(`lang/${code}.json`)).recordsExport
            for (const key of ['export', 'titleUseOfForce', 'titleIncidents', 'from', 'to', 'department', 'allDepartments', 'format', 'includeDrafts', 'download', 'downloading', 'personalData', 'error', 'toBeforeFrom', 'tooLong']) {
                assert.ok(t?.[key], `${code} recordsExport.${key}`)
            }
            assert.match(t.tooLong, /\{years\}/)
        })
    }

    test('"Eksportér" and "Medtag kladder" in Danish', () => {
        const t = JSON.parse(read('lang/dk.json')).recordsExport
        assert.equal(t.export, 'Eksportér')
        assert.equal(t.includeDrafts, 'Medtag kladder')
    })
})
