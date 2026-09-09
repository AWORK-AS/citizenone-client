/**
 * Browser E2E for the risk-assessment trend graph
 * (branch feat/risk-assessment-trend-graph).
 *
 * Covers: clicking through from a citizen's latest risk assessment to a
 * color-coded (green/yellow/red) history chart with a 1/3/6-month period
 * selector, from both entry points (citizens list action button, and the
 * citizen detail header avatar). Also probes the empty-state, error-state,
 * and access-control behavior of the backing endpoint directly via the API,
 * without attempting to fix anything found - this run is a "find problems"
 * pass, not a "make it green" pass.
 *
 * Run:  see tests/e2e/README.md
 * Env:  CO_TOKEN (required, company-1 dev@awork.dk),
 *       CO_LOWPRIV_TOKEN (optional, a department-scoped non-admin user - used
 *       only for the access-control probe, skipped if not provided),
 *       CO_CITIZEN_UUID (required - a citizen with risk-assessment history),
 *       CO_BASE_URL (default http://localhost:3000),
 *       CO_API_URL (default http://127.0.0.1:8000)
 */
import { chromium } from 'playwright-core'
import { fileURLToPath } from 'url'
import path from 'path'

const TOKEN = process.env.CO_TOKEN
const LOWPRIV_TOKEN = process.env.CO_LOWPRIV_TOKEN
const CITIZEN_UUID = process.env.CO_CITIZEN_UUID
const BASE = process.env.CO_BASE_URL || 'http://localhost:3000'
const API = process.env.CO_API_URL || 'http://127.0.0.1:8000'
const SHOT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'screenshots')

if (!TOKEN || !CITIZEN_UUID) {
  console.error('Missing CO_TOKEN and/or CO_CITIZEN_UUID.')
  process.exit(2)
}

const results = []
const ok = (name, cond) => { results.push(cond); console.log(`${cond ? '✅' : '❌'} ${name}`) }
const note = (msg) => console.log(`ℹ️  ${msg}`)

