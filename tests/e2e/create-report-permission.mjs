/**
 * Browser E2E for AW-2026-4255: "Opret rapport" (Create Report) must not
 * require the save-and-download permission.
 *
 * Reproduces the reported customer setup (Birketoften ApS): a User-role staff
 * member (Maja/Michael) has create_citizen_document/create_citizen_plan but
 * deliberately lacks save_and_download_citizen_document/_plan. Before the
 * fix, "Opret rapport" was hidden entirely for that user; after the fix, they
 * can open it, fill it in, and save it, while "Save and Download" stays
 * hidden. Also checks Plans & Goals (visibility only - the create/update
 * round trip for that flow is already covered by the backend
 * CreateReportPermissionTest) and an Admin regression guard on Documents.
 *
 * Setup/cleanup use the real API directly (create a Form + Folder before,
 * delete them after) so the test is self-restoring and can be re-run safely.
 *
 * Run:  see tests/e2e/README.md
 * Env:  CO_TOKEN (required, Admin), CO_STAFF_TOKEN (required, restricted staff
 *       user - see README), CO_CITIZEN_UUID (required),
 *       CO_BASE_URL (default http://localhost:3000),
 *       CO_API_URL (default http://127.0.0.1:8000)
 */
import { chromium } from 'playwright-core'
import { fileURLToPath } from 'url'
import path from 'path'

const TOKEN = process.env.CO_TOKEN
const STAFF_TOKEN = process.env.CO_STAFF_TOKEN
const CITIZEN_UUID = process.env.CO_CITIZEN_UUID
const BASE = process.env.CO_BASE_URL || 'http://localhost:3000'
const API = process.env.CO_API_URL || 'http://127.0.0.1:8000'
const SHOT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'screenshots')

