/**
 * Whether a booking page should send the signed-in person back to the calendar.
 *
 * The user store starts as an empty object and is persisted, so on a cold load
 * (a typed address, a bookmark, a refresh) a page that reads it at once sees
 * `{}`, which is truthy and has no `has_booking_app_access`. Deciding from that
 * bounced people who do have booking access. Only a loaded user (one with a
 * uuid) can be told "no access".
 */
export function shouldLeaveBookingPages(user: any): boolean {
    return Boolean(user?.uuid) && !user.has_booking_app_access
}
