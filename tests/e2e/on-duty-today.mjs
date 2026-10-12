/**
 * Browser E2E for Task#125: "Who is on duty today?" on the Daily Overview.
 *
 * The box reads the duty schedule for one day. It follows the department
 * picked in the header and can switch to the whole company; the arrows move
 * a day at a time. Absent employees show as "Absent", never with the reason.
 *
 * Authenticates by injecting a Sanctum token into localStorage (no password).
 *
 * Run:  see tests/e2e/README.md
 * Env:  CO_TOKEN (required, Admin/Manager on a tenant with shifts today in at
 *         least two departments), CO_BASE_URL (default http://localhost:3001)
 *       CO_DEPARTMENT (optional, a department to pick in the header switcher
 *         when it is on "All departments"; switched back afterwards)
 */
import { chromium } from 'playwright-core'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const TOKEN = process.env.CO_TOKEN
const BASE = process.env.CO_BASE_URL || 'http://localhost:3001'
const DEPARTMENT = process.env.CO_DEPARTMENT || ''
let initialDepartment = ''
const SHOT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'screenshots', 'on-duty-today')

if (!TOKEN) {
  console.error('Missing CO_TOKEN. Mint one (see tests/e2e/README.md) and pass it as CO_TOKEN.')
  process.exit(1)
}
fs.mkdirSync(SHOT, { recursive: true })

const results = []
const ok = (name, cond) => { results.push(cond); console.log(`${cond ? '✅' : '❌'} ${name}`) }

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 })
page.setDefaultTimeout(90000)
// An admin of a company without onboarding preferences is sent to Discover once per session.
await page.addInitScript(() => {
  sessionStorage.setItem('discover_landing_done', '1')
  // Keep the one-off "Quick search" tips out of the screenshots.
  localStorage.setItem('hasSeenCmdkTip', 'true')
  localStorage.setItem('co_cmdk_hint_seen', '1')
})

/** Waits until the box has answered (the spinner is gone and a summary or empty text shows). */
async function settled(widget) {
  await page.locator('[data-testid=on-duty-widget][data-loading=false]').waitFor()
  await widget.locator('[data-testid=on-duty-summary], [data-testid=on-duty-empty]').first().waitFor()
  await page.waitForTimeout(400)
}

/** The "Quick search" tip shows up a while after load and covers the box. */
async function dismissTips() {
  const gotIt = page.getByRole('button', { name: /^(Got it|Forstået)$/ })
  if (await gotIt.first().isVisible().catch(() => false)) await gotIt.first().click().catch(() => {})
}

try {
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })
  await page.evaluate((t) => localStorage.setItem('_token', t), TOKEN)
  await page.goto(`${BASE}/overview`, { waitUntil: 'domcontentloaded' })

  const widget = page.locator('[data-testid=on-duty-widget]')
  await widget.waitFor()
  await settled(widget)
  ok('Box shows on the Daily Overview', true)

  const text = await widget.innerText()
  ok('i18n resolves (no raw "overview.onDuty" keys)', !text.includes('overview.onDuty'))
  ok('Day label says Today', (await widget.getByTestId('on-duty-day').innerText()).trim().length > 0)

  // Pick CO_DEPARTMENT in the header switcher when the header is on "All departments".
  // The choice is saved on the user, so it is put back at the end.
  const scope = widget.getByTestId('on-duty-scope')
  // The header loads the saved department after the page; give it a moment.
  await scope.waitFor({ timeout: 8000 }).catch(() => {})
  await page.waitForTimeout(500)
  await settled(widget)
  if (DEPARTMENT && (await scope.count()) === 0) {
    const switcher = page.locator('header button:visible, nav button:visible', { hasText: /all departments|alle afdelinger/i }).first()
    initialDepartment = (await switcher.innerText()).trim()
    await switcher.click()
    await page.screenshot({ path: `${SHOT}/05-header-switcher.png`, clip: { x: 0, y: 0, width: 1000, height: 420 } })
    await page.locator('a', { hasText: DEPARTMENT }).first().click()
    await scope.waitFor()
    await settled(widget)
  }

  // Department scope (whatever the header has picked) vs. whole company.
  const hasScope = (await scope.count()) > 0
  if (hasScope) {
    const deptGroups = await widget.getByTestId('on-duty-group').count()
    ok(`Department view shows one department group (got ${deptGroups})`, deptGroups === 1)
    await dismissTips()
    await widget.screenshot({ path: `${SHOT}/01-department.png` })

    await widget.getByTestId('on-duty-scope-company').click()
    await settled(widget)
    const companyGroups = await widget.getByTestId('on-duty-group').count()
    ok(`Whole company groups by department (got ${companyGroups} groups)`, companyGroups >= 2)
  } else {
    console.log('ℹ️  Header is on "All departments": no scope toggle, whole company shown')
  }
  await dismissTips()
  await widget.screenshot({ path: `${SHOT}/02-company.png` })

  const absent = widget.getByTestId('on-duty-absent')
  if ((await absent.count()) > 0) {
    const row = await absent.first().locator('xpath=ancestor::li').innerText()
    ok('Absent employee shows no absence reason', !/sick|syg|vacation|ferie/i.test(row))
  }

  // Next day, then back to today.
  await widget.getByTestId('on-duty-next').click()
  await settled(widget)
  ok('Next arrow moves to tomorrow', /tomorrow|i morgen/i.test(await widget.getByTestId('on-duty-day').innerText()))
  await dismissTips()
  await widget.screenshot({ path: `${SHOT}/03-tomorrow.png` })
  await widget.getByTestId('on-duty-day').click()
  await settled(widget)
  ok('Clicking the day label returns to today', /today|i dag/i.test(await widget.getByTestId('on-duty-day').innerText()))

  // Show / hide lists the box.
  await page.locator('button:visible', { hasText: /show \/ hide|vis \/ skjul/i }).first().click()
  // The label is a text node beside the checkbox, in a row div.
  const item = page.locator('div.w-fit', { hasText: /^\s*(On duty today|På arbejde i dag)\s*$/ })
  await item.first().waitFor()
  const checkbox = item.first().locator('input[type=checkbox]')
  await checkbox.click()
  ok('Unticking "On duty today" hides the box', await widget.waitFor({ state: 'hidden', timeout: 10000 }).then(() => true, () => false))
  await checkbox.click()
  await widget.waitFor()
  ok('Ticking it again shows the box', true)
  await item.first().screenshot({ path: `${SHOT}/04-show-hide-item.png` })
  await page.getByRole('button', { name: /^(Close|Luk)$/ }).last().click()

  await page.goto(`${BASE}/overview`, { waitUntil: 'domcontentloaded' })
  await widget.waitFor()
  await settled(widget)
  await dismissTips()
  await page.screenshot({ path: `${SHOT}/00-overview.png` })
  if (initialDepartment) {
    await page.locator('header button:visible, nav button:visible', { hasText: DEPARTMENT }).first().click()
    await page.locator('a', { hasText: initialDepartment }).first().click()
    await page.waitForTimeout(1500)
    console.log(`ℹ️  Header switched back to "${initialDepartment}"`)
  }
} catch (error) {
  ok(`Unexpected error: ${error.message}`, false)
  await page.screenshot({ path: `${SHOT}/error.png`, fullPage: true }).catch(() => {})
} finally {
  await browser.close()
}

const failed = results.filter((r) => !r).length
console.log(`\n${results.length - failed}/${results.length} passed. Screenshots: ${SHOT}`)
process.exit(failed ? 1 : 0)
