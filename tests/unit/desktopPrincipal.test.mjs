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
 * The patient/citizen split is the interesting one: both are role `Citizen`
 * and only the company's industry tells them apart, the same rule
 * `resolvePostLoginRedirect` applies.
 *
 * No server, no browser, no build step:
 *
 *   node --test tests/unit/desktopPrincipal.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

const { principalFor } = await import('../../utils/desktopPrincipal.ts')

const dental = { company: { industry: { system_name: 'dental' } } }
const social = { company: { industry: { system_name: 'social_welfare' } } }

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

    test("a dental clinic's citizen is a patient, every other citizen is not", () => {
        assert.equal(principalFor({ role: 'Citizen', ...dental }), 'patient')
        assert.equal(principalFor({ role: 'Citizen', ...social }), 'citizen')
        assert.equal(principalFor({ role: 'Citizen' }), 'citizen')
    })

    test('a patient stays a patient once the portal payload replaces the login one', () => {
        // /patient carries no company or industry - it carries the clinic and
        // the sections a patient has. Reading the industry alone turned a
        // patient into a citizen the moment that refresh landed.
        assert.equal(principalFor({ role: 'Citizen', clinic: { name: 'Tandlægerne' } }), 'patient')
        assert.equal(
            principalFor({ role: 'Citizen', portal_visibility: { appointments: true, messages: true } }),
            'patient',
        )
        assert.equal(principalFor({ role: 'Citizen', upcoming_appointments_count: 0 }), 'patient')
    })

    test("a citizen's own portal payload is still a citizen", () => {
        assert.equal(
            principalFor({ role: 'Citizen', portal_visibility: { overview: true, protocols: true, messages: true } }),
            'citizen',
        )
    })

    test('the role can arrive on the roles array instead, as the store sometimes holds it', () => {
        assert.equal(principalFor({ roles: [{ name: 'Relative' }], ...social }), 'relative')
        assert.equal(principalFor({ roles: [{ name: 'Citizen' }], ...dental }), 'patient')
    })
})
