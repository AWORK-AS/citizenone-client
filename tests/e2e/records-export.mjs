/**
 * Browser E2E for Roadmap #396: exporting use of force and incidents.
 *
 * What this proves:
 * 1. On a citizen: Report -> See previous use of force -> Export -> Excel
 *    downloads an .xlsx for that citizen only (citizen_uuid sent).
 * 2. On the statistics page: the incident card's Export -> CSV downloads a
 *    .csv for every citizen (no citizen_uuid), with a BOM and semicolons; the
 *    draft is left out, and comes along with "Include drafts" ticked.
 *
 * Needs a company with an admin (CO_TOKEN) and a citizen (CO_CITIZEN_UUID)
 * that has a use of force, an incident titled "E2E hændelse" and a draft
 * titled "E2E kladde", both dated in the statistics page's period (this week).
 * The admin must have both statistics cards switched on under Show / hide
 * (users.daily_overview_filter: showIncidentStatistics, showUseOfForceStatistics).
 * It creates nothing.
 *
 * Run:  see tests/e2e/README.md
 * Env:  CO_TOKEN (required), CO_CITIZEN_UUID (required),
 *       CO_BASE_URL (default http://localhost:3001), CO_SHOT_DIR (default tests/e2e/screenshots)
 */
import { chromium } from 'playwright-core'
import { fileURLToPath } from 'url'
import { readFileSync } from 'fs'
import path from 'path'

const TOKEN = process.env.CO_TOKEN
const CITIZEN = process.env.CO_CITIZEN_UUID
const BASE = process.env.CO_BASE_URL || 'http://localhost:3001'
const SHOT = process.env.CO_SHOT_DIR || path.join(path.dirname(fileURLToPath(import.meta.url)), 'screenshots')
const TIMEOUT = 60000

