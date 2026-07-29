import { test, expect } from '@playwright/test'

const EMAIL = 'e2e-dental-admin@example.com'
const PASSWORD = 'E2ePassword!23'

async function login(page: any) {
    await page.goto('/')
    await page.locator('#co-email').fill(EMAIL)
    await page.locator('#co-pw').fill(PASSWORD)
    await page.locator('form.form-card button[type="submit"]').click()
    await page.waitForURL('**/overview', { timeout: 20_000 })

    // First-login users see a "Welcome to CitizenOne" onboarding modal that
    // intercepts clicks on the rest of the page until dismissed.
    const welcomeModal = page.getByText('Welcome to CitizenOne')
    if (await welcomeModal.isVisible({ timeout: 3000 }).catch(() => false)) {
        await page.keyboard.press('Escape')
        await welcomeModal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})
    }
}

async function selectMultiselectOption(page: any, containerId: string, optionText: string) {
    const container = page.locator(`#${containerId}`).locator('xpath=ancestor::div[contains(@class,"multiselect")][1]')
    await container.click()
    await page.locator('.multiselect-option', { hasText: optionText }).first().click()
}

test.describe('Dental patient profile', () => {
    test('shows dental section only for dental-industry companies, saves and persists all fields', async ({ page }) => {
        await login(page)

        await page.goto('/citizens/new')
        await expect(page.getByText('Dental profile')).toBeVisible()

        const firstname = `E2E-Dental-${Date.now()}`
        await page.locator('input[name="firstname"], #firstname').first().fill(firstname)

        // Checkbox: member of Sygeforsikringen "danmark"
        await page.getByText('Member of Sygeforsikringen "danmark"').click()

        // Sygesikring group dropdown
        await selectMultiselectOption(page, 'sygesikring_group', 'Group 1')

        // Patient number
        await page.locator('#patient_number').fill('P-E2E-1001')

        // Municipal subsidy
        await page.locator('#municipal_subsidy').fill('Full subsidy')

        // Last check-up date: open flatpickr calendar and click "today"
        await page.locator('#last_checkup_date').click()
        await page.locator('.flatpickr-calendar.open .flatpickr-day.today').click()

        // Checkup interval dropdown
        await selectMultiselectOption(page, 'checkup_interval_months', 'Every 6 months')

        const [response] = await Promise.all([
            page.waitForResponse((res: any) => res.url().includes('/api/user/citizens') && res.request().method() === 'POST'),
            page.getByRole('button', { name: /save/i }).click(),
        ])
        if (!response.ok()) {
            console.log('CREATE CITIZEN FAILED', response.status(), await response.text().catch(() => '<no body>'))
        }
        expect(response.ok()).toBeTruthy()

        const body = await response.json()
        const citizenUuid = body?.data?.uuid
        expect(citizenUuid).toBeTruthy()

        await page.waitForURL('**/citizens', { timeout: 20_000 })

        // Reload the newly created citizen directly via its edit page
        await page.goto(`/citizens/${citizenUuid}/edit`)

        await expect(page.getByText('Dental profile')).toBeVisible()
        await expect(page.locator('#patient_number')).toHaveValue('P-E2E-1001')
        await expect(page.locator('#municipal_subsidy')).toHaveValue('Full subsidy')

        const checkbox = page.locator('#is_member_of_sygeforsikring_danmark')
        await expect(checkbox).toBeChecked()

        // Dropdown selections and the date must also round-trip correctly.
        const sygesikringWrapper = page.locator('#sygesikring_group').locator('xpath=ancestor::div[contains(@class,"multiselect")][1]')
        await expect(sygesikringWrapper).toContainText('Group 1')

        const intervalWrapper = page.locator('#checkup_interval_months').locator('xpath=ancestor::div[contains(@class,"multiselect")][1]')
        await expect(intervalWrapper).toContainText('Every 6 months')

        const today = new Date()
        const expectedDatePart = String(today.getFullYear())
        await expect(page.locator('#last_checkup_date')).toHaveValue(new RegExp(expectedDatePart))
    })

    test('dental section is hidden for non-dental-industry companies', async ({ page }) => {
        await page.goto('/')
        await page.locator('#co-email').fill('e2e-nondental-admin@example.com')
        await page.locator('#co-pw').fill('E2ePassword!23')
        await page.locator('form.form-card button[type="submit"]').click()
        await page.waitForURL('**/overview', { timeout: 20_000 })

        const welcomeModal = page.getByText('Welcome to CitizenOne')
        if (await welcomeModal.isVisible({ timeout: 3000 }).catch(() => false)) {
            await page.keyboard.press('Escape')
            await welcomeModal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})
        }

        await page.goto('/citizens/new')
        await expect(page.locator('input[name="firstname"], #firstname').first()).toBeVisible()
        await expect(page.getByText('Dental profile')).toHaveCount(0)
        await expect(page.locator('#patient_number')).toHaveCount(0)
    })
})
