/**
 * Whether the signed-in user may change a calendar event: edit, delete, cancel
 * or mark it done. The API sends can_manage on the calendar list; it is false
 * only when the company keeps colleagues' events read-only (Settings → Company)
 * and the event is someone else's (AW-2026-9924). A missing flag (an older API,
 * another list) keeps today's behaviour: the event can be changed.
 */
export function canManageEvent(event: any): boolean {
    return event?.can_manage !== false
}
