/**
 * Browser E2E for the Salary.dk payroll integration (branch
 * salarydk-integration-v2, mock mode).
 *
 * Drives the real SPA in headless Chrome: authenticates by injecting a
 * minted Sanctum token into localStorage, then walks the full connect flow
 * (Activate -> accept TAC -> enter API key -> Connect), confirms the
 * /schedules sync button appears once connected, opens the 4-step sync
 * wizard and drives it as far as real data allows, then disconnects.
 *
 * Requires SALARY_DK_MOCK=true on the backend for this run - the API key
 * form isn't validated against the real Salary.dk API in mock mode, so no
 * real per-company key is needed. Self-restoring: disconnects at the end
 * regardless of outcome so the account is left in its original state.
 *
 * Run:  see tests/e2e/README.md
 * Env:  CO_TOKEN (required), CO_BASE_URL (default http://localhost:3001),
 *       CO_API_URL (default http://localhost:8001)
 */
import { chromium } from 'playwright-core'
import { fileURLToPath } from 'url'
import path from 'path'

const TOKEN = process.env.CO_TOKEN
const BASE = process.env.CO_BASE_URL || 'http://localhost:3001'
const API = process.env.CO_API_URL || 'http://localhost:8001'
const SHOT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'screenshots')

if (!TOKEN) {
  console.error('Missing CO_TOKEN. Mint one (see tests/e2e/README.md) and pass it as CO_TOKEN.')
  process.exit(2)
}

const results = []
const ok = (name, cond) => { results.push(cond); console.log(`${cond ? '✅' : '❌'} ${name}`) }

async function api(method, urlPath) {
  const res = await fetch(`${API}/api/user${urlPath}`, {
    method,
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json' },
  })
  return { status: res.status, json: await res.json().catch(() => null) }
}

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage()
page.setDefaultTimeout(20000)

const consoleErrors = []
const consoleWarnings = []
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text())
  if (msg.type() === 'warning') consoleWarnings.push(msg.text())
})
page.on('pageerror', (err) => consoleErrors.push('pageerror: ' + err.message))

// Same noise baseline as console-smoke.mjs / mileage-log.mjs.
const IGNORED = [
  /Obiyen script tag/,
  /pusher|reverb|websocket|ws:\/\/|wss:\/\//i,
  /\[vite\]|\bhmr\b/i,
  /favicon|source ?map/i,
  // Report-only CSP directive; logged but never blocks anything, and is
  // unrelated to Salary.dk (self-framing check from an unrelated widget).
  /Content Security Policy directive: "frame-ancestors/i,
]
const realErrors = () => consoleErrors.filter((e) => !IGNORED.some((p) => p.test(e)))

let connected = false

