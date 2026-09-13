/**
 * Session-token storage, desktop-aware. On web this is exactly the same
 * localStorage read/write every call site already did. On desktop, the real
 * token goes to Electron's safeStorage-backed store instead (main.ts's
 * onBeforeSendHeaders then injects it into every outgoing API request), and
 * only a harmless placeholder lands in localStorage - the ~80 existing
 * `'Bearer ' + localStorage.getItem('_token')` call sites keep working
 * unchanged (they just build a header desktop's main process replaces
 * before the request leaves the machine), so none of them needed touching.
 *
 * Deliberately NOT used by superadmin impersonation's token-swap flow - that
 * still reads/writes '_token'/'_original_token' directly. It's a rare,
 * short-lived admin action; routing it through here too would mean holding
 * and restoring two tokens in the secure store for a narrow slice of the
 * risk this closes for every regular session.
 */

const DESKTOP_PLACEHOLDER = 'desktop-managed'

function bridge() {
    return (typeof window !== 'undefined' ? (window as any).citizenOneDesktop : undefined)
}

/**
 * Awaited on purpose: desktop.auth.setToken() is an async IPC round-trip to
 * main (which is what actually starts rewriting the placeholder header into
 * the real one). A caller that didn't await this and immediately triggered
 * an authenticated request - the very next thing every login call site does
 * - could have that request go out before main had registered the real
 * token, taking a genuine 401 from the real backend and logging straight
 * back out right after logging in.
 */
export async function setSessionToken(token: string): Promise<void> {
    const desktop = bridge()
    if (desktop?.isDesktop) {
        await desktop.auth.setToken(token)
        localStorage.setItem('_token', DESKTOP_PLACEHOLDER)
        return
    }
    localStorage.setItem('_token', token)
}

export async function clearSessionToken(): Promise<void> {
    const desktop = bridge()
    if (desktop?.isDesktop) {
        await desktop.auth.clearToken()
    }
    localStorage.removeItem('_token')
}
