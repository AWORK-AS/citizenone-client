declare global {
    interface Window {
        dataLayer: any[]
    }
}

export function useGtag() {
    // Fires once, right after the backend confirms account creation succeeded.
    // GTM picks this up from the dataLayer and fans it out to GA4, Google Ads,
    // Meta Pixel, and LinkedIn Insight Tag — single source of truth for all of them.
    const pushSignUpEvent = () => {
        if (typeof window === 'undefined') {
            return
        }

        window.dataLayer = window.dataLayer || []
        window.dataLayer.push({
            event: 'sign_up',
            signup_method: 'email',
            product: 'citizenone',
        })
    }

    return { pushSignUpEvent }
}
