/**
 * Completing the survey assignments answered inside a journal note. The note
 * is saved first, so a survey that fails must not stop the others, and must
 * be kept so it can be sent again on its own.
 */

export interface PendingSurveyAnswer {
    assignment_uuid: string
    answers: any
}

/**
 * Sends every entry and returns the ones that failed (in the original order).
 * An empty list means everything was registered.
 */
export async function completeSurveyEntries(
    entries: PendingSurveyAnswer[] | null | undefined,
    complete: (entry: PendingSurveyAnswer) => Promise<unknown>,
): Promise<PendingSurveyAnswer[]> {
    if (!Array.isArray(entries) || entries.length === 0) return []
    const failed: PendingSurveyAnswer[] = []
    for (const entry of entries) {
        try {
            await complete(entry)
        } catch {
            failed.push(entry)
        }
    }
    return failed
}