if (!TOKEN || !STAFF_TOKEN || !CITIZEN_UUID) {
  console.error('Missing CO_TOKEN and/or CO_STAFF_TOKEN and/or CO_CITIZEN_UUID. See tests/e2e/README.md.')
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

const CREATE_REPORT = /Create report|Opret rapport/i
const SAVE_AND_DOWNLOAD = /Save and download|Gem og download/i
const SAVE = /^(Save|Gem)$/
const PROCEED = /^(Proceed|Fortsæt)$/

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage()
page.setDefaultTimeout(20000)
const consoleErrors = []
page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
page.on('pageerror', (err) => consoleErrors.push('pageerror: ' + err.message))

let formUuid = null
let folderUuid = null
const REPORT_ANSWER = `E2E create-report answer ${Date.now()}`

async function authAs(token) {
  await page.goto(`${BASE}/settings/profile`, { waitUntil: 'domcontentloaded' })
  await page.evaluate((t) => localStorage.setItem('_token', t), token)
}

// A hard/direct navigation straight to a citizen sub-page bounces to
// /timeline on a cold SPA boot (citizen store not yet hydrated) - go to the
// citizen's page first, then click the tab, matching real user navigation
// (same workaround as journal-note-survey.mjs). The citizen's own tab strip
// renders below the global sidebar, which also has a same-labelled link
// ("Dokumenter") that doesn't navigate the same way - .last() lands on the
// citizen tab strip's instance, and Playwright's click() auto-waits for it
// to actually exist rather than relying on it being present immediately.
async function goToCitizenTab(tabText, urlPattern) {
  await page.goto(`${BASE}/citizens/${CITIZEN_UUID}/timeline`, { waitUntil: 'domcontentloaded' })
  await page.locator('a,button', { hasText: tabText }).last().click()
  await page.waitForURL(urlPattern)
}

// FormSelect is a custom multiselect, not a native <select> - open it and
// click the option by its uuid-keyed element id, rather than by label (labels
// collide: every unnamed folder defaults to "Ny mappe"/"New folder").
async function selectFormAndFolder() {
  await page.locator('#form').click()
  await page.locator(`#form-multiselect-option-${formUuid}`).click()
  await page.locator('#folder').click()
  await page.locator(`#folder-multiselect-option-${folderUuid}`).click()
  await page.locator('button[type="submit"]', { hasText: PROCEED }).click()
}

try {
  // 1) Setup: a report Form with one plain text question, and a Documents
  // folder for the test citizen - mirrors an admin building a report template
  // and a staff member having somewhere to file the result.
  const formRes = await api('POST', '/forms', {
    title: `E2E Create Report Form ${Date.now()}`,
    description: 'Form for the AW-2026-4255 create-report-permission E2E test.',
    is_active: true,
    fields: [{ type: 'textfield', value: 'How did today go?', required: false }],
  })
  ok('Report form created via API', formRes.status >= 200 && formRes.status < 300 && !!formRes.json?.data?.uuid)
  formUuid = formRes.json?.data?.uuid

  const folderRes = await api('POST', '/citizen-file-folders', {
    citizen_uuid: CITIZEN_UUID,
    type: 'folder',
    is_admin_access: 'false',
  })
  ok('Documents folder created via API', folderRes.status >= 200 && folderRes.status < 300 && !!folderRes.json?.data?.uuid)
  folderUuid = folderRes.json?.data?.uuid

  // 2) Scenario 1 - restricted staff user on Documents: create-only, no download.
  await authAs(STAFF_TOKEN)
  await goToCitizenTab(/Documents|Dokumenter/, /\/documents$/)

  const createReportButton = page.locator('button', { hasText: CREATE_REPORT }).first()
  await createReportButton.waitFor()
  ok('Staff user (create-only) can see the "Create Report" button', true)
  await page.screenshot({ path: `${SHOT}/create-report-01-staff-documents.png`, fullPage: true })

  await createReportButton.click()
  await page.locator('#form').first().waitFor()
  await selectFormAndFolder()

  const saveButton = page.locator('button', { hasText: SAVE }).first()
  await saveButton.waitFor()
  ok('"Save" button is visible for the create-only staff user', true)
  ok('"Save and Download" button is NOT visible for the create-only staff user',
    (await page.locator('button', { hasText: SAVE_AND_DOWNLOAD }).count()) === 0)
  await page.screenshot({ path: `${SHOT}/create-report-02-staff-modal.png`, fullPage: true })

  await page.locator('input[name="text_field_0"]').first().fill(REPORT_ANSWER)
  const [postResponse] = await Promise.all([
    page.waitForResponse((r) => r.url().endsWith('/citizen-file-folders-attachments') && r.request().method() === 'POST'),
    saveButton.click(),
  ])
  const createReportOk = postResponse.status() >= 200 && postResponse.status() < 300
  ok('Create-report POST succeeds for the create-only staff user (2xx, not the old invalid-permission 400)', createReportOk)
  if (!createReportOk) console.log('  response body:', await postResponse.text().catch(() => '<unreadable>'))

  // The saved file's row shows a generated filename, not the form title, so
  // check the success toast instead - it's the user-facing confirmation the
  // save actually completed (the modal closes as part of the same flow).
  const SUCCESS_TOAST = /Template successfully added|Skabelon tilføjet med succes/
  await page.getByText(SUCCESS_TOAST).first().waitFor({ timeout: 10000 }).catch(() => {})
  ok('Success toast confirms the report was saved', (await page.getByText(SUCCESS_TOAST).count()) > 0)
  await page.screenshot({ path: `${SHOT}/create-report-03-staff-created.png`, fullPage: true })

  const realConsoleErrors = consoleErrors.filter((e) => !e.includes('Obiyen script tag'))
  ok('No console errors during the staff create flow', realConsoleErrors.length === 0)
  if (realConsoleErrors.length) console.log('  console errors:', realConsoleErrors.slice(0, 5))

  // 3) Scenario 2 - same staff user on Plans & Goals: visibility only (the
  // create/update round trip for this flow is already covered by the backend
  // CreateReportPermissionTest).
  // The tab's default href is .../plans-and-goals/all, not /active.
  await goToCitizenTab(/Plans and goals|Planer og mål/, /\/plans-and-goals\//)
  await page.locator('button', { hasText: CREATE_REPORT }).first().waitFor()
  ok('Staff user (create-only) can see "Create Report" on Plans & Goals', true)
  await page.screenshot({ path: `${SHOT}/create-report-04-staff-plans-and-goals.png`, fullPage: true })

  // 4) Scenario 3 - Admin regression guard: unchanged behavior.
  await authAs(TOKEN)
  await goToCitizenTab(/Documents|Dokumenter/, /\/documents$/)
  await page.locator('button', { hasText: CREATE_REPORT }).first().waitFor()
  ok('Admin still sees "Create Report" on Documents', true)

  await page.locator('button', { hasText: CREATE_REPORT }).first().click()
  await page.locator('#form').first().waitFor()
  await selectFormAndFolder()
  await page.locator('button', { hasText: SAVE_AND_DOWNLOAD }).first().waitFor()
  ok('Admin still sees "Save and Download" (download permission unaffected by the fix)', true)
  await page.screenshot({ path: `${SHOT}/create-report-05-admin-modal.png`, fullPage: true })
} catch (e) {
  ok('Unexpected error: ' + e.message, false)
  if (consoleErrors.length) console.log('console errors:\n' + consoleErrors.join('\n'))
  await page.screenshot({ path: `${SHOT}/create-report-99-error.png`, fullPage: true }).catch(() => {})
} finally {
  if (folderUuid) {
    // Cascades to the report file created inside it (CitizenFileFolderDeleteTest).
    const del = await api('DELETE', `/citizen-file-folders/${folderUuid}`)
    console.log(del.status >= 200 && del.status < 300 ? '↩︎  cleaned up the folder (and its report file)' : `⚠️  folder cleanup failed (status ${del.status})`)
  }
  if (formUuid) {
    const del = await api('DELETE', `/forms/${formUuid}`)
    if (del.status >= 200 && del.status < 300) {
      console.log('↩︎  cleaned up the form')
    } else {
      const deactivate = await api('PUT', `/forms/${formUuid}`, { is_active: false })
      console.log(deactivate.status >= 200 && deactivate.status < 300
        ? '↩︎  form delete was blocked (in use) - deactivated instead'
        : `⚠️  form cleanup failed (delete status ${del.status}, deactivate status ${deactivate.status})`)
    }
  }
  await browser.close()
}

const passed = results.filter(Boolean).length
console.log(`\n=== ${passed}/${results.length} PASS ===`)
process.exit(passed === results.length ? 0 : 1)
