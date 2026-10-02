import { useUserStore } from '@/store/user'
import { useAlert } from '@/composables/alert'
import { userService } from '@/components/api/user/UserService'
import { usePermissions } from '@/composables/usePermissions'

/**
 * Keeps a page that changes company-wide settings to Admins:
 * definePageMeta({ middleware: 'require-admin' }).
 *
 * Hiding the button is not an access control - a colleague with the address, a
 * bookmark or the browser history would still land on the form and only learn
 * at submit that the API refuses them. The API enforces the same rule; this
 * just turns them back before the form is shown.
 *
 * They are sent to the list the page belongs to (/settings/schedule-tags/new ->
 * /settings/schedule-tags), where they can still read what exists.
 */
export default defineNuxtRouteMiddleware(async (to) => {
    const userStore = useUserStore() as any

    // On a cold navigation the layout's own user fetch hasn't run yet (route
    // middleware runs before layouts/user.vue mounts), so fetch it here rather
    // than deciding from an empty store - see require-page.ts.
    if (!userStore.getUser?.uuid) {
        try {
            const response = await userService.getUser()
            if (response?.data) {
                userStore.setUser(response.data)
            }
        } catch {
            // Falls through to the denial path below - an unauthenticated
            // request ends up there anyway.
        }
    }

    const { isAtLeast } = usePermissions()

    if (isAtLeast('Admin')) {
        return
    }

    const { errorAlert } = useAlert()
    const { $i18nGlobal } = useNuxtApp() as any
    errorAlert($i18nGlobal.t('alert.warning'), $i18nGlobal.t('alert.pageAccessDenied'))

    return navigateTo(to.path.split('/').slice(0, 3).join('/'))
})
