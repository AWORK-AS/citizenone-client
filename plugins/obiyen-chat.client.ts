// plugins/obiyen-chat.client.ts

export default defineNuxtPlugin(() => {
    if (process.client) {
        const d = document
        const s = d.createElement("script")
        s.src = "https://appserver.obiyen.com/browser-ui/chat-widget-loader.js"
        s.setAttribute("data-widget-id", "86a7f852-f64d-49f8-a43a-c11c76fd862e")
        s.setAttribute("data-api-base", "https://appserver.obiyen.com/api")
        // Milo is here for when someone asks, never on his own: this widget id
        // also serves citizenone.dk, and a trigger set up for the website
        // would otherwise open him over someone's journal.
        s.setAttribute("data-proactive", "off")
        const t = d.getElementsByTagName("script")[0]

        if (t && t.parentNode) {
            t.parentNode.insertBefore(s, t)
        } else {
            console.error("Failed to insert Obiyen chat widget script: parent node not found.")
        }

        // The widget mounts itself asynchronously into a Shadow DOM host, so
        // poll for the bubble rather than assuming it's ready after the script tag loads.
        const { isRevealedThisSession, hideBubble } = useObiyenChat()
        const revealedAlready = isRevealedThisSession()
        const interval = setInterval(() => {
            const bubble = d.getElementById('obiyen-chat-widget')?.shadowRoot?.querySelector('.cw-bubble')
            if (bubble) {
                if (!revealedAlready) hideBubble()
                clearInterval(interval)
            }
        }, 250)
        setTimeout(() => clearInterval(interval), 30000)

        // A page's own questions belong to that page: leaving it gives Milo
        // the in-app support questions back (not the website's pricing and
        // demo ones), so the calendar's "?" never shows the duty schedule's.
        // The app's vue-i18n instance is provided as $i18nGlobal
        // (plugins/i18n.ts). The first set waits for the app to mount, and is
        // repeated when the locale changes: it starts as 'en' and becomes the
        // user's language once they are loaded. Best-effort: a failure here may
        // cost Milo his suggestions, never the app its start (an earlier
        // version took the whole app down with "reading 't'").
        const nuxtApp = useNuxtApp()
        const suggestInApp = () => {
            try {
                const i18n = (nuxtApp as any).$i18nGlobal
                if (!i18n?.t) return
                useObiyenChat().suggestInApp((key: string) => String(i18n.t(key)))
            } catch { /* leave Milo's defaults */ }
        }
        nuxtApp.hook('app:mounted', () => {
            suggestInApp()
            const locale = (nuxtApp as any).$i18nGlobal?.locale
            if (locale && typeof locale === 'object' && 'value' in locale) watch(locale, suggestInApp)
        })
        useRouter().afterEach((to, from) => {
            if (to.path !== from.path) suggestInApp()
        })
    }
})
