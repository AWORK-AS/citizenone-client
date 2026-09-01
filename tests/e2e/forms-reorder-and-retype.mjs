/**
 * Browser E2E for the form-builder field-order fix + drag-and-drop reordering
 * + in-place field type switching.
 *
 * Covers the Birketoften ApS bug report: reordering fields and changing a
 * field's type used to save the changed field at the very bottom of the form
 * regardless of where it was left before saving. Root cause was twofold:
 * `form_fields` had no persisted order column - order was implicit DB
 * insertion order, so a freshly re-created row always sorted last (fixed by
 * adding `sort_order`, derived from each field's position in the submitted
 * array on every save) - and changing a field's type meant delete the old
 * field + add a new one, which always appended at the end and, being a new
 * row, dropped any citizen answers already saved against the old one. That
 * second half is now a proper in-place type switch (a dropdown next to the
 * drag handle) that mutates `field.type` and keeps the field's `uuid`. This
 * test also exercises the drag-and-drop reordering (a grip-icon handle, the
 * only draggable element on the page) added alongside the pre-existing
 * Up/Down buttons.
 *
 * Four scenarios, each saving and then reloading the page (a hard
 * navigation, not just re-reading in-memory state) so a regression to
 * "order isn't actually persisted" can't hide behind the client's own optimistic
 * array order:
 *   1) Pure drag-and-drop reorder of existing fields (no type change).
 *   2) The originally reported bug scenario: delete a field, add a
 *      different-typed field (which always lands at the end), drag it back
 *      into place, save.
 *   3) Regression guard: the pre-existing Up/Down buttons still work.
 *   4) The in-place type switch: converting a text field to a textarea via
 *      the dropdown must keep its title, its position, and - checked via the
 *      raw API, not just the DOM - the field row's uuid, so any response
 *      already saved against it isn't orphaned.
 *
 * Order is asserted two ways: from the DOM after a fresh page load, and
 * independently via a raw API GET of the form - the latter is the real
 * regression-proof check, since the DOM would just show whatever the client
 * last rendered even if the server silently dropped the order.
 *
 * Setup/cleanup use the real API directly (create the form before, delete it
 * after) so the test is self-restoring and can be re-run safely.
 *
 * Run:  see tests/e2e/README.md
 * Env:  CO_TOKEN (required), CO_BASE_URL (default http://localhost:3000),
 *       CO_API_URL (default http://127.0.0.1:8000)
 */
import { chromium } from 'playwright-core'
import { fileURLToPath } from 'url'
import path from 'path'

const TOKEN = process.env.CO_TOKEN
const BASE = process.env.CO_BASE_URL || 'http://localhost:3000'
const API = process.env.CO_API_URL || 'http://127.0.0.1:8000'
const SHOT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'screenshots')

