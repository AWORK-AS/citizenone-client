// Who may buy: the one check behind every upsell (top-bar "Upgrade now", the Cody banner).
//
// It is the check the app store page already uses (pages/apps/[slug].vue): the backend's
// can_manage from the Cody adoption status, the manage_licenses permission, or the Admin role
// as a fallback. It only decides whether to SHOW an offer to someone who cannot act on it;
// the backend still enforces every purchase.
//
// Inside the desktop app nobody is shown an offer. The desktop app is distributed through the
// Mac App Store, where paid plans, add-ons, storage and coupon codes may only be sold through
// Apple's In-App Purchase (App Review guideline 3.1.1). Customers buy on the web, and the
// desktop app only gives access to what the company already has.

export function canPurchase(input: {
    canManage?: boolean | null
    hasLicensePermission?: boolean | null
    roles?: Array<{ name?: string }> | null
    inDesktopApp?: boolean | null
}): boolean {
    if (input.inDesktopApp) return false

    return !!input.canManage
        || !!input.hasLicensePermission
        || !!input.roles?.some(role => role?.name === 'Admin')
}

// Pages that sell something: plans, add-ons and coupon codes, extra storage, unpaid invoices,
// and the app store (paid apps, trials that turn into a charge).
// The desktop app never opens them (middleware/desktop-no-purchase.global.ts).
// The billing overview, invoices and card transactions list prices and card payments made
// outside the App Store, so the desktop app does not open them either.
// /subscription/suspended is not one: a suspended company is sent there from every request, and
// the page itself hides its payment button in the desktop app.
const PURCHASE_ROUTE_PREFIXES = [
    '/subscription', '/settings/subscription', '/storage/upgrade', '/apps',
    '/settings/billing-overview', '/settings/invoices', '/settings/transactions',
]
const NOT_PURCHASE_ROUTES = ['/subscription/suspended']

export function isPurchaseRoute(path: string | null | undefined): boolean {
    if (!path) return false
    const clean = path.split(/[?#]/)[0].replace(/\/+$/, '') || '/'

    if (NOT_PURCHASE_ROUTES.includes(clean)) return false

    return PURCHASE_ROUTE_PREFIXES.some(prefix => clean === prefix || clean.startsWith(`${prefix}/`))
}
