/**
 * Browser E2E: inserting a message template when starting a new chat.
 *
 * Templates used to be offered only inside an ongoing chat. The "New
 * conversation" dialog now has the same template picker under the message
 * field. This test opens the dialog, writes to a citizen, inserts a template
 * into an empty message and into a message already typed by hand (the second
 * case also covers FormTextArea now showing a value set from code after the
 * user has typed), sends it, and checks the new chat holds the template text.
 *
 * Needs a company with the patient portal, at least one citizen with system
 * access and at least one message template. The test does not clean up the chat
 * it creates; it prints the chat uuid so the caller can remove it.
 *
 * Run:  see tests/e2e/README.md
 * Env:  CO_TOKEN (required), CO_BASE_URL (default http://localhost:3000),
 *       CO_API_URL (default http://127.0.0.1:8000)
 */
import { chromium } from 'playwright-core'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const TOKEN = process.env.CO_TOKEN
const BASE = process.env.CO_BASE_URL || 'http://localhost:3000'
const API = process.env.CO_API_URL || 'http://127.0.0.1:8000'
const SHOT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'screenshots')
fs.mkdirSync(SHOT, { recursive: true })

if (!TOKEN) {
  console.error('Missing CO_TOKEN.')
  process.exit(2)
}

const results = []
const ok = (name, cond, detail = '') => { results.push(cond); console.log(`${cond ? '✅' : '❌'} ${name}${!cond && detail ? `\n   ${detail}` : ''}`) }

async function api(method, urlPath) {
  const res = await fetch(`${API}/api/user${urlPath}`, {
    method,
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json' },
  })
  return { status: res.status, json: await res.json().catch(() => null) }
}

const templatesRes = await api('GET', '/message-templates/all/list')
const templates = Array.isArray(templatesRes.json) ? templatesRes.json : (templatesRes.json?.data ?? [])
if (templates.length === 0) {
  console.error('The company has no message templates to insert.')
  process.exit(2)
}
const template = templates[templates.length - 1]
const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const TYPED = 'Hej igen'

// System Chrome by default, as the other tests; CO_BROWSER=chromium uses Playwright's own Chromium.
const browser = await chromium.launch(process.env.CO_BROWSER === 'chromium'
  ? { headless: true }
  : { channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
page.setDefaultTimeout(20000)
const consoleErrors = []
page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
page.on('pageerror', (err) => consoleErrors.push('pageerror: ' + err.message))

let chatUuid = null

try {
  await page.goto(BASE)
  await page.evaluate((t) => localStorage.setItem('_token', t), TOKEN)
  // On a hard load of /messages the dialog asks for citizens before the layout
  // has loaded the signed-in user, and offers none. Let the user load, then
  // leave and come back client-side so the dialog mounts with the user present.
  await page.goto(`${BASE}/messages`)
  await page.waitForFunction(() =>
    document.querySelector('#__nuxt')?.__vue_app__?.config.globalProperties.$pinia?.state.value.userStore?.user?.company?.patient_access_activated,
    null, { timeout: 30000 })
  const push = (to) => page.evaluate((r) => document.querySelector('#__nuxt').__vue_app__.config.globalProperties.$router.push(r), to)
  await push('/calendar')
  await page.waitForURL(/\/calendar/)
  await push('/messages')
  await page.waitForURL(/\/messages$/)

  // The page header's "New conversation" button.
  await page.locator('button', { hasText: /^\s*(Ny samtale|New conversation)\s*$/ }).first().click()
  const dialog = page.locator('form').filter({ has: page.locator('#message') })
  await dialog.waitFor()

  await page.getByTestId('chat-recipient-type-citizens').click()
  ok('Citizen recipient type selected', (await page.getByTestId('chat-citizen-warning').count()) === 1)

  const picker = dialog.locator('button[title="Indsæt skabelon"], button[title="Insert template"]')
  ok('Template button is shown in the new-chat dialog', await picker.isVisible())

  // 1) Empty message: the template becomes the message.
  await picker.click()
  // hasText is a case-insensitive substring match and a title can appear in another
  // template's body, so match the title line exactly.
  const optionFor = () => dialog.locator('.max-h-64 > button')
    .filter({ has: page.locator('p', { hasText: new RegExp(`^\\s*${escape(template.title)}\\s*$`) }) })
  const option = optionFor()
  await option.waitFor()
  ok(`Dropdown lists all ${templates.length} templates`,
    (await dialog.locator('.max-h-64 > button').count()) === templates.length)

  // The dialog clips overflow, so the open list must sit fully inside it.
  const panel = page.locator('.overflow-clip').filter({ has: page.locator('#message') }).first()
  const list = dialog.locator('.max-h-64').first()
  const [p, l] = [await panel.boundingBox(), await list.boundingBox()]
  ok('Open template list fits inside the dialog (not clipped)',
    p && l && l.y >= p.y && l.y + l.height <= p.y + p.height && l.x >= p.x && l.x + l.width <= p.x + p.width,
    JSON.stringify({ panel: p, list: l }))
  await page.screenshot({ path: path.join(SHOT, 'new-chat-template-open.png') })

  await option.click()
  const textarea = dialog.locator('#message')
  ok('Template fills an empty message', (await textarea.inputValue()) === template.body,
    JSON.stringify(await textarea.inputValue()))
  ok('Dropdown closes after picking', (await dialog.locator('.max-h-64').count()) === 0)

  // 2) Typed by hand first, then a template: it is added on a new line and shown.
  await textarea.fill('')
  await textarea.click()
  await page.keyboard.type(TYPED)
  await picker.click()
  await optionFor().click()
  const expected = `${TYPED}\n${template.body}`
  ok('Template is appended after hand-typed text and visible in the box',
    (await textarea.inputValue()) === expected, JSON.stringify(await textarea.inputValue()))
  await page.screenshot({ path: path.join(SHOT, 'new-chat-template-inserted.png') })

  // 3) Pick the first citizen and send.
  await dialog.locator('#receivers').click()
  await page.locator('.multiselect-option').first().click()
  await page.keyboard.press('Escape').catch(() => {})
  await dialog.locator('button[type="submit"]').click()

  await page.waitForURL(/\/messages\/[0-9a-f-]{36}/, { timeout: 20000 })
  chatUuid = page.url().match(/\/messages\/([0-9a-f-]{36})/)[1]
  ok('Sending opens the new chat', !!chatUuid)

  await page.getByText(TYPED, { exact: false }).first().waitFor()
  await page.screenshot({ path: path.join(SHOT, 'new-chat-template-sent.png') })
  const shown = await page.locator('body').innerText()
  ok('The sent message in the chat contains the template text',
    shown.includes(TYPED) && shown.includes(template.body.split('\n')[0]))

  const relevantErrors = consoleErrors.filter((e) => !/favicon|ResizeObserver|websocket|reverb|pusher/i.test(e))
  ok('No console errors', relevantErrors.length === 0, relevantErrors.join('\n   '))
} catch (error) {
  ok(`Test ran to completion (${error.message.split('\n')[0]})`, false)
  await page.screenshot({ path: path.join(SHOT, 'new-chat-template-failure.png') }).catch(() => {})
} finally {
  await browser.close()
  console.log(`CHAT_UUID=${chatUuid ?? ''}`)
}

const passed = results.filter(Boolean).length
console.log(`\n${passed}/${results.length} checks passed`)
process.exit(passed === results.length ? 0 : 1)