if (!TOKEN) {
  console.error('Missing CO_TOKEN. See tests/e2e/README.md.')
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

const UPDATE = /^(Update|Opdater)$/
// Not anchored, unlike UPDATE above: this button's label sits alongside an
// icon inside a nested div, and Playwright's hasText regex tests against the
// untrimmed textContent of the whole subtree (icon + raw template whitespace),
// not the rendered/collapsed innerText - an anchored ^...$ never matches it.
const TEXTAREA_BUTTON = /Textarea|Tekstområde/i

// The title input shares its `name` with a second, disabled preview input
// (the fake "your answer here" box) for textfield-type fields - :not([disabled])
// excludes that duplicate. Textarea-type fields don't need the same guard
// (their preview duplicate is a <textarea>, not an <input>) but it's harmless
// to include uniformly.
const TITLE_SEL = 'input[name^="text_field_"]:not([disabled]), input[name^="textarea_"]:not([disabled])'

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage()
// Tall enough that every field row in this test is on-screen at once, with no
// mid-drag scrolling required - raw page.mouse coordinates are viewport-relative,
// and a drag held over a scroll boundary (e.g. via locator.dragTo() on a normal
// 720px viewport) never actually reaches the target: the mousedown/mousemove
// land below the fold where nothing is rendered, so no dragstart fires at all.
await page.setViewportSize({ width: 1280, height: 2600 })
page.setDefaultTimeout(20000)
const consoleErrors = []
page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
page.on('pageerror', (err) => consoleErrors.push('pageerror: ' + err.message))

const seenResponses = []
page.on('response', (r) => { seenResponses.push({ url: r.url(), method: r.request().method(), status: r.status() }) })

async function waitForMatchingResponse(predicate, timeoutMs = 15000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const match = seenResponses.find(predicate)
    if (match) return match
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
  return null
}

async function authAs(token) {
  await page.goto(`${BASE}/settings/profile`, { waitUntil: 'domcontentloaded' })
  await page.evaluate((t) => localStorage.setItem('_token', t), token)
}

async function gotoEdit() {
  await page.goto(`${BASE}/forms/${formUuid}/edit`, { waitUntil: 'domcontentloaded' })
  await page.locator(TITLE_SEL).first().waitFor({ timeout: 20000 })
}

async function fieldTitles() {
  const inputs = await page.locator(TITLE_SEL).all()
  return Promise.all(inputs.map((i) => i.inputValue()))
}

// Every field row lives in a `bg-gray-100 ...` wrapper (the drag handle's
// grandparent) - climbing to it from the title input gives a stable scope to
// find that specific field's own buttons/handle, without depending on how
// deeply nested the title input happens to be inside its type's markup.
async function rowByTitle(title) {
  const titles = await fieldTitles()
  const index = titles.indexOf(title)
  if (index === -1) throw new Error(`Field titled "${title}" not found on page (have: ${titles.join(', ')})`)
  return page.locator(TITLE_SEL).nth(index).locator('xpath=ancestor::div[contains(@class, "bg-gray-100")][1]')
}

// locator.dragTo() drives this through raw mousedown/mousemove/mouseup steps
// rather than CDP-level drag interception, so it's done by hand here for more
// control over the step count/timing that turned out to matter for Chromium
// to actually recognize a native HTML5 drag session on this element (a single
// jump from source to target, or too few intermediate steps, never fired
// dragstart in testing - Chromium needs to see the pointer actually move a
// few times while held down before it starts a drag).
async function dragField(fromTitle, ontoTitle) {
  const fromHandle = (await rowByTitle(fromTitle)).locator('[draggable="true"]')
  const ontoHandle = (await rowByTitle(ontoTitle)).locator('[draggable="true"]')
  const fromBox = await fromHandle.boundingBox()
  const toBox = await ontoHandle.boundingBox()

  await page.mouse.move(fromBox.x + fromBox.width / 2, fromBox.y + fromBox.height / 2)
  await page.mouse.down()
  await page.waitForTimeout(100)
  const steps = 10
  for (let i = 1; i <= steps; i++) {
    const x = fromBox.x + fromBox.width / 2 + (toBox.x - fromBox.x) * (i / steps)
    const y = fromBox.y + fromBox.height / 2 + (toBox.y - fromBox.y) * (i / steps)
    await page.mouse.move(x, y)
    await page.waitForTimeout(30)
  }
  await page.waitForTimeout(100)
  await page.mouse.up()
  await page.waitForTimeout(300)
}

async function deleteField(title) {
  // Button order within a field's action row is fixed: Up, Down, Duplicate,
  // Trash (the trash button has no accessible name of its own to select by).
  await (await rowByTitle(title)).locator('button').nth(3).click()
}

async function moveFieldUp(title) {
  await (await rowByTitle(title)).locator('button').nth(0).click()
}

async function saveAndReload(expectedFieldCount) {
  const [putResponse] = await Promise.all([
    waitForMatchingResponse((r) => r.url.endsWith(`/forms/${formUuid}`) && r.method === 'PUT'),
    page.locator('button[type="submit"]', { hasText: UPDATE }).click(),
  ])
  const saveOk = !!putResponse && putResponse.status >= 200 && putResponse.status < 300
  ok('Save PUT succeeds (2xx)', saveOk)
  if (!saveOk) console.log('  no matching 2xx PUT seen, network log for /forms:', JSON.stringify(seenResponses.filter((r) => r.url.includes('/forms')), null, 1))

  // updateForm() redirects to /forms on success - navigate straight back to a
  // fresh copy of the edit page rather than trusting whatever's left in memory.
  await gotoEdit()
  const titles = await fieldTitles()
  ok(`Reloaded page shows ${expectedFieldCount} fields`, titles.length === expectedFieldCount)
  return titles
}

async function fetchFormFieldsFromApi() {
  const res = await api('GET', `/forms/${formUuid}`)
  return (res.json?.data?.form_fields || []).map((f) => JSON.parse(f.field))
}

// Same as fetchFormFieldsFromApi, but keeps each row's own uuid alongside its
// parsed field data - needed to prove an in-place type switch reused the
// existing backend row instead of creating a new one.
async function fetchFormFieldRowsFromApi() {
  const res = await api('GET', `/forms/${formUuid}`)
  return (res.json?.data?.form_fields || []).map((f) => ({ uuid: f.uuid, ...JSON.parse(f.field) }))
}

// The field-type dropdown is a @vueform/multiselect (see selectFormAndFolder
// in create-report-permission.mjs for the same pattern): open it by the
// select's own id, then click the option by its value-keyed id. The select's
// id is keyed by the field's current DOM index, so it's resolved by title
// right before use rather than cached, in case an earlier step moved it.
async function switchFieldType(title, toType) {
  const titles = await fieldTitles()
  const index = titles.indexOf(title)
  if (index === -1) throw new Error(`Field titled "${title}" not found for a type switch (have: ${titles.join(', ')})`)
  await page.locator(`#field_type_${index}`).click()
  await page.locator(`#field_type_${index}-multiselect-option-${toType}`).click()
}

let formUuid = null

try {
  // 1) Setup: a throwaway form with four plain text fields, distinctly
  // titled so DOM order can be read straight off their title inputs.
  const formRes = await api('POST', '/forms', {
    title: `E2E Forms Reorder ${Date.now()}`,
    description: 'Form for the forms-reorder-and-retype E2E test.',
    is_active: true,
    fields: [
      { type: 'textfield', value: 'Field A', required: false },
      { type: 'textfield', value: 'Field B', required: false },
      { type: 'textfield', value: 'Field C', required: false },
      { type: 'textfield', value: 'Field D', required: false },
    ],
  })
  ok('Fixture form created via API with 4 fields', formRes.status >= 200 && formRes.status < 300 && !!formRes.json?.data?.uuid)
  formUuid = formRes.json?.data?.uuid

  await authAs(TOKEN)
  await gotoEdit()
  ok('Form builder loads with the 4 seeded fields in the expected order',
    JSON.stringify(await fieldTitles()) === JSON.stringify(['Field A', 'Field B', 'Field C', 'Field D']))
  await page.screenshot({ path: `${SHOT}/forms-reorder-01-initial.png`, fullPage: true })

  // 2) Scenario 1 - pure drag-and-drop reorder, no type change: drag D onto
  // A's handle, which the app's splice-based drop handler places right
  // before A -> [D, A, B, C].
  await dragField('Field D', 'Field A')
  const afterDrag = await fieldTitles()
  ok('DOM reflects the drag immediately (before saving)', JSON.stringify(afterDrag) === JSON.stringify(['Field D', 'Field A', 'Field B', 'Field C']))
  await page.screenshot({ path: `${SHOT}/forms-reorder-02-dragged.png`, fullPage: true })

  const titlesAfterScenario1 = await saveAndReload(4)
  ok('Drag-and-drop order persisted after save + reload (DOM)', JSON.stringify(titlesAfterScenario1) === JSON.stringify(['Field D', 'Field A', 'Field B', 'Field C']))
  const apiFieldsAfterScenario1 = await fetchFormFieldsFromApi()
  ok('Drag-and-drop order persisted server-side (raw API)', JSON.stringify(apiFieldsAfterScenario1.map((f) => f.value)) === JSON.stringify(['Field D', 'Field A', 'Field B', 'Field C']))

  // 3) Scenario 2 - the reported bug: delete a field, add a different-typed
  // replacement (always lands at the end), drag it back into place, save.
  // Current order is [D, A, B, C]; delete B, so a textarea "Field E" can be
  // dragged back to sit where B used to be.
  await deleteField('Field B')
  ok('Field removed from the DOM', JSON.stringify(await fieldTitles()) === JSON.stringify(['Field D', 'Field A', 'Field C']))

  await page.locator('button', { hasText: TEXTAREA_BUTTON }).first().click()
  const newFieldTitle = page.locator(TITLE_SEL).last()
  await newFieldTitle.fill('Field E (was text)')
  ok('New textarea field appended at the end with its own title', JSON.stringify(await fieldTitles()) === JSON.stringify(['Field D', 'Field A', 'Field C', 'Field E (was text)']))
  await page.screenshot({ path: `${SHOT}/forms-reorder-03-added-textarea.png`, fullPage: true })

  await dragField('Field E (was text)', 'Field C')
  const afterRetypeDrag = await fieldTitles()
  ok('Retyped field dragged into place before saving (DOM)', JSON.stringify(afterRetypeDrag) === JSON.stringify(['Field D', 'Field A', 'Field E (was text)', 'Field C']))
  await page.screenshot({ path: `${SHOT}/forms-reorder-04-retyped-dragged.png`, fullPage: true })

  const titlesAfterScenario2 = await saveAndReload(4)
  ok('Retyped field kept its dragged-to position after save + reload, instead of jumping to the bottom (DOM)',
    JSON.stringify(titlesAfterScenario2) === JSON.stringify(['Field D', 'Field A', 'Field E (was text)', 'Field C']))
  const apiFieldsAfterScenario2 = await fetchFormFieldsFromApi()
  ok('Retyped field kept its position server-side (raw API) - this is the actual bug fix',
    JSON.stringify(apiFieldsAfterScenario2.map((f) => f.value)) === JSON.stringify(['Field D', 'Field A', 'Field E (was text)', 'Field C']))
  ok('Retyped field is really saved as a textarea, not a textfield', apiFieldsAfterScenario2[2]?.type === 'textarea')
  await page.screenshot({ path: `${SHOT}/forms-reorder-05-scenario2-reloaded.png`, fullPage: true })

  // 4) Scenario 3 - regression guard: the pre-existing Up/Down buttons still
  // work now that fields carry a persisted sort_order. Current order is
  // [D, A, E, C]; move the last field (C) up one -> [D, A, C, E].
  await moveFieldUp('Field C')
  ok('Move-up button reorders in the DOM', JSON.stringify(await fieldTitles()) === JSON.stringify(['Field D', 'Field A', 'Field C', 'Field E (was text)']))

  const titlesAfterScenario3 = await saveAndReload(4)
  ok('Up-button reorder persisted after save + reload (DOM)', JSON.stringify(titlesAfterScenario3) === JSON.stringify(['Field D', 'Field A', 'Field C', 'Field E (was text)']))
  const apiFieldsAfterScenario3 = await fetchFormFieldsFromApi()
  ok('Up-button reorder persisted server-side (raw API)', JSON.stringify(apiFieldsAfterScenario3.map((f) => f.value)) === JSON.stringify(['Field D', 'Field A', 'Field C', 'Field E (was text)']))
  await page.screenshot({ path: `${SHOT}/forms-reorder-06-scenario3-reloaded.png`, fullPage: true })

  // 5) Scenario 4 - the client's actual ask: switch a text field to a
  // textarea in place, via the type dropdown, rather than delete + re-add.
  // Current order is [D, A, C, E]; retype Field A.
  const apiFieldsBeforeRetype = await fetchFormFieldRowsFromApi()
  const fieldABefore = apiFieldsBeforeRetype.find((f) => f.value === 'Field A')
  ok('Field A has a uuid before the in-place type switch', !!fieldABefore?.uuid)
  ok('Field A starts as a textfield', fieldABefore?.type === 'textfield')

  await switchFieldType('Field A', 'textarea')
  ok('In-place type switch keeps every field\'s title and position in the DOM',
    JSON.stringify(await fieldTitles()) === JSON.stringify(['Field D', 'Field A', 'Field C', 'Field E (was text)']))
  await page.screenshot({ path: `${SHOT}/forms-reorder-07-inplace-retyped.png`, fullPage: true })

  const titlesAfterScenario4 = await saveAndReload(4)
  ok('In-place retype persisted after save + reload, still in position (DOM)',
    JSON.stringify(titlesAfterScenario4) === JSON.stringify(['Field D', 'Field A', 'Field C', 'Field E (was text)']))

  const apiFieldsAfterRetype = await fetchFormFieldRowsFromApi()
  const fieldAAfter = apiFieldsAfterRetype.find((f) => f.value === 'Field A')
  ok('In-place retype reused the same field row (uuid unchanged) - a saved answer would not be orphaned',
    !!fieldAAfter?.uuid && fieldAAfter.uuid === fieldABefore.uuid)
  ok('In-place retype actually saved the field as a textarea', fieldAAfter?.type === 'textarea')

  const realConsoleErrors = consoleErrors.filter((e) => !e.includes('Obiyen script tag'))
  ok('No console errors across all three scenarios', realConsoleErrors.length === 0)
  if (realConsoleErrors.length) console.log('  console errors:', realConsoleErrors.slice(0, 5))
} catch (e) {
  ok('Unexpected error: ' + e.message, false)
  if (consoleErrors.length) console.log('console errors:\n' + consoleErrors.join('\n'))
  await page.screenshot({ path: `${SHOT}/forms-reorder-99-error.png`, fullPage: true }).catch(() => {})
} finally {
  if (formUuid) {
    const del = await api('DELETE', `/forms/${formUuid}`)
    if (del.status >= 200 && del.status < 300) {
      console.log('↩︎  cleaned up the form')
    } else {
      const deactivate = await api('PUT', `/forms/${formUuid}`, { is_active: false })
      console.log(deactivate.status >= 200 && deactivate.status < 300
        ? '↩︎  form delete was blocked (in use) - deactivated instead'
        : `⚠️  form cleanup failed (delete status ${del.status}, deactivate status ${deactivate.status})`)
    }
  }
  await browser.close()
}

const passed = results.filter(Boolean).length
console.log(`\n=== ${passed}/${results.length} PASS ===`)
process.exit(passed === results.length ? 0 : 1)
