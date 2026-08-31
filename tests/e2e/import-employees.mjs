/**
 * Browser E2E for the "Import employees" bug: employees created via
 * UserEmployeeImport (backend app/Imports/UserEmployeeImport.php) were never
 * given a matching `company_users` row (company_id + user_id), unlike the
 * normal single-employee create flow. The fix wires CompanyUserRepository::create()
 * into the import's "create" branch.
 *
 * There's no public API exposing the company_users pivot table, so this
 * script proves the user-visible half end-to-end (upload a template-shaped
 * .xlsx through the real "Import employees" modal, confirm the request
 * succeeds, then poll the employees list until the imported row appears) -
 * the pivot-row assertion itself lives in the backend regression test,
 * tests/Feature/User/EmployeeImportTest.php.
 *
 * The import is queued (UserEmployeeImport implements ShouldQueue,
 * QUEUE_CONNECTION=database in this app's dev .env) - this script does NOT
 * start a queue worker itself (starting one against the shared dev DB is a
 * standing decision the user should make, not something a test script does
 * silently). Run `php artisan queue:work` in another terminal before running
 * this test, or the polling step will time out.
 *
 * Setup/cleanup: the imported employee is looked up and deleted via the real
 * API afterward (DELETE /user/employees/{uuid}), by the exact uuid returned
 * from the search - never a bulk operation - so the script is self-restoring.
 *
 * Run:  see tests/e2e/README.md
 * Env:  CO_TOKEN (required, Admin/Manager able to manage employees),
 *       CO_BASE_URL (default http://localhost:3000),
 *       CO_API_URL (default http://127.0.0.1:8000)
 */
import { chromium } from 'playwright-core'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'
import os from 'os'
import { execFileSync } from 'child_process'

const TOKEN = process.env.CO_TOKEN
const BASE = process.env.CO_BASE_URL || 'http://localhost:3000'
const API = process.env.CO_API_URL || 'http://127.0.0.1:8000'
const SHOT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'screenshots')

