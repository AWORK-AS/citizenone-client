// Exposure of the growth loops ("Del CitizenOne", "suggest to my manager"), so superadmin can tell
// a loop nobody saw from one people saw and did not use. Pure parts are testable with node --test.

export type GrowthLoop = 'share' | 'suggestion'
export type GrowthEvent = 'impression' | 'open'

/**
 * Whether to send an event now. An impression goes once per loop per page load (the backend
 * keeps one per person and day anyway); an open always goes (the backend claims it for a minute).
 */
export function shouldSendGrowthEvent(sent: Set<string>, loop: GrowthLoop, event: GrowthEvent): boolean {
    if (event !== 'impression') return true
    if (sent.has(loop)) return false
    sent.add(loop)
    return true
}

const sentImpressions = new Set<string>()

/** Fire and forget: a metric never gets in the user's way. */
export function recordGrowthEvent(loop: GrowthLoop, event: GrowthEvent): void {
    if (!shouldSendGrowthEvent(sentImpressions, loop, event)) return
    import('@/components/api/user/GrowthEventService')
        .then(({ growthEventService }) => growthEventService.record(loop, event))
        .catch(() => { /* ignore */ })
}
