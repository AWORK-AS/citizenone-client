// The query params the website hands to /signup. They travel with every step so the
// backend can tie the draft and the campaign to the account that comes out the other end.
export const SIGNUP_PASSTHROUGH_KEYS = ['draft', 'utm_source', 'utm_medium', 'utm_campaign', 'gclid', 'landing'] as const

export function signupPassthrough(query: Record<string, unknown>): Record<string, string> {
    const out: Record<string, string> = {}
    for (const key of SIGNUP_PASSTHROUGH_KEYS) {
        const value = Array.isArray(query[key]) ? query[key][0] : query[key]
        if (typeof value === 'string' && value !== '') out[key] = value
    }
    return out
}

export function socialRedirectUrl(apiBase: string, provider: 'google' | 'apple', passthrough: Record<string, string>): string {
    // Empty values are sent too, the way the backend's redirect link is documented.
    const params = new URLSearchParams()
    for (const key of SIGNUP_PASSTHROUGH_KEYS) params.set(key, passthrough[key] ?? '')
    return `${apiBase}/auth/social/${provider}/redirect?${params.toString()}`
}

// "smart_goal-generator" -> "Smart goal generator", for a tool with no translation.
export function humanize(value: string): string {
    const text = String(value).replace(/[_\-.]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').trim()
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : ''
}

// Flattens arbitrary JSON into "label: text" rows. Text only, depth and size bounded.
export function draftRows(data: unknown, prefix = '', depth = 0, out: { label: string; value: string }[] = []) {
    if (out.length >= 40) return out
    if (data === null || data === undefined || data === '') return out
    if (typeof data !== 'object') {
        out.push({ label: prefix, value: String(data).slice(0, 300) })
        return out
    }
    if (depth >= 3) {
        out.push({ label: prefix, value: JSON.stringify(data).slice(0, 300) })
        return out
    }
    if (Array.isArray(data)) {
        const scalars = data.every((item) => item === null || typeof item !== 'object')
        if (scalars) {
            out.push({ label: prefix, value: data.map((item) => String(item)).join(', ').slice(0, 300) })
        } else {
            data.forEach((item, index) => draftRows(item, prefix ? `${prefix} ${index + 1}` : String(index + 1), depth + 1, out))
        }
        return out
    }
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
        draftRows(value, prefix ? `${prefix} / ${humanize(key)}` : humanize(key), depth + 1, out)
    }
    return out
}
