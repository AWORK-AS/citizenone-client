/**
 * Pure logic for saving the same medicine registration on several dates.
 *
 * The modal fires one request per date. When some fail, the dates that
 * succeeded must leave the selection, otherwise a retry registers them a
 * second time (duplicate dose history).
 */
export type MultiDateOutcome = {
    succeeded: string[]
    failed: { date: string; error: any }[]
}

export async function saveDatesSettled(
    dates: string[],
    saveOne: (date: string) => Promise<unknown>
): Promise<MultiDateOutcome> {
    const results = await Promise.allSettled(dates.map((d) => saveOne(d)))
    const outcome: MultiDateOutcome = { succeeded: [], failed: [] }
    results.forEach((r, i) => {
        if (r.status === 'fulfilled') outcome.succeeded.push(dates[i])
        else outcome.failed.push({ date: dates[i], error: r.reason })
    })
    return outcome
}

/** The selection after a save: only the dates that did not succeed. */
export function remainingDates(selected: string[], outcome: MultiDateOutcome): string[] {
    const done = new Set(outcome.succeeded)
    return selected.filter((d) => !done.has(d))
}
