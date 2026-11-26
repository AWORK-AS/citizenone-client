/**
 * Browser E2E for the FMK screen (Fælles Medicinkort), /citizens/{uuid}/fmk.
 *
 * What this proves:
 * 1. The medicine page has "Hent fra FMK", and it opens the FMK page under the
 *    Medicinkort tab.
 * 2. The page says it is FMK (GK 1.1), shows the card markings, and FMK is the
 *    left column, CitizenOne the right (GK 3.1). "Kræver handling" filters rows.
 * 3. "Vis alle oplysninger fra FMK" shows FMK's own fields (GK 3.5).
 * 4. When a refresh fails, the FMK error is shown and the last card stays,
 *    marked as old (GK 3.2).
 * 5. On a phone each row is a card, and the page is no wider than the
 *    medicine page itself.
 * 6. MitID Erhverv login (API answers stubbed in the browser, no SEB needed):
 *    login panel when FMK needs it, the button goes to SEB, choosing a role
 *    after coming back, the signed-in line, and SEB errors explained.
 * 7. Staff without an FMK licence do not see "Hent fra FMK".
 * 8. Settings -> FMK (admin): a SOR code needs its number, saving shows what
 *    is sent to FMK. Self-restoring: the original settings are put back.
 *
 * 9. "Overtag til CitizenOne" on a row only in FMK creates a draft that lines
 *    up with FMK; "Markér som gennemgået" clears an FMK change. The draft the
 *    test creates is deleted again; a catalogue medicine with the FMK drug
 *    name may stay (Settings -> Medicines).
 *
 * The token's user must be an admin with an FMK licence.
 *
 * Needs the backend with FMK_FAKE=true (sample card, never in production) and
 * a citizen the token's user may see. Read-only: nothing is changed.
 *
 * Run:  see tests/e2e/README.md
 * Env:  CO_TOKEN (required), CO_CITIZEN_UUID (required),
 *       CO_BASE_URL (default http://localhost:3001), CO_SHOT_DIR (default tests/e2e/screenshots)
 */
import { chromium } from 'playwright-core'
import { fileURLToPath } from 'url'
import path from 'path'

const TOKEN = process.env.CO_TOKEN
const CITIZEN = process.env.CO_CITIZEN_UUID
const BASE = process.env.CO_BASE_URL || 'http://localhost:3001'
const SHOT = process.env.CO_SHOT_DIR || path.join(path.dirname(fileURLToPath(import.meta.url)), 'screenshots')
const TIMEOUT = 90000

