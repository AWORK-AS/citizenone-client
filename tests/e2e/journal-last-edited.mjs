/**
 * Browser E2E for AW-2026-10676: editing a journal note never moves
 * "Created by ... on ..." and, when the edit comes more than 5 minutes after
 * the note was written, a "Last edited by ... on ..." line shows under it.
 *
 * What this proves:
 * 1. A note written more than 5 minutes ago and edited in the edit window
 *    (autosave) keeps its created line word for word, and gains the edit line
 *    with the editor's name.
 * 2. A note edited straight after it was written keeps its created line and
 *    shows no edit line (typo fixes add no noise), though the API records it.
 * 3. Opening the edit window and closing it without a change adds nothing.
 *
 * It writes test notes: CO_JOURNAL_UUID must be a note written more than 5
 * minutes ago that the test may edit, and it creates one more note itself
 * (deleted again through the API at the end).
 *
 * Run:  see tests/e2e/README.md
 * Env:  CO_TOKEN (required, an Admin), CO_CITIZEN_UUID (required),
 *       CO_JOURNAL_UUID (required: a note on that citizen, written > 5 min ago),
 *       CO_BASE_URL (default http://localhost:3001), CO_API_URL (default http://localhost:8001),
 *       CO_JOURNAL_PAGE (default /citizens/<CO_CITIZEN_UUID>/journals; /journal-notes also works),
 *       CO_SHOT_DIR (default tests/e2e/screenshots)
 */
import { chromium } from 'playwright-core'
import { fileURLToPath } from 'url'
import path from 'path'

const TOKEN = process.env.CO_TOKEN
const CITIZEN = process.env.CO_CITIZEN_UUID
const OLD_NOTE = process.env.CO_JOURNAL_UUID
const BASE = process.env.CO_BASE_URL || 'http://localhost:3001'
// The citizen's journal tab by default; /journal-notes shows the same card and footer.
const JOURNAL_PAGE = process.env.CO_JOURNAL_PAGE || '/citizens/' + CITIZEN + '/journals'
const API = (process.env.CO_API_URL || 'http://localhost:8001').replace(/\/$/, '')
const SHOT = process.env.CO_SHOT_DIR || path.join(path.dirname(fileURLToPath(import.meta.url)), 'screenshots')
const USER_FETCH_TIMEOUT = 60000

