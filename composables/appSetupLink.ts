// Where an activated app is managed. Shared by the app card and the app details
// modal so the store and the modal can never disagree about the destination.
const SETUP_LINKS: Record<string, string> = {
    'economic': '/settings/economic',
    'power-bi': '/settings/power-bi',
    // The three portal apps are managed from Portal access: who has a login,
    // how many seats are in use, and what each audience may see.
    'relative-access': '/settings/portal-access',
    'third-party-access': '/settings/portal-access',
    'citizen-access': '/settings/portal-access',
}

export function appSetupLinkFor(app: any): string | null {
    return SETUP_LINKS[app?.generic_name as string] ?? null
}
