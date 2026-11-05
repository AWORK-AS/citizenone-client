import { canPurchase } from '@/composables/purchaseAccess'
import { useIsDesktopApp } from '@/composables/useIsDesktopApp'
import { useUserStore } from '@/store/user'

/** True for someone who can actually buy; the upsells are hidden from everyone else, and from everyone in the desktop app. */
export function useCanPurchase(options: { allowInDesktopApp?: boolean } = {}) {
    const userStore = useUserStore() as any
    const { can } = usePermissions()
    const codyStatus = useState<any>('cody-adoption-status', () => null)
    // allowInDesktopApp: for an action that is not a purchase (assigning a Cody seat) but goes to the same people.
    const inDesktopApp = options.allowInDesktopApp ? false : useIsDesktopApp()

    return computed(() => canPurchase({
        canManage: codyStatus.value?.can_manage,
        hasLicensePermission: can('manage_licenses'),
        roles: userStore.getUser?.roles,
        inDesktopApp,
    }))
}
