// When a write fails in a way the screen does not show, say so once.
//
// Most screens put a failed request into state.error and only render the field
// errors of a 422 from it. A write that failed for any other reason - the
// connection dropped, the server broke, the session was refused - then left
// the form looking saved. That is how the desktop app lost every write for
// weeks without anyone seeing it. This decides which failures get the shared
// "not saved" notice; BaseAPIService shows it.
//
// Kept dependency-free, like composables/journalNoteDraft.ts, so
// tests/unit/*.test.mjs can import it under `node --test`.

// Failures the screen already explains: validation (422) and the business-rule
// answers (400, 402, 403, 404, 409, 429) carry a message written for the user.
// Left: no response at all (offline, timeout, blocked), 401 and 5xx.
export function isUnexplainedFailure(status: number | null | undefined): boolean {
    if (status === undefined || status === null || status === 0) return true
    return status === 401 || status === 408 || status >= 500
}

// Writes that are not a user's change: signing in and out (the login screen has
// its own errors), public pages, previews, read receipts and the background
// location log. A failure there is not "your change was not saved".
const NOT_A_CHANGE = [
    /^\/?(auth|public)\//,
    /logout/,
    /preview/,
    /mark-?(as-)?read|\/read$/,
    /location-logs/,
]

export function isUserChange(method: string, url: string): boolean {
    if (String(method).toUpperCase() === 'GET') return false
    return !NOT_A_CHANGE.some((pattern) => pattern.test(url))
}

export function shouldNoticeFailedWrite(method: string, url: string, status: number | null | undefined): boolean {
    return isUserChange(method, url) && isUnexplainedFailure(status)
}

// One notice for a burst: an autosave retrying every few seconds while offline
// must not stack a toast per attempt.
export const NOTICE_INTERVAL_MS = 10_000

export function createNoticeThrottle(intervalMs = NOTICE_INTERVAL_MS) {
    let lastAt = -Infinity
    return (now = Date.now()): boolean => {
        if (now - lastAt < intervalMs) return false
        lastAt = now
        return true
    }
}
