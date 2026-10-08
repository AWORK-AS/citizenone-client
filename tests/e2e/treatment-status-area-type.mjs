/**
 * Browser E2E for task-363: creating a "New status" on a treatment.
 *
 * Covers two changes:
 *  - The status's "Date" field now defaults to today instead of being blank.
 *  - The care area is shown read-only (no picker) - a status always inherits
 *    the parent treatment's care area, server-side too (the API forces it on
 *    create and edit, and an edit that omits it does not wipe it).
 *  - The body is pre-filled with the O/A/P/F template and cannot be saved unchanged.
 *
 * Setup/cleanup use the real API directly (create treatment + status before,
 * delete both after) so the test is self-restoring and can be re-run safely.
 *
 * Run:  see tests/e2e/README.md
 * Env:  CO_TOKEN (required), CO_BASE_URL (default http://localhost:3000),
 *       CO_API_URL (default http://127.0.0.1:8000), CO_CITIZEN_UUID (required)
 */
import { chromium } from 'playwright-core'
import { fileURLToPath } from 'url'
import path from 'path'

const TOKEN = process.env.CO_TOKEN
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

async function api(method, urlPath, body) {
  const res = await fetch(`${API}/api/user${urlPath}`, {
    method,
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json', 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  return { status: res.status, json: await res.json().catch(() => null) }
}

const TREATMENT_AREA_TYPE = 'musculoskeletal_system'
const TREATMENT_NAME = `E2E Treatment ${Date.now()}`
const TODAY = new Date().toISOString().slice(0, 10)

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
page.setDefaultTimeout(20000)
const consoleErrors = []
page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
page.on('pageerror', (err) => consoleErrors.push('pageerror: ' + err.message))

let treatmentUuid = null
let statusUuid = null

try {
  // 1) Setup: create a treatment with a known, distinctive area type.
  const treatmentRes = await api('POST', '/treatments', {
    citizen_uuid: CITIZEN_UUID,
    name: TREATMENT_NAME,
    completion_date: TODAY,
    area_type: TREATMENT_AREA_TYPE,
  })
  ok('Treatment created via API', treatmentRes.status >= 200 && treatmentRes.status < 300 && !!treatmentRes.json?.data?.uuid)
  treatmentUuid = treatmentRes.json?.data?.uuid

  // 2) Authenticate by injecting the token, then load the citizen's treatments tab.
  await page.goto(`${BASE}/settings/profile`, { waitUntil: 'domcontentloaded' })
  await page.evaluate((t) => localStorage.setItem('_token', t), TOKEN)
  await page.goto(`${BASE}/citizens/${CITIZEN_UUID}/timeline`, { waitUntil: 'domcontentloaded' })
  await page.locator('a,button', { hasText: 'Health' }).first().click()
  await page.waitForURL(/\/nursing-areas/)

  await page.getByText('Treatments', { exact: true }).first().click()
  await page.getByText(TREATMENT_NAME).first().waitFor({ timeout: 10000 })
  ok('Citizen health page loads and the created treatment is visible', true)

  // 3) Open the "New status" modal for that treatment.
  const treatmentCard = page.locator('div')
    .filter({ hasText: TREATMENT_NAME })
    .filter({ hasText: /Statuses|Statusser/ })
    .last()
  await treatmentCard.getByText(/Statuses|Statusser/).first().click()
  await page.getByRole('button', { name: /New status|Ny status/ }).first().click()

  await page.screenshot({ path: `${SHOT}/treatment-status-01-modal.png`, fullPage: true })

  // 4) Assert the Area type field is gone, and the Date field defaults to today.
  const bodyText = await page.locator('body').innerText()
  const careArea = page.getByTestId('status-care-area')
  ok('Care area is shown read-only in the "New status" form', (await careArea.count()) === 1 && (await page.locator('select#area_type').count()) === 0)
  ok('Care area shown is the parent treatment's (Musculoskeletal system)', /Musculoskeletal|Bevægeapparat|Muskel/i.test(await careArea.innerText()))

  // The body is pre-filled with the O/A/P/F skeleton, so saving it untouched must be blocked.
  await page.getByRole('button', { name: /^(Save|Gem)$/ }).click()
  ok('Saving the unchanged template skeleton is blocked', await page.getByText(/Please complete the template|Udfyld venligst skabelonen/).count() > 0)

  // flatpickr renders the picked date as visible text (e.g. "31. August 2026 (36)"),
  // not a plain input value, so assert against the rendered day-of-month instead.
  const todayDayOfMonth = new Date().getDate()
  ok('Date field defaults to today', new RegExp(`\\b${todayDayOfMonth}\\. `).test(bodyText))

  // 5) Fill in the required "Status" rich text field and save.
  await page.locator('.ck-editor__editable').first().click()
  await page.keyboard.press('Control+End')
  await page.keyboard.type('E2E status note')

  const [postResponse] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/statuses') && r.request().method() === 'POST'),
    page.getByRole('button', { name: /^(Save|Gem)$/ }).click(),
  ])
  ok('Status create POST succeeds (2xx)', postResponse.status() >= 200 && postResponse.status() < 300)
  const postJson = await postResponse.json().catch(() => null)
  statusUuid = postJson?.data?.uuid

  // 6) Verify server-side: the created status carries the treatment's area type,
  // even though the form never sent one.
  ok('Created status inherited the parent treatment\'s area type', postJson?.data?.area_type === TREATMENT_AREA_TYPE)
  ok('Created status date defaults to today', postJson?.data?.date === TODAY)

  await page.screenshot({ path: `${SHOT}/treatment-status-02-created.png`, fullPage: true })

  // 6b) An edit that omits area_type (as the mobile app does) must not wipe the care area.
  const editRes = await api('PUT', `/statuses/${statusUuid}`, { status: 'E2E edited', date: TODAY })
  ok('Edit without area_type keeps the care area', editRes.json?.data?.area_type === TREATMENT_AREA_TYPE)
  const spoofEdit = await api('PUT', `/statuses/${statusUuid}`, { status: 'E2E edited', date: TODAY, area_type: 'sexuality' })
  ok('Edit cannot change the care area', spoofEdit.json?.data?.area_type === TREATMENT_AREA_TYPE)

  // 7) Confirm the API rejects/overrides an attempt to set a mismatched area type directly.
  const spoofRes = await api('POST', '/statuses', {
    model_uuid: treatmentUuid,
    status: 'E2E spoof attempt',
    date: TODAY,
    area_type: 'sexuality',
  })
  ok('API forces area_type to match the parent treatment even when a different one is sent', spoofRes.json?.data?.area_type === TREATMENT_AREA_TYPE)
  if (spoofRes.json?.data?.uuid) {
    await api('DELETE', `/statuses/${spoofRes.json.data.uuid}`)
  }

  const realConsoleErrors = consoleErrors.filter((e) => !e.includes('Obiyen script tag'))
  ok('No console errors during create flow', realConsoleErrors.length === 0)
  if (realConsoleErrors.length) console.log('  console errors:', realConsoleErrors.slice(0, 5))
} catch (e) {
  ok('Unexpected error: ' + e.message, false)
  if (consoleErrors.length) console.log('console errors:\n' + consoleErrors.join('\n'))
  await page.screenshot({ path: `${SHOT}/treatment-status-99-error.png`, fullPage: true }).catch(() => {})
} finally {
  if (statusUuid) {
    const del = await api('DELETE', `/statuses/${statusUuid}`)
    console.log(del.status >= 200 && del.status < 300 ? '↩︎  cleaned up the created status' : `⚠️  status cleanup failed (status ${del.status})`)
  }
  if (treatmentUuid) {
    const del = await api('DELETE', `/treatments/${treatmentUuid}`)
    console.log(del.status >= 200 && del.status < 300 ? '↩︎  cleaned up the created treatment' : `⚠️  treatment cleanup failed (status ${del.status})`)
  }
  await browser.close()
}

const passed = results.filter(Boolean).length
console.log(`\n=== ${passed}/${results.length} PASS ===`)
process.exit(passed === results.length ? 0 : 1)