if (!TOKEN || !CITIZEN || !OLD_NOTE) {
  console.error('CO_TOKEN (Admin), CO_CITIZEN_UUID and CO_JOURNAL_UUID are required. See tests/e2e/README.md')
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

async function api(method, route, body) {
  const res = await fetch(`${API}/api${route}`, {
    method,
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json', 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await res.json().catch(() => ({}))
  return { status: res.status, json }
}

const me = (await api('GET', '/user')).json
const myName = `${me?.data?.firstname ?? me?.firstname ?? ''} ${me?.data?.lastname ?? me?.lastname ?? ''}`.trim()

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } })
const problems = []
page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`))
page.on('console', (m) => { if (/lastEditedBy|showLastEdited/.test(m.text())) problems.push(m.text().slice(0, 200)) })

async function openJournals() {
  await Promise.all([
    page.waitForResponse((r) => r.url().endsWith('/api/user') && r.request().method() === 'GET', { timeout: USER_FETCH_TIMEOUT }),
    page.goto(`${BASE}${JOURNAL_PAGE}`, { waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT }),
  ])
  await page.locator('[data-uuid]').first().waitFor({ timeout: USER_FETCH_TIMEOUT })
  await page.waitForTimeout(2000)
  const gotIt = page.locator('#headlessui-portal-root').getByRole('button', { name: /^(got it|forstået|forstått|uppfattat|ok)$/i })
  if (await gotIt.count()) {
    await gotIt.first().click()
    await page.waitForTimeout(500)
  }
}

const card = (uuid) => page.locator(`[data-uuid="${uuid}"]`).first()
const createdLine = async (uuid) => ((await card(uuid).locator('p.text-xs').filter({ hasText: /created by|oprettet af|opprettet av|skapad av/i }).first().innerText()) || '').trim()
const editedLine = (uuid) => card(uuid).locator('[data-testid="journal-last-edited"]')

/** Opens the note's edit window, optionally types into the note, and closes it again. */
async function editInWindow(uuid, text) {
  await card(uuid).getByRole('button', { name: /^(edit|rediger|redigera)$/i }).first().click()
  const editor = page.locator('.ck-editor__editable').first()
  await editor.waitFor({ timeout: 20000 })
  await page.waitForTimeout(1500)
  let saved = null
  if (text) {
    const waitSave = page.waitForResponse((r) => r.request().method() === 'PUT' && r.url().includes(`/citizen-journals/${uuid}`), { timeout: 30000 })
    await editor.click()
    await page.keyboard.press('End')
    await page.keyboard.type(text)
    saved = await waitSave // the autosave, a few seconds after typing
    await page.waitForTimeout(1000)
  } else {
    await page.waitForTimeout(5000) // longer than one autosave tick
  }
  await page.keyboard.press('Escape')
  await page.waitForTimeout(1000)
  return saved
}

let fresh = null
try {
  await page.goto(`${BASE}/overview`, { waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT })
  await page.evaluate((token) => localStorage.setItem('_token', token), TOKEN)

  // A note of our own, edited straight after it is written.
  const today = new Date()
  const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const created = await api('POST', '/user/citizen-journals', { citizen_uuid: CITIZEN, title: 'E2E AW-2026-10676', date: iso, content: '<p>Written by the e2e test</p>' })
  fresh = created.json?.data?.uuid
  check('a fresh test note was created', created.status === 200 && !!fresh, `${created.status}`)

  await openJournals()

  console.log('a note written more than 5 minutes ago')
  const before = await createdLine(OLD_NOTE)
  check('it has a created line', /\d/.test(before), before)
  check('no edit line before the edit', (await editedLine(OLD_NOTE).count()) === 0)

  console.log('  opened and closed without a change')
  await editInWindow(OLD_NOTE, '')
  await openJournals()
  check('still no edit line', (await editedLine(OLD_NOTE).count()) === 0)

  console.log('  edited in the edit window (autosave)')
  const saved = await editInWindow(OLD_NOTE, ' Ændret af e2e.')
  check('the autosave was accepted', !!saved && saved.ok(), saved ? `${saved.status()}` : 'no save')
  await openJournals()
  const after = await createdLine(OLD_NOTE)
  check('the created line is word for word the same', after === before, `"${before}" -> "${after}"`)
  const line = editedLine(OLD_NOTE)
  const lineText = (await line.count()) ? (await line.innerText()).trim() : ''
  console.log(`       created: ${after}\n       edited:  ${lineText}`)
  check('the edit line shows', lineText.length > 0)
  check(`the edit line names the editor (${myName})`, myName !== '' && lineText.includes(myName), lineText)
  check('the edit line is translated', !/citizens\.|\{name\}|\{date\}/.test(lineText), lineText)
  await card(OLD_NOTE).scrollIntoViewIfNeeded()
  await card(OLD_NOTE).screenshot({ path: `${SHOT}/journal-last-edited.png` })

  console.log('a note edited straight after it was written')
  const freshBefore = await createdLine(fresh)
  const freshSaved = await editInWindow(fresh, ' Slåfejl rettet.')
  check('the autosave was accepted', !!freshSaved && freshSaved.ok())
  await openJournals()
  check('the created line is unchanged', (await createdLine(fresh)) === freshBefore)
  check('no edit line within 5 minutes', (await editedLine(fresh).count()) === 0)
  const shown = await api('GET', `/user/citizen-journals/${fresh}`)
  const data = shown.json?.data ?? {}
  check('the API still records who edited and when', !!data.edited_at && data.updated_by === myName, JSON.stringify({ edited_at: data.edited_at, updated_by: data.updated_by }))

  check('no page errors', problems.length === 0, problems.slice(0, 3).join(' | '))
} finally {
  if (fresh) {
    const removed = await api('DELETE', `/user/citizen-journals/${fresh}`)
    console.log(`  removed the fresh test note: ${removed.status}`)
  }
  await browser.close()
}

console.log(failures === 0 ? '\nPASS' : `\nFAIL (${failures})`)
process.exit(failures === 0 ? 0 : 1)
