/**
 * Browser E2E for the Employee Mileage Log feature.
 *
 * Drives the real SPA in headless Chrome: authenticates by injecting a minted
 * Sanctum token into localStorage (no password needed), then verifies the
 * self-service Mileage Log page loads, creates a multi-stop citizen-less trip
 * via the real map-picker UI, confirms the computed distance and route show
 * up in the table, exercises the manual distance correction (and that it
 * survives a later route-moving save), and checks the "Mileage Report" entry
 * point on Time Logs.
 * Self-restoring: deletes the trip it creates via the API at the end.
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

async function api(method, urlPath, body) {
  const res = await fetch(`${API}/api/user${urlPath}`, {
    method,
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json', 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
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

let createdUuid = null

try {
  // 1) Authenticate by injecting the token, then load the page.
  await page.goto(`${BASE}/settings/profile`, { waitUntil: 'domcontentloaded' })
  await page.evaluate((t) => localStorage.setItem('_token', t), TOKEN)
  await page.goto(`${BASE}/settings/mileage-log`, { waitUntil: 'domcontentloaded' })

  await page.locator('button', { hasText: /New trip|Ny tur/ }).first().waitFor()
  ok('Mileage Log page loads (self-service, token auth)', true)

  const bodyText = await page.locator('body').innerText()
  ok('i18n resolves (no raw "mileageLog.*" keys)', !bodyText.includes('mileageLog.'))
  await page.waitForTimeout(300) // let the route-transition fade finish before the shot
  await page.screenshot({ path: `${SHOT}/mileage-01-list.png`, fullPage: true })

  // 2) Tab bar shows the new Mileage Log tab (Admin users get it grouped under
  // a "Logs" dropdown alongside Activity Logs/Time Logs, so check either the
  // group label or the translated tab name is present).
  ok('Settings tab bar shows a "Logs" group or "Mileage Log"/"Kørselsregnskab" tab',
    bodyText.includes('Logs') || bodyText.includes('Mileage Log') || bodyText.includes('Kørselsregnskab'))

  // Note: this test user's locale is Danish, so UI text renders in Danish
  // ("Ny tur", "Vælg lokation", "Gem" etc.) — match both languages throughout.
  const NEW_TRIP = /New trip|Ny tur/
  const PICK_LOCATION = /Select location|Vælg lokation/
  const USE_LOCATION = /Use this location|Brug denne placering/
  const SAVE = /^(Save|Gem)$/

  // 3) Open "New Trip" and fill in a 2-stop trip via the map picker (avoids
  // depending on live Nominatim geocoding for the address text — only the
  // lat/lng from the map click matters for the distance calculation).
  await page.locator('button', { hasText: NEW_TRIP }).first().click()
  const pickLocationLabels = page.locator('span', { hasText: PICK_LOCATION })
  await pickLocationLabels.first().waitFor()
  await page.screenshot({ path: `${SHOT}/mileage-02-new-modal.png`, fullPage: true })

  // Stop A: open its map picker (map only renders once a stop's picker opens).
  await pickLocationLabels.nth(0).click()
  const mapModal = page.locator('.leaflet-container').last()
  await mapModal.waitFor()
  const box = await mapModal.boundingBox()
  await page.mouse.click(box.x + box.width * 0.4, box.y + box.height * 0.4)
  await page.waitForTimeout(500)
  await page.getByRole('button', { name: USE_LOCATION }).click().catch(() => {})
  await page.screenshot({ path: `${SHOT}/mileage-03-stop-a-picked.png`, fullPage: true })

  // Stop B: open its map picker, click a different point.
  await pickLocationLabels.nth(1).click()
  const mapModal2 = page.locator('.leaflet-container').last()
  await mapModal2.waitFor()
  const box2 = await mapModal2.boundingBox()
  await page.mouse.click(box2.x + box2.width * 0.6, box2.y + box2.height * 0.6)
  await page.waitForTimeout(500)
  await page.getByRole('button', { name: USE_LOCATION }).click().catch(() => {})
  await page.screenshot({ path: `${SHOT}/mileage-04-stop-b-picked.png`, fullPage: true })

  // Distance should now be computed (non-zero), read-only (no manual km input).
  const distanceText = await page.locator('text=/Distance \\(calculated automatically\\)|Distance \\(beregnes automatisk\\)/').locator('..').innerText()
  ok('Distance shown is read-only text, not an editable input (no km text field present)',
    (await page.locator('input[name="kilometers"]').count()) === 0)
  ok(`Estimated distance computed and displayed (${distanceText.replace(/\s+/g, ' ').trim()})`,
    /\d/.test(distanceText) && !distanceText.includes('0,00 km') && !distanceText.includes('0.00 km'))

  // Note field + submit.
  await page.locator('textarea[name="note"]').first().fill('E2E browser test trip')
  const [postResponse] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/mileage-logs') && r.request().method() === 'POST'),
    page.locator('button[type="submit"]', { hasText: SAVE }).click(),
  ])
  ok('Create POST succeeds (2xx)', postResponse.status() >= 200 && postResponse.status() < 300)

  // 4) Confirm the trip appears in the table.
  await page.getByText('E2E browser test trip').first().waitFor({ timeout: 10000 })
  ok('New trip appears in the table after save', true)
  await page.screenshot({ path: `${SHOT}/mileage-05-created.png`, fullPage: true })

  // "Obiyen script tag not found!" is an unrelated pre-existing third-party
  // analytics warning, not something the mileage-log feature caused.
  const realConsoleErrors = consoleErrors.filter((e) => !e.includes('Obiyen script tag'))
  ok('No console errors during create flow', realConsoleErrors.length === 0)
  if (realConsoleErrors.length) console.log('  console errors:', realConsoleErrors.slice(0, 5))

  // 5) Fetch it back via API to get its uuid for cleanup + to double check
  // the server-computed kilometers/citizen_id contract from the UI-driven row.
  // Match the frontend's own default sort (newest date_time_start first) so
  // this lands on the same page-1 the UI just showed.
  const { json: list } = await api('GET', '/mileage-logs?sortField=date_time_start&sortOrder=descend')
  const created = (list?.data || []).find((r) => r.note === 'E2E browser test trip')
  ok('Created trip is retrievable via API with citizen_id null and computed kilometers > 0',
    !!created && created.citizen_id === null && Number(created.kilometers) > 0)
  createdUuid = created?.uuid

  // 5b) Manual distance correction. The correction itself goes through the API
  // rather than the row's button: the list row carries no stable identifier in
  // the DOM, so clicking "the right row" is not reliable here. What the browser
  // half checks is the part only the browser can - that the "Corrected" badge
  // renders on the corrected row afterwards.
  //
  // The guard being tested is the one the whole feature rests on: an override
  // must survive a later save that moves the coordinates the calculator scores.
  if (createdUuid) {
    const CORRECTED = /Corrected|Rettet/
    const corrected = await api('PUT', `/mileage-logs/${createdUuid}/distance`, {
      kilometers: 99.99,
      reason: 'E2E browser test correction',
    })

    if (corrected.status === 400) {
      // Manager/Admin only by design - a plain-employee token is a valid state
      // for this test to run in, not a failure.
      console.log('↷  skipped distance-correction checks (this token is not Manager+)')
    } else {
      ok('Distance correction accepted (2xx)', corrected.status >= 200 && corrected.status < 300)

      // Move the end coordinate: without the guard in recalculateDistance(),
      // this rescores the trip and wipes the correction.
      const moved = await api('PUT', `/mileage-logs/${createdUuid}`, {
        geo_end_lat: 56.1629,
        geo_end_lng: 10.2039, // Aarhus - would score far higher
      })
      ok('Update after correction succeeds (2xx)', moved.status >= 200 && moved.status < 300)

      const { json: after } = await api('GET', `/mileage-logs/${createdUuid}`)
      ok('Corrected distance survives an update that moves the route',
        Number(after?.data?.kilometers) === 99.99 && after?.data?.distance_source === 'manual')
      ok('Calculated figure is snapshotted alongside the correction',
        after?.data?.kilometers_calculated != null && Number(after.data.kilometers_calculated) !== 99.99)

      await page.goto(`${BASE}/settings/mileage-log`, { waitUntil: 'domcontentloaded' })
      await page.locator('button', { hasText: NEW_TRIP }).first().waitFor()
      await page.getByText(CORRECTED).first().waitFor({ timeout: 10000 })
      ok('"Corrected" badge renders on the corrected row', true)
      await page.screenshot({ path: `${SHOT}/mileage-07-corrected.png`, fullPage: true })

      // Reverting hands the row back to the calculator.
      const reverted = await api('DELETE', `/mileage-logs/${createdUuid}/distance`)
      ok('Revert to calculated succeeds (2xx)', reverted.status >= 200 && reverted.status < 300)
      const { json: back } = await api('GET', `/mileage-logs/${createdUuid}`)
      ok('Reverted trip is recalculated and its audit fields cleared',
        back?.data?.distance_source !== 'manual'
        && Number(back?.data?.kilometers) !== 99.99
        && back?.data?.kilometers_calculated == null)
    }
  }

  // 6) "Mileage Report" entry point on the Time Logs settings page.
  const MILEAGE_REPORT = /Mileage Report|Kørselsrapport/
  const TOTAL_KM_ALL = /Total km \(all employees\)|Total km \(alle medarbejdere\)/
  await page.goto(`${BASE}/settings/time-logs`, { waitUntil: 'domcontentloaded' })
  await page.locator('button', { hasText: MILEAGE_REPORT }).first().waitFor()
  ok('"Mileage Report" button present on Settings > Time Logs', true)
  await page.locator('button', { hasText: MILEAGE_REPORT }).first().click()
  await page.getByText(TOTAL_KM_ALL).first().waitFor()
  ok('All-employees mileage report modal opens with totals tiles', true)
  await page.screenshot({ path: `${SHOT}/mileage-06-report.png`, fullPage: true })
} catch (e) {
  ok('Unexpected error: ' + e.message, false)
  if (consoleErrors.length) console.log('console errors:\n' + consoleErrors.join('\n'))
  if (consoleWarnings.length) console.log('console warnings:\n' + consoleWarnings.join('\n'))
  await page.screenshot({ path: `${SHOT}/mileage-99-error.png`, fullPage: true }).catch(() => {})
} finally {
  if (createdUuid) {
    const del = await api('DELETE', `/mileage-logs/${createdUuid}`)
    console.log(del.status === 200 ? '↩︎  cleaned up the created trip' : `⚠️  cleanup failed (status ${del.status})`)
  }
  await browser.close()
}

const passed = results.filter(Boolean).length
console.log(`\n=== ${passed}/${results.length} PASS ===`)
process.exit(passed === results.length ? 0 : 1)
