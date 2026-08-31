import { useUserStore } from '@/store/user'
import { terminologyMessages } from '@/composables/useTerminology'

/**
 * Publishes the company's own citizen words as i18n messages under terms.*.
 *
 * Every Danish string that mentions a citizen links to those keys, so they have
 * to exist before anything renders. On a cold load the store is still empty
 * here - layouts/user.vue fetches the user in onMounted, after plugins - so the
 * defaults go in first and the watcher replaces them the moment the company
 * arrives, on login and on a company switch alike. Merging is idempotent: it
 * only ever overwrites the same four keys.
 *
 * Runs after plugins/i18n.ts, which provides the instance (plugins load in
 * filename order, and i18n sorts before terminology).
 */
export default defineNuxtPlugin((nuxtApp) => {
    const i18n = (nuxtApp as any).$i18nGlobal

    if (!i18n?.mergeLocaleMessage) {
        return
    }

    const userStore = useUserStore() as any

    const apply = () => {
        const company = userStore.getUser?.company

        for (const [locale, messages] of Object.entries(terminologyMessages(company))) {
            i18n.mergeLocaleMessage(locale, messages)
        }
    }

    apply()

    watch(
        () => {
            const company = userStore.getUser?.company

            return [
                company?.term_citizen,
                company?.term_citizen_definite,
                company?.term_citizens,
                company?.term_citizens_definite,
            ].join(' ')
        },
        apply,
    )
})
