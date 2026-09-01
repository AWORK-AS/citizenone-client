/**
 * Browser E2E for the journal-note notification spam fix (client report: an
 * admin was getting ~10 "something to read in the journal" notifications
 * every morning for houses they have nothing to do with, because the
 * backend let a generic "system notifications" toggle bypass department
 * scoping - see backend fix in User::shouldSendNotification()).
 *
 * Creates one journal note for a citizen in "Department A", then confirms
 * via the real notifications API that an admin who belongs to an unrelated
 * "Department B" (with system notifications enabled, but not opted into
 * Department A) receives nothing, while an admin who IS opted into
 * Department A does.
 *
 * Setup/cleanup: only the journal note itself is created/deleted by this
 * script (self-restoring). The off-department/same-department admin
 * fixtures and the test citizen are pre-existing, idempotent tinker-created
 * rows documented in tests/e2e/README.md - not created or torn down here.
 *
 * Run:  see tests/e2e/README.md
 * Env:  CO_TOKEN (author, required), CO_CITIZEN_UUID (required),
 *       CO_OFFDEPT_TOKEN (required), CO_SAMEDEPT_TOKEN (required),
 *       CO_BASE_URL (default http://localhost:3000),
 *       CO_API_URL (default http://127.0.0.1:8000)
 */
import { chromium } from 'playwright-core'
import { fileURLToPath } from 'url'
import path from 'path'

const TOKEN = process.env.CO_TOKEN
const CITIZEN_UUID = process.env.CO_CITIZEN_UUID
const OFFDEPT_TOKEN = process.env.CO_OFFDEPT_TOKEN
const SAMEDEPT_TOKEN = process.env.CO_SAMEDEPT_TOKEN
const BASE = process.env.CO_BASE_URL || 'http://localhost:3000'
const API = process.env.CO_API_URL || 'http://127.0.0.1:8000'
const SHOT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'screenshots')

if (!TOKEN || !CITIZEN_UUID || !OFFDEPT_TOKEN || !SAMEDEPT_TOKEN) {
  console.error('Missing one of CO_TOKEN, CO_CITIZEN_UUID, CO_OFFDEPT_TOKEN, CO_SAMEDEPT_TOKEN.')
  process.exit(2)
}

const results = []
const ok = (name, cond) => { results.push(cond); console.log(`${cond ? '✅' : '❌'} ${name}`) }

async function api(method, urlPath, body, token = TOKEN) {
  const res = await fetch(`${API}/api/user${urlPath}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  return { status: res.status, json: await res.json().catch(() => null) }
}

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage()
page.setDefaultTimeout(20000)
const consoleErrors = []
let sawExpectedSurveyAssignments400 = false
page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
page.on('pageerror', (err) => consoleErrors.push('pageerror: ' + err.message))
page.on('response', (r) => {
  if (r.status() === 400 && r.url().includes('/survey-assignments')) sawExpectedSurveyAssignments400 = true
})

let journalUuid = null
const NOTE_TITLE = `E2E notif-scope note ${Date.now()}`

try {
  // 1) Authenticate as the note's author, navigate to the citizen's journal
  // tab (via the timeline tab first - a direct /journals nav bounces on a
  // cold SPA boot before the citizen store hydrates), and create a note.
  await page.goto(`${BASE}/settings/profile`, { waitUntil: 'domcontentloaded' })
  await page.evaluate((t) => localStorage.setItem('_token', t), TOKEN)
  await page.goto(`${BASE}/citizens/${CITIZEN_UUID}/timeline`, { waitUntil: 'domcontentloaded' })
  await page.locator('a,button', { hasText: /Journals|Dagbogsnotater/ }).first().click()
  await page.waitForURL(/\/journals$/)

  const NEW_NOTE = /New note|Nyt notat/
  await page.locator('button', { hasText: NEW_NOTE }).first().waitFor()
  ok('Citizen journals page loads (token auth)', true)

  await page.locator('button', { hasText: NEW_NOTE }).first().click()
  await page.locator('input#title').first().waitFor()
  await page.locator('input#title').first().fill(NOTE_TITLE)

  const [postResponse] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/citizen-journals') && r.request().method() === 'POST'),
    page.locator('button[type="submit"]', { hasText: /^(Save|Gem)$/ }).click(),
  ])
  ok('Journal note create POST succeeds (2xx)', postResponse.status() >= 200 && postResponse.status() < 300)
  const postJson = await postResponse.json().catch(() => null)
  journalUuid = postJson?.data?.uuid
  ok('Journal note uuid captured for teardown', !!journalUuid)

  // The journal-note form always prefetches pending survey assignments for
  // the citizen (unrelated to this test) and 400s on it when the Surveys app
  // isn't active for the test company - Chrome's console text for a failed
  // resource load doesn't include the URL, so this is identified by status
  // via the dedicated response listener below rather than by message text.
  const realConsoleErrors = consoleErrors.filter((e) =>
    !e.includes('Obiyen script tag') &&
    !(e.includes('Failed to load resource') && e.includes('400') && sawExpectedSurveyAssignments400))
  ok('No console errors during create flow', realConsoleErrors.length === 0)
  if (realConsoleErrors.length) console.log('  console errors:', realConsoleErrors.slice(0, 5))

  await page.screenshot({ path: `${SHOT}/journal-notif-scope-01-created.png`, fullPage: true })

  // 2) Off-department admin: system notifications enabled, but not opted
  // into this citizen's department - must NOT see the new note.
  const offDeptRes = await api('GET', '/notifications', null, OFFDEPT_TOKEN)
  ok('Off-department admin notifications fetched (2xx)', offDeptRes.status >= 200 && offDeptRes.status < 300)
  const offDeptHasNote = (offDeptRes.json?.data || []).some((n) => n?.data?.uuid === journalUuid)
  ok('Off-department admin does NOT receive the journal notification', !offDeptHasNote)

  // 3) Same-department admin: opted into this citizen's department - must
  // see the new note.
  const sameDeptRes = await api('GET', '/notifications', null, SAMEDEPT_TOKEN)
  ok('Same-department admin notifications fetched (2xx)', sameDeptRes.status >= 200 && sameDeptRes.status < 300)
  const sameDeptHasNote = (sameDeptRes.json?.data || []).some((n) => n?.data?.uuid === journalUuid)
  ok('Same-department admin DOES receive the journal notification', sameDeptHasNote)
} catch (e) {
  ok('Unexpected error: ' + e.message, false)
  if (consoleErrors.length) console.log('console errors:\n' + consoleErrors.join('\n'))
  await page.screenshot({ path: `${SHOT}/journal-notif-scope-99-error.png`, fullPage: true }).catch(() => {})
} finally {
  if (journalUuid) {
    const del = await api('DELETE', `/citizen-journals/${journalUuid}`)
    console.log(del.status >= 200 && del.status < 300 ? '↩︎  cleaned up the created journal note' : `⚠️  journal cleanup failed (status ${del.status})`)
  }
  await browser.close()
}

const passed = results.filter(Boolean).length
console.log(`\n=== ${passed}/${results.length} PASS ===`)
process.exit(passed === results.length ? 0 : 1)
