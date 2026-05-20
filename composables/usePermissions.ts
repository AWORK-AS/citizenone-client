import { useUserStore } from '@/store/user'

export function getPermissionLabel(permission: any, locale: string): string {
    return permission?.[`${locale}_name`] || permission?.name?.replace(/_/g, ' ') || ''
}

const ROLE_LEVELS: Record<string, number> = {
    Admin: 80,
    Manager: 50,
    User: 20,
}


export function usePermissions() {
    const userStore = useUserStore() as any

    function maxRoleLevel(): number {
        const roles: any[] = userStore.getUser?.roles ?? []
        if (!roles.length) return 0
        return Math.max(...roles.map((r: any) => r.level ?? 0))
    }

    function isAtLeast(roleName: string): boolean {
        const threshold = ROLE_LEVELS[roleName] ?? 0
        return maxRoleLevel() >= threshold
    }

    function can(permissionName: string): boolean {
        // Use the flat permissions list on the user object (combined from all roles)
        const permissions: any[] = userStore.getUser?.permissions ?? []
        if (permissions.some((p: any) => p.name === permissionName)) return true
        // Fallback: check nested role permissions
        const roles: any[] = userStore.getUser?.roles ?? []
        return roles.some((role: any) =>
            role.permissions?.some((p: any) => p.name === permissionName)
        )
    }

    return { isAtLeast, can }
}
