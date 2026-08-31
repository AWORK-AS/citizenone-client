/**
 * Browser E2E for the Task Boards permission fix + board deactivate feature.
 *
 * Covers two changes shipped together:
 * 1. TaskService::updateTask now allows the task's creator, its current
 *    assignee, or a Manager+ to update it (previously creator-or-Manager
 *    only) - an assignee can now fix their own task's due date, not just
 *    drag it to Done.
 * 2. board-manage-modal.vue gained a Deactivate/Reactivate action; a
 *    deactivated board disappears from a non-manager's board switcher but
 *    stays reachable (marked distinctly) in a Manager's, so it can be
 *    reactivated.
 *
 * The backend already has an HTTP-level permission-boundary test
 * (TaskWorkflowTest); this script proves the actual UI paths a backend test
 * cannot: the always-visible edit button actually working end-to-end for an
 * assignee, and the board switcher's visibility behavior around deactivation.
 *
 * Setup/cleanup use the real API directly (create board + task before, delete
 * them after) so the test is self-restoring and can be re-run safely. The
 * company also needs an active tasks-workflow entitlement (no public API for
 * granting that - see README's tinker snippet), same prerequisite shape as
 * CO_STAFF_TOKEN in the create-report-permission test.
 *
 * Run:  see tests/e2e/README.md
 * Env:  CO_TOKEN (required, Manager), CO_ASSIGNEE_TOKEN (required, plain
 *       User-role employee in the same company - see README),
 *       CO_BASE_URL (default http://localhost:3000),
 *       CO_API_URL (default http://127.0.0.1:8000)
 */
import { chromium } from 'playwright-core'
import { fileURLToPath } from 'url'
import path from 'path'

const TOKEN = process.env.CO_TOKEN
const ASSIGNEE_TOKEN = process.env.CO_ASSIGNEE_TOKEN
const BASE = process.env.CO_BASE_URL || 'http://localhost:3000'
const API = process.env.CO_API_URL || 'http://127.0.0.1:8000'
const SHOT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'screenshots')

