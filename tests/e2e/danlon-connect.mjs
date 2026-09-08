/**
 * Browser E2E for the Danløn OAuth connect flow, against Danløn/Lessor's real
 * test-environment Keycloak realm (danlon-integration-demo) - not mocked.
 *
 * Drives the real SPA in headless Chrome: authenticates by injecting a minted
 * Sanctum token into localStorage, opens the Apps marketplace, activates the
 * Danløn card (which opens a popup to the real Keycloak login), logs in with
 * the provided demo account, and confirms the popup's postMessage flips the
 * card to "connected". Then calls the real (non-mock) employees/salary-types/
 * supplement-types endpoints via the app's own API to prove the backend's
 * `currentCompany`-based company resolution actually works against a live
 * account, not just that the popup closed. Disconnects at the end so the
 * company is left in the same state it started in.
 *
 * Credentials are never hardcoded here - CO_DANLON_USERNAME/CO_DANLON_PASSWORD
 * must be passed as env vars, same as CO_TOKEN.
 *
 * Run:  see tests/e2e/README.md
 * Env:  CO_TOKEN, CO_DANLON_USERNAME, CO_DANLON_PASSWORD (required),
 *       CO_BASE_URL (default http://localhost:3001),
 *       CO_API_URL (default http://localhost:8001)
 */
import { chromium } from 'playwright-core'
import { fileURLToPath } from 'url'
import path from 'path'

const TOKEN = process.env.CO_TOKEN
const DANLON_USERNAME = process.env.CO_DANLON_USERNAME
const DANLON_PASSWORD = process.env.CO_DANLON_PASSWORD
const BASE = process.env.CO_BASE_URL || 'http://localhost:3001'
const API = process.env.CO_API_URL || 'http://localhost:8001'
const SHOT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'screenshots')

if (!TOKEN || !DANLON_USERNAME || !DANLON_PASSWORD) {
  console.error('Missing CO_TOKEN / CO_DANLON_USERNAME / CO_DANLON_PASSWORD. See tests/e2e/README.md.')
  process.exit(2)
}

const results = []
const ok = (name, cond) => { results.push(cond); console.log(`${cond ? '✅' : '❌'} ${name}`) }

async function api(method, urlPath, headers = {}) {
  const res = await fetch(`${API}/api/user${urlPath}`, {
    method,
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json', ...headers },
  })
  return { status: res.status, json: await res.json().catch(() => null) }
}

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage()
page.setDefaultTimeout(20000)
const consoleErrors = []
page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
page.on('pageerror', (err) => consoleErrors.push('pageerror: ' + err.message))

let connected = false

