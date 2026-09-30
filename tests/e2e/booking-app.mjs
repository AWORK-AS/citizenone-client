/**
 * Full booking-app E2E: every CRUD operation the admin UI actually exposes
 * for booking (tags, online booking settings, event/course lifecycle with
 * the buffer-time fields, appointment hand-over), plus the complete
 * booking-client journey - anonymous public booking, then that same client
 * logging into their own portal and seeing it.
 *
 * Scope notes (see tests/e2e/README.md for the full writeup):
 * - There is no admin UI to create a `BookingService` (the single-provider
 *   "treatment" model) - the real admin-facing "create a bookable thing" UI
 *   is the EventCourse wizard (single event / course), which is what this
 *   script exercises as "service CRUD". Website Booking's embed-widget
 *   flow (which needs a real BookingService) is out of scope.
 * - Booking appointments have no UI create or delete - only reassignment
 *   ("hand over"). Appointments are created only through the public flow.
 * - A booking client's dashboard is read-only (no cancel/reschedule).
 * - The public booking flow reuses an existing BookingClient by email
 *   (confirmed by reading BookingAppointmentService::createServiceBookingAppointment/
 *   createBookingAppointment), which is why the pre-seeded client fixture
 *   below can log in immediately with no email round trip.
 *
 * Run: see tests/e2e/README.md for the tinker fixture setup and required
 * env vars.
 */
import { chromium } from 'playwright-core'
import { fileURLToPath } from 'url'
import path from 'path'

const BASE = process.env.CO_BASE_URL || 'http://localhost:3001'
const API = process.env.CO_API_URL || 'http://localhost:8001'
const SHOT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'screenshots')
const USER_FETCH_TIMEOUT = 60000

const env = {
  TOKEN: process.env.CO_TOKEN,
  COLLEAGUE_NAME: process.env.CO_COLLEAGUE_NAME,
  CLIENT_EMAIL: process.env.CO_CLIENT_EMAIL,
  CLIENT_PASSWORD: process.env.CO_CLIENT_PASSWORD,
}

const missing = Object.entries(env).filter(([, v]) => !v).map(([k]) => k)
if (missing.length) {
  console.error(`Missing required env vars: ${missing.map((k) => `CO_${k}`).join(', ')}. See tests/e2e/README.md.`)
  process.exit(1)
}

let failures = 0
function check(label, condition, detail = '') {
  if (condition) {
    console.log(`  ok   ${label}`)
  } else {
    failures++
    console.error(`  FAIL ${label}${detail ? ` - ${detail}` : ''}`)
  }
}

