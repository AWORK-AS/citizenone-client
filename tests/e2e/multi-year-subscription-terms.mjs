/**
 * Browser E2E for multi-year (`term_years`) subscription/license/app-license
 * terms in superadmin.
 *
 * A client bought a 3-year deal on the Pro plan, plus 3-year deals on 6 extra
 * user licenses and 8 AI licenses - but superadmin could only ever create
 * 1-year deals, with the invoiced amount always a single year's price no
 * matter how long the real contract was. `term_years` was added to "Add
 * subscription", "Grant licenses" and "Grant AI license" so a longer contract
 * multiplies the price correctly, but only for a one-off manual invoice
 * billed yearly - a card-recurring subscription is charged per cycle by
 * Nexi, so a multi-year term never applies there.
 *
 * What this proves that the backend PHPUnit coverage cannot:
 * 1. The "Contract length (years)" field only appears where it's supposed to
 *    (Yearly + Manual invoice) and stays hidden for Monthly or card billing -
 *    the actual conditional rendering in the Vue components, not just the
 *    repository math.
 * 2. The price preview the superadmin sees *before* clicking Save already
 *    reflects the multiplier - unit price, VAT, service fee and total.
 * 3. All three flows - the base Deal subscription, extra user licenses, and
 *    an AI/app license - end up billed and stored correctly end to end, in
 *    the same sequence as the real request: Pro + 6 licenses + 8 AI seats,
 *    all on a 3-year term.
 *
 * There is no API to create or delete a Company, and no list endpoint for a
 * non-storage AddOnDeal's price, so the company/admin/app fixtures and the
 * Extra User AddOnDeal price come from a one-time `php artisan tinker`
 * snippet (see tests/e2e/README.md) rather than being created here. Cleanup
 * revokes every seat this run granted - including the base plan's own row -
 * through the real "remove license" action, so the fixture company is left
 * exactly as it was found and the script can be re-run.
 *
 * Run:  see tests/e2e/README.md
 * Env:  CO_TOKEN (required, superadmin), CO_COMPANY_UUID (required, a company
 *       with NO active Deal subscription), CO_APPLICATION_UUID (required, a
 *       paid quantifiable Application), CO_EXTRA_USER_YEARLY_PRICE (required,
 *       the "Extra User" AddOnDeal's yearly_price), CO_BASE_URL (default
 *       http://localhost:3001), CO_API_URL (default http://localhost:8001)
 */
import { chromium } from 'playwright-core'
import { fileURLToPath } from 'url'
import path from 'path'

const TOKEN = process.env.CO_TOKEN
const COMPANY = process.env.CO_COMPANY_UUID
const APPLICATION = process.env.CO_APPLICATION_UUID
const EXTRA_USER_YEARLY_PRICE = Number(process.env.CO_EXTRA_USER_YEARLY_PRICE)
const BASE = process.env.CO_BASE_URL || 'http://localhost:3001'
const API = process.env.CO_API_URL || 'http://localhost:8001'
const SHOT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'screenshots')
const USER_FETCH_TIMEOUT = 60000

if (!TOKEN || !COMPANY || !APPLICATION || !EXTRA_USER_YEARLY_PRICE) {
  console.error('CO_TOKEN, CO_COMPANY_UUID, CO_APPLICATION_UUID and CO_EXTRA_USER_YEARLY_PRICE are all required. See tests/e2e/README.md')
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

// Mirrors useAmountFormatter()'s own parseAmount(): "DKK 14,364.00" (en) or
// "DKK 14.364,00" (dk/no/sv) - comma-before-2-digits means comma is the
// decimal separator, otherwise period is.
function parseAmount(text) {
  const numeric = (text || '').replace(/[^0-9.,]/g, '').trim()
  if (/,\d{1,2}$/.test(numeric)) {
    return parseFloat(numeric.replace(/\./g, '').replace(',', '.'))
  }
  return parseFloat(numeric.replace(/,/g, ''))
}

function latestInvoice(list) {
  return (list || []).reduce((latest, inv) => (!latest || inv.id > latest.id ? inv : latest), null)
}

// findCompanyInvoices() paginates ascending by id with a hardcoded per_page
// (both ?sortOrder=desc and ?per_page= are silently ignored - a pre-existing
// quirk unrelated to this feature), so the newest invoice is always on the
// LAST page, not necessarily page 1. Read meta.last_page from page 1, then
// fetch that page directly (a plain ?page= IS honored, since paginate()
// itself reads it) rather than trying to force a sort/page-size override.
async function fetchLatestInvoiceForCompany(company) {
  const firstPage = await api('GET', `/superadmin/companies/${company}/invoices`)
  const lastPageNum = firstPage.body?.meta?.last_page ?? 1
  const target = lastPageNum > 1
    ? await api('GET', `/superadmin/companies/${company}/invoices?page=${lastPageNum}`)
    : firstPage
  return latestInvoice(target.body?.data)
}

// Scoped to the open dialog so a stray "Total"/"VAT" elsewhere on the page
// behind the modal overlay (e.g. a licenses table) can never match instead.
async function previewRow(page, label) {
  const row = page.locator('[role="dialog"] div.flex.justify-between', { hasText: label }).last()
  const text = await row.locator('span').nth(1).innerText()
  return parseAmount(text)
}

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } })

