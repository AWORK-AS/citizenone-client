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

/** The window the bubble opens. Positioned `fixed` on its own, like the bubble. */
function getPanel(): HTMLElement | null {
    const host = getHost()
    return (host?.shadowRoot?.querySelector('.cw-panel') as HTMLElement) ?? null
}

export function useObiyenChat() {
    /**
     * Tell the widget who is writing.
     *
     * Everything else the widget sends about a visitor is what the browser
     * typed, so support has no way to know that a visitor
     * claiming to be a named user at a named customer really is one. The backend signs our user UUID with a secret only it has; the
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
     * Move the support chat clear of the assistant panel.
     *
     * Both live in the bottom right corner: Cody is 26rem wide at `right: 1rem`, and the
     * widget's bubble and window are both `position: fixed` at `right: 20px` with
     * `z-index: 99999`. Open at the same time, support lands on top of Cody - the bubble over
     * the prompt field while somebody was typing, reported 31/8, and the whole support window
     * over the answer, reported 18/9.
     *
     * **The transform goes on the widget's own elements, never on the host.** The host is a
     * bare `<div>` the loader appends to `body`, and in this app it computes to
     * `display: inline`; a transform on an inline box is ignored, so moving the host did
     * nothing at all for as long as that code existed, in every browser. Measured in the app:
     * host `transform: matrix(1, 0, 0, 1, -432, 0)`, bubble and window unmoved at the pixel.
     *
     * Both elements have to be named. Even where the host can carry a transform it changes
     * what `fixed` is measured against, which moves the widget to wherever the zero-height
     * host box happens to sit rather than sideways by the offset asked for.
     *
     * Below the assistant's own breakpoint its panel is full width, and no sideways move can
     * clear it. There the widget steps aside with `visibility` instead, which leaves the
     * bubble's `display` alone: that is the hidden-until-revealed switch above, and writing
     * to it here would reveal a bubble the user never asked for.
     */
    function setSideOffset(pixels: number) {
        if (!getHost()) return

        const aside = pixels > 0
        const narrow = typeof window !== 'undefined' && window.innerWidth < 640
        const value = aside && !narrow ? `translateX(-${pixels}px)` : ''

        for (const element of [getBubble(), getPanel()]) {
            if (!element) continue

            element.style.setProperty('transition', 'transform 300ms ease-in-out')
            element.style.setProperty('transform', value)

            if (aside && narrow) element.style.setProperty('visibility', 'hidden')
            else element.style.removeProperty('visibility')
        }
    }

    /**
     * Questions about the page the person is on, shown under Milo's greeting
     * in place of the website's pricing and demo questions
     * (window.ObiyenChat.suggest, insight-server #445). Before the widget has
     * loaded the call waits on its queue; a widget without suggest ignores it.
     */
    function suggest(questions: string[]) {
        // Before the loader has arrived, queue onto the stub it replays
        // (the widget's documented pre-load queue); dropping the call here
        // left the website's suggestions on the first page of every visit.
        const w = ((window as any).ObiyenChat ||= { q: [] })
        if (typeof w.suggest === 'function') w.suggest(questions)
        else if (Array.isArray(w.q)) w.q.push(['suggest', questions])
    }

    /**
     * Inside the product Milo's defaults are the website's - "What does
     * CitizenOne cost?", "Can we get a demo?" - which a logged-in customer
     * opening the bubble has no use for. These are support questions instead,
     * set when the app starts and again on every page change.
     */
    function suggestInApp(t: (key: string) => string) {
        suggest(['q1', 'q2', 'q3'].map((q) => t(`helpGuide.miloQuestions.inApp.${q}`)))
    }

    /** "?" on a page: open Milo with that page's questions. */
    function askAbout(questions: string[]) {
        suggest(questions)
        revealAndOpenChat()
    }

    function resetOnLogout() {
        // The next person on this browser is a different user, and must not
        // inherit this one's signature.
        identityPromise = null
        try { sessionStorage.removeItem(REVEALED_KEY) } catch { /* ignore */ }
        hideBubble()
    }

    return { isRevealedThisSession, hideBubble, identify, revealAndOpenChat, suggest, suggestInApp, askAbout, setSideOffset, resetOnLogout }
}
