/**
 * Unit tests for composables/postLoginRedirect.ts -- where a sign-in lands.
 *
 * The patient/citizen split is the interesting one: both are role `Citizen`,
 * because the patient portal is the same principal behind a paid app. It used
 * to be guessed from the company industry being `dental`, which is not the
 * predicate the API gates /patient on - it gates on the `patient-access` app
 * being bought. A non-dental clinic that had paid for it was sent to the
 * citizen portal, where its sections are switched off, and a dental clinic
 * that had not was sent to a patient portal its token is refused by.
 * AW-2026-5434.
 *
 * `useRoute` is a Nuxt auto-import, so it is stubbed on globalThis here.
 *
 *   node --test tests/unit/postLoginRedirect.test.mjs
 */
import { test, describe, beforeEach } from 'node:test'
import assert from 'node:assert/strict'

let query = {}
globalThis.useRoute = () => ({ query })

const { resolvePostLoginRedirect } = await import('../../composables/postLoginRedirect.ts')

describe('resolvePostLoginRedirect', () => {
    beforeEach(() => {
        query = {}
    })

    test('a deep link wins over the role default', () => {
        query = { redirect: '/citizen/messages/42' }
        assert.equal(resolvePostLoginRedirect('Citizen', { is_patient_portal: true }), '/citizen/messages/42')
    })

    test('a protocol-relative redirect is refused, so it cannot leave the site', () => {
        query = { redirect: '//evil.example.com' }
        assert.equal(resolvePostLoginRedirect('Citizen', { is_patient_portal: true }), '/patient/overview')
    })

    test('a citizen whose company bought the patient portal lands in it', () => {
        assert.equal(resolvePostLoginRedirect('Citizen', { is_patient_portal: true }), '/patient/overview')
        assert.equal(resolvePostLoginRedirect('Citizen', { is_patient_portal: false }), '/citizen/overview')
        assert.equal(resolvePostLoginRedirect('Citizen', {}), '/citizen/overview')
        assert.equal(resolvePostLoginRedirect('Citizen'), '/citizen/overview')
    })

    test('the industry does not decide it, which is the bug this replaced', () => {
        const dental = { company: { industry: { system_name: 'dental' } } }
        const social = { company: { industry: { system_name: 'social_welfare' } } }

        assert.equal(resolvePostLoginRedirect('Citizen', dental), '/citizen/overview')
        assert.equal(
            resolvePostLoginRedirect('Citizen', { ...social, is_patient_portal: true }),
            '/patient/overview',
        )
    })

    test('the other portals and staff are unchanged', () => {
        assert.equal(resolvePostLoginRedirect('Relative'), '/relative/citizens')
        assert.equal(resolvePostLoginRedirect('ThirdParty'), '/third-party/messages')
        assert.equal(resolvePostLoginRedirect('Admin'), '/overview')
        assert.equal(resolvePostLoginRedirect(undefined), '/overview')
    })
})
