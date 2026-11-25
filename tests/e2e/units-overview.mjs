/**
 * Browser E2E for Roadmap #499: the units overview and the calendar's unit filter.
 *
 * What this proves:
 * 1. Calendar -> Units (week): the booked car's row shows its booking with the
 *    title; a colleague's private booking shows only as booked, without details.
 * 2. "Only free units" for Thursday 10-12 leaves only the free car.
 * 3. A click in a free spot opens a new event with the car and time filled in;
 *    saving it books that car.
 * 4. In the calendar, filtering by a unit shows only that unit's events.
 *
 * Needs a company with: an admin (CO_TOKEN), "Bil 1" booked "E2E Bil 1 tur" this
 * Thursday 10-12, "Bil 2", and a colleague's private event on Bil 2 that
 * Thursday 14-15. It creates one event itself (on Bil 2) and deletes it again.
 *
 * Run:  see tests/e2e/README.md
 * Env:  CO_TOKEN (required), CO_THURSDAY (YYYY-MM-DD, required), CO_CAR1_UUID, CO_CAR2_UUID (required),
 *       CO_BASE_URL (default http://localhost:3001), CO_API_URL (default http://localhost:8001),
 *       CO_SHOT_DIR (default tests/e2e/screenshots)
 */
import { chromium } from 'playwright-core'
import { fileURLToPath } from 'url'
import path from 'path'

const TOKEN = process.env.CO_TOKEN
const THURSDAY = process.env.CO_THURSDAY
const CAR1 = process.env.CO_CAR1_UUID
const CAR2 = process.env.CO_CAR2_UUID
const BASE = process.env.CO_BASE_URL || 'http://localhost:3001'
const API = (process.env.CO_API_URL || 'http://localhost:8001').replace(/\/$/, '')
const SHOT = process.env.CO_SHOT_DIR || path.join(path.dirname(fileURLToPath(import.meta.url)), 'screenshots')
const TIMEOUT = 60000

