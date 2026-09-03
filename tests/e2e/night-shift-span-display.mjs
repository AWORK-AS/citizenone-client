/**
 * Browser E2E for AW-2026-4263 item #5: "Vågne nattevagter vises på to
 * forskellige måder" - waking night shifts displayed two different ways.
 *
 * Root cause under test: form-shift.vue only applied the next-day end-time
 * rollover when `system_name === 'sleeping-night-shift'` (and only when
 * `end_time_day_offset != null`, which is 0 on every crossing type in
 * production, so the branch never fired at all). Picking "Vågen nattevagt"
 * therefore wrote `date_time_end` on the SAME calendar day - end before start -
 * and whether the planner noticed and fixed it by hand decided whether the row
 * landed as one unsplit block (Shape A) or a linked start/end pair (Shape B).
 * The customer's screenshot shows both, for two employees, in one week view.
 *
 * The gate is now `crossesMidnight(option)` -> `time_out < time_in`, with
 * `end_time_day_offset` as an override rather than a precondition.
 *
 * The behaviour under test is the FORM's date computation, so C1-C4 read the
 * end-date field BEFORE saving. The API is used only to verify what got
 * persisted, and to clean up.
 *
 * Run:  see tests/e2e/README.md
 * Env:  CO_TOKEN (required, Admin/Manager on a tenant with a midnight-crossing
 *         shift type - e.g. Corvita, which has "Vågen nattevagt" 22:15-08:45)
 *       CO_CROSSING_SHIFT (optional, dk_name of the crossing type to exercise;
 *         default "Vågen nattevagt")
 *       CO_SAMEDAY_SHIFT (optional, dk_name of a NON-crossing type that must be
 *         left alone; default "Sovende nattevagt", which on Corvita is
 *         configured 08:00-17:00 and genuinely does not cross midnight - see
 *         the trap note below)
 *       CO_EMPLOYEE_NAME (optional, the roster row to operate on; default
 *         "Kirsten Devantier" - the CO_TOKEN user is the planner and an
 *         Admin/bot account is often not on the roster at all)
 *       CO_BASE_URL (default http://localhost:3000)
 *       CO_API_URL (default http://127.0.0.1:8000)
 *       CO_NAV_TIMEOUT (optional, ms; default 180000)
 *
 * Verified green on two tenants:
 *   Corvita   (default env)
 *   Hava Nord CO_EMPLOYEE_NAME='Jim Larsen' CO_CROSSING_SHIFT='Døgnvagt'  *             CO_SAMEDAY_SHIFT='Ferie'
 * Hava Nord is the one that exercises the leave-type exclusion: its Ferie, Syg
 * and Døgnvagt are all configured 09:00-00:00, so all three test as crossing
 * midnight and only Døgnvagt may roll over.
 *
 * Traps this suite deliberately encodes:
 *  - Corvita's "Sovende nattevagt" is 08:00-17:00. ShiftTypeRepository::autoCreate()
 *    hardcodes 08:00/17:00 for all five seeded types and Corvita only ever edited
 *    the awake one. So on Corvita the sleeping type correctly does NOT roll over.
 *    That is C2 passing, not the fix failing. To exercise a genuinely crossing
 *    sleeping-night type, run against Måneglimt or Care Konsulenterne instead and
 *    set CO_CROSSING_SHIFT / CO_SAMEDAY_SHIFT accordingly.
 *  - Corvita has all three shift-warning toggles off, so no warning block appears.
 *    Nothing here asserts on warnings.
 */
import { chromium } from 'playwright-core'
import { fileURLToPath } from 'url'
import path from 'path'

const TOKEN = process.env.CO_TOKEN
const CROSSING_SHIFT = process.env.CO_CROSSING_SHIFT || 'Vågen nattevagt'
const SAMEDAY_SHIFT = process.env.CO_SAMEDAY_SHIFT || 'Sovende nattevagt'
// The acting user (CO_TOKEN) is the planner; the row we operate on belongs to an
// EMPLOYEE on the roster. An Admin/bot account is often not on the roster at all.
const EMPLOYEE_NAME = process.env.CO_EMPLOYEE_NAME || 'Kirsten Devantier'
const BASE = process.env.CO_BASE_URL || 'http://localhost:3000'
const API = process.env.CO_API_URL || 'http://127.0.0.1:8000'
const SHOT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'screenshots')

