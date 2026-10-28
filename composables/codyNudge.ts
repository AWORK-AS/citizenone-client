// The Cody adoption nudges for administrators: which banner shows, when a dismissed one comes
// back, the price line and the superadmin report rows. Pure, for node --test.
//
// None of this is access control. The backend decides who may start a trial, buy or assign a
// seat, and refuses buy-funnel events for a company that already has Cody.

export type BannerVariant = 'trial' | 'adminTrial' | 'adminEnable' | 'request' | 'seats'

export type NudgeSurface = 'banner' | 'prompt' | 'journal_preview' | 'seats'

export type NudgeEvent = 'impression' | 'click' | 'try_free' | 'buy'

export const DISMISS_DAYS = 14

/** What is remembered when the banner is closed: when, and how much demand there was then. */
export interface DismissRecord {
    at: number
    count: number
}

export interface NudgeStatus {
    has_access?: boolean
    company_has_cody?: boolean
    can_manage?: boolean
    trial?: { active?: boolean, available?: boolean } | null
    demand?: { staff_count?: number | null, since?: string | null } | null
    price?: { amount_gross?: number | string | null, per?: 'month' | 'year' | null, seats?: number | null } | null
}

/** Staff waiting for Cody, as the admin's status reports it. 0 when unknown. */
export function demandCount(status: NudgeStatus | null | undefined): number {
    const n = Number(status?.demand?.staff_count ?? 0)
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0
}

/**
 * Reads what was stored on dismissal. Older builds stored a bare timestamp: that is a
 * dismissal with no demand recorded.
 */
export function parseDismissRecord(raw: string | null | undefined): DismissRecord | null {
    if (!raw) return null
    try {
        const parsed = JSON.parse(raw)
        if (typeof parsed === 'number') return { at: parsed, count: 0 }
        if (parsed && typeof parsed.at === 'number') return { at: parsed.at, count: Number(parsed.count) || 0 }
    } catch (_) { /* fall through */ }
    const at = Number(raw)
    return Number.isFinite(at) && at > 0 ? { at, count: 0 } : null
}

/**
 * A closed banner stays closed for DISMISS_DAYS, unless more staff have asked for Cody than
 * when it was closed: then the admin has something new to see.
 */
export function isBannerDismissed(record: DismissRecord | null, currentCount: number, now: number): boolean {
    if (!record) return false
    if (now - record.at >= DISMISS_DAYS * 86400000) return false
    return currentCount <= record.count
}

/**
 * Which banner, if any. A company that has Cody is never offered it: its licence admins see
 * the "seats" banner when staff are waiting for one, everyone else sees nothing. A running
 * trial keeps its countdown as it is.
 */
export function bannerVariant(opts: {
    status: NudgeStatus | null | undefined
    canPurchase: boolean
    hasAccess: boolean
    trialDismissed: boolean
    bannerDismissed: boolean
    seatsDismissed: boolean
}): BannerVariant | null {
    const s = opts.status
    if (!s) return null
    // An offer to buy is for someone who can buy. Staff who cannot see nothing.
    if (!opts.canPurchase) return null
    if (s.trial?.active) return opts.trialDismissed ? null : 'trial'
    if (s.company_has_cody) {
        return s.can_manage && demandCount(s) > 0 && !opts.seatsDismissed ? 'seats' : null
    }
    if (opts.hasAccess || s.has_access) return null
    if (opts.bannerDismissed) return null
    if (s.can_manage) return s.trial?.available ? 'adminTrial' : 'adminEnable'
    return 'request'
}

/** The nudge surface a banner variant is measured as; the trial countdown is not a nudge. */
export function bannerSurface(variant: BannerVariant | null): NudgeSurface | null {
    if (variant === 'adminTrial' || variant === 'adminEnable') return 'banner'
    if (variant === 'seats') return 'seats'
    return null
}

/**
 * The "Then 128.50 kr./mo." line: key and params for $t, or null when there is nothing to
 * show. Never for someone who cannot buy, never for a company that has Cody.
 */
export function priceLine(
    status: NudgeStatus | null | undefined,
    canPurchase: boolean,
    format: (amount: unknown) => string,
): { key: string, params: Record<string, string | number>, count?: number } | null {
    if (!canPurchase || !status || status.company_has_cody || status.trial?.active) return null
    const price = status.price
    if (!price) return null
    const amount = format(price.amount_gross)
    if (!amount) return null
    const per = price.per === 'year' ? 'year' : 'month'
    const seats = Number(price.seats ?? 0)
    if (Number.isFinite(seats) && seats > 0) {
        return { key: `cody.adoption.price.${per}Seats`, params: { amount, count: seats }, count: seats }
    }
    return { key: `cody.adoption.price.${per}`, params: { amount } }
}

export interface NudgeReportCell {
    impressions: number
    viewers: number
    clicks: number
    try_free: number
    buy: number
    companies: number
    trial_started: number
    bought: number
}

export interface NudgeReport {
    surfaces: NudgeSurface[]
    weeks: Array<{ week: string, starts_on: string, surfaces: Record<string, NudgeReportCell> }>
    totals: Record<string, NudgeReportCell>
}

/** One row per week and surface that saw anything, newest week first. */
export function nudgeReportRows(report: NudgeReport | null | undefined): Array<NudgeReportCell & { week: string, surface: string }> {
    if (!report?.weeks) return []
    const rows: Array<NudgeReportCell & { week: string, surface: string }> = []
    for (const week of [...report.weeks].reverse()) {
        for (const surface of report.surfaces ?? []) {
            const cell = week.surfaces?.[surface]
            if (!cell) continue
            if (cell.impressions || cell.clicks || cell.companies) rows.push({ week: week.week, surface, ...cell })
        }
    }
    return rows
}
