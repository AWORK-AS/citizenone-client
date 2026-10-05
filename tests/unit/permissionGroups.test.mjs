/**
 * Unit tests for composables/permissionGroups.ts - the area grouping the role
 * form and Settings → Roles → Permission overview share, and the matrix and CSV
 * built from it.
 *
 * What this suite pins down:
 * - the grouping the form always had, now that it lives outside the form;
 * - Admin-level roles shown with full access, since the backend lets them pass
 *   every effective-permission check whatever is stored on them;
 * - the superadmin panel's permissions kept out of a tenant's overview unless a
 *   company role really holds one;
 * - a CSV with one column per role and the page access block after it.
 *
 * No server, no browser, no build step: Node 22+ strips the composable's type
 * annotations at import time. Run with:
 *
 *   node --test tests/unit/permissionGroups.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
    PERMISSION_GROUP_ORDER,
    permissionGroup,
    permissionGroupLabel,
    buildPermissionMatrix,
    permissionMatrixCsv,
} from '../../composables/permissionGroups.ts'

const perm = (uuid, name, extra = {}) => ({ uuid, name, en_name: name.replace(/_/g, ' '), ...extra })

const permissions = [
    perm('p1', 'create_citizen'),
    perm('p2', 'create_citizen_journal'),
    perm('p3', 'delete_calendar'),
    perm('p4', 'something_new'),
    perm('p5', 'access_superadmin'),
    perm('p6', 'impersonate_users'),
]
const pages = [
    { uuid: 'g1', name: 'Overview' },
    { uuid: 'g2', name: 'Citizens' },
    { uuid: 'g3', name: 'Calendar' },
]
const roles = [
    { id: 3, name: 'Carer', level: 20, permissions: [{ uuid: 'p2' }], pages: [{ uuid: 'g2' }] },
    { id: 1, name: 'Admin', level: 80, permissions: [{ uuid: 'p1' }], pages: [{ uuid: 'g1' }, { uuid: 'g2' }] },
    { id: 2, name: 'Lead', level: 50, permissions: [{ uuid: 'p1' }, { uuid: 'p3' }, { uuid: 'p6' }], pages: [] },
]

const build = (extra = {}) => buildPermissionMatrix({
    roles,
    permissions,
    pages,
    locale: 'en',
    citizenWord: 'resident',
    hiddenPermissionNames: new Set(['access_superadmin', 'impersonate_users']),
    ...extra,
})

describe('permissionGroup', () => {
    test('maps names to the areas the role form has always used', () => {
        assert.equal(permissionGroup('create_citizen_journal'), 'journal')
        assert.equal(permissionGroup('view_citizen_document'), 'journal')
        assert.equal(permissionGroup('update_citizen_medicine'), 'health')
        assert.equal(permissionGroup('create_citizen_plan'), 'plan')
        assert.equal(permissionGroup('delete_calendar'), 'calendar')
        assert.equal(permissionGroup('read_schedule'), 'calendar')
        assert.equal(permissionGroup('view_citizen_economy'), 'economy')
        assert.equal(permissionGroup('create_citizen_contact'), 'contact')
        assert.equal(permissionGroup('view_referral'), 'reports')
        assert.equal(permissionGroup('create_citizen'), 'citizen')
        assert.equal(permissionGroup('something_new'), 'other')
    })

    test('keeps the nine areas in their order', () => {
        assert.deepEqual(PERMISSION_GROUP_ORDER, ['citizen', 'journal', 'health', 'plan', 'calendar', 'economy', 'contact', 'reports', 'other'])
    })
})

describe('permissionGroupLabel', () => {
    test('uses the company word for citizen, capitalised', () => {
        assert.equal(permissionGroupLabel('citizen', 'dk', 'beboer'), 'Beboer')
    })

    test('follows the locale and falls back to English', () => {
        assert.equal(permissionGroupLabel('health', 'sv', 'x'), 'Hälsa & medicin')
        assert.equal(permissionGroupLabel('health', 'de', 'x'), 'Health & medicine')
        assert.equal(permissionGroupLabel('unknown', 'en', 'x'), 'unknown')
    })
})

describe('buildPermissionMatrix', () => {
    test('orders roles by level, highest first', () => {
        assert.deepEqual(build().roles.map((r) => r.name), ['Admin', 'Lead', 'Carer'])
    })

    test('ticks every permission for an Admin-level role, and counts it', () => {
        const matrix = build()
        for (const group of matrix.groups) {
            for (const row of group.rows) assert.equal(row.granted[0], true, row.label)
            assert.equal(group.counts[0], group.rows.length)
        }
    })

    test('shows stored permissions for the other roles', () => {
        const rows = Object.fromEntries(build().groups.flatMap((g) => g.rows).map((r) => [r.uuid, r.granted]))
        assert.deepEqual(rows.p1, [true, true, false])
        assert.deepEqual(rows.p2, [true, false, true])
        assert.deepEqual(rows.p3, [true, true, false])
    })

    test('groups rows by area, in area order, with no empty areas', () => {
        const matrix = build()
        assert.deepEqual(matrix.groups.map((g) => g.key), ['citizen', 'journal', 'calendar', 'other'])
        assert.equal(matrix.groups[0].label, 'Resident')
        assert.deepEqual(matrix.groups[1].counts, [1, 0, 1])
    })

    test('hides panel permissions unless a role stores one', () => {
        const uuids = build().groups.flatMap((g) => g.rows).map((r) => r.uuid)
        assert.ok(!uuids.includes('p5'), 'access_superadmin is held by no role')
        assert.ok(uuids.includes('p6'), 'impersonate_users is stored on Lead')
    })

    test('does not treat full access as holding a hidden permission', () => {
        const matrix = build({ roles: [{ id: 1, name: 'Admin', level: 80, permissions: [], pages: [] }] })
        const uuids = matrix.groups.flatMap((g) => g.rows).map((r) => r.uuid)
        assert.ok(!uuids.includes('p5') && !uuids.includes('p6'))
    })

    test('labels rows in the locale, falling back to the name', () => {
        const matrix = build({ locale: 'dk', permissions: [perm('p1', 'create_citizen', { dk_name: 'Opret borger' }), perm('p4', 'something_new')] })
        const labels = matrix.groups.flatMap((g) => g.rows).map((r) => r.label)
        assert.deepEqual(labels, ['Opret borger', 'something new'])
    })

    test('page access is what is stored, even for an Admin-level role', () => {
        const matrix = build()
        assert.deepEqual(matrix.pages.rows.map((r) => r.label), ['Calendar', 'Citizens', 'Overview'])
        const byLabel = Object.fromEntries(matrix.pages.rows.map((r) => [r.label, r.granted]))
        assert.deepEqual(byLabel.Calendar, [false, false, false])
        assert.deepEqual(byLabel.Citizens, [true, false, true])
        assert.deepEqual(matrix.pages.counts, [2, 0, 1])
    })

    test('search filters permission and page rows and recounts', () => {
        const matrix = build({ search: 'JOURNAL' })
        assert.deepEqual(matrix.groups.map((g) => g.key), ['journal'])
        assert.deepEqual(matrix.groups[0].counts, [1, 0, 1])
        assert.equal(matrix.pages.rows.length, 0)
        assert.deepEqual(build({ search: 'cal' }).pages.rows.map((r) => r.label), ['Calendar'])
    })

    test('copes with empty input', () => {
        const matrix = buildPermissionMatrix({ roles: [], permissions: [], pages: [], locale: 'en', citizenWord: 'citizen' })
        assert.deepEqual(matrix, { roles: [], groups: [], pages: { rows: [], counts: [] } })
    })
})

describe('permissionMatrixCsv', () => {
    const labels = { area: 'Area', permission: 'Permission', page: 'Page', pageAccess: 'Page access' }

    test('one column per role, x for granted, then the page block', () => {
        const csv = permissionMatrixCsv(build(), ['Admin', 'Lead', 'Carer'], labels)
        const lines = csv.split('\r\n')
        assert.equal(lines[0], '"Area";"Permission";"Admin";"Lead";"Carer"')
        assert.equal(lines[1], '"Resident";"create citizen";"x";"x";""')
        const blank = lines.indexOf('')
        assert.ok(blank > 0, 'a blank line separates the two blocks')
        assert.equal(lines[blank + 1], '"Area";"Page";"Admin";"Lead";"Carer"')
        assert.equal(lines[blank + 2], '"Page access";"Calendar";"";"";""')
        assert.equal(lines.length, blank + 2 + 3)
    })

    test('escapes quotes and keeps semicolons inside a cell', () => {
        const matrix = build({ permissions: [perm('p1', 'create_citizen', { en_name: 'Create "VIP"; fast' })], pages: [] })
        const csv = permissionMatrixCsv(matrix, ['A', 'B', 'C'], labels)
        assert.equal(csv.split('\r\n')[1], '"Resident";"Create ""VIP""; fast";"x";"x";""')
    })
})
