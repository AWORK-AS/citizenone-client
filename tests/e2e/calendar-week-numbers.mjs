/**
 * Browser E2E for Roadmap #303: week numbers in the calendars.
 *
 * Week numbers follow the ISO / Danish standard. The week view and month view
 * of "My calendar" already showed them; this proves the rest:
 *  - My calendar, Day: badge in the header + a week number in front of every
 *    row of the small month calendar (also across new year: 53, then 1).
 *  - Citizen record, Calendar: Day (badge + small calendar), Week (badge, also
 *    across new year) and Month (the number on each Monday).
 *  - Phone width: the badge does not push the page sideways.
 *  - The expected numbers are worked out here with a separate ISO algorithm,
 *    not by the app's own helper.
 *
 * Read-only: it navigates and clicks around, and changes nothing.
 *
 * Run:  see tests/e2e/README.md
 * Env:  CO_TOKEN (required, an Admin), CO_CITIZEN_UUID (required),
 *       CO_BASE_URL (default http://localhost:3001),
 *       CO_SHOT_DIR (default tests/e2e/screenshots)
 */
import { chromium } from 'playwright-core'
import { fileURLToPath } from 'url'
import path from 'path'

const TOKEN = process.env.CO_TOKEN
const CITIZEN = process.env.CO_CITIZEN_UUID
const BASE = process.env.CO_BASE_URL || 'http://localhost:3001'
const SHOT = process.env.CO_SHOT_DIR || path.join(path.dirname(fileURLToPath(import.meta.url)), 'screenshots')
const USER_FETCH_TIMEOUT = 60000

if (!TOKEN || !CITIZEN) {
  console.error('CO_TOKEN (Admin) and CO_CITIZEN_UUID are required. See tests/e2e/README.md')
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

// ISO 8601 week, written out here on purpose (not the app's helper).
function isoWeek(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number)
  const t = new Date(Date.UTC(y, m - 1, d))
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7))
  const jan1 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1))
  return Math.ceil(((t - jan1) / 86400000 + 1) / 7)
}
const pad = (n) => String(n).padStart(2, '0')
const localIso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const TODAY = localIso(new Date())
const digits = (text) => Number((text || '').match(/\d+/)?.[0])

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1500, height: 950 } })

const problems = []
page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`))
page.on('console', (m) => {
  const text = m.text()
  if (/isoWeekOf|isoWeekNumber|calendar\.week(Number|Short)/.test(text)) problems.push(`${m.type()}: ${text.slice(0, 200)}`)
})

async function goto(target) {
  await Promise.all([
    page.waitForResponse((r) => r.url().endsWith('/api/user') && r.request().method() === 'GET', { timeout: USER_FETCH_TIMEOUT }),
    page.goto(`${BASE}${target}`, { waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT }),
  ])
  await page.waitForTimeout(3500)
}

const badge = () => page.locator('[data-testid="week-number-badge"]')
const button = (name) => page.getByRole('button', { name, exact: true }).first()

/** The small month calendar: week numbers next to the first day of their row. */
async function miniRows() {
  return page.evaluate(() => [...document.querySelectorAll('[data-testid="mini-week-number"]')].map((el) => ({
    shown: el.textContent.trim(),
    title: el.getAttribute('title'),
    firstDay: el.nextElementSibling?.querySelector('time')?.getAttribute('datetime'),
  })))
}

async function checkMini(label) {
  const rows = await miniRows()
  check(`${label}: a week number in front of every row (${rows.length} rows)`, rows.length >= 4 && rows.length <= 6)
  check(`${label}: each number is the ISO week of the row's Monday`,
    rows.every((r) => r.firstDay && digits(r.shown) === isoWeek(r.firstDay)),
    JSON.stringify(rows))
  check(`${label}: hovering gives the long form`, rows.every((r) => r.title && r.title.includes(String(digits(r.shown)))), rows[0]?.title)
  // The weekday letters must still sit over their days: the Monday letter above the first Monday.
  const aligned = await page.evaluate(() => {
    const first = document.querySelector('[data-testid="mini-week-number"]')
    const days = first?.parentElement
    const header = days?.previousElementSibling
    const monday = header?.children?.[1]
    const firstDay = first?.nextElementSibling
    if (!monday || !firstDay) return null
    const a = monday.getBoundingClientRect()
    const b = firstDay.getBoundingClientRect()
    return Math.abs((a.left + a.width / 2) - (b.left + b.width / 2))
  })
  check(`${label}: weekday letters line up with the days`, aligned !== null && aligned < 2, `off by ${aligned}px`)
}

