/**
 * The superadmin menu's KOMMUNIKATION group: News (release notes, roadmap, polls) and
 * Campaigns (sales campaigns, coupons, shares) as one line each, with the pages under
 * them as tabs.
 *
 * What this suite pins down:
 * - every page keeps its address and its own permission, so bookmarks still work and
 *   the permission middleware still asks for the right thing;
 * - PLATFORM no longer lists the pages that moved;
 * - a tab's own subpages (new, edit) light up the tab and its hub;
 * - the layout draws the group in both the mobile and the desktop menu, and the tabs.
 *
 *   node --test tests/unit/superadminNavGroups.test.mjs
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { superadminNav, superadminNavItemForPath, isNavItemActive } from '../../composables/useSuperadminNav.ts'

const root = path.resolve(import.meta.dirname, '../..')
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')

const hub = (name) => superadminNav.kommunikation.find((item) => item.name === name)

test('News and Campaigns hold the six pages that sat under PLATFORM', () => {
    assert.deepEqual(hub('News').tabs.map((t) => t.href), ['/superadmin/announcements', '/superadmin/release-notes', '/superadmin/roadmap', '/superadmin/polls'])
    assert.deepEqual(hub('Campaigns').tabs.map((t) => t.href), ['/superadmin/sales-campaign', '/superadmin/coupons', '/superadmin/platform-shares'])

    const platform = superadminNav.platform.map((item) => item.href)
    for (const moved of ['/superadmin/release-notes', '/superadmin/roadmap', '/superadmin/polls', '/superadmin/sales-campaign', '/superadmin/coupons', '/superadmin/platform-shares']) {
        assert.ok(!platform.includes(moved), `${moved} is still under PLATFORM`)
    }
    assert.equal(superadminNav.platform.length, 4)
})

test('a moved page keeps the permission it had', () => {
    const expected = {
        '/superadmin/announcements': 'view_content',
        '/superadmin/release-notes': 'view_content',
        '/superadmin/roadmap': 'view_content',
        '/superadmin/polls/new': 'view_marketing',
        '/superadmin/sales-campaign/edit/abc': 'view_marketing',
        '/superadmin/coupons': 'view_marketing',
        '/superadmin/platform-shares': 'view_marketing',
        '/superadmin/dashboard/company-storage': 'view_dashboard',
        '/superadmin/apps': 'view_apps',
    }
    for (const [p, permission] of Object.entries(expected)) {
        assert.equal(superadminNavItemForPath(p)?.permission, permission, p)
    }
})

test('a hub has no permission of its own: the middleware never resolves a path to it', () => {
    for (const item of superadminNav.kommunikation) {
        assert.equal(item.permission, null)
        assert.notEqual(superadminNavItemForPath(item.href)?.name, item.name)
    }
})

test('a tab subpage lights up the tab and its hub, and not the other hub', () => {
    const coupons = hub('Campaigns').tabs.find((t) => t.name === 'Coupons')
    assert.ok(isNavItemActive(coupons, 'superadmin-coupons-couponUuid-edit', '/superadmin/coupons/x/edit'))
    assert.ok(isNavItemActive(hub('Campaigns'), 'superadmin-coupons-couponUuid-edit', '/superadmin/coupons/x/edit'))
    assert.ok(!isNavItemActive(hub('News'), 'superadmin-coupons-couponUuid-edit', '/superadmin/coupons/x/edit'))
})

test('the layout draws the group in both menus and the tabs above the page', () => {
    const layout = read('layouts/superadmin.vue')
    assert.equal(layout.match(/v-for="item in groupedNav\.kommunikation"/g)?.length, 2)
    assert.match(layout, /v-for="tab in currentHub\.tabs"/)
    assert.match(layout, /isNavItemActive\(item, route\.name as string, route\.path\)/)
})

test('the new labels exist in every language', () => {
    for (const lang of ['dk', 'en', 'no', 'sv']) {
        const sidebar = JSON.parse(read(`lang/${lang}.json`)).superadmin.sidebar
        assert.ok(sidebar.groups.communication, `${lang}: groups.communication`)
        assert.ok(sidebar.news, `${lang}: news`)
        assert.ok(sidebar.campaigns, `${lang}: campaigns`)
    }
})
