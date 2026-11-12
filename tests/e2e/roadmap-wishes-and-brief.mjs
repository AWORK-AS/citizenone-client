/**
 * Superadmin -> Roadmap: numbers, "Copy for Claude" and the wishes tab.
 *
 *   - every item shows its fixed number (#218) and can be found by searching "#218",
 *   - "Copy for Claude" puts a brief starting "# Roadmap #<n>: <title>" on the clipboard,
 *   - the Wishes tab shows the count of new wishes and lists them,
 *   - "Put on roadmap" sends a new item title (first line of the wish as default)
 *     or an existing item, and the wish moves out of "New",
 *   - "Decline" sends the status, and a wish can be copied as a brief too.
 *
 * The roadmap list is the real API. The wish endpoints are stubbed with page.route(),
 * so the run writes nothing. The backend side is covered by RoadmapWishTriageTest.
 *
 * Run:  see tests/e2e/README.md
 * Env:  CO_TOKEN (superadmin, required), CO_BASE_URL (default http://localhost:3001)
 */
import { chromium } from 'playwright-core'
import { readFileSync } from 'node:fs'

const TOKEN = process.env.CO_TOKEN
const BASE = process.env.CO_BASE_URL || 'http://localhost:3001'
const SHOTS = new URL('./screenshots/', import.meta.url).pathname

if (!TOKEN) {
    console.error('CO_TOKEN is required')
    process.exit(1)
}

const LANGS = ['dk', 'en', 'no', 'sv'].map((l) => JSON.parse(readFileSync(new URL(`../../lang/${l}.json`, import.meta.url))))
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
function label(path, { exact = true } = {}) {
    const texts = LANGS.map((d) => path.split('.').reduce((o, k) => o?.[k], d)).filter(Boolean)
    const body = texts.map(esc).join('|')
    return new RegExp(exact ? `^\\s*(${body})\\s*$` : `(${body})`)
}

async function waitFor(fn, want, ms = 5000) {
    const end = Date.now() + ms
    let got
    while (Date.now() < end) {
        got = await fn().catch(() => undefined)
        if (got === want) return got
        await new Promise((r) => setTimeout(r, 100))
    }
    return got
}

let failures = 0
function check(ok, text) {
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${text}`)
    if (!ok) failures++
}

// ---- Stubbed wishes ------------------------------------------------------------

const wishes = [
    { uuid: 'e2e-wish-1', number: 9001, reference: 'Ønske #9001', status: 'new', message: 'E2E: Eksport af vagtplan til Excel\nGerne pr. uge.',
        created_at: '2026-11-10T09:00:00Z', user: { name: 'Helle Test' }, company: { name: 'E2E Fonden' }, images: [], roadmap_item: null },
    { uuid: 'e2e-wish-2', number: 9002, reference: 'Ønske #9002', status: 'new', message: 'E2E: En app til køleskabet',
        created_at: '2026-11-10T10:00:00Z', user: { name: 'Bo Test' }, company: { name: 'E2E Hjem' }, images: [], roadmap_item: null },
]
const calls = { toRoadmap: [], status: [] }
const counts = () => wishes.reduce((acc, wish) => ({ ...acc, [wish.status]: (acc[wish.status] ?? 0) + 1 }), {})
const json = (route, body, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })

// ---- Browser ---------------------------------------------------------------------

const browser = await chromium.launch({ headless: true, channel: 'chrome' })
const context = await browser.newContext({ viewport: { width: 1400, height: 900 } })
await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE })
const page = await context.newPage()

const serverErrors = []
const consoleErrors = []
page.on('response', (r) => { if (r.status() >= 500) serverErrors.push(`${r.status()} ${r.request().method()} ${r.url()}`) })
page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`))

await page.route(/\/superadmin\/wishes(\?status=(\w+))?$/, (route) => {
    const status = new URL(route.request().url()).searchParams.get('status')
    return json(route, { data: wishes.filter((wish) => !status || wish.status === status), counts: counts() })
})
await page.route(/\/superadmin\/wishes\/[^/]+\/roadmap$/, (route) => {
    const uuid = route.request().url().split('/').slice(-2)[0]
    const body = JSON.parse(route.request().postData() || '{}')
    calls.toRoadmap.push({ uuid, ...body })
    const wish = wishes.find((other) => other.uuid === uuid)
    wish.status = 'on_roadmap'
    wish.roadmap_item = { uuid: body.roadmap_item_uuid ?? 'new', number: 999, title: body.title ?? 'existing', status: 'planned' }
    return json(route, { data: wish })
})
await page.route(/\/superadmin\/wishes\/[^/]+\/status$/, (route) => {
    const uuid = route.request().url().split('/').slice(-2)[0]
    const body = JSON.parse(route.request().postData() || '{}')
    calls.status.push({ uuid, ...body })
    wishes.find((other) => other.uuid === uuid).status = body.status
    return json(route, { data: wishes.find((other) => other.uuid === uuid) })
})

await page.goto(BASE)
await page.evaluate((token) => localStorage.setItem('_token', token), TOKEN)

