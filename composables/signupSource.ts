/**
 * Where a signup came from, read off the register link.
 *
 * The website adds utm_*, gclid, landing and ref (see lib/attribution.ts there). A Salesflow
 * sequence mail adds `sf`, its signed reference, so the backend can tell Salesflow and the lead's
 * mail funnel stops once they have an account (see App\Support\SalesflowSignupReporter). A customer's
 * "Del CitizenOne" link adds `share`, their code, so the signup is credited to them (task #16).
 */
export const SIGNUP_SOURCE_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'gclid', 'landing', 'ref', 'sf', 'share'] as const

export function signupSourceFromQuery(search: string): Record<string, string> {
    const query = new URLSearchParams(search)
    const found: Record<string, string> = {}

    for (const key of SIGNUP_SOURCE_KEYS) {
        const value = query.get(key)
        if (value) found[key] = value.slice(0, 255)
    }

    return found
}

const PAID_MEDIA = ['cpc', 'ppc', 'paid', 'paidsearch', 'paid_search', 'lead_form']
const SEARCH_ENGINES = ['google.', 'bing.', 'duckduckgo.', 'yahoo.', 'ecosia.']
const PRODUCT_UTM_SOURCE = 'citizenone_product'

/**
 * The channel the backend will store on the company, worked out here too so the `sign_up` event
 * can carry it. GA4 sees a signup as "Direct", because the visit starts over on app.citizenone.dk,
 * while the backend knows it came from Google. Same order and same names as
 * App\Support\SignupSource::channel in citizenone-backend; change both or neither. The one
 * difference: the backend only credits `share` to a code that exists, which the client cannot check.
 */
export function signupChannel(source: Record<string, string>): string {
    const utmSource = (source.utm_source ?? '').trim().toLowerCase()
    const medium = (source.utm_medium ?? '').trim().toLowerCase()
    const referrer = (source.ref ?? '').trim().toLowerCase()

    if (source.share) return 'share'
    if (source.gclid) return 'google_ads'
    if (utmSource.includes('google') && PAID_MEDIA.includes(medium)) return 'google_ads'
    if (utmSource.includes('findsocialetilbud') || referrer.includes('findsocialetilbud')) return 'findsocialetilbud'
    if (utmSource === PRODUCT_UTM_SOURCE) return 'product'
    if (utmSource !== '') return 'campaign'
    if (referrer !== '' && SEARCH_ENGINES.some((engine) => referrer.includes(engine))) return 'search'
    if (referrer !== '') return 'referral'

    return 'direct'
}
