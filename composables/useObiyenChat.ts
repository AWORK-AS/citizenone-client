// Shared control for the Obiyen chat bubble: hidden by default, only shown
// after the user explicitly clicks "Chat with support" (components/modules/
// user/support/slide-over.vue), and hidden again on next login. sessionStorage
// alone isn't enough to reset the *visual* state, since logout uses Nuxt's
// client-side navigateTo() rather than a full page reload, so the widget's
// DOM (mounted once, outside the Nuxt app root) never gets a fresh boot to
// re-apply the "hidden by default" state - logout must hide it directly too.
const REVEALED_KEY = 'obiyen_chat_revealed'

function getHost(): HTMLElement | null {
    if (typeof document === 'undefined') return null
    return document.getElementById('obiyen-chat-widget')
}

function getBubble(): HTMLElement | null {
    const host = getHost()
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

    /**
     * Slide the chat bubble (and the window it opens) sideways so it stops
     * sitting on top of the assistant panel's input field, which is exactly
     * where it landed while someone was typing to the AI (Birketoften 31/8).
     *
     * The widget lives outside the Nuxt root in its own shadow DOM and
     * positions itself `fixed`, so the offset is applied as a transform on the
     * host - which becomes the containing block for those fixed children. A
     * host rendered as `display: contents` cannot carry a transform, so the
     * bubble itself is moved instead.
     */
    function setSideOffset(pixels: number) {
        const host = getHost()
        if (!host) return

        const value = pixels > 0 ? `translateX(-${pixels}px)` : ''
        const isContents = typeof getComputedStyle === 'function'
            && getComputedStyle(host).display === 'contents'

        if (isContents) {
            host.style.transform = ''
            getBubble()?.style.setProperty('transform', value)

            return
        }

        host.style.transform = value
        host.style.transition = 'transform 300ms ease-in-out'
    }

    function resetOnLogout() {
        try { sessionStorage.removeItem(REVEALED_KEY) } catch { /* ignore */ }
        hideBubble()
    }

    return { isRevealedThisSession, hideBubble, revealAndOpenChat, setSideOffset, resetOnLogout }
}
