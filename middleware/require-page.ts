import { useUserStore } from '@/store/user'
import { useAlert } from '@/composables/alert'

/**
 * Enforces the page a route was granted access under (definePageMeta({
 * middleware: 'require-page', requiredPage: 'Inquiries' })) rather than only
 * hiding its nav link. Mirrors the same three checks layouts/user.vue already
 * uses to decide whether to show the link at all - this just runs them again
 * before the page itself loads, since the backend gates the data but nothing
 * used to gate the route.
 */
export default defineNuxtRouteMiddleware((to) => {
    const requiredPage = to.meta?.requiredPage as string | undefined

    if (!requiredPage) {
        return
    }

    const userStore = useUserStore() as any
    const user = userStore.getUser

    const companyModulePages = user?.company?.module_pages
    const companyHasModule = (name: string) =>
        !Array.isArray(companyModulePages) || companyModulePages.length === 0 || companyModulePages.includes(name)

    const hasAccess = !!user?.company?.inquiry_pipeline_enabled
        && companyHasModule(requiredPage)
        && user?.pages?.some((page: any) => page.name === requiredPage)

    if (!hasAccess) {
        const { errorAlert } = useAlert()
        const { $i18nGlobal } = useNuxtApp() as any
        errorAlert($i18nGlobal.t('alert.warning'), $i18nGlobal.t('alert.pageAccessDenied'))

        // This app runs with ssr: false, and Nuxt's router-based navigateTo()
        // is unreliable on the very first (hard) navigation in SPA mode - it
        // can resolve without the browser ever leaving the blocked route. A
        // hard redirect always works, at the cost of a full reload, which is
        // an acceptable trade for a security boundary.
        if (import.meta.client) {
            window.location.href = '/overview'

            return abortNavigation()
        }

        return navigateTo('/overview')
    }
})
