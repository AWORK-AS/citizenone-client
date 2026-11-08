/**
 * Unit tests for composables/staffTwoFactor.ts - two-factor sign-in for our own team.
 *
 *   node --test tests/unit/staffTwoFactor.test.mjs
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
    canResetTwoFactor,
    formatSecret,
    isChallengeExpired,
    isCompleteTotpCode,
    isStaffSetupRequired,
    isStaffTwoFactorChallenge,
    normalizeTotpCode,
    secondsLeft,
    secretFromOtpauthUrl,
    twoFactorStatus,
} from '../../composables/staffTwoFactor.ts'

const challenge = 'a'.repeat(64)

test('a challenge answer is recognised, a token answer is not', () => {
    assert.equal(isStaffTwoFactorChallenge({ token: null, two_factor_required: true, challenge }), true)
    assert.equal(isStaffTwoFactorChallenge({ token: 'x', user: {} }), false)
    assert.equal(isStaffTwoFactorChallenge({ token: 'x', two_factor_required: true, challenge }), false)
    assert.equal(isStaffTwoFactorChallenge({ two_factor_required: true }), false)
    assert.equal(isStaffTwoFactorChallenge(null), false)
})

test('codes keep only digits and stop at six', () => {
    assert.equal(normalizeTotpCode('123 456'), '123456')
    assert.equal(normalizeTotpCode('12-34-56-78'), '123456')
    assert.equal(normalizeTotpCode(null), '')
    assert.equal(normalizeTotpCode(42), '42')
})

test('a complete code is exactly six digits', () => {
    assert.equal(isCompleteTotpCode('123456'), true)
    assert.equal(isCompleteTotpCode('12345'), false)
    assert.equal(isCompleteTotpCode('1234567'), false)
    assert.equal(isCompleteTotpCode(123456), false)
})

test('only the staff setup refusal opens the staff setup', () => {
    assert.equal(isStaffSetupRequired({ code: 'two_factor_setup_required', scope: 'staff' }), true)
    assert.equal(isStaffSetupRequired({ code: 'two_factor_setup_required' }), false)
    assert.equal(isStaffSetupRequired({ code: 'unauthorized', scope: 'staff' }), false)
    assert.equal(isStaffSetupRequired(undefined), false)
})

test('an expired challenge is told apart from a wrong code', () => {
    assert.equal(isChallengeExpired({ code: 'two_factor_challenge_expired' }), true)
    assert.equal(isChallengeExpired({ code: 'invalid_two_factor_code' }), false)
})

test('the manual key is shown in groups of four', () => {
    assert.equal(formatSecret('abcdefghijkl'), 'ABCD EFGH IJKL')
    assert.equal(formatSecret('ABCDEFG'), 'ABCD EFG')
    assert.equal(formatSecret(''), '')
})

test('the secret is read from an otpauth URL', () => {
    assert.equal(secretFromOtpauthUrl('otpauth://totp/CitizenOne%20Admin:a%40b.dk?secret=JBSWY3DP&issuer=CitizenOne'), 'JBSWY3DP')
    assert.equal(secretFromOtpauthUrl('otpauth://totp/x?issuer=y'), '')
})

test('status follows is_google_2fa_enabled', () => {
    assert.equal(twoFactorStatus({ is_google_2fa_enabled: true }), 'on')
    assert.equal(twoFactorStatus({ is_google_2fa_enabled: false }), 'off')
    assert.equal(twoFactorStatus(null), 'off')
})

test('reset is offered to a team manager, for a colleague with 2FA, never for oneself', () => {
    const me = { uuid: 'me' }
    const colleague = { uuid: 'them', is_google_2fa_enabled: true }
    assert.equal(canResetTwoFactor(me, colleague, true), true)
    assert.equal(canResetTwoFactor(me, colleague, false), false)
    assert.equal(canResetTwoFactor(me, { ...colleague, is_google_2fa_enabled: false }, true), false)
    assert.equal(canResetTwoFactor(me, { uuid: 'me', is_google_2fa_enabled: true }, true), false)
    assert.equal(canResetTwoFactor(null, colleague, true), false)
})

test('seconds left never go below zero', () => {
    assert.equal(secondsLeft(10_000, 0), 10)
    assert.equal(secondsLeft(10_500, 10_000), 1)
    assert.equal(secondsLeft(0, 5_000), 0)
})
