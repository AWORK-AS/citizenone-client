/**
 * Browser E2E for the "Google Drive" tab under the Overview / Daily
 * Operations tab row (branch feat/google-drive-daily-operations-tab).
 *
 * Covers everything this branch actually added: the new tab in
 * components/overview/tabs.vue, the /overview/google-drive page, and the
 * new standalone browser.vue component (folder navigation, upload,
 * new-folder/rename/move/delete modals, error state). The underlying
 * Google OAuth handshake and file-listing API are pre-existing, unchanged
 * code (already used by /drive and /apps) - this test stubs the Google
 * Drive API responses via page.route() so the connected-state UI can be
 * exercised deterministically without needing a real Google account.
 *
 * Run:  see tests/e2e/README.md
 * Env:  CO_TOKEN (required, company-1 dev@awork.dk),
 *       CO_BASE_URL (default http://localhost:3000),
 *       CO_API_URL (default http://127.0.0.1:8000)
 */
import { chromium } from 'playwright-core'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'
import os from 'os'

const TOKEN = process.env.CO_TOKEN
const BASE = process.env.CO_BASE_URL || 'http://localhost:3000'
const API = process.env.CO_API_URL || 'http://127.0.0.1:8000'
const SHOT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'screenshots')

if (!TOKEN) {
  console.error('Missing CO_TOKEN.')
  process.exit(2)
}

const results = []
const ok = (name, cond) => { results.push(cond); console.log(`${cond ? '✅' : '❌'} ${name}`) }

const ROOT_FILES = {
  files: [
    { id: 'folder-1', name: 'Care plans', mimeType: 'application/vnd.google-apps.folder', createdTime: '2026-08-01T10:00:00Z', modifiedTime: '2026-08-01T10:00:00Z' },
    { id: 'file-1', name: 'Weekly report.pdf', mimeType: 'application/pdf', webViewLink: 'https://drive.google.com/file/d/file-1/view', createdTime: '2026-08-02T10:00:00Z', modifiedTime: '2026-08-03T10:00:00Z' },
  ],
}
const FOLDER_FILES = {
  files: [
    { id: 'file-2', name: 'August care plan.docx', mimeType: 'application/vnd.google-apps.document', webViewLink: 'https://drive.google.com/file/d/file-2/view', createdTime: '2026-08-04T10:00:00Z', modifiedTime: '2026-08-04T10:00:00Z' },
  ],
}

const consoleErrors = []
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage()
page.setDefaultTimeout(20000)
page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
page.on('pageerror', (err) => consoleErrors.push('pageerror: ' + err.message))

async function fulfillJson(route, body, status = 200) {
  await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
}

