/**
 * What a paste of shifts on the vagtplan did, said in one message.
 *
 * Pasting skips a shift the employee already has at exactly the same times,
 * so a paste of something already there added nothing and said nothing - it
 * looked broken (TKT-000138). The backend answers every paste with
 * meta { source_count, created, skipped_duplicates }; this turns one or more
 * of those answers into the message to show.
 *
 * Used by the week, month and half-year views. A month or week pasted for all
 * employees is many requests; they are summed and announced once.
 */

export type CopyScope = 'day' | 'week' | 'month'

export interface CopyTotals {
    created: number
    skipped: number
    /** Shifts on the copied day/week/month; null when an answer had no meta. */
    sourceCount: number | null
    requests: number
    failed: number
    firstError: any
}

export interface CopyMessageLine {
    key: string
    count?: number
}

export interface CopyMessage {
    /** 'none': only errors - the caller shows the error and nothing else. */
    type: 'success' | 'warning' | 'none'
    titleKey: string
    lines: CopyMessageLine[]
}

export function emptyCopyTotals(): CopyTotals {
    return { created: 0, skipped: 0, sourceCount: 0, requests: 0, failed: 0, firstError: null }
}

export function addCopyResult(totals: CopyTotals, response: any): CopyTotals {
    const meta = response?.meta
    totals.requests++
    totals.created += Number(meta?.created ?? response?.data?.length ?? 0)
    totals.skipped += Number(meta?.skipped_duplicates ?? 0)
    // Older backends send no meta: an empty result then has no known reason.
    if (meta?.source_count === undefined || meta?.source_count === null || totals.sourceCount === null) {
        totals.sourceCount = null
    } else {
        totals.sourceCount += Number(meta.source_count)
    }
    return totals
}

export function addCopyError(totals: CopyTotals, error: any): CopyTotals {
    totals.requests++
    totals.failed++
    totals.firstError = totals.firstError ?? error
    return totals
}

const SOURCE_EMPTY: Record<CopyScope, string> = {
    day: 'dutySchedules.copyPaste.daySourceEmpty',
    week: 'dutySchedules.copyPaste.sourceEmpty',
    month: 'dutySchedules.copyPaste.monthSourceEmpty',
}

const ALL_SKIPPED_ONE: Record<CopyScope, string> = {
    day: 'dutySchedules.copyPaste.dayAllSkipped',
    week: 'dutySchedules.copyPaste.allSkipped',
    month: 'dutySchedules.copyPaste.manyAllSkippedMonth',
}

const ALL_SKIPPED_MANY: Record<CopyScope, string> = {
    day: 'dutySchedules.copyPaste.manyAllSkippedDay',
    week: 'dutySchedules.copyPaste.manyAllSkippedWeek',
    month: 'dutySchedules.copyPaste.manyAllSkippedMonth',
}

/**
 * @param many the paste covered several employees ("Medarbejderne har…"
 *             instead of "Medarbejderen har…").
 */
export function copyResultMessage(totals: CopyTotals, scope: CopyScope, many = false): CopyMessage {
    if (totals.created > 0) {
        const lines: CopyMessageLine[] = [{ key: 'dutySchedules.copyPaste.created', count: totals.created }]
        if (totals.skipped > 0) {
            lines.push({
                key: many ? 'dutySchedules.copyPaste.skippedMany' : 'dutySchedules.copyPaste.skipped',
                count: totals.skipped,
            })
        }
        return { type: 'success', titleKey: 'dutySchedules.copyPaste.resultTitle', lines }
    }

    // Nothing added and something failed: the error says why, a "nothing
    // added" next to it would only blur that.
    if (totals.failed > 0) {
        return { type: 'none', titleKey: '', lines: [] }
    }

    const reason = totals.sourceCount === 0
        ? SOURCE_EMPTY[scope]
        : totals.skipped > 0
            ? (many ? ALL_SKIPPED_MANY : ALL_SKIPPED_ONE)[scope]
            : null

    return {
        type: 'warning',
        titleKey: 'dutySchedules.copyPaste.noneCreatedTitle',
        lines: reason ? [{ key: reason }] : [],
    }
}

/** Every text key the messages above can use - the lang files must have them all. */
export const COPY_RESULT_KEYS: string[] = [
    'dutySchedules.copyPaste.resultTitle',
    'dutySchedules.copyPaste.noneCreatedTitle',
    'dutySchedules.copyPaste.created',
    'dutySchedules.copyPaste.skipped',
    'dutySchedules.copyPaste.skippedMany',
    ...Object.values(SOURCE_EMPTY),
    ...Object.values(ALL_SKIPPED_ONE),
    ...Object.values(ALL_SKIPPED_MANY),
]
