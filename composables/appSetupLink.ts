// Where an activated app is managed or used. Shared by the app card and the app
// details modal so the store and the modal can never disagree, and so "My apps"
// can act as the hub for everything the company has bought.
//
// `open: true` means the destination is the app's own area rather than a
// settings page, which changes the button wording.
type AppDestination = { path: string; open?: boolean }

const APP_LINKS: Record<string, AppDestination> = {
    // Integrations
    'economic': { path: '/settings/economic' },
    'power-bi': { path: '/settings/power-bi' },
    'microsoft-sso': { path: '/settings/company' },
    // Portal apps: who has a login, and what each audience may see
    'relative-access': { path: '/settings/portal-access' },
    'third-party-access': { path: '/settings/portal-access' },
    'citizen-access': { path: '/settings/portal-access' },
    'caseworker-access': { path: '/settings/license-overview/caseworker' },
    // Apps with their own area in the product
    'surveys': { path: '/surveys', open: true },
    'leads': { path: '/leads', open: true },
    'secure-mail': { path: '/mail/inbox', open: true },
    'regular-mail': { path: '/mail/inbox', open: true },
    'google-drive': { path: '/drive', open: true },
    'salary.dk': { path: '/schedules', open: true },
    'danlon': { path: '/schedules', open: true },
}

export function appDestinationFor(app: any): AppDestination | null {
    return APP_LINKS[app?.generic_name as string] ?? null
}

/** Path only, for callers that just need somewhere to navigate. */
export function appSetupLinkFor(app: any): string | null {
    return appDestinationFor(app)?.path ?? null
}
