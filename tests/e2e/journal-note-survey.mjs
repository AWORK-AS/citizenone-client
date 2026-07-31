/**
 * Browser E2E for attaching a survey (question set) to a journal note.
 *
 * Covers the new feature: an admin-defined Survey assigned to a citizen (via
 * the Settings > Catalog area, which now lists "Surveys") shows up inline in
 * that citizen's "New journal note" form. Staff answers it as part of the
 * note; on save the assignment is completed and linked to that journal note.
 *
 * Setup/cleanup use the real API directly (create survey + pending
 * assignment before, delete journal/assignment/survey after) so the test is
 * self-restoring and can be re-run safely.
 *
 * Run:  see tests/e2e/README.md
 * Env:  CO_TOKEN (required), CO_BASE_URL (default http://localhost:3000),
 *       CO_API_URL (default http://127.0.0.1:8000), CO_CITIZEN_UUID (required)
 */
import { chromium } from 'playwright-core'
import { fileURLToPath } from 'url'
import path from 'path'

const TOKEN = process.env.CO_TOKEN
const CITIZEN_UUID = process.env.CO_CITIZEN_UUID
const BASE = process.env.CO_BASE_URL || 'http://localhost:3000'
const API = process.env.CO_API_URL || 'http://127.0.0.1:8000'
const SHOT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'screenshots')

if (!TOKEN || !CITIZEN_UUID) {
  console.error('Missing CO_TOKEN and/or CO_CITIZEN_UUID.')
  process.exit(2)
}

const results = []
const ok = (name, cond) => { results.push(cond); console.log(`${cond ? '✅' : '❌'} ${name}`) }

