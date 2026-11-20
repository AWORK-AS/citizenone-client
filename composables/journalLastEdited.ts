/**
 * AW-2026-10676: "Sidst redigeret af ... den ..." under a journal note's
 * "Oprettet af ... den ...". The created line never changes; this line says
 * when the content was last changed and by whom.
 *
 * Free of Vue so it can be tested with `node --test tests/unit/journalLastEdited.test.mjs`.
 */

/** Edits within this many minutes of writing the note (typo fixes) add no line. */
export const LAST_EDITED_MIN_MINUTES = 5

/** "2026-11-18T09:00:00.000000Z" has more fractional digits than Date accepts everywhere. */
function toTime(value: unknown): number {
    if (!value) return NaN
    const text = String(value).replace(/(\.\d{3})\d+/, '$1').replace(' ', 'T')
    return Date.parse(text)
}

/** Whether to show the "last edited" line for a note from the API. */
export function showLastEdited(journal: any): boolean {
    if (!journal?.edited_at || !journal?.updated_by) return false
    const edited = toTime(journal.edited_at)
    const created = toTime(journal.created_at)
    if (Number.isNaN(edited) || Number.isNaN(created)) return false
    return edited - created > LAST_EDITED_MIN_MINUTES * 60 * 1000
}