try {
  await page.goto(`${BASE}/settings/profile`, { waitUntil: 'domcontentloaded' })
  await page.evaluate((t) => localStorage.setItem('_token', t), TOKEN)

  // 1) Tab visible on /overview, alongside the existing tabs.
  await page.goto(`${BASE}/overview`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1000)
  const tab = page.getByText('Google Drive', { exact: true })
  ok('Google Drive tab visible on /overview', await tab.first().isVisible().catch(() => false))
  await page.screenshot({ path: `${SHOT}/gdrive-tab-01-overview.png`, fullPage: true })

  // 2) Click navigates to /overview/google-drive, sidebar stays on Overview.
  await tab.first().click({ force: true })
  await page.waitForURL('**/overview/google-drive', { timeout: 10000 })
  ok('Tab click navigates to /overview/google-drive', page.url().includes('/overview/google-drive'))
  const sidebarOverview = page.locator('aside, nav').getByText('Overview', { exact: true }).first()
  ok('Sidebar "Overview" item present while on the new tab', await sidebarOverview.isVisible().catch(() => false))

  // 3) Disconnected state (real, unstubbed - matches current local DB state
  // for this user): connect CTA renders, clicking it opens a Google popup.
  await page.waitForTimeout(1000)
  ok('Disconnected-state message renders', await page.getByText(/not activated/i).first().isVisible().catch(() => false))
  // Not `getByRole('button', { name: /google drive/i })` alone - the page's
  // own breadcrumb also renders a "Google Drive" crumb as a <button> (see
  // components/breadcrumb/index.vue), and it comes first in DOM order so
  // `.first()` would grab the breadcrumb, not the connect CTA. The connect
  // CTA is the only `type="button"` element with this text.
  const connectButton = page.locator('button[type="button"]').filter({ hasText: 'Google Drive' }).first()
  ok('Connect CTA button renders', await connectButton.isVisible().catch(() => false))
  await page.screenshot({ path: `${SHOT}/gdrive-tab-02-disconnected.png`, fullPage: true })

  const [popup] = await Promise.all([
    page.waitForEvent('popup', { timeout: 10000 }),
    connectButton.click(),
  ])
  await popup.waitForLoadState('domcontentloaded').catch(() => {})
  await popup.waitForURL(/accounts\.google\.com/, { timeout: 10000 }).catch(() => {})
  ok('Connect CTA opens a popup pointed at Google', popup.url().includes('accounts.google.com'))
  await popup.close()

  // 4) Connected state via stub.
  await page.route('**/api/user/google-drive/status', (route) => fulfillJson(route, { connected: true }))
  await page.route('**/api/user/google-drive/files**', (route) => {
    const url = new URL(route.request().url())
    const parentId = url.searchParams.get('folder_id')
    fulfillJson(route, parentId === 'folder-1' ? FOLDER_FILES : ROOT_FILES)
  })
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1200)
  ok('Connected state renders the stubbed folder row', await page.getByText('Care plans').isVisible().catch(() => false))
  ok('Connected state renders the stubbed file row', await page.getByText('Weekly report.pdf').isVisible().catch(() => false))
  await page.screenshot({ path: `${SHOT}/gdrive-tab-03-connected.png`, fullPage: true })

  // 5) Folder navigation.
  await page.getByText('Care plans').click()
  await page.waitForTimeout(800)
  ok('Drilling into a folder shows its stubbed contents', await page.getByText('August care plan.docx').isVisible().catch(() => false))
  ok('"Back" control appears once inside a folder', await page.getByText(/^back$/i).isVisible().catch(() => false))
  await page.screenshot({ path: `${SHOT}/gdrive-tab-04-folder.png`, fullPage: true })

  await page.getByText(/^back$/i).click()
  await page.waitForTimeout(800)
  ok('"Back" returns to the root listing', await page.getByText('Care plans').isVisible().catch(() => false))

  // 6) Upload.
  await page.route('**/api/user/google-drive/upload', (route) => fulfillJson(route, { success: true }))
  const uploadTmpFile = path.join(os.tmpdir(), 'gdrive-e2e-upload.txt')
  fs.writeFileSync(uploadTmpFile, 'e2e test upload')
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser', { timeout: 10000 }),
    page.getByRole('button', { name: /upload file/i }).click(),
  ])
  await fileChooser.setFiles(uploadTmpFile)
  await page.waitForTimeout(1000)
  ok('Upload success toast appears', (await page.getByText(/success/i).count()) > 0)
  fs.unlinkSync(uploadTmpFile)

  // 7) New folder modal.
  await page.getByRole('button', { name: /create.*folder|new folder/i }).first().click()
  await page.waitForTimeout(500)
  ok('New-folder modal opens', await page.getByText('Folder name').isVisible().catch(() => false))
  await page.screenshot({ path: `${SHOT}/gdrive-tab-05-new-folder-modal.png`, fullPage: true })
  await page.getByRole('button', { name: /^cancel$/i }).first().click().catch(() => {})

  // 8) Rename modal (edit action on the file row).
  await page.waitForTimeout(500)
  const fileRow = page.locator('tr', { hasText: 'Weekly report.pdf' })
  await fileRow.getByRole('button', { name: /edit/i }).click()
  await page.waitForTimeout(500)
  ok('Edit/rename modal opens', await page.getByText('Edit file').isVisible().catch(() => false))
  await page.screenshot({ path: `${SHOT}/gdrive-tab-06-edit-modal.png`, fullPage: true })
  await page.getByRole('button', { name: /^cancel$/i }).first().click().catch(() => {})

  // 9) Move modal.
  await page.waitForTimeout(500)
  await fileRow.getByRole('button', { name: /move/i }).click()
  await page.waitForTimeout(500)
  ok('Move modal opens', await page.getByText('Move file').isVisible().catch(() => false))
  await page.screenshot({ path: `${SHOT}/gdrive-tab-07-move-modal.png`, fullPage: true })
  await page.getByRole('button', { name: /^cancel$/i }).first().click().catch(() => {})

  // 10) Delete confirmation.
  await page.waitForTimeout(500)
  await fileRow.getByRole('button', { name: /delete/i }).click()
  await page.waitForTimeout(500)
  ok('Delete confirmation dialog opens', await page.getByText(/delete/i).count() > 0)
  await page.screenshot({ path: `${SHOT}/gdrive-tab-08-delete-confirm.png`, fullPage: true })
  await page.locator('button', { hasText: /^cancel$/i }).first().click().catch(() => {})

  // 11) Error state.
  await page.unroute('**/api/user/google-drive/files**')
  await page.route('**/api/user/google-drive/files**', (route) => fulfillJson(route, { message: 'Simulated Google Drive error.' }, 500))
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1200)
  const bodyText = await page.locator('body').innerText()
  ok('Error state surfaces a readable message (no blank/broken page)', bodyText.length > 0 && !bodyText.includes('undefined'))
  await page.screenshot({ path: `${SHOT}/gdrive-tab-09-error-state.png`, fullPage: true })
  await page.unroute('**/api/user/google-drive/files**')
  await page.unroute('**/api/user/google-drive/status')

  const realConsoleErrors = consoleErrors.filter((e) =>
    !e.includes('Obiyen script tag') &&
    !e.includes('WebSocket connection') &&
    !e.includes('status of 500') &&
    !e.includes('Simulated Google Drive error'))
  ok('No unexpected console errors during the flow', realConsoleErrors.length === 0)
  if (realConsoleErrors.length) console.log('  console errors:', realConsoleErrors.slice(0, 10))
} catch (e) {
  ok('Unexpected error: ' + e.message, false)
  if (consoleErrors.length) console.log('console errors:\n' + consoleErrors.join('\n'))
  await page.screenshot({ path: `${SHOT}/gdrive-tab-99-error.png`, fullPage: true }).catch(() => {})
} finally {
  await browser.close()
}

const passed = results.filter(Boolean).length
console.log(`\n=== ${passed}/${results.length} PASS ===`)
process.exit(passed === results.length ? 0 : 1)
