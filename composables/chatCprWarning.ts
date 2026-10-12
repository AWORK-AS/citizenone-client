import { computed, ref } from 'vue'
import { useDanishCpr } from '@/composables/cpr'
import { useUserStore } from '@/store/user'

// One warning for the whole app, answered by the single DialogCprWarning in
// app.vue. Module-level on purpose: the app runs client-side only (ssr: false).
const pendingAnswer = ref<((send: boolean) => void) | null>(null)

/**
 * The warning is a company switch, off unless an Admin turned it on in
 * Settings. A company without the field (an older payload) counts as off.
 */
export function isChatCprWarningOn(company: any): boolean {
    return company?.chat_cpr_warning_enabled === true
}

/**
 * Chat is not meant for sensitive personal data, so a message that seems to
 * hold a CPR number asks before it goes. It warns and never blocks, and the
 * number itself is not kept or passed on anywhere.
 *
 * Staff and every portal read the switch from the company on the signed-in
 * user. A page without a signed-in user (the caseworker share link) passes
 * `enabled` with the switch of the company the chat belongs to.
 */
export function useChatCprWarning(options: { enabled?: () => boolean } = {}) {
    const { containsCpr } = useDanishCpr()
    const userStore = useUserStore() as any

    const isOn = () => options.enabled
        ? options.enabled()
        : isChatCprWarningOn(userStore.getUser?.company)

    /**
     * Resolves true when the text may be sent: straight away when the switch
     * is off or nothing looks like a CPR number, otherwise once the user picks
     * "Send anyway". A second send while the warning is open resolves false,
     * so the message cannot go out twice.
     */
    function confirmChatText(...texts: (string | null | undefined)[]): Promise<boolean> {
        if (!isOn()) return Promise.resolve(true)
        if (!texts.some((text) => containsCpr(text))) return Promise.resolve(true)
        if (pendingAnswer.value) return Promise.resolve(false)

        return new Promise((resolve) => {
            pendingAnswer.value = resolve
        })
    }

    function answer(send: boolean) {
        const resolve = pendingAnswer.value
        pendingAnswer.value = null
        resolve?.(send)
    }

    const isOpen = computed(() => pendingAnswer.value !== null)

    return { confirmChatText, answer, isOpen }
}