function api(token) {
  return async (method, urlPath, body) => {
    const response = await fetch(`${API}/api${urlPath}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    })
    return { status: response.status, body: await response.json().catch(() => null) }
  }
}

// A fresh isolated context per scenario - see pricing-nov2026.mjs for why
// (service-worker cross-contamination across fixtures in one context).
async function newIsolatedPage(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
  return context.newPage()
}

async function loginAsStaff(page, token, path = '/') {
  await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT })
  await page.evaluate((t) => localStorage.setItem('_token', t), token)
  await Promise.all([
    page.waitForResponse((r) => r.url().endsWith('/api/user') && r.request().method() === 'GET', { timeout: USER_FETCH_TIMEOUT }),
    page.reload({ waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT }),
  ])
  await page.waitForTimeout(1500)

  // A one-time "We have tidied up in here" settings-tour modal blocks the
  // whole page (including elements behind it, for role-based lookups) on a
  // fixture user's first login. Dismiss it if present.
  const gotIt = page.getByRole('button', { name: 'Got It' })
  if (await gotIt.count()) await gotIt.click()
  await page.waitForTimeout(300)
}

function tomorrow() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d
}

function ymd(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/**
 * Drives vue-flatpickr-component's popup calendar (used by FormDateTimeField)
 * for a field that is not inline and not `allowInput` - the only reliable
 * way in is the calendar UI itself, not `.fill()`. The month picker is a
 * real 0-indexed `<select>` (`.flatpickr-monthDropdown-months`, matching JS
 * Date's own month numbering) and the year is a plain number input
 * (`.cur-year`) - both settable directly, no need to click "next month"
 * repeatedly. Then clicks the day, then types the hour/minute into
 * flatpickr's own numeric spinboxes.
 */
async function setDateTimeField(page, fieldId, date, hour, minute) {
  await page.locator(`#${fieldId}`).click()
  const calendar = page.locator('.flatpickr-calendar.open').last()
  await calendar.waitFor({ state: 'visible', timeout: 10000 })

  await calendar.locator('.flatpickr-monthDropdown-months').selectOption(String(date.getMonth()))
  const yearInput = calendar.locator('.cur-year')
  await yearInput.fill(String(date.getFullYear()))
  await yearInput.dispatchEvent('change')

  await calendar
    .locator(`.flatpickr-day:not(.prevMonthDay):not(.nextMonthDay)`, { hasText: new RegExp(`^${date.getDate()}$`) })
    .first()
    .click()

  const hourInput = calendar.locator('.flatpickr-hour')
  await hourInput.fill(String(hour).padStart(2, '0'))
  await hourInput.dispatchEvent('change')
  const minuteInput = calendar.locator('.flatpickr-minute')
  await minuteInput.fill(String(minute).padStart(2, '0'))
  await minuteInput.dispatchEvent('change')

  await page.keyboard.press('Escape')
}

/** Same idea for FormTimeField (`noCalendar: true` - time-only spinboxes, no day grid). */
async function setTimeField(page, fieldId, hour, minute) {
  await page.locator(`#${fieldId}`).click()
  const calendar = page.locator('.flatpickr-calendar.open').last()
  await calendar.waitFor({ state: 'visible', timeout: 10000 })
  const hourInput = calendar.locator('.flatpickr-hour')
  await hourInput.fill(String(hour).padStart(2, '0'))
  await hourInput.dispatchEvent('change')
  const minuteInput = calendar.locator('.flatpickr-minute')
  await minuteInput.fill(String(minute).padStart(2, '0'))
  await minuteInput.dispatchEvent('change')
  await page.keyboard.press('Escape')
}

async function shot(page, name) {
  await page.screenshot({ path: path.join(SHOT, `booking-app-${name}.png`) }).catch(() => {})
}

/**
 * Table rows render as a loading shimmer for a beat after navigation/refetch
 * before the real data replaces it - a `row.count() > 0` check taken
 * immediately after an action can fire during that shimmer and see nothing.
 * Polls instead of a single fixed sleep.
 */
async function waitForRowByText(page, text, exact = true, timeout = 10000) {
  const row = page.locator('tr', { has: page.getByText(text, { exact }) })
  const start = Date.now()
  while (Date.now() - start < timeout) {
    if (await row.count() > 0) return row
    await page.waitForTimeout(300)
  }
  return row
}

/**
 * FormSelect/FormSelectMultiple are `@vueform/multiselect`, not a native
 * `<select>` - there is no `<option>` to `.selectOption()` against. Clicking
 * the field's root (which carries the `id` prop via Vue's attr fallthrough)
 * opens a dropdown whose choices are real `role="option"` elements.
 */
/**
 * FormSwitch is a Headless UI `<Switch role="switch" aria-checked>`. Clicking
 * it occasionally lands during a re-render right after a preceding action
 * (e.g. filling adjacent text fields) and doesn't stick - verify the state
 * actually flipped and retry rather than assuming one click was enough.
 */
async function toggleSwitchOn(switchLocator, attempts = 3) {
  for (let i = 0; i < attempts; i++) {
    if ((await switchLocator.getAttribute('aria-checked')) === 'true') return
    await switchLocator.click()
    await switchLocator.page().waitForTimeout(300)
  }
}

async function pickFromMultiselect(page, fieldId, optionName) {
  // Some pages duplicate an id (e.g. settings.vue has two `#language`
  // selects, one of them in a dead/unused duplicate section) - always take
  // the first rendered match rather than assuming a unique id.
  await page.locator(`#${fieldId}`).first().click()
  await page.getByRole('option', { name: optionName, exact: true }).first().click()
}

// ---------------------------------------------------------------------------
// Scenario A - Booking Tags CRUD
// ---------------------------------------------------------------------------
async function scenarioA(browser) {
  console.log('\nScenario A: Booking Tags CRUD')
  const page = await newIsolatedPage(browser)
  const tagName = `E2E Tag ${Date.now()}`
  const renamedTag = `${tagName} (edited)`

  await loginAsStaff(page, env.TOKEN, '/settings/booking-tags/new')
  await page.locator('#name').fill(tagName)
  await Promise.all([
    page.waitForResponse((r) => r.url().includes('/booking-tags') && r.request().method() === 'POST'),
    page.getByRole('button', { name: 'Save' }).click(),
  ])
  await page.waitForURL('**/settings/booking-tags', { timeout: USER_FETCH_TIMEOUT })

  const row = await waitForRowByText(page, tagName)
  check('A1: created tag appears in the list', await row.count() > 0)

  await row.getByRole('button', { name: 'Edit' }).click()
  await page.waitForURL('**/settings/booking-tags/*/edit', { timeout: USER_FETCH_TIMEOUT })
  await page.locator('#name').fill(renamedTag)
  await Promise.all([
    page.waitForResponse((r) => r.url().includes('/booking-tags') && r.request().method() === 'PUT'),
    page.getByRole('button', { name: 'Update' }).click(),
  ])
  await page.waitForURL('**/settings/booking-tags', { timeout: USER_FETCH_TIMEOUT })

  const renamedRow = await waitForRowByText(page, renamedTag)
  check('A2: renamed tag appears in the list', await renamedRow.count() > 0)

  await renamedRow.getByRole('button', { name: 'Delete' }).click()
  await page.getByRole('button', { name: 'Confirm' }).click()
  await page.waitForTimeout(1000)
  check('A3: deleted tag no longer lists', await page.getByText(renamedTag, { exact: true }).count() === 0)

  await shot(page, 'a-tags')
  await page.context().close()
}

// ---------------------------------------------------------------------------
// Scenario B - Online Booking Settings configure
// ---------------------------------------------------------------------------
async function scenarioB(browser) {
  console.log('\nScenario B: Online Booking Settings configure')
  const page = await newIsolatedPage(browser)
  const header = `E2E Booking ${Date.now()}`
  const link = `e2e-booking-${Date.now()}`

  // onMounted fires 5 parallel fetches (languages, booking settings, booking
  // service options, department options, website booking settings) - if the
  // booking-settings one resolves after we've started filling the form, its
  // wholesale `state.formBookingSettings = {...}` assignment wipes out
  // whatever we've already typed. loginAsStaff's own goto+reload means this
  // GET fires twice (once pre-token, 401; once post-token, 200) - register
  // the wait before either navigation and filter by status so it resolves on
  // the real one regardless of which finishes first.
  const settingsLoaded = page.waitForResponse((r) => r.url().includes('/online-booking-settings') && r.request().method() === 'GET' && r.status() === 200)
  await loginAsStaff(page, env.TOKEN, '/calendar/bookings/settings')
  await settingsLoaded
  await page.waitForTimeout(500)
  await page.locator('#header').fill(header)
  await page.locator('#link').fill(link)

  // Language is required - the field is `@vueform/multiselect`, not a native
  // <select>, so it's driven by opening the dropdown and clicking an option.
  await pickFromMultiselect(page, 'language', 'English')

  // Enable the email (required) and phone (optional) fields for the public
  // form. These switches carry no accessible name (no `label` prop passed at
  // the call site) and "Phone" also appears as an unrelated contact-info
  // toggle earlier on the page, so scope to the Fields card specifically -
  // its own intro sentence is unique on the page, and its grandparent is
  // exactly the card containing all 7 (and only these 7) field switches.
  const fieldsCard = page.getByText('Specify which fields a client can fill', { exact: false }).locator('../..')
  const fieldSwitches = fieldsCard.getByRole('switch')

  // Some other parallel fetch this page fires on mount occasionally lands
  // late and stomps the fields state with what was last saved - verified via
  // a fresh API read (a reload here would just race the same timing again),
  // and retried once rather than chasing the exact source of the race
  // further, since this is a UI-flakiness workaround, not the thing under
  // test.
  let fields = {}
  for (let attempt = 0; attempt < 2; attempt++) {
    await toggleSwitchOn(fieldSwitches.nth(0)) // email
    await toggleSwitchOn(fieldSwitches.nth(1)) // phone

    await Promise.all([
      page.waitForResponse((r) => r.url().includes('/online-booking-settings') && r.request().method() === 'POST'),
      page.locator('#formBookingSettings').getByRole('button', { name: 'Save' }).click(),
    ])
    await page.waitForTimeout(1000)

    const { body } = await api(env.TOKEN)('GET', '/user/online-booking-settings')
    fields = body?.data?.fields ? JSON.parse(body.data.fields) : {}
    if (fields?.email?.enabled && fields?.phone?.enabled) break
  }

  const { body } = await api(env.TOKEN)('GET', '/user/online-booking-settings')
  check('B1: header persisted', body?.data?.header === header, `got ${body?.data?.header}`)
  check('B2: link persisted', body?.data?.link === link, `got ${body?.data?.link}`)
  check('B3: email field enabled via API', Boolean(fields?.email?.enabled))
  check('B4: phone field enabled via API', Boolean(fields?.phone?.enabled))

  await shot(page, 'b-settings')
  await page.context().close()
  return { link }
}

// ---------------------------------------------------------------------------
// Scenario C - Event (EventCourse) CRUD with slots + buffer
// ---------------------------------------------------------------------------
async function scenarioC(browser) {
  console.log('\nScenario C: Event CRUD with slots + buffer')
  const page = await newIsolatedPage(browser)
  const eventName = `E2E Event ${Date.now()}`
  const editedName = `${eventName} (edited)`
  const day = tomorrow()

  await loginAsStaff(page, env.TOKEN, '/calendar/bookings')
  await page.getByRole('button', { name: 'New event' }).last().click()
  await page.getByRole('button', { name: 'Create a single event' }).click()

  // Step 1: Information
  await setDateTimeField(page, 'date_time_start', day, 9, 0)
  await setDateTimeField(page, 'date_time_end', day, 16, 0)
  await page.locator('#name').fill(eventName)
  await page.getByRole('button', { name: 'Next' }).click()

  // Step 2: Slots - starts with zero rows; each one is added explicitly.
  // Two back-to-back-ish slots here, second one uses the buffer.
  await page.getByRole('button', { name: 'Add slot' }).click()
  await setTimeField(page, 'start_time_0', 9, 0)
  await setTimeField(page, 'end_time_0', 9, 30)
  await page.locator('#capacity_0').fill('1')

  await page.getByRole('button', { name: 'Add slot' }).click()
  await setTimeField(page, 'start_time_1', 9, 40)
  await setTimeField(page, 'end_time_1', 10, 10)
  await page.locator('#capacity_1').fill('1')
  await page.getByRole('button', { name: 'Next' }).click()

  // Step 3: Settings - price + the buffer-time fields shipped this session.
  await page.locator('#price').fill('100')
  await page.locator('#buffer_minutes_before').fill('0')
  await page.locator('#buffer_minutes_after').fill('10')
  await Promise.all([
    page.waitForResponse((r) => r.url().includes('/courses-events') && r.request().method() === 'POST'),
    page.getByRole('button', { name: 'Next' }).click(),
  ])
  await page.waitForTimeout(1000)

  await page.getByRole('button', { name: 'Close' }).click().catch(() => {})
  await page.waitForTimeout(1000)

  const row = await waitForRowByText(page, eventName, false)
  const rowExists = await row.count() > 0
  check('C1: created event appears in the list', rowExists)
  check('C2: slot count/capacity shown', rowExists && (await row.locator('td').nth(2).textContent())?.trim() === '2')

  await row.getByRole('button', { name: 'Edit' }).click()
  await page.waitForTimeout(1000)
  await page.locator('#name').fill(editedName)
  // Step through to Settings without changing anything else, then save.
  await page.getByRole('button', { name: 'Next' }).click()
  await page.waitForTimeout(300)
  await page.getByRole('button', { name: 'Next' }).click()
  await Promise.all([
    page.waitForResponse((r) => r.url().includes('/courses-events') && r.url().includes('/update') && r.request().method() === 'POST'),
    page.getByRole('button', { name: 'Next' }).click(),
  ])
  await page.waitForTimeout(1000)
  await page.getByRole('button', { name: 'Close' }).click().catch(() => {})
  await page.waitForTimeout(1000)

  const editedRow = await waitForRowByText(page, editedName, false)
  const editedRowExists = await editedRow.count() > 0
  check('C3: renamed event appears in the list', editedRowExists)

  const eventLink = editedRowExists ? await editedRow.locator('td').nth(1).locator('p').textContent() : null
  const eventUuid = eventLink?.trim().split('/event/')[1]
  check('C4: captured the created event uuid', Boolean(eventUuid))

  // A second, throwaway event purely to prove delete works, so we don't
  // fight Scenario D over the one it needs.
  await page.getByRole('button', { name: 'New event' }).last().click()
  await page.getByRole('button', { name: 'Create a single event' }).click()
  const throwawayName = `E2E Throwaway ${Date.now()}`
  await setDateTimeField(page, 'date_time_start', day, 11, 0)
  await setDateTimeField(page, 'date_time_end', day, 12, 0)
  await page.locator('#name').fill(throwawayName)
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('button', { name: 'Add slot' }).click()
  await setTimeField(page, 'start_time_0', 11, 0)
  await setTimeField(page, 'end_time_0', 11, 30)
  await page.locator('#capacity_0').fill('1')
  await page.getByRole('button', { name: 'Next' }).click()
  await Promise.all([
    page.waitForResponse((r) => r.url().includes('/courses-events') && r.request().method() === 'POST'),
    page.getByRole('button', { name: 'Next' }).click(),
  ])
  await page.waitForTimeout(1000)
  await page.getByRole('button', { name: 'Close' }).click().catch(() => {})
  await page.waitForTimeout(1000)

  const throwawayRow = await waitForRowByText(page, throwawayName, false)
  check('C5: throwaway event created', await throwawayRow.count() > 0)
  await throwawayRow.getByRole('button', { name: 'Delete' }).click()
  await page.getByRole('button', { name: 'Confirm' }).click()
  await page.waitForTimeout(1000)
  check('C6: throwaway event deleted', await page.getByText(throwawayName, { exact: true }).count() === 0)

  await shot(page, 'c-events')
  await page.context().close()
  return { eventUuid, eventName: editedName, slotDate: ymd(day) }
}

// ---------------------------------------------------------------------------
// Scenario C2 - Course CRUD
// ---------------------------------------------------------------------------
async function scenarioC2(browser) {
  console.log('\nScenario C2: Course CRUD')
  const page = await newIsolatedPage(browser)
  const courseName = `E2E Course ${Date.now()}`

  await loginAsStaff(page, env.TOKEN, '/calendar/bookings')
  await page.getByRole('button', { name: 'New event' }).last().click()
  await page.getByRole('button', { name: 'Create a course' }).click()

  await page.locator('#name').fill(courseName)
  await page.getByRole('button', { name: 'Next' }).click()

  // The two default session rows already have valid dates - only their
  // names are blank and required.
  // This field binds via @keyup, not v-model/@input - .fill() sets the
  // value without ever firing keyup, so the underlying state never updates.
  // pressSequentially() actually types, key by key.
  await page.locator('#name_0').pressSequentially('Session 1')
  await page.locator('#name_1').pressSequentially('Session 2')
  await page.getByRole('button', { name: 'Next' }).click()

  // Unlike the single-event wizard (always "Next", including the submit),
  // the course wizard's final step button reads "Save"/"Update".
  await Promise.all([
    page.waitForResponse((r) => r.url().includes('/courses-events') && r.request().method() === 'POST'),
    page.getByRole('button', { name: 'Save' }).click(),
  ])
  await page.waitForTimeout(1000)
  await page.getByRole('button', { name: 'Close' }).click().catch(() => {})
  await page.waitForTimeout(1000)

  const row = await waitForRowByText(page, courseName, false)
  check('C2.1: created course appears in the list', await row.count() > 0)

  await row.getByRole('button', { name: 'Edit' }).click()
  await page.waitForTimeout(1000)
  await page.getByRole('button', { name: 'Next' }).click()
  await page.locator('#name_0').fill('')
  await page.locator('#name_0').pressSequentially('Session 1 (edited)')
  await page.getByRole('button', { name: 'Next' }).click()
  await Promise.all([
    page.waitForResponse((r) => r.url().includes('/courses-events') && r.url().includes('/update') && r.request().method() === 'POST'),
    page.getByRole('button', { name: 'Update' }).click(),
  ])
  await page.waitForTimeout(1000)
  await page.getByRole('button', { name: 'Close' }).click().catch(() => {})
  await page.waitForTimeout(1000)

  await row.getByRole('button', { name: 'Delete' }).click()
  await page.getByRole('button', { name: 'Confirm' }).click()
  await page.waitForTimeout(1000)
  check('C2.2: deleted course no longer lists', await page.getByText(courseName, { exact: true }).count() === 0)

  await shot(page, 'c2-course')
  await page.context().close()
}

// ---------------------------------------------------------------------------
// Scenario D - Public booking flow (anonymous, booking-client perspective)
// ---------------------------------------------------------------------------
async function scenarioD(browser, { link, eventUuid }) {
  console.log('\nScenario D: Public booking flow')
  const page = await newIsolatedPage(browser)

  await page.goto(`${BASE}/booking/${link}/overview`, { waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT })
  await page.waitForTimeout(2000)

  await page.goto(`${BASE}/booking/${link}/event/${eventUuid}`, { waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT })
  await page.waitForTimeout(2000)
  await page.getByRole('button', { name: 'Continue' }).click()

  // Only tomorrow's date is enabled (the slots created in Scenario C are
  // the only dates this event has), so picking it is unambiguous. This
  // calendar also renders a week-number column (`weekNumbers: true`) whose
  // cells carry the same bare `.flatpickr-day` class without `-disabled` -
  // only real day cells have an `aria-label`, so filter on that too.
  await page.waitForTimeout(1000)
  const calendar = page.locator('.flatpickr-calendar')
  await calendar.locator('.flatpickr-day[aria-label]:not(.flatpickr-disabled)').first().click()
  await page.waitForTimeout(1000)

  const slots = page.locator('[role="radio"]')
  const slotCount = await slots.count()
  check('D1: at least one slot offered', slotCount > 0, `found ${slotCount}`)
  await slots.first().click()
  await page.getByRole('button', { name: 'Next' }).click()

  await page.locator('#firstname').fill('E2E')
  await page.locator('#lastname').fill('Client')
  await page.locator('#email').fill(env.CLIENT_EMAIL)
  const phoneField = page.locator('#phone')
  if (await phoneField.count()) await phoneField.fill('+4500000090')
  await page.getByRole('button', { name: 'Continue to confirmation' }).click()

  await page.waitForTimeout(500)
  await Promise.all([
    // This is an EventCourse (type=event) booking, not a BookingService one -
    // the submit endpoint is .../online-booking/courses-events/{uuid}, not
    // .../online-booking/services/{uuid} (the latter is BookingService's,
    // which this app has no admin UI to create - see the scope note at top).
    page.waitForResponse((r) => r.url().includes('/online-booking/courses-events/') && r.request().method() === 'POST'),
    page.getByRole('button', { name: 'Sign up for event' }).click(),
  ])
  await page.waitForTimeout(1000)

  check('D2: confirmation screen shown', await page.getByText('You have signed up for the event').count() > 0)

  await shot(page, 'd-public-booking')
  await page.context().close()

  const admin = api(env.TOKEN)
  const { body } = await admin('GET', '/user/booking-appointments')
  const appointment = (body?.data || []).find((a) => a.booking_client?.email === env.CLIENT_EMAIL)
  check('D3: appointment recorded via API', Boolean(appointment), 'no matching appointment found for the client email')
  return { appointmentUuid: appointment?.uuid }
}

// ---------------------------------------------------------------------------
// Scenario E - Admin appointments list + reassign
// ---------------------------------------------------------------------------
async function scenarioE(browser, { eventName }) {
  console.log('\nScenario E: Admin appointments list + reassign')
  const page = await newIsolatedPage(browser)
  await loginAsStaff(page, env.TOKEN, '/calendar/bookings/appointments')
  await page.waitForTimeout(1500)

  // Match on this run's specific event name, not a generic "E2E" substring -
  // the fixture company accumulates appointments across repeated runs (this
  // script isn't self-restoring, see README), and a generic match can latch
  // onto a stale one from an earlier run instead of the one just created.
  const row = (await waitForRowByText(page, eventName, false)).first()
  check('E1: the booking from Scenario D is listed', await row.count() > 0)

  await row.getByRole('button', { name: 'Hand over' }).click()
  await pickFromMultiselect(page, 'colleague', env.COLLEAGUE_NAME)
  await Promise.all([
    page.waitForResponse((r) => r.url().includes('/assign') && r.request().method() === 'PUT'),
    page.getByRole('button', { name: 'Hand over' }).last().click(),
  ])
  await page.waitForTimeout(1000)

  check('E2: row now shows the colleague', (await row.textContent())?.includes(env.COLLEAGUE_NAME))

  await shot(page, 'e-appointments')
  await page.context().close()
}

// ---------------------------------------------------------------------------
// Scenario F - Booking-client portal
// ---------------------------------------------------------------------------
async function scenarioF(browser, { eventName }) {
  console.log('\nScenario F: Booking-client portal')
  const page = await newIsolatedPage(browser)

  // The one login form in this suite driven for real - it's the thing being
  // tested, and there's no staff-guard complexity here worth skipping past.
  // Unlike the admin app (fixture users have an explicit language_id), these
  // public/unauthenticated pages default to Danish with no user context yet
  // ("Log ind", not "Login") - button text here isn't locale-safe to match,
  // so target the plain submit button instead.
  await page.goto(`${BASE}/booking/login`, { waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT })
  await page.locator('#email').fill(env.CLIENT_EMAIL)
  await page.locator('#password').fill(env.CLIENT_PASSWORD)
  await Promise.all([
    page.waitForURL('**/client/appointments', { timeout: USER_FETCH_TIMEOUT }),
    page.locator('form button[type="submit"]').click(),
  ])
  await page.waitForTimeout(1500)

  check('F1: landed on the appointments dashboard', page.url().includes('/client/appointments'))
  const row = await waitForRowByText(page, eventName, false)
  check('F2: the booking is listed', await row.count() > 0)

  // Same locale caveat as the login button above - use the row's one button
  // rather than its (possibly Danish) translated label.
  await row.getByRole('button').click()
  await page.waitForTimeout(500)
  check('F3: appointment detail modal shows the event name', await page.getByText(eventName, { exact: true }).count() > 0)

  await shot(page, 'f-client-portal')
  await page.context().close()
}

/**
 * A scenario throwing (a selector that never resolves, a real assertion
 * error) shouldn't take down every scenario after it - each is independent
 * enough to still be worth running and reporting on its own.
 */
async function runScenario(label, fn) {
  try {
    return await fn()
  } catch (e) {
    failures++
    console.error(`  FAIL ${label} threw: ${e.message}`)
    return {}
  }
}

async function main() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true })

  try {
    await runScenario('Scenario A', () => scenarioA(browser))
    const { link } = await runScenario('Scenario B', () => scenarioB(browser))
    const { eventUuid, eventName } = await runScenario('Scenario C', () => scenarioC(browser))
    await runScenario('Scenario C2', () => scenarioC2(browser))

    if (link && eventUuid) {
      await runScenario('Scenario D', () => scenarioD(browser, { link, eventUuid }))
      await runScenario('Scenario E', () => scenarioE(browser, { eventName }))
      await runScenario('Scenario F', () => scenarioF(browser, { eventName }))
    } else {
      failures++
      console.error('  FAIL Skipping D/E/F - Scenario B/C did not produce a link/event uuid')
    }
  } finally {
    await browser.close()
  }

  console.log(`\n${failures === 0 ? 'All checks passed.' : `${failures} check(s) failed.`}`)
  process.exit(failures === 0 ? 0 : 1)
}

main()
