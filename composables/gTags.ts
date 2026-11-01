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
    const pushSignUpEvent = (method: string, source: Record<string, string>, profile = '') => {
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
            signup_profile: profile,
        })
    }

    // One event per signup step reached, so the funnel shows where people stop:
    // 1 segment ("what do you do?"), 2 about (organisation), 3 account (login).
    // Fired once per step per page load. `profile` is the answer from step 1.
    const sentSteps = new Set<string>()
    const pushSignupStep = (step: 'segment' | 'about' | 'account', details: { profile?: string, industry?: string, prefilled?: boolean } = {}) => {
        if (typeof window === 'undefined' || sentSteps.has(step)) {
            return
        }
        sentSteps.add(step)

        window.dataLayer = window.dataLayer || []
        window.dataLayer.push({
            event: 'sign_up_step',
            product: 'citizenone',
            signup_step: step,
            signup_profile: details.profile ?? '',
            signup_industry: details.industry ?? '',
            // Came from a profession page with ?industry=, so step 1 was skipped.
            signup_prefilled: details.prefilled ? 'yes' : 'no',
        })
    }

    // "How many are you?" on /discover: answered (solo, 2-4, 5-10, 11+) or skipped.
    const pushTeamSize = (answer: string) => {
        if (typeof window === 'undefined') {
            return
        }

        window.dataLayer = window.dataLayer || []
        window.dataLayer.push({ event: 'team_size', product: 'citizenone', team_size: answer })
    }

    return { pushSignUpEvent, pushSignupStep, pushTeamSize }
}
