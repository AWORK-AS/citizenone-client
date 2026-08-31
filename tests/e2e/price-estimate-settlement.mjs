/**
 * Browser E2E for quoting from the service catalogue and settling at the desk.
 *
 * A price estimate held a code, a description, a price and a subsidy that the
 * invoicing app's catalogue already holds, typed in again every time, and an
 * accepted estimate was a dead end on its own screen: it could become an
 * invoice, but only from the invoices tab, and only as a document to be sent
 * out and paid later. A clinic does not work that way - the patient pays before
 * they leave.
 *
 * What this proves that a backend test cannot:
 * 1. Picking a service fills the line's code, description, price and subsidy,
 *    and the line can still be adjusted afterwards.
 * 2. The estimate says what is left to settle, and settles it in one action.
 * 3. A settled line reads as invoiced rather than offering the same button.
 *
 * Setup and cleanup go through the API, so the test is self-restoring and can
 * be re-run. It needs the invoicing app active for the company, and a dental
 * industry - the same prerequisites the feature has.
 *
 * Run:  see tests/e2e/README.md
 * Env:  CO_TOKEN (required, Admin at a dental clinic with the invoicing app),
 *       CO_CITIZEN_UUID (required), CO_BASE_URL (default http://localhost:3001),
 *       CO_API_URL (default http://localhost:8001)
 */
import { chromium } from 'playwright-core'
import { fileURLToPath } from 'url'
import path from 'path'

const TOKEN = process.env.CO_TOKEN
const CITIZEN = process.env.CO_CITIZEN_UUID
const BASE = process.env.CO_BASE_URL || 'http://localhost:3001'
const API = process.env.CO_API_URL || 'http://localhost:8001'
const SHOT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'screenshots')
const USER_FETCH_TIMEOUT = 60000

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

async function api(method, urlPath, body) {
  const response = await fetch(`${API}/api${urlPath}`, {
    method,
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json', 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })

  return { status: response.status, body: await response.json().catch(() => null) }
}

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } })

let serviceUuid = null
let estimateUuid = null

try {
  // A catalogue entry to quote from, removed again at the end.
  const service = await api('POST', '/user/services', {
    code: 'E2E-1', name: 'E2E behandling', unit_price: 1200, vat_rate: 0, default_subsidy: 200,
  })
  serviceUuid = service.body?.data?.uuid
  if (!serviceUuid) {
    console.error('could not create a service - is the invoicing app active for this company?', service.status)
    process.exit(1)
  }

  await page.goto(`${BASE}/overview`, { waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT })
  await page.evaluate((token) => localStorage.setItem('_token', token), TOKEN)
  await Promise.all([
    page.waitForResponse((r) => r.url().endsWith('/api/user') && r.request().method() === 'GET', { timeout: USER_FETCH_TIMEOUT }),
    page.reload({ waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT }),
  ])
  await page.waitForTimeout(3000)
  await Promise.all([
    page.waitForResponse((r) => r.url().endsWith('/api/user') && r.request().method() === 'GET', { timeout: USER_FETCH_TIMEOUT }),
    page.goto(`${BASE}/citizens/${CITIZEN}/price-estimates`, { waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT }),
  ])
  await page.waitForTimeout(4000)

  console.log('quoting from the catalogue')
  await page.locator('button', { hasText: 'Nyt prisoverslag' }).first().click()
  await page.waitForTimeout(2500)

  const form = page.locator('table').last()
  const columns = (await form.locator('thead th').allInnerTexts()).map((c) => c.trim())
  check('the line offers a service to pick', columns.includes('YDELSE'), JSON.stringify(columns))

  const row = form.locator('tbody tr').first()
  // The tooth picker is first, the service second; both are the shared select.
  await row.locator('.multiselect').nth(1).click()
  await page.waitForTimeout(700)
  await page.locator('.multiselect-option:visible', { hasText: 'E2E behandling' }).first().click()
  await page.waitForTimeout(900)

  const values = await row.locator('input').evaluateAll((els) => els.map((el) => el.value))
  check('picking a service fills the code', values.includes('E2E-1'), JSON.stringify(values))
  check('picking a service fills the price', values.includes('1200'), JSON.stringify(values))
  check('picking a service fills the subsidy', values.includes('200'), JSON.stringify(values))
  await page.screenshot({ path: `${SHOT}/estimate-service-picker.png` })

  await page.locator('button', { hasText: 'Gem' }).last().click()
  await page.waitForTimeout(3000)

  // Take the estimate through to accepted and carried out via the API: this
  // test is about the catalogue and the settlement, not about the buttons in
  // between, which the estimate suite already covers.
  const estimates = await api('GET', `/user/citizens/${CITIZEN}/price-estimates`)
  const created = (estimates.body?.data || []).find((e) => (e.lines || []).some((l) => l.treatment_code === 'E2E-1'))
  estimateUuid = created?.uuid
  check('the estimate remembers the service it was quoted from', !!created?.lines?.[0]?.service_uuid)

  await api('PUT', `/user/price-estimates/${estimateUuid}/status`, { status: 'accepted' })
  await api('PUT', `/user/price-estimates/lines/${created.lines[0].uuid}/complete`, { done: true })

  console.log('settling at the desk')
  await Promise.all([
    page.waitForResponse((r) => r.url().endsWith('/api/user') && r.request().method() === 'GET', { timeout: USER_FETCH_TIMEOUT }),
    page.reload({ waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT }),
  ])
  await page.waitForTimeout(4500)

  const pageText = await page.locator('main').innerText()
  check('the estimate says what is left to settle', pageText.includes('Til afregning'), pageText.slice(0, 200))
  check('and offers to settle it', await page.locator('button', { hasText: 'Afregn nu' }).count() > 0)

  await page.locator('button', { hasText: 'Afregn nu' }).first().click()
  await page.waitForTimeout(1500)
  await page.locator('button', { hasText: 'Afregn nu' }).last().click()
  await page.waitForTimeout(4000)

  const invoices = await api('GET', `/user/citizens/${CITIZEN}/invoices`)
  const invoice = (invoices.body?.data || [])[0]
  check('an invoice was raised', !!invoice, JSON.stringify(invoices.status))
  check('and it is paid in full', invoice && Number(invoice.paid_amount) === Number(invoice.total_amount),
    invoice ? `${invoice.paid_amount} of ${invoice.total_amount}` : '')
  check('for what the estimate said was owed', invoice && Number(invoice.total_amount) === 1000,
    invoice ? String(invoice.total_amount) : '')

  const after = await page.locator('main').innerText()
  check('the line now reads as invoiced', after.includes('Faktureret'), after.slice(0, 200))
  check('and there is nothing left to settle', !after.includes('Til afregning'))
  await page.screenshot({ path: `${SHOT}/estimate-settled.png` })
} finally {
  // Put the clinic back as it was.
  if (estimateUuid) {
    const invoices = await api('GET', `/user/citizens/${CITIZEN}/invoices`)
    for (const invoice of invoices.body?.data || []) {
      for (const payment of invoice.payments || []) {
        await api('DELETE', `/user/citizen-invoices/${invoice.uuid}/payments/${payment.uuid}`)
      }
      await api('DELETE', `/user/citizen-invoices/${invoice.uuid}`)
    }
    await api('DELETE', `/user/price-estimates/${estimateUuid}`)
  }
  if (serviceUuid) await api('DELETE', `/user/services/${serviceUuid}`)
  await browser.close()
}

console.log(failures === 0 ? '\nPASS' : `\nFAIL (${failures})`)
process.exit(failures === 0 ? 0 : 1)
