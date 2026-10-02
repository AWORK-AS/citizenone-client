/**
 * Where a signup came from, read off the register link.
 *
 * The website adds utm_*, gclid, landing and ref (see lib/attribution.ts there). A Salesflow
 * sequence mail adds `sf`, its signed reference, so the backend can tell Salesflow and the lead's
 * mail funnel stops once they have an account (see App\Support\SalesflowSignupReporter).
 */
export const SIGNUP_SOURCE_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'gclid', 'landing', 'ref', 'sf'] as const

export function signupSourceFromQuery(search: string): Record<string, string> {
    const query = new URLSearchParams(search)
    const found: Record<string, string> = {}

    for (const key of SIGNUP_SOURCE_KEYS) {
        const value = query.get(key)
        if (value) found[key] = value.slice(0, 255)
    }

    return found
}
