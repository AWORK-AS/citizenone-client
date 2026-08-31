/**
 * Browser E2E for the per-page settings shortcut in the navbar.
 *
 * The settings all live in one list of their own, named after the thing they
 * configure rather than the page they affect, so changing what the duty
 * schedule offers meant already knowing the word "vagttyper" and where the
 * catalog keeps it. The navbar button carries the settings behind whatever
 * page is open.
 *
 * What this proves that a unit test cannot:
 * 1. The button appears on a mapped page and names the right settings.
 * 2. A more specific route wins: the journal notes page offers journal
 *    settings, not the citizen ones a plain prefix match would inherit.
 * 3. An entry actually navigates to its settings page.
 * 4. The settings catalog page still renders its full rail after the list
 *    moved into a shared composable.
 *
 * Read-only: it navigates and reads, and changes nothing, so it is safe to
 * re-run.
 *
 * Run:  see tests/e2e/README.md
 * Env:  CO_TOKEN (required, Admin - the shortcut is an admin's),
 *       CO_BASE_URL (default http://localhost:3001)
 */
import { chromium } from 'playwright-core'
import { fileURLToPath } from 'url'
import path from 'path'

const TOKEN = process.env.CO_TOKEN
const BASE = process.env.CO_BASE_URL || 'http://localhost:3001'
const SHOT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'screenshots')

// Same cold-boot race as the other tests: this SPA reboots on every hard
// navigation, and the route middleware denies a still-null user, so wait on
// the /api/user response rather than on 'networkidle'.
const USER_FETCH_TIMEOUT = 60000

if (!TOKEN) {
  console.error('CO_TOKEN is required (Admin). See tests/e2e/README.md')
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

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1500, height: 950 } })

async function goto(target) {
  await Promise.all([
    page.waitForResponse((r) => r.url().endsWith('/api/user') && r.request().method() === 'GET', { timeout: USER_FETCH_TIMEOUT }),
    page.goto(`${BASE}${target}`, { waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT }),
  ])
  await page.waitForTimeout(2500)
}

async function openShortcut() {
  const button = page.locator('button[aria-label="Indstillinger for denne side"]')
  if (await button.count() === 0) return null
  await button.first().click()
  await page.waitForTimeout(600)
  const labels = await page.locator('[role="menuitem"]').allInnerTexts()
  return labels.map((label) => label.trim()).filter(Boolean)
}

try {
  await page.goto(`${BASE}/overview`, { waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT })
  await page.evaluate((token) => localStorage.setItem('_token', token), TOKEN)
  await Promise.all([
    page.waitForResponse((r) => r.url().endsWith('/api/user') && r.request().method() === 'GET', { timeout: USER_FETCH_TIMEOUT }),
    page.reload({ waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT }),
  ])
  await page.waitForTimeout(2000)

  console.log('duty schedule')
  await goto('/schedules')
  const schedule = await openShortcut()
  check('the shortcut is there', schedule !== null)
  check('it offers shift types', (schedule || []).some((l) => /vagter/i.test(l)), JSON.stringify(schedule))
  check('it offers norm periods', (schedule || []).some((l) => /normperioder/i.test(l)))
  check('it ends with a way to all settings', (schedule || []).slice(-1)[0] === 'Alle indstillinger')
  check('it offers no journal settings', !(schedule || []).some((l) => /journal/i.test(l)))
  await page.screenshot({ path: `${SHOT}/page-settings-schedules.png` })
  await page.keyboard.press('Escape')

  console.log('journal notes - the more specific route wins')
  await goto('/journal-notes')
  const journal = await openShortcut()
  check('the shortcut is there', journal !== null)
  check('it offers journal titles', (journal || []).some((l) => /journal titler/i.test(l)), JSON.stringify(journal))
  check('it offers no shift settings', !(journal || []).some((l) => /vagt/i.test(l)))

  console.log('an entry navigates')
  await page.locator('[role="menuitem"]', { hasText: 'Journal titler' }).first().click()
  await page.waitForURL('**/settings/journal-titles', { timeout: USER_FETCH_TIMEOUT })
  check('it lands on the settings page', page.url().includes('/settings/journal-titles'))

  console.log('settings catalog still whole')
  await goto('/settings/absences')
  const rail = await page.locator('.catalog-shell button').allInnerTexts()
  check('the rail is fully populated', rail.length > 30, `${rail.length} entries`)
  const groups = await page.locator('.catalog-shell p').allInnerTexts()
  check('the rail keeps its category headings', groups.length >= 5, JSON.stringify(groups))
  check('the rail does not repeat the tab-bar settings', !rail.some((l) => l.trim() === 'Virksomhed'))
} finally {
  await browser.close()
}

console.log(failures === 0 ? '\nPASS' : `\nFAIL (${failures})`)
process.exit(failures === 0 ? 0 : 1)
