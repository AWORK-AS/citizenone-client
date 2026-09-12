/**
 * Browser E2E for "/invoices should redirect to /invoicing".
 *
 * /invoices (the older ClientInvoice "bill a municipality/client" flow) and
 * /invoicing (the newer citizen-invoicing module: service catalogue, per-citizen
 * invoices, payments, templates, reports) used to be two separate pages. The
 * purchasable app behind /invoicing was recently renamed from "Send fakturaer"
 * to "invoicing" (generic_name changed from send-invoices to invoicing) since
 * the module now covers everything the old app did and more, so /invoices is
 * now redirected (301) to /invoicing rather than kept as a second page, and
 * activating/purchasing the app now sends the user to /invoicing.
 *
 * This proves, for a company with the invoicing app active:
 *  - /invoices, /invoices/new, and /invoices/{uuid}/edit all redirect to /invoicing
 *  - the profile-dropdown "Invoices" nav link goes to /invoicing
 *  - the apps marketplace "Go to setup" action after activating the invoicing
 *    app lands on /invoicing (via pages/apps/activated-successfully.vue's
 *    appSetupRoutes map)
 *
 * Read-only against real data; the CO_TOKEN company's invoicing-app
 * subscription must already be active (set up separately for this run, not
 * something this script grants or revokes itself).
 *
 * Run:  see tests/e2e/README.md
 * Env:  CO_TOKEN (required, a user whose company has the invoicing app active),
 *       CO_INVOICING_APP_UUID (required, the Application row's uuid for
 *       generic_name=invoicing - used to drive the "go to setup" check),
 *       CO_BASE_URL (default http://localhost:3001)
 */
import { chromium } from 'playwright-core'
import { fileURLToPath } from 'url'
import path from 'path'

const TOKEN = process.env.CO_TOKEN
const APP_UUID = process.env.CO_INVOICING_APP_UUID
const BASE = process.env.CO_BASE_URL || 'http://localhost:3001'
const SHOT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'screenshots')
const USER_FETCH_TIMEOUT = 60000

if (!TOKEN) {
  console.error('CO_TOKEN is required. See tests/e2e/README.md')
  process.exit(1)
}
if (!APP_UUID) {
  console.error('CO_INVOICING_APP_UUID is required. See tests/e2e/README.md')
  process.exit(1)
}

let failures = 0
function check(label, condition, detail = '') {
  if (condition) {
    console.log(`  ok   ${label}`)
  } else {
    failures++
    console.error(`  FAIL ${label}${detail ? ` - ${detail}` : ''}`)
  }
}

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } })

async function bootAndReload() {
  await Promise.all([
    page.waitForResponse((r) => r.url().endsWith('/api/user') && r.request().method() === 'GET', { timeout: USER_FETCH_TIMEOUT }),
    page.reload({ waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT }),
  ])
  await page.waitForTimeout(3000)
}

async function dismissWelcomeModal() {
  const welcomeModal = page.getByText('Welcome to CitizenOne', { exact: false })
  if (await welcomeModal.isVisible().catch(() => false)) {
    await page.keyboard.press('Escape')
    await page.waitForTimeout(500)
  }
}

try {
  await page.goto(`${BASE}/overview`, { waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT })
  await page.evaluate((token) => localStorage.setItem('_token', token), TOKEN)
  await bootAndReload()
  await dismissWelcomeModal()

  console.log('apps "go to setup" after activation')
  await page.goto(`${BASE}/apps/activated-successfully?category=&exclude=${APP_UUID}`, { waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT })
  const setupButton = page.getByRole('button', { name: /go to setup/i })
  const setupButtonVisible = await setupButton.waitFor({ state: 'visible', timeout: 20000 }).then(() => true).catch(() => false)
  check('the "Go to setup" button appears for the invoicing app', setupButtonVisible)
  if (setupButtonVisible) {
    await setupButton.click()
    await page.waitForURL('**/invoicing**', { timeout: USER_FETCH_TIMEOUT }).catch(() => {})
    check('"Go to setup" for the invoicing app lands on /invoicing', new URL(page.url()).pathname === '/invoicing', page.url())
  }

  console.log('/invoices redirects')
  // Each visit to /invoicing (the redirect target) fires a couple dozen of its
  // own dashboard requests, and the app enforces a 120 req/min-per-user limit
  // (see tests/e2e/README.md's console-smoke notes) - pace these three visits
  // rather than firing them back to back, so the budget survives through the
  // interactive checks below.
  for (const path_ of ['/invoices', '/invoices/new', '/invoices/some-fake-uuid/edit']) {
    await page.goto(`${BASE}${path_}`, { waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT })
    await page.waitForTimeout(1000)
    check(`${path_} redirects to /invoicing`, new URL(page.url()).pathname === '/invoicing', page.url())
    await page.waitForTimeout(8000)
  }

  console.log('nav dropdown "Invoices" link')
  // Reuse the /invoicing page we already ended up on above - the profile
  // dropdown lives in the shared layout, present on any authenticated page,
  // so there's no need for another full-page reload here (the app's own API
  // rate limit is 120 req/min per user, and /overview alone fires ~30).
  // HeadlessUI Menu/MenuButton - a stable hook independent of locale/labels.
  // Several other navbar widgets (page settings, help/news menu) are also
  // HeadlessUI Menus rendered earlier in the DOM; the profile menu is last.
  const profileMenuButton = page.locator('[id^="headlessui-menu-button"]').last()
  await profileMenuButton.waitFor({ state: 'visible', timeout: 15000 })
  await profileMenuButton.click({ timeout: 10000 })
  // Trailing dash disambiguates individual menu items ("headlessui-menu-item-14")
  // from the MenuItems container itself, whose id ("headlessui-menu-items-4")
  // otherwise also matches a bare "headlessui-menu-item" prefix.
  const invoicesMenuItem = page.locator('[id^="headlessui-menu-item-"]').filter({ hasText: 'Invoices' }).first()
  const invoicesMenuItemVisible = await invoicesMenuItem.waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false)
  check('the nav "Invoices" menu item is visible for a company with the invoicing app', invoicesMenuItemVisible)
  if (invoicesMenuItemVisible) {
    await invoicesMenuItem.click()
    await page.waitForURL('**/invoicing**', { timeout: USER_FETCH_TIMEOUT }).catch(() => {})
    check('clicking the nav "Invoices" link lands on /invoicing', new URL(page.url()).pathname === '/invoicing', page.url())
  }

  await page.screenshot({ path: path.join(SHOT, 'invoices-redirect-to-invoicing.png'), fullPage: true })
} catch (err) {
  failures++
  console.error('FAIL (exception):', err.message)
  await page.screenshot({ path: path.join(SHOT, 'invoices-redirect-to-invoicing-error.png'), fullPage: true }).catch(() => {})
} finally {
  await browser.close()
}

console.log(failures ? `\n${failures} check(s) failed` : '\nall checks passed')
process.exit(failures ? 1 : 0)
