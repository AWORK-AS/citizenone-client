/**
 * Browser E2E: the "I'm working on this" / "Stop" / "Take over" buttons are hidden on
 * released roadmap items (they are done), and still shown on in-progress and planned ones.
 *
 * Read-only: it only opens the tabs and compares the rows against the roadmap items the
 * page itself loaded from the API. Nothing is saved.
 *
 * Run:  see tests/e2e/README.md
 * Env:  CO_TOKEN (superadmin with manage_content, required),
 *       CO_BASE_URL (default http://localhost:3000),
 *       CO_SHOT_DIR (default ./screenshots/)
 */
import { chromium } from 'playwright-core'
import { fileURLToPath } from 'url'
import path from 'path'

const TOKEN = process.env.CO_TOKEN
const BASE = process.env.CO_BASE_URL || 'http://localhost:3000'
const SHOT = process.env.CO_SHOT_DIR || path.join(path.dirname(fileURLToPath(import.meta.url)), 'screenshots')

if (!TOKEN) {
    console.error('CO_TOKEN is required. See tests/e2e/README.md.')
    process.exit(2)
}

const results = []
const check = (cond, name) => { results.push(cond); console.log(`${cond ? '✅' : '❌'} ${name}`) }

// The three working buttons, in every locale the page ships.
const WORKING_BUTTON = /I'm working on this|Jeg arbejder på den|Jeg jobber med den|Jag arbetar med den|^(Stop|Stopp|Sluta)$|Take over|Overtag|Overta|Ta över/
const TAB = {
    in_progress: /^(In progress|I gang|Pågår|Pågående)/,
    planned: /^(Planned|Planlagt|Planlagt|Planerad)/,
    released: /^(Released|Udgivet|Lansert|Lanserad)/,
}

const browser = await chromium.launch({ headless: true, channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
const pageErrors = []
page.on('pageerror', (e) => pageErrors.push(e.message))

await page.goto(BASE)
await page.evaluate((token) => localStorage.setItem('_token', token), TOKEN)

const itemsResponse = page.waitForResponse((r) => /\/superadmin\/roadmap-items$/.test(r.url()))
await page.goto(`${BASE}/superadmin/roadmap`)
const items = (await (await itemsResponse).json())?.data ?? []
await page.waitForLoadState('networkidle')

const byStatus = (status) => items.filter((item) => item.status === status && item.number)
check(byStatus('released').length > 0, `there are released items to look at (${byStatus('released').length})`)
check(byStatus('in_progress').length + byStatus('planned').length > 0, 'there are open items to compare with')

// The row of an item, found by its number badge ("#101").
const rowOf = (item) => page.locator('li').filter({ has: page.locator('span.font-mono', { hasText: new RegExp(`^#${item.number}$`) }) }).first()

for (const status of ['released', 'in_progress', 'planned']) {
    const expected = byStatus(status)
    if (!expected.length) continue
    await page.getByRole('button', { name: TAB[status] }).first().click()
    await rowOf(expected[0]).waitFor()

    let withButton = 0
    for (const item of expected) {
        const buttons = await rowOf(item).getByRole('button', { name: WORKING_BUTTON }).count()
        if (buttons > 0) withButton++
    }

    if (status === 'released') {
        check(withButton === 0, `Released: no working button on any of the ${expected.length} rows`)
        await page.screenshot({ path: path.join(SHOT, 'roadmap-released-no-working.png') })
    } else {
        check(withButton === expected.length, `${status}: every row (${expected.length}) still has a working button (${withButton})`)
    }
}

check(pageErrors.length === 0, `no page errors${pageErrors.length ? ': ' + pageErrors.join(' | ') : ''}`)

await browser.close()
console.log(results.every(Boolean) ? '\nAll checks passed' : '\nSome checks FAILED')
process.exit(results.every(Boolean) ? 0 : 1)
