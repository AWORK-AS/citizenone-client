/**
 * Browser E2E: on Superadmin -> Roadmap -> Wishes -> On roadmap, each wish's badge shows
 * the status of the roadmap item it belongs to, and clicking it opens that item on its
 * own tab (In progress / Planned / Released), scrolled to and highlighted.
 *
 * Read-only: nothing is saved. Expected values come from the wishes API, not the page.
 *
 * Run:  see tests/e2e/README.md
 * Env:  CO_TOKEN (superadmin, required), CO_BASE_URL (default http://localhost:3000),
 *       CO_API_URL (default http://127.0.0.1:8000), CO_SHOT_DIR (default ./screenshots/)
 */
import { chromium } from 'playwright-core'
import { fileURLToPath } from 'url'
import path from 'path'

const TOKEN = process.env.CO_TOKEN
const BASE = process.env.CO_BASE_URL || 'http://localhost:3000'
const API = process.env.CO_API_URL || 'http://127.0.0.1:8000'
const SHOT = process.env.CO_SHOT_DIR || path.join(path.dirname(fileURLToPath(import.meta.url)), 'screenshots')

if (!TOKEN) {
    console.error('CO_TOKEN is required. See tests/e2e/README.md.')
    process.exit(2)
}

const results = []
const check = (cond, name) => { results.push(!!cond); console.log(`${cond ? '✅' : '❌'} ${name}`) }

// Status labels and tab names in every locale the page ships.
const STATUS_LABEL = {
    planned: ['Planned', 'Planlagt', 'Planerad'],
    in_progress: ['In progress', 'I gang', 'Pågår'],
    released: ['Released', 'Udgivet', 'Lansert', 'Lanserad'],
}
const WISHES_TAB = /^(Wishes|Ønsker|Önskemål)/
const ON_ROADMAP_TAB = /^(On roadmap|På roadmap|På veikartet|På färdplanen)\s*\d+$/

const res = await fetch(`${API}/api/superadmin/wishes?status=on_roadmap`, { headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json' } })
const linked = ((await res.json()).data ?? []).filter((wish) => wish.roadmap_item)
if (!linked.length) {
    console.error('Needs at least one wish on the roadmap.')
    process.exit(2)
}

const browser = await chromium.launch({ headless: true, channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
const pageErrors = []
page.on('pageerror', (e) => pageErrors.push(e.message))

await page.goto(BASE)
await page.evaluate((token) => localStorage.setItem('_token', token), TOKEN)
await page.goto(`${BASE}/superadmin/roadmap`, { waitUntil: 'networkidle' })

const badgeOf = (wish) => page.getByRole('button', { name: new RegExp(`#${wish.roadmap_item.number}\\b`) }).first()

try {
    await page.getByRole('button', { name: WISHES_TAB }).first().click()
    await page.getByRole('button', { name: ON_ROADMAP_TAB }).first().click()
    await badgeOf(linked[0]).waitFor()

    // Every badge names its item's current status.
    let right = 0
    for (const wish of linked) {
        const text = await badgeOf(wish).innerText()
        if (STATUS_LABEL[wish.roadmap_item.status].some((label) => text.includes(label))) right++
    }
    check(right === linked.length, `every badge shows its item's status (${right}/${linked.length})`)
    await page.screenshot({ path: path.join(SHOT, 'wish-badge-status.png') })

    // One click per item status that is on the page, where there is one.
    const seen = new Set()
    for (const wish of linked) {
        const item = wish.roadmap_item
        if (seen.has(item.status)) continue
        seen.add(item.status)

        if (!(await page.getByRole('button', { name: ON_ROADMAP_TAB }).count())) {
            await page.getByRole('button', { name: WISHES_TAB }).first().click()
            await page.getByRole('button', { name: ON_ROADMAP_TAB }).first().click()
        }
        await badgeOf(wish).click()

        const row = page.locator(`#roadmap-item-${item.uuid}`)
        await row.waitFor()
        const tabActive = await page.getByRole('button', { name: new RegExp(`^(${STATUS_LABEL[item.status].join('|')})\\s*\\d+$`) }).first()
            .evaluate((el) => el.className.includes('bg-tertiary'))
        check(tabActive, `#${item.number} (${item.status}): the ${item.status} tab opens`)
        check(await row.isVisible() && (await row.getAttribute('class')).includes('ring-2'), `#${item.number}: the item is on screen and highlighted`)
        await page.screenshot({ path: path.join(SHOT, `wish-badge-open-${item.status}.png`) })
        await page.waitForTimeout(2800)
        check(!(await row.getAttribute('class')).includes('ring-2'), `#${item.number}: the highlight goes away after a moment`)
    }
} catch (e) {
    check(false, 'ERROR ' + e.message.split('\n')[0])
    await page.screenshot({ path: path.join(SHOT, 'wish-badge-error.png') })
}

check(pageErrors.length === 0, `no page errors${pageErrors.length ? ': ' + pageErrors.join(' | ') : ''}`)

await browser.close()
console.log(results.every(Boolean) ? '\nAll checks passed' : '\nSome checks FAILED')
process.exit(results.every(Boolean) ? 0 : 1)
