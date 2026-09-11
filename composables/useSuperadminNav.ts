/**
 * Superadmin-panelets menu, og den rettighed hvert punkt kræver.
 *
 * Listen lå i `layouts/superadmin.vue`, hvor den kun var en menu. Nu er den også svaret
 * på hvad en rute kræver: `middleware/superadmin-permission.global.ts` slår punktet op
 * ud fra stien og spørger om den samme rettighed. To lister ville drifte fra hinanden,
 * og resultatet af det er den værste af de to fejl - et menupunkt der åbner en side, som
 * så beder API'et om noget den svarer 403 på, eller en side der er skjult men åben.
 *
 * `permission` er navnet fra `App\Support\SuperadminPermissions` i backenden. Er den
 * null, er punktet åbent for alle der er lukket ind i panelet.
 *
 * Rettighederne her er ikke adgangskontrollen. Den ligger på ruterne i API'et, 64
 * steder. Det her er hvad kollegaen får at se, så de ikke render ind i en 403.
 */
export type SuperadminNavItem = {
    name: string
    label: string
    href: string
    icon: string
    routes?: string[]
    permission?: string | null
}

export type SuperadminNavGroups = {
    oversigt: SuperadminNavItem[]
    okonomi: SuperadminNavItem[]
    platform: SuperadminNavItem[]
}

export const superadminNav: SuperadminNavGroups = {
    oversigt: [
        { name: 'Dashboard', label: 'superadmin.sidebar.dashboard', href: '/superadmin/dashboard', icon: 'material-symbols:dashboard', permission: 'view_dashboard', routes: ['superadmin-dashboard', 'superadmin-analytics'] },
        { name: 'Companies', label: 'superadmin.sidebar.companies', href: '/superadmin/companies', icon: 'ph:buildings', permission: 'view_companies', routes: ['superadmin-companies', 'superadmin-companies-new', 'superadmin-companies-company_uuid-edit', 'superadmin-companies-company_uuid-accounts', 'superadmin-companies-company_uuid-accounts-new', 'superadmin-companies-company_uuid-accounts-account_uuid-edit', 'superadmin-companies-company_uuid-invoices', 'superadmin-companies-company_uuid-license-overview', 'superadmin-companies-company_uuid-apps', 'superadmin-companies-company_uuid-overview'] },
        { name: 'Users', label: 'superadmin.sidebar.users', href: '/superadmin/users', icon: 'ph:users-three', permission: 'view_team', routes: ['superadmin-users', 'superadmin-users-new', 'superadmin-users-edit-uuid'] },
        { name: 'TeamRoles', label: 'superadmin.sidebar.teamRoles', href: '/superadmin/team-roles', icon: 'ph:shield-check', permission: 'view_team', routes: ['superadmin-team-roles'] },
        { name: 'SalesInquiries', label: 'superadmin.sidebar.salesInquiries', href: '/superadmin/sales-inquiries', icon: 'ph:tray', permission: 'view_sales_inquiries', routes: ['superadmin-sales-inquiries'] },
        { name: 'SupportAccess', label: 'superadmin.sidebar.supportAccess', href: '/superadmin/support-access', icon: 'ph:lock-key', permission: 'impersonate_users', routes: ['superadmin-support-access'] },
    ],
    okonomi: [
        { name: 'Invoices', label: 'superadmin.sidebar.invoices', href: '/superadmin/invoices', icon: 'ph:invoice', permission: 'view_financials', routes: ['superadmin-invoices', 'superadmin-invoices-invoice_uuid'] },
        { name: 'Orders', label: 'superadmin.sidebar.orders', href: '/superadmin/orders', icon: 'ph:database', permission: 'view_financials', routes: ['superadmin-orders'] },
        { name: 'PaymentFees', label: 'superadmin.sidebar.paymentFees', href: '/superadmin/payment-fees', icon: 'ph:percent', permission: 'view_financials', routes: ['superadmin-payment-fees'] },
    ],
    platform: [
        { name: 'Apps', label: 'superadmin.sidebar.apps', href: '/superadmin/apps', icon: 'ic:baseline-apps', permission: 'view_apps', routes: ['superadmin-apps', 'superadmin-apps-new', 'superadmin-apps-appUuid-edit'] },
        { name: 'App categories', label: 'superadmin.sidebar.appCategories', href: '/superadmin/app-categories', icon: 'ic:baseline-category', permission: 'view_apps', routes: ['superadmin-app-categories'] },
        { name: 'Sales Campaign', label: 'superadmin.sidebar.salesCampaign', href: '/superadmin/sales-campaign', icon: 'ph:megaphone-simple', permission: 'view_marketing', routes: ['superadmin-sales-campaign', 'superadmin-sales-campaign-new', 'superadmin-sales-campaign-edit-uuid'] },
        { name: 'Polls', label: 'superadmin.sidebar.polls', href: '/superadmin/polls', icon: 'ph:chart-bar-horizontal', permission: 'view_marketing', routes: ['superadmin-polls', 'superadmin-polls-new', 'superadmin-polls-pollUuid', 'superadmin-polls-pollUuid-edit'] },
        { name: 'Coupons', label: 'superadmin.sidebar.coupons', href: '/superadmin/coupons', icon: 'ic:outline-discount', permission: 'view_marketing', routes: ['superadmin-coupons', 'superadmin-coupons-new', 'superadmin-coupons-couponUuid-edit'] },
        { name: 'StorageUsage', label: 'superadmin.sidebar.storageUsage', href: '/superadmin/dashboard/company-storage', icon: 'ph:hard-drives', permission: 'view_dashboard', routes: ['superadmin-dashboard-company-storage'] },
        { name: 'StoragePackages', label: 'superadmin.sidebar.storagePackages', href: '/superadmin/storage-packages', icon: 'ph:cloud', permission: 'view_apps', routes: ['superadmin-storage-packages'] },
        { name: 'Industries', label: 'superadmin.sidebar.industries', href: '/superadmin/industries', icon: 'ph:buildings', permission: 'view_content', routes: ['superadmin-industries'] },
        { name: 'EmailTemplates', label: 'superadmin.sidebar.emailTemplates', href: '/superadmin/email-templates', icon: 'ph:envelope-simple', permission: 'view_content', routes: ['superadmin-email-templates'] },
        { name: 'ReleaseNotes', label: 'releaseNotes.title', href: '/superadmin/release-notes', icon: 'ph:sparkle', permission: 'view_content', routes: ['superadmin-release-notes'] },
    ],
}

