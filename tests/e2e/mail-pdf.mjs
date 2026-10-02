/**
 * Browser E2E for "Save as PDF" on regular mail (branch `wip`, both repos,
 * uncommitted). See EMAIL_PDF_IMPLEMENTATION_PLAN.md and
 * EMAIL_PDF_FIXES_PLAN.md in citizenone-backend for the feature and its two
 * post-planning fixes.
 *
 * Its main job is proving the security promise holds in a real run: the
 * backend re-reads the message from the user's OWN mailbox (never trusts
 * client HTML), HTMLPurifier strips script/remote-resource/file:// content,
 * and wkhtmltopdf never fetches or executes any of it. A throwaway GreenMail
 * container provides a real IMAP server for the SMTP/IMAP path, so nothing
 * between the browser, Laravel, Webklex IMAP, HTMLPurifier and wkhtmltopdf is
 * stubbed there. Microsoft 365 can't run for real locally (needs a live
 * tenant), so step 9 only covers its UI wiring via page.route() stubs, as
 * google-drive-overview-tab.mjs does for Google Drive.
 *
 * Run: see tests/e2e/README.md, section "mail-pdf", for the one-time
 * GreenMail + tinker fixture setup and the full list of required env vars.
 */
import { chromium } from 'playwright-core'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'
import os from 'os'
import http from 'http'
import { execSync } from 'child_process'

const DIR = path.dirname(fileURLToPath(import.meta.url))
const BASE = process.env.CO_BASE_URL || 'http://localhost:3000'
const API = process.env.CO_API_URL || 'http://127.0.0.1:8000'
const BACKEND_PATH = process.env.CO_BACKEND_PATH || path.join(DIR, '..', '..', '..', 'citizenone-backend')
const IMAP_PORT = process.env.CO_IMAP_PORT || '3143'
const SHOT = path.join(DIR, 'screenshots')
const RUN = Date.now().toString(36)

const TOKEN = process.env.CO_TOKEN
const DK_TOKEN = process.env.CO_DK_TOKEN
const CITIZEN_UUID = process.env.CO_CITIZEN_UUID

if (!TOKEN || !DK_TOKEN || !CITIZEN_UUID) {
  console.error('Missing required env vars. Need CO_TOKEN, CO_DK_TOKEN, CO_CITIZEN_UUID - see tests/e2e/README.md ("mail-pdf").')
  process.exit(2)
}

let failures = 0
let total = 0
function check(label, condition, detail = '') {
  total++
  if (condition) {
    console.log(`  ok   ${label}`)
  } else {
    failures++
    console.error(`  FAIL ${label}${detail ? ` - ${detail}` : ''}`)
  }
}

function tinker(script) {
  return execSync('php artisan tinker', { cwd: BACKEND_PATH, input: script, encoding: 'utf8' })
}

// A real IMAP round trip through GreenMail (connect/login/select/fetch) is
// slow in this environment - opening a single message can take 8-10s, well
// past a plain fixed sleep. `.isVisible()` alone doesn't wait/retry, so a
// check run right after a click can see "not there yet" and misreport a
// missing element as a real failure. This waits for the element itself
// instead of a fixed delay.
async function visibleWithin(locator, timeout = 15000) {
  try {
    await locator.waitFor({ state: 'visible', timeout })
    return true
  } catch {
    return false
  }
}

async function hiddenWithin(locator, timeout = 5000) {
  try {
    await locator.waitFor({ state: 'hidden', timeout })
    return true
  } catch {
    return false
  }
}

