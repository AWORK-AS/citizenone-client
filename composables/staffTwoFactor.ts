/**
 * Pure helpers for two-factor sign-in of our own team (superadmin panel).
 *
 * Kept free of Nuxt auto-imports so they can be unit tested with `node --test`
 * (see tests/unit/staffTwoFactor.test.mjs).
 *
 * Nothing here is access control: the API decides who needs the code, who must set
 * 2FA up and who may reset it. These helpers only decide what the screen shows.
 */

export const TOTP_LENGTH = 6

/** The login answered with a challenge instead of a token: the code step is next. */
export function isStaffTwoFactorChallenge(data: any): boolean {
    return !!data
        && data.two_factor_required === true
        && typeof data.challenge === 'string'
        && data.challenge.length > 0
        && !data.token
}

/** Digits only, at most six: what an authenticator shows, pasted with or without a space. */
export function normalizeTotpCode(input: unknown): string {
    return String(input ?? '').replace(/\D/g, '').slice(0, TOTP_LENGTH)
}

export function isCompleteTotpCode(code: unknown): boolean {
    return typeof code === 'string' && /^\d{6}$/.test(code)
}

/** A 403 from EnsureStaffTwoFactor (not the company-required one for customers). */
export function isStaffSetupRequired(body: any): boolean {
    return body?.code === 'two_factor_setup_required' && body?.scope === 'staff'
}

/** The challenge ran out or was burnt by wrong codes: back to the first step. */
export function isChallengeExpired(error: any): boolean {
    return error?.code === 'two_factor_challenge_expired'
}

/** The manual key in groups of four, easier to type into an app. */
export function formatSecret(secret: unknown): string {
    return String(secret ?? '').replace(/\s+/g, '').toUpperCase().replace(/(.{4})(?=.)/g, '$1 ')
}

/** The secret from an otpauth:// URL, when only the URL is at hand. */
export function secretFromOtpauthUrl(url: unknown): string {
    const match = /[?&]secret=([^&]+)/i.exec(String(url ?? ''))
    return match ? decodeURIComponent(match[1]) : ''
}

export type TwoFactorStatus = 'on' | 'off'

export function twoFactorStatus(user: any): TwoFactorStatus {
    return user?.is_google_2fa_enabled ? 'on' : 'off'
}

/**
 * Whether to offer "reset 2FA" for a colleague: only to someone who manages the team,
 * only for a colleague who has 2FA on, and never for oneself (the API refuses all three).
 */
export function canResetTwoFactor(actor: any, target: any, canManageTeam: boolean): boolean {
    if (!canManageTeam || !actor || !target) return false
    if (!target.is_google_2fa_enabled) return false
    if (actor.uuid && target.uuid) return actor.uuid !== target.uuid
    return actor.id !== undefined && target.id !== undefined && actor.id !== target.id
}

/** Whole seconds left of a challenge that expires at `expiresAt` (ms), never negative. */
export function secondsLeft(expiresAt: number, now: number): number {
    return Math.max(0, Math.ceil((expiresAt - now) / 1000))
}
