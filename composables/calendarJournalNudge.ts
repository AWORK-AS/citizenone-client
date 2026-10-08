/**
 * Whether a calendar event is a citizen booking still waiting for its journal
 * note: the same rule as the backend's MyCalendar::scopeNeedingJournalNote,
 * which drives the reminder notification, so the badge and the reminder agree.
 *
 * - a citizen booking (type 'citizens' with a citizen), not a shift;
 * - no journal note linked yet;
 * - ended, at most seven days ago;
 * - not marked "not completed" (nothing happened, so nothing to write).
 *
 * Kept free of Vue, moment and auto-imports so it can be unit tested with
 * `node --test tests/unit/calendarJournalNudge.test.mjs`.
 */
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

// The API sends local wall-clock text, "2026-10-08 14:30:00".
function parseLocal(value: unknown): Date | null {
    if (typeof value !== 'string' || value === '') return null
    const date = new Date(value.replace(' ', 'T'))
    return Number.isNaN(date.getTime()) ? null : date
}

export function needsJournalNote(event: any, now: Date = new Date()): boolean {
    if (!event || event.is_shift) return false
    if (event.type !== 'citizens' || !event.citizen_id) return false
    if (event.journal_id) return false
    if (event.completion_status === 'not_completed') return false

    const end = parseLocal(event.date_time_end)
    if (!end) return false

    return end.getTime() < now.getTime() && end.getTime() >= now.getTime() - SEVEN_DAYS_MS
}
