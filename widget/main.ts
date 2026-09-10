/**
 * Standalone entry point for the embeddable booking widget, built separately
 * from the Nuxt app (see vite.widget.config.ts / `pnpm build:widget`) into a
 * single dependency-light widget.js. A customer pastes:
 *
 *   <script src="https://app.citizenone.dk/widget.js" data-embed-token="..."></script>
 *
 * into their own site. This file finds that script tag, mounts a Vue app
 * into a Shadow DOM host inserted right where the tag sits, and injects the
 * widget's own CSS into the shadow root directly - Shadow DOM blocks the
 * host page's stylesheets from reaching in, so nothing here can rely on
 * Nuxt's Tailwind build, and nothing here can leak out into the customer's
 * own page styles either.
 */
import { createApp } from 'vue'
import WebsiteBookingWidget from '@/components/modules/public/WebsiteBookingWidget.vue'
// eslint-disable-next-line import/no-unresolved
import widgetCss from '@/components/modules/public/website-booking-widget.css?raw'

function mount() {
    const currentScript = document.currentScript as HTMLScriptElement | null

    const embedToken = currentScript?.getAttribute('data-embed-token')
    if (!embedToken) {
        console.error('[CitizenOne booking widget] missing data-embed-token attribute on the widget script tag.')
        return
    }

    const apiBaseURL = currentScript?.getAttribute('data-api-base') || 'https://app.citizenone.dk/api'
    const locale = currentScript?.getAttribute('data-locale') || 'en'

    const host = document.createElement('div')
    host.id = `citizenone-booking-widget-${embedToken}`

    if (currentScript?.parentNode) {
        currentScript.parentNode.insertBefore(host, currentScript.nextSibling)
    } else {
        document.body.appendChild(host)
    }

    const shadowRoot = host.attachShadow({ mode: 'open' })
    const style = document.createElement('style')
    style.textContent = widgetCss
    shadowRoot.appendChild(style)

    const mountPoint = document.createElement('div')
    shadowRoot.appendChild(mountPoint)

    createApp(WebsiteBookingWidget, { apiBaseURL, embedToken, locale }).mount(mountPoint)
}

mount()
