import { useUserStore } from '@/store/user'
import { useAlert } from '@/composables/alert'

/**
 * Gates a route on the company having bought the app it belongs to
 * (definePageMeta({ middleware: 'require-application', requiredApplication:
 * 'tasks_workflow_enabled' })). The backend already refuses the underlying
 * API calls, but nav-hiding the link is cosmetic only - a direct URL still
 * rendered the full page chrome before the reactive error. Mirrors
 * require-page's redirect shape for a route that isn't behind its own page
 * permission entry, just a company entitlement flag.
 */
export default defineNuxtRouteMiddleware((to) => {
    const requiredApplication = to.meta?.requiredApplication as string | undefined

    if (!requiredApplication) {
        return
    }

    const userStore = useUserStore() as any
    const user = userStore.getUser

    if (user?.company?.[requiredApplication]) {
        return
    }

    const { errorAlert } = useAlert()
    const { $i18nGlobal } = useNuxtApp() as any
    errorAlert($i18nGlobal.t('alert.warning'), $i18nGlobal.t('alert.pageAccessDenied'))

    // Same reasoning as require-page: ssr is off, and a client-side
    // navigateTo() can resolve without the browser leaving the blocked
    // route on the very first hard navigation. A hard redirect always works.
    if (import.meta.client) {
        window.location.href = '/overview'

        return abortNavigation()
    }

    return navigateTo('/overview')
})
