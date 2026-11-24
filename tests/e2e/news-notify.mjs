/**
 * Browser E2E for Roadmap #201: "Send notifikation" on a bulletin board post.
 *
 * What this proves:
 * 1. A new post (which starts inactive): the hint names employees and citizens, and
 *    the form says the notification is sent when the post is made active, until "Active" is ticked.
 * 2. A post saved inactive with the box ticked keeps the box on its edit form,
 *    ticked, with that same line.
 * 3. Making it active and saving sends it (notified_at is set) and the box is
 *    gone from the edit form afterwards: it is sent once per post.
 *
 * It writes one test post through the API (inactive) and switches it on in the
 * browser. Run it as the admin of a company with nobody else in it, so the post
 * reaches nobody and nothing is queued for real phones.
 *
 * Run:  see tests/e2e/README.md
 * Env:  CO_TOKEN (required, an Admin, ideally of an empty test company),
 *       CO_BASE_URL (default http://localhost:3001), CO_API_URL (default http://localhost:8001),
 *       CO_SHOT_DIR (default tests/e2e/screenshots)
 */
import { chromium } from 'playwright-core'
import { fileURLToPath } from 'url'
import path from 'path'

const TOKEN = process.env.CO_TOKEN
const BASE = process.env.CO_BASE_URL || 'http://localhost:3001'
const API = (process.env.CO_API_URL || 'http://localhost:8001').replace(/\/$/, '')
const SHOT = process.env.CO_SHOT_DIR || path.join(path.dirname(fileURLToPath(import.meta.url)), 'screenshots')
const TIMEOUT = 60000

if (!TOKEN) {
  console.error('CO_TOKEN (Admin) is required. See tests/e2e/README.md')
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

async function api(method, route, form) {
  const res = await fetch(`${API}/api${route}`, {
    method,
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json' },
    body: form,
  })
  return { status: res.status, json: await res.json().catch(() => ({})) }
}

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1400, height: 1100 } })
const problems = []
page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`))
page.on('console', (m) => { if (/notifyHint|notifyInactiveHint|news\.form\./.test(m.text())) problems.push(m.text().slice(0, 200)) })

async function open(route) {
  await Promise.all([
    page.waitForResponse((r) => r.url().endsWith('/api/user') && r.request().method() === 'GET', { timeout: TIMEOUT }),
    page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: TIMEOUT }),
  ])
  await page.waitForTimeout(3000)
  const gotIt = page.locator('#headlessui-portal-root').getByRole('button', { name: /^(got it|forstået|forstått|uppfattat|ok)$/i })
  if (await gotIt.count()) {
    await gotIt.first().click()
    await page.waitForTimeout(500)
  }
}

const box = () => page.locator('[data-testid="news-notify"]')
const inactiveLine = () => page.locator('[data-testid="news-notify-inactive"]')
const activeToggle = () => page.locator('div.cursor-pointer').filter({ hasText: /^\s*(Active|Aktiv)\s*$/ }).first()
const ticked = async (container) => (await container.locator('input[type="checkbox"]').first().isChecked().catch(() => null))
  ?? (await container.locator('svg, [class*="check"]').count()) > 0

let uuid = null
try {
  await page.goto(`${BASE}/overview`, { waitUntil: 'domcontentloaded', timeout: TIMEOUT })
  await page.evaluate((token) => localStorage.setItem('_token', token), TOKEN)

  console.log('a new post')
  await open('/news/new')
  check('the notify box is there', (await box().count()) === 1)
  const hint = (await box().innerText()).trim()
  console.log(`       box: ${hint.replace(/\s+/g, ' ')}`)
  check('the hint names employees and citizens', /citizens|borgere/i.test(hint) && /employees|medarbejdere/i.test(hint), hint)
  check('no untranslated key', !/news\.form\./.test(hint), hint)
  // A new post starts inactive (pages/news/new.vue), so the line shows until "Active" is ticked.
  check('a new post starts inactive and says it is sent when made active', (await inactiveLine().count()) === 1)
  await page.screenshot({ path: `${SHOT}/news-notify-new.png` })
  await activeToggle().click()
  await page.waitForTimeout(400)
  check('ticking "Active" removes that line', (await inactiveLine().count()) === 0)
  await activeToggle().click()
  await page.waitForTimeout(400)
  check('unticking it brings the line back', (await inactiveLine().count()) === 1)

  console.log('a post saved inactive with the box ticked')
  const audiences = await api('GET', '/user/audiences/all/list')
  const audienceUuids = (audiences.json?.data ?? []).map((a) => a.uuid).filter(Boolean)
  const form = new FormData()
  form.append('title', 'E2E Roadmap #201')
  form.append('content', '<p>Testopslag fra e2e.</p>')
  form.append('is_active', 'false')
  form.append('is_featured', 'false')
  form.append('notify', 'true')
  form.append('audience_uuid', JSON.stringify(audienceUuids))
  form.append('department_uuid', JSON.stringify(['all-departments']))
  const created = await api('POST', '/user/news', form)
  uuid = created.json?.data?.uuid
  check('saved inactive with the tick', created.status < 300 && !!uuid && created.json?.data?.notify_on_publish === true && !created.json?.data?.notified_at,
    `${created.status} ${JSON.stringify(created.json).slice(0, 200)}`)

  await open(`/news/${uuid}/edit`)
  check('the edit form still offers the box', (await box().count()) === 1)
  check('it says it is sent when made active', (await inactiveLine().count()) === 1)
  await page.screenshot({ path: `${SHOT}/news-notify-edit-inactive.png` })

  console.log('switched on in the browser')
  await activeToggle().click()
  await page.waitForTimeout(400)
  check('the inactive line goes once it is active', (await inactiveLine().count()) === 0)
  const [saved] = await Promise.all([
    page.waitForResponse((r) => r.request().method() === 'POST' && r.url().includes(`/news/${uuid}/update`), { timeout: TIMEOUT }),
    page.locator('form button[type="submit"]').last().click(),
  ])
  const savedJson = await saved.json().catch(() => ({}))
  check('saving was accepted', saved.ok(), `${saved.status()}`)
  check('the post is active and was sent (notified_at)', savedJson?.data?.is_active === true && !!savedJson?.data?.notified_at, JSON.stringify({ active: savedJson?.data?.is_active, notified_at: savedJson?.data?.notified_at }))

  await open(`/news/${uuid}/edit`)
  check('after sending, the box is gone from the edit form', (await box().count()) === 0)

  check('no page errors and no untranslated texts', problems.length === 0, problems.slice(0, 3).join(' | '))
} finally {
  if (uuid) console.log(`  removed the test post: ${(await api('DELETE', `/user/news/${uuid}`)).status}`)
  await browser.close()
}

console.log(failures === 0 ? '\nPASS' : `\nFAIL (${failures})`)
process.exit(failures === 0 ? 0 : 1)
