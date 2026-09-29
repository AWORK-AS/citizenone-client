/**
 * Unit tests for utils/desktopPrincipal.ts -- what the Electron shell is told
 * about who is signed in.
 *
 * The desktop window loads this same app for everyone and the portals work in
 * it, but the chrome outside the window did not know the difference: the Dock
 * offered "Ny samtale", "Ny note" and recently viewed citizens, ⌘, opened the
 * company settings and ⌘⇧N a journal-note composer - staff routes a portal
 * user's token is refused by.
 *
 * The patient/citizen split is the interesting one: both are role `Citizen`,
 * because the patient portal is the same principal behind a paid app. What
 * tells them apart is `is_patient_portal`, which the server resolves from the
 * entitlement its own routes are gated on - the same field
 * `resolvePostLoginRedirect` routes on. It used to be guessed from the company
 * industry. AW-2026-5434.
 *
 * No server, no browser, no build step:
 *
 *   node --test tests/unit/desktopPrincipal.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

const { principalFor } = await import('../../utils/desktopPrincipal.ts')

const social = { company: { industry: { system_name: 'social_welfare' } } }
const dental = { company: { industry: { system_name: 'dental' } } }

describe('principalFor', () => {
    test('a member of staff is staff', () => {
        assert.equal(principalFor({ role: 'Admin', ...social }), 'staff')
        assert.equal(principalFor({ role: 'User', ...social }), 'staff')
    })

    test('signed out is staff too, which is what the login screen leads to', () => {
        assert.equal(principalFor(null), 'staff')
        assert.equal(principalFor(undefined), 'staff')
        assert.equal(principalFor({}), 'staff')
    })

    test('a relative and a third party are their own portals', () => {
        assert.equal(principalFor({ role: 'Relative', ...social }), 'relative')
        assert.equal(principalFor({ role: 'ThirdParty', ...social }), 'third-party')
    })

    test('a citizen whose company bought the patient portal is a patient', () => {
        assert.equal(principalFor({ role: 'Citizen', is_patient_portal: true }), 'patient')
        assert.equal(principalFor({ role: 'Citizen', is_patient_portal: false }), 'citizen')
        assert.equal(principalFor({ role: 'Citizen' }), 'citizen')
    })

    test('the industry does not decide it, which is the bug this replaced', () => {
        // A dental clinic that never bought the app has ordinary citizens, and
        // a non-dental clinic that did buy it has patients. Reading the
        // industry got both of those backwards.
        assert.equal(principalFor({ role: 'Citizen', ...dental }), 'citizen')
        assert.equal(principalFor({ role: 'Citizen', ...dental, is_patient_portal: false }), 'citizen')
        assert.equal(principalFor({ role: 'Citizen', ...social, is_patient_portal: true }), 'patient')
    })

    test('a patient stays a patient once the portal payload replaces the login one', () => {
        // /patient carries no company or industry - it carries the clinic, the
        // sections a patient has, and the flag. Before the flag was on that
        // payload the refresh turned a patient back into a citizen.
        assert.equal(
            principalFor({ role: 'Citizen', is_patient_portal: true, clinic: { name: 'Tandlægerne' } }),
            'patient',
        )
    })

    test("a citizen's own portal payload is still a citizen", () => {
        assert.equal(
            principalFor({
                role: 'Citizen',
                is_patient_portal: false,
                portal_visibility: { overview: true, protocols: true, messages: true },
            }),
            'citizen',
        )
    })

    test('the role can arrive on the roles array instead, as the store sometimes holds it', () => {
        assert.equal(principalFor({ roles: [{ name: 'Relative' }], ...social }), 'relative')
        assert.equal(principalFor({ roles: [{ name: 'Citizen' }], is_patient_portal: true }), 'patient')
    })
})
