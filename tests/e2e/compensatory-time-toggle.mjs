/**
 * Browser E2E for task #478's compensatory-time feature after it was
 * converted from a purchasable "app" entitlement to a plain company
 * settings toggle (mirroring "Advarsel ved hviletid under 11 timer" and its
 * siblings under Settings > Company > "Vagtplan & arbejdstid").
 *
 * Covers both directions of the toggle:
 *  1. OFF - the "Request compensatory time" button is hidden for an employee,
 *     and the create endpoint 400s even if called directly.
 *  2. ON  - the employee can file a request through the real UI, and an
 *     admin can approve it through the review modal.
 *
 * Uses two browser contexts (Admin + Employee), each with its own injected
 * token, so both roles can be driven in the same run without swapping
 * localStorage back and forth.
 *
 * Run:  see tests/e2e/README.md
 * Env:  CO_TOKEN (required, Admin/Manager able to approve requests and edit
 *       company settings), CO_EMPLOYEE_TOKEN (required, a plain User in the
 *       same company with exactly one compensatory-time account assigned),
 *       CO_SCHEDULE_UUID (required, an existing future, non-leave shift
 *       belonging to that employee, with no pending compensatory-time
 *       request already on it - see README for the exact tinker snippet),
 *       CO_BASE_URL (default http://localhost:3000),
 *       CO_API_URL (default http://127.0.0.1:8000)
 */
import { chromium } from 'playwright-core'
import { fileURLToPath } from 'url'
import path from 'path'

const ADMIN_TOKEN = process.env.CO_TOKEN
const EMPLOYEE_TOKEN = process.env.CO_EMPLOYEE_TOKEN
const SCHEDULE_UUID = process.env.CO_SCHEDULE_UUID
const BASE = process.env.CO_BASE_URL || 'http://localhost:3000'
const API = process.env.CO_API_URL || 'http://127.0.0.1:8000'
const SHOT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'screenshots')

if (!ADMIN_TOKEN || !EMPLOYEE_TOKEN || !SCHEDULE_UUID) {
  console.error('Missing CO_TOKEN, CO_EMPLOYEE_TOKEN and/or CO_SCHEDULE_UUID. See tests/e2e/README.md.')
  process.exit(2)
}

const results = []
const ok = (name, cond) => { results.push(cond); console.log(`${cond ? '✅' : '❌'} ${name}`) }

