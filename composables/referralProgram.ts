/**
 * "Giv en måned, få en måned": the referral programme on top of "Del CitizenOne".
 *
 * The link is the user's own share link. A company that signs up through it, and later pays its
 * first invoice, earns both companies one free month (App\Service\CompanyReferralService). Pure
 * functions only, so `node --test tests/unit/referralProgram.test.mjs` can run them.
 */

/** An NPS answer of 9-10. Only they are shown the referral offer next to the review invitation. */
export const PROMOTER_MIN = 9

export function isPromoter(score: number | null | undefined): boolean {
    return typeof score === 'number' && score >= PROMOTER_MIN && score <= 10
}

export type ReferralOffer = {
    url: string
    months_per_referral: number
    yearly_cap: number
}

export type ReferralSummary = {
    referred: number
    pending: number
    rewarded: number
    earned_months: number
    applied_months: number
}

/**
 * The offer as the API sent it, or null when there is none to show: an older backend, a user
 * who cannot take it up, or anything that is not our own signup link.
 */
export function referralOfferFrom(value: unknown): ReferralOffer | null {
    if (!value || typeof value !== 'object') return null
    const offer = value as Record<string, unknown>
    if (typeof offer.url !== 'string') return null

    let url: URL
    try {
        url = new URL(offer.url)
    } catch {
        return null
    }
    if (url.protocol !== 'https:' && url.hostname !== 'localhost') return null
    if (!url.pathname.endsWith('/register') || !url.searchParams.get('share')) return null

    return {
        url: offer.url,
        months_per_referral: Number(offer.months_per_referral) || 1,
        yearly_cap: Number(offer.yearly_cap) || 12,
    }
}

/** Free months earned that have not yet been taken off an invoice. Never negative. */
export function monthsToCome(summary: ReferralSummary | null | undefined): number {
    if (!summary) return 0
    return Math.max(0, (summary.earned_months || 0) - (summary.applied_months || 0))
}

/** The status rows superadmin reads, in the order a referral moves through them. */
export const REFERRAL_STATUSES = ['pending', 'rewarded', 'rejected'] as const
export type ReferralStatus = typeof REFERRAL_STATUSES[number]

/** Free months still to be taken off an invoice in superadmin's list. */
export function creditsToApply(referrals: { credits?: { status: string }[] }[]): number {
    return referrals.reduce((sum, r) => sum + (r.credits ?? []).filter((c) => c.status === 'earned').length, 0)
}
