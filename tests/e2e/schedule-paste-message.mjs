/**
 * Browser E2E for TKT-000138 (Birketoften): "den bliver ikke indsat, og ingen
 * fejl besked". A paste of shifts the employee already has is skipped, and the
 * month view said nothing at all. It now says what the paste did.
 *
 * In Månedsvisning (/schedules, "Månedsvisning"):
 *   C1 copy a day with one shift, paste it on an empty day -> "Vagtplan indsat"
 *   C2 paste the same day there again                      -> "Ingen vagter indsat",
 *      "Medarbejderne har allerede de samme vagter den dag."
 *   C3 copy an empty day and paste it                      -> "Ingen vagter indsat",
 *      "Der er ingen vagter på den dag, du kopierede."
 *
 * Setup and cleanup go through the API: one shift is created on a day of the
 * current month where nobody on the first page has a shift, and both it and
 * its pasted copy are deleted at the end.
 *
 * Run:  see tests/e2e/README.md
 * Env:  CO_TOKEN (required, an Admin - Admins are not held by the schedule lock)
 *       CO_BASE_URL (default http://localhost:3000)
 *       CO_API_URL (default http://127.0.0.1:8000)
 *       CO_NAV_TIMEOUT (optional, ms; default 180000)
 */
import { chromium } from 'playwright-core'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const TOKEN = process.env.CO_TOKEN
const BASE = process.env.CO_BASE_URL || 'http://localhost:3000'
const API = process.env.CO_API_URL || 'http://127.0.0.1:8000'
const NAV_TIMEOUT = Number(process.env.CO_NAV_TIMEOUT || 180000)
const HERE = path.dirname(fileURLToPath(import.meta.url))
const SHOT = path.join(HERE, 'screenshots')

if (!TOKEN) {
  console.error('Missing CO_TOKEN. See tests/e2e/README.md.')
  process.exit(2)
}

const results = []
const ok = (name, cond) => { results.push(cond); console.log(`${cond ? '✅' : '❌'} ${name}`) }
const note = (msg) => console.log(`   ${msg}`)

// The texts in all four languages, so the user's locale does not matter.
const LANGS = ['dk', 'en', 'no', 'sv'].map((l) => JSON.parse(readFileSync(path.join(HERE, `../../lang/${l}.json`), 'utf8')))
const texts = (key) => LANGS.map((j) => key.split('.').reduce((o, k) => o?.[k], j)).filter(Boolean)
const CP = 'dutySchedules.copyPaste.'
const COPY_LABELS = texts('dutySchedules.copy.copy')
const INSERT_HERE = texts('dutySchedules.monthView.insertHere')
const MONTH_VIEW = texts('calendar.view.monthView')

async function api(method, urlPath, body) {
  const url = new URL(`${API}/api/user${urlPath}`)
  if (method === 'GET' && body) for (const [k, v] of Object.entries(body)) url.searchParams.set(k, v)
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json', 'Content-Type': 'application/json' },
    body: method !== 'GET' && body ? JSON.stringify(body) : undefined,
  })
  return { status: res.status, json: await res.json().catch(() => null) }
}

const pad = (n) => String(n).padStart(2, '0')
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

async function monthRoster() {
  const now = new Date()
  const first = new Date(now.getFullYear(), now.getMonth(), 1)
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const { status, json } = await api('GET', '/duty-schedules/monthly/view', {
    page: 1, page_length: 50, date_start: ymd(first), date_end: ymd(last),
    filter_date_start: ymd(first), filter_date_end: ymd(last), department: 'All departments',
  })
  if (status !== 200) throw new Error(`monthly view: ${status} ${JSON.stringify(json)?.slice(0, 300)}`)
  return { employees: json?.data ?? [], first, last }
}

function shiftsOn(employees, date) {
  return employees.flatMap((e) => (e?.days?.[date]?.shifts ?? []).map((s) => ({ ...s, employee: e.uuid })))
}

// The day's cell in the month grid's day row (data-date), which carries the
// copy button or, while copying, the "insert here" box.
function dayCell(page, date) {
  return page.locator(`div[data-date="${date}"]`).first()
}

async function lastToast(page, previous) {
  await page.waitForFunction((n) => document.querySelectorAll('.vue-notification-template').length > n, previous, { timeout: 30000 })
  const toasts = page.locator('.vue-notification-template')
  const t = toasts.last()
  return {
    title: (await t.locator('.notification-title').innerText().catch(() => '')).trim(),
    text: (await t.locator('.notification-content').innerText().catch(() => '')).trim(),
  }
}

const toastCount = (page) => page.locator('.vue-notification-template').count()

async function copyDay(page, date) {
  const copyButton = COPY_LABELS.map((l) => `button[aria-label="${l}"]`).join(', ')
  await dayCell(page, date).locator(copyButton).first().click()
}

async function pasteDay(page, date) {
  const insert = page.getByText(new RegExp(INSERT_HERE.join('|')))
  // Close the toasts still up from the last paste, so the one read is this one.
  const toasts = page.locator('.vue-notification-template')
  while (await toasts.count() > 0) {
    await toasts.first().click().catch(() => {})
    await page.waitForTimeout(300)
  }
  await dayCell(page, date).locator(insert).first().click()
  return lastToast(page, 0)
}

async function stopCopying(page) {
  await page.keyboard.press('Escape').catch(() => {})
  const stop = page.getByText(new RegExp(`^(${texts(CP + 'stopCopying').join('|')})$`)).first()
  if (await stop.isVisible().catch(() => false)) await stop.click()
}

const created = []
const testDates = []
let browser
let currentPage
let testEmployee

