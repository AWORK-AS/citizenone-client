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
 * 6. MitID Erhverv login (API answers stubbed in the browser, no SEB needed):
 *    login panel when FMK needs it, the button goes to SEB, choosing a role
 *    after coming back, the signed-in line, and SEB errors explained.
 * 7. Staff without an FMK licence do not see "Hent fra FMK".
 * 8. Settings -> FMK (admin): a SOR code needs its number, saving shows what
 *    is sent to FMK. Self-restoring: the original settings are put back.
 *
 * 9. "Overtag til CitizenOne" on a row only in FMK creates a draft that lines
 *    up with FMK; "Markér som gennemgået" clears an FMK change. The draft the
 *    test creates is deleted again; a catalogue medicine with the FMK drug
 *    name may stay (Settings -> Medicines).
 *
 * The token's user must be an admin with an FMK licence.
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

console.log('6. MitID Erhverv login')
await page.setViewportSize({ width: 1440, height: 1000 })
const json = (body, status = 200) => ({ status, contentType: 'application/json', body: JSON.stringify(body) })
const signedOut = { data: { logged_in: false, name: null, role_label: null, expires_at: null, choices: null } }
let session = signedOut
await page.route('**/api/user/fmk-login/session', (route) => route.fulfill(json(session)))

// a) FMK needs the staff member's own login
await page.route('**/fmk/medicine-card', (route) => route.fulfill(json({ message: 'Log ind med MitID Erhverv for at slå op i FMK.', code: 'fmk_login_required' }, 403)))
await go(`/citizens/${CITIZEN}/fmk`)
const loginButton = page.getByRole('button', { name: /Log ind med MitID Erhverv|Sign in with MitID Erhverv/ })
await loginButton.waitFor()
check('login panel shown when FMK needs the staff login', await loginButton.isVisible())
check('no comparison table without login', !(await table.isVisible().catch(() => false)))
let loginBody = null
await page.route('**/api/user/fmk-login', (route) => { loginBody = route.request().postDataJSON(); return route.fulfill(json({ redirect_url: 'https://seb.stub.test/runtime/saml2/sso?SAMLRequest=x' })) })
await page.route('https://seb.stub.test/**', (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<h1>SEB</h1>' }))
await Promise.all([page.waitForURL('https://seb.stub.test/**'), loginButton.click()])
check('button sends the browser to SEB', page.url().startsWith('https://seb.stub.test/runtime/saml2/sso'))
check('comes back to this FMK page', loginBody?.return_path === `/citizens/${CITIZEN}/fmk`, JSON.stringify(loginBody))
await page.unroute('**/fmk/medicine-card')
await page.unroute('**/api/user/fmk-login')

// b) back from SEB with two roles to choose between
await page.goto(`${BASE}/citizens/${CITIZEN}/timeline`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(4000)
session = { data: { ...signedOut.data, choices: [
  { key: 'national_role:urn:x:PlejeAssR3', type: 'national_role', label: 'PlejeAssR3' },
  { key: 'authorisation:ABC12', type: 'authorisation', label: 'Sygeplejerske' },
] } }
let chosen = null
await page.route('**/api/user/fmk-login/session/role', (route) => {
  chosen = route.request().postDataJSON()
  session = { data: { logged_in: true, name: 'Karl Kristensen', role_label: 'Sygeplejerske', expires_at: new Date(Date.now() + 8 * 3600e3).toISOString(), choices: null } }
  return route.fulfill(json(session))
})
await go(`/citizens/${CITIZEN}/fmk?fmk_login=choose`)
await page.getByRole('radio', { name: /Sygeplejerske/ }).waitFor()
check('role choice offered after SEB', await page.getByRole('radio').count() === 2)
await page.getByRole('radio', { name: /Sygeplejerske/ }).check()
await page.getByRole('button', { name: /Fortsæt|Continue/ }).click()
await page.getByText(/Logget ind i FMK som Karl Kristensen|Signed in to FMK as Karl Kristensen/).waitFor()
check('chosen role sent', chosen?.key === 'authorisation:ABC12', JSON.stringify(chosen))
check('signed-in line with role', await page.getByText(/Sygeplejerske/).first().isVisible())
await table.waitFor()
check('card fetched after choosing', await table.isVisible())
check('login query removed from the URL', !page.url().includes('fmk_login'))
await page.screenshot({ path: path.join(SHOT, 'fmk-screen-signed-in.png'), fullPage: true })

// c) SEB sends the browser back with a full page load, here with an error.
// The signed-in app state is kept in the browser, so the citizen tab check
// must not bounce the page before the result is read.
session = signedOut
await page.goto(`${BASE}/citizens/${CITIZEN}/fmk?fmk_login=error&fmk_error=organisation`, { waitUntil: 'domcontentloaded' })
const orgMessage = page.getByText(/anden organisation|another organisation/)
await orgMessage.waitFor()
check('organisation mismatch explained', await orgMessage.isVisible())
check('full page return stays on the FMK page', page.url().includes(`/citizens/${CITIZEN}/fmk`), page.url())
await page.unroute('**/api/user/fmk-login/session')
await page.unroute('**/api/user/fmk-login/session/role')

console.log('7. No licence, no FMK button')
await page.route('**/api/user', async (route) => {
  const res = await route.fetch(); const body = await res.json()
  body.data.has_fmk_licence = false
  return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })
})
await page.goto(`${BASE}/citizens/${CITIZEN}/timeline`, { waitUntil: 'domcontentloaded' })
await page.waitForResponse((r) => r.url().endsWith('/api/user')).catch(() => {})
await page.waitForTimeout(3000)
await go(`/citizens/${CITIZEN}/medicine-journals`)
await page.getByRole('button', { name: /Ny medicin|New medicine/ }).first().waitFor()
await page.waitForTimeout(1500)
check('"Hent fra FMK" hidden without licence', await page.getByRole('button', { name: /Hent fra FMK|Fetch from FMK|Hämta från FMK/ }).count() === 0)
await page.unroute('**/api/user')
await page.goto(`${BASE}/citizens/${CITIZEN}/timeline`, { waitUntil: 'domcontentloaded' })
await page.waitForResponse((r) => r.url().endsWith('/api/user')).catch(() => {})
await page.waitForTimeout(3000)

console.log('8. Settings -> FMK')
const firstGet = page.waitForResponse((r) => r.url().includes('/api/user/fmk-settings') && r.request().method() === 'GET')
await go('/settings/fmk')
const settingsResponse = await firstGet
const settingsUrl = settingsResponse.url()
const original = (await settingsResponse.json()).data
await page.waitForTimeout(2000)
// A one-time "what's new" notice can cover the page; close it if it is there.
const gotIt = page.locator('#headlessui-portal-root').getByRole('button', { name: /^(got it|forstået|forstått|uppfattat|ok)$/i })
if (await gotIt.count()) { await gotIt.first().click(); await page.waitForTimeout(800) }
const saveButton = page.getByRole('button', { name: /^(Gem|Save|Lagre|Spara)$/ })
await saveButton.waitFor()
const typeSelect = page.locator('#fmk-id-type').locator('xpath=ancestor::div[contains(@class,"multiselect")][1]')
await typeSelect.click()
await page.getByRole('option', { name: /SOR/ }).first().click()
await page.locator('#fmk-id').fill('')
const saved = (url) => page.waitForResponse((r) => r.url().includes('/api/user/fmk-settings') && r.request().method() === 'PUT')
let put = saved(); await saveButton.click(); let res = await put
check('SOR code without number is refused', res.status() === 422, String(res.status()))
check('field error shown', await page.getByText(/organisation id|nummer|number/i).first().isVisible().catch(() => false))
await page.locator('#fmk-id').fill('123456789012345')
await page.locator('#fmk-phone').fill('70 20 30 40')
put = saved(); await saveButton.click(); res = await put
check('settings saved', res.status() === 200, String(res.status()))
check('what FMK is sent is shown', await page.getByText('123456789012345').last().isVisible())
await page.screenshot({ path: path.join(SHOT, 'fmk-settings.png'), fullPage: true })
// put back what was there
await page.request.put(settingsUrl, {
  headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json' },
  data: { organisation_id_type: original.organisation_id_type, organisation_id: original.organisation_id, organisation_name: original.organisation_name, contact_phone: original.contact_phone, contact_email: original.contact_email, default_requested_role: original.default_requested_role, require_mitid_cvr_match: original.require_mitid_cvr_match },
})

console.log('9. Take over from FMK')
await go(`/citizens/${CITIZEN}/fmk`)
await table.waitFor()
const takeOverButton = table.getByRole('button', { name: /Overtag til CitizenOne|Take over into CitizenOne/ }).first()
if (await takeOverButton.count()) {
  const row = takeOverButton.locator('xpath=ancestor::tr[1]')
  const drug = (await row.locator('td').first().locator('p').first().innerText()).trim()
  const posted = page.waitForResponse((r) => r.url().includes('/fmk/take-over'))
  await takeOverButton.click()
  const response = await posted
  check('take over creates the draft', response.status() === 201, String(response.status()))
  const created = (await response.json()).data
  const sameRow = table.locator('tr').filter({ hasText: drug })
  await sameRow.getByText(/Kladde – mangler doseringsplan|Draft – no dosage plan yet/).waitFor()
  check('row now lined up with a draft on the CitizenOne side', (await sameRow.innerText()).match(/Ens|Same/) !== null)
  await page.screenshot({ path: path.join(SHOT, 'fmk-taken-over.png'), fullPage: true })
  // clean up the draft this test created
  const apiBase = response.url().split('/user/citizens/')[0]
  const del = await page.request.delete(`${apiBase}/user/citizen-medicines/${created.uuid}`, { headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json' } })
  check('test draft removed again', del.ok(), String(del.status()))
} else {
  console.log('  skip no row only in FMK')
}
const ackButton = table.getByRole('button', { name: /Markér som gennemgået|Mark as reviewed/ }).first()
if (await ackButton.count()) {
  const acked = page.waitForResponse((r) => r.url().includes('/fmk/acknowledge'))
  await ackButton.click()
  check('change marked as reviewed', (await acked).status() === 200)
} else {
  console.log('  skip no row changed in FMK')
}

check('no page errors', problems.length === 0, problems.join(' | '))

await browser.close()
console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) failed.`)
process.exit(failures === 0 ? 0 : 1)
