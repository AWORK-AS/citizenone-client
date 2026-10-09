import { useUserStore } from '@/store/user'
import { roleThreshold } from '@/composables/roleLevels'

export function getPermissionLabel(permission: any, locale: string): string {
    return permission?.[`${locale}_name`] || permission?.name?.replace(/_/g, ' ') || ''
}


/**
 * Superadmin-panelets områder, som backendens `App\Support\SuperadminPermissions` har dem.
 *
 * Listen er duplikeret her med vilje. For netop disse navne er `superadmin_permissions`
 * fra brugerens payload det eneste rigtige svar - den er beregnet med `can()` i
 * backenden og kender både fratrækket i `user_revoked_permissions` og at Superadmin har
 * alt implicit. Den flade `permissions` gør ikke: den er direkte plus rollens, så en
 * rettighed nogen bevidst har fjernet står der stadig, fordi rollen giver den.
 *
 * Uden listen kunne `can()` ikke skelne, og et fratræk ville vise et menupunkt der
 * svarer 403. Med den koster en ny rettighed i backenden en linje her - og gør den ikke
 * det, opfører den sig som før, altså som en almindelig rettighed.
 */
export const PANEL_PERMISSIONS = new Set([
    'access_superadmin',
    'view_dashboard',
    'view_companies',
    'manage_companies',
    'view_accounts',
    'manage_accounts',
    'view_team',
    'manage_team',
    'view_sales_inquiries',
    'manage_sales_inquiries',
    'view_financials',
    'manage_financials',
    'view_management',
    'manage_licenses',
    'manage_imports',
    'view_apps',
    'manage_apps',
    'view_marketing',
    'manage_marketing',
    'view_content',
    'manage_content',
    'view_email_logs',
    'view_data_retention',
    'impersonate_users',
])

export function usePermissions() {
    const userStore = useUserStore() as any

    function maxRoleLevel(): number {
        const roles: any[] = userStore.getUser?.roles ?? []
        if (!roles.length) return 0
        return Math.max(...roles.map((r: any) => r.level ?? 0))
    }

    function isAtLeast(roleName: string): boolean {
        const threshold = roleThreshold(roleName)
        return maxRoleLevel() >= threshold
    }

    function isPlatformStaff(): boolean {
        const roles: any[] = userStore.getUser?.roles ?? []

        return roles.some((role: any) => !!role.is_platform_role)
    }

    function can(permissionName: string): boolean {
        // Panelets områder besvares kun af den liste backenden har regnet ud. Se
        // PANEL_PERMISSIONS ovenfor for hvorfor de ikke må falde tilbage.
        if (PANEL_PERMISSIONS.has(permissionName) && isPlatformStaff()) {
            const granted: string[] = userStore.getUser?.superadmin_permissions ?? []

            return granted.includes(permissionName)
        }

        // Use the flat permissions list on the user object (combined from all roles)
        const permissions: any[] = userStore.getUser?.permissions ?? []
        if (permissions.some((p: any) => p.name === permissionName)) return true
        // Fallback: check nested role permissions
        const roles: any[] = userStore.getUser?.roles ?? []
        return roles.some((role: any) =>
            role.permissions?.some((p: any) => p.name === permissionName)
        )
    }

    return { isAtLeast, can, isPlatformStaff }
}
