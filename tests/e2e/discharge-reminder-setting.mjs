/**
 * Browser E2E for Roadmap #410: the discharge reminder comes BEFORE the
 * discharge date, and Settings -> Company says so.
 *
 * What this proves:
 * 1. The label, hint and the four choices say "before" (no "after", no raw keys).
 * 2. The choices are 14, 21, 28 and 30 days, 30 being the default label.
 * 3. Picking "2 weeks before" saves and survives a reload.
 *
 * Self-restoring: the company's original choice is put back at the end.
 *
 * Run:  see tests/e2e/README.md
 * Env:  CO_TOKEN (required, an Admin), CO_BASE_URL (default http://localhost:3001),
 *       CO_SHOT_DIR (default tests/e2e/screenshots)
 */
import { chromium } from 'playwright-core'
import { fileURLToPath } from 'url'
import path from 'path'

const TOKEN = process.env.CO_TOKEN
const BASE = process.env.CO_BASE_URL || 'http://localhost:3001'
const SHOT = process.env.CO_SHOT_DIR || path.join(path.dirname(fileURLToPath(import.meta.url)), 'screenshots')
const USER_FETCH_TIMEOUT = 60000

if (!TOKEN) {
  console.error('CO_TOKEN (Admin) is required. See tests/e2e/README.md')
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

const AFTER = /\b(after|efter|etter)\b/i
const BEFORE = /\b(before|før|före)\b/i

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } })
const problems = []
page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`))
page.on('console', (m) => { if (/dischargeNotification/.test(m.text())) problems.push(m.text().slice(0, 200)) })

async function openSettings() {
  await Promise.all([
    page.waitForResponse((r) => r.url().endsWith('/api/user') && r.request().method() === 'GET', { timeout: USER_FETCH_TIMEOUT }),
    page.goto(`${BASE}/settings/company`, { waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT }),
  ])
  await page.locator('#discharge_notification_days').waitFor({ timeout: USER_FETCH_TIMEOUT })
  await page.waitForTimeout(2500)
  // A one-time "what's new" announcement can cover the page; close it if it is there.
  const gotIt = page.locator('#headlessui-portal-root').getByRole('button', { name: /^(got it|forstået|forstått|uppfattat|ok)$/i })
  if (await gotIt.count()) {
    await gotIt.first().click()
    await page.waitForTimeout(800)
  }
}

// The field is a @vueform/multiselect combobox, not a native <select>.
const combo = () => page.locator('#discharge_notification_days').locator('xpath=ancestor::div[contains(concat(" ", normalize-space(@class), " "), " multiselect ")][1]')
const optionList = () => page.locator('#discharge_notification_days-multiselect-options [role="option"]')

async function currentChoice() {
  return ((await combo().locator('.multiselect-single-label').textContent().catch(() => '')) || '').trim()
}

async function readOptions() {
  await combo().click()
  await optionList().first().waitFor({ timeout: 10000 })
  const texts = (await optionList().allInnerTexts()).map((t) => t.trim())
  await page.keyboard.press('Escape')
  await page.waitForTimeout(300)
  return texts
}

/** Picks a choice by its label and saves the company form; resolves with the save response. */
async function choose(text) {
  await combo().click()
  await optionList().filter({ hasText: text }).first().click()
  await page.waitForTimeout(300)
  const [response] = await Promise.all([
    page.waitForResponse((r) => r.request().method() !== 'GET' && /\/api\/.*compan/i.test(r.url()), { timeout: USER_FETCH_TIMEOUT }),
    page.locator('form button[type="submit"]').last().click(),
  ])
  await page.waitForTimeout(1500)
  return response
}

let original = null
try {
  await page.goto(`${BASE}/overview`, { waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT })
  await page.evaluate((token) => localStorage.setItem('_token', token), TOKEN)
  await openSettings()

  console.log('texts')
  const labelEl = page.locator('label[for="discharge_notification_days"]')
  const field = labelEl.locator('xpath=..')
  const label = (await labelEl.innerText()).trim()
  const hint = (await labelEl.locator('xpath=following::p[1]').innerText()).trim()
  const options = await readOptions()
  console.log(`       label:   ${label}\n       hint:    ${hint}\n       options: ${options.join(' | ')}\n       current: ${await currentChoice()}`)
  check('label says before', BEFORE.test(label) && !AFTER.test(label), label)
  check('hint says before', BEFORE.test(hint) && !AFTER.test(hint), hint)
  check('four choices: 2, 3 and 4 weeks and 30 days (default)',
    options.length === 4 && /\b2\b/.test(options[0]) && /\b3\b/.test(options[1]) && /\b4\b/.test(options[2]) && /\b30\b/.test(options[3]),
    JSON.stringify(options))
  check('every choice says before', options.every((t) => BEFORE.test(t) && !AFTER.test(t)), JSON.stringify(options))
  check('no raw translation keys', ![label, hint, ...options].some((t) => /settings\.company|\{weeks\}/.test(t)))
  await field.scrollIntoViewIfNeeded()
  await field.screenshot({ path: `${SHOT}/discharge-setting.png` })

  console.log('save and reload')
  original = await currentChoice()
  const target = original === options[0] ? options[1] : options[0]
  const targetDays = target === options[0] ? 14 : 21
  let sentDays = null
  page.on('request', (r) => {
    if (r.method() !== 'GET' && /\/api\/.*compan/i.test(r.url())) {
      const body = r.postData() || ''
      const m = body.match(/discharge_notification_days"?\s*[:=]\s*"?(\d+)/) || body.match(/name="discharge_notification_days"\r?\n\r?\n(\d+)/)
      if (m) sentDays = Number(m[1])
    }
  })
  const saved = await choose(target)
  check(`saving "${target}" succeeds`, saved.ok(), `${saved.status()} ${saved.url()}`)
  check(`the request sends ${targetDays} days`, sentDays === targetDays, String(sentDays))
  await openSettings()
  const after = await currentChoice()
  check('the choice survives a reload', after === target, `"${after}" (expected "${target}")`)

  check('no page errors', problems.length === 0, problems.slice(0, 3).join(' | '))
} finally {
  if (original) {
    try {
      await openSettings()
      if ((await currentChoice()) !== original) {
        const restored = await choose(original)
        await openSettings()
        console.log(`  restored the original choice "${original}": ${restored.status()}, now "${await currentChoice()}"`)
      }
    } catch (e) {
      console.error(`  could not restore the original choice "${original}": ${e.message}`)
      failures++
    }
  }
  await browser.close()
}

console.log(failures === 0 ? '\nPASS' : `\nFAIL (${failures})`)
process.exit(failures === 0 ? 0 : 1)
