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
 * The kind is resolved on this side because telling a patient from a citizen
 * needs the company's industry, which is the rule `resolvePostLoginRedirect`
 * already applies. Sending a resolved kind keeps one copy of it.
 */
export type DesktopPrincipal = 'staff' | 'relative' | 'third-party' | 'citizen' | 'patient'

export function principalFor(user: any): DesktopPrincipal {
    const role = user?.role ?? user?.roles?.[0]?.name

    if (role === 'Relative') return 'relative'
    if (role === 'ThirdParty') return 'third-party'
    if (role === 'Citizen') {
        return user?.company?.industry?.system_name === 'dental' ? 'patient' : 'citizen'
    }

    // Signed out included: the menus a login screen leads to are the staff ones.
    return 'staff'
}
