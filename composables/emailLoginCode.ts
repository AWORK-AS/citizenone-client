/**
 * Helpers for signing in with a 6-digit code sent by email (portal users).
 * Kept free of Vue and Nuxt so they can be unit tested on their own.
 */
export const EMAIL_CODE_LENGTH = 6
export const EMAIL_CODE_RESEND_SECONDS = 30

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isPlausibleEmail(value: unknown): boolean {
    return typeof value === 'string' && EMAIL_PATTERN.test(value.trim())
}

/** Whatever was typed or pasted (spaces, dashes, "123 456"), reduced to at most 6 digits. */
export function sanitizeEmailCode(raw: unknown): string {
    return String(raw ?? '').replace(/\D/g, '').slice(0, EMAIL_CODE_LENGTH)
}

/**
 * A code is submitted by itself once it is complete, and never twice in a row
 * with the same digits: a wrong code stays in the box, and without this the
 * form would re-send it on every re-render and burn the attempts the backend
 * allows before it locks.
 */
export function shouldSubmitEmailCode(code: string, lastSubmitted: string | null): boolean {
    return code.length === EMAIL_CODE_LENGTH && code !== lastSubmitted
}
