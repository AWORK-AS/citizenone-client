/**
 * Unit tests for composables/useCodyPageContext.ts - which page Cody is told the
 * user has open.
 *
 * What this pins down: only listed pages produce a key, the most specific route
 * wins, a citizen's uuid travels only from that citizen's own pages, and a
 * child's pages send nothing at all - the uuid in that route belongs to the
 * parent, so telling Cody "this citizen" there would point at the wrong person.
 * The keys must also match the backend's App\Gpt\PageContext::PAGES, which
 * rejects anything else with a 422.
 *
 * No server, no browser, no build step: Node 22+ strips the composable's type
 * annotations at import time. Run with:
 *
 *   node --test tests/unit/codyPageContext.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolveCodyPage } from '../../composables/useCodyPageContext.ts'

const params = { uuid: 'citizen-uuid' }

describe('resolveCodyPage - route name to page key', () => {
    test('a citizen sub-page gets its own key and the citizen', () => {
        assert.deepEqual(resolveCodyPage('citizens-uuid-journals', params), { key: 'citizen_journals', citizenUuid: 'citizen-uuid' })
        assert.deepEqual(resolveCodyPage('citizens-uuid-medicine-journals', params), { key: 'citizen_medicine', citizenUuid: 'citizen-uuid' })
        assert.deepEqual(resolveCodyPage('citizens-uuid-plans-and-goals-active', params), { key: 'citizen_plans_goals', citizenUuid: 'citizen-uuid' })
    })

    test('the most specific prefix wins over the citizen profile', () => {
        // citizens-uuid would also match; the journals entry has to come first.
        assert.equal(resolveCodyPage('citizens-uuid-journals', params).key, 'citizen_journals')
        assert.equal(resolveCodyPage('citizens-uuid-view-edit', params).key, 'citizen_profile')
        assert.equal(resolveCodyPage('citizens-uuid', params).key, 'citizen_profile')
    })

    test("a child's pages send nothing", () => {
        assert.equal(resolveCodyPage('citizens-uuid-children', params), null)
        assert.equal(resolveCodyPage('citizens-uuid-children-child_uuid-journals', { uuid: 'parent', child_uuid: 'child' }), null)
    })

    test('the citizen list carries no citizen even with a uuid param', () => {
        assert.deepEqual(resolveCodyPage('citizens', params), { key: 'citizen_list', citizenUuid: null })
    })

    test('pages that are not about a citizen never send a uuid', () => {
        for (const name of ['my-day', 'schedules', 'employees-employee_uuid-duty-schedule', 'mail-inbox', 'settings-ai-usage']) {
            assert.equal(resolveCodyPage(name, params).citizenUuid, null, name)
        }
    })

    test('prefixes match whole route segments only', () => {
        // "mail" must not catch a route that merely starts with the letters.
        assert.equal(resolveCodyPage('mailbox-something', {}), null)
        assert.equal(resolveCodyPage('mail-inbox', {}).key, 'mail')
        assert.equal(resolveCodyPage('mail', {}).key, 'mail')
    })

    test('unlisted pages send nothing', () => {
        for (const name of ['', 'index', 'login', 'apps-slug', 'patient-overview', 'superadmin-companies']) {
            assert.equal(resolveCodyPage(name, params), null, name)
        }
    })

    test('a non-string uuid param is not sent', () => {
        assert.equal(resolveCodyPage('citizens-uuid-journals', { uuid: ['a', 'b'] }).citizenUuid, null)
        assert.equal(resolveCodyPage('citizens-uuid-journals', {}).citizenUuid, null)
    })
})

describe('labels - every key the composable can send has a label in every locale', () => {
    const source = readFileSync(new URL('../../composables/useCodyPageContext.ts', import.meta.url), 'utf8')
    const keys = [...new Set([...source.matchAll(/\['[a-z-_]+', '([a-z_]+)'\]/g)].map((m) => m[1]))]

    test('the list is not empty', () => {
        assert.ok(keys.length >= 20, `found ${keys.length} keys`)
    })

    for (const locale of ['dk', 'en', 'sv', 'no']) {
        test(`${locale} has a label for every key`, () => {
            const lang = JSON.parse(readFileSync(new URL(`../../lang/${locale}.json`, import.meta.url), 'utf8'))
            const pages = lang.assistants.pageContext.pages
            assert.ok(lang.assistants.pageContext.seeing.includes('{page}'))
            for (const key of keys) assert.ok(pages[key], `${locale} missing ${key}`)
        })
    }
})
