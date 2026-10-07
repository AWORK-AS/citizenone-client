import { computed, ref } from 'vue'
import { useDanishCpr } from '@/composables/cpr'

// One warning for the whole app, answered by the single DialogCprWarning in
// app.vue. Module-level on purpose: the app runs client-side only (ssr: false).
const pendingAnswer = ref<((send: boolean) => void) | null>(null)

/**
 * Chat is not meant for sensitive personal data, so a message that seems to
 * hold a CPR number asks before it goes. It warns and never blocks, and the
 * number itself is not kept or passed on anywhere.
 */
export function useChatCprWarning() {
    const { containsCpr } = useDanishCpr()

    /**
     * Resolves true when the text may be sent: straight away when nothing looks
     * like a CPR number, otherwise once the user picks "Send anyway". A second
     * send while the warning is open resolves false, so the message cannot go
     * out twice.
     */
    function confirmChatText(...texts: (string | null | undefined)[]): Promise<boolean> {
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