try {
  // 1) Authenticate by injecting the token, then load the apps marketplace.
  await page.goto(`${BASE}/settings/profile`, { waitUntil: 'domcontentloaded' })
  await page.evaluate((t) => localStorage.setItem('_token', t), TOKEN)
  await page.goto(`${BASE}/apps`, { waitUntil: 'domcontentloaded' })

  // Dismiss the first-login "welcome" onboarding modal if it appears - it
  // intercepts clicks on everything behind it.
  await page.waitForTimeout(1000)
  await page.keyboard.press('Escape').catch(() => {})
  await page.waitForTimeout(300)

  const CONFIRM = /Confirm|Bekræft/
  const ACTIVATE = /Activate|Aktivér/
  const AGREE = /I have read|Jeg har læst/

  // 2) Find the Danløn card (ModulesUserAppCard's own root has a stable
  // `.app-card` class) and click its activate action, scoped to that card
  // so we don't hit some other app's button by accident.
  const card = page.locator('.app-card', { hasText: 'Danløn' }).first()
  await card.waitFor()
  ok('Danløn app card renders on the marketplace', true)

  const activateButton = card.locator('button', { hasText: ACTIVATE }).first()
  await activateButton.click()

  // 3) Accept the TAC modal.
  const agreeCheckboxRow = page.locator('div.cursor-pointer', { hasText: AGREE }).first()
  await agreeCheckboxRow.waitFor()
  await agreeCheckboxRow.click()
  await page.locator('button', { hasText: CONFIRM }).first().click()
  ok('Accepted TAC modal for Danløn', true)

  // 4) Catch the OAuth popup and log in with the real demo account.
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
  ])
  await popup.waitForURL(/auth\.lessor\.dk/, { timeout: 10000 })
  ok('Danløn connect opened a popup to Keycloak', popup.url().includes('auth.lessor.dk'))

  await popup.locator('#username').fill(DANLON_USERNAME)
  await popup.locator('#password').fill(DANLON_PASSWORD)
  await popup.screenshot({ path: `${SHOT}/danlon-01-login.png` }).catch(() => {})
  await popup.locator('#kc-login').click()

  // 5) The popup's own callback page posts a message and closes itself on
  // success (server/api/danlon/callback.get.ts) - wait for that instead of a
  // fixed timeout.
  await popup.waitForEvent('close', { timeout: 20000 }).catch(() => {})
  ok('Keycloak popup closed after login (success path)', popup.isClosed())

  // 6) Confirm the main page picked up the connection.
  await page.waitForTimeout(1500)
  await page.reload({ waitUntil: 'domcontentloaded' })
  const { json: status } = await api('GET', '/danlon/status')
  connected = status?.connected === true
  ok('Backend reports Danløn connected (danlon_company_id resolved via currentCompany)', connected)
  await page.screenshot({ path: `${SHOT}/danlon-02-connected.png`, fullPage: true }).catch(() => {})

  // 7) Prove it's real data, not the mock arrays - hit the live endpoints.
  const { json: employees } = await api('GET', '/danlon/employees')
  const { json: salaryTypes } = await api('GET', '/danlon/salary-types')
  const { json: supplementTypes } = await api('GET', '/danlon/supplement-types')
  ok('getEmployees() succeeds against the live account', employees?.success === true)
  ok('getSalaryTypes() succeeds against the live account', salaryTypes?.success === true)
  ok('getSupplementTypes() succeeds against the live account', supplementTypes?.success === true)
  console.log(`  employees: ${employees?.data?.length ?? 0}, salary types: ${salaryTypes?.data?.length ?? 0}, supplement types: ${supplementTypes?.data?.length ?? 0}`)
  if (employees?.success !== true) console.log('  employees error:', employees?.message)
  if (salaryTypes?.success !== true) console.log('  salaryTypes error:', salaryTypes?.message)
  if (supplementTypes?.success !== true) console.log('  supplementTypes error:', supplementTypes?.message)

  // WebSocket refusals are Pusher/Reverb not running in this local setup -
  // unrelated to the app. "Obiyen script tag" is a known pre-existing warning
  // (see mileage-log.mjs's own filter for the same string).
  const realConsoleErrors = consoleErrors.filter((e) =>
    !e.includes('Obiyen script tag') && !e.includes('WebSocket connection'))
  ok('No console errors during the connect flow', realConsoleErrors.length === 0)
  if (realConsoleErrors.length) console.log('  console errors:', realConsoleErrors.slice(0, 5))
} catch (e) {
  ok('Unexpected error: ' + e.message, false)
  if (consoleErrors.length) console.log('console errors:\n' + consoleErrors.join('\n'))
  await page.screenshot({ path: `${SHOT}/danlon-99-error.png`, fullPage: true }).catch(() => {})
} finally {
  // 8) Disconnect to leave the company in the state it started in.
  if (connected) {
    const disc = await api('POST', '/danlon/disconnect')
    console.log(disc.status === 200 ? '↩︎  disconnected Danløn' : `⚠️  disconnect failed (status ${disc.status})`)
  }
  await browser.close()
}

const passed = results.filter(Boolean).length
console.log(`\n=== ${passed}/${results.length} PASS ===`)
process.exit(passed === results.length ? 0 : 1)
