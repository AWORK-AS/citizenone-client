/**
 * CitizenOne Online Meetings is priced per host. Whether the signed-in person
 * may create and hold meetings: the company has the app and the person has a
 * seat. Joining a meeting needs no seat, so this only gates creating one.
 * The API checks the same and answers `meeting_host_seat_required`.
 */
export function canHostMeetings(user: any): boolean {
    return Boolean(user?.company?.meetings_enabled) && Boolean(user?.has_meetings_seat)
}

/**
 * Whether to show "ask an administrator for a seat": only for a loaded user
 * (the store starts as `{}`) whose company has the app but who has no seat.
 */
export function needsMeetingsSeat(user: any): boolean {
    return Boolean(user?.uuid) && Boolean(user?.company?.meetings_enabled) && !user?.has_meetings_seat
}
