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

export function setSessionToken(token: string): void {
    const desktop = bridge()
    if (desktop?.isDesktop) {
        desktop.auth.setToken(token)
        localStorage.setItem('_token', DESKTOP_PLACEHOLDER)
        return
    }
    localStorage.setItem('_token', token)
}

export function clearSessionToken(): void {
    const desktop = bridge()
    if (desktop?.isDesktop) {
        desktop.auth.clearToken()
    }
    localStorage.removeItem('_token')
}