// ---- Numbers and the brief ---------------------------------------------------------

const roadmapResponse = page.waitForResponse((r) => /\/superadmin\/roadmap-items$/.test(r.url()))
await page.goto(`${BASE}/superadmin/roadmap`)
const items = (await (await roadmapResponse).json())?.data ?? []
await page.waitForLoadState('networkidle')
const planned = items.find((item) => item.status === 'in_progress') ?? items[0]
check(!!planned?.number, `the API gives items a number (${planned?.number})`)

if (planned) {
    if (planned.status !== 'in_progress') {
        await page.getByRole('button', { name: label(`comingFunctions.status.${planned.status}`, { exact: false }) }).first().click()
    }
    const row = page.locator('li').filter({ hasText: planned.title }).first()
    check(await row.getByText(`#${planned.number}`, { exact: true }).isVisible().catch(() => false), 'the list shows "#<number>"')

    await page.getByPlaceholder(label('superadmin.roadmap.filters.search')).fill(`#${planned.number}`)
    check(await waitFor(() => page.locator('ul > li[draggable]').count(), 1) === 1, 'searching "#<number>" finds exactly that item')

    await row.getByRole('button', { name: label('superadmin.roadmap.copyBrief', { exact: false }) }).click()
    const clip = await waitFor(async () => (await page.evaluate(() => navigator.clipboard.readText())).split('\n')[0], `# Roadmap #${planned.number}: ${planned.title}`)
    check(clip === `# Roadmap #${planned.number}: ${planned.title}`, `"Copy for Claude" copies the brief (first line: ${clip})`)
    await page.getByPlaceholder(label('superadmin.roadmap.filters.search')).fill('')
}

// ---- Wishes tab ---------------------------------------------------------------------

const tab = page.getByRole('button', { name: label('superadmin.roadmap.wishes.tab', { exact: false }) })
check(/2\s*$/.test((await tab.innerText()).trim()), 'the Wishes tab shows 2 new')
await tab.click()

const first = page.locator('li').filter({ hasText: 'E2E: Eksport af vagtplan' })
check(await first.waitFor({ timeout: 8000 }).then(() => true, () => false), 'new wishes are listed')
check(await first.getByText('Ønske #9001').isVisible().catch(() => false), 'a wish shows its reference')
await page.screenshot({ path: `${SHOTS}roadmap-wishes.png` })

await first.getByRole('button', { name: label('superadmin.roadmap.copyBrief', { exact: false }) }).click()
const wishClip = await waitFor(async () => (await page.evaluate(() => navigator.clipboard.readText())).split('\n')[0], '# Ønske #9001: ønske fra E2E Fonden')
check(wishClip === '# Ønske #9001: ønske fra E2E Fonden', `a wish can be copied as a brief (first line: ${wishClip})`)

await first.getByRole('button', { name: label('superadmin.roadmap.wishes.toRoadmap', { exact: false }) }).click()
const titleInput = page.locator('#wish-roadmap-title')
check(await titleInput.inputValue() === 'E2E: Eksport af vagtplan til Excel', 'the title starts as the first line of the wish')
await titleInput.fill('E2E: Excel-eksport af vagtplan')
await page.screenshot({ path: `${SHOTS}roadmap-wish-to-roadmap.png` })
await page.getByRole('dialog').getByRole('button', { name: label('superadmin.roadmap.wishes.toRoadmap', { exact: false }) }).click()
check(await waitFor(async () => calls.toRoadmap.length, 1) === 1 && calls.toRoadmap[0].title === 'E2E: Excel-eksport af vagtplan',
    '"Put on roadmap" sends the new title')
check(await waitFor(() => first.count(), 0) === 0, 'the wish leaves "New"')

const second = page.locator('li').filter({ hasText: 'E2E: En app til køleskabet' })
await second.getByRole('button', { name: label('superadmin.roadmap.wishes.decline', { exact: false }) }).click()
check(await waitFor(async () => calls.status.length, 1) === 1 && calls.status[0].status === 'declined', '"Decline" sends the status')
check(await waitFor(() => second.count(), 0) === 0, 'the declined wish leaves "New"')

await page.getByRole('button', { name: label('superadmin.roadmap.wishes.status.on_roadmap', { exact: false }) }).click()
check(await page.locator('li').filter({ hasText: '#999 E2E: Excel-eksport af vagtplan' }).waitFor({ timeout: 5000 }).then(() => true, () => false),
    '"On roadmap" shows the wish with its roadmap item')

// ---- Result -------------------------------------------------------------------------

check(serverErrors.length === 0, `no 5xx responses${serverErrors.length ? `: ${serverErrors.join(', ')}` : ''}`)
check(consoleErrors.length === 0, `no page errors${consoleErrors.length ? `: ${consoleErrors.slice(0, 3).join(' | ')}` : ''}`)

await browser.close()
console.log(failures ? `\n${failures} check(s) failed` : '\nAll checks passed')
process.exit(failures ? 1 : 0)
