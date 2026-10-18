// Which of a citizen's fields this company shows, and to which roles.
//
// Every one of these used to start with `isAtLeast('Admin') ||`, which meant the
// setting had no effect on the person most likely to be looking at it: an admin
// saw every field whatever the company had chosen, so a dental clinic met
// Indsats timer, EAN-nummer and Visitationskommune on every patient however it
// configured itself. An admin now sees what the company configured, and can
// change it in settings.
//
// A company that has never configured the list keeps exactly what it has today -
// admins see everything, everyone else sees nothing - because reading the empty
// list as "show everything" would hand social security numbers and diagnoses to
// staff who cannot see them now.
//
// Shared by the citizen card header and the citizen hover card, so a field the
// company hid or limited to some roles is hidden on both. Kept free of Vue and
// the store so it runs under node --test; `useCitizenFieldVisibility` wires it
// to the signed-in user.

// Fields the card showed to everyone before they could be chosen. A company
// that has not chosen its fields keeps seeing them.
export const ALWAYS_SHOWN_UNTIL_CHOSEN = ['Phone', 'Spoken languages', 'Case worker', 'Case number']

/**
 * A field the company limited to some roles is shown to people holding one of
 * them. Admins always see what the company shows, so they can check it.
 */
export function mayRoleSeeCitizenField(user: any, isAdmin: boolean, name: string): boolean {
    const limits = user?.company?.citizen_display_roles ?? {}
    const allowed: number[] = limits[name] ?? []
    if (!allowed.length || isAdmin) return true

    const mine = (user?.roles ?? []).map((role: any) => Number(role.id))
    return allowed.some((id) => mine.includes(Number(id)))
}

export function showsCitizenFieldFor(user: any, isAdmin: boolean, name: string): boolean {
    const displays = user?.company?.citizen_displays
    const configured = Array.isArray(displays) && displays.length > 0
    if (!configured) return ALWAYS_SHOWN_UNTIL_CHOSEN.includes(name) || isAdmin
    if (!displays.some((display: any) => display.en_name === name)) return false

    return mayRoleSeeCitizenField(user, isAdmin, name)
}
