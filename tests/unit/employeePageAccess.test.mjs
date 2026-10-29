/**
 * "Page access" on the employee form. A user's pages are their roles' pages
 * (effective_pages); the per-employee list the form used to save was written to
 * a table nothing reads, so a change there looked unsaved after "Update". The
 * field now shows the role's pages and points to Settings -> Roles.
 *
 *   node --test tests/unit/employeePageAccess.test.mjs
 */
import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '../..')
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')
const langs = Object.fromEntries(['dk', 'en', 'no', 'sv'].map((l) => [l, JSON.parse(read(`lang/${l}.json`))]))

describe('Page access on the employee form', () => {
    test('is shown, not edited, and links to the roles', () => {
        const form = read('components/modules/user/employee/form.vue')

        assert.doesNotMatch(form, /v-model="state\.formEmployee\.pages"/)
        assert.match(form, /employees\.form\.pageAccessFromRole/)
        assert.match(form, /to="\/settings\/roles"/)
    })

    test('no save path sends per-employee pages', () => {
        for (const file of [
            'pages/employees/new.vue',
            'pages/employees/[employee_uuid]/edit.vue',
            'pages/employees/[employee_uuid]/view-edit.vue',
        ]) {
            assert.doesNotMatch(read(file), /params\.append\('page_uuid'/, file)
        }
    })

    test('the hint is translated in every language', () => {
        for (const [lang, json] of Object.entries(langs)) {
            assert.ok(json.employees.form.pageAccessFromRole, `${lang} pageAccessFromRole`)
            assert.ok(json.employees.form.pageAccessEditRoles, `${lang} pageAccessEditRoles`)
        }
    })
})
