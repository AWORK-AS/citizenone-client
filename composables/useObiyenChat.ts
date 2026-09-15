import { obiyenChatIdentityService } from '@/components/api/user/ObiyenChatIdentityService'

// Shared control for the Obiyen chat bubble: hidden by default, only shown
// after the user explicitly clicks "Chat with support" (components/modules/
// user/support/slide-over.vue), and hidden again on next login. sessionStorage
// alone isn't enough to reset the *visual* state, since logout uses Nuxt's
// client-side navigateTo() rather than a full page reload, so the widget's
// DOM (mounted once, outside the Nuxt app root) never gets a fresh boot to
// re-apply the "hidden by default" state - logout must hide it directly too.
const REVEALED_KEY = 'obiyen_chat_revealed'

// Fetched once per page load: the signature only changes when the logged-in
// user does, and that comes with a fresh load.
let identityPromise: Promise<any> | null = null

function getHost(): HTMLElement | null {
    if (typeof document === 'undefined') return null
    return document.getElementById('obiyen-chat-widget')
}

function getBubble(): HTMLElement | null {
    const host = getHost()
    return (host?.shadowRoot?.querySelector('.cw-bubble') as HTMLElement) ?? null
}

export function useObiyenChat() {
    /**
     * Tell the widget who is writing.
     *
     * Everything else the widget sends about a visitor is what the browser
     * typed, so support has no way to know a "Jesper from Birketoften" really
     * is one. The backend signs our user UUID with a secret only it has; the
     * widget passes id and signature on, and Obiyen recomputes it. That is what
     * lets their assistant act on a request - reporting a bug from the chat, for
     * instance - instead of only answering questions.
     *
     * Best-effort throughout: an unconfigured environment, a failed request or
     * a widget that hasn't loaded all end with an anonymous chat, never a
     * blocked one.
     */
    async function identify() {
        if (typeof window === 'undefined') return

        try {
            if (!identityPromise) identityPromise = obiyenChatIdentityService.getIdentity()
            const response = await identityPromise
            const identity = response?.data ?? response

            if (!identity?.enabled || !identity?.user_id || !identity?.user_hash) return

            const claim = {
                userId: identity.user_id,
                userHash: identity.user_hash,
                name: identity.name,
                email: identity.email,
            }

            // The widget publishes identify() as soon as its script evaluates,
            // but that script is injected asynchronously - queue if it isn't
            // there yet, and it replays the claim when it boots.
            const w = window as any
            if (w.ObiyenChat?.identify) {
                await w.ObiyenChat.identify(claim)
            } else {
                w.ObiyenChat = w.ObiyenChat ?? {}
                w.ObiyenChat.q = w.ObiyenChat.q ?? []
                w.ObiyenChat.q.push(claim)
            }
        } catch {
            // Support chat is not worth an error toast. Anonymous is a fine
            // fallback, and the visitor can still type who they are.
        }
    }

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
        // Identify at the moment the chat is opened, not on every page load:
        // this is the first point where we know support is actually wanted.
        identify()

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
        // The next person on this browser is a different user, and must not
        // inherit this one's signature.
        identityPromise = null
        try { sessionStorage.removeItem(REVEALED_KEY) } catch { /* ignore */ }
        hideBubble()
    }

    return { isRevealedThisSession, hideBubble, identify, revealAndOpenChat, setSideOffset, resetOnLogout }
}
