// Shared control for the Obiyen chat bubble: hidden by default, only shown
// after the user explicitly clicks "Chat with support" (components/modules/
// user/support/slide-over.vue), and hidden again on next login. sessionStorage
// alone isn't enough to reset the *visual* state, since logout uses Nuxt's
// client-side navigateTo() rather than a full page reload, so the widget's
// DOM (mounted once, outside the Nuxt app root) never gets a fresh boot to
// re-apply the "hidden by default" state - logout must hide it directly too.
const REVEALED_KEY = 'obiyen_chat_revealed'

function getBubble(): HTMLElement | null {
    if (typeof document === 'undefined') return null
    const host = document.getElementById('obiyen-chat-widget')
    return (host?.shadowRoot?.querySelector('.cw-bubble') as HTMLElement) ?? null
}

export function useObiyenChat() {
    function isRevealedThisSession(): boolean {
        try {
            return sessionStorage.getItem(REVEALED_KEY) === '1'
        } catch {
            return false
        }
    }

    function hideBubble() {
        getBubble()?.style.setProperty('display', 'none')
    }

    function revealAndOpenChat() {
        const bubble = getBubble()
        if (bubble) {
            bubble.style.display = ''
            try { sessionStorage.setItem(REVEALED_KEY, '1') } catch { /* ignore */ }
            bubble.click()
        }
    }

    function resetOnLogout() {
        try { sessionStorage.removeItem(REVEALED_KEY) } catch { /* ignore */ }
        hideBubble()
    }

    return { isRevealedThisSession, hideBubble, revealAndOpenChat, resetOnLogout }
}
