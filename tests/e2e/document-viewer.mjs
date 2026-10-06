/**
 * Browser E2E for CITIZE-92 item 5b: every place a staff user opens a
 * document shows it in the in-app viewer (modal-preview.vue) instead of a
 * browser tab, and inquiry documents open through the API instead of the
 * stored file's public address.
 *
 * Run it twice: once with the staff user's role holding download_documents
 * and once without. The script asks the API which it is and expects the
 * Download button and Chrome's PDF toolbar to follow.
 *
 * Covers: citizen documents (PDF, PNG, DOCX, ZIP, plus HTML/SVG/PPTX and
 * extension-less rows faked into the list), "Open selected" stepping, drive
 * (PDF, DOCX, "Open selected" with 3), an employee document type (nested
 * modal), archived documents, inquiry documents (PDF, PNG, TXT, DOCX), the
 * relative portal (optional), no popup tabs, and that every blob: URL the
 * viewer made is revoked when it closes.
 *
 * Setup/cleanup use the real API: fixtures from fixtures/document-viewer are
 * uploaded to the citizen and the inquiry and deleted again at the end.
 *
 * Run:  see tests/e2e/README.md
 * Env:  CO_TOKEN (Admin, setup/cleanup), CO_STAFF_TOKEN (user under test),
 *       CO_CITIZEN_UUID, CO_INQUIRY_UUID (its company needs the
 *       inquiry-pipeline app), CO_EMPLOYEE_UUID (has an employment contract
 *       with a PDF or image; opened as the admin, the only role that sees
 *       employee documents), optional CO_RELATIVE_TOKEN +
 *       CO_RELATIVE_CITIZEN_UUID, CO_BASE_URL (default http://localhost:3000),
 *       CO_API_URL (default http://127.0.0.1:8000)
 */
import { chromium } from 'playwright-core'
import { fileURLToPath } from 'url'
import { readFile } from 'fs/promises'
import path from 'path'

const TOKEN = process.env.CO_TOKEN
const STAFF_TOKEN = process.env.CO_STAFF_TOKEN
const CITIZEN_UUID = process.env.CO_CITIZEN_UUID
const INQUIRY_UUID = process.env.CO_INQUIRY_UUID
const EMPLOYEE_UUID = process.env.CO_EMPLOYEE_UUID
const RELATIVE_TOKEN = process.env.CO_RELATIVE_TOKEN
const RELATIVE_CITIZEN_UUID = process.env.CO_RELATIVE_CITIZEN_UUID
const BASE = process.env.CO_BASE_URL || 'http://localhost:3000'
const API = process.env.CO_API_URL || 'http://127.0.0.1:8000'
const HERE = path.dirname(fileURLToPath(import.meta.url))
const SHOT = path.join(HERE, 'screenshots')
const FIXTURES = path.join(HERE, 'fixtures', 'document-viewer')

if (!TOKEN || !STAFF_TOKEN || !CITIZEN_UUID || !INQUIRY_UUID || !EMPLOYEE_UUID) {
  console.error('Missing CO_TOKEN, CO_STAFF_TOKEN, CO_CITIZEN_UUID, CO_INQUIRY_UUID or CO_EMPLOYEE_UUID. See tests/e2e/README.md.')
  process.exit(2)
}

const results = []
const ok = (name, cond, detail = '') => {
  results.push(!!cond)
  console.log(`${cond ? '✅' : '❌'} ${name}${!cond && detail ? ` — ${detail}` : ''}`)
}