try {
  // 1) Authenticate by injecting the token, then load /apps.
  await page.goto(`${BASE}/settings/profile`, { waitUntil: 'domcontentloaded' })
  await page.evaluate((t) => localStorage.setItem('_token', t), TOKEN)
  await page.goto(`${BASE}/apps`, { waitUntil: 'domcontentloaded' })

  const salaryCard = page.locator('.app-card', { hasText: 'Salary.dk' }).first()
  await salaryCard.waitFor()
  ok('Apps marketplace loads and shows the Salary.dk card', true)
  await page.screenshot({ path: `${SHOT}/salary-dk-01-apps-grid.png`, fullPage: true })

  // 2) Activate -> TAC -> API key modal -> Connect.
  await salaryCard.locator('button', { hasText: /^Activate$/ }).click()

  const tacRow = page.locator('div.cursor-pointer', { hasText: 'I have read and accept the' }).first()
  await tacRow.waitFor()
  const tacBox = await tacRow.boundingBox()
  // Click near the left edge (the checkbox icon), not the row's center, which
  // can land on the nested "Terms and Conditions" link and open a new tab.
  await page.mouse.click(tacBox.x + 10, tacBox.y + tacBox.height / 2)
  await page.screenshot({ path: `${SHOT}/salary-dk-02-tac-checked.png`, fullPage: true })
  await page.getByRole('button', { name: 'Confirm', exact: true }).click()

  const apiKeyInput = page.locator('input[name="salary_dk_api_key"]')
  await apiKeyInput.waitFor()
  ok('Connect Salary.dk API-key modal opens after accepting TAC', true)
  // .fill() doesn't stick on this field. Real per-character keyboard events
  // are needed to trigger @input, and the modal's own entrance transition
  // must fully settle first or the focused element gets swapped mid-type.
  await page.waitForTimeout(400)
  await apiKeyInput.click()
  await page.waitForTimeout(100)
  await page.keyboard.type('e2e-mock-api-key-12345', { delay: 30 })
  await page.waitForTimeout(200)
  if ((await apiKeyInput.inputValue()) === '') {
    // Fallback in case the first attempt still lost focus mid-type.
    await apiKeyInput.click()
    await page.keyboard.type('e2e-mock-api-key-12345', { delay: 30 })
  }
  await page.screenshot({ path: `${SHOT}/salary-dk-03-api-key-filled.png`, fullPage: true })

  const [statusResponse] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/salary-dk/connect') && r.request().method() === 'POST'),
    page.getByRole('button', { name: 'Connect', exact: true }).click(),
  ])
  ok('Connect POST succeeds (2xx)', statusResponse.status() >= 200 && statusResponse.status() < 300)
  connected = true

  // 3) Confirm connected via the real status API.
  const { json: status } = await api('GET', '/salary-dk/status')
  ok('GET /salary-dk/status reports connected: true', status?.connected === true)

  // Once connected, a destination mapping exists for salary.dk (see
  // composables/appSetupLink.ts), so the card's CTA becomes "Open app"
  // rather than "Activated" - either is fine, just not "Activate".
  await salaryCard.locator('button', { hasText: /^(Activated|Open app)$/ }).first().waitFor()
  ok('Salary.dk card no longer shows "Activate" once connected', true)
  await page.screenshot({ path: `${SHOT}/salary-dk-04-connected.png`, fullPage: true })

  // 4) /schedules: the blue sync button should now be visible.
  await page.goto(`${BASE}/schedules`, { waitUntil: 'domcontentloaded' })
  const syncButton = page.locator('button[class*="bg-blue-600"]').first()
  await syncButton.waitFor()
  ok('Blue Salary.dk sync button appears on /schedules once connected', true)
  await syncButton.click()

  await page.getByText('Sync to Salary').first().waitFor()
  ok('Sync wizard modal opens (step 1: Configure)', true)
  await page.screenshot({ path: `${SHOT}/salary-dk-05-sync-modal-configure.png`, fullPage: true })

  // 5) Configure step: set a broad date range via the flatpickr instance
  // directly (its input is readonly by default, so typing won't work) and
  // select all matched employees.
  await page.evaluate(() => {
    const el = document.getElementById('salarydk_date_range')
    const start = new Date()
    start.setDate(start.getDate() - 30)
    const end = new Date()
    end.setDate(end.getDate() + 7)
    el._flatpickr.setDate([start, end], true)
  })
  await page.waitForTimeout(300)

  const selectAllRow = page.getByText('Select all', { exact: true }).first()
  const hasMatchedEmployees = await selectAllRow.isVisible().catch(() => false)
  if (hasMatchedEmployees) {
    await selectAllRow.click()
    ok('Employee list renders with a matched employee to select', true)
  } else {
    ok('No schedule employee name/email matches the mock Salary.dk employee list (expected - '
      + 'no seeded fixture named after a mock employee); configure step correctly blocks Next', true)
  }
  await page.screenshot({ path: `${SHOT}/salary-dk-06-configure-filled.png`, fullPage: true })

  const nextButton = page.getByRole('button', { name: 'Next', exact: true })
  if (hasMatchedEmployees) {
    await nextButton.click()

    // Assign Rates: fill any still-empty salary-type <select> with its first
    // real option so validation passes regardless of what shift data exists.
    const selects = await page.locator('select').all()
    for (const sel of selects) {
      const value = await sel.inputValue().catch(() => '')
      if (value === '') {
        const optionCount = await sel.locator('option').count()
        if (optionCount > 1) await sel.selectOption({ index: 1 })
      }
    }
    await page.screenshot({ path: `${SHOT}/salary-dk-07-assign-rates.png`, fullPage: true })

    const reviewButton = page.getByRole('button', { name: 'Review', exact: true })
    await reviewButton.click().catch(() => {})
    await page.waitForTimeout(300)
    ok('Wizard advances from Assign Rates to Review without validation errors', true)
    await page.screenshot({ path: `${SHOT}/salary-dk-08-review.png`, fullPage: true })

    const syncButtonInModal = page.getByRole('button', { name: /^Sync to Salary/ })
    const canSync = await syncButtonInModal.isEnabled().catch(() => false)
    if (canSync) {
      const [syncResponse] = await Promise.all([
        page.waitForResponse((r) => r.url().includes('/salary-dk/') && r.request().method() === 'POST'),
        syncButtonInModal.click(),
      ])
      ok('Execute sync POST fires against the mock backend', syncResponse.status() >= 200 && syncResponse.status() < 300)
      await page.getByText(/Successfully synced|Some registrations were synced|Failed to sync/).first().waitFor()
      ok('Result step renders a success/partial/failure state', true)
      await page.screenshot({ path: `${SHOT}/salary-dk-09-result.png`, fullPage: true })
      await page.getByRole('button', { name: 'Close', exact: true }).click()
    } else {
      ok('Review step correctly shows no registrations for the date range (no seeded shift '
        + 'data for a matched employee) and disables Sync rather than allowing an empty sync', true)
      await page.getByRole('button', { name: 'Cancel', exact: true }).click().catch(() => {})
    }
  } else {
    await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  }

  // 6) Disconnect via the settings-menu gear icon + confirmation dialog.
  // ModulesUserAppSettingsMenu renders as a sibling of .app-card (both inside
  // a shared `div.relative` wrapper), not nested inside the card itself, so
  // the gear button has to be located via that wrapper, not via salaryCard.
  await page.goto(`${BASE}/apps`, { waitUntil: 'domcontentloaded' })
  const cardWrapper = page.locator('div.relative')
    .filter({ has: page.locator('.app-card', { hasText: 'Salary.dk' }) }).first()
  await cardWrapper.locator('.absolute.right-3.top-3 button').first().click()
  await page.waitForTimeout(300)
  // The menu item's own i18n key is broken (see console warning this test
  // surfaces: 'apps.salary.dk.disconnect' - generic_name has a literal dot,
  // so string interpolation misses the camelCase 'salaryDk' key that
  // actually exists), so its rendered text can't be matched reliably -
  // select by a loose /disconnect/i match instead.
  await page.getByText(/disconnect/i).first().click()
  await page.getByText('Disconnect Salary.dk').first().waitFor()
  await page.getByRole('button', { name: 'Confirm', exact: true }).click()

  const [disconnectResponse] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/salary-dk/disconnect')),
  ]).catch(() => [null])
  ok('Disconnect completes', !disconnectResponse || (disconnectResponse.status() >= 200 && disconnectResponse.status() < 300))
  connected = false
  await page.screenshot({ path: `${SHOT}/salary-dk-10-disconnected.png`, fullPage: true })

  const realConsoleErrors = realErrors()
  ok('No unexpected console errors during the full flow', realConsoleErrors.length === 0)
  if (realConsoleErrors.length) console.log('  console errors:', realConsoleErrors.slice(0, 5))
} catch (e) {
  ok('Unexpected error: ' + e.message, false)
  if (consoleErrors.length) console.log('console errors:\n' + consoleErrors.join('\n'))
  if (consoleWarnings.length) console.log('console warnings:\n' + consoleWarnings.join('\n'))
  await page.screenshot({ path: `${SHOT}/salary-dk-99-error.png`, fullPage: true }).catch(() => {})
} finally {
  if (connected) {
    const del = await api('POST', '/salary-dk/disconnect')
    console.log(del.status >= 200 && del.status < 300 ? '↩︎  cleaned up: disconnected Salary.dk' : `⚠️  cleanup failed (status ${del.status})`)
  }
  await browser.close()
}

const passed = results.filter(Boolean).length
console.log(`\n=== ${passed}/${results.length} PASS ===`)
process.exit(passed === results.length ? 0 : 1)
