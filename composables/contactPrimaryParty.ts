/**
 * The primary party (primær part) of a citizen: the contact the case is about
 * besides the citizen, e.g. a parent. Our own staff (our_contact_person) are
 * never a party, so they get no switch and the key is never sent for them.
 */

/** Whether the contact form shows the primary-party switch for this kind of contact. */
export function showsPrimaryParty(title: string | null | undefined): boolean {
    return !!title && title !== 'our_contact_person'
}

/**
 * The is_primary_party part of the contact payload. Empty when the switch is
 * not shown, so an update keeps what is stored.
 */
export function primaryPartyParam(details: { title?: string | null, is_primary_party?: unknown }): { is_primary_party?: boolean } {
    if (!showsPrimaryParty(details?.title)) return {}
    return { is_primary_party: details.is_primary_party === true }
}
