// Who may buy: the one check behind every upsell (top-bar "Upgrade now", the Cody banner).
//
// It is the check the app store page already uses (pages/apps/[slug].vue): the backend's
// can_manage from the Cody adoption status, the manage_licenses permission, or the Admin role
// as a fallback. It only decides whether to SHOW an offer to someone who cannot act on it;
// the backend still enforces every purchase.

export function canPurchase(input: {
    canManage?: boolean | null
    hasLicensePermission?: boolean | null
    roles?: Array<{ name?: string }> | null
}): boolean {
    return !!input.canManage
        || !!input.hasLicensePermission
        || !!input.roles?.some(role => role?.name === 'Admin')
}
