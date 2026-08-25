/**
 * Browser E2E for the range-time overdue/due-soon fix
 * (composables/medicineDoseTiming.ts, fixed 2026-08-24).
 *
 * Background: dosage times come from the platform-wide `time_intervals`
 * catalog (backend database/seeders/TimeIntervalSeeder.php, no company
 * scoping), which seeds five range windows alongside 96 point times:
 * "06:00 - 10:00", "10:00 - 13:00", "13:00 - 17:00", "17:00 - 22:00", and
 * "22:00 - 06:00" (overnight). The day-view's overdue/due-soon logic used to
 * silently treat every range-format slot as never overdue. This test creates
 * a real citizen_medicine with a "06:00 - 10:00" slot via the API, freezes
 * the browser clock to a time after that window has closed, and asserts the
 * day view actually renders it as overdue — the one thing the unit tests in
 * tests/unit/medicineDoseTiming.test.mjs cannot prove, since they exercise
 * the extracted function directly rather than the rendered page.
 *
 * Self-restoring: deletes the citizen_medicine it creates via the API at the
 * end, whether the test passes or fails.
 *
 * Run and passing as of 2026-08-24 against the local dev stack (dev@awork.dk,
 * citizen c0e80ed3-8fb8-4cd9-a4f3-52963ad9961a / Louise Jensen — the exact
 * citizen from the screenshot that found this bug). Two real issues surfaced
 * and were fixed while getting it green, not from reading source alone:
 *   - the create POST must be multipart/form-data, matching the real form
 *     (modal-new.vue) — a native JSON body makes max_dosage_per_time
 *     unreadable to the backend and the create 400s (see the comment below).
 *   - a direct navigation to /medicine-journals bounces to /timeline on a
 *     cold SPA boot; land on the citizen's page first and click the tab.
 *

 * Run:  see tests/e2e/README.md
 * Env:  CO_TOKEN (required), CO_CITIZEN_UUID (required),
 *       CO_BASE_URL (default http://localhost:3000),
 *       CO_API_URL (default http://127.0.0.1:8000)
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
  console.error('Missing CO_TOKEN and/or CO_CITIZEN_UUID. See tests/e2e/README.md.')
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

// The real create-medicine form posts multipart/form-data, not JSON — see
// the comment at the call site for why that's load-bearing, not incidental.
// No Content-Type header here: fetch sets the multipart boundary itself.
async function apiForm(urlPath, formData) {
  const res = await fetch(`${API}/api/user${urlPath}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json' },
    body: formData,
  })
  return { status: res.status, json: await res.json().catch(() => null) }
}

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage()
page.setDefaultTimeout(20000)
const consoleErrors = []
page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
page.on('pageerror', (err) => consoleErrors.push('pageerror: ' + err.message))

let createdUuid = null

try {
  // 1) Resolve catalog prerequisites via the real API rather than hardcoding
  //    UUIDs, so this doesn't depend on a specific seed data set.
  const medicines = await api('GET', '/medicines/all/list')
  const dosageForms = await api('GET', '/dosage-forms/all/list')
  const medicineUuid = medicines.json?.data?.[0]?.uuid ?? medicines.json?.[0]?.uuid
  const dosageUuid = dosageForms.json?.data?.[0]?.uuid ?? dosageForms.json?.[0]?.uuid
  ok('Resolved a medicine_uuid and dosage_uuid from the catalogs', !!medicineUuid && !!dosageUuid)
  if (!medicineUuid || !dosageUuid) throw new Error('No medicine/dosage catalog entries available to build the test payload.')

  // 2) Create a scheduled (non-PN) citizen_medicine with a range-format dose
  //    time — one of the platform-wide seeded intervals, not a made-up value.
  //
  //    The real form (modal-new.vue) sends this whole request as
  //    multipart/form-data, every field a plain string — not JSON. That
  //    matters here, not just for fidelity: CitizenMedicineService checks
  //    `is_string($payload->max_dosage_per_time)` and only then
  //    json_decode()s it into objects it can do `->time` on. A native JSON
  //    body makes Laravel materialize that field as an array of PHP
  //    associative arrays instead, `->time` on those resolves to null with a
  //    warning, and the create silently 400s with "Time field is required" —
  //    which is exactly what happened the first time this script ran.
  //    is_pn_medicine also arrives as the literal string 'false'/'true' this
  //    way, matching CitizenMedicineService's strict `=== 'false'` check.
  const form = new FormData()
  form.append('citizen_uuid', CITIZEN_UUID)
  form.append('medicine_uuid', medicineUuid)
  form.append('dosage_uuid', dosageUuid)
  form.append('is_pn_medicine', 'false')
  form.append('schedule_frequency', 'everyday')
  form.append('max_daily_dose', '10')
  form.append('strength', '1')
  form.append('ingredients', 'E2E test ingredient')
  form.append('description', 'Created by tests/e2e/medicine-overdue-range-time.mjs — safe to delete.')
  form.append('max_dosage_per_time', JSON.stringify([{ time: '06:00 - 10:00', dosage: '1' }]))

  const createRes = await apiForm('/citizen-medicines', form)
  createdUuid = createRes.json?.data?.uuid ?? createRes.json?.uuid ?? null
  ok('Citizen medicine with a range-time slot created via API', createRes.status >= 200 && createRes.status < 300 && !!createdUuid)
  if (!createdUuid) throw new Error(`Create failed: ${createRes.status} ${JSON.stringify(createRes.json)}`)

  // 3) Freeze the browser clock to a moment well after the 06:00-10:00
  //    window has closed, then authenticate and load the day view. Fixing
  //    the clock (rather than relying on real wall-clock time) makes this
  //    deterministic regardless of when the test actually runs.
  const frozenNow = new Date()
  frozenNow.setHours(15, 34, 0, 0) // matches the live screenshot that found this bug
  await page.clock.setFixedTime(frozenNow)

  await page.goto(`${BASE}/settings/profile`, { waitUntil: 'domcontentloaded' })
  await page.evaluate((t) => localStorage.setItem('_token', t), TOKEN)
  // A direct/hard navigation straight to `/medicine-journals` bounces to
  // `/timeline` on a cold SPA boot (citizen store not yet hydrated) — same
  // gotcha documented in journal-note-survey.mjs. Land on the citizen's page
  // first, then click the tab, matching real user navigation.
  await page.goto(`${BASE}/citizens/${CITIZEN_UUID}/timeline`, { waitUntil: 'domcontentloaded' })
  await page.locator('a,button', { hasText: /Medicinkort|Medicine card/ }).first().click()
  await page.waitForURL(/\/medicine-journals$/)

  const row = page.locator(`[data-uuid="${createdUuid}"]`).first()
  await row.waitFor()

  // 4) The actual assertion: getSlotClass() puts 'bg-red-100' on a missed
  //    slot's button (pages/citizens/[uuid]/medicine-journals.vue). Before
  //    the fix, isMissed('06:00 - 10:00', ...) always returned false, so this
  //    button would carry the default 'bg-gray-50' class instead, forever,
  //    regardless of how long ago the window closed.
  const slotButton = row.locator('button', { hasText: '1' }).first()
  await slotButton.waitFor()
  const slotClass = await slotButton.getAttribute('class')
  ok('The closed 06:00-10:00 window renders with the overdue (red) class', /bg-red-100/.test(slotClass ?? ''))

  await page.screenshot({ path: path.join(SHOT, 'medicine-overdue-range-time.png'), fullPage: true }).catch(() => {})

  // 'Obiyen script tag not found!' is a third-party chat-widget warning
  // unrelated to this feature — it fires in this headless environment
  // because that external script isn't reachable, not because of anything
  // this test touches. Confirmed present on an unrelated debug run too.
  const unexpectedErrors = consoleErrors.filter((e) => !e.includes('Obiyen script tag not found'))
  ok('No unexpected console errors during the run', unexpectedErrors.length === 0)
  if (unexpectedErrors.length) console.log('Unexpected console errors:', unexpectedErrors)
  if (consoleErrors.length) console.log('Console errors:', consoleErrors)
} catch (err) {
  console.error('❌ Uncaught error:', err)
  if (consoleErrors.length) console.log('Console errors captured before failure:', consoleErrors)
  results.push(false)
} finally {
  // 5) Self-restore regardless of outcome.
  if (createdUuid) {
    const del = await api('DELETE', `/citizen-medicines/${createdUuid}`)
    ok('Cleanup: test citizen_medicine deleted', del.status >= 200 && del.status < 300)
  }
  await browser.close()
}

const passed = results.filter(Boolean).length
console.log(`\n${passed}/${results.length} checks passed.`)
process.exit(results.every(Boolean) ? 0 : 1)
