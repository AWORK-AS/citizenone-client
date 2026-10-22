// The growth funnel in the superadmin report (pages/superadmin/funnel). Pure, for node --test.
// The numbers come from GET /superadmin/analytics/funnel; this only turns them into rates.

export const FUNNEL_STAGES = ['signed_up', 'activated', 'first_note', 'paying'] as const
export type FunnelStage = typeof FUNNEL_STAGES[number]

export interface FunnelRow {
    channel: string
    label: string
    signed_up: number
    activated: number
    first_note: number
    paying: number
    median_days?: Partial<Record<Exclude<FunnelStage, 'signed_up'>, number | null>>
}

/** Share of the channel's signups that reached a stage, 0-100 rounded, or null with no signups. */
export function shareOfSignups(row: FunnelRow, stage: FunnelStage): number | null {
    if (!row.signed_up) return null
    return Math.round((row[stage] / row.signed_up) * 100)
}

/** Share of the previous stage that went on to this one: where a channel loses people. */
export function stepRate(row: FunnelRow, stage: FunnelStage): number | null {
    const i = FUNNEL_STAGES.indexOf(stage)
    if (i <= 0) return null
    const previous = row[FUNNEL_STAGES[i - 1]!]
    if (!previous) return null
    return Math.round((row[stage] / previous) * 100)
}

/**
 * The stage where the channel loses the largest share of those who reached the stage before,
 * the first place to look. Null when nobody signed up or nothing was lost.
 */
export function biggestDrop(row: FunnelRow): FunnelStage | null {
    let worst: FunnelStage | null = null
    let worstRate = 101
    for (const stage of FUNNEL_STAGES.slice(1)) {
        const rate = stepRate(row, stage)
        if (rate !== null && rate < 100 && rate < worstRate) {
            worst = stage
            worstRate = rate
        }
    }
    return worst
}

/** Channels with too few signups to say anything about a rate. */
export const SMALL_SAMPLE = 5

export function isSmallSample(row: FunnelRow): boolean {
    return row.signed_up < SMALL_SAMPLE
}

// ---------------------------------------------------------------- growth loops
// `growth_loops` on the same response: "suggest to my manager" and the "Del CitizenOne" referral
// loop, per period. AnalyticsService::suggestionLoop / referralLoop on the backend.

export interface SuggestionLoopTotals {
    sends: number
    recipients: number
    senders?: number
    suggested_apps: number
    converted: number
    open: number
}

export interface ReferralLoopTotals {
    shares: number
    signed_up: number
    paid: number
    median_days_to_paid?: number | null
}

/**
 * Share of suggested apps the company bought within the window, 0-100 rounded. Suggestions whose
 * window is still open have not had their chance yet and are left out; null when none have.
 */
export function suggestionConversion(totals: SuggestionLoopTotals | null | undefined): number | null {
    if (!totals) return null
    const decided = totals.suggested_apps - totals.open
    if (decided <= 0) return null
    return Math.round((totals.converted / decided) * 100)
}

/** Share of the companies that signed up through a shared link that have since paid. */
export function referralPaidRate(totals: ReferralLoopTotals | null | undefined): number | null {
    if (!totals || !totals.signed_up) return null
    return Math.round((totals.paid / totals.signed_up) * 100)
}

/** The periods worth a row: those where anything happened. Keeps a year of empty months out. */
export function activeBuckets<T extends Record<string, unknown>>(buckets: T[] | null | undefined, fields: (keyof T)[]): T[] {
    return (buckets ?? []).filter((bucket) => fields.some((field) => Number(bucket[field]) > 0))
}
