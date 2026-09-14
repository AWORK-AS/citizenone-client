/**
 * Browser E2E for "Economy should be available for any company industry".
 *
 * The Economy nav item and its four tabs (overview, social-billing, revenue,
 * billing) used to be gated on company.industry.system_name being exactly
 * 'social_welfare' or 'employment_services', on top of the existing
 * page/module gates ("Management & Economy" page, "Billing"/"Revenue report"
 * company module). The industry check is now removed on both the frontend
 * (layouts/user.vue, pages/economy.vue, and the four tab guards) and the
 * backend (routes/user/authenticated.php + a new RequiresCompanyModule
 * middleware) - only the page/module gates remain.
 *
 * This proves it end-to-end for a company whose industry is 'dental' - not
 * one of the two previously-allowed industries - that has been granted the
 * "Management & Economy" page and the "Billing"/"Revenue report" company
 * modules: the Economy nav item appears, and all four tabs render.
 *
 * Read-only against a disposable test company/user created via tinker for
 * this run; writes nothing.
 *
 * Run:  see tests/e2e/README.md
 * Env:  CO_TOKEN (required, a user on a non-social_welfare/employment_services
 *       company with "Management & Economy"/"Billing"/"Revenue report"
 *       granted), CO_BASE_URL (default http://localhost:3001)
 */
import { chromium } from 'playwright-core'
import { fileURLToPath } from 'url'
import path from 'path'

const TOKEN = process.env.CO_TOKEN
const BASE = process.env.CO_BASE_URL || 'http://localhost:3001'
const SHOT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'screenshots')
const USER_FETCH_TIMEOUT = 60000

if (!TOKEN) {
  console.error('CO_TOKEN is required. See tests/e2e/README.md')
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

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } })

async function bootAndReload() {
  await Promise.all([
    page.waitForResponse((r) => r.url().endsWith('/api/user') && r.request().method() === 'GET', { timeout: USER_FETCH_TIMEOUT }),
    page.reload({ waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT }),
  ])
  await page.waitForTimeout(3000)
}

try {
  await page.goto(`${BASE}/overview`, { waitUntil: 'domcontentloaded', timeout: USER_FETCH_TIMEOUT })
  await page.evaluate((token) => localStorage.setItem('_token', token), TOKEN)
  await bootAndReload()

  const welcomeModal = page.getByText('Welcome to CitizenOne', { exact: false })
  if (await welcomeModal.isVisible().catch(() => false)) {
    await page.keyboard.press('Escape')
    await page.waitForTimeout(500)
  }

  console.log('sidebar nav')
  const economyLink = page.locator('nav .sidebar-item', { hasText: 'Economy' }).first()
  check('the Economy nav item is visible for a dental-industry company', await economyLink.isVisible().catch(() => false))

  await economyLink.click()
  await page.waitForURL('**/economy**', { timeout: USER_FETCH_TIMEOUT })
  await page.waitForTimeout(1500)

  console.log('economy tabs')
  const tabLabels = await page.locator('nav.border-b button').allInnerTexts()
  check('overview tab is present', tabLabels.some((l) => /overview|oversigt/i.test(l)), JSON.stringify(tabLabels))
  check('billing tab is present (social-billing or employment billing)', tabLabels.filter((l) => /billing|fakturering|afregning/i.test(l)).length > 0, JSON.stringify(tabLabels))
  check('revenue tab is present', tabLabels.some((l) => /revenue|omsætning/i.test(l)), JSON.stringify(tabLabels))
  check('exactly four tabs render (overview, social-billing, revenue, billing)', tabLabels.length === 4, JSON.stringify(tabLabels))

  await page.screenshot({ path: path.join(SHOT, 'economy-any-industry.png'), fullPage: true })
} catch (err) {
  failures++
  console.error('FAIL (exception):', err.message)
  await page.screenshot({ path: path.join(SHOT, 'economy-any-industry-error.png'), fullPage: true }).catch(() => {})
} finally {
  await browser.close()
}

console.log(failures ? `\n${failures} check(s) failed` : '\nall checks passed')
process.exit(failures ? 1 : 0)
