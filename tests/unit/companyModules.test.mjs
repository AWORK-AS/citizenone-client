/**
 * Unit tests for composables/companyModules.ts - the grouping on the module
 * card in Settings -> Company, and what an "everything off" save leaves behind.
 *
 *   node --test tests/unit/companyModules.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { COMPANY_MODULES, NO_MODULES, groupModules, modulePagesAfterSave } from '../../composables/companyModules.ts'
import { companyHasModule } from '../../composables/pageAccess.ts'

const pages = (...names) => names.map((name) => ({ uuid: name, name }))

describe('groupModules', () => {
    test('puts each module in its group, in card order', () => {
        const groups = groupModules(pages('Billing', 'Messages', 'Journals', 'Duty Schedule', 'Calendar'))

        assert.deepEqual(groups.map((g) => g.key), ['clients', 'daily', 'staff', 'economy'])
        assert.deepEqual(groups[1].pages.map((p) => p.name), ['Calendar', 'Messages'])
    })

    test('a page the card does not know yet still shows, under Other', () => {
        const groups = groupModules(pages('Journals', 'Something new'))

        assert.deepEqual(groups.at(-1), { key: 'other', pages: [{ uuid: 'Something new', name: 'Something new' }] })
    })
})

describe('switching every module off', () => {
    test('is not read as "every module" afterwards', () => {
        // The bug: an empty list was saved, and empty means "all on".
        const modulePages = modulePagesAfterSave([])

        assert.deepEqual(modulePages, [NO_MODULES])
        assert.equal(companyHasModule(modulePages, 'Messages'), false)
        assert.equal(companyHasModule(modulePages, 'Calendar'), false)
    })

    test('a normal save keeps the names', () => {
        assert.deepEqual(modulePagesAfterSave(['Journals']), ['Journals'])
    })
})

test('every module has a help line in all four languages', () => {
    const root = path.resolve(import.meta.dirname, '../..')
    const missing = []

    for (const lang of ['dk', 'en', 'no', 'sv']) {
        const json = JSON.parse(fs.readFileSync(path.join(root, 'lang', `${lang}.json`), 'utf8'))

        for (const [name, { group, help }] of Object.entries(COMPANY_MODULES)) {
            if (!json.companyModules?.[name]) missing.push(`${lang}: companyModules.${name}`)
            if (!json.companyModulesCard?.help?.[help]) missing.push(`${lang}: companyModulesCard.help.${help}`)
            if (!json.companyModulesCard?.groups?.[group]) missing.push(`${lang}: companyModulesCard.groups.${group}`)
        }
    }

    assert.deepEqual(missing, [])
})
