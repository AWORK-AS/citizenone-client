/**
 * "New wishes" (feature requests) can carry screenshots.
 *
 * Opens the wish modal from the profile menu's "New wishes" entry and proves:
 *   - images can be picked with the file input and show as previews,
 *   - a preview can be removed again,
 *   - a screenshot pasted from the clipboard is added too,
 *   - a non-image file is refused with a message, not uploaded,
 *   - the picker stops at the maximum (5) and says so,
 *   - sending posts the message + images as multipart and the API stores them,
 *   - "Your previous requests" shows the stored images as thumbnails that load.
 *
 * Writes: creates ONE contact_us_wishes row (with its images) for the token's
 * user. It does not delete it - the run prints the wish uuid so it can be
 * removed afterwards. The support email is only queued (no worker = not sent).
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
function label(path, { exact = true, params = {} } = {}) {
    const texts = LANGS.map((d) => path.split('.').reduce((o, k) => o?.[k], d))
        .filter(Boolean)
        .map((t) => Object.entries(params).reduce((acc, [k, v]) => acc.replace(`{${k}}`, v), t))
    const body = texts.map(esc).join('|')
    return new RegExp(exact ? `^\\s*(${body})\\s*$` : `(${body})`)
}

let failures = 0
function check(ok, label) {
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`)
    if (!ok) failures++
}

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ viewport: { width: 1400, height: 900 } })
const page = await context.newPage()

const consoleErrors = []
const serverErrors = []
page.on('response', (r) => { if (r.status() >= 500) serverErrors.push(`${r.status()} ${r.request().method()} ${r.url()}`) })
page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`))
page.on('console', (m) => {
    // 5xx responses are reported (with their URL) through serverErrors instead.
    if (m.type() === 'error' && !/pusher|reverb|websocket|\[vite\]|favicon|source ?map|status of 5\d\d/i.test(m.text())) {
        consoleErrors.push(m.text())
    }
})

await page.goto(BASE)
await page.evaluate((token) => localStorage.setItem('_token', token), TOKEN)
await page.goto(`${BASE}/coming-functions`)
await page.waitForLoadState('networkidle')

// Real screenshots of the app, used as the images to attach.
const shotA = await page.screenshot()
const shotB = await page.screenshot({ clip: { x: 0, y: 0, width: 600, height: 300 } })

// Open the modal the way Baris does: profile menu -> "New wishes".
let opened = false
try {
    await page.locator('[id^="headlessui-menu-button"]').last().click({ timeout: 10000 })
    await page.locator('[data-testid="menu-citizenone-group"]').click({ timeout: 5000 })
    await page.getByText(label('navbar.newWishes')).click({ timeout: 5000 })
    opened = true
} catch (e) {
    console.log(`menu path failed: ${e.message.split('\n')[0]}`)
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: label('comingFunctions.sendWish', { exact: false }) }).click()
}
check(opened, 'the modal opens from the profile menu "New wishes" entry')

const fileInput = page.locator('#wish-images')
await fileInput.waitFor({ state: 'attached', timeout: 10000 })
const previews = page.locator('[data-testid="wish-image-previews"] img')

// 1. Pick two images.
await fileInput.setInputFiles([
    { name: 'full-page.png', mimeType: 'image/png', buffer: shotA },
    { name: 'header.png', mimeType: 'image/png', buffer: shotB },
])
await page.waitForTimeout(300)
check(await previews.count() === 2, 'two picked images show as previews')

// 2. Remove one.
await page.locator('[data-testid="wish-image-previews"] button').first().click()
check(await previews.count() === 1, 'removing a preview drops it')

// 3. Paste a screenshot from the clipboard.
await page.evaluate(async (b64) => {
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
    const file = new File([bytes], 'image.png', { type: 'image/png' })
    const dt = new DataTransfer()
    dt.items.add(file)
    const target = document.querySelector('#message') || document.querySelector('#wish-images')
    target.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }))
}, shotB.toString('base64'))
await page.waitForTimeout(300)
check(await previews.count() === 2, 'a pasted screenshot is added as a preview')

// 4. A non-image is refused.
await fileInput.setInputFiles([{ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') }])
await page.waitForTimeout(200)
const modalText = await page.locator('#wish-images').locator('xpath=..').innerText()
check(await previews.count() === 2 && label('wish.form.notAnImage', { exact: false }).test(modalText), 'a non-image file is refused with a message')

// 5. The maximum is enforced.
await fileInput.setInputFiles(Array.from({ length: 5 }, (_, i) => ({ name: `extra-${i}.png`, mimeType: 'image/png', buffer: shotB })))
await page.waitForTimeout(300)
const afterMax = await page.locator('#wish-images').locator('xpath=..').innerText()
check(await previews.count() === 5, 'the picker stops at 5 images')
check(label('wish.form.tooManyImages', { exact: false, params: { max: 5 } }).test(afterMax), 'going over the maximum shows a message')
check(await page.getByRole('button', { name: label('wish.form.addImages', { exact: false }) }).count() === 0, 'the add button hides at the maximum')
await page.screenshot({ path: `${SHOTS}wish-images-form-max.png` })

// Back down to two so the run stores little.
for (let i = 0; i < 3; i++) await page.locator('[data-testid="wish-image-previews"] button').last().click()
check(await previews.count() === 2, 'back to two images before sending')

// 6. Send.
const marker = `E2E wish-images ${Date.now()}`
await page.fill('#message', marker)
await page.screenshot({ path: `${SHOTS}wish-images-form.png` })
const [response] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/user/contact-us/wishes') && r.request().method() === 'POST', { timeout: 60000 }),
    page.getByRole('button', { name: label('wish.form.sendMessage', { exact: false }) }).click(),
])
const contentType = response.request().headers()['content-type'] || ''
check(response.status() === 200, `POST /wishes returns 200 (got ${response.status()})`)
check(contentType.startsWith('multipart/form-data'), 'the wish is sent as multipart/form-data')

// 7. Confirmation + previous requests with thumbnails.
const listResponse = await page.waitForResponse((r) => r.url().includes('/user/contact-us/wishes') && r.request().method() === 'GET', { timeout: 30000 })
const list = await listResponse.json()
const mine = (list.data || []).find((w) => w.message === marker)
check(!!mine, 'the new wish is in the list response')
check(mine?.images?.length === 2, `the list response carries its 2 images (got ${mine?.images?.length})`)

const item = page.locator('li', { hasText: marker })
await item.waitFor({ timeout: 10000 })
const thumbs = item.locator('img')
check(await thumbs.count() === 2, 'the previous-requests entry shows 2 thumbnails')
await page.waitForFunction((m) => {
    const li = [...document.querySelectorAll('li')].find((el) => el.textContent.includes(m))
    return li && [...li.querySelectorAll('img')].every((img) => img.complete)
}, marker, { timeout: 30000 }).catch(() => {})
const loaded = await thumbs.evaluateAll((imgs) => imgs.map((img) => img.naturalWidth > 0))
check(loaded.length === 2 && loaded.every(Boolean), `thumbnails load from the stored URL (${JSON.stringify(loaded)})`)
await page.screenshot({ path: `${SHOTS}wish-images-confirmation.png` })

const wishServerErrors = serverErrors.filter((e) => e.includes('/contact-us/wishes'))
check(wishServerErrors.length === 0, `no 5xx from the wish endpoints${wishServerErrors.length ? ': ' + wishServerErrors.join(' | ') : ''}`)
for (const e of serverErrors.filter((e) => !e.includes('/contact-us/wishes'))) console.log(`note: unrelated 5xx elsewhere on the page: ${e}`)
check(consoleErrors.length === 0, `no console errors${consoleErrors.length ? ': ' + consoleErrors.join(' | ') : ''}`)

console.log(`created wish uuid: ${mine?.uuid ?? '(unknown)'}`)
await browser.close()
console.log(failures ? `\n${failures} check(s) failed` : '\nAll checks passed')
process.exit(failures ? 1 : 0)
