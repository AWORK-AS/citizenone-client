import { isPurchaseRoute } from '@/composables/purchaseAccess'
import { useIsDesktopApp } from '@/composables/useIsDesktopApp'
import { useAlert } from '@/composables/alert'

/**
 * The desktop app never opens a page that sells something (see composables/purchaseAccess.ts).
 * The buttons that lead there are hidden in the desktop app; this catches the rest, such as a
 * redirect after a refused request or a link in a notification, and tells the user the page is
 * not in the desktop app.
 */
export default defineNuxtRouteMiddleware((to, from) => {
    if (!useIsDesktopApp() || !isPurchaseRoute(to.path)) return

    // A refusal sent to /subscription?error=... keeps its message; anything else says the page is
    // not in the desktop app, so a button that was not hidden does not just do nothing.
    const { warningAlert } = useAlert()
    const { $i18nGlobal } = useNuxtApp() as any
    const error = typeof to.query?.error === 'string' ? to.query.error : ''
    warningAlert($i18nGlobal.t('alert.warning'), error || $i18nGlobal.t('desktopApp.notAvailable'))

    // Stay on the page the user came from; a first load has none, so it goes to the overview.
    if (from?.name && from.path !== to.path && !isPurchaseRoute(from.path)) return abortNavigation()

    return navigateTo('/overview')
})
