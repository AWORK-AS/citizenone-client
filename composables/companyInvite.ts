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

/**
 * The fragment is removed from the address bar once read, so a reload before
 * the button is pressed would otherwise lose the invitation. It is kept in
 * sessionStorage (this tab only, gone when the tab closes) under a key per
 * invite, and forgotten once the invite is accepted or turned out unusable.
 */
type InviteStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

const INVITE_KEY_PREFIX = 'companyInvite:'
const CURRENT_INVITE_KEY = `${INVITE_KEY_PREFIX}current`

/** States after which the stored link is of no further use. */
export function isTerminalCompanyInviteState(outcome: CompanyInviteOutcome | null): boolean {
    return outcome === 'accepted' || outcome === 'expired' || outcome === 'invalid' || outcome === 'notAdmin'
}

export function rememberCompanyInvite(storage: InviteStorage | null | undefined, invite: CompanyInvitePayload): void {
    try {
        storage?.setItem(`${INVITE_KEY_PREFIX}${invite.invite_uuid}`, JSON.stringify(invite))
        storage?.setItem(CURRENT_INVITE_KEY, invite.invite_uuid)
    } catch { /* storage blocked: a reload just needs the link again */ }
}

export function recallCompanyInvite(storage: InviteStorage | null | undefined): CompanyInvitePayload | null {
    try {
        const uuid = storage?.getItem(CURRENT_INVITE_KEY)
        if (!uuid) return null
        const raw = JSON.parse(storage?.getItem(`${INVITE_KEY_PREFIX}${uuid}`) ?? 'null')
        if (!raw || typeof raw !== 'object') return null
        return readCompanyInviteParams({
            invite: raw.invite_uuid,
            company: raw.company_uuid,
            user: raw.user_uuid,
            expires: String(raw.expires ?? ''),
            signature: raw.signature,
        })
    } catch {
        return null
    }
}

export function forgetCompanyInvite(storage: InviteStorage | null | undefined, inviteUuid: string): void {
    try {
        storage?.removeItem(`${INVITE_KEY_PREFIX}${inviteUuid}`)
        if (storage?.getItem(CURRENT_INVITE_KEY) === inviteUuid) storage?.removeItem(CURRENT_INVITE_KEY)
    } catch { /* nothing to clean up */ }
}