async function api(method, urlPath, { token = TOKEN, json, form } = {}) {
  const res = await fetch(`${API}/api/user${urlPath}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      ...(json ? { 'Content-Type': 'application/json' } : {}),
    },
    body: json ? JSON.stringify(json) : form,
  })
  const type = res.headers.get('content-type') || ''
  return { status: res.status, json: type.includes('json') ? await res.json().catch(() => null) : null }
}

async function fixtureForm(file, fields) {
  const form = new FormData()
  form.append('file', new Blob([await readFile(path.join(FIXTURES, file))]), file)
  for (const [key, value] of Object.entries(fields)) form.append(key, value)
  return form
}

const extensionOf = (doc) => {
  const last = String(doc?.file_url || doc?.name || '').split('?')[0].split('/').pop() || ''
  return last.includes('.') ? last.split('.').pop().toLowerCase() : ''
}

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1440, height: 1000 } })
// Every blob: URL the page makes or frees, so the test can tell whether the
// viewer freed what it showed.
await context.addInitScript(() => {
  const create = URL.createObjectURL.bind(URL)
  const revoke = URL.revokeObjectURL.bind(URL)
  window.__blobs = { created: [], revoked: [] }
  URL.createObjectURL = (object) => { const url = create(object); window.__blobs.created.push(url); return url }
  URL.revokeObjectURL = (url) => { window.__blobs.revoked.push(url); return revoke(url) }
})
const popups = []
context.on('page', (p) => popups.push(p))
const page = await context.newPage()
page.setDefaultTimeout(20000)
const consoleErrors = []
page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
page.on('pageerror', (err) => consoleErrors.push('pageerror: ' + err.message))
const requests = []
page.on('request', (r) => requests.push(r.url()))

const viewer = {
  pdf: page.locator('[data-testid="document-preview-pdf"]'),
  image: page.locator('[data-testid="document-preview-image"]'),
  text: page.locator('[data-testid="document-preview-text"]'),
  docx: page.locator('[data-testid="document-preview-container"]'),
  unavailable: page.locator('[data-testid="document-preview-unavailable"]'),
  failed: page.locator('[data-testid="document-preview-failed"]'),
  download: page.locator('[data-testid="document-preview-download"]'),
  position: page.locator('[data-testid="document-preview-position"]'),
  next: page.locator('[data-testid="document-preview-next"]'),
  previous: page.locator('[data-testid="document-preview-previous"]'),
}
const shownUrls = new Set()

async function authAs(token) {
  await page.goto(`${BASE}/settings/profile`, { waitUntil: 'domcontentloaded' })
  await page.evaluate((t) => localStorage.setItem('_token', t), token)
}

// Waits for what the viewer shows and records any blob: URL it shows.
async function expectShown(kind, label) {
  const locator = viewer[kind]
  await locator.first().waitFor({ state: 'visible' }).catch(() => {})
  const visible = await locator.first().isVisible().catch(() => false)
  ok(`${label}: opens in the viewer as ${kind}`, visible)
  if (visible && (kind === 'pdf' || kind === 'image')) {
    const src = await locator.first().getAttribute('src')
    shownUrls.add(src.split('#')[0])
    return src
  }
  return null
}

// Notes the blob: URL the viewer currently shows, if any.
async function recordShown() {
  for (const locator of [viewer.pdf, viewer.image]) {
    const src = await locator.first().getAttribute('src', { timeout: 1000 }).catch(() => null)
    if (src) shownUrls.add(src.split('#')[0])
  }
}

async function expectDownloadButton(label, canDownload) {
  const count = await viewer.download.count()
  ok(`${label}: Download ${canDownload ? 'offered' : 'not offered'}`, canDownload ? count === 1 : count === 0)
}

// The ✕ in the viewer's top bar, not Escape: once the PDF has focus, Chrome's
// PDF viewer keeps the key to itself.
async function closeViewer() {
  await page.locator('[data-testid="document-preview-close"]').last().click()
  await page.locator('[data-testid="document-preview-container"]').waitFor({ state: 'detached' }).catch(() => {})
}

// Opens the row, checks what is shown and the Download button, then closes.
async function openAndCheck(clickTarget, kind, label, canDownload, { closeAfter = true } = {}) {
  const popupsBefore = popups.length
  await clickTarget.click()
  const src = await expectShown(kind, label)
  if (kind === 'pdf' && src) {
    ok(`${label}: Chrome's PDF toolbar ${canDownload ? 'shown' : 'hidden (#toolbar=0)'}`,
      canDownload ? !src.includes('#toolbar=0') : src.endsWith('#toolbar=0&navpanes=0'), src)
  }
  await expectDownloadButton(label, canDownload)
  ok(`${label}: no browser tab opened`, popups.length === popupsBefore)
  if (closeAfter) await closeViewer()
  return src
}

