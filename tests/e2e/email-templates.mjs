/**
 * Browser E2E for the superadmin "Email templates" UI.
 *
 * Drives the real SPA in headless Chrome: authenticates by injecting a minted
 * Sanctum token into localStorage (no password needed), then verifies the
 * language switcher, every template editor, the logo + live preview, and the
 * save flow. Self-restoring: the one template it edits is reset via the API.
 *
 * Run:  see tests/e2e/README.md
 * Env:  CO_TOKEN (required), CO_BASE_URL (default http://localhost:3001),
 *       CO_API_URL (default http://localhost:8001)
 */
import { chromium } from 'playwright-core'
import { fileURLToPath } from 'url'
import path from 'path'

const TOKEN = process.env.CO_TOKEN
const BASE = process.env.CO_BASE_URL || 'http://localhost:3001'
const API = process.env.CO_API_URL || 'http://localhost:8001'
const SHOT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'screenshots')

if (!TOKEN) {
  console.error('Missing CO_TOKEN. Mint one (see tests/e2e/README.md) and pass it as CO_TOKEN.')
  process.exit(2)
}

// Templates grouped by the language tab they live under.
const LANGS = [
  { tab: 'Dansk', subjects: ['Velkommen til {{app_name}}', 'Du er blevet inviteret til {{app_name}}'] },
  { tab: 'English', subjects: ['Welcome to {{app_name}}', 'You have been invited to {{app_name}}'] },
]

const results = []
const ok = (name, cond) => { results.push(cond); console.log(`${cond ? '✅' : '❌'} ${name}`) }

async function api(method, urlPath, body) {
  const res = await fetch(`${API}/api/superadmin/email-templates${urlPath}`, {
    method,
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json', 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  return { status: res.status, json: await res.json().catch(() => null) }
}

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage()
page.setDefaultTimeout(20000)

try {
  // 1) Authenticate by injecting the token, then load the page.
  await page.goto(`${BASE}/superadmin`, { waitUntil: 'domcontentloaded' })
  await page.evaluate((t) => localStorage.setItem('_token', t), TOKEN)
  await page.goto(`${BASE}/superadmin/email-templates`, { waitUntil: 'domcontentloaded' })

  await page.locator('button', { hasText: '{{app_name}}' }).first().waitFor()
  ok('Page loads (superadmin auth via token)', true)

  const bodyText = await page.locator('body').innerText()
  ok('i18n resolves (no raw "superadmin.*" keys)',
    !bodyText.includes('superadmin.emailTemplates') && !bodyText.includes('superadmin.sidebar.emailTemplates'))

  // 2) Language switcher present.
  let tabsOk = true
  for (const l of LANGS) tabsOk = tabsOk && (await page.getByRole('button', { name: l.tab, exact: true }).count()) > 0
  ok('Language switcher shows tabs (Dansk / English)', tabsOk)
  await page.screenshot({ path: `${SHOT}/01-list.png`, fullPage: true })

  // 3) Per language: only that language's templates show, and each editor populates.
  let n = 2
  for (const l of LANGS) {
    await page.getByRole('button', { name: l.tab, exact: true }).click()
    let shown = 0
    for (const s of l.subjects) shown += (await page.locator('button', { hasText: s }).count()) > 0 ? 1 : 0
    ok(`${l.tab}: shows its ${l.subjects.length} templates (found ${shown})`, shown === l.subjects.length)
    for (const s of l.subjects) {
      await page.locator('button', { hasText: s }).first().click()
      const subj = await page.locator('input[type=text]').first().inputValue()
      const body = await page.locator('textarea').first().inputValue()
      const preview = (await page.locator('div[class*="overflow-y-auto"]').last().innerText()).trim()
      ok(`  editor «${s}» (subject ${subj.length}, body ${body.length}, preview ${preview.length})`,
        subj.length > 0 && body.length > 50 && preview.length > 20)
      await page.screenshot({ path: `${SHOT}/0${n++}-edit.png`, fullPage: true })
      await page.getByRole('button', { name: /Annullér|Cancel/ }).first().click().catch(() => {})
    }
  }

  // 4) Preview shows the logo and substitutes placeholders.
  await page.getByRole('button', { name: 'English', exact: true }).click()
  await page.locator('button', { hasText: LANGS[1].subjects[0] }).first().click()
  await page.locator('textarea').first().waitFor()
  const previewBox = page.locator('div[class*="overflow-y-auto"]').last()
  const previewHtml = await previewBox.innerHTML()
  const previewText = await previewBox.innerText()
  ok('Preview shows the logo (img /img/logo.svg)', previewHtml.includes('/img/logo.svg'))
  ok('Preview substitutes placeholders (no raw {{…}}, shows "Anna")', !previewText.includes('{{') && previewText.includes('Anna'))
  await page.screenshot({ path: `${SHOT}/06-preview.png`, fullPage: true })

  // 5) Edit + save flow (then restore via API).
  const subjInput = page.locator('input[type=text]').first()
  const orig = await subjInput.inputValue()
  const marked = orig + ' [E2E]'
  await subjInput.fill(marked)
  await page.getByRole('button', { name: /Gem|Save/ }).click()
  const saved = await page.locator('button', { hasText: marked }).first()
    .waitFor({ timeout: 15000 }).then(() => true).catch(() => false)
  ok('Save updates the template (new subject in list)', saved)
  await page.screenshot({ path: `${SHOT}/07-saved.png`, fullPage: true })

  const { json } = await api('GET', '')
  const edited = (json?.data || []).find((t) => t.subject === marked)
  if (edited) {
    await api('PUT', `/${edited.uuid}`, { subject: orig, body: edited.body })
    console.log('↩︎  restored edited template subject')
  }
} catch (e) {
  ok('Unexpected error: ' + e.message, false)
  await page.screenshot({ path: `${SHOT}/99-error.png`, fullPage: true }).catch(() => {})
} finally {
  await browser.close()
}

const passed = results.filter(Boolean).length
console.log(`\n=== ${passed}/${results.length} PASS ===`)
process.exit(passed === results.length ? 0 : 1)
