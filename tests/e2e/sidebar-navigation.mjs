/**
 * Browser E2E for the two navigation changes that answer "I cannot find
 * anything in here": settings reachable from search, and foldable sidebar
 * sections.
 *
 * What this proves that a unit test cannot:
 * 1. The command palette's resting list is still just the pages - adding some
 *    fifty settings to it must not bury the handful of entries people open it
 *    for.
 * 2. Typing finds a setting by the page it configures, not only by its own
 *    name: "vagt" reaches shift types, "ordliste" reaches the page that renames
 *    the citizen.
 * 3. A section folds, stays folded across a reload, and unfolds again.
 * 4. A folded section still opens when the page you are on lives inside it, so
 *    the sidebar never hides where you are.
 *
 * Read-only: it navigates, types and folds, and writes nothing but its own
 * localStorage preference, which it clears at the end.
 *
 * Run:  see tests/e2e/README.md
 * Env:  CO_TOKEN (required, Admin - the settings entries are an admin's),
 *       CO_BASE_URL (default http://localhost:3001)
 */
import { chromium } from 'playwright-core'
import { fileURLToPath } from 'url'
import path from 'path'

const TOKEN = process.env.CO_TOKEN
const BASE = process.env.CO_BASE_URL || 'http://localhost:3001'
const SHOT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'screenshots')
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
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } })

const RESULTS = 'div.max-h-80'
const paletteInput = () => page.locator('input[type=text]').first()
const sectionToggles = () => page.locator('nav button[aria-expanded]')
const visibleNavItems = () => page.locator('nav li ul li:visible').count()

async function bootAndReload() {
  await Promise.all([
    page.waitForResponse((r) => r.url().endsWith('/api/user') && r.request().method() === 'GET', { timeout: USER_FETCH_TIMEOUT }),
    page.reload({ waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT }),
  ])
  await page.waitForTimeout(4000)
}

async function search(term) {
  await paletteInput().fill(term)
  await page.waitForTimeout(700)
  const labels = await page.locator(`${RESULTS} button`).allInnerTexts()
  return labels.map((label) => label.trim()).filter(Boolean)
}

try {
  await page.goto(`${BASE}/overview`, { waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT })
  await page.evaluate((token) => localStorage.setItem('_token', token), TOKEN)
  await bootAndReload()

  console.log('command palette')
  await page.keyboard.press('Meta+k')
  await page.waitForTimeout(800)
  const restingGroups = await page.locator(`${RESULTS} > p`).allInnerTexts()
  check('the resting list offers no settings', !restingGroups.some((g) => /indstillinger|settings/i.test(g)), JSON.stringify(restingGroups))

  const byPage = await search('vagt')
  check('a settings page is found by the page it configures', byPage.some((l) => /vagtregler/i.test(l)), JSON.stringify(byPage))

  const byName = await search('ordliste')
  check('a settings page is found by its own name', byName.some((l) => /ordliste/i.test(l)), JSON.stringify(byName))
  await page.screenshot({ path: `${SHOT}/palette-settings-search.png` })
  await page.keyboard.press('Escape')
  await page.waitForTimeout(500)

  console.log('foldable sections')
  const toggles = sectionToggles()
  check('every section has a fold control', await toggles.count() >= 2, `${await toggles.count()} sections`)

  const beforeFold = await visibleNavItems()
  await toggles.nth(1).click()
  await page.waitForTimeout(500)
  const folded = await visibleNavItems()
  check('folding hides that section\'s entries', folded < beforeFold, `${beforeFold} -> ${folded}`)
  await page.screenshot({ path: `${SHOT}/sidebar-folded.png` })

  await bootAndReload()
  check('the fold survives a reload', await visibleNavItems() === folded, `${await visibleNavItems()} vs ${folded}`)

  // The overview lives in the first section, so folding that one must not be
  // able to hide the page currently open.
  await sectionToggles().nth(0).click()
  await page.waitForTimeout(500)
  const overviewEntry = page.locator('nav li ul li:visible', { hasText: 'Oversigt' })
  check('the section holding the open page stays open', await overviewEntry.count() > 0)

  await sectionToggles().nth(1).click()
  await page.waitForTimeout(500)
  check('unfolding brings the entries back', await visibleNavItems() > folded)
} finally {
  await page.evaluate(() => localStorage.removeItem('co_sidebar_collapsed_groups')).catch(() => {})
  await browser.close()
}

console.log(failures === 0 ? '\nPASS' : `\nFAIL (${failures})`)
process.exit(failures === 0 ? 0 : 1)
