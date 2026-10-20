import { useUserStore } from '@/store/user'
import { useAlert } from '@/composables/alert'
import { userService } from '@/components/api/user/UserService'
import { usePermissions } from '@/composables/usePermissions'
import { canUseQuestionnaireInbox } from '@/composables/questionnaireInbox'

/**
 * Keeps the questionnaire inbox to the people the sidebar shows it to:
 * definePageMeta({ middleware: 'require-questionnaire-inbox' }). The API
 * refuses everyone else as well; this turns them back before an empty page.
 */
export default defineNuxtRouteMiddleware(async () => {
    const userStore = useUserStore() as any

    // On a cold navigation the layout's own user fetch has not run yet (route
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

    const { isAtLeast, can } = usePermissions()

    if (canUseQuestionnaireInbox(userStore.getUser, isAtLeast, can)) {
        return
    }

    const { errorAlert } = useAlert()
    const { $i18nGlobal } = useNuxtApp() as any
    errorAlert($i18nGlobal.t('alert.warning'), $i18nGlobal.t('alert.pageAccessDenied'))

    return navigateTo('/overview')
})
