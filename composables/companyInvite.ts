/**
 * The company-admin invitation link: /accept-company-invite?company=&user=&expires=&signature=.
 * The server signs company, user and expiry together, so all four must reach the
 * accept call unchanged. A link missing any of them (an old, unsigned mail) is
 * invalid without asking the server.
 */

export interface CompanyInvitePayload {
    company_uuid: string
    user_uuid: string
    expires: number
    signature: string
}

export type CompanyInviteOutcome = 'accepted' | 'expired' | 'invalid' | 'notAdmin' | 'error'

type QueryValue = string | null | undefined | (string | null)[]

function single(value: QueryValue): string {
    const raw = Array.isArray(value) ? value[0] : value
    return typeof raw === 'string' ? raw.trim() : ''
}

export function readCompanyInviteParams(query: Record<string, QueryValue>): CompanyInvitePayload | null {
    const company = single(query.company)
    const user = single(query.user)
    const expiresRaw = single(query.expires)
    const signature = single(query.signature)

    if (!company || !user || !signature || !/^\d+$/.test(expiresRaw)) {
        return null
    }

    return {
        company_uuid: company,
        user_uuid: user,
        expires: Number(expiresRaw),
        signature,
    }
}

/** Which state the page shows for a failed accept call, from the server's `reason`. */
export function companyInviteOutcomeOf(error: any): CompanyInviteOutcome {
    const reason = error?.reason

    if (reason === 'expired') return 'expired'
    if (reason === 'invalid') return 'invalid'
    if (reason === 'not_admin') return 'notAdmin'

    // An old unsigned link that slipped past the client check is refused by
    // validation; it is just as invalid.
    if (error?.errors?.signature || error?.errors?.expires) return 'invalid'

    return 'error'
}
