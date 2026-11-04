import { isPurchaseRoute } from '@/composables/purchaseAccess'
import { useIsDesktopApp } from '@/composables/useIsDesktopApp'
import { useAlert } from '@/composables/alert'

/**
 * The desktop app never opens a page that sells something (see composables/purchaseAccess.ts).
 * The buttons that lead there are hidden in the desktop app; this catches the rest, such as a
 * redirect after a refused request or a link in a notification.
 *
 * Several screens send a refusal to /subscription?error=..., so that message is still shown
 * here, where it would otherwise have been shown on the page.
 */
export default defineNuxtRouteMiddleware((to, from) => {
    if (!useIsDesktopApp() || !isPurchaseRoute(to.path)) return

    const error = typeof to.query?.error === 'string' ? to.query.error : ''
    if (error) {
        const { errorAlert } = useAlert()
        const { $i18nGlobal } = useNuxtApp() as any
        errorAlert($i18nGlobal.t('alert.warning'), error)
    }

    // Stay on the page the user came from; a first load has none, so it goes to the overview.
    if (from?.name && from.path !== to.path && !isPurchaseRoute(from.path)) return abortNavigation()

    return navigateTo('/overview')
})