async function api(method, urlPath, body) {
  const res = await fetch(`${API}/api/user${urlPath}`, {
    method,
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json', 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  return { status: res.status, json: await res.json().catch(() => null) }
}

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage()
page.setDefaultTimeout(20000)
const consoleErrors = []
page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
page.on('pageerror', (err) => consoleErrors.push('pageerror: ' + err.message))

let surveyUuid = null
let assignmentUuid = null
let journalUuid = null
const NOTE_TITLE = `E2E survey journal note ${Date.now()}`
const TEXT_ANSWER = 'Feeling okay today, slept well.'

try {
  // 1) Setup: create a survey with a required text question + a choice
  // question, then a pending assignment for the test citizen (mirrors an
  // admin creating a question set in Settings > Catalog and targeting a
  // citizen with it).
  const surveyRes = await api('POST', '/surveys', {
    title: `E2E Wellbeing Check ${Date.now()}`,
    is_active: true,
    questions: [
      { type: 'textfield', value: 'How are you feeling today?', required: true },
      { type: 'choice', value: 'Overall mood', required: false, options: ['Good', 'Bad'] },
    ],
  })
  ok('Survey created via API', surveyRes.status >= 200 && surveyRes.status < 300 && !!surveyRes.json?.data?.uuid)
  surveyUuid = surveyRes.json?.data?.uuid
  const questionUuid = surveyRes.json?.data?.questions?.[0]?.uuid

  const assignRes = await api('POST', `/surveys/${surveyUuid}/assignments`, { citizen_uuid: CITIZEN_UUID })
  ok('Pending assignment created for citizen via API', assignRes.status >= 200 && assignRes.status < 300 && assignRes.json?.data?.status === 'pending')
  assignmentUuid = assignRes.json?.data?.uuid

  // 2) Authenticate by injecting the token, then load the citizen's journals page.
  await page.goto(`${BASE}/settings/profile`, { waitUntil: 'domcontentloaded' })
  await page.evaluate((t) => localStorage.setItem('_token', t), TOKEN)
  // Note: a hard/direct navigation straight to `/journals` bounces to `/timeline`
  // on a cold SPA boot (citizen store not yet hydrated) - go to the citizen's
  // page first, then click the "Journals" tab, matching real user navigation.
  await page.goto(`${BASE}/citizens/${CITIZEN_UUID}/timeline`, { waitUntil: 'domcontentloaded' })
  await page.locator('a,button', { hasText: 'Journals' }).first().click()
  await page.waitForURL(/\/journals$/)

  const NEW_NOTE = /New note|Nyt notat/
  await page.locator('button', { hasText: NEW_NOTE }).first().waitFor()
  ok('Citizen journals page loads (token auth)', true)

  // 3) Open "New journal note" and confirm the pending survey renders inline.
  await page.locator('button', { hasText: NEW_NOTE }).first().click()
  await page.locator('input#title').first().waitFor()
  await page.getByText('E2E Wellbeing Check').first().waitFor({ timeout: 10000 }) // pending-surveys fetch settling
  await page.screenshot({ path: `${SHOT}/journal-survey-01-form.png`, fullPage: true })
  ok('Pending survey title shown inline in the journal note form', true)

  const bodyText = await page.locator('body').innerText()
  ok('i18n resolves (no raw "citizenJournals.form.attachedSurveys" key)', !bodyText.includes('citizenJournals.form.'))

  // 4) Fill the note's own required fields (date already defaults to today).
  await page.locator('input#title').first().fill(NOTE_TITLE)

  // 5) Answer the survey's textfield question inline.
  await page.locator('input[name="q_0"], textarea[name="q_0"]').first().fill(TEXT_ANSWER)
  await page.screenshot({ path: `${SHOT}/journal-survey-02-answered.png`, fullPage: true })

  // 6) Submit and confirm the journal note POST succeeds.
  const [postResponse] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/citizen-journals') && r.request().method() === 'POST'),
    page.locator('button[type="submit"]', { hasText: /^(Save|Gem)$/ }).click(),
  ])
  ok('Journal note create POST succeeds (2xx)', postResponse.status() >= 200 && postResponse.status() < 300)
  const postJson = await postResponse.json().catch(() => null)
  journalUuid = postJson?.data?.uuid

  await page.getByText(NOTE_TITLE).first().waitFor({ timeout: 10000 })
  ok('New journal note appears in the list after save', true)
  await page.screenshot({ path: `${SHOT}/journal-survey-03-created.png`, fullPage: true })

  const realConsoleErrors = consoleErrors.filter((e) => !e.includes('Obiyen script tag'))
  ok('No console errors during create flow', realConsoleErrors.length === 0)
  if (realConsoleErrors.length) console.log('  console errors:', realConsoleErrors.slice(0, 5))

  // 7) Verify server-side: the assignment is now completed, linked to this
  // journal note, and holds the answer the browser submitted.
  const assignmentsRes = await api('GET', `/citizens/${CITIZEN_UUID}/survey-assignments`)
  const completed = (assignmentsRes.json?.data || []).find((a) => a.uuid === assignmentUuid)
  ok('Assignment is completed after journal note save', completed?.status === 'completed')
  ok('Assignment source is "internal" (staff-completed)', completed?.source === 'internal')
  ok('Assignment is linked to the created journal note', completed?.linked_to?.type === 'journal' && completed?.linked_to?.uuid === journalUuid)
  ok('Submitted text answer persisted correctly', questionUuid ? completed?.answers?.[questionUuid] === TEXT_ANSWER : true)
} catch (e) {
  ok('Unexpected error: ' + e.message, false)
  if (consoleErrors.length) console.log('console errors:\n' + consoleErrors.join('\n'))
  await page.screenshot({ path: `${SHOT}/journal-survey-99-error.png`, fullPage: true }).catch(() => {})
} finally {
  if (journalUuid) {
    const del = await api('DELETE', `/citizen-journals/${journalUuid}`)
    console.log(del.status >= 200 && del.status < 300 ? '↩︎  cleaned up the created journal note' : `⚠️  journal cleanup failed (status ${del.status})`)
  }
  if (assignmentUuid && surveyUuid) {
    const del = await api('DELETE', `/surveys/${surveyUuid}/assignments/${assignmentUuid}`)
    console.log(del.status >= 200 && del.status < 300 ? '↩︎  cleaned up the survey assignment' : `⚠️  assignment cleanup failed (status ${del.status})`)
  }
  if (surveyUuid) {
    const del = await api('DELETE', `/surveys/${surveyUuid}`)
    console.log(del.status >= 200 && del.status < 300 ? '↩︎  cleaned up the survey' : `⚠️  survey cleanup failed (status ${del.status})`)
  }
  await browser.close()
}

const passed = results.filter(Boolean).length
console.log(`\n=== ${passed}/${results.length} PASS ===`)
process.exit(passed === results.length ? 0 : 1)