try {
  // --- Setup: an employee on the first page, two empty days and one shift -----
  const { employees } = await monthRoster()
  const employee = employees[0]
  if (!employee) throw new Error('No employees on the first page of the month view.')

  const today = new Date()
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const emptyDays = []
  for (let d = 1; d <= daysInMonth; d++) {
    const date = ymd(new Date(today.getFullYear(), today.getMonth(), d))
    if (shiftsOn(employees, date).length === 0) emptyDays.push(d)
  }
  if (emptyDays.length < 3) throw new Error(`Need 3 days without shifts this month, found ${emptyDays.length}.`)
  const [srcDay, dstDay, emptySrcDay] = emptyDays
  const date = (d) => ymd(new Date(today.getFullYear(), today.getMonth(), d))
  testEmployee = employee
  testDates.push(date(srcDay), date(dstDay), date(emptySrcDay))
  note(`employee ${employee.uuid}; copy day ${date(srcDay)} -> ${date(dstDay)}; empty day ${date(emptySrcDay)}`)

  const types = await api('GET', '/shift-types', { page: 1, page_length: 50 })
  const shiftType = (types.json?.data ?? []).find((t) => t.time_in && t.time_out && t.time_in < t.time_out) ?? types.json?.data?.[0]
  if (!shiftType) throw new Error('No shift type found.')

  const make = await api('POST', '/duty-schedules', {
    user_uuid: employee.uuid,
    shift_type_uuid: shiftType.uuid,
    date_time_start: `${date(srcDay)} 08:00`,
    date_time_end: `${date(srcDay)} 16:00`,
    department_uuid: employee.departments?.[0]?.uuid ? [employee.departments[0].uuid] : [],
  })
  if (make.status !== 200) throw new Error(`create shift: ${make.status} ${JSON.stringify(make.json)?.slice(0, 300)}`)

  // --- Browser ----------------------------------------------------------------
  browser = await chromium.launch({ channel: 'chrome', headless: true })
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
  currentPage = page
  page.on('response', async (r) => {
    if (r.url().endsWith('/api/user/duty-schedules') && r.request().method() === 'POST') {
      const body = await r.json().catch(() => null)
      for (const s of body?.data ?? []) if (s?.uuid) created.push(s.uuid)
    }
  })

  await page.goto(`${BASE}/overview`, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT })
  await page.evaluate((t) => localStorage.setItem('_token', t), TOKEN)
  await page.goto(`${BASE}/schedules`, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT })
  await page.getByRole('button', { name: new RegExp(MONTH_VIEW.join('|')) }).first().click({ timeout: NAV_TIMEOUT })
  await page.waitForResponse((r) => r.url().includes('/duty-schedules/monthly/view'), { timeout: NAV_TIMEOUT })
  await page.waitForTimeout(1500)

  // C1
  await copyDay(page, date(srcDay))
  const t1 = await pasteDay(page, date(dstDay))
  note(`C1 toast: ${t1.title} - ${t1.text}`)
  ok('C1 pasting a day with a shift says "Vagtplan indsat"', texts(CP + 'resultTitle').includes(t1.title))

  // C2 (still copying: paste the same day on the same target again)
  await page.waitForTimeout(1500)
  const t2 = await pasteDay(page, date(dstDay))
  note(`C2 toast: ${t2.title} - ${t2.text}`)
  ok('C2 pasting it again says "Ingen vagter indsat"', texts(CP + 'noneCreatedTitle').includes(t2.title))
  ok('C2 ...because the employees already have the same shifts', texts(CP + 'manyAllSkippedDay').some((x) => t2.text.includes(x)))
  await stopCopying(page)

  // C3
  await page.waitForTimeout(1000)
  await copyDay(page, date(emptySrcDay))
  const t3 = await pasteDay(page, date(dstDay))
  note(`C3 toast: ${t3.title} - ${t3.text}`)
  ok('C3 pasting an empty day says "Ingen vagter indsat"', texts(CP + 'noneCreatedTitle').includes(t3.title))
  ok('C3 ...because there are no shifts on the copied day', texts(CP + 'daySourceEmpty').some((x) => t3.text.includes(x)))
  await stopCopying(page)

  await page.screenshot({ path: path.join(SHOT, 'schedule-paste-message.png') }).catch(() => {})

  // The paste really added one shift, once.
  const after = await monthRoster()
  const onDst = shiftsOn(after.employees, date(dstDay)).filter((s) => s.employee === employee.uuid)
  ok('exactly one shift was pasted on the target day', onDst.length === 1)

} catch (e) {
  console.error('❌ ' + (e?.stack || e))
  results.push(false)
  await currentPage?.screenshot({ path: path.join(SHOT, 'schedule-paste-message-failed.png'), fullPage: true }).catch(() => {})
} finally {
  await browser?.close()
  // Cleanup, also after a failure: the shift made for the test and everything
  // pasted from it (only this employee's shifts on the test days).
  if (testEmployee) {
    const after = await monthRoster().catch(() => ({ employees: [] }))
    const uuids = new Set([
      ...created,
      ...testDates.flatMap((d) => shiftsOn(after.employees, d).filter((s) => s.employee === testEmployee.uuid).map((s) => s.schedule_uuid)),
    ].filter(Boolean))
    for (const uuid of uuids) {
      const del = await api('DELETE', `/duty-schedules/${uuid}`, {})
      note(`cleanup ${uuid}: ${del.status}`)
    }
  }
}

const passed = results.filter(Boolean).length
console.log(`\n${passed}/${results.length} passed`)
process.exit(results.length > 0 && passed === results.length ? 0 : 1)
