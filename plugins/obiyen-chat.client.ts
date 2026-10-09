// plugins/obiyen-chat.client.ts

export default defineNuxtPlugin(() => {
    // No support chat inside the duty schedule embedded on a customer's website.
    if (process.client && !window.location.pathname.startsWith('/embed/duty-schedules/')) {
        const d = document
        const s = d.createElement("script")
        s.src = "https://appserver.obiyen.com/browser-ui/chat-widget-loader.js"
        s.setAttribute("data-widget-id", "86a7f852-f64d-49f8-a43a-c11c76fd862e")
        s.setAttribute("data-api-base", "https://appserver.obiyen.com/api")
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
        // his defaults back, so the calendar's "?" never shows the duty
        // schedule's questions.
        useRouter().afterEach((to, from) => {
            if (to.path !== from.path) useObiyenChat().suggest([])
        })
    }
})
