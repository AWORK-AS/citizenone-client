/**
 * Unit tests for the desktop app's purchase gate (composables/purchaseAccess.ts).
 * The desktop app is sold through the Mac App Store, so it shows no offer and opens
 * no page that sells something (App Review guideline 3.1.1).
 *
 *   node --test tests/unit/desktopPurchase.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { canPurchase, isPurchaseRoute } from '../../composables/purchaseAccess.ts'

const root = path.resolve(import.meta.dirname, '../..')
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')

describe('canPurchase in the desktop app', () => {
    test('an admin in a browser is still shown offers', () => {
        assert.equal(canPurchase({ roles: [{ name: 'Admin' }] }), true)
        assert.equal(canPurchase({ roles: [{ name: 'Admin' }], inDesktopApp: false }), true)
    })

    test('nobody is shown offers in the desktop app', () => {
        assert.equal(canPurchase({ roles: [{ name: 'Admin' }], inDesktopApp: true }), false)
        assert.equal(canPurchase({ canManage: true, hasLicensePermission: true, inDesktopApp: true }), false)
    })
})

describe('isPurchaseRoute', () => {
    test('plans, coupon codes, add-ons, storage and the app store are purchase pages', () => {
        for (const p of [
            '/subscription', '/subscription/', '/subscription/subscribe', '/subscription/pay/abc',
            '/subscription/renew?token=x', '/settings/subscription', '/storage/upgrade',
            '/apps', '/apps/microsoft-sso', '/apps?type=other&generic_name=patient-access',
        ]) {
            assert.equal(isPurchaseRoute(p), true, p)
        }
    })

    test('the suspended page and ordinary pages are not', () => {
        for (const p of [
            '/subscription/suspended', '/overview', '/settings', '/settings/storage',
            '/settings/license-overview', '/storage', '/applications', '/subscriptions-list', '', null, undefined,
        ]) {
            assert.equal(isPurchaseRoute(p), false, String(p))
        }
    })
})

describe('wiring', () => {
    test('a global middleware keeps the desktop app off purchase pages', () => {
        const src = read('middleware/desktop-no-purchase.global.ts')
        assert.match(src, /useIsDesktopApp\(\)/)
        assert.match(src, /isPurchaseRoute\(to\.path\)/)
    })

    test('useCanPurchase passes the desktop flag', () => {
        assert.match(read('composables/useCanPurchase.ts'), /inDesktopApp/)
    })

    test('the coupon dialogs are only reachable from pages the desktop app blocks', () => {
        const users = fs.readdirSync(path.join(root, 'pages'), { recursive: true })
            .filter(f => f.endsWith('.vue'))
            .filter(f => /ModulesUserAddOnDeals|ModulesUserSubscriptionModal(AddOn|Deal)Coupon/.test(read(path.join('pages', f))))
            .map(f => '/' + f.replace(/\\/g, '/').replace(/(\/index)?\.vue$/, ''))
        assert.ok(users.length > 0)
        for (const route of users) assert.equal(isPurchaseRoute(route), true, route)
    })

    test('course links to the pricing pages are hidden in the desktop app', () => {
        const files = [
            ...['user', 'dentist', 'citizen', 'relative'].map(m => `components/modules/${m}/support/slide-over.vue`),
            ...['calendar', 'citizens', 'daily-overview', 'employees', 'end', 'welcome'].map(n => `components/modules/user/guided-tour/modal-${n}.vue`),
        ]
        for (const file of files) {
            const src = read(file)
            assert.match(src, /const isDesktopApp = useIsDesktopApp\(\)/, file)
            assert.ok(src.includes('support.needACourse') ? /<div v-if="!isDesktopApp" class="space-y-3">\s*<p class="text-xl">\s*\{\{ \$t\('support\.needACourse'\)/.test(src) : true, file)
            if (file.includes('guided-tour')) assert.match(src, /<FormButton v-if="!isDesktopApp" buttonStyle="primary"\s*@click="navigateToExternalLink\('https:\/\/citizenone\.dk\/priser-til-journalsystem\/kurser'\)"/, file)
        }
    })
})
