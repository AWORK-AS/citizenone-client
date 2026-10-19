/**
 * The company-admin invitation link:
 *   /accept-company-invite#invite=&company=&user=&expires=&signature=
 * The parameters sit in the fragment so the signed link never reaches a server
 * log or analytics. The server signs invite, company, user and expiry together,
 * so all five must reach the accept call unchanged. A link missing any of them
 * (an old, unsigned mail) is invalid without asking the server.
 */

export interface CompanyInvitePayload {
    invite_uuid: string
    company_uuid: string
    user_uuid: string
    expires: number
    signature: string
}

export type CompanyInviteOutcome = 'ready' | 'wrongUser' | 'accepted' | 'expired' | 'invalid' | 'notAdmin' | 'error'

type QueryValue = string | null | undefined | (string | null)[]

function single(value: QueryValue): string {
    const raw = Array.isArray(value) ? value[0] : value
    return typeof raw === 'string' ? raw.trim() : ''
}

/** The fragment (`#a=1&b=2`, with or without the `#`) as a plain record. */
export function parseInviteFragment(hash: string | null | undefined): Record<string, string> {
    const params = new URLSearchParams((hash ?? '').replace(/^#/, ''))
    const out: Record<string, string> = {}
    params.forEach((value, key) => {
        if (!(key in out)) out[key] = value
    })
    return out
}

export function readCompanyInviteParams(query: Record<string, QueryValue>): CompanyInvitePayload | null {
    const invite = single(query.invite)
    const company = single(query.company)
    const user = single(query.user)
    const expiresRaw = single(query.expires)
    const signature = single(query.signature)

    if (!invite || !company || !user || !signature || !/^\d+$/.test(expiresRaw)) {
        return null
    }

    return {
        invite_uuid: invite,
        company_uuid: company,
        user_uuid: user,
        expires: Number(expiresRaw),
        signature,
    }
}

/**
 * What the page shows before anything is sent. Nothing is accepted on page load:
 * mail scanners open links too, so the invitee has to press the button. Someone
 * signed in as a different user is stopped here rather than accepting on behalf
 * of the person the mail was for.
 */
export function initialCompanyInviteState(
    invite: CompanyInvitePayload | null,
    signedInUserUuid?: string | null,
): CompanyInviteOutcome {
    if (!invite) return 'invalid'
    if (signedInUserUuid && signedInUserUuid !== invite.user_uuid) return 'wrongUser'
    return 'ready'
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