const createdLicenseUuids = []
let baseSubscriptionUuid = null
let grantedAppSeats = 0

try {
  console.log('checking the fixture company has no active subscription')
  const initialSubscription = await api('GET', `/superadmin/companies/${COMPANY}/subscriptions`)
  // findSubscriptions() returns `{ data: [] }` when there is none, and
  // `{ data: {...} }` (a UserSubscriptionResource, not an array) when there is.
  const hasActiveDeal = !!initialSubscription.body?.data && !Array.isArray(initialSubscription.body.data)
  if (hasActiveDeal) {
    console.error('CO_COMPANY_UUID already has an active Deal subscription - a previous run likely did not clean up. Reset it via superadmin or a fresh tinker fixture before re-running.')
    process.exit(1)
  }

  // The superadmin layout bootstraps via GET /api/superadmin (UserController::
  // currentUser), not /api/user like the "user"-role layout other e2e tests
  // in this suite authenticate against - and since the layout only mounts
  // once (Nuxt keeps it alive across route changes within the same layout),
  // that request only ever fires on this first load, not on every navigation.
  await page.goto(`${BASE}/superadmin/dashboard`, { waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT })
  await page.evaluate((token) => localStorage.setItem('_token', token), TOKEN)
  await Promise.all([
    page.waitForResponse((r) => r.url().endsWith('/api/superadmin') && r.request().method() === 'GET', { timeout: USER_FETCH_TIMEOUT }),
    page.reload({ waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT }),
  ])
  await page.waitForTimeout(3000)
  await page.goto(`${BASE}/superadmin/companies/${COMPANY}/license-overview`, { waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT })
  await page.waitForTimeout(4000)

  // --- Step 1: UI-only guard checks on "Add subscription" -----------------
  console.log('checking the term-length field only shows for yearly + manual invoice')
  await page.locator('button', { hasText: 'Add subscription' }).first().click()
  await page.waitForTimeout(1200)

  const termInput = page.locator('#add_subscription_term_years')
  check('hidden with Monthly + Manual invoice (the default)', await termInput.count() === 0)

  await page.locator('[aria-label="Frequency"] >> text=Yearly').click()
  await page.waitForTimeout(300)
  check('shown with Yearly + Manual invoice, defaulting to 1', await termInput.count() === 1 && await termInput.inputValue() === '1')

  await page.locator('[aria-label="Billing method"] >> text=Customer pays by card').click()
  await page.waitForTimeout(300)
  check('hidden again with Yearly + Payment card', await page.locator('#add_subscription_term_years').count() === 0)

  await page.locator('[aria-label="Billing method"] >> text=Manual invoice').click()
  await page.waitForTimeout(300)
  check('reappears switching back to Manual invoice', await page.locator('#add_subscription_term_years').count() === 1)

  // --- Step 2: Add subscription - Pro, yearly, manual invoice, 3-year term ---
  console.log('adding a 3-year Pro subscription')
  const deals = await api('GET', '/superadmin/deals/all/list')
  const proDeal = (deals.body?.data || []).find((d) => d.name === 'Pro')
  if (!proDeal) {
    console.error('No "Pro" Deal found via /superadmin/deals/all/list - cannot compute the expected price.')
    process.exit(1)
  }
  const expectedDealUnitPrice = Number(proDeal.yearly_price) * 3
  const expectedDealTax = expectedDealUnitPrice * 0.25
  const expectedDealServiceFee = 295
  const expectedDealTotal = expectedDealUnitPrice * 1.25 + expectedDealServiceFee

  await page.locator('[aria-label="Plan"] >> text=Pro').click()
  await page.waitForTimeout(300)
  await page.locator('#add_subscription_term_years').fill('3')
  await page.waitForTimeout(300)

  check('unit price preview = yearly price x 3', await previewRow(page, 'Plan price') === expectedDealUnitPrice)
  check('VAT preview = unit price x 25%', await previewRow(page, 'VAT') === expectedDealTax)
  check('service fee preview = 295 (default, not via Leverandørservice)', await previewRow(page, 'Service fee') === expectedDealServiceFee)
  check('total preview = unit price x 1.25 + service fee', await previewRow(page, 'Total') === expectedDealTotal)
  await page.screenshot({ path: `${SHOT}/multi-year-add-subscription-preview.png` })

  await page.locator('button', { hasText: 'Save' }).last().click()
  await page.waitForTimeout(3000)

  const dealInvoice = await fetchLatestInvoiceForCompany(COMPANY)
  const dealLine = (dealInvoice?.invoice_details || []).find((d) => d.deal_type?.includes('Deal') && !d.deal_type?.includes('AddOn'))
  check('invoice stores term_years = 3', dealInvoice?.term_years === 3, JSON.stringify(dealInvoice?.term_years))
  check('invoice line price = yearly price x 3', Number(dealLine?.price) === expectedDealUnitPrice, String(dealLine?.price))
  check('invoice total = computed total', Number(dealInvoice?.total_amount) === expectedDealTotal, String(dealInvoice?.total_amount))

  await Promise.all([
    page.waitForResponse((r) => r.url().endsWith('/api/superadmin') && r.request().method() === 'GET', { timeout: USER_FETCH_TIMEOUT }),
    page.reload({ waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT }),
  ])
  await page.waitForTimeout(4000)
  const afterDealText = await page.locator('main').innerText()
  check('the "No Active Subscription" card is gone', !afterDealText.includes('No Active Subscription'))
  check('the Pro plan now shows as active', afterDealText.includes('Pro'))

  const subscriptionAfterDeal = await api('GET', `/superadmin/companies/${COMPANY}/subscriptions`)
  baseSubscriptionUuid = subscriptionAfterDeal.body?.data?.uuid ?? null
  check('base subscription seat is resolvable for later cleanup', !!baseSubscriptionUuid)
  if (baseSubscriptionUuid) createdLicenseUuids.push(baseSubscriptionUuid)

  // --- Step 3: Grant 6 extra user licenses, inherited yearly, 3-year term ---
  console.log('granting 6 extra user licenses on a 3-year term')
  await page.locator('button', { hasText: 'Add licenses' }).first().click()
  await page.waitForTimeout(1000)

  check('billing is fixed to the inherited yearly frequency, not a picker', await page.locator('[role="dialog"] >> text=Billing: Yearly').count() > 0)
  const grantTermInput = page.locator('#grant_term_years')
  check('term-length field auto-appears since the inherited billing is yearly', await grantTermInput.count() === 1)

  await page.fill('#grant_quantity', '6')
  await grantTermInput.fill('3')
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${SHOT}/multi-year-grant-licenses.png` })

  await page.locator('button', { hasText: 'Save' }).last().click()
  await page.waitForTimeout(3000)

  const expectedAddOnUnitPrice = EXTRA_USER_YEARLY_PRICE * 3
  const licenseInvoice = await fetchLatestInvoiceForCompany(COMPANY)
  const licenseLine = (licenseInvoice?.invoice_details || []).find((d) => d.deal_type?.includes('AddOn'))
  check('invoice stores term_years = 3', licenseInvoice?.term_years === 3, JSON.stringify(licenseInvoice?.term_years))
  check('invoice line price = extra-user yearly price x 3', Number(licenseLine?.price) === expectedAddOnUnitPrice, String(licenseLine?.price))
  check('invoice line quantity = 6', Number(licenseLine?.quantity) === 6, String(licenseLine?.quantity))

  // The Pro plan's included free seats (topUpIncludedSeats(), granted when
  // the subscription itself was added) are also AddOnDeal-type rows, so
  // filtering on deal_type alone would include them too - they're unpaid and
  // correctly left at the default term_years=1, so filtering on term_years=3
  // isolates exactly the 6 seats this grant just paid for.
  const userLicensesTyped = await api('GET', `/superadmin/companies/${COMPANY}/licenses?type=user`)
  const licenseRows = (userLicensesTyped.body?.data?.data ?? userLicensesTyped.body?.data ?? [])
  const addOnSeats = licenseRows.filter((l) => l.deal_type?.includes('AddOn'))
  const newPaidSeats = addOnSeats.filter((s) => s.term_years === 3)
  const includedFreeSeats = addOnSeats.filter((s) => s.term_years === 1)
  check('6 new paid license seats were created, each with term_years = 3', newPaidSeats.length === 6, String(newPaidSeats.length))
  check('the plan-included free seats are untouched (still term_years = 1)', includedFreeSeats.length > 0, String(includedFreeSeats.length))
  for (const seat of newPaidSeats) createdLicenseUuids.push(seat.uuid)

  // --- Step 4: Grant 8 AI/app license seats, inherited yearly, 3-year term ---
  console.log('granting 8 AI license seats on a 3-year term')
  await Promise.all([
    page.waitForResponse((r) => r.url().endsWith('/api/superadmin') && r.request().method() === 'GET', { timeout: USER_FETCH_TIMEOUT }),
    page.goto(`${BASE}/superadmin/companies/${COMPANY}/apps`, { waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT }),
  ])
  await page.waitForTimeout(4000)

  await page.locator('button', { hasText: 'Grant license' }).first().click()
  await page.waitForTimeout(1000)

  const apps = await api('GET', '/superadmin/apps?per_page=1000')
  const app = (apps.body?.data || []).find((a) => a.uuid === APPLICATION)
  if (!app) {
    console.error(`Application ${APPLICATION} not found via /superadmin/apps - check CO_APPLICATION_UUID.`)
    process.exit(1)
  }
  const expectedAppUnitPrice = Number(app.yearly_price) * 3

  await page.locator('button', { hasText: app.name }).first().click()
  await page.waitForTimeout(500)
  await page.locator('input[type="number"]').first().fill('8')
  await page.waitForTimeout(500)

  const appPanel = page.locator('.fixed.inset-y-0.right-0.z-50')
  check('billing is fixed to the inherited yearly frequency, not a picker', await appPanel.locator('text=Billing:').count() > 0)
  const appTermInput = page.locator('#grant_app_license_term_years')
  check('term-length field auto-appears (manual invoice default + inherited yearly)', await appTermInput.count() === 1)
  await appTermInput.fill('3')
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${SHOT}/multi-year-grant-app-license.png` })

  await page.locator('button', { hasText: 'Grant license' }).last().click()
  await page.waitForTimeout(3000)

  const appInvoice = await fetchLatestInvoiceForCompany(COMPANY)
  const appLine = (appInvoice?.invoice_details || []).find((d) => d.deal_type?.includes('Application'))
  check('invoice stores term_years = 3', appInvoice?.term_years === 3, JSON.stringify(appInvoice?.term_years))
  check('invoice line price = app yearly price x 3', Number(appLine?.price) === expectedAppUnitPrice, String(appLine?.price))
  check('invoice line quantity = 8', Number(appLine?.quantity) === 8, String(appLine?.quantity))

  const seatCounts = await api('GET', `/superadmin/companies/${COMPANY}/apps/${APPLICATION}/seats`)
  check('seat total reflects the 8 granted seats', Number(seatCounts.body?.data?.total) >= 8, JSON.stringify(seatCounts.body?.data))
  grantedAppSeats = 8
} finally {
  console.log('cleaning up - revoking every seat this run granted')
  // The 8 Application seats are unassigned pool seats (no user_id), so they
  // never show up via the /licenses listing (which only returns seats
  // whereHas('user', ...)) - adjustApplicationLicenseQuantity is the one
  // endpoint that finds pool seats by company_id/deal_id directly, so it's
  // the only way to revoke them. Revoke seats first, the base plan's own row
  // last (its own removal is what flips the company back to "no active
  // subscription").
  if (grantedAppSeats > 0) {
    await api('PATCH', `/superadmin/companies/${COMPANY}/apps/${APPLICATION}/quantity`, { delta: -grantedAppSeats })
  }
  const orderedUuids = createdLicenseUuids.filter((uuid, i) => createdLicenseUuids.indexOf(uuid) === i)
    .sort((a) => (a === baseSubscriptionUuid ? 1 : -1))
  for (const uuid of orderedUuids) {
    await api('DELETE', `/superadmin/companies/${COMPANY}/licenses/${uuid}`)
  }
  await browser.close()
}

console.log(failures === 0 ? '\nPASS' : `\nFAIL (${failures})`)
process.exit(failures === 0 ? 0 : 1)