async function downloadFromViewer(label, routePart) {
  const before = requests.length
  const [download] = await Promise.all([page.waitForEvent('download'), viewer.download.click()])
  const name = download.suggestedFilename()
  ok(`${label}: Download saves "${name}" with its extension`, /\.[a-z0-9]{2,5}$/i.test(name), name)
  ok(`${label}: Download goes through the ${routePart} route`, requests.slice(before).some((u) => u.includes(routePart)))
}

async function blobsRevoked(label) {
  const blobs = await page.evaluate(() => window.__blobs)
  const leaked = [...shownUrls].filter((u) => !blobs.revoked.includes(u))
  ok(`${label}: every blob: URL the viewer showed was revoked on close (${shownUrls.size} shown)`, leaked.length === 0, leaked.join(', '))
  shownUrls.clear()
}

const uploaded = { citizen: [], inquiry: [] }

try {
  // ---- Setup -------------------------------------------------------------
  for (const [file, name] of [['viewer-test.pdf', 'Viewer test PDF'], ['viewer-test.png', 'Viewer test PNG'],
    ['viewer-test.docx', 'Viewer test DOCX'], ['viewer-test.zip', 'Viewer test ZIP']]) {
    const res = await api('POST', '/citizen-file-folders', {
      form: await fixtureForm(file, { citizen_uuid: CITIZEN_UUID, type: 'file', is_admin_access: 'false' }),
    })
    const uuid = res.json?.data?.uuid
    if (uuid) {
      await api('PUT', `/citizen-file-folders/${uuid}`, { json: { name, is_admin_access: false } })
      uploaded.citizen.push({ uuid, name, ext: file.split('.').pop() })
    }
  }
  ok('Setup: 4 fixtures uploaded to the citizen', uploaded.citizen.length === 4)

  for (const file of ['viewer-test.pdf', 'viewer-test.png', 'viewer-test.txt', 'viewer-test.docx']) {
    const res = await api('POST', `/citizen-inquiries/${INQUIRY_UUID}/documents`, { form: await fixtureForm(file, { name: file }) })
    if (res.json?.data?.uuid) uploaded.inquiry.push({ uuid: res.json.data.uuid, name: file, ext: file.split('.').pop() })
  }
  ok('Setup: 4 fixtures uploaded to the inquiry', uploaded.inquiry.length === 4)

  const citizenPdf = uploaded.citizen.find((d) => d.ext === 'pdf')
  const probe = await api('GET', `/citizen-file-folders/${citizenPdf.uuid}/download`, { token: STAFF_TOKEN })
  const canDownload = probe.status === 200
  console.log(`\n— Staff user ${canDownload ? 'HAS' : 'does NOT have'} download_documents —\n`)
  if (!canDownload) {
    ok('Direct citizen download call answers 403', probe.status === 403, `got ${probe.status}`)
    const inquiryProbe = await api('GET', `/inquiry-documents/${uploaded.inquiry[0].uuid}/download`, { token: STAFF_TOKEN })
    ok('Direct inquiry download call answers 403', inquiryProbe.status === 403, `got ${inquiryProbe.status}`)
  }
  const inquiryView = await api('GET', `/inquiry-documents/${uploaded.inquiry[0].uuid}/view`, { token: STAFF_TOKEN })
  ok('Inquiry view route answers 200', inquiryView.status === 200, `got ${inquiryView.status}`)

  await authAs(STAFF_TOKEN)

  // ---- Citizen documents -------------------------------------------------
  // Rows the upload rules don't allow (HTML, SVG, PPTX) and rows with no
  // extension are faked into the list; their view call answers with
  // hostile bytes so a wrong turn would show.
  const fake = (uuid, name, fileUrl) => ({ uuid, id: 0, name, type: 'file', file_url: fileUrl, is_admin_access: false })
  const fakes = [
    fake('e2e-html', 'E2E hostile.html', 'https://example.invalid/hostile.html'),
    fake('e2e-svg', 'E2E hostile.svg', 'https://example.invalid/hostile.svg'),
    fake('e2e-pptx', 'E2E slides.pptx', 'https://example.invalid/slides.pptx'),
    fake('e2e-noext-html', 'E2E no extension (html bytes)', 'https://example.invalid/noext'),
    fake('e2e-noext-pdf', 'E2E no extension (pdf bytes)', 'https://example.invalid/noext2'),
  ]
  const pdfBytes = await readFile(path.join(FIXTURES, 'viewer-test.pdf'))
  await page.route(/\/api\/user\/citizen-file-folders\?/, async (route) => {
    const response = await route.fetch()
    const body = await response.json()
    if (String(route.request().url()).includes('search')) body.data = [...fakes, ...(body.data || [])]
    await route.fulfill({ response, json: body })
  })
  await page.route(/\/citizen-file-folders\/e2e-[a-z-]+\/view/, (route) => {
    const url = route.request().url()
    if (url.includes('noext-pdf')) return route.fulfill({ status: 200, contentType: 'application/pdf', body: pdfBytes })
    if (url.includes('svg')) return route.fulfill({ status: 200, contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg"><script>window.top.__pwned=1</script></svg>' })
    return route.fulfill({ status: 200, contentType: 'text/html', body: '<h1>HTML RENDERED</h1><script>window.top.__pwned=1</script>' })
  })

  // A direct load of a citizen sub-page can bounce to /timeline on a cold SPA
  // boot, so go through the timeline and click the tab, like a user would
  // (same as create-report-permission.mjs). The first visit compiles the page
  // on a cold dev server, hence the long wait.
  await page.goto(`${BASE}/citizens/${CITIZEN_UUID}/timeline`, { waitUntil: 'domcontentloaded' })
  await page.locator('a,button', { hasText: /Documents|Dokumenter/ }).last().click({ timeout: 90000 })
  await page.waitForURL(/\/documents$/)
  // The table re-renders while the first list loads; search once it has.
  await page.locator('tbody tr').first().waitFor({ timeout: 90000 })
  await page.waitForLoadState('networkidle').catch(() => {})
  const search = page.locator('form input[type="text"]').first()
  await search.fill('Viewer test')
  await search.press('Enter')
  await page.locator(`tr[data-uuid="${citizenPdf.uuid}"]`).waitFor({ timeout: 60000 })

  const row = (uuid) => page.locator(`tr[data-uuid="${uuid}"] div.cursor-pointer`).first()
  const byExt = (ext) => uploaded.citizen.find((d) => d.ext === ext)
  await openAndCheck(row(citizenPdf.uuid), 'pdf', 'Citizen PDF', canDownload, { closeAfter: false })
  // Chrome's PDF viewer paints a few seconds after the frame loads; the shot
  // shows whether its toolbar (download, print) is there.
  await page.waitForTimeout(6000)
  await viewer.pdf.screenshot({ path: `${SHOT}/document-viewer-pdf-${canDownload ? 'with' : 'without'}-download.png` })
  await page.screenshot({ path: `${SHOT}/document-viewer-full-pdf-${canDownload ? 'with' : 'without'}-download.png` })
  // Clicking into the PDF must not count as clicking outside the dialog.
  await viewer.pdf.click({ position: { x: 200, y: 200 } })
  await page.waitForTimeout(500)
  ok('Citizen PDF: clicking inside the PDF keeps the viewer open', await viewer.pdf.isVisible())
  if (canDownload) await downloadFromViewer('Citizen PDF', '/citizen-file-folders/' + citizenPdf.uuid + '/download')
  await closeViewer()

  await openAndCheck(row(byExt('png').uuid), 'image', 'Citizen PNG', canDownload, { closeAfter: false })
  const panel = await page.locator('[data-testid="document-preview"]').boundingBox()
  const size = page.viewportSize()
  ok('Viewer covers the whole window', panel && Math.round(panel.width) === size.width && Math.round(panel.height) === size.height,
    JSON.stringify(panel))
  await page.keyboard.press('Escape')
  await page.locator('[data-testid="document-preview-container"]').waitFor({ state: 'detached' }).catch(() => {})
  ok('Citizen PNG: Escape closes the viewer', (await viewer.image.count()) === 0)
  const blobsBeforeDocx = (await page.evaluate(() => window.__blobs.created.length))
  await openAndCheck(row(byExt('docx').uuid), 'docx', 'Citizen DOCX', canDownload, { closeAfter: false })
  await page.locator('[data-testid="document-preview-container"] section').first().waitFor().catch(() => {})
  ok('Citizen DOCX: the Word page is drawn', (await viewer.docx.innerText()).includes('viewer test DOCX'))
  await page.screenshot({ path: `${SHOT}/document-viewer-full-docx-${canDownload ? 'with' : 'without'}-download.png` })
  ok('Citizen DOCX: drawing it made no blob: URLs', (await page.evaluate(() => window.__blobs.created.length)) === blobsBeforeDocx)
  await closeViewer()

  const viewsBefore = requests.filter((u) => u.includes('/view')).length
  await openAndCheck(row(byExt('zip').uuid), 'unavailable', 'Citizen ZIP', canDownload, { closeAfter: false })
  await page.screenshot({ path: `${SHOT}/document-viewer-full-unavailable-${canDownload ? 'with' : 'without'}-download.png` })
  ok('Citizen ZIP: not fetched just to say it cannot be shown', requests.filter((u) => u.includes('/view')).length === viewsBefore)
  if (canDownload) await downloadFromViewer('Citizen ZIP', '/download')
  await closeViewer()

  for (const [uuid, label] of [['e2e-html', 'HTML row'], ['e2e-svg', 'SVG row'], ['e2e-pptx', 'PPTX row'], ['e2e-noext-html', 'No-extension row with HTML bytes']]) {
    await openAndCheck(row(uuid), 'unavailable', label, canDownload, { closeAfter: false })
    ok(`${label}: no frame or image rendered`, (await viewer.pdf.count()) === 0 && (await viewer.image.count()) === 0)
    await closeViewer()
  }
  await openAndCheck(row('e2e-noext-pdf'), 'pdf', 'No-extension row with PDF bytes', canDownload)
  ok('No HTML or SVG ran anywhere', !(await page.evaluate(() => window.__pwned)))
  await blobsRevoked('Citizen documents')

  // "Open selected": one viewer stepping through the four real uploads.
  for (const doc of uploaded.citizen) await page.locator(`tr[data-uuid="${doc.uuid}"] input[type="checkbox"]`).check()
  const popupsBefore = popups.length
  await page.locator('button', { hasText: /(Open selected|Åbn valgte) \(4\)/ }).click()
  await viewer.position.waitFor()
  ok('Open selected: one viewer, no tabs', popups.length === popupsBefore)
  ok('Open selected: starts at 1 of 4', /1\D+4/.test(await viewer.position.innerText()))
  await page.waitForTimeout(1500)
  await page.screenshot({ path: `${SHOT}/document-viewer-full-open-selected-${canDownload ? 'with' : 'without'}-download.png` })
  ok('Open selected: Previous disabled on the first', await viewer.previous.isDisabled())
  for (let i = 2; i <= 4; i++) {
    await recordShown()
    await viewer.next.click()
    await page.waitForFunction((n) => document.querySelector('[data-testid="document-preview-position"]')?.textContent?.trim().startsWith(String(n)), i)
  }
  await page.waitForTimeout(1000)
  await recordShown()
  ok('Open selected: Next reaches 4 of 4 and stops', /4\D+4/.test(await viewer.position.innerText()) && await viewer.next.isDisabled())
  await viewer.previous.click()
  await page.waitForFunction(() => document.querySelector('[data-testid="document-preview-position"]')?.textContent?.trim().startsWith('3'))
  ok('Open selected: Previous steps back to 3 of 4', true)
  await page.locator('[data-testid="document-preview-close"]').focus()
  await page.keyboard.press('ArrowLeft')
  await page.waitForFunction(() => document.querySelector('[data-testid="document-preview-position"]')?.textContent?.trim().startsWith('2'), null, { timeout: 5000 }).catch(() => {})
  ok('Open selected: ← steps back to 2 of 4', /^2\D+4/.test((await viewer.position.innerText()).trim()))
  await page.keyboard.press('ArrowRight')
  await page.waitForFunction(() => document.querySelector('[data-testid="document-preview-position"]')?.textContent?.trim().startsWith('3'), null, { timeout: 5000 }).catch(() => {})
  ok('Open selected: → steps forward to 3 of 4', /^3\D+4/.test((await viewer.position.innerText()).trim()))
  await recordShown()
  await closeViewer()
  await blobsRevoked('Open selected')
  await page.unrouteAll({ behavior: 'ignoreErrors' })

  // ---- Drive ---------------------------------------------------------------
  const driveList = page.waitForResponse((r) => /\/api\/user\/company-file-folders(\?|$)/.test(r.url()) && r.request().method() === 'GET', { timeout: 90000 }).catch(() => null)
  await page.goto(`${BASE}/drive`, { waitUntil: 'domcontentloaded' })
  const driveFiles = ((await (await driveList)?.json().catch(() => null))?.data || []).filter((d) => d?.file_url && d?.type === 'file')
  // The name, not the first .cursor-pointer: that's the row's checkbox.
  const nameIn = (rows, name) => rows.filter({ hasText: name }).first().getByText(name, { exact: true }).first()
  const driveRow = (doc) => nameIn(page.locator('tbody tr'), doc.name)
  const drivePdf = driveFiles.find((d) => extensionOf(d) === 'pdf')
  const driveDocx = driveFiles.find((d) => extensionOf(d) === 'docx')
  if (drivePdf) await openAndCheck(driveRow(drivePdf), 'pdf', 'Drive PDF', canDownload)
  else ok('Drive: a PDF on the first page to open', false)
  if (driveDocx) await openAndCheck(driveRow(driveDocx), 'docx', 'Drive DOCX', canDownload)
  if (driveFiles.length >= 3) {
    const boxes = page.locator('tbody tr input[type="checkbox"]')
    for (let i = 0; i < 3; i++) await boxes.nth(i).check()
    await page.locator('button', { hasText: /(Open selected|Åbn valgte) \(3\)/ }).click()
    await viewer.position.waitFor()
    ok('Drive Open selected: 1 of 3 in one viewer', /1\D+3/.test(await viewer.position.innerText()))
    await viewer.next.click()
    await viewer.next.click()
    await page.waitForFunction(() => document.querySelector('[data-testid="document-preview-position"]')?.textContent?.trim().startsWith('3'))
    ok('Drive Open selected: steps to 3 of 3', await viewer.next.isDisabled())
    await closeViewer()
  }
  await blobsRevoked('Drive')

  // ---- Employee documents (viewer nested in the type's modal) --------------
  // The employee page shows document types to admins only, and admins always
  // pass download_documents, so this part runs as the admin.
  await authAs(TOKEN)
  const employeeList = page.waitForResponse((r) => /\/api\/user\/employee-documents\?/.test(r.url()), { timeout: 90000 }).catch(() => null)
  await page.goto(`${BASE}/employees/${EMPLOYEE_UUID}/view-details`, { waitUntil: 'domcontentloaded' })
  await page.locator('div.cursor-pointer', { hasText: /Employment contracts?|Ansættelseskontrakt/ }).first().click({ timeout: 90000 })
  const employeeDocs = ((await (await employeeList)?.json().catch(() => null))?.data || []).filter((d) => d?.file_url)
  const employeeRow = (doc) => nameIn(page.locator('tr'), doc.name)
  const employeePdf = employeeDocs.find((d) => extensionOf(d) === 'pdf')
  const employeeImage = employeeDocs.find((d) => ['png', 'jpg', 'jpeg'].includes(extensionOf(d)))
  if (employeePdf) {
    await openAndCheck(employeeRow(employeePdf), 'pdf', 'Employee PDF (admin)', true, { closeAfter: false })
    await downloadFromViewer('Employee PDF (admin)', '/employee-documents/')
    await closeViewer()
    ok('Employee PDF: closing the viewer leaves the document list open', await page.locator('tr', { hasText: employeePdf.name }).first().isVisible())
  }
  if (employeeImage) await openAndCheck(employeeRow(employeeImage), 'image', 'Employee image (admin)', true)
  ok('Employee: a PDF or image to open', !!(employeePdf || employeeImage))
  await blobsRevoked('Employee documents')

  // ---- Archived documents --------------------------------------------------
  for (const [token, who] of [[STAFF_TOKEN, 'staff'], [TOKEN, 'admin']]) {
    await authAs(token)
    const archivedList = page.waitForResponse((r) => /\/api\/user\/archived-documents(\?|$)/.test(r.url()), { timeout: 90000 }).catch(() => null)
    await page.goto(`${BASE}/settings/archived/documents`, { waitUntil: 'domcontentloaded' })
    // A one-time "settings have moved" notice can cover the page.
    const notice = page.locator('[role="dialog"] button', { hasText: /^\s*(Got it|Forstået|Forstått|Uppfattat)\s*$/ })
    await notice.first().click({ timeout: 8000 }).catch(() => {})
    const archived = ((await (await archivedList)?.json().catch(() => null))?.data || []).filter((d) => d?.file_url)
    const target = archived.find((d) => ['pdf', 'png', 'jpg', 'jpeg'].includes(extensionOf(d)))
    if (!target) { console.log(`   (no archived PDF/image visible to ${who})`); continue }
    const kind = extensionOf(target) === 'pdf' ? 'pdf' : 'image'
    await openAndCheck(nameIn(page.locator('tr'), target.name), kind,
      `Archived ${kind} (${who})`, who === 'admin' || canDownload)
    await blobsRevoked(`Archived (${who})`)
    break
  }
  await authAs(STAFF_TOKEN)

  // ---- Inquiry documents ---------------------------------------------------
  await page.goto(`${BASE}/inquiries/${INQUIRY_UUID}`, { waitUntil: 'domcontentloaded' })
  const inquiryButton = (name) => page.locator('[data-testid="inquiry-document-open"]', { hasText: name })
  await inquiryButton('viewer-test.pdf').waitFor({ timeout: 90000 })
  ok('Inquiry: documents are buttons, not links to the stored file', (await page.locator('a[href*="xdrive"], a[target="_blank"]', { hasText: 'viewer-test' }).count()) === 0)
  await openAndCheck(inquiryButton('viewer-test.pdf'), 'pdf', 'Inquiry PDF', canDownload, { closeAfter: false })
  ok('Inquiry PDF: fetched through the view route', requests.some((u) => /\/inquiry-documents\/[^/]+\/view/.test(u)))
  if (canDownload) await downloadFromViewer('Inquiry PDF', '/inquiry-documents/')
  await closeViewer()
  await openAndCheck(inquiryButton('viewer-test.png'), 'image', 'Inquiry PNG', canDownload)
  await openAndCheck(inquiryButton('viewer-test.txt'), 'text', 'Inquiry TXT', canDownload, { closeAfter: false })
  const text = await viewer.text.innerText()
  ok('Inquiry TXT: Windows-1252 letters read correctly (blåbærgrød, Ærø)', text.includes('blåbærgrød') && text.includes('Ærø'), text)
  ok('Inquiry TXT: markup shown as text, not HTML', text.includes('<b>not bold</b>') && (await viewer.text.locator('b').count()) === 0)
  await closeViewer()
  await openAndCheck(inquiryButton('viewer-test.docx'), 'docx', 'Inquiry DOCX', canDownload)
  await blobsRevoked('Inquiry documents')

  // ---- Relative portal (download_documents doesn't apply) -------------------
  if (RELATIVE_TOKEN && RELATIVE_CITIZEN_UUID) {
    await authAs(RELATIVE_TOKEN)
    const relativeList = page.waitForResponse((r) => /\/api\/relative\/documents(\?|$)/.test(r.url()), { timeout: 90000 }).catch(() => null)
    await page.goto(`${BASE}/relative/citizens/${RELATIVE_CITIZEN_UUID}/documents`, { waitUntil: 'domcontentloaded' })
    const shared = ((await (await relativeList)?.json().catch(() => null))?.data || []).filter((d) => d?.file_url && extensionOf(d) === 'pdf')
    if (shared.length) {
      const before = requests.length
      await openAndCheck(nameIn(page.locator('tr'), shared[0].name), 'pdf', 'Relative PDF', true, { closeAfter: false })
      // The portal loads through its download route and saves those same
      // bytes, so Download makes no second request.
      ok('Relative PDF: loaded through the relative download route', requests.slice(before).some((u) => /\/relative\/documents\/[^/]+\/download/.test(u)))
      const [download] = await Promise.all([page.waitForEvent('download'), viewer.download.click()])
      ok(`Relative PDF: Download saves "${download.suggestedFilename()}"`, /\.pdf$/i.test(download.suggestedFilename()))
      await closeViewer()
      await blobsRevoked('Relative portal')
    } else {
      ok('Relative: a shared PDF to open', false)
    }
  }

  // Local dev noise: no Pusher host configured, the consent script absent.
  const relevantErrors = consoleErrors.filter((e) => !/favicon|ERR_ABORTED|Report Only|Content Security Policy|401|Failed to load resource|pusher\.com|Obiyen/.test(e))
  ok('No console errors', relevantErrors.length === 0, relevantErrors.join(' | '))
} catch (err) {
  console.error(err)
  ok('Test ran to the end', false, err.message)
  await page.screenshot({ path: `${SHOT}/document-viewer-failure.png` }).catch(() => {})
} finally {
  const deleted = async (urlPath) => (await api('DELETE', urlPath).catch(() => ({ status: 0 }))).status === 200
  const left = []
  for (const doc of uploaded.citizen) if (!(await deleted(`/citizen-file-folders/${doc.uuid}`))) left.push(`citizen ${doc.uuid}`)
  for (const doc of uploaded.inquiry) if (!(await deleted(`/inquiry-documents/${doc.uuid}`))) left.push(`inquiry ${doc.uuid}`)
  console.log(left.length ? `Cleanup: could NOT delete ${left.join(', ')}` : `Cleanup: deleted ${uploaded.citizen.length} citizen and ${uploaded.inquiry.length} inquiry fixtures`)
  if (left.length) results.push(false)
  await browser.close()
}

const failed = results.filter((r) => !r).length
console.log(`\n${results.length - failed}/${results.length} passed`)
process.exit(failed ? 1 : 0)