async function api(token, method, urlPath) {
  const res = await fetch(`${API}/api/user${urlPath}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  return { status: res.status, json: await res.json().catch(() => null) }
}

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage()
page.setDefaultTimeout(20000)
const consoleErrors = []
page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
page.on('pageerror', (err) => consoleErrors.push('pageerror: ' + err.message))

try {
  // --- Backend probes (direct API, independent of the browser session) ---

  // Invalid period
  const badPeriod = await api(TOKEN, 'GET', `/citizen-journals/${CITIZEN_UUID}/risk-assessments/history?period=2`)
  ok('Invalid period (2) rejected with 400', badPeriod.status === 400)
  ok('Invalid-period message is a clean sentence (no raw key/placeholder)', typeof badPeriod.json?.message === 'string' && !badPeriod.json.message.includes(':'))

  // Unknown citizen
  const badCitizen = await api(TOKEN, 'GET', '/citizen-journals/00000000-0000-0000-0000-000000000000/risk-assessments/history?period=3')
  ok('Unknown citizen rejected with 404', badCitizen.status === 404)
  ok('Not-found message is a clean sentence (no raw key/placeholder)', typeof badCitizen.json?.message === 'string' && !badCitizen.json.message.startsWith(':'))

  // Access control: does a department-scoped, non-admin user get the same
  // data for a citizen outside their department? Documented, not "fixed."
  if (LOWPRIV_TOKEN) {
    const scoped = await api(LOWPRIV_TOKEN, 'GET', `/citizen-journals/${CITIZEN_UUID}/risk-assessments/history?period=3`)
    const scopedCitizen = await api(LOWPRIV_TOKEN, 'GET', `/citizens/${CITIZEN_UUID}`)
    note(`Access-control probe: low-priv user -> risk-history status ${scoped.status}, citizen-detail status ${scopedCitizen.status}`)
    if (scoped.status === 200 && scopedCitizen.status === 200) {
      note('New endpoint returns data to an out-of-department user, but so does the existing citizen-detail endpoint - consistent with existing (systemic) behavior, not a new regression on this branch.')
    } else if (scoped.status !== scopedCitizen.status) {
      note('⚠️  New endpoint and citizen-detail endpoint disagree on access control for the same user/citizen pair - worth a closer look.')
    }
  } else {
    note('CO_LOWPRIV_TOKEN not provided - access-control probe skipped.')
  }

  // --- Browser flow ---

  await page.goto(`${BASE}/settings/profile`, { waitUntil: 'domcontentloaded' })
  await page.evaluate((t) => localStorage.setItem('_token', t), TOKEN)

  // 1) Citizen list entry point - look up the citizen's name via the API
  // (no href/uuid attribute exists on the list row - it navigates via JS),
  // then search for it and locate the row by name text.
  const citizenLookup = await api(TOKEN, 'GET', `/citizens/${CITIZEN_UUID}`)
  const citizenName = `${citizenLookup.json?.data?.firstname ?? ''} ${citizenLookup.json?.data?.lastname ?? ''}`.trim()
  ok('Test citizen resolved via API for list search', citizenName.length > 0)

  await page.goto(`${BASE}/citizens`, { waitUntil: 'domcontentloaded' })
  await page.locator('input[type="search"], input[placeholder]').first().fill(citizenName)
  await page.waitForTimeout(600)
  const row = page.locator('tr', { hasText: citizenName }).first()
  await row.waitFor({ timeout: 15000 })
  const riskButton = row.getByRole('button', { name: /latest risk assessment/i })
  await riskButton.waitFor()
  await page.screenshot({ path: `${SHOT}/risk-history-01-citizens-list.png`, fullPage: true })

  const [historyRes1] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/risk-assessments/history') && r.url().includes('period=3')),
    riskButton.click(),
  ])
  ok('Modal opens and default period=3 request fires', historyRes1.status() === 200)

  await page.getByText(/risk assessment over time|risikovurdering over tid/i).first().waitFor({ timeout: 10000 }).catch(() => {})
  await page.waitForTimeout(1200) // let ECharts' entry animation finish before screenshotting
  await page.screenshot({ path: `${SHOT}/risk-history-02-modal-default.png`, fullPage: true })

  const notEnoughDataVisible = await page.getByText(/not enough data|ikke nok data/i).isVisible().catch(() => false)
  ok('period=3 shows chart, not "not enough data" (test citizen has 6 entries)', !notEnoughDataVisible)

  // 2) Period switching: 1 -> 6 -> 3, asserting a fresh request each time
  const period1Btn = page.getByRole('button', { name: /^(Last month|Seneste måned|Siste måned|Senaste månaden)$/i })
  const [historyRes2] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/risk-assessments/history') && r.url().includes('period=1')),
    period1Btn.click(),
  ])
  ok('Switching to period=1 fires a fresh request', historyRes2.status() === 200)
  const period1Json = await historyRes2.json().catch(() => null)
  ok('period=1 returns exactly 2 entries (known local data)', period1Json?.data?.length === 2)
  await page.waitForTimeout(1200)
  await page.screenshot({ path: `${SHOT}/risk-history-03-period1.png`, fullPage: true })

  const period6Btn = page.getByRole('button', { name: /^(Last 6 months|Seneste 6 måneder|Siste 6 månedene|Senaste 6 månaderna)$/i })
  const [historyRes3] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/risk-assessments/history') && r.url().includes('period=6')),
    period6Btn.click(),
  ])
  ok('Switching to period=6 fires a fresh request', historyRes3.status() === 200)
  const period6Json = await historyRes3.json().catch(() => null)
  ok('period=6 returns 13 entries incl. a red (acute increased risk) point (known local data)', period6Json?.data?.length === 13 && period6Json.data.some((e) => e.color === 'red'))
  await page.waitForTimeout(1200)
  await page.screenshot({ path: `${SHOT}/risk-history-04-period6.png`, fullPage: true })

  // Close this modal before moving to the detail-header entry point
  await page.locator('button[aria-label="Close" i], button', { hasText: /^(close|luk)$/i }).first().click().catch(() => {})

  // 3) Detail-header entry point (second, independent trigger)
  // Note: `/citizens/{uuid}` alone is not a real route (no bare index page) -
  // use a real sub-page, matching how a user would actually navigate there.
  await page.goto(`${BASE}/citizens/${CITIZEN_UUID}/timeline`, { waitUntil: 'domcontentloaded' })
  const avatarButton = page.locator('button.relative:has(img)').first()
  await avatarButton.waitFor({ timeout: 15000 })
  const [historyRes4] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/risk-assessments/history')),
    avatarButton.click(),
  ])
  ok('Detail-header avatar click also opens the risk history chart', historyRes4.status() === 200)
  await page.waitForTimeout(1200)
  await page.screenshot({ path: `${SHOT}/risk-history-05-detail-header.png`, fullPage: true })

  // 4) Empty-state: stub the API to return zero entries
  await page.route('**/risk-assessments/history**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ data: [] }),
  }))
  const period3BtnAgain = page.getByRole('button', { name: /^(Last 3 months|Seneste 3 måneder|Siste 3 månedene|Senaste 3 månaderna)$/i })
  await period3BtnAgain.click()
  await page.waitForTimeout(500)
  const emptyStateVisible = await page.getByText(/not enough data|ikke nok data/i).isVisible().catch(() => false)
  ok('Stubbed empty response ([]) shows the "not enough data" placeholder, not a blank/broken chart', emptyStateVisible)
  await page.screenshot({ path: `${SHOT}/risk-history-06-empty-state.png`, fullPage: true })

  // 5) Error-state: stub a 400 response
  await page.unroute('**/risk-assessments/history**')
  await page.route('**/risk-assessments/history**', (route) => route.fulfill({
    status: 400,
    contentType: 'application/json',
    body: JSON.stringify({ message: 'Ugyldig periode. Skal være 1, 3 eller 6 måneder.' }),
  }))
  const period1BtnAgain = page.getByRole('button', { name: /^(Last month|Seneste måned|Siste måned|Senaste månaden)$/i })
  await period1BtnAgain.click()
  await page.waitForTimeout(500)
  const bodyTextAfterError = await page.locator('body').innerText()
  ok('Stubbed 400 error surfaces a readable message in the UI (no raw key/placeholder)', bodyTextAfterError.includes('Ugyldig periode') && !bodyTextAfterError.includes('exception.'))
  await page.screenshot({ path: `${SHOT}/risk-history-07-error-state.png`, fullPage: true })
  await page.unroute('**/risk-assessments/history**')

  // Filters known noise: third-party script tag, Reverb/Pusher websocket (no
  // local Reverb server running), and the 400 this test deliberately stubbed
  // in step 5 above to exercise the error state.
  const realConsoleErrors = consoleErrors.filter((e) =>
    !e.includes('Obiyen script tag') &&
    !e.includes('WebSocket connection') &&
    !e.includes('status of 400 (Bad Request)'))
  ok('No unexpected console errors during the flow', realConsoleErrors.length === 0)
  if (realConsoleErrors.length) console.log('  console errors:', realConsoleErrors.slice(0, 5))
} catch (e) {
  ok('Unexpected error: ' + e.message, false)
  if (consoleErrors.length) console.log('console errors:\n' + consoleErrors.join('\n'))
  await page.screenshot({ path: `${SHOT}/risk-history-99-error.png`, fullPage: true }).catch(() => {})
} finally {
  await browser.close()
}

const passed = results.filter(Boolean).length
console.log(`\n=== ${passed}/${results.length} PASS ===`)
process.exit(passed === results.length ? 0 : 1)
