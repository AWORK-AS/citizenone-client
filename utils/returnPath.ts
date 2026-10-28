/**
 * A `return_to` query value that is safe to navigate back to after a form is
 * saved: an in-app path only. Anything else (another origin, a protocol-relative
 * `//host`, a backslash trick, a non-string) gives null, so the caller falls back
 * to its normal destination instead of becoming an open redirect.
 */
export function safeReturnPath(value: unknown): string | null {
    if (typeof value !== 'string') return null
    if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return null
    if (/[\u0000-\u001f]/.test(value)) return null
    return value
}
