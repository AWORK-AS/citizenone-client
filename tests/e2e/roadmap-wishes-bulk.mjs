/**
 * Browser E2E: bulk Decline / Reopen on Superadmin -> Roadmap -> Wishes, and the
 * confirmation before a single wish is declined.
 *
 * Drives the real API. Takes the first two wishes on the New tab, declines both in one go
 * from the bulk bar, checks they moved to Declined, reopens both from there, and checks
 * they are back on New - so the data ends as it started (reopening clears who handled
 * them). Also checks "Select all" and that the On roadmap tab has no checkboxes. Prints
 * the two uuids as PICKED so a caller can check the rows directly.
 *
 * Needs at least two wishes on the New tab.
 *
 * Run:  see tests/e2e/README.md
 * Env:  CO_TOKEN (superadmin with manage_content, required),
 *       CO_BASE_URL (default http://localhost:3000), CO_API_URL (default http://127.0.0.1:8000),
 *       CO_SHOT_DIR (default ./screenshots/)
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

async function wishes(status) {
    const res = await fetch(`${API}/api/superadmin/wishes?status=${status}`, { headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json' } })
    return (await res.json())
}

// Labels in every locale the page ships.
const WISHES_TAB = /^(Wishes|Ønsker|Önskemål)/
// The status buttons end with their count ("New 29"), which also keeps "New item" out.
const STATUS_TAB = {
    new: /^(New|Nye|Nya)\s*\d+$/,
    declined: /^(Declined|Afvist|Avvist|Avböjda)\s*\d+$/,
    on_roadmap: /^(On roadmap|På roadmap|På veikartet|På färdplanen)\s*\d+$/,
}
const DECLINE = /^(Decline|Afvis|Avvis|Avböj)$/
const REOPEN = /^(Back to new|Sæt tilbage til ny|Sett tilbake til ny|Tillbaka till ny)$/
const CONFIRM = /^(Confirm|Bekræft|Bekreft|Bekräfta|Yes|Ja)$/
const CANCEL = /^(Cancel|Annuller|Avbryt)$/

const before = await wishes('new')
const picked = (before.data ?? []).slice(0, 2)
if (picked.length < 2) {
    console.error('Needs at least two wishes on the New tab.')
    process.exit(2)
}
const startCounts = before.counts ?? {}
console.log(`Using ${picked.map((wish) => wish.reference).join(', ')}`)

const browser = await chromium.launch({ headless: true, channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
const pageErrors = []
page.on('pageerror', (e) => pageErrors.push(e.message))

await page.goto(BASE)
await page.evaluate((token) => localStorage.setItem('_token', token), TOKEN)
await page.goto(`${BASE}/superadmin/roadmap`, { waitUntil: 'networkidle' })

const bar = page.getByTestId('wish-bulk-bar')
const boxOf = (wish) => page.getByRole('checkbox', { name: wish.reference, exact: true })
const statusTab = (status) => page.getByRole('button', { name: STATUS_TAB[status] }).first()

try {
    await page.getByRole('button', { name: WISHES_TAB }).first().click()
    await boxOf(picked[0]).waitFor()

    // ---- Select all ------------------------------------------------------------
    await bar.getByRole('checkbox').check()
    const allBoxes = await page.locator('li input[type=checkbox]').count()
    const allChecked = await page.locator('li input[type=checkbox]:checked').count()
    check(allBoxes > 0 && allChecked === allBoxes, `Select all checks every wish on the tab (${allChecked}/${allBoxes})`)
    await bar.getByRole('checkbox').uncheck()
    check(await page.locator('li input[type=checkbox]:checked').count() === 0, 'unchecking Select all clears them again')

    // ---- Bulk decline ------------------------------------------------------------
    for (const wish of picked) await boxOf(wish).check()
    check((await bar.innerText()).includes('2'), 'the bar shows 2 selected')
    await page.screenshot({ path: path.join(SHOT, 'wishes-bulk-selected.png') })

    await bar.getByRole('button', { name: DECLINE }).click()
    const [declineResponse] = await Promise.all([
        page.waitForResponse((r) => r.url().endsWith('/superadmin/wishes/bulk/status') && r.request().method() === 'PUT'),
        page.getByRole('button', { name: CONFIRM }).last().click(),
    ])
    const declined = await declineResponse.json()
    check(declineResponse.status() === 200 && declined?.data?.updated === 2, `bulk Decline -> ${declineResponse.status()}, updated ${declined?.data?.updated}, skipped ${declined?.data?.skipped}`)
    check(JSON.parse(declineResponse.request().postData()).wish_uuids.length === 2, 'one request carried both wishes')

    const afterDecline = await wishes('declined')
    const declinedUuids = new Set(afterDecline.data.map((wish) => wish.uuid))
    check(picked.every((wish) => declinedUuids.has(wish.uuid)), 'both wishes are now Declined')
    check((afterDecline.counts.new ?? 0) === (startCounts.new ?? 0) - 2 && (afterDecline.counts.declined ?? 0) === (startCounts.declined ?? 0) + 2,
        `counters moved by 2 (new ${startCounts.new} -> ${afterDecline.counts.new}, declined ${startCounts.declined ?? 0} -> ${afterDecline.counts.declined})`)
    check(await page.locator('li input[type=checkbox]:checked').count() === 0, 'the selection is cleared afterwards')

    // ---- Bulk reopen from Declined ----------------------------------------------------
    await statusTab('declined').click()
    await boxOf(picked[0]).waitFor()
    for (const wish of picked) await boxOf(wish).check()
    await bar.getByRole('button', { name: REOPEN }).click()
    const [reopenResponse] = await Promise.all([
        page.waitForResponse((r) => r.url().endsWith('/superadmin/wishes/bulk/status') && r.request().method() === 'PUT'),
        page.getByRole('button', { name: CONFIRM }).last().click(),
    ])
    check(reopenResponse.status() === 200 && (await reopenResponse.json())?.data?.updated === 2, `bulk Reopen -> ${reopenResponse.status()}`)

    // ---- Single Decline asks first ----------------------------------------------------
    await statusTab('new').click()
    const card = page.locator('li').filter({ has: boxOf(picked[0]) })
    await card.waitFor()
    let calls = 0
    const countCall = (request) => { if (/\/superadmin\/wishes\/[^/]+\/status$/.test(request.url()) && request.method() === 'PUT') calls++ }
    page.on('request', countCall)

    await card.getByRole('button', { name: DECLINE }).click()
    const dialog = page.getByText(new RegExp(picked[0].reference.replace(/[#]/g, '\\#') + '\\?'))
    await dialog.waitFor()
    check(await dialog.isVisible(), `Decline on a card asks first, naming ${picked[0].reference}`)
    await page.getByRole('button', { name: CANCEL }).last().click()
    await page.waitForTimeout(500)
    check(calls === 0 && (await wishes('new')).data.some((wish) => wish.uuid === picked[0].uuid), 'Cancel leaves the wish on New and sends nothing')

    await card.getByRole('button', { name: DECLINE }).click()
    const [single] = await Promise.all([
        page.waitForResponse((r) => r.url().endsWith(`/superadmin/wishes/${picked[0].uuid}/status`) && r.request().method() === 'PUT'),
        page.getByRole('button', { name: CONFIRM }).last().click(),
    ])
    check(single.status() === 200 && (await wishes('declined')).data.some((wish) => wish.uuid === picked[0].uuid), 'Confirm declines it')
    page.off('request', countCall)

    // Back to new from the card itself: no popup for that.
    await statusTab('declined').click()
    const declinedCard = page.locator('li').filter({ has: boxOf(picked[0]) })
    await declinedCard.waitFor()
    const [back] = await Promise.all([
        page.waitForResponse((r) => r.url().endsWith(`/superadmin/wishes/${picked[0].uuid}/status`) && r.request().method() === 'PUT'),
        declinedCard.getByRole('button', { name: REOPEN }).click(),
    ])
    check(back.status() === 200, '"Back to new" on the card works straight away, without a popup')

    // ---- On roadmap: nothing to select ------------------------------------------------
    await statusTab('on_roadmap').click()
    await page.waitForLoadState('networkidle')
    check(await page.locator('li input[type=checkbox]').count() === 0 && await bar.count() === 0, 'the On roadmap tab has no checkboxes and no bulk bar')
} catch (e) {
    check(false, 'ERROR ' + e.message.split('\n')[0])
    await page.screenshot({ path: path.join(SHOT, 'wishes-bulk-error.png') })
}

// ---- Data is back as it started ------------------------------------------------------
const after = await wishes('new')
const back = after.data.filter((wish) => picked.some((p) => p.uuid === wish.uuid))
check(back.length === 2, 'both wishes are back on New')
// The API does not send who handled a wish; a caller can check these rows directly.
console.log(`PICKED ${picked.map((wish) => wish.uuid).join(',')}`)
check(JSON.stringify(after.counts) === JSON.stringify(startCounts), `counters are as they started (${JSON.stringify(after.counts)})`)
check(pageErrors.length === 0, `no page errors${pageErrors.length ? ': ' + pageErrors.join(' | ') : ''}`)

await browser.close()
console.log(results.every(Boolean) ? '\nAll checks passed' : '\nSome checks FAILED')
process.exit(results.every(Boolean) ? 0 : 1)
