/**
 * Browser E2E for recalling a patient from their own screen.
 *
 * The clinic-wide recall list could record that a patient had been called back
 * in, and was the only place that could. From the patient's own screen a
 * colleague who had just rung left no trace, the screen could not say whether
 * anyone had already been in touch, and the natural next thing - a time in the
 * book - was a tab away with the date typed in again.
 *
 * What this proves that a backend test cannot:
 * 1. The patient screen says when they were last called in, and says so before
 *    anyone has.
 * 2. Recalling from there records it, and the screen updates.
 * 3. Booking from there lands on the patient's calendar with the new-event form
 *    open on the right day.
 * 4. An overdue patient books forward: the form opens on today, not on the day
 *    they were due months ago.
 *
 * Setup and cleanup go through the API, so it is safe to re-run: the check-up
 * settings it writes are restored at the end.
 *
 * Run:  see tests/e2e/README.md
 * Env:  CO_TOKEN (required, Admin at a dental clinic), CO_CITIZEN_UUID
 *       (required), CO_BASE_URL (default http://localhost:3001),
 *       CO_API_URL (default http://localhost:8001)
 */
import { chromium } from 'playwright-core'
import { fileURLToPath } from 'url'
import path from 'path'

const TOKEN = process.env.CO_TOKEN
const CITIZEN = process.env.CO_CITIZEN_UUID
const BASE = process.env.CO_BASE_URL || 'http://localhost:3001'
const API = process.env.CO_API_URL || 'http://localhost:8001'
const SHOT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'screenshots')
const USER_FETCH_TIMEOUT = 60000

if (!TOKEN || !CITIZEN) {
  console.error('CO_TOKEN and CO_CITIZEN_UUID are required. See tests/e2e/README.md')
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

async function api(method, urlPath, body) {
  const response = await fetch(`${API}/api${urlPath}`, {
    method,
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json', 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })

  return { status: response.status, body: await response.json().catch(() => null) }
}

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } })

let original = null

async function openToothChart() {
  await Promise.all([
    page.waitForResponse((r) => r.url().endsWith('/api/user') && r.request().method() === 'GET', { timeout: USER_FETCH_TIMEOUT }),
    page.goto(`${BASE}/citizens/${CITIZEN}/tooth-chart`, { waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT }),
  ])
  await page.waitForTimeout(4000)
}

try {
  const before = await api('GET', `/user/citizens/${CITIZEN}/tooth-chart`)
  original = before.body?.data?.patient || null

  // A patient who was due a while ago and has never been called in.
  await api('PUT', `/user/citizens/${CITIZEN}/tooth-chart/checkup`, {
    last_checkup_date: '2025-01-10', checkup_interval_months: 6, recall_channel: 'phone', auto_reminder: false,
  })
  await api('PUT', `/user/citizens/${CITIZEN}/dental-profile/clear-reminder`).catch(() => null)

  await page.goto(`${BASE}/overview`, { waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT })
  await page.evaluate((token) => localStorage.setItem('_token', token), TOKEN)
  await Promise.all([
    page.waitForResponse((r) => r.url().endsWith('/api/user') && r.request().method() === 'GET', { timeout: USER_FETCH_TIMEOUT }),
    page.reload({ waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT }),
  ])
  await page.waitForTimeout(2500)

  console.log('the patient screen')
  await openToothChart()
  check('it offers to recall the patient', await page.locator('button', { hasText: 'Indkald' }).count() > 0)
  check('and to give them a time', await page.locator('button', { hasText: 'Book tid' }).count() > 0)
  await page.screenshot({ path: `${SHOT}/recall-on-patient.png` })

  console.log('recalling')
  await page.locator('button', { hasText: 'Indkald' }).first().click()
  await page.waitForTimeout(3000)
  await openToothChart()
  const recalled = await page.locator('main').innerText()
  check('the screen now says when they were called in', recalled.includes('Sidst indkaldt'), recalled.slice(0, 160))

  const profile = await api('GET', `/user/citizens/${CITIZEN}/tooth-chart`)
  check('and the record holds it', !!profile.body?.data?.patient?.last_reminder_sent_at)

  console.log('booking a time')
  await page.locator('button', { hasText: 'Book tid' }).first().click()
  await page.waitForTimeout(5000)
  check('it lands on the patient\'s calendar', page.url().includes(`/citizens/${CITIZEN}/calendar`), page.url())
  check('with the new-event form open', await page.locator('[role=dialog]').count() > 0)
  // Due in 2025 and long overdue, so the form must not open on a past date.
  const openedOn = new URL(page.url()).searchParams.get('date')
  check('and no attempt to book backwards', !openedOn || openedOn <= new Date().toISOString().slice(0, 10), String(openedOn))
  await page.screenshot({ path: `${SHOT}/recall-book-time.png` })
} finally {
  if (original) {
    await api('PUT', `/user/citizens/${CITIZEN}/tooth-chart/checkup`, {
      last_checkup_date: original.last_checkup_date,
      checkup_interval_months: original.checkup_interval_months,
      recall_channel: original.recall_channel,
      auto_reminder: original.auto_reminder,
    })
  }
  await browser.close()
}

console.log(failures === 0 ? '\nPASS' : `\nFAIL (${failures})`)
process.exit(failures === 0 ? 0 : 1)