if (!TOKEN) {
  console.error('Missing CO_TOKEN. See tests/e2e/README.md.')
  process.exit(2)
}

const results = []
const ok = (name, cond) => { results.push(cond); console.log(`${cond ? '✅' : '❌'} ${name}`) }
const note = (msg) => console.log(`   ${msg}`)

async function api(method, urlPath, body, token = TOKEN) {
  const res = await fetch(`${API}/api/user${urlPath}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  return { status: res.status, json: await res.json().catch(() => null) }
}

// Locale-agnostic matchers - the dev DB decides which locale the CO_TOKEN user
// has, and these labels exist in all four (dk/en/no/sv).
const NEW_SHIFT_BUTTON = /^(New schedule|Ny vagt|Ny vakt|Ny pass)$/
const SAVE_BUTTON = /^(Save|Gem|Lagre|Spara|Create|Opret|Opprett|Skapa)$/
const SPAN_START = /Shift start|Vagt start|Vakt start|Pass start/
const SPAN_END = /Shift end|Vagt slut|Vakt slutt|Pass slut/

// Nuxt in dev mode serves an unbundled module graph, so the first navigation in a
// cold browser can take minutes even though the route answers instantly over HTTP.
const USER_FETCH_TIMEOUT = Number(process.env.CO_NAV_TIMEOUT || 180000)

async function authAs(page, token) {
  await page.goto(`${BASE}/overview`, { waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT })
  await page.evaluate((t) => localStorage.setItem('_token', t), token)
  await Promise.all([
    page.waitForResponse((r) => r.url().endsWith('/api/user') && r.request().method() === 'GET', { timeout: USER_FETCH_TIMEOUT }),
    page.reload({ waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT }),
  ])
}

// flatpickr renders `dateFormat: 'd. F Y H:i'` straight into the #date_time_*
// input (no altInput), e.g. "31. August 2026 22:15". Parse the day number and
// the HH:mm out of it rather than going through a JS Date, which would apply
// this host's timezone to a value the app treats as naive wall-clock.
function parseFlatpickr(value) {
  const raw = (value || '').trim()
  const withTime = /^(\d{1,2})\.\s*(\S+)\s+(\d{4})\s+(\d{2}):(\d{2})$/.exec(raw)
  if (withTime) {
    return { day: Number(withTime[1]), monthName: withTime[2], year: Number(withTime[3]), hhmm: `${withTime[4]}:${withTime[5]}`, allDay: false }
  }
  // Leave types render the date-only FormDateField variant (all-day rows carry
  // no times at all), so a value with no HH:mm is valid, not a parse failure.
  // That component's flatpickr format is 'd. F Y (W)' (DateField.vue:48) - the
  // trailing "(36)" is the ISO week number, not a malformed value.
  const dateOnly = /^(\d{1,2})\.\s*(\S+)\s+(\d{4})(?:\s*\(\d{1,2}\))?$/.exec(raw)
  if (dateOnly) {
    return { day: Number(dateOnly[1]), monthName: dateOnly[2], year: Number(dateOnly[3]), hhmm: null, allDay: true }
  }
  return null
}

// Scope to the modal's own form (form-shift.vue renders id="formDutySchedule").
// The schedules page itself has a week-navigation flatpickr, and an unscoped
// `#date_time_start` can resolve to that instead - it reads back as e.g.
// "31. august 2026 (36)", which looks like a parse failure but is the wrong node.
async function readField(page, id) {
  const scoped = page.locator(`#formDutySchedule #${id}`)
  const el = (await scoped.count()) > 0 ? scoped.first() : page.locator(`#${id}`).last()
  const raw = await el.inputValue()
  return { raw, parsed: parseFlatpickr(raw) }
}

// The week view renders one row per employee inside a `grid grid-cols-9`
// container; scoping to the row disambiguates the "+" button on a busy roster.
function employeeRow(page, fullName) {
  // Filter rather than an xpath ancestor index: some rosters render a hidden
  // duplicate of the name, and `(//p[...])[1]` can select the invisible copy,
  // whose grid ancestor then never becomes visible. Playwright's filter +
  // waitFor() resolves to a visible match instead.
  return page.locator('div.grid-cols-9').filter({ hasText: fullName })
}

async function dumpRoster(page) {
  const names = await page.evaluate(() =>
    Array.from(document.querySelectorAll('p'))
      .map((el) => el.textContent.trim())
      .filter((t) => t && t.length < 40)
      .slice(0, 40))
  note(`Roster <p> candidates seen: ${JSON.stringify(names)}`)
  const grids = await page.evaluate(() =>
    Array.from(new Set(Array.from(document.querySelectorAll('div[class*="grid-cols"]'))
      .map((el) => el.className.split(/\s+/).filter((c) => c.startsWith('grid-cols')).join(' ')))).slice(0, 20))
  note(`grid-cols classes present: ${JSON.stringify(grids)}`)
}

async function openNewShiftDialog(page, fullName) {
  const row = employeeRow(page, fullName)
  try {
    await row.first().waitFor()
  } catch (e) {
    await page.screenshot({ path: `${SHOT}/night-shift-00-roster-miss.png`, fullPage: true })
    await dumpRoster(page)
    throw new Error(`Could not find the row for "${fullName}". Set CO_EMPLOYEE_NAME to a name from the roster dump above.`)
  }
  await row.getByRole('button', { name: NEW_SHIFT_BUTTON }).first().click()
  // Wait for the modal's own form, not just #shift_type - the schedules page has
  // page-level controls that can satisfy a bare #shift_type match, letting this
  // return with no dialog open and every later field read hit the wrong node.
  await page.locator('#formDutySchedule').waitFor()
  await page.locator('#formDutySchedule #shift_type').waitFor()
}

// #shift_type is a vue-multiselect combobox (role="combobox" + a separate
// options list at #shift_type-multiselect-options), not a native <select> -
// selectOption() throws on it. Open it and click the option by its visible text.
// Companies WITH departments require department_uuid on save (Corvita has none,
// so this is a no-op there). Same vue-multiselect widget as #shift_type.
async function selectFirstDepartment(page) {
  const combo = page.locator('#department_uuid')
  if (await combo.count() === 0) return
  if (!(await combo.first().isVisible().catch(() => false))) return
  await combo.first().click()
  const options = page.locator('#department_uuid-multiselect-options')
  await options.waitFor().catch(() => {})
  // Skip the synthetic "all departments" sentinel when a real one exists.
  const real = options.locator('li, [role="option"]').filter({ hasNotText: /all departments|alle afdelinger/i })
  const target = (await real.count()) > 0 ? real.first() : options.locator('li, [role="option"]').first()
  await target.click().catch(() => {})
  await page.waitForTimeout(300)
}

async function selectShiftType(page, label) {
  const combo = page.locator('#formDutySchedule #shift_type').first()
  await combo.click()
  const options = page.locator('#shift_type-multiselect-options')
  await options.waitFor()
  const option = options.getByText(label, { exact: true }).first()
  await option.waitFor()
  await option.click()
  // The three watchers in form-shift.vue recompute date_time_end and then emit
  // dateTimeChange, which fires the validation request. Settle before reading.
  await page.waitForTimeout(600)
}

// createSchedule() returns a service-defined envelope, not a documented shape.
// Walk the JSON for anything that looks like a persisted schedule row so the
// assertion doesn't depend on how the response happens to be wrapped.
function collectScheduleRows(node, out = []) {
  if (!node || typeof node !== 'object') return out
  if (Array.isArray(node)) { node.forEach((n) => collectScheduleRows(n, out)); return out }
  if ('shift_span_position' in node || ('uuid' in node && 'date_time_start' in node)) out.push(node)
  Object.values(node).forEach((v) => collectScheduleRows(v, out))
  return out
}

const createdUuids = []
const browser = await chromium.launch({ channel: 'chrome', headless: true })

try {
  const meRes = await api('GET', '')
  const me = meRes.json?.data
  if (!me) throw new Error('Could not read /api/user with CO_TOKEN')
  const fullName = `${me.firstname || ''} ${me.lastname || ''}`.trim()
  note(`Acting as ${fullName} (company: ${me.company?.name || '?'})`)

  const page = await browser.newPage()
  page.setDefaultTimeout(30000)
  await authAs(page, TOKEN)
  await page.goto(`${BASE}/schedules`, { waitUntil: 'domcontentloaded' })

  // ---- C1: the crossing type rolls the end date to the next day -------------
  await openNewShiftDialog(page, EMPLOYEE_NAME)
  await selectShiftType(page, CROSSING_SHIFT)
  await selectFirstDepartment(page)

  const c1Start = await readField(page, 'date_time_start')
  const c1End = await readField(page, 'date_time_end')
  await page.screenshot({ path: `${SHOT}/night-shift-01-crossing-form.png`, fullPage: true })

  if (!c1Start.parsed || !c1End.parsed) {
    ok(`C1 could read both date fields (start="${c1Start.raw}" end="${c1End.raw}")`, false)
  } else {
    note(`C1 start="${c1Start.raw}" end="${c1End.raw}"`)
    ok('C1 the end date is on a LATER day than the start (the rollover fired)',
      c1End.parsed.day !== c1Start.parsed.day)
    ok('C1 the end time is the shift type\'s own time_out, not the start time',
      c1End.parsed.hhmm !== c1Start.parsed.hhmm)
  }

  // Save and confirm what got persisted.
  const [createRes] = await Promise.all([
    // Match the create endpoint EXACTLY. form-shift.vue also POSTs to
    // /duty-schedules/validation on every date change, and a substring match on
    // '/duty-schedules' catches that instead - a 2xx with no schedule rows in it.
    page.waitForResponse((r) => new URL(r.url()).pathname.replace(/\/$/, '').endsWith('/api/user/duty-schedules')
      && r.request().method() === 'POST'),
    page.getByRole('button', { name: SAVE_BUTTON }).last().click(),
  ])
  ok('C1 the shift saved', createRes.status() >= 200 && createRes.status() < 300)

  const createdJson = await createRes.json().catch(() => null)
  const rows = collectScheduleRows(createdJson)
  rows.forEach((r) => r?.uuid && createdUuids.push(r.uuid))

  if (rows.length) {
    const positions = rows.map((r) => r.shift_span_position)
    const parents = rows.map((r) => r.shift_parent_uuid)
    note(`C1 persisted ${rows.length} row(s): positions=${JSON.stringify(positions)} parents=${JSON.stringify(parents)}`)
    ok('C1 it split into a linked start/end pair (Shape B), not one unsplit row (Shape A)',
      rows.length >= 2
      && positions.includes('start') && positions.includes('end')
      && parents.every((p) => p) && new Set(parents).size === 1)
  } else {
    ok('C1 the create response carried the persisted rows', false)
  }

  // ---- C2: a non-crossing type is left alone --------------------------------
  await page.reload({ waitUntil: 'domcontentloaded' })
  await openNewShiftDialog(page, EMPLOYEE_NAME)
  await selectShiftType(page, SAMEDAY_SHIFT)

  const c2Start = await readField(page, 'date_time_start')
  const c2End = await readField(page, 'date_time_end')
  note(`C2 start="${c2Start.raw}" end="${c2End.raw}"`)
  await page.screenshot({ path: `${SHOT}/night-shift-02-sameday-form.png`, fullPage: true })

  if (!c2Start.parsed || !c2End.parsed) {
    ok('C2 could read both date fields', false)
  } else {
    ok(`C2 "${SAMEDAY_SHIFT}" does NOT roll over (same day start and end)`,
      c2End.parsed.day === c2Start.parsed.day)
    note('If this fails, first check the type actually crosses midnight in this tenant.')
    note('On Corvita "Sovende nattevagt" is 08:00-17:00 and correctly does not roll over.')
  }
  await page.keyboard.press('Escape')

  // ---- C4: the create-vs-edit guard still holds -----------------------------
  // form-shift.vue:671-673 records a real prior bug (Birketoften 31/8): moving
  // the start time of an EXISTING shift must not drag the end back to the shift
  // type's default. The `props.formType === 'create'` guard is what prevents it.
  await page.reload({ waitUntil: 'domcontentloaded' })
  if (createdUuids.length) {
    const existing = await api('GET', `/duty-schedules/${createdUuids[0]}`)
    const existingStart = existing.json?.data?.date_time_start
    if (existingStart) {
      const hhmm = existingStart.slice(11, 16)
      await employeeRow(page, EMPLOYEE_NAME).getByText(hhmm, { exact: true }).first().click()
      await page.locator('#date_time_end').waitFor()

      const before = await readField(page, 'date_time_end')
      // Nudge the start time by an hour through the field the watcher listens to.
      // The flatpickr input is readonly, so fill()/type() can't drive it - go
      // through the picker instance (vue-flatpickr exposes it as el._flatpickr)
      // and let setDate(..., true) fire the change event Vue's watcher listens on.
      const bumped = await page.evaluate(() => {
        const el = document.querySelector('#date_time_start')
        const fp = el && el._flatpickr
        if (!fp) return false
        const d = new Date(fp.selectedDates[0] || Date.now())
        d.setHours(d.getHours() + 1)
        fp.setDate(d, true)
        return true
      })
      if (!bumped) note('C4 could not reach the flatpickr instance on #date_time_start')
      await page.waitForTimeout(800)
      const after = await readField(page, 'date_time_end')
      note(`C4 end before="${before.raw}" after="${after.raw}"`)
      ok('C4 editing an existing shift does not reset its end time', before.raw === after.raw)
      await page.keyboard.press('Escape')
    } else {
      ok('C4 could re-read the created shift for the edit check', false)
    }
  } else {
    ok('C4 skipped - nothing was created in C1 to edit', false)
  }

  // ---- C6: no empty pill row on ordinary non-spanning shifts ----------------
  // week-view.vue:1155 / draft/week-view.vue:752 used to guard the pill row on a
  // truthy check, which matched 'single' too and emitted an empty pill.
  await page.goto(`${BASE}/schedules`, { waitUntil: 'domcontentloaded' })
  // Wait for the grid to actually paint shift blocks - counting badges against a
  // still-loading week view silently reports zero.
  await employeeRow(page, EMPLOYEE_NAME).first().waitFor()
  await page.waitForTimeout(2500)
  const shiftBlockCount = await page.getByText(/^\d{2}:\d{2}$/).count()
  note(`C6 rendered shift blocks in view: ${shiftBlockCount}`)
  const emptyPills = await page.evaluate(() => {
    // A pill container that rendered but has no visible text is the artefact.
    const pills = Array.from(document.querySelectorAll('div.flex.items-center.gap-1'))
    return pills.filter((el) => el.closest('[class*="rounded"]') && el.textContent.trim() === '').length
  })
  note(`C6 found ${emptyPills} empty pill container(s)`)
  ok('C6 ordinary shifts render no empty span-pill row', emptyPills === 0)

  const spanStartCount = await page.getByText(SPAN_START).count()
  const spanEndCount = await page.getByText(SPAN_END).count()
  note(`C6 span badges still present: ${spanStartCount} start, ${spanEndCount} end`)
  ok('C6 real span shifts still show their badges', spanStartCount > 0 || spanEndCount > 0)

  await page.screenshot({ path: `${SHOT}/night-shift-03-week-view.png`, fullPage: true })
} catch (err) {
  console.error('\n❌ Run aborted:', err.message)
  results.push(false)
} finally {
  // Self-restoring: remove every shift this run created.
  for (const uuid of createdUuids) {
    const res = await api('DELETE', `/duty-schedules/${uuid}`)
    if (res.status < 200 || res.status >= 300) console.warn(`   cleanup: could not delete ${uuid} (status ${res.status})`)
  }
  await browser.close()
}

const failed = results.filter((r) => !r).length
console.log(`\n${failed === 0 ? '✅ all checks passed' : `❌ ${failed} of ${results.length} checks failed`}`)
process.exit(failed === 0 ? 0 : 1)
