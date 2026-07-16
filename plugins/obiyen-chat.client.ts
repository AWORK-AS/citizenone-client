// plugins/obiyen-chat.client.ts

export default defineNuxtPlugin(() => {
    if (process.client) {
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
    }
})
