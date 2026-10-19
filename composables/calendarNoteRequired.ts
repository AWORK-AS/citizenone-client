/**
 * Pure helpers for "a citizen booking is done only with a saved journal note"
 * (CITIZE-100), a company switch in Settings -> Company. Free of Vue and
 * auto-imports so they can be tested with
 * `node --test tests/unit/calendarNoteRequired.test.mjs`.
 *
 * The server is the judge (PUT .../status answers 422 with code
 * `note_required`); these only decide when the calendar opens the note form
 * straight away instead of sending a request that would be refused.
 */

/**
 * The company switch, off unless an Admin turned it on. A company without the
 * field (an older payload) counts as off, so the calendar works as before.
 */
export function isCalendarNoteRequiredOn(company: any): boolean {
    return company?.calendar_note_required_enabled === true
}

/**
 * Whether choosing "done" on this calendar event should open the note form
 * first: the switch is on, it is a booking on a citizen (not a shift, not an
 * own or employee event), and no note is linked to it yet. A linked note may
 * still be a draft; then the server refuses and the form opens after all.
 */
export function needsNoteBeforeDone(event: any, company: any): boolean {
    if (!isCalendarNoteRequiredOn(company) || !event || event.is_shift) {
        return false
    }

    if (event.type !== 'citizens' || !event.citizen_id) {
        return false
    }

    return !event.journal && !event.journal_id
}

/** The server's refusal of "done" for a booking without a saved note. */
export function isNoteRequiredError(error: any): boolean {
    return error?.code === 'note_required'
}

/** The booking's status as the note header shows it. */
export function bookingStatusKey(status: string | null | undefined): 'planned' | 'completed' | 'notCompleted' {
    if (status === 'completed') return 'completed'
    if (status === 'not_completed') return 'notCompleted'

    return 'planned'
}
