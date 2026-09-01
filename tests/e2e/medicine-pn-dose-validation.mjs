/**
 * Browser E2E for the PN (as-needed) dose check-off safety fix, AW-2026-3581.
 *
 * Before the fix, validateForm() in
 * components/modules/user/citizen/medicine/history/form.vue compared the
 * SCHEDULED-slot array (always empty for PN) against max_daily_dose, so the
 * "did you enter the right dose?" confirmation fired on effectively every
 * PN save regardless of the dose actually entered -- training staff to
 * reflex-click past it (and the real backend 4-hour interval warning right
 * behind it, which looks identical). See tests/unit/medicineDosage.test.mjs
 * for the pure-logic coverage of the fix itself; this script proves the
 * actual modal flow behaves correctly end to end.
 *
 * Creates one real PN citizen_medicine via the API (max_dose_per_administration
 * 2, max_daily_dose 6), then:
 *   1) dose 1 (under both limits) -> saves directly, NO confirmation dialog.
 *      This is the core regression proof.
 *   2) dose 5 (over max_dose_per_administration) -> the confirmation DOES
 *      appear, and its text names both the entered dose and the limit.
 *   3) dose "en halv" (non-numeric) -> blocked inline by the new Vuelidate
 *      rule, no submit, no confirmation.
 *   4) day view "select all" -> the PN row's own checkbox stays unchecked.
 * Self-restoring: deletes the created history rows and citizen_medicine in
 * `finally` regardless of outcome.
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

// The real create-medicine form posts multipart/form-data, not JSON. No
// Content-Type header here -- fetch sets the multipart boundary itself.
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

// Opens "Give PN" for the test medicine's row, fills the dose (leaving type/
// evaluator/evaluation-frequency filled in from any previous call in the
// same run, since the modal is fully re-rendered fresh each open), and
// clicks Save. Does NOT assume anything about what happens after -- callers
// check for the confirmation dialog or a direct save themselves.
async function openGivePnAndEnterDose(dose) {
  const row = page.locator(`[data-uuid="${createdUuid}"]`).first()
  await row.locator('button', { hasText: 'Give PN' }).click()
  await page.locator('#dosage').waitFor()
  await page.locator('#dosage').fill(String(dose))

  // Type: click the first radio option ("given") -- HeadlessUI's
  // RadioGroupOption stamps role="radio" on its rendered element regardless
  // of the (possibly company-customised) label text.
  await page.locator('[role="radio"]').first().click()

  // Evaluator (single-select) and evaluation frequency (multi-select) are
  // both @vueform/multiselect instances with no native <select> under them.
  // id="evaluator"/"evaluation_frequency" land on the inner search <input>,
  // not a wrapping element -- the option list renders as a SIBLING with id
  // "<id>-multiselect-options" (aria-controls confirms the pairing), not a
  // descendant, so it has to be queried separately rather than scoped under
  // the input's own locator. Confirmed against the live DOM before writing
  // this - see the "outer/wait" note in the PR description.
  await page.locator('#evaluator').click()
  await page.locator('#evaluator-multiselect-options .multiselect-option').first().click()

  await page.locator('#evaluation_frequency').click()
  await page.locator('#evaluation_frequency-multiselect-options .multiselect-option').first().click()
  // Close the still-open multiselect dropdown WITHOUT Escape -- confirmed
  // against the live app that Escape here closes the whole HeadlessUI
  // Dialog (the "Give PN" modal itself), not just the dropdown, which
  // detaches the Save button before it can be clicked. A click on a neutral
  // label blurs the dropdown instead.
  await page.locator('label', { hasText: 'Comment' }).click({ timeout: 3000 }).catch(() => {})

  await page.locator('button[type="submit"]', { hasText: /Save|Gem/ }).click()
}

try {
  // 1) Catalog prerequisites, same as the other medicine e2e scripts.
  const medicines = await api('GET', '/medicines/all/list')
  const dosageForms = await api('GET', '/dosage-forms/all/list')
  const medicineUuid = medicines.json?.data?.[0]?.uuid ?? medicines.json?.[0]?.uuid
  const dosageUuid = dosageForms.json?.data?.[0]?.uuid ?? dosageForms.json?.[0]?.uuid
  ok('Resolved a medicine_uuid and dosage_uuid from the catalogs', !!medicineUuid && !!dosageUuid)
  if (!medicineUuid || !dosageUuid) throw new Error('No medicine/dosage catalog entries available to build the test payload.')

  // 2) One PN citizen_medicine, via the real API. is_pn_medicine and the two
  //    limits arrive as literal strings -- CitizenMedicineService does a
  //    strict === 'false' / string-aware check on them.
  const form = new FormData()
  form.append('citizen_uuid', CITIZEN_UUID)
  form.append('medicine_uuid', medicineUuid)
  form.append('dosage_uuid', dosageUuid)
  form.append('is_pn_medicine', 'true')
  form.append('max_dose_per_administration', '2')
  form.append('max_daily_dose', '6')
  form.append('strength', '1')
  form.append('ingredients', 'E2E test ingredient')
  form.append('description', 'Created by tests/e2e/medicine-pn-dose-validation.mjs — safe to delete.')

  const createRes = await apiForm('/citizen-medicines', form)
  createdUuid = createRes.json?.data?.uuid ?? createRes.json?.uuid ?? null
  ok('Test PN citizen medicine created via API', createRes.status >= 200 && createRes.status < 300 && !!createdUuid)
  if (!createdUuid) throw new Error(`Create failed: ${createRes.status} ${JSON.stringify(createRes.json)}`)

  // 3) Auth, then the same cold-boot-safe navigation as the other medicine
  //    e2e scripts: a direct deep-link to /medicine-journals bounces to
  //    /timeline before the citizen store hydrates.
  await page.goto(`${BASE}/settings/profile`, { waitUntil: 'domcontentloaded' })
  await page.evaluate((t) => localStorage.setItem('_token', t), TOKEN)
  await page.goto(`${BASE}/citizens/${CITIZEN_UUID}/timeline`, { waitUntil: 'domcontentloaded' })
  await page.locator('a,button', { hasText: /Medicinkort|Medicine card/ }).first().click()
  await page.waitForURL(/\/medicine-journals$/)

  const row = page.locator(`[data-uuid="${createdUuid}"]`).first()
  await row.waitFor()

  const confirmationMessage = page.locator('text=/exceeds the maximum/i')

  // 4) Core regression proof: a dose well under both limits must save
  //    directly, with no "did you enter the right dose?" dialog at all.
  const [saveResponse] = await Promise.all([
    page.waitForResponse((r) =>
      r.url().includes('/citizen-medicine-histories') &&
      !r.url().includes('/save/all') &&
      r.request().method() === 'POST'
    ),
    openGivePnAndEnterDose('1'),
  ])
  ok('A normal PN dose (1, under both limits) saves directly', saveResponse.status() >= 200 && saveResponse.status() < 300)
  ok('No dose-limit confirmation dialog appeared for the normal dose', !(await confirmationMessage.isVisible().catch(() => false)))

  await page.screenshot({ path: path.join(SHOT, 'medicine-pn-dose-01-normal-dose-no-dialog.png'), fullPage: true }).catch(() => {})

  // 5) A dose over max_dose_per_administration (2) DOES raise the
  //    confirmation, and it names the real numbers -- not the old numberless
  //    generic message.
  await openGivePnAndEnterDose('5')
  await confirmationMessage.waitFor({ timeout: 5000 })
  const messageText = await confirmationMessage.innerText()
  ok('The exceeded-limit dialog appeared for an over-limit dose', true)
  ok(`The dialog names the entered dose and the limit (got "${messageText}")`, messageText.includes('5') && messageText.includes('2'))

  await page.screenshot({ path: path.join(SHOT, 'medicine-pn-dose-02-exceeded-limit-dialog.png'), fullPage: true }).catch(() => {})

  const saveResponsePredicate = (r) =>
    r.url().includes('/citizen-medicine-histories') &&
    !r.url().includes('/save/all') &&
    r.request().method() === 'POST'

  const [firstConfirmResponse] = await Promise.all([
    page.waitForResponse(saveResponsePredicate),
    page.locator('button', { hasText: 'Confirm' }).click(),
  ])
  let finalJson = await firstConfirmResponse.json().catch(() => null)

  // A 2xx here can still be a non-save: the real backend 4-hour PN interval
  // warning (PN_MINIMUM_INTERVAL_MINUTES) returns 200 with `warning: true`
  // instead of persisting, and stacks its own DialogConfirmation behind this
  // one -- exactly the two-dialogs-in-a-row alarm-fatigue scenario from
  // AW-2026-3581. Since this test fires two PN doses seconds apart, expect to
  // hit it here and confirm it too before treating the save as real.
  if (finalJson?.warning) {
    ok('The real backend PN-interval warning stacked behind the dose-limit dialog, as expected', true)
    const [secondConfirmResponse] = await Promise.all([
      page.waitForResponse(saveResponsePredicate),
      page.locator('button', { hasText: 'Confirm' }).click(),
    ])
    finalJson = await secondConfirmResponse.json().catch(() => null)
  }
  ok('Confirming through both dialogs actually persists the dose (no warning on the final response)', !finalJson?.warning)

  // A successful save closes the modal (see modal-new.vue's success branch),
  // but the HeadlessUI close transition can briefly leave its portal
  // intercepting clicks underneath -- give it a moment before the next open.
  await page.waitForTimeout(500)

  // 6) A non-numeric dose is blocked inline -- no submit request at all, no
  //    confirmation dialog either.
  let nonNumericSubmitFired = false
  const watchSubmit = (r) => {
    if (r.url().includes('/citizen-medicine-histories') && !r.url().includes('/save/all') && r.request().method() === 'POST') {
      nonNumericSubmitFired = true
    }
  }
  page.on('response', watchSubmit)
  await openGivePnAndEnterDose('en halv')
  await page.waitForTimeout(1500)
  page.off('response', watchSubmit)
  ok('A non-numeric PN dose is rejected inline (no save request fired)', !nonNumericSubmitFired)
  ok('A non-numeric PN dose does not raise the confirmation dialog either', !(await confirmationMessage.isVisible().catch(() => false)))

  await page.screenshot({ path: path.join(SHOT, 'medicine-pn-dose-03-non-numeric-blocked.png'), fullPage: true }).catch(() => {})

  // Close whatever's left of the still-open "Give PN" modal before moving on.
  await page.keyboard.press('Escape').catch(() => {})

  // 7) "Select all" must not sweep the PN row in -- it stays individually
  //    selectable, but the toggle should not touch it.
  await page.locator('button', { hasText: /Select all|Vælg alle/ }).click()
  const pnCheckbox = page.locator(`#pn_${createdUuid}`)
  ok('The PN row stays unchecked after "select all"', !(await pnCheckbox.isChecked().catch(() => true)))

  ok('No unexpected console errors during the run',
    consoleErrors.filter((e) => !e.includes('Obiyen script tag not found')).length === 0)
} catch (err) {
  console.error('❌ Uncaught error:', err)
  if (consoleErrors.length) console.log('Console errors captured before failure:', consoleErrors)
  await page.screenshot({ path: path.join(SHOT, 'medicine-pn-dose-FAILURE.png'), fullPage: true }).catch(() => {})
  results.push(false)
} finally {
  if (createdUuid) {
    const historiesRes = await api('GET', `/citizen-medicine-histories?medicine_uuid=${createdUuid}`).catch(() => ({ json: null }))
    const historyRows = historiesRes?.json?.data ?? []
    for (const h of historyRows) {
      if (h?.uuid) await api('DELETE', `/citizen-medicine-histories/${h.uuid}`).catch(() => {})
    }
    const del = await api('DELETE', `/citizen-medicines/${createdUuid}`)
    ok('Cleanup: test citizen_medicine (and any history rows) deleted', del.status >= 200 && del.status < 300)
  }
  await browser.close()
}

const passed = results.filter(Boolean).length
console.log(`\n${passed}/${results.length} checks passed.`)
process.exit(results.every(Boolean) ? 0 : 1)
