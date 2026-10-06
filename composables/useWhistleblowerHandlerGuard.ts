import { useUserStore } from '@/store/user'

/**
 * Sends anyone who is not one of the company's whistleblower handlers back to
 * the overview. The API refuses them anyway; this just avoids showing an empty
 * inbox that then errors.
 */
export function useWhistleblowerHandlerGuard() {
    const userStore = useUserStore() as any

    // Only on an explicit false: a user cached in the browser from before this
    // field existed has no value until the layout fetches the fresh one.
    watch(() => userStore.getUser, (user: any) => {
        if (user?.uuid && user.is_whistleblower_handler === false) navigateTo('/overview')
    }, { immediate: true })
}
