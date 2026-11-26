/**
 * Browser E2E for Roadmap #501: group chats linked to a department.
 *
 * What this proves:
 * 1. An admin (in no department) opens "Ny samtale", picks "Knyt til → Afdeling",
 *    chooses "E2E Nord" and creates the chat. The recipient fields are gone while
 *    linked, and the admin is told the chat was made but is not in their list.
 * 2. The employee in Nord sees it in the list with the department label, opens it,
 *    sees the label in the header, writes a message, and the member list says the
 *    members are managed by the department, with no remove button.
 * 3. The employee in Syd does not see it, and opening its address shows nothing.
 * 4. After the department is deleted, the chat is archived: the Nord employee can
 *    still read the message, the archived note replaces the message field.
 *
 * Needs the isolated company of the Roadmap #501 fixture (chat501-fixture.php):
 * group chat on, an admin, departments Nord and Syd with one employee each.
 *
 * Env:  CO_ADMIN_TOKEN, CO_NORD_TOKEN, CO_SYD_TOKEN, CO_ARCHIVE_CMD (a shell command
 *       that deletes department Nord), CO_BASE_URL (default http://localhost:3000),
 *       CO_API_URL (default http://localhost:8000), CO_SHOT_DIR
 */
import { chromium } from 'playwright-core'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
import path from 'path'
import fs from 'fs'

const ADMIN = process.env.CO_ADMIN_TOKEN
const NORD = process.env.CO_NORD_TOKEN
const SYD = process.env.CO_SYD_TOKEN
const ARCHIVE_CMD = process.env.CO_ARCHIVE_CMD
const BASE = (process.env.CO_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')
const API = (process.env.CO_API_URL || 'http://localhost:8000').replace(/\/$/, '')
const SHOT = process.env.CO_SHOT_DIR || path.join(path.dirname(fileURLToPath(import.meta.url)), 'screenshots')
const TIMEOUT = 60000
const NAME = `E2E Nord-chat ${Date.now().toString().slice(-5)}`

for (const [name, value] of Object.entries({ CO_ADMIN_TOKEN: ADMIN, CO_NORD_TOKEN: NORD, CO_SYD_TOKEN: SYD, CO_ARCHIVE_CMD: ARCHIVE_CMD })) {
  if (!value) {
    console.error(`${name} is required.`)
    process.exit(1)
  }
}
fs.mkdirSync(SHOT, { recursive: true })

let failures = 0
function check(label, condition, detail = '') {
  if (condition) {
    console.log(`  ok   ${label}`)
  } else {
    failures++
    console.error(`  FAIL ${label}${detail ? ` - ${detail}` : ''}`)
  }
}

async function apiChats(token) {
  const res = await fetch(`${API}/api/user/chats`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } })
  return (await res.json().catch(() => ({})))?.data ?? []
}

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const problems = []

