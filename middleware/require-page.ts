import { useUserStore } from '@/store/user'
import { useAlert } from '@/composables/alert'
import { userService } from '@/components/api/user/UserService'
import { canOpenPage } from '@/composables/pageAccess'

/**
 * Enforces the page a route was granted access under (definePageMeta({
 * middleware: 'require-page', requiredPage: 'Inquiries' })) rather than only
 * hiding its nav link. Mirrors the same checks layouts/user.vue already uses to
 * decide whether to show the link at all - this just runs them again before the
 * page itself loads, since the backend gates the data but nothing used to gate
 * the route.
 *
 * A page that also needs a company flag names it: `requiredCompanyFlag:
 * 'inquiry_pipeline_enabled'`. It used to be demanded of every page, which was
 * harmless while Inquiries was the only user of this middleware and would have
 * refused any second page to every company without the inquiry pipeline.
 */
export default defineNuxtRouteMiddleware(async (to) => {
    const requiredPage = to.meta?.requiredPage as string | undefined
    const requiredCompanyFlag = to.meta?.requiredCompanyFlag as string | undefined

    if (!requiredPage) {
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

    const hasAccess = canOpenPage(user, requiredPage, requiredCompanyFlag)

    if (!hasAccess) {
        const { errorAlert } = useAlert()
        const { $i18nGlobal } = useNuxtApp() as any
        errorAlert($i18nGlobal.t('alert.warning'), $i18nGlobal.t('alert.pageAccessDenied'))

        // Not abortNavigation(): returning `false` here makes Nuxt's router
        // synthesize and show a "Page Not Found" error on a hydrating
        // ssr:false navigation before the redirect below takes effect - a
        // real access denial gets shown to the user as a broken page. A bare
        // return after the hard redirect lets the browser leave the route
        // without that flash.
        if (import.meta.client) {
            window.location.href = '/overview'

            return
        }

        return navigateTo('/overview')
    }
})
