import { defineStore } from 'pinia'
import { prefillTextFor, type ChatDraftPrefill, type ChatDraftTarget } from '@/composables/codyChatDraft'

/**
 * A chat message Cody AI drafted, waiting for the chat page to pick it up.
 *
 * Deliberately not persisted: the text can name a citizen, and a draft that
 * survives in localStorage or a reload is one nobody asked to keep. It is also
 * never put in the URL. Taken once: the chat field gets it, the store forgets
 * it, and a later visit to the same conversation starts empty.
 */
export const useChatDraftStore = defineStore('chatDraftStore', {
    state: () => ({
        pending: null as ChatDraftPrefill | null,
    }),
    actions: {
        hand(prefill: ChatDraftPrefill) {
            this.pending = prefill
        },
        /** The text for this conversation or colleague, once, or null. */
        takeFor(target: ChatDraftTarget): string | null {
            const text = prefillTextFor(this.pending, target)

            if (text !== null) this.pending = null

            return text
        },
    },
})