function api(token) {
  return async (method, urlPath, body) => {
    const response = await fetch(`${API}/api${urlPath}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
    let json = null
    try { json = await response.json() } catch { /* not JSON, e.g. a PDF */ }
    return { status: response.status, headers: response.headers, body: json }
  }
}

async function rawDownload(token, urlPath) {
  const response = await fetch(`${API}/api${urlPath}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  return { status: response.status, headers: response.headers, buffer: Buffer.from(await response.arrayBuffer()) }
}

function startCanary() {
  return new Promise((resolve) => {
    const hits = []
    const server = http.createServer((req, res) => {
      hits.push({ path: req.url, userAgent: req.headers['user-agent'] || '' })
      res.writeHead(200, { 'Content-Type': 'text/plain' })
      res.end('ok')
    })
    server.listen(0, '127.0.0.1', () => resolve({ server, hits, address: `127.0.0.1:${server.address().port}` }))
  })
}

function nonChromeHits(canary) {
  return canary.hits.filter((h) => !h.userAgent.includes('Chrome'))
}

const list = (body) => body?.data?.data ?? body?.data ?? []
const byRun = (m) => (m?.header?.subject || m?.subject || '').includes(RUN)

// The Sent views (both SMTP and Entra) render each row as a plain div with no
// data-uid - unlike the redesigned Inbox views' `.mail-row` buttons - so rows
// are selected by their (unique, RUN-marked) subject text instead. A real
// click dispatched anywhere inside the row bubbles up to the row's own
// @click handler regardless of which child element it lands on.
const sentRow = (subjectText) => page.getByText(subjectText, { exact: false }).first()

// === Setup ===================================================================
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mail-pdf-e2e-'))
const canary = await startCanary()
const createdDriveUuids = []
let citizenEmailUuid = null
let citizenFileFolderId = null
let folderUuid = null
let folderId = null
let UID_A = null
let UID_B = null
let inboxImageCount = null
let sentImageCount = null

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const consoleErrors = []
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
// A real GreenMail/IMAP round trip (per message, done fresh for every PDF
// render/download - never cached) normally takes ~10-15s in this
// environment, but climbs under the cumulative connection load of a full
// run - 20s was observed to intermittently clip the later steps' downloads.
page.setDefaultTimeout(35000)
page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
page.on('pageerror', (err) => consoleErrors.push('pageerror: ' + err.message))

// Two fixed, bottom-right overlays in layouts/user.vue can sit exactly where
// a message's action row (Save as PDF, Link to) lands at this viewport size
// and absorb clicks meant for it: the one-time ⌘K/Ctrl K discovery tip (pure
// first-login UI, safe to pre-dismiss via its own localStorage flag) and the
// missed-medicine-doses toast (real, data-driven, dev-DB-wide - company 1
// may genuinely have overdue doses). Both are closable by design (the tip's
// own code dismisses on any outside click; the toast has a Close button) -
// this mirrors that, instead of forcing clicks through real UI.
async function suppressOverlays() {
  // Belt and suspenders for the cmdk tip (also pre-empted in loginAs() below,
  // before its first mount) and the real, data-driven missed-medicine toast,
  // which fetches on mount and can take a few seconds to appear - a single
  // immediate check here runs before it exists and misses it entirely, after
  // which it sits for up to 45s covering exactly where the mail action row's
  // buttons land at this viewport size. getByRole matches both the toast's
  // visible "Close" text and the tip's icon-only aria-label="close".
  await page.evaluate(() => { try { localStorage.setItem('hasSeenCmdkTip', 'true') } catch { /* ignore */ } })
  const deadline = Date.now() + 6000
  while (Date.now() < deadline) {
    const closers = page.getByRole('button', { name: /close/i })
    const count = await closers.count().catch(() => 0)
    if (count === 0) {
      await page.waitForTimeout(500)
      continue
    }
    for (let i = 0; i < count; i++) {
      await closers.first().click({ timeout: 2000 }).catch(() => {})
    }
  }
}

// The missed-medicine toast re-fetches every POLL_INTERVAL_MS (3 minutes) and
// can reappear mid-step on a run this long, well after the last navigation's
// suppressOverlays() call already cleared it once. A light background sweep
// for the whole run catches that reappearance wherever it happens, instead
// of re-calling suppressOverlays() before every single click site.
const overlayWatchdog = setInterval(() => {
  page.getByRole('button', { name: /close/i }).first().click({ timeout: 1000 }).catch(() => {})
}, 4000)

async function loginAs(token, urlPath = '/') {
  await page.goto(`${BASE}${urlPath}`, { waitUntil: 'domcontentloaded' })
  await page.evaluate((t) => {
    localStorage.setItem('_token', t)
    // Set before the SPA boots, not after - the one-time ⌘K tip decides
    // whether to show itself at mount, so setting this post-reload is too
    // late for its FIRST mount and only pre-empts the ones after.
    try { localStorage.setItem('hasSeenCmdkTip', 'true') } catch { /* ignore */ }
  }, token)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1500)
  await suppressOverlays()
}

const pdftotext = (pdfPath) => execSync(`pdftotext -enc UTF-8 "${pdfPath}" -`).toString('utf8')
const pdfImageCount = (pdfPath) => {
  const out = execSync(`pdfimages -list "${pdfPath}"`).toString('utf8').trim().split('\n')
  return Math.max(out.length - 2, 0) // first two lines are the column headers/rule
}

try {
  // === Step 0. Preflight =====================================================
  console.log('\n=== Step 0: Preflight ===')
  try {
    const settings = await api(TOKEN)('GET', '/user/email-settings')
    check('CO_TOKEN mailbox is smtp', settings.body?.data?.type === 'smtp', JSON.stringify(settings.body))

    execSync(
      `python3 "${path.join(DIR, 'fixtures', 'mail-pdf-seed.py')}" --port ${IMAP_PORT} --user e2e-mailpdf@citizenone.test --run ${RUN} --canary ${canary.address}`,
      { stdio: 'inherit' }
    )

    const inbox = await api(TOKEN)('GET', '/user/emails')
    const messageA = list(inbox.body).find(byRun)
    check('message A found in inbox listing', !!messageA, JSON.stringify(list(inbox.body).map((m) => m.header?.subject)))
    UID_A = messageA?.header?.uid
    check('message A is unread', messageA?.flags?.seen !== 'Seen', JSON.stringify(messageA?.flags))

    const sent = await api(TOKEN)('GET', '/user/emails/sent/list')
    const messageB = list(sent.body).find(byRun)
    check('message B found in sent listing', !!messageB, JSON.stringify(list(sent.body).map((m) => m.header?.subject)))
    UID_B = messageB?.header?.uid

    const folder = await api(TOKEN)('POST', '/user/company-file-folders', {
      type: 'folder',
      name: `E2E Mail PDF ${RUN}`,
      is_admin_access: 'false',
    })
    check('Drive test folder created', folder.status < 300, JSON.stringify(folder.body))
    folderUuid = folder.body?.data?.uuid
    folderId = folder.body?.data?.id
  } catch (e) {
    check('Step 0 threw', false, e.message)
  }

  // === Step 1. API-level checks (before the UI marks message A read) ========
  console.log('\n=== Step 1: API-level checks ===')
  try {
    const dl = await rawDownload(TOKEN, `/user/emails/pdf/download?message_id=${UID_A}&folder=inbox`)
    check('download status 200', dl.status === 200, String(dl.status))
    check('content-type is application/pdf', (dl.headers.get('content-type') || '').includes('application/pdf'), dl.headers.get('content-type'))
    check('body starts with %PDF', dl.buffer.subarray(0, 4).toString('latin1') === '%PDF')

    const disposition = dl.headers.get('content-disposition') || ''
    check('disposition is an attachment', disposition.includes('attachment'), disposition)
    check("disposition has a utf-8'' encoded filename", disposition.includes("filename*=utf-8''"), disposition)
    check('disposition encodes Rødgrød', disposition.includes('R%C3%B8dgr%C3%B8d'), disposition)
    check('disposition replaces the slash with an underscore', disposition.includes('Q3_Q4'), disposition)
    check('disposition percent-encodes the literal %', disposition.includes('50%25'), disposition)
    const asciiFallback = disposition.match(/filename="([^"]*)"/)?.[1] || ''
    check('ascii fallback contains Rodgrod', asciiFallback.includes('Rodgrod'), asciiFallback)
    check('ascii fallback has no %', !asciiFallback.includes('%'), asciiFallback)

    const stillUnread = await api(TOKEN)('GET', '/user/emails')
    const stillA = list(stillUnread.body).find((m) => String(m.header?.uid) === String(UID_A))
    check('message A still unread after an API-level download (FT_PEEK)', stillA?.flags?.seen !== 'Seen', JSON.stringify(stillA?.flags))

    const badFolder = await api(TOKEN)('GET', `/user/emails/pdf/download?message_id=${UID_A}&folder=trash`)
    check('an invalid folder is a 422', badFolder.status === 422, String(badFolder.status))

    const unknown = await api(TOKEN)('GET', '/user/emails/pdf/download?message_id=999999&folder=inbox')
    check('an unknown message is a 400 with "Email not found."', unknown.status === 400 && unknown.body?.message === 'Email not found.', JSON.stringify(unknown.body))
  } catch (e) {
    check('Step 1 threw', false, e.message)
  }

  // === Step 2. SMTP Inbox: Download (UI, real backend) ======================
  console.log('\n=== Step 2: SMTP Inbox - Download ===')
  try {
    await loginAs(TOKEN, '/mail/inbox')
    await page.locator(`[data-uid="${UID_A}"]`).click()
    await page.waitForTimeout(1200)

    const saveAsPdf = page.getByRole('button', { name: /save as pdf/i })
    check('Save as PDF button is visible', await visibleWithin(saveAsPdf.first()))
    const linkTo = page.locator('button', { hasText: /link to /i })
    check('Link to <citizen term> button is visible in the same row', await visibleWithin(linkTo.first()))
    await page.screenshot({ path: `${SHOT}/mail-pdf-01-inbox-reading-view.png`, fullPage: true })

    await saveAsPdf.first().click()
    await page.waitForTimeout(400)
    check('Download PDF menu item visible', await visibleWithin(page.getByText('Download PDF', { exact: true }), 5000))
    check('Save to Drive menu item visible', await visibleWithin(page.getByText('Save to Drive', { exact: true }), 5000))

    const [download, downloadRequest] = await Promise.all([
      page.waitForEvent('download'),
      page.waitForRequest('**/emails/pdf/download**'),
      page.getByText('Download PDF', { exact: true }).click(),
    ])
    const reqUrl = new URL(downloadRequest.url())
    check('request message_id is UID_A', reqUrl.searchParams.get('message_id') === String(UID_A), reqUrl.search)
    check('request folder is inbox', reqUrl.searchParams.get('folder') === 'inbox')

    const suggested = download.suggestedFilename()
    check('file name starts with the subject', suggested.startsWith(`E2E Mail PDF ${RUN} Rødgrød Q3`), suggested)
    check('file name ends with .pdf', suggested.endsWith('.pdf'), suggested)

    const pdfPath = path.join(tempDir, 'inbox-download.pdf')
    await download.saveAs(pdfPath)
    const text = pdftotext(pdfPath)

    for (const label of ['Subject', 'From', 'To', 'Cc', 'Date', 'Attachments']) {
      check(`PDF has the "${label}" label`, text.includes(label))
    }
    check('PDF shows the Danish subject', text.includes('Rødgrød'), text.slice(0, 200))
    check('PDF shows the sender', text.includes('E2E Sender') && text.includes('sender@citizenone.test'))
    check('PDF shows the Cc address', text.includes('cc@citizenone.test'))
    check('PDF date is in Copenhagen time (fix B)', text.includes('01-10-2026 12:15'), text)
    check('PDF body marker present', text.includes(`Body marker ${RUN}`))
    check('PDF table cell present', text.includes('Cell A1'))
    check('PDF safe link text present', text.includes('A safe link'))
    check('PDF styled block text present', text.includes('Styled block'))
    check('PDF lists the attachment', text.includes(`report-${RUN}.txt`))
    check('no script execution text leaked', !text.includes('SCRIPT-RAN'))
    check('no /etc/hostname contents leaked', !text.includes(os.hostname()))

    inboxImageCount = pdfImageCount(pdfPath)

    const nonChrome = nonChromeHits(canary)
    check('no non-Chrome (server-side) canary hits for the inbox PDF', nonChrome.length === 0, JSON.stringify(nonChrome))
  } catch (e) {
    check('Step 2 threw', false, e.message)
  }

  // === Step 3. Save to Drive, root ===========================================
  console.log('\n=== Step 3: Save to Drive, root ===')
  let rootFileUuid = null
  try {
    await page.getByRole('button', { name: /save as pdf/i }).first().click()
    await page.waitForTimeout(300)
    await page.getByText('Save to Drive', { exact: true }).click()
    await page.waitForTimeout(600)

    const modal = page.locator('form#formSavePdfToDrive')
    check('save-to-drive modal opens', await visibleWithin(modal, 5000))
    await page.screenshot({ path: `${SHOT}/mail-pdf-02-save-to-drive-modal.png`, fullPage: true })

    await page.locator('#folder').click()
    await page.waitForTimeout(300)
    const optionTexts = await page.locator('[id^="folder-multiselect-option-"]').allInnerTexts()
    check('"Documents (root)" is the first folder option', /root/i.test(optionTexts[0] || ''), JSON.stringify(optionTexts.slice(0, 3)))
    check('the test folder is listed', optionTexts.some((t) => t.includes(`E2E Mail PDF ${RUN}`)), JSON.stringify(optionTexts))
    // Escape closes the dropdown AND bubbles to the outer Dialog's own
    // escape-closes-modal handling, dismissing the whole modal instead of
    // just the dropdown (@vueform/multiselect isn't HeadlessUI-aware, so it
    // doesn't stop that propagation). Click an inert area of the modal
    // instead - a real outside-click on the dropdown closes only that.
    // Scoped to the modal's own <h3> title, not plain text: the now-closed
    // (but still DOM-present) "Save to Drive" MENU ITEM carries the same
    // text, and an unscoped match could land on that button instead.
    await page.locator('h3', { hasText: 'Save to Drive' }).click()
    await page.waitForTimeout(300)

    const [saveResponse] = await Promise.all([
      page.waitForResponse('**/emails/pdf/save-to-drive'),
      page.locator('form#formSavePdfToDrive button[type=submit]').click(),
    ])
    const postData = saveResponse.request().postDataJSON() || {}
    check('root save request carries no folder_uuid', !postData.folder_uuid, JSON.stringify(postData))

    const saveBody = await saveResponse.json().catch(() => null)
    check('root save response is 2xx', saveResponse.ok(), String(saveResponse.status()))
    check('root save type is file', saveBody?.data?.type === 'file', JSON.stringify(saveBody))
    check('root save folder_id is null', saveBody?.data?.folder_id === null, JSON.stringify(saveBody?.data))
    check('root save name is the sanitised subject', saveBody?.data?.name === `E2E Mail PDF ${RUN} Rødgrød Q3_Q4 50%`, saveBody?.data?.name)

    await page.waitForTimeout(500)
    check('"Saved to Drive." toast shows', await visibleWithin(page.getByText('Saved to Drive.'), 5000))
    check('modal closes', await hiddenWithin(modal))

    rootFileUuid = saveBody?.data?.uuid
    if (rootFileUuid) createdDriveUuids.push(rootFileUuid)

    if (rootFileUuid) {
      const rootPdfPath = path.join(tempDir, 'root-save.pdf')
      tinker([
        `$media = App\\Models\\CompanyFileFolder::where('uuid','${rootFileUuid}')->first()->getFirstMedia('company-files');`,
        `file_put_contents('${rootPdfPath}', Illuminate\\Support\\Facades\\Storage::disk($media->disk)->get($media->getPathRelativeToRoot()));`,
        `echo 'written: '.filesize('${rootPdfPath}');`,
      ].join('\n'))
      const text = pdftotext(rootPdfPath)
      check('Drive-saved PDF (root) has the body marker', text.includes(`Body marker ${RUN}`))
      check('Drive-saved PDF (root) has no script execution text', !text.includes('SCRIPT-RAN'))
    }
  } catch (e) {
    check('Step 3 threw', false, e.message)
  }

  // === Step 4. Save to Drive, into a folder ==================================
  console.log('\n=== Step 4: Save to Drive, into a folder ===')
  try {
    await page.getByRole('button', { name: /save as pdf/i }).first().click()
    await page.waitForTimeout(300)
    await page.getByText('Save to Drive', { exact: true }).click()
    await page.waitForTimeout(600)

    await page.locator('#folder').click()
    await page.waitForTimeout(300)
    await page.locator(`[id="folder-multiselect-option-${folderUuid}"]`).click()
    await page.waitForTimeout(300)

    const [saveResponse] = await Promise.all([
      page.waitForResponse('**/emails/pdf/save-to-drive'),
      page.locator('form#formSavePdfToDrive button[type=submit]').click(),
    ])
    const postData = saveResponse.request().postDataJSON() || {}
    check('folder save request carries folder_uuid', postData.folder_uuid === folderUuid, JSON.stringify(postData))

    const saveBody = await saveResponse.json().catch(() => null)
    check('folder save response is 2xx', saveResponse.ok(), String(saveResponse.status()))
    check('folder save folder_id matches the target folder', String(saveBody?.data?.folder_id) === String(folderId), JSON.stringify(saveBody?.data))

    if (saveBody?.data?.uuid) createdDriveUuids.push(saveBody.data.uuid)
    await page.waitForTimeout(500)
  } catch (e) {
    check('Step 4 threw', false, e.message)
  }

  // === Step 5. Error message reaches the user (blob fix, real backend) ======
  console.log('\n=== Step 5: Error surfaces the real server message ===')
  try {
    await page.route('**/emails/pdf/download**', (route) => {
      const url = new URL(route.request().url())
      url.searchParams.set('message_id', '999999')
      route.continue({ url: url.toString() })
    })

    await page.getByRole('button', { name: /save as pdf/i }).first().click()
    await page.waitForTimeout(300)
    const downloadButton = page.getByText('Download PDF', { exact: true })
    await downloadButton.click()
    await page.waitForTimeout(1200)

    check('error toast shows the real server message', await visibleWithin(page.getByText('Email not found.'), 5000))
    // The "Download PDF" menu item itself closes with the menu on selection -
    // the spinner/disabled state lives on the "Save as PDF" trigger button.
    check('download button is re-enabled (spinner cleared)', await page.getByRole('button', { name: /save as pdf/i }).first().isEnabled().catch(() => false))

    await page.unroute('**/emails/pdf/download**')
  } catch (e) {
    check('Step 5 threw', false, e.message)
  }

  // === Step 6. SMTP Sent: Download ===========================================
  console.log('\n=== Step 6: SMTP Sent - Download ===')
  try {
    await page.goto(`${BASE}/mail/sent`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1200)
    await suppressOverlays()
    // Matched by the RUN marker alone, not the full subject: this environment
    // has no PHP ext-imap, so Webklex's Subject decoder (Decoder::decode(),
    // which only truly decodes RFC2047 via imap_mime_header_decode()) falls
    // through undecoded - the row shows the raw "=?utf-8?q?...?=" encoded
    // word instead of "E2E Sent PDF <run>". RUN's own ASCII characters still
    // survive Q-encoding unchanged either way, so this matches in both cases.
    await sentRow(RUN).click()
    await page.waitForTimeout(1000)

    check('Save as PDF menu sits next to the subject heading', await visibleWithin(page.getByRole('button', { name: /save as pdf/i }).first()))

    const [download, downloadRequest] = await Promise.all([
      page.waitForEvent('download'),
      page.waitForRequest('**/emails/pdf/download**'),
      page.getByRole('button', { name: /save as pdf/i }).first().click().then(() => page.getByText('Download PDF', { exact: true }).click()),
    ])
    const reqUrl = new URL(downloadRequest.url())
    check('request folder is sent', reqUrl.searchParams.get('folder') === 'sent')
    check('request message_id is UID_B', reqUrl.searchParams.get('message_id') === String(UID_B), reqUrl.search)

    const suggested = download.suggestedFilename()
    check('file name is "E2E Sent PDF RUN.pdf"', suggested === `E2E Sent PDF ${RUN}.pdf`, suggested)

    const pdfPath = path.join(tempDir, 'sent-download.pdf')
    await download.saveAs(pdfPath)
    const text = pdftotext(pdfPath)
    check('body line one present', text.includes('Sent line one'))
    check('body line two present', text.includes('Sent line two'))
    check('To shows the recipient', text.includes('recipient@citizenone.test'))
    check('date is in Copenhagen time (fix B)', text.includes('01-10-2026 11:00'), text)
    check('no Cc label (message has none)', !text.includes('Cc'))
    check('no Attachments label (message has none)', !text.includes('Attachments'))

    sentImageCount = pdfImageCount(pdfPath)
    if (inboxImageCount !== null && sentImageCount !== null) {
      check('inbox PDF embeds more images than the sent PDF (the cid image was inlined)', inboxImageCount > sentImageCount, `${inboxImageCount} vs ${sentImageCount}`)
    }
  } catch (e) {
    check('Step 6 threw', false, e.message)
  }

  // === Step 7. Link to citizen PDF (step 5 fix, real backend) ===============
  console.log('\n=== Step 7: Link to citizen PDF ===')
  try {
    await page.goto(`${BASE}/mail/inbox`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1200)
    await suppressOverlays()
    await page.locator(`[data-uid="${UID_A}"]`).click()
    await page.waitForTimeout(1000)

    await page.locator('button', { hasText: /link to /i }).first().click()
    await page.waitForTimeout(600)

    await page.locator('#citizen_uuid').click()
    await page.waitForTimeout(300)
    await page.locator(`[id="citizen_uuid-multiselect-option-${CITIZEN_UUID}"]`).click()
    await page.waitForTimeout(300)

    await page.getByText(/also save as pdf/i).click()
    await page.waitForTimeout(300)

    const [linkResponse] = await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/user/citizen-emails') && r.request().method() === 'POST'),
      page.locator('button[type=submit]', { hasText: /^save$/i }).click(),
    ])
    check('link-to-citizen response is 2xx', linkResponse.ok(), String(linkResponse.status()))
    const linkBody = await linkResponse.json().catch(() => null)
    citizenEmailUuid = linkBody?.data?.uuid
    check('response carries a uuid', !!citizenEmailUuid, JSON.stringify(linkBody))

    const citizenPdfPath = path.join(tempDir, 'citizen-link.pdf')
    const tinkerOut = tinker([
      `$folder = App\\Models\\CitizenFileFolder::where('citizen_id', App\\Models\\Citizen::where('uuid','${CITIZEN_UUID}')->value('id'))`,
      `  ->where('name', 'like', '%${RUN}%')->where('created_at', '>=', now()->subMinutes(10))->first();`,
      `echo 'count:'.($folder ? 1 : 0).PHP_EOL;`,
      `if ($folder) {`,
      `  \$citizenFileFolderId = $folder->id;`,
      `  echo 'folder_id:'.\$citizenFileFolderId.PHP_EOL;`,
      `  $media = $folder->getFirstMedia('citizen-files');`,
      `  file_put_contents('${citizenPdfPath}', Illuminate\\Support\\Facades\\Storage::disk($media->disk)->get($media->getPathRelativeToRoot()));`,
      `  echo 'written:'.filesize('${citizenPdfPath}').PHP_EOL;`,
      `}`,
    ].join('\n'))
    check('exactly one CitizenFileFolder named after RUN was created', /count:1/.test(tinkerOut), tinkerOut)
    citizenFileFolderId = tinkerOut.match(/folder_id:(\d+)/)?.[1] || null

    if (fs.existsSync(citizenPdfPath)) {
      const text = pdftotext(citizenPdfPath)
      for (const label of ['Subject', 'From', 'Date']) {
        check(`citizen PDF has the "${label}" label`, text.includes(label))
      }
      check('citizen PDF body marker present', text.includes(`Body marker ${RUN}`))
      check('no script execution text leaked in the citizen PDF', !text.includes('SCRIPT-RAN'))
      check('no /etc/hostname contents leaked in the citizen PDF', !text.includes(os.hostname()))
    }

    const nonChrome = nonChromeHits(canary)
    check('still no non-Chrome canary hits after the citizen PDF', nonChrome.length === 0, JSON.stringify(nonChrome))
  } catch (e) {
    check('Step 7 threw', false, e.message)
  }

  // === Step 8. Danish user without `create` (translations and gating) ======
  console.log('\n=== Step 8: Danish user without create permission ===')
  try {
    await page.evaluate((t) => localStorage.setItem('_token', t), DK_TOKEN)
    await page.goto(`${BASE}/mail/inbox`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1500)
    await suppressOverlays()
    if (page.url().includes('/overview')) {
      check('fixture user has mail access', false, 'redirected to /overview')
    } else {
      await page.locator(`[data-uid="${UID_A}"]`).click()
      await page.waitForTimeout(1000)

      const gemSomPdf = page.getByRole('button', { name: 'Gem som PDF' })
      check('button reads "Gem som PDF"', await visibleWithin(gemSomPdf.first()))
      await gemSomPdf.first().click()
      await page.waitForTimeout(400)
      check('Download PDF item shown', await visibleWithin(page.getByText('Download PDF', { exact: true }), 5000))
      check('"Gem til Drev" is absent (no create permission)', (await page.getByText('Gem til Drev', { exact: true }).count()) === 0)

      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.getByText('Download PDF', { exact: true }).click(),
      ])
      const pdfPath = path.join(tempDir, 'dk-download.pdf')
      await download.saveAs(pdfPath)
      const text = pdftotext(pdfPath)
      for (const label of ['Emne', 'Fra', 'Til', 'Cc', 'Dato', 'Vedhæftede filer']) {
        check(`Danish PDF has the "${label}" label`, text.includes(label))
      }
      check('Danish PDF date is in Copenhagen time', text.includes('01-10-2026 12:15'), text)
    }

    const forbidden = await api(DK_TOKEN)('POST', '/user/emails/pdf/save-to-drive', { message_id: String(UID_A), folder: 'inbox' })
    check('save-to-drive is a 400 for a user without create', forbidden.status === 400, String(forbidden.status))
    check('refusal message is the Danish translation', forbidden.body?.message === 'Du har ikke tilladelse til at udføre denne handling.', JSON.stringify(forbidden.body))

    const staffCreatedFiles = tinker([
      `$staff = App\\Models\\User::where('email','e2e-mailpdf-staff@test.com')->first();`,
      `echo 'count:'.App\\Models\\CompanyFileFolder::where('user_id', $staff->id)->where('name','like','%${RUN}%')->count();`,
    ].join('\n'))
    check('no CompanyFileFolder was created for the staff user', /count:0/.test(staffCreatedFiles), staffCreatedFiles)
  } catch (e) {
    check('Step 8 threw', false, e.message)
  }

  // === Step 9. Microsoft 365 UI wiring (stubbed) =============================
  console.log('\n=== Step 9: Microsoft 365 UI wiring (stubbed) ===')
  try {
    await page.evaluate((t) => localStorage.setItem('_token', t), TOKEN)

    const GRAPH_INBOX = {
      id: 'AAMkAGI2T/+e2eRUN==',
      subject: `E2E Entra Inbox ${RUN}`,
      isRead: true,
      from: { emailAddress: { name: 'E2E Sender', address: 'sender@citizenone.test' } },
      sender: { emailAddress: { name: 'E2E Sender', address: 'sender@citizenone.test' } },
      toRecipients: [{ emailAddress: { address: 'e2e-mailpdf-admin@test.com' } }],
      ccRecipients: [],
      receivedDateTime: '2026-10-01T10:15:00Z',
      sentDateTime: '2026-10-01T10:15:00Z',
      createdDateTime: '2026-10-01T10:15:00Z',
      body: { contentType: 'html', content: `<p>Body marker ${RUN}</p>` },
      hasAttachments: false,
      attachments: [],
    }
    const GRAPH_SENT = {
      ...GRAPH_INBOX,
      id: 'AAMkAGI2T/+e2eRUNSENT==',
      subject: `E2E Entra Sent ${RUN}`,
      sentDateTime: '2026-10-01T09:00:00Z',
    }

    let recordedDownloadUrl = null
    let recordedSaveBody = null

    await page.route('**/api/user/entra/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ value: [] }) }))
    await page.route('**/api/user/email-settings', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { id: 1, type: 'entra' } }) }))
    await page.route('**/api/user/entra/fetch/emails**', (route) => route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ value: [GRAPH_INBOX], unread_emails: 0, unread_secured_emails: 0 }),
    }))
    await page.route('**/api/user/entra/fetch/sent-emails**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ value: [GRAPH_SENT] }) }))
    await page.route('**/api/user/emails/pdf/download**', async (route) => {
      recordedDownloadUrl = route.request().url()
      // Falls back to a minimal stub if step 6 didn't produce a real PDF (e.g.
      // it failed earlier) - this step only cares about the request/response
      // wiring, not the bytes, and a missing file would otherwise throw
      // inside an async route handler and crash the whole run.
      const sentPdfPath = path.join(tempDir, 'sent-download.pdf')
      const real = fs.existsSync(sentPdfPath) ? fs.readFileSync(sentPdfPath) : Buffer.from('%PDF-1.4 stub')
      await route.fulfill({ status: 200, contentType: 'application/pdf', body: real })
    })
    await page.route('**/api/user/emails/pdf/save-to-drive', async (route) => {
      recordedSaveBody = route.request().postDataJSON()
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ data: { uuid: 'stub', type: 'file' } }) })
    })

    await page.goto(`${BASE}/mail/inbox`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1500)
    await suppressOverlays()
    await page.locator(`[data-uid="${GRAPH_INBOX.id}"]`).click()
    await page.waitForTimeout(1000)
    check('Save as PDF sits next to Link to on the Entra inbox', await visibleWithin(page.getByRole('button', { name: /save as pdf/i }).first()))

    recordedDownloadUrl = null
    await page.getByRole('button', { name: /save as pdf/i }).first().click()
    await page.waitForTimeout(300)
    const [entraDownload] = await Promise.all([
      page.waitForEvent('download'),
      page.getByText('Download PDF', { exact: true }).click(),
    ])
    await page.waitForTimeout(300)
    const entraReqUrl = new URL(recordedDownloadUrl)
    check('Entra inbox download message_id round-trips exactly', entraReqUrl.searchParams.get('message_id') === GRAPH_INBOX.id, entraReqUrl.search)
    check('Entra inbox download folder is inbox', entraReqUrl.searchParams.get('folder') === 'inbox')
    check('Entra inbox file name uses the subject (fix A)', entraDownload.suggestedFilename() === `E2E Entra Inbox ${RUN}.pdf`, entraDownload.suggestedFilename())

    recordedSaveBody = null
    await page.getByRole('button', { name: /save as pdf/i }).first().click()
    await page.waitForTimeout(300)
    await page.getByText('Save to Drive', { exact: true }).click()
    await page.waitForTimeout(600)
    await Promise.all([
      page.waitForResponse('**/emails/pdf/save-to-drive'),
      page.locator('form#formSavePdfToDrive button[type=submit]').click(),
    ])
    check('Entra save-to-drive (root) body has no folder_uuid', recordedSaveBody && !recordedSaveBody.folder_uuid, JSON.stringify(recordedSaveBody))
    check('Entra save-to-drive message_id matches', recordedSaveBody?.message_id === GRAPH_INBOX.id, JSON.stringify(recordedSaveBody))

    await page.unroute('**/api/user/emails/pdf/download**')
    await page.route('**/api/user/emails/pdf/download**', (route) => route.fulfill({ status: 422, contentType: 'application/json', body: JSON.stringify({ message: 'Stub 422 message' }) }))
    await page.getByRole('button', { name: /save as pdf/i }).first().click()
    await page.waitForTimeout(300)
    await page.getByText('Download PDF', { exact: true }).click()
    await page.waitForTimeout(1000)
    check('a non-400 error (422) still surfaces the server message', await visibleWithin(page.getByText('Stub 422 message'), 5000))
    // Routes match in reverse registration order - left in place, this 422
    // stub would also swallow the Sent download attempt below. Remove it and
    // restore the real-PDF-bytes stub the Sent download actually needs.
    await page.unroute('**/api/user/emails/pdf/download**')
    await page.route('**/api/user/emails/pdf/download**', async (route) => {
      recordedDownloadUrl = route.request().url()
      const sentPdfPath = path.join(tempDir, 'sent-download.pdf')
      const real = fs.existsSync(sentPdfPath) ? fs.readFileSync(sentPdfPath) : Buffer.from('%PDF-1.4 stub')
      await route.fulfill({ status: 200, contentType: 'application/pdf', body: real })
    })

    await page.goto(`${BASE}/mail/sent`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1500)
    await suppressOverlays()
    await sentRow(`E2E Entra Sent ${RUN}`).click()
    await page.waitForTimeout(1000)
    await page.getByRole('button', { name: /save as pdf/i }).first().click()
    await page.waitForTimeout(300)
    const [entraSentDownload] = await Promise.all([
      page.waitForEvent('download'),
      page.getByText('Download PDF', { exact: true }).click(),
    ])
    check('Entra sent heading/file name uses the subject (fix A)', entraSentDownload.suggestedFilename() === `E2E Entra Sent ${RUN}.pdf`, entraSentDownload.suggestedFilename())

    await page.unrouteAll()
  } catch (e) {
    check('Step 9 threw', false, e.message)
  }

  // === Step 10. Console errors ===============================================
  console.log('\n=== Step 10: Console errors ===')
  const realConsoleErrors = consoleErrors.filter((e) =>
    !e.includes('WebSocket connection') &&
    !e.includes('Obiyen script tag') &&
    !e.includes('status of 400') &&
    !e.includes('status of 422') &&
    !e.includes('Stub 422 message') &&
    // Expected: message A's reading-pane preview (v-safe-html/DOMPurify, not
    // the backend's HTMLPurifier) still renders its file:// probes as real
    // src attributes. Chrome itself refuses to fetch them - this is exactly
    // the browser behaving correctly, not a leak (the server-side canary
    // checks are what actually prove the SSRF probes are neutralised).
    !e.includes('ERR_UNKNOWN_URL_SCHEME'))
  check('no unexpected console errors during the flow', realConsoleErrors.length === 0, JSON.stringify(realConsoleErrors.slice(0, 10)))
} catch (e) {
  check('Unexpected top-level error: ' + e.message, false)
  await page.screenshot({ path: `${SHOT}/mail-pdf-99-error.png`, fullPage: true }).catch(() => {})
} finally {
  clearInterval(overlayWatchdog)
  // === Cleanup (exact rows only, never bulk) ================================
  console.log('\n=== Cleanup ===')
  try {
    for (const uuid of createdDriveUuids) {
      await api(TOKEN)('DELETE', `/user/company-file-folders/${uuid}`)
    }
    if (folderUuid) await api(TOKEN)('DELETE', `/user/company-file-folders/${folderUuid}`)

    const cleanupScript = [
      citizenEmailUuid ? `App\\Models\\CitizenEmail::withTrashed()->where('uuid','${citizenEmailUuid}')->first()?->forceDelete();` : '',
      citizenFileFolderId ? `App\\Models\\CitizenFileFolder::where('id',${citizenFileFolderId})->first()?->delete();` : '',
      'echo "cleanup done";',
    ].filter(Boolean).join('\n')
    if (citizenEmailUuid || citizenFileFolderId) tinker(cleanupScript)

    for (const file of fs.readdirSync(path.join(BACKEND_PATH, 'storage', 'app', 'mail')).flatMap((dir) => {
      const full = path.join(BACKEND_PATH, 'storage', 'app', 'mail', dir)
      return fs.statSync(full).isDirectory() ? fs.readdirSync(full).map((f) => path.join(full, f)) : []
    })) {
      if (file.includes(RUN)) fs.unlinkSync(file)
    }
  } catch (e) {
    console.log('  cleanup warning:', e.message)
  }

  fs.rmSync(tempDir, { recursive: true, force: true })
  canary.server.close()
  await browser.close()
}

console.log(`\n=== ${total - failures}/${total} PASS ===`)
process.exit(failures === 0 ? 0 : 1)
