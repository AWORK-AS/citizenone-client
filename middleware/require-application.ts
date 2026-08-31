import { useUserStore } from '@/store/user'
import { useAlert } from '@/composables/alert'
import { userService } from '@/components/api/user/UserService'

/**
 * Gates a route on the company having bought the app it belongs to
 * (definePageMeta({ middleware: 'require-application', requiredApplication:
 * 'tasks_workflow_enabled' })). The backend already refuses the underlying
 * API calls, but nav-hiding the link is cosmetic only - a direct URL still
 * rendered the full page chrome before the reactive error. Mirrors
 * require-page's redirect shape for a route that isn't behind its own page
 * permission entry, just a company entitlement flag.
 */
export default defineNuxtRouteMiddleware(async (to) => {
    const requiredApplication = to.meta?.requiredApplication as string | undefined

    if (!requiredApplication) {
        return
    }

    const userStore = useUserStore() as any

    // On a cold/hard navigation the layout's own user fetch hasn't run yet
    // (it only fires from layouts/user.vue's onMounted, which is after route
    // middleware), so the store is still empty here - fetch it directly
    // rather than deciding access from data that hasn't loaded, which was
    // denying entitled users on every fresh page load.
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

    const user = userStore.getUser

    if (user?.company?.[requiredApplication]) {
        return
    }

    const { errorAlert } = useAlert()
    const { $i18nGlobal } = useNuxtApp() as any
    errorAlert($i18nGlobal.t('alert.warning'), $i18nGlobal.t('alert.pageAccessDenied'))

    // Not abortNavigation(): returning `false` here makes Nuxt's router
    // synthesize and show a "Page Not Found" error on a hydrating ssr:false
    // navigation before the redirect below takes effect - a real access
    // denial gets shown to the user as a broken page. A bare return after
    // the hard redirect lets the browser leave the route without that flash.
    if (import.meta.client) {
        window.location.href = '/overview'

        return
    }

    return navigateTo('/overview')
})
