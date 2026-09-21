import { useUserStore } from '@/store/user'
import { principalFor } from '@/utils/desktopPrincipal'

/**
 * Reports the signed-in principal to the desktop shell, and keeps reporting it
 * as the user changes - including `staff` on sign-out, so the next person on
 * this machine does not inherit a portal's Dock menu.
 *
 * A no-op in a browser tab, where there is no native chrome to correct. The
 * rule itself lives in `utils/desktopPrincipal.ts`.
 */
export function useDesktopPrincipal(): void {
    const bridge = typeof window !== 'undefined' ? (window as any).citizenOneDesktop : undefined
    if (!bridge?.isDesktop || typeof bridge.setPrincipal !== 'function') return

    const userStore = useUserStore() as any

    watch(
        () => userStore.getUser,
        (user: any) => {
            try {
                bridge.setPrincipal(principalFor(user))
            } catch {
                // The menus being one role behind is not worth breaking a page over.
            }
        },
        { immediate: true },
    )
}
