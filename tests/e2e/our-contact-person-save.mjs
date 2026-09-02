/**
 * Browser E2E for AW-2026-3581 (2d): saving the responsible healthcare provider
 * on a citizen's illness/functional-impairment record.
 *
 * Before the fix, components/modules/user/citizen/nursing-areas/illness-functional-impairment/form.vue
 * defaulted every new record to "contact-person" mode (a dropdown of the citizen's
 * `our_contact_person` contacts) whenever the free-text field was empty, and that
 * dropdown was a hard-required vuelidate field. A citizen with no assigned employees
 * has zero rows in that dropdown -- title = 'our_contact_person' contacts only ever
 * get written as a side effect of assigning an employee -- so the form opened
 * unsavable with no visible error: vuelidate blocked the submit before any request
 * went out. See composables/illnessHealthcareProvider.ts and
 * tests/unit/illnessHealthcareProvider.test.mjs for the pure-logic coverage of the
 * fix; this script proves the real form behaves correctly end to end.
 *
 * Uses page.route() to stub the /citizen-contact-persons/all/list response for the
 * empty-list and label-fallback passes, so those are deterministic regardless of
 * which employees are actually assigned to CO_CITIZEN_UUID on the day this runs.
 * The "real contact" pass removes the stub and drives the real backend.
 *
 * Covers:
 *   A) Empty contact list -> new record opens in free-text mode, the checkbox is
 *      disabled with an explanation, forcing a click on it does nothing, and the
 *      record saves. Reopening it via edit shows free-text mode with the text
 *      still there (not contact-person mode).
 *   B) A contact row named only on its linked employee renders the employee's
 *      name in the picker; a row named nowhere is not rendered as a blank option.
 *   C) A real employee assigned to the citizen (via the API, self-restoring)
 *      appears in the picker by name; selecting and saving it, then reopening
 *      the record, shows the same person still selected in contact-person mode.
 *   D) An existing record with neither provider field set (created directly via
 *      the API, since the UI itself cannot produce one) opens in free-text mode
 *      and is savable, rather than reopening trapped in contact-person mode.
 *
 * Self-restoring: deletes every illness/functional-impairment record it creates,
 * and the citizen_contacts row from pass C only if this run created it.
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
const RUN_ID = Date.now()
const TODAY_ISO = new Date().toISOString().slice(0, 10)

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

// Locale-agnostic text across dk/en/no/sv (this shared dev account's UI
// language can be switched between runs).
const SECTION_HEADER = /Illness and functional impairment|Sygdom og funktionelle nedsættelser|Sykdom og funksjonelle nedsettelser|Sjukdom och funktionelle nedsättningar/
const NEW_BUTTON = /^(New illness and functional impairment|Ny sygdom og funktionelle nedsættelser|Ny sykdom og funksjonelle nedsettelser|Ny sjukdom och funktionelle nedsättningar)$/
const SAVE_BUTTON = /^(Save|Gem|Lagre|Spara)$/
const UPDATE_BUTTON = /^(Update|Opdater|Oppdater|Uppdatera)$/
const CARD_SELECTOR = 'div.bg-white.ring-1.ring-gray-200.rounded-md.p-5.border-l-4.border-secondary'
// The wrapping div around the checkbox always carries aria-disabled (true or
// false); the explanation paragraph, when present, is its very next sibling.
const CHECKBOX_ROW = 'div[aria-disabled]'
const CHECKBOX_UNAVAILABLE_EXPLANATION = 'div[aria-disabled="true"] + p'

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage()
page.setDefaultTimeout(20000)
const consoleErrors = []
page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
page.on('pageerror', (err) => consoleErrors.push('pageerror: ' + err.message))

// null = pass the request through to the real backend. Otherwise fulfilled
// directly, so the empty-list and label-fallback passes are deterministic no
// matter which employees are actually assigned to CO_CITIZEN_UUID today.
let contactStub = null
await page.route(/\/citizen-contact-persons\/all\/list/, (route) => {
  if (contactStub === null) return route.continue()
  return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(contactStub) })
})

async function authenticate() {
  await page.goto(`${BASE}/citizens`, { waitUntil: 'domcontentloaded' })
  await page.evaluate((t) => localStorage.setItem('_token', t), TOKEN)
}

async function openNursingAreasAndExpandIllness() {
  await page.goto(`${BASE}/citizens/${CITIZEN_UUID}/nursing-areas`, { waitUntil: 'domcontentloaded' })
  await page.getByText(SECTION_HEADER).first().click()
}

async function openNewIllnessModal() {
  await openNursingAreasAndExpandIllness()
  await page.getByRole('button', { name: NEW_BUTTON }).first().click()
  await page.locator('#date').waitFor()
  await page.waitForResponse((r) => r.url().includes('/citizen-contact-persons/all/list'))
}

// Opens the edit modal for the single record card whose visible text
// contains `distinctiveText` (a RUN_ID-tagged description, so it can't
// collide with any pre-existing record on this citizen).
async function openEditModalFor(distinctiveText) {
  await openNursingAreasAndExpandIllness()
  const card = page.locator(CARD_SELECTOR).filter({ hasText: distinctiveText }).first()
  await card.locator('button').first().click()
  await page.locator('#date').waitFor()
  await page.waitForResponse((r) => r.url().includes('/citizen-contact-persons/all/list'))
}

async function fillDateToday() {
  await page.locator('#date').click()
  await page.locator('.flatpickr-day.today').click()
}

async function fillDescription(text) {
  await page.locator('.ck-editor__editable').first().click()
  await page.keyboard.type(text)
}

const createdIllnessUuids = []
let assignedContactUuid = null   // set only if THIS run created the citizen_contacts row
let adminUuid = null
let adminFullName = null

try {
  await authenticate()

  // ---------------------------------------------------------------------
  // A) Empty contact list: free-text default, disabled+explained checkbox,
  //    savable, and reopening it stays in free-text mode.
  // ---------------------------------------------------------------------
  contactStub = { data: [] }
  await openNewIllnessModal()
  await page.screenshot({ path: `${SHOT}/our-contact-person-01-empty-list.png`, fullPage: true })

  ok('A: new record opens in free-text mode (text field visible)', await page.locator('#healthcare_provider').isVisible())
  ok('A: contact-person dropdown is not shown', await page.locator('#our_contact_person_uuid, form .multiselect').count() === 0)

  const checkboxRowA = page.locator(CHECKBOX_ROW).first()
  ok('A: checkbox row is marked unavailable', (await checkboxRowA.getAttribute('aria-disabled')) === 'true')
  const explanationA = page.locator(CHECKBOX_UNAVAILABLE_EXPLANATION).first()
  ok('A: an explanation is shown for why the picker is unavailable', ((await explanationA.innerText().catch(() => '')) || '').trim().length > 0)

  await checkboxRowA.click({ force: true })
  ok('A: forcing a click on the disabled checkbox does not switch modes', await page.locator('#healthcare_provider').isVisible())

  const descriptionA = `E2E illness note, empty contact list ${RUN_ID}`
  await fillDateToday()
  await fillDescription(descriptionA)
  await page.locator('#healthcare_provider').fill('Dr. E2E Provider')

  const [createResA] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/illness-functional-impairment') && r.request().method() === 'POST'),
    page.getByRole('button', { name: SAVE_BUTTON }).click(),
  ])
  ok('A: save succeeds (2xx) from free-text mode with an empty contact list', createResA.status() >= 200 && createResA.status() < 300)
  const createJsonA = await createResA.json().catch(() => null)
  if (createJsonA?.data?.uuid) createdIllnessUuids.push(createJsonA.data.uuid)
  ok('A: the saved record carries the typed healthcare_provider text', createJsonA?.data?.healthcare_provider === 'Dr. E2E Provider')

  // Reopen it: must still be free-text, with the text present, not a
  // contact-person picker with nothing selected.
  await openEditModalFor(descriptionA)
  await page.screenshot({ path: `${SHOT}/our-contact-person-02-reopened-free-text.png`, fullPage: true })
  ok('A: reopening the saved record shows free-text mode, not contact-person mode', await page.locator('#healthcare_provider').isVisible())
  ok('A: the free text is still there', (await page.locator('#healthcare_provider').inputValue()) === 'Dr. E2E Provider')
  await page.getByRole('button', { name: /^(Cancel|Annuller|Avbryt)$/ }).click()

  // ---------------------------------------------------------------------
  // B) Label fallback: a row named only on its employee renders that name;
  //    a row named nowhere is skipped rather than rendered blank.
  // ---------------------------------------------------------------------
  contactStub = {
    data: [
      { uuid: 'e2e-fallback-employee-name', firstname: null, lastname: null, employee: { firstname: 'Employee', lastname: 'Fallback' } },
      { uuid: 'e2e-fallback-no-name', firstname: null, lastname: null, employee: null },
    ],
  }
  await openNewIllnessModal()

  const checkboxRowB = page.locator(CHECKBOX_ROW).first()
  ok('B: checkbox is enabled once the picker has options', (await checkboxRowB.getAttribute('aria-disabled')) === 'false')
  await checkboxRowB.click()
  ok('B: opting in reveals the contact-person dropdown', await page.locator('form .multiselect').first().isVisible())

  await page.locator('form .multiselect').first().click()
  await page.waitForTimeout(500)
  const optionTexts = (await page.locator('form .multiselect-option').allInnerTexts()).map((t) => t.trim())
  await page.screenshot({ path: `${SHOT}/our-contact-person-03-label-fallback.png`, fullPage: true })
  ok('B: a contact row with no own name falls back to the employee\'s name', optionTexts.includes('Employee Fallback'))
  ok('B: a row with no name anywhere is not rendered as a blank option', optionTexts.every((t) => t.length > 0) && optionTexts.length === 1)

  // ---------------------------------------------------------------------
  // C) A real employee assigned to the citizen appears in the picker by
  //    name; selecting and saving it links the record, and reopening it
  //    shows the same person still selected in contact-person mode.
  // ---------------------------------------------------------------------
  const meRes = await api('GET', '', null)
  adminUuid = meRes.json?.data?.uuid
  adminFullName = `${meRes.json?.data?.firstname || ''} ${meRes.json?.data?.lastname || ''}`.trim()
  if (!adminUuid || !adminFullName) throw new Error('Could not read the current user\'s uuid/name from /api/user')

  const existingContactsRes = await api('GET', `/citizen-contact-persons/all/list?citizen_uuid=${CITIZEN_UUID}`, null)
  const alreadyAssigned = (existingContactsRes.json?.data || []).some((c) => c?.employee?.uuid === adminUuid || c?.user_id === meRes.json?.data?.id)

  if (!alreadyAssigned) {
    const assignRes = await api('PUT', `/employees/${adminUuid}/assign/citizen`, { citizen_uuid: CITIZEN_UUID })
    ok('C: setup - assigning the current user as an employee of the citizen succeeds', assignRes.status >= 200 && assignRes.status < 300)
  } else {
    ok('C: setup - the current user is already an assigned contact for this citizen', true)
  }

  const contactsAfterAssignRes = await api('GET', `/citizen-contact-persons/all/list?citizen_uuid=${CITIZEN_UUID}`, null)
  const adminContact = (contactsAfterAssignRes.json?.data || []).find((c) => c?.employee?.uuid === adminUuid || c?.user_id === meRes.json?.data?.id)
  ok('C: the current user now appears as an our_contact_person contact', !!adminContact?.uuid)
  if (!alreadyAssigned) assignedContactUuid = adminContact?.uuid ?? null

  contactStub = null // real network from here on
  await openNewIllnessModal()

  const checkboxRowC = page.locator(CHECKBOX_ROW).first()
  ok('C: checkbox is enabled with a real assigned contact available', (await checkboxRowC.getAttribute('aria-disabled')) === 'false')
  await checkboxRowC.click()
  await page.locator('form .multiselect').first().click()
  await page.waitForTimeout(500)
  await page.locator('form .multiselect-option:visible', { hasText: adminFullName }).first().click()
  await page.waitForTimeout(300)
  const selectedLabel = (await page.locator('form .multiselect').first().innerText()).trim()
  ok('C: the real contact is selectable by name', selectedLabel.includes(adminFullName))

  const descriptionC = `E2E illness note, real contact ${RUN_ID}`
  await fillDateToday()
  await fillDescription(descriptionC)
  await page.screenshot({ path: `${SHOT}/our-contact-person-04-real-contact-selected.png`, fullPage: true })

  const [createResC] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/illness-functional-impairment') && r.request().method() === 'POST'),
    page.getByRole('button', { name: SAVE_BUTTON }).click(),
  ])
  ok('C: save succeeds (2xx) with a real contact-person selection', createResC.status() >= 200 && createResC.status() < 300)
  const createJsonC = await createResC.json().catch(() => null)
  if (createJsonC?.data?.uuid) createdIllnessUuids.push(createJsonC.data.uuid)

  await openEditModalFor(descriptionC)
  await page.screenshot({ path: `${SHOT}/our-contact-person-05-reopened-contact-mode.png`, fullPage: true })
  ok('C: reopening the record shows contact-person mode (not free text)', await page.locator('form .multiselect').first().isVisible())
  const reopenedLabel = (await page.locator('form .multiselect').first().innerText()).trim()
  ok('C: the same person is still selected after reopening', reopenedLabel.includes(adminFullName))
  await page.getByRole('button', { name: /^(Cancel|Annuller|Avbryt)$/ }).click()

  // ---------------------------------------------------------------------
  // D) A record with neither provider field set (only reachable by calling
  //    the API directly -- the UI form itself always requires one) opens in
  //    free-text mode and is savable, not trapped in contact-person mode.
  // ---------------------------------------------------------------------
  const descriptionD = `E2E illness note, neither field set ${RUN_ID}`
  const neitherFieldRes = await api('POST', '/illness-functional-impairment', {
    citizen_uuid: CITIZEN_UUID,
    date: TODAY_ISO,
    illness_functional_impairment: descriptionD,
  })
  ok('D: setup - a record with neither provider field saves via the raw API', neitherFieldRes.status >= 200 && neitherFieldRes.status < 300)
  if (neitherFieldRes.json?.data?.uuid) createdIllnessUuids.push(neitherFieldRes.json.data.uuid)

  contactStub = null
  await openEditModalFor(descriptionD)
  ok('D: a record with neither field set opens in free-text mode', await page.locator('#healthcare_provider').isVisible())

  await page.locator('#healthcare_provider').fill('Dr. E2E Backfilled')
  const [updateResD] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/illness-functional-impairment/') && r.request().method() === 'PUT'),
    page.getByRole('button', { name: UPDATE_BUTTON }).click(),
  ])
  ok('D: that record is savable once opened (2xx)', updateResD.status() >= 200 && updateResD.status() < 300)

  const realConsoleErrors = consoleErrors.filter((e) => !e.includes('Obiyen script tag'))
  ok('No console errors during the run', realConsoleErrors.length === 0)
  if (realConsoleErrors.length) console.log('  console errors:', realConsoleErrors.slice(0, 5))
} catch (e) {
  ok('Unexpected error: ' + e.message, false)
  if (consoleErrors.length) console.log('console errors:\n' + consoleErrors.join('\n'))
  await page.screenshot({ path: `${SHOT}/our-contact-person-99-error.png`, fullPage: true }).catch(() => {})
} finally {
  for (const uuid of createdIllnessUuids) {
    const del = await api('DELETE', `/illness-functional-impairment/${uuid}`)
    console.log(del.status >= 200 && del.status < 300 ? `↩︎  cleaned up illness record ${uuid}` : `⚠️  cleanup failed for illness record ${uuid} (status ${del.status})`)
  }
  if (assignedContactUuid) {
    const del = await api('DELETE', `/citizen-contacts/${assignedContactUuid}`)
    console.log(del.status >= 200 && del.status < 300 ? '↩︎  cleaned up the assigned contact' : `⚠️  contact cleanup failed (status ${del.status})`)
  }
  await browser.close()
}

const passed = results.filter(Boolean).length
console.log(`\n=== ${passed}/${results.length} PASS ===`)
process.exit(passed === results.length ? 0 : 1)