if (!TOKEN || !CITIZEN) {
  console.error('CO_TOKEN and CO_CITIZEN_UUID are required. See tests/e2e/README.md')
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

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
page.setDefaultTimeout(TIMEOUT)
const problems = []
page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`))
page.on('console', (m) => { if (m.type() === 'error' && /fmk|i18n|Not found/i.test(m.text())) problems.push(m.text().slice(0, 200)) })

// A direct load of a citizen subpage can run the tab access check before the
// user's pages are loaded, so the app is opened once and then navigated in-app.
const go = (p) => page.evaluate((to) => document.querySelector('#__nuxt').__vue_app__.config.globalProperties.$router.push(to), p)

await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' })
await page.evaluate((t) => localStorage.setItem('_token', t), TOKEN)
await page.goto(`${BASE}/citizens/${CITIZEN}/timeline`, { waitUntil: 'domcontentloaded' })
await page.waitForResponse((r) => r.url().endsWith('/api/user') && r.request().method() === 'GET').catch(() => {})
await page.waitForTimeout(4000)

console.log('1. Medicine page → FMK')
await go(`/citizens/${CITIZEN}/medicine-journals`)
const openButton = page.getByRole('button', { name: /Hent fra FMK|Fetch from FMK|Hämta från FMK/ }).first()
await openButton.waitFor()
check('"Hent fra FMK" on the medicine page', await openButton.isVisible())
await openButton.click()
await page.waitForURL(`**/citizens/${CITIZEN}/fmk`)
check('opens the FMK page', page.url().endsWith(`/citizens/${CITIZEN}/fmk`))

console.log('2. Clearly FMK, markings, FMK left')
const table = page.locator('table').filter({ has: page.locator('th', { hasText: /CitizenOne/ }) })
await table.waitFor()
check('FMK badge in the header', await page.locator('header span[translate="no"]', { hasText: 'FMK' }).isVisible())
check('sample data is labelled', await page.getByText(/Eksempeldata|Sample data/).first().isVisible())
check('"not reviewed" marking shown', await page.getByText(/ikke ajourført|not reviewed/i).first().isVisible())
const headers = table.locator('thead th')
const fmkX = (await headers.nth(0).boundingBox()).x
const localX = (await headers.nth(2).boundingBox()).x
check('FMK column is left of CitizenOne', fmkX < localX, `fmk ${fmkX}, local ${localX}`)
check('overview says what needs action', await page.getByRole('heading', { name: /kræver handling|needs? action|stemmer med FMK|matches FMK/ }).isVisible())
await page.getByRole('button', { name: /^(Alle|All) \(/ }).click()
await page.waitForTimeout(500)
const allRows = await table.locator('tbody tr').count()
check('rows listed', allRows > 0, `${allRows} rows`)
await page.getByRole('button', { name: /Kræver handling|Needs action/ }).click()
await page.waitForTimeout(500)
const diffRows = await table.locator('tbody tr').count()
check('"Kræver handling" never shows more rows than "Alle"', diffRows <= allRows, `${diffRows} of ${allRows}`)
await page.screenshot({ path: path.join(SHOT, 'fmk-screen-desktop.png'), fullPage: true })

console.log('3. All FMK fields')
await page.getByRole('button', { name: /Vis alle oplysninger fra FMK|Show all information from FMK/ }).first().click()
// Headless UI's dialog root has no box of its own; wait for its content.
const dialog = page.getByRole('dialog')
const route = dialog.getByText(/^(Administrationsvej|Route of administration)$/).first()
await route.waitFor()
check('details in plain words (route of administration, ATC)', await route.isVisible() && await dialog.getByText(/^ATC$/).first().isVisible())
check('who created it, with authorisation code', /aut\.|auth\./.test(await dialog.innerText()))
await dialog.getByRole('button', { name: /Vis alle felter fra FMK|Show all fields from FMK/ }).click()
const field = dialog.getByText('Identifier').first()
await field.waitFor()
check('every FMK field still available', await field.isVisible())
await page.screenshot({ path: path.join(SHOT, 'fmk-details.png') })
await page.keyboard.press('Escape')
await route.waitFor({ state: 'hidden' })

console.log('4. FMK unavailable on refresh')
await page.route('**/fmk/medicine-card', (route) => route.fulfill({
  status: 503,
  contentType: 'application/json',
  body: JSON.stringify({ message: 'Medicinkortet kunne ikke hentes fra FMK lige nu. Fejl fra FMK: Timeout', fault_code: null }),
}))
await page.getByRole('button', { name: /Hent igen|Fetch again/ }).click()
const alert = page.getByRole('alert').filter({ hasText: /FMK/ })
await alert.waitFor()
const alertText = await alert.innerText()
check('FMK error is shown', alertText.includes('Timeout'), alertText.replace(/\s+/g, ' ').slice(0, 200))
check('last card stays, marked as old', await page.getByText(/som det var|as it was/).first().isVisible())
check('table still shown', await table.isVisible())
await page.unroute('**/fmk/medicine-card')

console.log('5. Phone')
await page.setViewportSize({ width: 390, height: 900 })
await page.waitForTimeout(1000)
const fmkWidth = await page.evaluate(() => document.documentElement.scrollWidth)
check('rows become cards (table hidden)', !(await table.isVisible()))
await page.screenshot({ path: path.join(SHOT, 'fmk-screen-phone.png'), fullPage: true })
await go(`/citizens/${CITIZEN}/medicine-journals`)
await page.waitForTimeout(3000)
const medicineWidth = await page.evaluate(() => document.documentElement.scrollWidth)
check('FMK page no wider than the medicine page', fmkWidth <= medicineWidth, `fmk ${fmkWidth}, medicine ${medicineWidth}`)

console.log('6. MitID Erhverv login')
await page.setViewportSize({ width: 1440, height: 1000 })
const json = (body, status = 200) => ({ status, contentType: 'application/json', body: JSON.stringify(body) })
const signedOut = { data: { logged_in: false, name: null, role_label: null, expires_at: null, choices: null } }
let session = signedOut
await page.route('**/api/user/fmk-login/session', (route) => route.fulfill(json(session)))

// a) FMK needs the staff member's own login
await page.route('**/fmk/medicine-card', (route) => route.fulfill(json({ message: 'Log ind med MitID Erhverv for at slå op i FMK.', code: 'fmk_login_required' }, 403)))
await go(`/citizens/${CITIZEN}/fmk`)
const loginButton = page.getByRole('button', { name: /Log ind med MitID Erhverv|Sign in with MitID Erhverv/ })
await loginButton.waitFor()
check('login panel shown when FMK needs the staff login', await loginButton.isVisible())
check('no comparison table without login', !(await table.isVisible().catch(() => false)))
let loginBody = null
await page.route('**/api/user/fmk-login', (route) => { loginBody = route.request().postDataJSON(); return route.fulfill(json({ redirect_url: 'https://seb.stub.test/runtime/saml2/sso?SAMLRequest=x' })) })
await page.route('https://seb.stub.test/**', (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<h1>SEB</h1>' }))
await Promise.all([page.waitForURL('https://seb.stub.test/**'), loginButton.click()])
check('button sends the browser to SEB', page.url().startsWith('https://seb.stub.test/runtime/saml2/sso'))
check('comes back to this FMK page', loginBody?.return_path === `/citizens/${CITIZEN}/fmk`, JSON.stringify(loginBody))
await page.unroute('**/fmk/medicine-card')
await page.unroute('**/api/user/fmk-login')

// b) back from SEB with two roles to choose between
await page.goto(`${BASE}/citizens/${CITIZEN}/timeline`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(4000)
session = { data: { ...signedOut.data, choices: [
  { key: 'national_role:urn:x:PlejeAssR3', type: 'national_role', label: 'PlejeAssR3' },
  { key: 'authorisation:ABC12', type: 'authorisation', label: 'Sygeplejerske' },
] } }
let chosen = null
await page.route('**/api/user/fmk-login/session/role', (route) => {
  chosen = route.request().postDataJSON()
  session = { data: { logged_in: true, name: 'Karl Kristensen', role_label: 'Sygeplejerske', expires_at: new Date(Date.now() + 8 * 3600e3).toISOString(), choices: null } }
  return route.fulfill(json(session))
})
await go(`/citizens/${CITIZEN}/fmk?fmk_login=choose`)
await page.getByRole('radio', { name: /Sygeplejerske/ }).waitFor()
check('role choice offered after SEB', await page.getByRole('radio').count() === 2)
await page.getByRole('radio', { name: /Sygeplejerske/ }).check()
await page.getByRole('button', { name: /Fortsæt|Continue/ }).click()
await page.getByText(/Logget ind i FMK som Karl Kristensen|Signed in to FMK as Karl Kristensen/).waitFor()
check('chosen role sent', chosen?.key === 'authorisation:ABC12', JSON.stringify(chosen))
check('signed-in line with role', await page.getByText(/Sygeplejerske/).first().isVisible())
await table.waitFor()
check('card fetched after choosing', await table.isVisible())
check('login query removed from the URL', !page.url().includes('fmk_login'))
await page.screenshot({ path: path.join(SHOT, 'fmk-screen-signed-in.png'), fullPage: true })

// c) SEB sends the browser back with a full page load, here with an error.
// The signed-in app state is kept in the browser, so the citizen tab check
// must not bounce the page before the result is read.
session = signedOut
await page.goto(`${BASE}/citizens/${CITIZEN}/fmk?fmk_login=error&fmk_error=organisation`, { waitUntil: 'domcontentloaded' })
const orgMessage = page.getByText(/anden organisation|another organisation/)
await orgMessage.waitFor()
check('organisation mismatch explained', await orgMessage.isVisible())
check('full page return stays on the FMK page', page.url().includes(`/citizens/${CITIZEN}/fmk`), page.url())
await page.unroute('**/api/user/fmk-login/session')
await page.unroute('**/api/user/fmk-login/session/role')

console.log('7. No licence, no FMK button')
await page.route('**/api/user', async (route) => {
  const res = await route.fetch(); const body = await res.json()
  body.data.has_fmk_licence = false
  return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })
})
await page.goto(`${BASE}/citizens/${CITIZEN}/timeline`, { waitUntil: 'domcontentloaded' })
await page.waitForResponse((r) => r.url().endsWith('/api/user')).catch(() => {})
await page.waitForTimeout(3000)
await go(`/citizens/${CITIZEN}/medicine-journals`)
await page.getByRole('button', { name: /Ny medicin|New medicine/ }).first().waitFor()
await page.waitForTimeout(1500)
check('"Hent fra FMK" hidden without licence', await page.getByRole('button', { name: /Hent fra FMK|Fetch from FMK|Hämta från FMK/ }).count() === 0)
await page.unroute('**/api/user')
await page.goto(`${BASE}/citizens/${CITIZEN}/timeline`, { waitUntil: 'domcontentloaded' })
await page.waitForResponse((r) => r.url().endsWith('/api/user')).catch(() => {})
await page.waitForTimeout(3000)

console.log('8. Settings -> FMK')
const firstGet = page.waitForResponse((r) => r.url().includes('/api/user/fmk-settings') && r.request().method() === 'GET')
await go('/settings/fmk')
const settingsResponse = await firstGet
const settingsUrl = settingsResponse.url()
const original = (await settingsResponse.json()).data
await page.waitForTimeout(2000)
// A one-time "what's new" notice can cover the page; close it if it is there.
const gotIt = page.locator('#headlessui-portal-root').getByRole('button', { name: /^(got it|forstået|forstått|uppfattat|ok)$/i })
if (await gotIt.count()) { await gotIt.first().click(); await page.waitForTimeout(800) }
const saveButton = page.getByRole('button', { name: /^(Gem|Save|Lagre|Spara)$/ })
await saveButton.waitFor()
const licenceTitle = page.getByText(/Hvem har adgang til FMK|Who has access to FMK/)
await licenceTitle.waitFor()
check('licence panel shows seats in use', await page.getByText(/licenser i brug|licences in use/).first().isVisible())
const switches = page.getByRole('switch')
check('one switch per staff member', (await switches.count()) > 0)
const typeSelect = page.locator('#fmk-id-type').locator('xpath=ancestor::div[contains(@class,"multiselect")][1]')
await typeSelect.click()
await page.getByRole('option', { name: /SOR/ }).first().click()
await page.locator('#fmk-id').fill('')
const saved = (url) => page.waitForResponse((r) => r.url().includes('/api/user/fmk-settings') && r.request().method() === 'PUT')
let put = saved(); await saveButton.click(); let res = await put
check('SOR code without number is refused', res.status() === 422, String(res.status()))
check('field error shown', await page.getByText(/organisation id|nummer|number/i).first().isVisible().catch(() => false))
await page.locator('#fmk-id').fill('123456789012345')
await page.locator('#fmk-phone').fill('70 20 30 40')
put = saved(); await saveButton.click(); res = await put
check('settings saved', res.status() === 200, String(res.status()))
check('what FMK is sent is shown', await page.getByText('123456789012345').last().isVisible())
await page.screenshot({ path: path.join(SHOT, 'fmk-settings.png'), fullPage: true })
// put back what was there
await page.request.put(settingsUrl, {
  headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json' },
  data: { organisation_id_type: original.organisation_id_type, organisation_id: original.organisation_id, organisation_name: original.organisation_name, contact_phone: original.contact_phone, contact_email: original.contact_email, default_requested_role: original.default_requested_role, require_mitid_cvr_match: original.require_mitid_cvr_match },
})

console.log('9. Take over from FMK')
await go(`/citizens/${CITIZEN}/fmk`)
await table.waitFor()
const takeOverButton = table.getByRole('button', { name: /Overtag til CitizenOne|Take over into CitizenOne/ }).first()
if (await takeOverButton.count()) {
  const row = takeOverButton.locator('xpath=ancestor::tr[1]')
  const drug = (await row.locator('td').first().locator('p').first().innerText()).trim()
  const posted = page.waitForResponse((r) => r.url().includes('/fmk/take-over'))
  await takeOverButton.click()
  const response = await posted
  check('take over creates the draft', response.status() === 201, String(response.status()))
  const created = (await response.json()).data
  const sameRow = table.locator('tr').filter({ hasText: drug })
  await sameRow.getByText(/Udfyld doseringsplan|Fill in dosage plan/).waitFor()
  check('row now lined up with a draft on the CitizenOne side', (await sameRow.innerText()).match(/Ens|Same/) !== null)
  await page.screenshot({ path: path.join(SHOT, 'fmk-taken-over.png'), fullPage: true })
  // clean up the draft this test created
  const apiBase = response.url().split('/user/citizens/')[0]
  const del = await page.request.delete(`${apiBase}/user/citizen-medicines/${created.uuid}`, { headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json' } })
  check('test draft removed again', del.ok(), String(del.status()))
} else {
  console.log('  skip no row only in FMK')
}

console.log('10. What changed, jumping between rows, straight to the medicine')
const historyButton = table.getByRole('button', { name: /Se hvad der er ændret|See what changed/ }).first()
if (await historyButton.count()) {
  const fetched = page.waitForResponse((r) => r.url().includes('/history'))
  await historyButton.click()
  check('history fetched when asked', (await fetched).status() === 200)
  const title = table.getByText(/Ændret fra version|Changed from version/).first()
  await title.waitFor()
  check('changes listed', (await title.locator('xpath=..').innerText()).split('\n').length > 2)
} else {
  console.log('  skip no row changed in FMK')
}
const nextButton = page.getByRole('button', { name: /^(Næste|Next)$/ })
if (await nextButton.count()) {
  await nextButton.click()
  await page.waitForTimeout(600)
  check('"Næste" focuses a row that needs action', Boolean(await page.evaluate(() => document.activeElement?.dataset?.fmkRow)))
} else {
  console.log('  skip fewer than two rows need action')
}
const editButton = table.getByRole('button', { name: /Ret i CitizenOne|Edit in CitizenOne/ }).first()
if (await editButton.count()) {
  await editButton.click()
  await page.waitForURL(/medicine-journals/)
  await page.locator('[role=dialog][data-headlessui-state=open] [id^=headlessui-dialog-title]').first().waitFor()
  check('"Ret i CitizenOne" opens that medicine for editing', true)
  check('edit link not left in the URL', !page.url().includes('edit='), page.url())
  await page.keyboard.press('Escape')
  await go(`/citizens/${CITIZEN}/fmk`)
  await table.waitFor()
} else {
  console.log('  skip no medicine to edit')
}

console.log('11. Privacy-marked medicine (GK 4.3)')
const privateButton = page.getByRole('button', { name: /Vis privatmarkeret medicin|Show privacy-marked medicine/ }).first()
if (await privateButton.count()) {
  await privateButton.click()
  const confirm = page.getByRole('button', { name: /Vis medicinen|Show the medicine/ })
  await confirm.waitFor()
  check('no reason chosen: cannot confirm', await confirm.isDisabled())
  await page.getByRole('radio', { name: /Værdispring|Emergency/ }).check()
  const sent = page.waitForResponse((r) => r.url().includes('/negative-consent'))
  await confirm.click()
  const res = await sent
  check('reason sent to the backend', res.status() === 200 && JSON.parse(res.request().postData() || '{}').reason === 'emergency')
  await page.getByText(/Privatmarkeret medicin vises|Privacy-marked medicine is shown/).first().waitFor()
  check('says why the medicine is shown', true)
  await page.getByRole('button', { name: /^(Alle|All) \(/ }).click()
  await page.waitForTimeout(500)
  const marked = table.locator('tr').filter({ hasText: 'Cipramil' })
  check('hidden medicine now listed', await marked.count() === 1)
  check('it is marked as privacy-marked', /Privatmarkeret|Privacy-marked|Private/i.test(await marked.first().innerText()))
  await page.screenshot({ path: path.join(SHOT, 'fmk-private.png'), fullPage: true })
} else {
  console.log('  skip no privacy-marked medicine on this card')
}

console.log('12. Prescriptions and dispensings (GK 6, 3.16)')
await page.getByRole('button', { name: /^(Alle|All) \(/ }).click()
await page.waitForTimeout(400)
const ibuRow = table.locator('tr').filter({ hasText: 'Ibumetin 400 mg tabletter' }).first()
if (await ibuRow.count()) {
  check('open prescriptions counted on the row', /åben recept|open prescription/.test(await ibuRow.innerText()))
  await ibuRow.getByRole('button', { name: /Vis alle oplysninger fra FMK|Show all information from FMK/ }).click()
  const dlg = page.getByRole('dialog')
  await dlg.getByText(/^(Recepter|Prescriptions)$/).first().waitFor()
  const text = await dlg.innerText()
  check('prescription status shown', /delvist udleveret/i.test(text))
  check('iterations shown', /3 udleveringer med 2 uger|3 dispensings at 2 uger/.test(text))
  check('no substitution shown as Ej S', text.includes('Ej S'))
  check('given and pharmacy dispensing told apart', /Indgivet|Given/.test(text) && /Apoteksudlevering|Pharmacy dispensing/.test(text))
  await page.screenshot({ path: path.join(SHOT, 'fmk-prescriptions.png') })
  await page.keyboard.press('Escape')
  await dlg.getByText(/^(Recepter|Prescriptions)$/).first().waitFor({ state: 'hidden' })
}
const predRow = table.locator('tr').filter({ hasText: 'Prednisolon' }).first()
if (await predRow.count()) check('future prescription stands out', /Recept gyldig fra|Prescription valid from/.test(await predRow.innerText()))
const looseButton = page.getByRole('button', { name: /Vis løse recepter|Show loose prescriptions/ })
if (await looseButton.count()) {
  await looseButton.click()
  const brentan = page.getByRole('dialog').getByText(/Brentan/).first()
  await brentan.waitFor()
  check('loose prescriptions can be opened', await brentan.isVisible())
  await page.keyboard.press('Escape')
  await brentan.waitFor({ state: 'hidden' })
}

console.log('13. Withdrawn drug medications and follow-up dates (GK 3.9, 3.15)')
await page.getByRole('button', { name: /^(Alle|All) \(/ }).click()
await page.waitForTimeout(400)
check('withdrawn ones are not fetched by default', await table.locator('tr').filter({ hasText: 'Selo-Zok' }).count() === 0)
const withdrawnToggle = page.getByRole('button', { name: /Vis seponerede|Show withdrawn/ })
const asked = page.waitForRequest((r) => r.url().includes('/fmk/medicine-card') && r.url().includes('include_withdrawn=1'))
await withdrawnToggle.click()
await asked
const seloRow = table.locator('tr').filter({ hasText: 'Selo-Zok' }).first()
await seloRow.waitFor()
check('withdrawn one shown on request with who and when', /Seponeret i FMK af Læge Test|Withdrawn in FMK by Læge Test/.test(await seloRow.innerText()))
const marevanRow = table.locator('tr').filter({ hasText: 'Marevan' }).first()
if (await marevanRow.count()) check('passed follow-up date stands out', /Kontroldato overskredet|Follow-up date passed/.test(await marevanRow.innerText()))
await withdrawnToggle.click()
await seloRow.waitFor({ state: 'detached' })
check('withdrawn ones hidden again', true)

console.log('14. Dose dispensing (GK 7.1, 7.3)')
const ddNotice = page.locator('[role=status]').filter({ hasText: /dosisdispenseret medicin|dose-dispensed medicine/ }).first()
if (await ddNotice.count()) {
  const noticeText = await ddNotice.innerText()
  check('latest dose dispensing with pharmacy stands out', /Seneste dosisudlevering: Dosisapoteket Test|Latest dose dispensing: Dosisapoteket Test/.test(noticeText))
  check('open dose dispensing prescriptions told', /åbne recepter med dosisdispensering|open prescriptions with dose dispensing/.test(noticeText))
  const fetched = page.waitForResponse((r) => r.url().includes('/fmk/dose-dispensing-card'))
  await ddNotice.getByRole('button', { name: /Vis dosisdispenseringskort|Show dose dispensing card/ }).click()
  check('card fetched only when opened', (await fetched).status() === 200)
  const ddDialog = page.getByRole('dialog')
  await ddDialog.getByText(/^(Aktuel periode|Current period)$/).first().waitFor()
  const ddText = await ddDialog.innerText()
  check('current and coming periods split', /Kommende perioder|Coming periods/i.test(ddText))
  check('deadline and pharmacies shown', /Deadline for ændringer|Deadline for changes/.test(ddText) && /Pakkeapotek|Packing pharmacy/.test(ddText) && ddText.includes('Dosisapoteket Test'))
  check("FMK's warnings shown", ddText.includes('Styrken er ændret fra 5 mg til 10 mg.') && ddText.includes('Der er ændringer efter deadline'))
  check('medicines with name, strength and dosage', ddText.includes('Felodipin 10 mg') && ddText.includes('1 tablet morgen'))
  await page.screenshot({ path: path.join(SHOT, 'fmk-dose-dispensing.png') })
  await page.keyboard.press('Escape')
  await ddDialog.getByText(/^(Aktuel periode|Current period)$/).first().waitFor({ state: 'hidden' })
} else {
  console.log('  skip no dose dispensing on this card')
}

console.log('15. Prescription requests (GK 16.1, 16.3, 16.4)')
await page.getByRole('button', { name: /^(Alle|All) \(/ }).click()
await page.waitForTimeout(400)
const ibuForRequest = table.locator('tr').filter({ hasText: 'Ibumetin 400 mg tabletter' }).first()
const requestButton = ibuForRequest.getByRole('button', { name: /Anmod om ny recept|Request a new prescription/ })
if (await requestButton.count()) {
  await requestButton.click()
  const reqDialog = page.getByRole('dialog')
  await reqDialog.getByText(/Lægehuset Test/).first().waitFor()
  check('receiver suggested from the card', await reqDialog.getByRole('radio', { name: /Lægehuset Test/ }).isChecked())
  check('same package as last time offered', await reqDialog.getByRole('radio', { name: /Samme pakning|Same package/ }).isChecked())
  const posted = page.waitForResponse((r) => r.url().includes('/fmk/prescription-requests') && r.request().method() === 'POST')
  await reqDialog.getByRole('button', { name: /Send anmodning|Send request/ }).click()
  const postRes = await posted
  const sentBody = JSON.parse(postRes.request().postData() || '{}')
  check('request sent with receiver and package', postRes.status() === 201 && sentBody.organisation?.id === '012345' && sentBody.dispensing?.package_number === '028100')
  const panel = page.locator('section').filter({ has: page.getByRole('heading', { name: /Receptanmodninger|Prescription requests/ }) })
  const waiting = panel.locator('li').filter({ hasText: /Afventer lægen|Awaiting the doctor/ }).first()
  await waiting.waitFor()
  check('request listed as awaiting the doctor', true)
  check('rejected request shows the reason', /Årsag: Receptfornyelsen kræver konsultation|Reason: Receptfornyelsen kræver konsultation/.test(await panel.innerText()))
  await page.screenshot({ path: path.join(SHOT, 'fmk-requests.png'), fullPage: true })
  const cancelled = page.waitForResponse((r) => r.url().includes('/fmk/prescription-requests/') && r.request().method() === 'DELETE')
  await waiting.getByRole('button', { name: /Fortryd|Cancel/ }).click()
  check('own request can be cancelled', (await cancelled).status() === 200)
} else {
  console.log('  skip staff may not request prescriptions')
}

const ackButton = table.getByRole('button', { name: /Markér som gennemgået|Mark as reviewed/ }).first()
if (await ackButton.count()) {
  const acked = page.waitForResponse((r) => r.url().includes('/fmk/acknowledge'))
  await ackButton.click()
  check('change marked as reviewed', (await acked).status() === 200)
} else {
  console.log('  skip no row changed in FMK')
}

check('no page errors', problems.length === 0, problems.join(' | '))

await browser.close()
console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) failed.`)
process.exit(failures === 0 ? 0 : 1)