/**
 * Punktet en sti hører til, hvis der er et.
 *
 * Længste træffer vinder, fordi `/superadmin/dashboard/company-storage` både matcher
 * lagerforbruget og dashboardet, og det er lagerforbrugets rettighed der skal gælde.
 */
export function superadminNavItemForPath(path: string): SuperadminNavItem | null {
    const items = [...superadminNav.oversigt, ...superadminNav.okonomi, ...superadminNav.platform]

    const matches = items
        .filter((item) => path === item.href || path.startsWith(item.href + '/'))
        .sort((a, b) => b.href.length - a.href.length)

    return matches[0] ?? null
}

export function useSuperadminNav() {
    const { can } = usePermissions()

    const visible = computed<SuperadminNavGroups>(() => ({
        oversigt: superadminNav.oversigt.filter((item) => !item.permission || can(item.permission)),
        okonomi: superadminNav.okonomi.filter((item) => !item.permission || can(item.permission)),
        platform: superadminNav.platform.filter((item) => !item.permission || can(item.permission)),
    }))

    /**
     * Hvor en kollega skal sendes hen, når de ikke må se den side de bad om - eller da de
     * loggede ind. Det første punkt de faktisk har adgang til, frem for et fast
     * /superadmin/dashboard, som en bogholder ikke må se.
     */
    const firstAllowedHref = computed<string | null>(() => {
        const groups = visible.value

        return groups.oversigt[0]?.href ?? groups.okonomi[0]?.href ?? groups.platform[0]?.href ?? null
    })

    return { visible, firstAllowedHref }
}
