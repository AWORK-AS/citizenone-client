import { signupChannel } from '@/composables/signupSource'

declare global {
    interface Window {
        dataLayer: any[]
    }
}

export function useGtag() {
    // Fires once, right after the backend confirms account creation succeeded.
    // GTM picks this up from the dataLayer and fans it out to GA4, Google Ads,
    // Meta Pixel, and LinkedIn Insight Tag — single source of truth for all of them.
    // The origin goes with it so GA4 can report signups by channel instead of all as "Direct".
    const pushSignUpEvent = (method: string, source: Record<string, string>) => {
        if (typeof window === 'undefined') {
            return
        }

        window.dataLayer = window.dataLayer || []
        window.dataLayer.push({
            event: 'sign_up',
            signup_method: method,
            product: 'citizenone',
            signup_channel: signupChannel(source),
            signup_source: source.utm_source || source.ref || '(direct)',
            signup_medium: source.utm_medium || '',
            signup_campaign: source.utm_campaign || '',
            signup_landing: source.landing || '',
        })
    }

    return { pushSignUpEvent }
}
