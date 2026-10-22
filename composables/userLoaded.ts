import { watch } from 'vue'
import { useUserStore } from '@/store/user'

/**
 * Resolves once the signed-in user has actually loaded.
 *
 * The user store starts as an empty object, which is truthy, so a page that checks
 * a role or permission as soon as it mounts decides from nothing on a cold load
 * (direct URL, reload) and sends an Admin away. Await this first.
 */
export function whenUserLoaded(): Promise<void> {
    const userStore = useUserStore() as any

    if (userStore.getUser?.uuid) return Promise.resolve()

    return new Promise((resolve) => {
        const stop = watch(
            () => userStore.getUser?.uuid,
            (uuid: any) => {
                if (!uuid) return
                stop()
                resolve()
            }
        )
    })
}