async function api(method, urlPath, body, token) {
  const res = await fetch(`${API}/api/user${urlPath}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  return { status: res.status, json: await res.json().catch(() => null) }
}

// Locale-agnostic matchers - the label text/i18n keys touched by task-478
// exist in all four locales (dk/en/no/sv), and this suite doesn't control
// which one a given dev DB user has set.
const COMP_TIME_TOGGLE_LABEL = /Enable compensatory time requests|Aktivér afspadsering|Aktiver avspasering|Aktivera kompensationsledighet/i
const SAVE_BUTTON = /^(Save|Gem|Lagre|Spara)$/
const NEW_REQUEST_BUTTON = /Request compensatory time|Anmod om afspadsering|Be om avspasering|Begär kompensationsledighet/i
const SEND_REQUEST_BUTTON = /^(Send request|Send anmodning|Send forespørsel|Skicka förfrågan)$/
const REVIEW_TOOLTIP = /Compensatory time requests|Anmodninger om afspadsering|Forespørsler om avspasering|Begäran om kompensationsledighet/
const APPROVE_LABEL = /^(Approve|Godkend|Godkjenn|Godkänn)$/
const CONFIRM_BUTTON = /^(Confirm|Bekræft|Bekreft|Bekräfta)$/

const USER_FETCH_TIMEOUT = 60000

async function authAs(page, token) {
  await page.goto(`${BASE}/overview`, { waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT })
  await page.evaluate((t) => localStorage.setItem('_token', t), token)
  await Promise.all([
    page.waitForResponse((r) => r.url().endsWith('/api/user') && r.request().method() === 'GET', { timeout: USER_FETCH_TIMEOUT }),
    page.reload({ waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT }),
  ])
}

// Toggles the company setting from whatever it currently shows to `desired`
// through the real Settings UI (not a raw API call) and saves the form.
async function waitForFormHydration(adminPage, companyName) {
  // The form's `name` field (the one required field the client-side validator
  // checks) is filled in asynchronously by a watcher on the user store, after
  // the page's own domcontentloaded fires. Clicking Save before it lands trips
  // vuelidate's required-field check and the submit silently no-ops (no error
  // toast, no network request) - wait for the real value to land first.
  await adminPage.locator('#name').first().waitFor()
  await adminPage.waitForFunction(
    (expected) => document.querySelector('#name')?.value === expected,
    companyName,
  )
}

async function isToggleOn(toggle) {
  return (await toggle.getAttribute('aria-checked')) === 'true'
}

async function setCompanyToggle(adminPage, desired, companyName) {
  await adminPage.goto(`${BASE}/settings/company`, { waitUntil: 'domcontentloaded' })
  await waitForFormHydration(adminPage, companyName)
  const row = adminPage.locator('div.flex.items-center.gap-x-2').filter({ hasText: COMP_TIME_TOGGLE_LABEL })
  const toggle = row.locator('[role="switch"]')
  await toggle.waitFor()
  const isOn = await isToggleOn(toggle)
  if (isOn !== desired) {
    await toggle.click()
    // The page has more than one "Save" button (this form plus at least one
    // other section's own form) - scope to the form that actually wraps our
    // toggle row so the click isn't ambiguous.
    const ownForm = row.locator('xpath=ancestor::form[1]')
    const [response] = await Promise.all([
      adminPage.waitForResponse((r) => r.url().includes('/company/update/details') && r.request().method() === 'PUT'),
      ownForm.getByRole('button', { name: SAVE_BUTTON }).click(),
    ])
    if (response.status() < 200 || response.status() >= 300) throw new Error(`Saving company toggle failed (status ${response.status()})`)
  }
}

async function readToggleState(adminPage, companyName) {
  await waitForFormHydration(adminPage, companyName)
  const row = adminPage.locator('div.flex.items-center.gap-x-2').filter({ hasText: COMP_TIME_TOGGLE_LABEL })
  const toggle = row.locator('[role="switch"]')
  await toggle.waitFor()
  return isToggleOn(toggle)
}

// The duty-schedule week view lists every employee in the company as its own
// row (name + avatar + action icons, then the week's shift cells) all inside
// one `grid grid-cols-9` container - scoping to that row disambiguates the
// target employee's shift/review-icon from everyone else's on a busy roster.
function employeeRow(page, fullName) {
  return page.locator(`xpath=(//p[contains(., ${JSON.stringify(fullName)})])[1]/ancestor::div[contains(@class,"grid-cols-9")][1]`)
}

let originalEnabled = null
let companyName = null
let createdRequestUuid = null
const browser = await chromium.launch({ channel: 'chrome', headless: true })

try {
  // CompanyUpdateRequest requires `name` on every PUT, even one that only
  // touches the toggle - fetch it up front so the cleanup restore doesn't
  // 400 for missing it.
  const meRes = await api('GET', '', null, ADMIN_TOKEN)
  companyName = meRes.json?.data?.company?.name
  if (!companyName) throw new Error('Could not read the admin company name from /api/user')

  const employeeMeRes = await api('GET', '', null, EMPLOYEE_TOKEN)
  const employeeFullName = `${employeeMeRes.json?.data?.firstname || ''} ${employeeMeRes.json?.data?.lastname || ''}`.trim()
  if (!employeeFullName) throw new Error('Could not read the employee name from /api/user')

  const scheduleRes = await api('GET', `/duty-schedules/${SCHEDULE_UUID}`, null, EMPLOYEE_TOKEN)
  ok('Fixture shift is reachable via the API', scheduleRes.status >= 200 && scheduleRes.status < 300)
  const startTime = scheduleRes.json?.data?.date_time_start
  if (!startTime) throw new Error('Could not read date_time_start for CO_SCHEDULE_UUID')
  // The UI renders this as a naive wall-clock value (moment() with no explicit
  // timezone) - slice the string directly rather than going through a JS Date,
  // which would apply this host's local timezone and produce a shifted value
  // that never appears on the page.
  const hhmm = startTime.slice(11, 16)

  const adminContext = await browser.newContext()
  const employeeContext = await browser.newContext()
  const adminPage = await adminContext.newPage()
  const employeePage = await employeeContext.newPage()
  adminPage.setDefaultTimeout(30000)
  employeePage.setDefaultTimeout(30000)

  await authAs(adminPage, ADMIN_TOKEN)
  await authAs(employeePage, EMPLOYEE_TOKEN)

  await adminPage.goto(`${BASE}/settings/company`, { waitUntil: 'domcontentloaded' })
  originalEnabled = await readToggleState(adminPage, companyName)

  // --- Phase 1: toggle OFF -> hidden in UI, blocked server-side ---
  await setCompanyToggle(adminPage, false, companyName)
  ok('Toggle shows OFF after saving', (await readToggleState(adminPage, companyName)) === false)

  await employeePage.goto(`${BASE}/schedules`, { waitUntil: 'domcontentloaded' })
  await employeeRow(employeePage, employeeFullName).getByText(hhmm, { exact: true }).first().click()
  await employeePage.screenshot({ path: `${SHOT}/comp-time-01-toggle-off.png`, fullPage: true })
  const requestButtonHiddenWhenOff = await employeePage.getByRole('button', { name: NEW_REQUEST_BUTTON }).count() === 0
  ok('"Request compensatory time" button is hidden while the toggle is off', requestButtonHiddenWhenOff)
  await employeePage.keyboard.press('Escape')

  const blockedApiRes = await api('POST', '/compensatory-time-requests', { schedule_uuid: SCHEDULE_UUID }, EMPLOYEE_TOKEN)
  ok('Direct API create is blocked with a 400 while the toggle is off', blockedApiRes.status === 400)

  // --- Phase 2: toggle ON -> works end-to-end ---
  await setCompanyToggle(adminPage, true, companyName)
  await adminPage.reload({ waitUntil: 'domcontentloaded' })
  ok('Toggle stays ON after a page reload (persisted)', (await readToggleState(adminPage, companyName)) === true)

  await employeePage.reload({ waitUntil: 'domcontentloaded' })
  await employeeRow(employeePage, employeeFullName).getByText(hhmm, { exact: true }).first().click()
  const requestButton = employeePage.getByRole('button', { name: NEW_REQUEST_BUTTON })
  await requestButton.waitFor()
  ok('"Request compensatory time" button appears once the toggle is on', true)
  await requestButton.click()

  const sendButton = employeePage.getByRole('button', { name: SEND_REQUEST_BUTTON })
  await sendButton.waitFor()
  await employeePage.screenshot({ path: `${SHOT}/comp-time-02-new-request.png`, fullPage: true })
  const [createRes] = await Promise.all([
    employeePage.waitForResponse((r) => r.url().endsWith('/compensatory-time-requests') && r.request().method() === 'POST'),
    sendButton.click(),
  ])
  const createJson = await createRes.json().catch(() => null)
  if (createRes.status() < 200 || createRes.status() >= 300) console.log('  create failed:', createRes.status(), JSON.stringify(createJson))
  ok('Creating the request succeeds (2xx)', createRes.status() >= 200 && createRes.status() < 300)
  createdRequestUuid = createJson?.data?.uuid || null

  // --- Phase 3: admin reviews and approves it ---
  await adminPage.goto(`${BASE}/schedules`, { waitUntil: 'domcontentloaded' })
  await employeeRow(adminPage, employeeFullName).getByRole('button', { name: REVIEW_TOOLTIP }).click()
  await adminPage.getByRole('button', { name: APPROVE_LABEL }).first().waitFor()
  await adminPage.screenshot({ path: `${SHOT}/comp-time-03-review-modal.png`, fullPage: true })
  await adminPage.getByRole('button', { name: APPROVE_LABEL }).first().click()
  const [approveRes] = await Promise.all([
    adminPage.waitForResponse((r) => r.url().includes('/compensatory-time-requests/') && r.url().endsWith('/approve')),
    adminPage.getByRole('button', { name: CONFIRM_BUTTON }).click(),
  ])
  if (approveRes.status() < 200 || approveRes.status() >= 300) console.log('  approve failed:', approveRes.status(), JSON.stringify(await approveRes.json().catch(() => null)))
  ok('Approving the request succeeds (2xx)', approveRes.status() >= 200 && approveRes.status() < 300)
  await adminPage.screenshot({ path: `${SHOT}/comp-time-04-approved.png`, fullPage: true })

  await adminContext.close()
  await employeeContext.close()
} catch (e) {
  ok('Unexpected error: ' + e.message, false)
} finally {
  if (createdRequestUuid) {
    // The request is already approved by this point - reverse it so the
    // shift and time-account balance return to their pre-test state.
    const reverseRes = await api('POST', `/compensatory-time-requests/${createdRequestUuid}/reverse`, {}, ADMIN_TOKEN)
    console.log(reverseRes.status >= 200 && reverseRes.status < 300 ? '↩︎  reversed the created request' : `⚠️  reverse cleanup failed (status ${reverseRes.status})`)
  }
  if (originalEnabled !== null && companyName) {
    const restoreRes = await api('PUT', '/company/update/details', { name: companyName, compensatory_time_enabled: originalEnabled }, ADMIN_TOKEN)
    console.log(restoreRes.status >= 200 && restoreRes.status < 300 ? `↩︎  restored company toggle to ${originalEnabled}` : `⚠️  toggle restore failed (status ${restoreRes.status})`)
  }
  await browser.close()
}

const passed = results.filter(Boolean).length
console.log(`\n=== ${passed}/${results.length} PASS ===`)
process.exit(passed === results.length ? 0 : 1)