async function pageAs(token) {
  const context = await browser.newContext({ viewport: { width: 1400, height: 950 } })
  const page = await context.newPage()
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`))
  page.on('console', (m) => { if (/messages\.linkedChat\./.test(m.text())) problems.push(`missing text: ${m.text().slice(0, 160)}`) })
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: TIMEOUT })
  await page.evaluate((t) => localStorage.setItem('_token', t), token)
  return { context, page }
}

async function open(page, route) {
  await Promise.all([
    page.waitForResponse((r) => r.url().endsWith('/api/user') && r.request().method() === 'GET', { timeout: TIMEOUT }),
    page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: TIMEOUT }),
  ])
  await page.waitForTimeout(2500)
  const gotIt = page.locator('#headlessui-portal-root').getByRole('button', { name: /^(got it|forstået|forstått|uppfattat|ok)$/i })
  if (await gotIt.count()) {
    await gotIt.first().click()
    await page.waitForTimeout(400)
  }
}

let chatUuid = null
// The chat page's message field, not the support widget's hidden one (#cw-input).
const composer = (page) => page.locator('textarea:not(#cw-input)')

try {
  // ---- 1. The admin creates the chat -------------------------------------------
  console.log('Admin creates the linked chat')
  const admin = await pageAs(ADMIN)
  await open(admin.page, '/messages')
  await admin.page.getByRole('button', { name: /Ny samtale|New conversation/i }).first().click()
  const link = admin.page.locator('[data-testid="chat-link"]:visible').first()
  await link.waitFor({ timeout: 15000 })
  check('the new-chat window offers "Knyt til"', /Knyt til/.test(await link.innerText()))

  await link.locator('[data-testid="chat-link-department"]').click()
  check('the recipient field is gone while linked', (await admin.page.locator('#receivers:visible').count()) === 0)
  check('the message field is gone while linked', (await admin.page.locator('#message:visible').count()) === 0)

  await link.locator('[data-testid="chat-link-select"]').click()
  await admin.page.locator('.multiselect-option:visible', { hasText: 'E2E Nord' }).first().click()
  await admin.page.locator('#subject:visible').first().fill(NAME)
  await admin.page.screenshot({ path: path.join(SHOT, 'roadmap501-1-create.png') })

  const [created] = await Promise.all([
    admin.page.waitForResponse((r) => r.url().endsWith('/api/user/chats') && r.request().method() === 'POST', { timeout: 15000 }),
    admin.page.getByRole('button', { name: /Opret chat/ }).first().click(),
  ])
  const body = await created.json().catch(() => ({}))
  chatUuid = body?.data?.uuid
  check('the chat is created (201)', created.status() === 201, String(created.status()))
  check('linked to the department, with Nina as its one member', body?.data?.linked_to?.name === 'E2E Nord' && body?.member_count === 1 && body?.is_member === false, JSON.stringify({ l: body?.data?.linked_to, m: body?.member_count, me: body?.is_member }))
  await admin.page.waitForTimeout(1200)
  check('the admin is told it is not in their list', /ikke selv i afdelingen/.test(await admin.page.locator('body').innerText()))
  await admin.page.screenshot({ path: path.join(SHOT, 'roadmap501-2-created.png') })
  await admin.context.close()

  // ---- 2. Nina in Nord ------------------------------------------------------------
  console.log('Nina (Nord) sees it and writes')
  const nina = await pageAs(NORD)
  await open(nina.page, '/messages')
  const listLabel = nina.page.locator('[data-testid="chat-list-linked-label"]', { hasText: 'E2E Nord' })
  await listLabel.first().waitFor({ timeout: TIMEOUT })
  check('Nina\'s chat list shows the chat with its department label', (await listLabel.count()) >= 1)

  await open(nina.page, `/messages/${chatUuid}`)
  const header = nina.page.locator('[data-testid="chat-linked-label"]')
  await header.waitFor({ timeout: TIMEOUT })
  check('the chat header says "E2E Nord"', /E2E Nord/.test(await header.innerText()))

  const text = `Hej Nord ${Date.now()}`
  await composer(nina.page).first().fill(text)
  await Promise.all([
    nina.page.waitForResponse((r) => r.url().includes('/chat-messages/send/message') && r.request().method() === 'POST', { timeout: 15000 }),
    composer(nina.page).first().press('Enter'),
  ])
  await nina.page.getByText(text).first().waitFor({ timeout: 15000 })
  check('Nina\'s message is in the chat', true)

  await nina.page.getByRole('button', { name: /Gruppemedlemmer|Group members/i }).first().click()
  const managed = nina.page.locator('[data-testid="chat-members-managed"]')
  await managed.waitFor({ timeout: 15000 })
  check('the member list says the members are managed by E2E Nord', /E2E Nord/.test(await managed.innerText()))
  check('and has no add or remove buttons', (await nina.page.locator('[aria-label="Fjern bruger"], [aria-label="Remove user"]').count()) === 0
    && (await nina.page.getByRole('button', { name: /Tilføj brugere|Add users/i }).count()) === 0)
  await nina.page.screenshot({ path: path.join(SHOT, 'roadmap501-3-member.png') })
  await nina.page.keyboard.press('Escape')

  // ---- 3. Sune in Syd -------------------------------------------------------------
  console.log('Sune (Syd) does not see it')
  const sune = await pageAs(SYD)
  await open(sune.page, '/messages')
  check('Sune\'s chat list does not show it', (await sune.page.locator('[data-testid="chat-list-linked-label"]', { hasText: 'E2E Nord' }).count()) === 0)
  check('nor does the API give it to him', !(await apiChats(SYD)).some((c) => c.uuid === chatUuid))
  await open(sune.page, `/messages/${chatUuid}`)
  check('opening its address shows neither the message nor the label',
    (await sune.page.getByText(text).count()) === 0 && (await sune.page.locator('[data-testid="chat-linked-label"]').count()) === 0)
  await sune.page.screenshot({ path: path.join(SHOT, 'roadmap501-4-outsider.png') })
  await sune.context.close()

  // ---- 4. The department is deleted --------------------------------------------
  console.log('Department deleted: the chat is archived')
  execSync(ARCHIVE_CMD, { stdio: 'pipe' })
  await open(nina.page, `/messages/${chatUuid}`)
  const archived = nina.page.locator('[data-testid="chat-archived"]')
  await archived.waitFor({ timeout: TIMEOUT })
  check('the archived note replaces the message field', (await composer(nina.page).count()) === 0)
  check('the earlier message can still be read', (await nina.page.getByText(text).count()) >= 1)
  check('the label is kept', /E2E Nord/.test(await nina.page.locator('[data-testid="chat-linked-label"]').innerText().catch(() => '')))
  await nina.page.screenshot({ path: path.join(SHOT, 'roadmap501-5-archived.png') })
  await nina.context.close()
} catch (error) {
  failures++
  console.error('  FAIL unexpected:', error.message)
} finally {
  await browser.close()
}

for (const problem of problems) {
  failures++
  console.error(`  FAIL ${problem}`)
}
console.log(failures ? `\n${failures} failure(s)` : '\nAll checks passed')
process.exit(failures ? 1 : 0)