if (!TOKEN || !ASSIGNEE_TOKEN) {
  console.error('Missing CO_TOKEN and/or CO_ASSIGNEE_TOKEN. See tests/e2e/README.md.')
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

const EDIT_TASK = /Edit task|Rediger opgave/i
const SAVE = /^(Save|Gem)$/
const MANAGE_BOARD = /Manage board|Administrer tavle/i
const DEACTIVATE = /Deactivate board|Deaktiver tavle/i
const REACTIVATE = /Reactivate board|Genaktiver tavle/i
const NEW_TASK = /New task|Ny opgave/i
const INACTIVE_SUFFIX = /Inactive|Inaktiv/i

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage()
// Higher than the other scripts' default: php artisan serve is single-threaded
// and this app's dashboard fires a dozen+ API calls on every cold boot, so
// under any real machine load a hard navigation can take well past 20s.
page.setDefaultTimeout(45000)
const consoleErrors = []
page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
page.on('pageerror', (err) => consoleErrors.push('pageerror: ' + err.message))

// A one-shot page.waitForResponse() raced against a click via Promise.all can
// still miss a response that completes very quickly after the click fires -
// this collector keeps every response seen so an assertion can look back at
// what already happened instead of racing to catch it live.
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

let boardUuid = null
let taskUuid = null
const UPDATED_TITLE = `E2E assignee edit ${Date.now()}`

// The /tasks page is gated by definePageMeta({ middleware: 'require-application' }),
// which reads userStore.getUser synchronously at navigation time. A plain
// `domcontentloaded` reload resolves before the /api/user fetch completes, so
// the middleware sees a still-null user, treats it as denied, and Nuxt's
// abortNavigation() on a cold/hydrating SPA boot renders that as a client-side
// "Page Not Found" instead of the intended redirect. Waiting on the specific
// /api/user response (rather than 'networkidle', which can hang indefinitely
// on the app's persistent Pusher websocket) lets the user store populate
// before anything navigates onward.
// php artisan serve is single-threaded, and a cold app boot fires a dozen+
// dashboard API calls at once - /api/user is often the last of that batch to
// be served, so this can legitimately take well past the default 20s under
// any load. Give it real room rather than racing the dev server's queue.
const USER_FETCH_TIMEOUT = 60000

async function authAs(token) {
  await page.goto(`${BASE}/overview`, { waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT })
  await page.evaluate((t) => localStorage.setItem('_token', t), token)
  await Promise.all([
    page.waitForResponse((r) => r.url().endsWith('/api/user') && r.request().method() === 'GET', { timeout: USER_FETCH_TIMEOUT }),
    page.reload({ waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT }),
  ])
}

// Every hard navigation reboots this ssr:false SPA from scratch, so the same
// cold-boot race applies each time - wait for /api/user again on every goto
// to the gated page, not just the first.
async function gotoTasks() {
  await Promise.all([
    page.waitForResponse((r) => r.url().endsWith('/api/user') && r.request().method() === 'GET', { timeout: USER_FETCH_TIMEOUT }),
    page.goto(`${BASE}/tasks`, { waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT }),
  ])
}

try {
  // 1) Setup: a board with two columns and a task assigned to (but not
  // created by) the assignee fixture.
  const boardRes = await api('POST', '/tasks/boards', {
    name: `E2E Permission Board ${Date.now()}`,
    columns: [{ name: 'To do' }, { name: 'Done', is_done_column: true }],
  })
  ok('Task board created via API', boardRes.status >= 200 && boardRes.status < 300 && !!boardRes.json?.data?.uuid)
  boardUuid = boardRes.json?.data?.uuid

  const assigneeMeRes = await api('GET', '/user', null, ASSIGNEE_TOKEN)
  const assigneeUuid = assigneeMeRes.json?.data?.uuid

  const taskRes = await api('POST', `/tasks/boards/${boardUuid}/tasks`, {
    title: `E2E Original Title ${Date.now()}`,
    assignee_uuid: assigneeUuid,
  })
  ok('Task created and assigned via API (creator is the Manager, not the assignee)',
    taskRes.status >= 200 && taskRes.status < 300 && !!taskRes.json?.data?.uuid)
  taskUuid = taskRes.json?.data?.uuid

  // 2) Scenario 1 - the assignee (not the creator) edits the task.
  await authAs(ASSIGNEE_TOKEN)
  await gotoTasks()
  await page.waitForTimeout(1000)

  // The pencil icon is an icon-only button whose accessible name comes from
  // its aria-label (pages/tasks/index.vue:88-91) - it has no permission-based
  // v-if, so it's always visible; the boundary is enforced server-side only.
  await page.getByRole('button', { name: EDIT_TASK }).first().click()

  await page.locator('#task-title').first().waitFor()
  await page.locator('#task-title').fill(UPDATED_TITLE)
  await page.screenshot({ path: `${SHOT}/tb-perm-01-assignee-editing.png`, fullPage: true })

  await page.getByRole('button', { name: SAVE }).click()
  const updateResponse = await waitForMatchingResponse((r) => r.url.endsWith(`/tasks/${taskUuid}`) && r.method === 'PUT')
  ok('Assignee update PUT succeeds (2xx, not the old 400)', !!updateResponse && updateResponse.status >= 200 && updateResponse.status < 300)
  if (!updateResponse) console.log('  no matching PUT seen, network log for /tasks:', JSON.stringify(seenResponses.filter(r => r.url.includes('/tasks')), null, 1))

  await page.getByText(UPDATED_TITLE).first().waitFor({ timeout: 10000 })
  ok('Updated title shows on the task card after save', true)
  await page.screenshot({ path: `${SHOT}/tb-perm-02-assignee-saved.png`, fullPage: true })

  // 3) Scenario 2 - Manager deactivates then reactivates the board.
  await authAs(TOKEN)
  await gotoTasks()
  await page.waitForTimeout(1000)

  await page.getByRole('button', { name: MANAGE_BOARD }).click()
  const deactivateButton = page.getByRole('button', { name: DEACTIVATE })
  await deactivateButton.waitFor()

  await deactivateButton.click()
  const deactivateResponse = await waitForMatchingResponse((r) => r.url.endsWith(`/tasks/boards/${boardUuid}`) && r.method === 'PUT')
  ok('Board deactivate PUT succeeds', !!deactivateResponse && deactivateResponse.status >= 200 && deactivateResponse.status < 300)
  if (!deactivateResponse) console.log('  no matching PUT seen, network log for /boards:', JSON.stringify(seenResponses.filter(r => r.url.includes('/boards')), null, 1))
  await page.getByText(INACTIVE_SUFFIX).first().waitFor({ timeout: 10000 })
  ok('"Inactive" badge shows in the manage modal after deactivating', true)
  ok('Button now offers Reactivate', (await page.getByRole('button', { name: REACTIVATE }).count()) > 0)
  await page.screenshot({ path: `${SHOT}/tb-perm-03-board-deactivated.png`, fullPage: true })

  await page.locator('button', { hasText: /^(Close|Luk)$/ }).click().catch(() => {})
  await page.waitForTimeout(500)
  ok('Board switcher shows the board with an inactive marker for the Manager',
    (await page.getByText(INACTIVE_SUFFIX).count()) > 0)
  ok('"New task" is hidden while the selected board is inactive',
    (await page.getByRole('button', { name: NEW_TASK }).count()) === 0)
  await page.screenshot({ path: `${SHOT}/tb-perm-04-manager-sees-inactive.png`, fullPage: true })

  // 4) Scenario 3 - a non-manager (the assignee) no longer sees the board at all.
  await authAs(ASSIGNEE_TOKEN)
  await gotoTasks()
  await page.waitForTimeout(1000)
  const bodyText = await page.locator('body').innerText()
  ok('Deactivated board is not visible to a non-manager', !bodyText.includes(boardRes.json.data.name))
  await page.screenshot({ path: `${SHOT}/tb-perm-05-non-manager-hidden.png`, fullPage: true })

  // Reactivate via API directly (mechanics already proven above through the UI).
  const reactivateRes = await api('PUT', `/tasks/boards/${boardUuid}`, { is_active: true })
  ok('Board reactivated via API for cleanup', reactivateRes.status >= 200 && reactivateRes.status < 300)

  // "Obiyen script tag" is unrelated third-party chat-widget noise. The
  // generic 400 message is GET /api/user/inquiry-consultant-invitations/mine
  // (verified via response inspection) - a pre-existing, unrelated dashboard
  // widget error in this dev environment that fires on every page load
  // regardless of these changes; Chrome's console text for a failed resource
  // load doesn't include the URL, so it's filtered by its fixed message text.
  const realConsoleErrors = consoleErrors.filter((e) =>
    !e.includes('Obiyen script tag') && !e.includes('responded with a status of 400'))
  ok('No console errors during either flow', realConsoleErrors.length === 0)
  if (realConsoleErrors.length) console.log('  console errors:', realConsoleErrors.slice(0, 5))
} catch (e) {
  ok('Unexpected error: ' + e.message, false)
  if (consoleErrors.length) console.log('console errors:\n' + consoleErrors.join('\n'))
  await page.screenshot({ path: `${SHOT}/tb-perm-99-error.png`, fullPage: true }).catch(() => {})
} finally {
  if (taskUuid) {
    const del = await api('DELETE', `/tasks/${taskUuid}`)
    console.log(del.status >= 200 && del.status < 300 ? '↩︎  cleaned up the task' : `⚠️  task cleanup failed (status ${del.status})`)
  }
  if (boardUuid) {
    const del = await api('DELETE', `/tasks/boards/${boardUuid}`)
    console.log(del.status >= 200 && del.status < 300 ? '↩︎  cleaned up the board' : `⚠️  board cleanup failed (status ${del.status})`)
  }
  await browser.close()
}

const passed = results.filter(Boolean).length
console.log(`\n=== ${passed}/${results.length} PASS ===`)
process.exit(passed === results.length ? 0 : 1)