if (!TOKEN || !CITIZEN) {
  console.error('CO_TOKEN and CO_CITIZEN_UUID are required. See the header of this file.')
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
const context = await browser.newContext({ viewport: { width: 1500, height: 1000 }, acceptDownloads: true })
const page = await context.newPage()
const problems = []
page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`))
page.on('console', (m) => { if (/recordsExport\./.test(m.text())) problems.push(m.text().slice(0, 200)) })

async function open(route, waitFor) {
  await Promise.all([
    page.waitForResponse((r) => r.url().endsWith('/api/user') && r.request().method() === 'GET', { timeout: TIMEOUT }),
    page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: TIMEOUT }),
  ])
  if (waitFor) await page.locator(waitFor).first().waitFor({ timeout: TIMEOUT })
  await page.waitForTimeout(2000)
  const gotIt = page.locator('#headlessui-portal-root').getByRole('button', { name: /^(got it|forstået|forstått|uppfattat|ok)$/i })
  if (await gotIt.count()) {
    await gotIt.first().click()
    await page.waitForTimeout(500)
  }
}

/** Clicks Download and returns the file, the export request's URL and the saved path. */
async function download(name) {
  const modal = page.locator('[data-testid="records-export-modal"]')
  const [file, request] = await Promise.all([
    page.waitForEvent('download', { timeout: TIMEOUT }),
    page.waitForRequest((r) => /\/(citizen-use-of-force|citizen-incidents)\/export\?/.test(r.url()), { timeout: TIMEOUT }),
    modal.locator('[data-testid="records-export-download"]').click(),
  ])
  const saved = path.join(SHOT, name)
  await file.saveAs(saved)
  return { file, url: new URL(request.url()), bytes: readFileSync(saved) }
}

try {
  await page.goto(`${BASE}/overview`, { waitUntil: 'domcontentloaded', timeout: TIMEOUT })
  await page.evaluate((token) => localStorage.setItem('_token', token), TOKEN)

  console.log('a citizen: use of force -> Export -> Excel')
  // A full load straight onto the journal tab can land on the timeline: the tabs
  // check the user before /api/user has answered. Load the citizen first, then
  // move to the journal tab inside the app, with the user known.
  await open(`/citizens/${CITIZEN}/timeline`)
  await page.waitForFunction(() => {
    const u = document.querySelector('#__nuxt')?.__vue_app__?.config?.globalProperties?.$pinia?.state?.value?.userStore?.user
    return Array.isArray(u?.pages) && u.pages.length > 0
  }, null, { timeout: TIMEOUT })
  await page.evaluate((uuid) => document.querySelector('#__nuxt').__vue_app__.config.globalProperties.$router.push(`/citizens/${uuid}/journals`), CITIZEN)
  await page.waitForURL('**/journals', { timeout: TIMEOUT })
  const reportButton = page.getByRole('button', { name: /^(Report|Indberet|Rapporter|Rapportera)$/ }).first()
  await reportButton.waitFor({ timeout: TIMEOUT })
  await reportButton.click()
  await page.getByRole('menuitem', { name: /See previous use of force|Se tidligere magtanvendelse/i }).first().click()
  await page.locator('[data-testid="use-of-force-export"]').click()
  const modal = page.locator('[data-testid="records-export-modal"]')
  await modal.waitFor({ timeout: 10000 })
  check('a citizen export has no department choice', (await modal.locator('[data-testid="records-export-department"]').count()) === 0)
  check('use of force has no drafts box', (await modal.locator('[data-testid="records-export-drafts"]').count()) === 0)
  await page.screenshot({ path: `${SHOT}/records-export-citizen-modal.png` })
  const xlsx = await download('records-export-citizen.xlsx')
  check('an .xlsx downloads', xlsx.file.suggestedFilename().endsWith('.xlsx'), xlsx.file.suggestedFilename())
  check('the file is a real workbook', xlsx.bytes.subarray(0, 2).toString() === 'PK')
  check('only this citizen was asked for', xlsx.url.searchParams.get('citizen_uuid') === CITIZEN && xlsx.url.searchParams.get('format') === 'xlsx', xlsx.url.search)
  check('the window closes after the download', await modal.waitFor({ state: 'hidden', timeout: 10000 }).then(() => true, () => false))

  console.log('statistics: the incident card -> Export -> CSV')
  await open('/statistics', '[data-testid="incident-statistics-export"]')
  check('the use-of-force card has an Export button too', (await page.locator('[data-testid="use-of-force-statistics-export"]').count()) === 1)
  await page.locator('[data-testid="incident-statistics-export"]').click()
  await modal.waitFor({ timeout: 10000 })
  check('the company-wide export offers a department', (await modal.locator('[data-testid="records-export-department"]').count()) === 1)
  await modal.locator('[data-testid="records-export-format-csv"]').click()
  await page.screenshot({ path: `${SHOT}/records-export-statistics-modal.png` })
  const csv = await download('records-export-incidents.csv')
  const text = csv.bytes.toString('utf8')
  check('a .csv downloads', csv.file.suggestedFilename().endsWith('.csv'), csv.file.suggestedFilename())
  check('every citizen was asked for', !csv.url.searchParams.has('citizen_uuid') && csv.url.searchParams.get('format') === 'csv', csv.url.search)
  check('it starts with a BOM and uses semicolons', csv.bytes.subarray(0, 3).equals(Buffer.from([0xef, 0xbb, 0xbf])) && text.split('\r\n')[0].includes('";"'), JSON.stringify(text.slice(0, 80)))
  check('æøå are intact', /Bodil Ærøsen/.test(text) && /Beskrivelse med æøå/.test(text))
  check('the incident is there, the draft is not', /E2E hændelse/.test(text) && !/E2E kladde/.test(text))

  console.log('with "Include drafts"')
  await page.locator('[data-testid="incident-statistics-export"]').click()
  await modal.waitFor({ timeout: 10000 })
  await modal.locator('[data-testid="records-export-format-csv"]').click()
  await modal.locator('[data-testid="records-export-drafts"]').check()
  const withDrafts = await download('records-export-incidents-drafts.csv')
  check('the draft comes along', /E2E kladde/.test(withDrafts.bytes.toString('utf8')) && withDrafts.url.searchParams.get('include_drafts') === '1', withDrafts.url.search)

  check('no page errors and no untranslated texts', problems.length === 0, problems.slice(0, 3).join(' | '))
} finally {
  await browser.close()
}

console.log(failures === 0 ? '\nPASS' : `\nFAIL (${failures})`)
process.exit(failures === 0 ? 0 : 1)
