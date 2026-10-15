// No imports on purpose: BaseAPIService calls this on a forced logout, and
// useObiyenChat imports a service that extends BaseAPIService.

/**
 * Have the widget forget this browser's conversation. On a shared computer,
 * which is how most care homes' staff rooms work, the next person to log in
 * would otherwise open the chat and find the previous person's conversation.
 * Queued if the widget has not loaded yet; a widget too old to know logout
 * ignores it, and the identity check on the next message still catches the
 * change of user.
 */
export function forgetChatSession() {
    if (typeof window === 'undefined') return
    const w = window as any
    try {
        if (typeof w.ObiyenChat?.logout === 'function') w.ObiyenChat.logout()
        else if (Array.isArray(w.ObiyenChat?.q)) w.ObiyenChat.q.push(['logout'])
    } catch { /* support chat must never break a logout */ }
}