if (!TOKEN || !THURSDAY || !CAR1 || !CAR2) {
  console.error('CO_TOKEN, CO_THURSDAY, CO_CAR1_UUID and CO_CAR2_UUID are required. See the header of this file.')
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

async function api(method, route) {
  const res = await fetch(`${API}/api${route}`, { method, headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json' } })
  return { status: res.status, json: await res.json().catch(() => ({})) }
}

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } })
const problems = []
page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`))
page.on('console', (m) => { if (/units\.overview|calendar\.filter|calendar\.tabs\.units/.test(m.text())) problems.push(m.text().slice(0, 200)) })

async function open(route, waitFor) {
  await Promise.all([
    page.waitForResponse((r) => r.url().endsWith('/api/user') && r.request().method() === 'GET', { timeout: TIMEOUT }),
    page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: TIMEOUT }),
  ])
  if (waitFor) await page.locator(waitFor).first().waitFor({ timeout: TIMEOUT })
  await page.waitForTimeout(2000)
  const gotIt = page.locator('#headlessui-portal-root').getByRole('button', { name: /^(got it|forstået|forstått|uppfattat|ok)$/i })
  if (await gotIt.count()) {
    await gotIt.first().click()
    await page.waitForTimeout(500)
  }
}

const overviewLoaded = () => page.waitForResponse((r) => r.url().includes('/units/overview/bookings'), { timeout: TIMEOUT })
const row = (name) => page.locator('[data-testid="units-grid"] [data-testid="units-row"]').filter({ hasText: name })
const rowNames = async () => (await page.locator('[data-testid="units-grid"] [data-testid="units-row"]').allInnerTexts()).map((t) => t.split('\n')[0].trim())

let createdUuid = null
try {
  await page.goto(`${BASE}/overview`, { waitUntil: 'domcontentloaded', timeout: TIMEOUT })
  await page.evaluate((token) => localStorage.setItem('_token', token), TOKEN)

  console.log('Calendar -> Units, the week with Thursday')
  await open('/calendar', '[data-testid]')
  await page.getByRole('tab', { name: /^(Units|Enheder|Enheter)$/ }).or(page.locator('a, button').filter({ hasText: /^(Units|Enheder|Enheter)$/ })).first().click()
  await page.waitForURL('**/calendar/units', { timeout: TIMEOUT })
  check('the Units tab opens the overview', page.url().endsWith('/calendar/units'))
  await page.locator('[data-testid="units-grid"]').waitFor({ timeout: TIMEOUT })
  await Promise.all([overviewLoaded(), page.locator('[data-testid="units-date"]').fill(THURSDAY)])
  await page.waitForTimeout(800)

  check('both units are rows', JSON.stringify(await rowNames()) === JSON.stringify(['Bil 1', 'Bil 2']), JSON.stringify(await rowNames()))
  const car1Booking = row('Bil 1').locator('[data-testid="units-booking"]')
  check('Bil 1 shows its booking with the title', (await car1Booking.count()) === 1 && /E2E Bil 1 tur/.test(await car1Booking.innerText()), await car1Booking.allInnerTexts().then((t) => t.join('|')))
  check('the booking says 10:00–12:00', /10:00–12:00/.test(await car1Booking.innerText()))
  const hidden = row('Bil 2').locator('[data-testid="units-booking"][data-visible="0"]')
  check("a colleague's private booking shows only as booked", (await hidden.count()) === 1 && /^(Booked|Optaget)/.test((await hidden.innerText()).split('\n').pop().trim()) && !/E2E privat/.test(await hidden.innerText()),
    await hidden.allInnerTexts().then((t) => t.join('|')))
  await page.screenshot({ path: `${SHOT}/units-overview-week.png` })

  console.log('only free units, Thursday 10-12')
  await page.locator('[data-testid="units-only-free"]').check()
  const win = page.locator('[data-testid="units-free-window"] input')
  await win.nth(0).fill(THURSDAY)
  await win.nth(1).fill('10:00')
  await Promise.all([overviewLoaded(), win.nth(2).fill('12:00')])
  await page.waitForTimeout(800)
  check('only Bil 2 is free', JSON.stringify(await rowNames()) === JSON.stringify(['Bil 2']), JSON.stringify(await rowNames()))
  await Promise.all([overviewLoaded(), page.locator('[data-testid="units-only-free"]').uncheck()])
  await page.waitForTimeout(800)

  console.log('a free spot -> new event with the unit and time')
  await page.locator(`[data-testid="units-free-cell"][data-unit="${CAR2}"][data-date="${THURSDAY}"]`).click()
  const unitField = page.locator('#unit_uuid').locator('xpath=ancestor::div[contains(concat(" ", normalize-space(@class), " "), " multiselect ")][1]')
  await unitField.waitFor({ timeout: 20000 })
  await page.waitForTimeout(1500)
  const unitShown = ((await unitField.locator('.multiselect-single-label').textContent().catch(() => '')) || '').trim()
  check('the new event has Bil 2 filled in', unitShown === 'Bil 2', `"${unitShown}"`)
  await page.locator('#title').fill('E2E ny Bil 2')
  await page.screenshot({ path: `${SHOT}/units-overview-new-event.png` })
  const [saved] = await Promise.all([
    page.waitForResponse((r) => r.request().method() === 'POST' && /\/user\/my-calendars(\?|$)/.test(r.url()), { timeout: TIMEOUT }),
    page.locator('form button[type="submit"]').last().click(),
  ])
  const savedJson = await saved.json().catch(() => ({}))
  createdUuid = savedJson?.data?.uuid ?? savedJson?.data?.[0]?.uuid ?? null
  check('saving books it', saved.ok(), `${saved.status()} ${JSON.stringify(savedJson).slice(0, 200)}`)
  const after = await api('GET', `/user/units/overview/bookings?from=${THURSDAY}&to=${THURSDAY}&unit_uuids=${encodeURIComponent(JSON.stringify([CAR2]))}`)
  const titles = (after.json?.data?.[0]?.bookings ?? []).map((b) => b.title)
  check('Bil 2 now has the new event at 09:00', titles.includes('E2E ny Bil 2') && (after.json.data[0].bookings.find((b) => b.title === 'E2E ny Bil 2')?.start ?? '').endsWith('09:00:00'), JSON.stringify(after.json?.data?.[0]?.bookings))
  if (!createdUuid) createdUuid = (after.json?.data?.[0]?.bookings ?? []).find((b) => b.title === 'E2E ny Bil 2')?.calendar_uuid ?? null

  console.log('the calendar filtered by unit')
  await open('/calendar', '[data-testid]')
  await page.getByRole('button', { name: /^(Week|Uge|Uke|Vecka)$/ }).first().click()
  await page.waitForTimeout(1500)
  const visibleTitles = async () => (await page.locator('text=/^E2E (Bil 1 tur|ny Bil 2)$/').allInnerTexts()).map((t) => t.trim())
  const before = await visibleTitles()
  check('without a filter both events show', before.includes('E2E Bil 1 tur') && before.includes('E2E ny Bil 2'), JSON.stringify(before))
  await page.locator('[data-testid="calendar-filter-button"]').click()
  const unitSelect = page.locator('[data-testid="calendar-filter-units"]')
  await unitSelect.waitFor({ timeout: 10000 })
  await unitSelect.locator('.multiselect').first().click()
  await page.locator('#units-multiselect-options [role="option"]').filter({ hasText: 'Bil 1' }).first().click()
  // Close the dropdown by clicking the field's label; Escape would close the whole modal.
  await unitSelect.locator('p').first().click()
  await Promise.all([
    page.waitForResponse((r) => r.url().includes('/user/my-calendars') && r.url().includes('unit_uuids'), { timeout: TIMEOUT }),
    page.locator('#calendarFilterForm button[type="submit"]').click(),
  ])
  await page.waitForTimeout(1500)
  const filtered = await visibleTitles()
  check('filtered by Bil 1, only its event shows', filtered.includes('E2E Bil 1 tur') && !filtered.includes('E2E ny Bil 2'), JSON.stringify(filtered))
  check('the unit filter shows as a chip', (await page.getByText('Bil 1', { exact: true }).count()) >= 1)
  check('the event shows its unit colour', (await page.locator('[data-testid="event-unit-dot"]').count()) >= 1)
  await page.screenshot({ path: `${SHOT}/units-calendar-filtered.png` })

  console.log('remembered on this device')
  await open('/calendar', '[data-testid]')
  await page.waitForTimeout(1500)
  const reloaded = await visibleTitles()
  check('after a reload the filter still applies', reloaded.includes('E2E Bil 1 tur') && !reloaded.includes('E2E ny Bil 2'), JSON.stringify(reloaded))

  check('no page errors and no untranslated texts', problems.length === 0, problems.slice(0, 3).join(' | '))
} finally {
  if (createdUuid) console.log(`  removed the new event: ${(await api('DELETE', `/user/my-calendars/${createdUuid}`)).status}`)
  await browser.close()
}

console.log(failures === 0 ? '\nPASS' : `\nFAIL (${failures})`)
process.exit(failures === 0 ? 0 : 1)