async function checkBadge(label, expectedIso) {
  const el = badge()
  const visible = (await el.count()) === 1 && (await el.isVisible())
  const text = visible ? await el.innerText() : ''
  check(`${label}: badge shows week ${isoWeek(expectedIso)}`, visible && digits(text) === isoWeek(expectedIso), `"${text.trim()}" for ${expectedIso}`)
  check(`${label}: no untranslated key`, !/calendar\./.test(text), text)
}

try {
  await page.goto(`${BASE}/overview`, { waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT })
  await page.evaluate((token) => localStorage.setItem('_token', token), TOKEN)
  await Promise.all([
    page.waitForResponse((r) => r.url().endsWith('/api/user') && r.request().method() === 'GET', { timeout: USER_FETCH_TIMEOUT }),
    page.reload({ waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT }),
  ])
  await page.waitForTimeout(2000)

  // ---------------------------------------------------------------- my calendar
  console.log('my calendar - day')
  await goto('/calendar')
  await button('Day').click()
  await page.waitForTimeout(1200)
  await checkBadge('header', TODAY)
  await checkMini('mini calendar')
  await page.screenshot({ path: `${SHOT}/week-numbers-my-calendar-day.png` })

  console.log('my calendar - day, across new year')
  const mini = page.locator('.rounded-2xl').filter({ has: page.locator('[data-testid="mini-week-number"]') }).first()
  for (let i = 0; i < 3; i++) {
    const [y, m] = TODAY.split('-').map(Number)
    const months = (2027 - y) * 12 + (1 - m)
    if (months <= i) break
    await mini.getByRole('button', { name: 'Next month' }).click()
    await page.waitForTimeout(500)
  }
  const rows = await miniRows()
  check('January 2027 shows week 53 and then week 1', rows.some((r) => digits(r.shown) === 53) && rows.some((r) => digits(r.shown) === 1), JSON.stringify(rows.map((r) => r.shown)))
  await mini.locator('time[datetime="2027-01-01"]').click()
  await page.waitForTimeout(500)
  await checkBadge('1 Jan 2027 (Friday)', '2027-01-01')
  await mini.locator('time[datetime="2027-01-03"]').click()
  await page.waitForTimeout(300)
  await checkBadge('3 Jan 2027 (Sunday)', '2027-01-03')
  await mini.locator('time[datetime="2027-01-04"]').click()
  await page.waitForTimeout(300)
  await checkBadge('4 Jan 2027 (Monday)', '2027-01-04')
  await page.screenshot({ path: `${SHOT}/week-numbers-my-calendar-day-newyear.png` })

  console.log('my calendar - week and month (already had week numbers)')
  await button('Week').click()
  await page.waitForTimeout(1200)
  check('week view still has a badge', (await page.getByText(/^(Week|Uge|Uke|Vecka) \d+$/).count()) >= 1)
  await button('Month').click()
  await page.waitForTimeout(1200)
  const monthNumbers = await page.evaluate(() => [...document.querySelectorAll('span[title]')].filter((el) => /^[A-ZÅ]\d{1,2}$/.test(el.textContent.trim())).map((el) => el.textContent.trim()))
  check('month view still marks the Mondays', monthNumbers.length >= 4 && monthNumbers.length <= 6, JSON.stringify(monthNumbers))

  // ------------------------------------------------------------ citizen calendar
  console.log('citizen calendar - day')
  await goto(`/citizens/${CITIZEN}/calendar`)
  await button('Day').click()
  await page.waitForTimeout(1200)
  await checkBadge('header', TODAY)
  await checkMini('mini calendar')
  await page.screenshot({ path: `${SHOT}/week-numbers-citizen-day.png` })

  console.log('citizen calendar - week')
  await button('Week').click()
  await page.waitForTimeout(1200)
  await checkBadge('this week', TODAY)
  await page.screenshot({ path: `${SHOT}/week-numbers-citizen-week.png` })
  const next = page.getByRole('button', { name: 'Next week' })
  let cursor = new Date()
  const target = new Date(2027, 0, 5) // a Tuesday in week 1 of 2027
  let sawFiftyThree = false
  for (let i = 0; i < 12 && localIso(cursor) < localIso(target); i++) {
    await next.click()
    await page.waitForTimeout(600)
    cursor = new Date(cursor.getTime() + 7 * 86400000)
    const text = await badge().innerText()
    check(`week after ${i + 1} step(s) shows ${isoWeek(localIso(cursor))}`, digits(text) === isoWeek(localIso(cursor)), `"${text.trim()}" for ${localIso(cursor)}`)
    if (digits(text) === 53) sawFiftyThree = true
  }
  check('stepping through new year passes week 53 and lands on week 1', sawFiftyThree && digits(await badge().innerText()) === 1)
  await page.screenshot({ path: `${SHOT}/week-numbers-citizen-week-newyear.png` })

  console.log('citizen calendar - month')
  await button('Month').click()
  await page.waitForTimeout(1200)
  const monthLabels = await page.evaluate(() => [...document.querySelectorAll('[data-testid="month-week-number"]')].map((el) => ({
    shown: el.textContent.trim(),
    day: el.parentElement.querySelector('time')?.getAttribute('datetime'),
  })))
  check(`a number on each Monday (${monthLabels.length} rows)`, monthLabels.length >= 4 && monthLabels.length <= 6)
  check('each is the ISO week of that Monday', monthLabels.every((l) => l.day && digits(l.shown) === isoWeek(l.day)), JSON.stringify(monthLabels))
  check('only Mondays carry one', monthLabels.every((l) => new Date(`${l.day}T12:00:00`).getDay() === 1), JSON.stringify(monthLabels))
  await page.screenshot({ path: `${SHOT}/week-numbers-citizen-month.png` })

  // -------------------------------------------------------------- phone width
  console.log('phone width')
  await page.setViewportSize({ width: 390, height: 844 })
  for (const [where, route] of [['my calendar', '/calendar'], ['citizen calendar', `/citizens/${CITIZEN}/calendar`]]) {
    await goto(route)
    await button('Day').click()
    await page.waitForTimeout(1000)
    const fit = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="week-number-badge"]')
      const r = el?.getBoundingClientRect()
      return { overflow: document.documentElement.scrollWidth - window.innerWidth, left: r?.left, right: r?.right, width: window.innerWidth, found: !!el }
    })
    check(`${where}: badge inside the screen`, fit.found && fit.left >= 0 && fit.right <= fit.width, JSON.stringify(fit))
    await page.screenshot({ path: `${SHOT}/week-numbers-phone-${route.startsWith('/citizens') ? 'citizen' : 'my'}-day.png` })
    // The navbar's profile button already sticks out by 2px at this width, so judge only what the badge adds.
    await page.addStyleTag({ content: '[data-testid="week-number-badge"],[data-testid="mini-week-number"]{display:none !important}' })
    const without = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    check(`${where}: the badge adds no sideways scroll`, fit.overflow <= without, `${fit.overflow}px with it, ${without}px without`)
  }

  check('no page errors and no missing-key warnings about week numbers', problems.length === 0, problems.slice(0, 3).join(' | '))
} finally {
  await browser.close()
}

console.log(failures === 0 ? '\nPASS' : `\nFAIL (${failures})`)
process.exit(failures === 0 ? 0 : 1)
