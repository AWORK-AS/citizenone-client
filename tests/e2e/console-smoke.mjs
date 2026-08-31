/**
 * Console smoke test: walk the app and fail on anything the browser throws.
 *
 * Three defects reached dev in a row that were plainly visible on page load
 * with the console open - a composable calling useI18n() outside setup, two
 * templates using a helper they never imported, and a debug bypass forcing a
 * menu entry on for every company. None broke a build; none had a test that
 * would have noticed. This is that test.
 *
 * It works in two passes. First it clicks the sidebar to learn where this
 * company's entries lead, so the list follows the company rather than going
 * stale in the file. Then it loads each of those pages afresh, plus the
 * settings pages, which have no sidebar entry of their own.
 *
 * The second pass has to be a real page load. This app is an SPA, and clicking
 * from one page to another does not surface a render-time throw to the browser
 * as an uncaught error - both of the defects above stayed silent under a click
 * and appeared the moment the page was loaded directly. A version of this test
 * that only clicked passed against code that was visibly broken.
 *
 * Any uncaught exception fails the run. So does a console error, unless it is
 * in IGNORED below, and so does a 5xx.
 *
 * Read-only: it navigates and nothing else.
 *
 * Run:  see tests/e2e/README.md
 * Env:  CO_TOKEN (required), CO_BASE_URL (default http://localhost:3001)
 */
import { chromium } from 'playwright-core'

const TOKEN = process.env.CO_TOKEN
const BASE = process.env.CO_BASE_URL || 'http://localhost:3001'
const USER_FETCH_TIMEOUT = 60000
const SETTLE_MS = 3500

/**
 * Noise the app cannot help, each with the reason it is here. Keep this list
 * short and argued: every entry is a class of browser error nobody will look at
 * again.
 */
const IGNORED = [
    // The realtime connection retries by design when the local Pusher/Reverb
    // container is not running, which is most of the time on a dev machine.
    /pusher|reverb|websocket|ws:\/\/|wss:\/\//i,
    // Vite's own dev-server chatter, not the app's.
    /\[vite\]|\bhmr\b/i,
    // A dev build ships no favicon and no source maps.
    /favicon|source ?map/i,
]

// The API allows 120 requests a minute per user, and one page spends a dozen or
// more, so walking the app quickly rate-limits itself and the 429s look like
// defects. Count what we spend and wait when the budget runs low.
const BUDGET_PER_MINUTE = 90

// Reached from the profile menu rather than the sidebar, and between them they
// carry most of what a company configures.
const SETTINGS_PAGES = [
    '/settings/profile',
    '/settings/company',
    '/settings/roles',
    '/settings/absences',
    '/settings/departments',
]

if (!TOKEN) {
    console.error('CO_TOKEN is required. See tests/e2e/README.md')
    process.exit(1)
}

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } })

let problems = []
const apiCalls = []

page.on('pageerror', (error) => {
    problems.push({ kind: 'uncaught', text: String(error.message || error).slice(0, 200) })
})
page.on('console', (message) => {
    if (message.type() === 'error') problems.push({ kind: 'console', text: message.text().slice(0, 200) })
})
page.on('response', (response) => {
    const url = response.url()
    if (url.includes('/api/')) apiCalls.push(Date.now())
    if (response.status() >= 500) {
        problems.push({ kind: 'server', text: `${response.status()} ${url.replace(BASE, '').slice(0, 140)}` })
    }
})

const realProblems = () => problems.filter((p) => !IGNORED.some((pattern) => pattern.test(p.text)))
const wasRateLimited = () => problems.some((p) => /429|too many requests|for mange foresp/i.test(p.text))

async function payForBudget() {
    for (;;) {
        const cutoff = Date.now() - 60000
        while (apiCalls.length && apiCalls[0] < cutoff) apiCalls.shift()
        if (apiCalls.length < BUDGET_PER_MINUTE) return
        const waitMs = Math.max(1000, apiCalls[0] + 60000 - Date.now())
        console.log(`         (waiting ${Math.ceil(waitMs / 1000)}s for the rate limit)`)
        await page.waitForTimeout(waitMs)
    }
}

/** Runs `open`, then reports what the browser complained about while it ran. */
async function watch(open) {
    await payForBudget()
    problems = []
    try {
        await open()
    } catch (error) {
        return [{ kind: 'navigation', text: String(error.message || error).split('\n')[0].slice(0, 160) }]
    }
    await page.waitForTimeout(SETTLE_MS)
    if (wasRateLimited()) {
        console.log('         (rate limited, giving the window back and taking the page again)')
        await page.waitForTimeout(60000)
        apiCalls.length = 0
        return watch(open)
    }
    return realProblems()
}

let failures = 0
function report(label, found) {
    if (found.length === 0) {
        console.log(`  ok   ${label}`)
        return
    }
    failures++
    console.error(`  FAIL ${label}`)
    for (const problem of [...new Map(found.map((p) => [p.text, p])).values()].slice(0, 5)) {
        console.error(`         [${problem.kind}] ${problem.text}`)
    }
}

const sidebarItems = () => page.locator('nav [class*="sidebar-item"]:visible')

try {
    await page.goto(`${BASE}/overview`, { waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT })
    await page.evaluate((token) => localStorage.setItem('_token', token), TOKEN)
    await Promise.all([
        page.waitForResponse((r) => r.url().endsWith('/api/user') && r.request().method() === 'GET', { timeout: USER_FETCH_TIMEOUT }),
        page.reload({ waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT }),
    ])
    await page.waitForTimeout(SETTLE_MS)

    // Pass one: where does this company's sidebar lead?
    const labels = (await sidebarItems().allInnerTexts()).map((l) => l.trim()).filter(Boolean)
    const discovered = new Map()
    for (const label of labels) {
        const entry = sidebarItems().filter({ hasText: label }).first()
        if (await entry.count() === 0) continue
        await entry.click()
        await page.waitForTimeout(900)
        const pathname = new URL(page.url()).pathname
        // A custom link opens in another tab and leaves this page where it was,
        // so it never contributes a route of its own.
        if (!discovered.has(pathname)) discovered.set(pathname, label)
    }
    const targets = [...discovered.keys(), ...SETTINGS_PAGES]
    console.log(`the sidebar leads to ${discovered.size} pages; walking ${targets.length}\n`)

    // Pass two: load each one for real and see what the browser says.
    for (const target of targets) {
        const found = await watch(() => Promise.all([
            page.waitForResponse((r) => r.url().endsWith('/api/user') && r.request().method() === 'GET', { timeout: USER_FETCH_TIMEOUT }),
            page.goto(`${BASE}${target}`, { waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT }),
        ]))
        const label = discovered.get(target)
        report(label ? `${target.padEnd(24)} ${label}` : target, found)
    }
} finally {
    await browser.close()
}

console.log(failures === 0 ? '\nPASS' : `\nFAIL (${failures} page${failures === 1 ? '' : 's'})`)
process.exit(failures === 0 ? 0 : 1)
