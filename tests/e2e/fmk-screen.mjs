/**
 * Browser E2E for the FMK screen (Fælles Medicinkort), /citizens/{uuid}/fmk.
 *
 * What this proves:
 * 1. The medicine page has "Hent fra FMK", and it opens the FMK page under the
 *    Medicinkort tab.
 * 2. The page says it is FMK (GK 1.1), shows the card markings, and FMK is the
 *    left column, CitizenOne the right (GK 3.1). "Forskelle" filters rows.
 * 3. "Vis alle oplysninger fra FMK" shows FMK's own fields (GK 3.5).
 * 4. When a refresh fails, the FMK error is shown and the last card stays,
 *    marked as old (GK 3.2).
 * 5. On a phone each row is a card, and the page is no wider than the
 *    medicine page itself.
 *
 * Needs the backend with FMK_FAKE=true (sample card, never in production) and
 * a citizen the token's user may see. Read-only: nothing is changed.
 *
 * Run:  see tests/e2e/README.md
 * Env:  CO_TOKEN (required), CO_CITIZEN_UUID (required),
 *       CO_BASE_URL (default http://localhost:3001), CO_SHOT_DIR (default tests/e2e/screenshots)
 */
import { chromium } from 'playwright-core'
import { fileURLToPath } from 'url'
import path from 'path'

const TOKEN = process.env.CO_TOKEN
const CITIZEN = process.env.CO_CITIZEN_UUID
const BASE = process.env.CO_BASE_URL || 'http://localhost:3001'
const SHOT = process.env.CO_SHOT_DIR || path.join(path.dirname(fileURLToPath(import.meta.url)), 'screenshots')
const TIMEOUT = 90000

if (!TOKEN || !CITIZEN) {
  console.error('CO_TOKEN and CO_CITIZEN_UUID are required. See tests/e2e/README.md')
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
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
page.setDefaultTimeout(TIMEOUT)
const problems = []
page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`))
page.on('console', (m) => { if (m.type() === 'error' && /fmk|i18n|Not found/i.test(m.text())) problems.push(m.text().slice(0, 200)) })

// A direct load of a citizen subpage can run the tab access check before the
// user's pages are loaded, so the app is opened once and then navigated in-app.
const go = (p) => page.evaluate((to) => document.querySelector('#__nuxt').__vue_app__.config.globalProperties.$router.push(to), p)

await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' })
await page.evaluate((t) => localStorage.setItem('_token', t), TOKEN)
await page.goto(`${BASE}/citizens/${CITIZEN}/timeline`, { waitUntil: 'domcontentloaded' })
await page.waitForResponse((r) => r.url().endsWith('/api/user') && r.request().method() === 'GET').catch(() => {})
await page.waitForTimeout(4000)

console.log('1. Medicine page → FMK')
await go(`/citizens/${CITIZEN}/medicine-journals`)
const openButton = page.getByRole('button', { name: /Hent fra FMK|Fetch from FMK|Hämta från FMK/ }).first()
await openButton.waitFor()
check('"Hent fra FMK" on the medicine page', await openButton.isVisible())
await openButton.click()
await page.waitForURL(`**/citizens/${CITIZEN}/fmk`)
check('opens the FMK page', page.url().endsWith(`/citizens/${CITIZEN}/fmk`))

console.log('2. Clearly FMK, markings, FMK left')
const table = page.locator('table').filter({ has: page.locator('th', { hasText: /CitizenOne/ }) })
await table.waitFor()
check('FMK badge in the header', await page.locator('header span[translate="no"]', { hasText: 'FMK' }).isVisible())
check('sample data is labelled', await page.getByText(/Eksempeldata|Sample data/).first().isVisible())
check('"not reviewed" marking shown', await page.getByText(/ikke ajourført|not reviewed/i).first().isVisible())
const headers = table.locator('thead th')
const fmkX = (await headers.nth(0).boundingBox()).x
const localX = (await headers.nth(2).boundingBox()).x
check('FMK column is left of CitizenOne', fmkX < localX, `fmk ${fmkX}, local ${localX}`)
const allRows = await table.locator('tbody tr').count()
check('rows listed', allRows > 0, `${allRows} rows`)
await page.getByRole('button', { name: /Forskelle|Differences/ }).click()
const diffRows = await table.locator('tbody tr').count()
check('"Forskelle" never shows more rows than "Alle"', diffRows <= allRows, `${diffRows} of ${allRows}`)
await page.screenshot({ path: path.join(SHOT, 'fmk-screen-desktop.png'), fullPage: true })

console.log('3. All FMK fields')
await page.getByRole('button', { name: /Vis alle oplysninger fra FMK|Show all information from FMK/ }).first().click()
// Headless UI's dialog root has no box of its own; wait for its content.
const field = page.getByRole('dialog').getByText('Identifier').first()
await field.waitFor()
check('details show FMK field names', await field.isVisible())
await page.keyboard.press('Escape')
await field.waitFor({ state: 'hidden' })

console.log('4. FMK unavailable on refresh')
await page.route('**/fmk/medicine-card', (route) => route.fulfill({
  status: 503,
  contentType: 'application/json',
  body: JSON.stringify({ message: 'Medicinkortet kunne ikke hentes fra FMK lige nu. Fejl fra FMK: Timeout', fault_code: null }),
}))
await page.getByRole('button', { name: /Hent igen|Fetch again/ }).click()
const alert = page.getByRole('alert').filter({ hasText: /FMK/ })
await alert.waitFor()
const alertText = await alert.innerText()
check('FMK error is shown', alertText.includes('Timeout'), alertText.replace(/\s+/g, ' ').slice(0, 200))
check('last card stays, marked as old', await page.getByText(/som det var|as it was/).first().isVisible())
check('table still shown', await table.isVisible())
await page.unroute('**/fmk/medicine-card')

console.log('5. Phone')
await page.setViewportSize({ width: 390, height: 900 })
await page.waitForTimeout(1000)
const fmkWidth = await page.evaluate(() => document.documentElement.scrollWidth)
check('rows become cards (table hidden)', !(await table.isVisible()))
await page.screenshot({ path: path.join(SHOT, 'fmk-screen-phone.png'), fullPage: true })
await go(`/citizens/${CITIZEN}/medicine-journals`)
await page.waitForTimeout(3000)
const medicineWidth = await page.evaluate(() => document.documentElement.scrollWidth)
check('FMK page no wider than the medicine page', fmkWidth <= medicineWidth, `fmk ${fmkWidth}, medicine ${medicineWidth}`)

check('no page errors', problems.length === 0, problems.join(' | '))

await browser.close()
console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) failed.`)
process.exit(failures === 0 ? 0 : 1)
