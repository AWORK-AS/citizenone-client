/**
 * Who is signed in, as far as the desktop shell's native chrome needs to know.
 *
 * The Electron window has always loaded the same app for everyone, and the
 * portals work inside it. What did not know the difference is the chrome
 * around the window: the Dock menu offered "Ny samtale", "Ny note" and a list
 * of recently viewed citizens, ⌘, opened the company settings and ⌘⇧N a
 * journal-note composer - four staff routes a relative's or a patient's token
 * is refused by, all of them one click away in the OS.
 *
 * The kind is resolved on this side from the same field
 * `resolvePostLoginRedirect` routes on, so there is one copy of the rule.
 */
export type DesktopPrincipal = 'staff' | 'relative' | 'third-party' | 'citizen' | 'patient'

export function principalFor(user: any): DesktopPrincipal {
    const role = user?.role ?? user?.roles?.[0]?.name

    if (role === 'Relative') return 'relative'
    if (role === 'ThirdParty') return 'third-party'
    if (role === 'Citizen') {
        // One signal on every payload the store can hold: the login response,
        // the citizen "me" endpoint and the patient one all report
        // `is_patient_portal` now. This used to read the company industry and
        // then sniff the payload's shape, because the industry is absent from
        // the "me" responses the portal refreshes from - so a patient was
        // reported as a citizen the moment that refresh landed, and the window
        // sat on /patient/overview while the Dock offered the citizen's menu.
        return user?.is_patient_portal ? 'patient' : 'citizen'
    }

    // Signed out included: the menus a login screen leads to are the staff ones.
    return 'staff'
}
