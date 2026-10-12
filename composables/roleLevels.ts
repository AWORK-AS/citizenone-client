// Role thresholds for isAtLeast(). Mirrors App\Models\User::isAtLeast in the
// backend, including the Superadmin level that was missing from both.
export const ROLE_LEVELS: Record<string, number> = {
    Superadmin: 100,
    Admin: 80,
    Manager: 50,
    User: 20,
}

/**
 * The level a role name demands. A name we do not know demands more than any
 * role can have, so a typo or a future role denies instead of granting. It
 * used to fall back to 0, which made isAtLeast() true for every user.
 */
export function roleThreshold(roleName: string): number {
    return ROLE_LEVELS[roleName] ?? Number.POSITIVE_INFINITY
}
