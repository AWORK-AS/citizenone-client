/**
 * Pure helpers for cancelling (aflyse) a calendar event and moving it to a new
 * time. Free of Vue and auto-imports so they can be tested with
 * `node --test tests/unit/calendarCancel.test.mjs`.
 */

/** Whether the event was cancelled. */
export function isCancelled(event: any): boolean {
    return event?.completion_status === 'cancelled'
}

/** Done / not done only for an event that was not cancelled. */
export function canMarkStatus(event: any): boolean {
    return !!event?.uuid && !event?.is_shift && !isCancelled(event)
}

/**
 * Where the new-time fields start: the same time a week later, as most
 * visits are weekly. 'YYYY-MM-DD HH:mm', as the date-time field takes it.
 */
export function suggestedNewTime(start: string, end: string): { start: string, end: string } {
    const shift = (value: string) => {
        const date = new Date(value.replace(' ', 'T'))
        if (Number.isNaN(date.getTime())) return ''
        date.setDate(date.getDate() + 7)
        const pad = (n: number) => String(n).padStart(2, '0')
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
    }

    return { start: shift(start ?? ''), end: shift(end ?? '') }
}

/** What the cancel request sends: the reason, and the new time only when moving. */
export function cancelPayload(reason: string, move: boolean, start: string, end: string): { reason: string | null, reschedule_start?: string, reschedule_end?: string } {
    const trimmed = (reason ?? '').trim()
    const payload: { reason: string | null, reschedule_start?: string, reschedule_end?: string } = { reason: trimmed || null }

    if (move && start && end) {
        payload.reschedule_start = start
        payload.reschedule_end = end
    }

    return payload
}
