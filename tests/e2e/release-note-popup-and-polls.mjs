/**
 * "What's new" popups come from Release notes, and polls are easy to find.
 *
 * Popup (on /schedules):
 *   - the layout asks for the popup of the current page (path only, no query),
 *   - the popup shows the note's title and items,
 *   - "Got it" closes it and tells the API, and it does not come back on reload,
 *   - a page without a note shows no popup.
 *
 * Polls:
 *   - the "?" menu has "Coming features and polls" with the unvoted count,
 *   - it opens /coming-functions with the polls section in view,
 *   - a thumbs up votes, the count goes up, and the menu badge goes away,
 *   - a second click takes the vote back and the badge returns.
 *
 * The popup and poll API calls are stubbed with page.route(), so the run writes
 * nothing and does not need the release-note approver's account. The backend
 * side of these endpoints is covered by ReleaseNotePopupTest and
 * UnvotedPollCountTest. Everything else on the page is the real app.
 *
 * Run:  see tests/e2e/README.md
 * Env:  CO_TOKEN (required), CO_BASE_URL (default http://localhost:3001)
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

// The UI follows the token user's language, so every label is matched in all four.
const LANGS = ['dk', 'en', 'no', 'sv'].map((l) => JSON.parse(readFileSync(new URL(`../../lang/${l}.json`, import.meta.url))))
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
function label(path, { exact = true } = {}) {
    const texts = LANGS.map((d) => path.split('.').reduce((o, k) => o?.[k], d)).filter(Boolean)
    const body = texts.map(esc).join('|')
    return new RegExp(exact ? `^\\s*(${body})\\s*$` : `(${body})`)
}

// Polls until fn() returns the wanted value, so a check never reads before Vue re-renders.
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

// ---- Stubbed API state -------------------------------------------------------

const NOTE = {
    uuid: 'e2e-popup-note',
    title: 'E2E: Vagtplanen er blevet lettere at overskue',
    items: ['E2E punkt et', 'E2E punkt to'],
    content: null,
}
const popupState = { dismissed: false, requestedRoutes: [], dismissCalls: 0 }

const ITEMS = [
    { uuid: 'e2e-item-a', title: 'E2E: Eksportér månedlige planer', description: 'Se timer pr. måned', sender: 'Heidi', region: { name: 'Sjælland' } },
    { uuid: 'e2e-item-b', title: 'E2E: Timer ved vagtslut', description: 'Bekræft arbejdstid', sender: 'Helle', region: { name: 'Hovedstaden' } },
]
const voteState = { votedOn: null, counts: { 'e2e-item-a': 3, 'e2e-item-b': 1 }, posts: 0, deletes: 0 }

function pollsBody() {
    return {
        data: [{
            uuid: 'e2e-poll',
            title: 'E2E: Hvad skal vi bygge?',
            items: ITEMS.map((item) => ({
                ...item,
                created_at: '2026-11-01T10:00:00Z',
                vote_count: voteState.counts[item.uuid],
                user_voted: voteState.votedOn === item.uuid,
            })),
        }],
    }
}

const json = (route, body, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })

// ---- Browser -----------------------------------------------------------------

const browser = await chromium.launch({ headless: true, channel: 'chrome' })
const context = await browser.newContext({ viewport: { width: 1400, height: 900 } })
const page = await context.newPage()

const consoleErrors = []
const serverErrors = []
const clientErrors = []
page.on('response', (r) => { if (r.status() >= 400 && r.status() < 500) clientErrors.push(`${r.status()} ${r.request().method()} ${r.url()}`) })
page.on('response', (r) => { if (r.status() >= 500) serverErrors.push(`${r.status()} ${r.request().method()} ${r.url()}`) })
page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`))
page.on('console', (m) => {
    if (m.type() === 'error' && !/pusher|reverb|websocket|\[vite\]|favicon|source ?map|status of [45]\d\d/i.test(m.text())) {
        consoleErrors.push(m.text())
    }
})

await page.route(/\/user\/release-notes\/popup\?/, (route) => {
    const route_ = new URL(route.request().url()).searchParams.get('route')
    popupState.requestedRoutes.push(route_)
    const show = route_ === '/schedules' && !popupState.dismissed
    return json(route, { data: show ? NOTE : null })
})
await page.route(/\/user\/release-notes\/[^/]+\/popup\/dismiss$/, (route) => {
    popupState.dismissCalls++
    popupState.dismissed = true
    return json(route, { message: 'ok' })
})
await page.route(/\/user\/polls\/unvoted-count$/, (route) => json(route, { count: voteState.votedOn ? 0 : 1 }))
await page.route(/\/user\/polls(\?.*)?$/, (route) => json(route, pollsBody()))
await page.route(/\/user\/poll-votes(\/[^/?]+)?$/, (route) => {
    const req = route.request()
    if (req.method() === 'POST') {
        const uuid = JSON.parse(req.postData() || '{}').pollitem_uuid
        voteState.posts++
        voteState.votedOn = uuid
        voteState.counts[uuid]++
        return json(route, { data: { uuid: 'e2e-vote' } }, 201)
    }
    if (req.method() === 'DELETE') {
        const uuid = req.url().split('/').pop()
        voteState.deletes++
        voteState.votedOn = null
        voteState.counts[uuid]--
        return json(route, { message: 'ok' })
    }
    return route.continue()
})

await page.goto(BASE)
await page.evaluate((token) => localStorage.setItem('_token', token), TOKEN)

// ---- Popup -------------------------------------------------------------------

await page.goto(`${BASE}/schedules?e2e=1`)
await page.waitForLoadState('networkidle')

const popup = page.locator('aside[role="status"]').filter({ hasText: NOTE.title })
check(await popup.waitFor({ timeout: 10000 }).then(() => true, () => false), 'popup shows on /schedules')
check(popupState.requestedRoutes.includes('/schedules'), 'popup asked for "/schedules" (path only, no query)')
check(await popup.getByText(NOTE.items[0]).isVisible().catch(() => false)
    && await popup.getByText(NOTE.items[1]).isVisible().catch(() => false), 'popup lists the note items')
check(await popup.getByRole('button', { name: label('helpGuide.askMilo') }).isVisible().catch(() => false), 'popup offers Milo')
await page.screenshot({ path: `${SHOTS}release-note-popup.png` })

await popup.getByRole('button', { name: label('releaseNotePopup.dismiss') }).click()
await page.waitForTimeout(400)
check(!(await popup.isVisible().catch(() => false)), '"Got it" closes the popup')
check(popupState.dismissCalls === 1, 'closing tells the API once')

await page.reload()
await page.waitForLoadState('networkidle')
check(!(await popup.isVisible().catch(() => false)), 'closed popup does not come back on reload')

await page.goto(`${BASE}/calendar`)
await page.waitForLoadState('networkidle')
check(popupState.requestedRoutes.includes('/calendar'), 'another page asks for its own popup')
check(!(await page.locator('aside[role="status"]').filter({ hasText: 'E2E:' }).isVisible().catch(() => false)), 'a page without a note shows no popup')

// ---- Polls -------------------------------------------------------------------

async function openHelpMenu() {
    await page.getByRole('button', { name: label('navbar.helpAndNews') }).click()
    return page.getByRole('menuitem').filter({ hasText: label('navbar.comingFunctionsAndPolls', { exact: false }) })
}

let entry = await openHelpMenu()
check(await entry.isVisible().catch(() => false), '"?" menu has "Coming features and polls"')
const badgeOf = async (item) => ((await item.innerText()) ?? '').replace(label('navbar.comingFunctionsAndPolls', { exact: false }), '').trim()
const firstBadge = await waitFor(() => badgeOf(entry), '1')
check(firstBadge === '1', `the entry shows 1 unvoted poll (shows "${firstBadge}")`)

await entry.click()
await page.waitForURL(/\/coming-functions#polls$/)
await page.waitForLoadState('networkidle')
const section = page.locator('section#polls')
check(await section.waitFor({ timeout: 10000 }).then(() => true, () => false), 'opens Coming functions with the polls section')
check(await section.getByText(label('comingFunctions.polls.title')).isVisible().catch(() => false), 'polls section has its title')

const card = section.locator('div.border-l-8').filter({ hasText: ITEMS[0].title })
check(await card.waitFor({ timeout: 10000 }).then(() => true, () => false), 'poll items are listed')
await page.screenshot({ path: `${SHOTS}coming-functions-polls.png` })

await card.locator('.cursor-pointer').click()
await page.waitForLoadState('networkidle')
check(voteState.posts === 1 && voteState.votedOn === ITEMS[0].uuid, 'thumbs up sends the vote')
const countOf = async () => (await card.locator('.cursor-pointer').locator('xpath=..').locator('p').first().textContent())?.trim()
const afterVote = await waitFor(countOf, '4')
check(afterVote === '4', `vote count goes up to 4 (shows ${afterVote})`)

entry = await openHelpMenu()
const goneBadge = await waitFor(() => badgeOf(entry), '')
check(goneBadge === '', `the menu badge goes away after voting (shows "${goneBadge}")`)
await page.keyboard.press('Escape')

await card.locator('.cursor-pointer').click()
await page.waitForLoadState('networkidle')
check(voteState.deletes === 1 && voteState.votedOn === null, 'second click takes the vote back')
const afterUnvote = await waitFor(countOf, '3')
check(afterUnvote === '3', `vote count goes back to 3 (shows ${afterUnvote})`)

entry = await openHelpMenu()
const backBadge = await waitFor(() => badgeOf(entry), '1')
check(backBadge === '1', `the menu badge comes back (shows "${backBadge}")`)
await page.keyboard.press('Escape')

// ---- Result ------------------------------------------------------------------

check(serverErrors.length === 0, `no 5xx responses${serverErrors.length ? `: ${serverErrors.join(', ')}` : ''}`)
check(consoleErrors.length === 0, `no console errors${consoleErrors.length ? `: ${consoleErrors.slice(0, 3).join(' | ')}` : ''}`)

if (clientErrors.length) console.log(`info  4xx from the app (not checked): ${[...new Set(clientErrors)].join(', ')}`)
await browser.close()
console.log(failures ? `\n${failures} check(s) failed` : '\nAll checks passed')
process.exit(failures ? 1 : 0)
