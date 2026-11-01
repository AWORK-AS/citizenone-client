/**
 * When a meeting recording is deleted automatically, in whole days from now,
 * and whether to warn about it: soon (within a week) and nothing from it has
 * been kept, i.e. no Cody summary was made.
 */
export const PURGE_WARNING_DAYS = 7

export function daysUntilPurge(purgeAt: string | null | undefined, now: Date = new Date()): number | null {
    if (!purgeAt) return null
    const ms = new Date(purgeAt).getTime() - now.getTime()
    return Math.max(0, Math.ceil(ms / 86_400_000))
}

export function warnBeforePurge(recording: any, now: Date = new Date()): boolean {
    const days = daysUntilPurge(recording?.purge_at, now)
    return days !== null && days <= PURGE_WARNING_DAYS && recording?.summary_status !== 'ready'
}