if (!TOKEN) {
  console.error('Missing CO_TOKEN. See tests/e2e/README.md.')
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

const IMPORT_EMPLOYEES = /Import employees|Importer medarbejdere/i
const NO_FILE_SELECTED = /No file selected|Ingen fil valgt/i

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage()
page.setDefaultTimeout(45000)
const consoleErrors = []
page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
page.on('pageerror', (err) => consoleErrors.push('pageerror: ' + err.message))

const seenResponses = []
page.on('response', (r) => { seenResponses.push({ url: r.url(), method: r.request().method(), status: r.status() }) })

async function waitForMatchingResponse(predicate, timeoutMs = 15000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const match = seenResponses.find(predicate)
    if (match) return match
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
  return null
}

// Same cold-boot race as the other scripts in this suite: the SPA's route
// middleware reads the user store synchronously, so every hard navigation
// must wait for the /api/user response before it's safe to act on the page.
const USER_FETCH_TIMEOUT = 60000

async function authAs(token) {
  await page.goto(`${BASE}/overview`, { waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT })
  await page.evaluate((t) => localStorage.setItem('_token', t), token)
  await Promise.all([
    page.waitForResponse((r) => r.url().endsWith('/api/user') && r.request().method() === 'GET', { timeout: USER_FETCH_TIMEOUT }),
    page.reload({ waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT }),
  ])
}

async function gotoEmployees() {
  await Promise.all([
    page.waitForResponse((r) => r.url().endsWith('/api/user') && r.request().method() === 'GET', { timeout: USER_FETCH_TIMEOUT }),
    page.goto(`${BASE}/employees`, { waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT }),
  ])
}

// Shells out to the backend's own PHP/PhpSpreadsheet to build the .xlsx fixture,
// rather than adding an xlsx/exceljs dependency to this deliberately tiny,
// isolated test package - the same approach tests/Feature/User/EmployeeImportTest.php
// uses on the backend side, already proven to write a file this app's importer reads.
const UNIQUE = Date.now()
const LASTNAME = `E2EImport${UNIQUE}`
const EMAIL = `e2e-import-${UNIQUE}@example.com`

function buildImportFile() {
  const filePath = path.join(os.tmpdir(), `e2e-import-employees-${UNIQUE}.xlsx`)
  const backendPath = process.env.CO_BACKEND_PATH || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../citizenone-backend')
  const php = `
    require '${backendPath}/vendor/autoload.php';
    \$headings = ['firstname','lastname','email','phone','birthday','seniority_date','departments','role','address','post_code','date_of_employment','working_hours','status','annual_norm_hours','vacation_days'];
    \$row = ['E2E','${LASTNAME}','${EMAIL}','+4500000097','1994-08-18','1994-08-18','','User','','','1994-08-18','full_time','permanent','',''];
    \$spreadsheet = new PhpOffice\\PhpSpreadsheet\\Spreadsheet();
    \$sheet = \$spreadsheet->getActiveSheet();
    \$sheet->fromArray(\$headings, null, 'A1');
    \$sheet->fromArray(\$row, null, 'A2');
    (new PhpOffice\\PhpSpreadsheet\\Writer\\Xlsx(\$spreadsheet))->save('${filePath}');
  `
  execFileSync('php', ['-r', php])
  return filePath
}

let importFilePath = null
let importedEmployeeUuid = null

try {
  importFilePath = buildImportFile()
  ok('Import .xlsx fixture built', fs.existsSync(importFilePath))

  await authAs(TOKEN)
  await gotoEmployees()
  await page.waitForTimeout(1000)

  await page.getByRole('button', { name: IMPORT_EMPLOYEES }).click()
  // Scoped to the dialog: a third-party chat widget on this page (Obiyen,
  // #cw-file-input) has its own file input, so an unscoped `input[type="file"]`
  // locator is ambiguous. setInputFiles doesn't require the target to pass a
  // visibility check, so this works even though the dialog root itself
  // reports as zero-size (see the `modal` locator comment below).
  const fileInput = page.getByRole('dialog', { name: IMPORT_EMPLOYEES }).locator('input[type="file"]')
  await fileInput.waitFor({ state: 'attached' })

  // The base Modal component (components/modal/index.vue) wraps @headlessui/vue's
  // Dialog root in a plain `<div role="dialog">`, but its actual content (overlay
  // + panel) is `position: fixed`, taking it out of the root's box - so the root
  // itself collapses to zero size and Playwright's actionability check reports it
  // as "hidden" even though it's fully visible on screen. The <form> inside the
  // modal body (not position: fixed) is the reliably-sized element to scope on,
  // and it's the one place in the DOM that disambiguates this modal's own
  // "Import employees" submit button from the page's same-labeled button that
  // opened it (the only form on the page containing a file input at this point).
  const modal = page.locator('form').filter({ has: page.locator('input[type="file"]') })
  await modal.waitFor()

  // Submitting with no file selected must surface the client-side error, not
  // hit the API - covers the modal's own validation before we submit for real.
  await modal.getByRole('button', { name: IMPORT_EMPLOYEES }).click()
  await page.getByText(NO_FILE_SELECTED).first().waitFor({ timeout: 5000 })
  ok('Submitting without a file shows the "No file selected" validation message', true)

  await fileInput.setInputFiles(importFilePath)
  await page.screenshot({ path: `${SHOT}/import-employees-01-file-selected.png`, fullPage: true })

  await modal.getByRole('button', { name: IMPORT_EMPLOYEES }).click()
  const importResponse = await waitForMatchingResponse((r) => r.url.endsWith('/employees/imports/template') && r.method === 'POST')
  ok('Import POST succeeds (2xx)', !!importResponse && importResponse.status >= 200 && importResponse.status < 300)
  if (!importResponse) console.log('  no matching POST seen, network log:', JSON.stringify(seenResponses.filter(r => r.url.includes('/employees')), null, 1))

  // Modal closes and a success alert appears once the request resolves.
  await modal.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {})
  ok('Import modal closes after a successful upload', await modal.isHidden().catch(() => true))
  await page.screenshot({ path: `${SHOT}/import-employees-02-submitted.png`, fullPage: true })

  // The import runs on the queue - poll the employees list (via the same
  // `search` filter the page's own search box uses) until the row lands, or
  // fail with a clear hint if no queue worker is draining it.
  const POLL_TIMEOUT_MS = 60000
  const start = Date.now()
  let found = null
  while (Date.now() - start < POLL_TIMEOUT_MS) {
    const res = await api('GET', `/employees?search=${encodeURIComponent(LASTNAME)}`)
    found = (res.json?.data || []).find((u) => u.email === EMAIL)
    if (found) break
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }
  ok('Imported employee appears in the employees list within 60s (requires a running `php artisan queue:work` and a spare employee license on the company - see README)', !!found)
  importedEmployeeUuid = found?.uuid || null

  if (found) {
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.getByText(EMAIL).first().waitFor({ timeout: 10000 }).catch(() => {})
    await page.screenshot({ path: `${SHOT}/import-employees-03-employee-visible.png`, fullPage: true })
  }

  const realConsoleErrors = consoleErrors.filter((e) =>
    !e.includes('Obiyen script tag') && !e.includes('responded with a status of 400'))
  ok('No console errors during the import flow', realConsoleErrors.length === 0)
  if (realConsoleErrors.length) console.log('  console errors:', realConsoleErrors.slice(0, 5))
} catch (e) {
  ok('Unexpected error: ' + e.message, false)
  if (consoleErrors.length) console.log('console errors:\n' + consoleErrors.join('\n'))
  await page.screenshot({ path: `${SHOT}/import-employees-99-error.png`, fullPage: true }).catch(() => {})
} finally {
  if (importedEmployeeUuid) {
    const del = await api('DELETE', `/employees/${importedEmployeeUuid}`)
    console.log(del.status >= 200 && del.status < 300 ? '↩︎  cleaned up the imported employee' : `⚠️  employee cleanup failed (status ${del.status})`)
  }
  if (importFilePath && fs.existsSync(importFilePath)) fs.unlinkSync(importFilePath)
  await browser.close()
}

const passed = results.filter(Boolean).length
console.log(`\n=== ${passed}/${results.length} PASS ===`)
process.exit(passed === results.length ? 0 : 1)
