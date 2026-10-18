import { useUserStore } from '@/store/user'
import { usePermissions } from '@/composables/usePermissions'
import { mayRoleSeeCitizenField, showsCitizenFieldFor } from '@/composables/citizenFieldVisibility'

/**
 * `showsCitizenField(name)` and `mayRoleSeeField(name)` for the signed-in user,
 * read from `company.citizen_displays` and `company.citizen_display_roles`.
 * `name` is the field's English name as the settings store it (`en_name`).
 */
export function useCitizenFieldVisibility() {
    const userStore = useUserStore() as any
    const { isAtLeast } = usePermissions()

    function showsCitizenField(name: string): boolean {
        return showsCitizenFieldFor(userStore.getUser, isAtLeast('Admin'), name)
    }

    function mayRoleSeeField(name: string): boolean {
        return mayRoleSeeCitizenField(userStore.getUser, isAtLeast('Admin'), name)
    }

    return { showsCitizenField, mayRoleSeeField }
}
