/**
 * CitizenOne Online Meetings, end to end in two browsers with a fake camera:
 *
 *   1. the host starts a meeting now and goes in;
 *   2. a guest opens their personal link, waits in the lobby, is let in,
 *      and both see two people in the meeting;
 *   3. a chat message from the host reaches the guest;
 *   4. the host joining again from a second window closes the first window's
 *      connection with a message that says so (not a technical error).
 *
 * Needs a LiveKit server the API is configured for (locally:
 * `docker run --rm -p 7880-7882:7880-7882/udp -e LIVEKIT_KEYS="devkey: <32+ chars>"
 * livekit/livekit-server:v1.8 --dev --bind 0.0.0.0 --node-ip 127.0.0.1`) and a
 * company with the meetings app.
 *
 * Run:  cd tests/e2e && CO_TOKEN='<host token>' npm run test:meetings-join
 * Env:  CO_TOKEN (required), CO_BASE_URL (default http://localhost:3001),
 *       CO_API_URL (default http://localhost:8001)
 */
import { chromium } from 'playwright-core'

const TOKEN = process.env.CO_TOKEN
const BASE = process.env.CO_BASE_URL || 'http://localhost:3001'
const API = `${process.env.CO_API_URL || 'http://localhost:8001'}/api`

if (!TOKEN) {
    console.error('CO_TOKEN is required (see README.md)')
    process.exit(2)
}

const failures = []
const check = (ok, label) => {
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}`)
    if (!ok) failures.push(label)
}

async function api(path, method = 'GET', body) {
    const response = await fetch(`${API}${path}`, {
        method,
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
        body: body ? JSON.stringify(body) : undefined,
    })
    if (!response.ok) throw new Error(`${method} ${path}: ${response.status} ${await response.text()}`)
    return response.status === 204 ? null : response.json()
}

const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream', '--autoplay-policy=no-user-gesture-required'],
})

async function newPage({ signedIn }) {
    const context = await browser.newContext({ permissions: ['camera', 'microphone'] })
    if (signedIn) await context.addInitScript((token) => localStorage.setItem('_token', token), TOKEN)
    const page = await context.newPage()
    page.errors = []
    page.on('pageerror', (error) => page.errors.push(error.message))
    return page
}

const bodyText = (page) => page.locator('body').innerText()
const waitForText = (page, text, timeout = 20000) =>
    page.waitForFunction((t) => document.body.innerText.includes(t), text, { timeout }).then(() => true).catch(() => false)

try {
    // A meeting now, with one external guest who has a personal link.
    const created = await api('/user/meetings', 'POST', {
        title: 'E2E møde',
        starts_at: new Date(Date.now() - 60_000).toISOString(),
        ends_at: new Date(Date.now() + 3_600_000).toISOString(),
        waiting_room: true,
        send_invites: false,
        participants: [{ type: 'guest', name: 'E2E Gæst', email: null }],
    })
    const meeting = created.data
    const guest = meeting.participants.find((p) => p.role === 'guest')
    const guestToken = guest.join_url.split('/meet/')[1]

    // 1. Host goes in.
    const host = await newPage({ signedIn: true })
    await host.goto(`${BASE}/meetings/${meeting.uuid}?join=1`, { waitUntil: 'networkidle', timeout: 90_000 })
    await host.getByRole('button', { name: /^Deltag$/ }).click()
    check(await waitForText(host, 'Forlad'), 'host is in the meeting')
    check(!(await bodyText(host)).includes('Kunne ikke forbinde'), 'host connected without an error')

    // 2. Guest waits, is let in, and both see two people.
    const visitor = await newPage({ signedIn: false })
    await visitor.goto(`${BASE}/meet/${guestToken}`, { waitUntil: 'networkidle', timeout: 90_000 })
    check((await bodyText(visitor)).includes('har inviteret dig'), 'guest sees who invites')
    check(!(await bodyText(visitor)).includes('E2E møde'), 'guest does not see the meeting title')
    await visitor.getByRole('button', { name: /^Deltag$/ }).click()
    check(await waitForText(visitor, 'Du venter på at blive lukket ind'), 'guest waits in the lobby')

    await api(`/user/meetings/${meeting.uuid}/participants/${guest.uuid}/admit`, 'POST')
    check(await waitForText(visitor, 'Forlad', 30_000), 'guest is let in')
    check(await waitForText(host, '2 i mødet'), 'host sees two people')
    check(await waitForText(visitor, '2 i mødet'), 'guest sees two people')

    // 3. Chat reaches the other side.
    await host.getByTitle('Chat', { exact: true }).click()
    await host.getByPlaceholder('Skriv en besked', { exact: true }).fill('Hej fra værten')
    await host.getByTitle('Send', { exact: true }).click()
    // The guest's chat is closed: the message waits as unread until opened.
    const guestChat = visitor.getByTitle('Chat', { exact: true })
    check(await guestChat.locator('span').filter({ hasText: '1' }).waitFor({ timeout: 15000 }).then(() => true).catch(() => false), 'guest sees one unread message')
    await guestChat.click()
    check(await waitForText(visitor, 'Hej fra værten'), 'chat message arrives')

    // 4. The host again from a second window replaces the first connection.
    const hostAgain = await newPage({ signedIn: true })
    await hostAgain.goto(`${BASE}/meetings/${meeting.uuid}?join=1`, { waitUntil: 'networkidle', timeout: 90_000 })
    await hostAgain.getByRole('button', { name: /^Deltag$/ }).click()
    check(await waitForText(hostAgain, 'Forlad'), 'host joins from a second window')
    check(await waitForText(host, 'fra et andet vindue'), 'first window explains why it was closed')

    for (const page of [host, visitor, hostAgain]) {
        check(page.errors.length === 0, `no uncaught errors (${page.errors.join(' | ') || 'none'})`)
    }

    await api(`/user/meetings/${meeting.uuid}`, 'DELETE').catch(() => {})
} catch (error) {
    failures.push(error.message)
    console.error(error)
} finally {
    await browser.close()
}

if (failures.length) {
    console.error(`\n${failures.length} check(s) failed`)
    process.exit(1)
}
console.log('\nall checks passed')
