/**
 * Browser E2E for the shared toggle, FormSwitch.
 *
 * It was a Headless UI Switch handed a stringified `value` it does not read,
 * wrapped in a div that carried the click. Three things followed, all of them
 * only visible in a browser:
 *
 * 1. The switch never learned its own state, so every one of the company
 *    settings announced itself as off - 43 of them wrongly - to anyone reading
 *    the page rather than looking at it.
 * 2. None of them had a name, so they read as fifty-odd identical "switch".
 * 3. The keyboard could focus one and never flip it, because the click sat on
 *    the wrapper. The whole settings page needed a mouse.
 *
 * Company settings is the page that shows it: it is nothing but toggles.
 *
 * Read-only: it flips one toggle in the form and never saves, so nothing is
 * written and it is safe to re-run.
 *
 * Run:  see tests/e2e/README.md
 * Env:  CO_TOKEN (required, Admin), CO_BASE_URL (default http://localhost:3001)
 */
import { chromium } from 'playwright-core'

const TOKEN = process.env.CO_TOKEN
const BASE = process.env.CO_BASE_URL || 'http://localhost:3001'
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

try {
  await page.goto(`${BASE}/overview`, { waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT })
  await page.evaluate((token) => localStorage.setItem('_token', token), TOKEN)
  await Promise.all([
    page.waitForResponse((r) => r.url().endsWith('/api/user') && r.request().method() === 'GET', { timeout: USER_FETCH_TIMEOUT }),
    page.reload({ waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT }),
  ])
  await page.waitForTimeout(3000)
  await Promise.all([
    page.waitForResponse((r) => r.url().endsWith('/api/user') && r.request().method() === 'GET', { timeout: USER_FETCH_TIMEOUT }),
    page.goto(`${BASE}/settings/company`, { waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT }),
  ])
  await page.waitForTimeout(4500)

  // "On" is the tertiary fill; the class is the only thing a sighted user goes by.
  const state = await page.evaluate(() => {
    const switches = [...document.querySelectorAll('[role=switch]')]
    return {
      total: switches.length,
      lookOn: switches.filter((s) => s.className.includes('bg-tertiary')).length,
      sayOn: switches.filter((s) => s.getAttribute('aria-checked') === 'true').length,
      named: switches.filter((s) => (s.getAttribute('aria-label') || '').trim() || s.getAttribute('aria-labelledby')).length,
    }
  })

  check('the page really is a wall of toggles', state.total > 20, `${state.total} switches`)
  check('every toggle says what it is', state.named === state.total, `${state.named}/${state.total} named`)
  check('what a toggle says matches what it looks like', state.sayOn === state.lookOn, `looks on: ${state.lookOn}, says on: ${state.sayOn}`)
  check('some are on, so the match is not two zeroes', state.lookOn > 0)

  const first = page.locator('[role=switch]').first()
  const before = await first.getAttribute('class')
  await first.focus()
  await page.keyboard.press(' ')
  await page.waitForTimeout(700)
  check('space flips a focused toggle', (await first.getAttribute('class')) !== before)

  // Put it back, and prove the mouse still works while doing so.
  await first.click()
  await page.waitForTimeout(700)
  check('a click flips it too', (await first.getAttribute('class')) === before)
} finally {
  await browser.close()
}

console.log(failures === 0 ? '\nPASS' : `\nFAIL (${failures})`)
process.exit(failures === 0 ? 0 : 1)
