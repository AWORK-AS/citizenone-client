import { defineStore } from 'pinia'

/**
 * Open/closed state for the assistant panel.
 *
 * The assistant used to be a modal opened from a button in the navbar, which
 * meant it covered the page you were asking about. It is now a panel rendered
 * once by the user layout, so the state has to live outside both the button and
 * the panel - the layout also needs it to make room for the panel on wide
 * screens.
 */
export const useAssistantStore = defineStore('assistantStore', {
    state: () => ({
        isOpen: false,
        // A form that can receive an answer registers itself here while it is
        // open, which is what turns the "insert" action on in the panel. The
        // panel has no reference to the editor and does not need one.
        insertTargetLabel: null as string | null,
        pendingInsert: null as string | null,
    }),
    actions: {
        open() {
            this.isOpen = true
        },
        close() {
            this.isOpen = false
        },
        toggle() {
            this.isOpen = !this.isOpen
        },
        offerInsertTarget(label: string) {
            this.insertTargetLabel = label
        },
        withdrawInsertTarget() {
            this.insertTargetLabel = null
            this.pendingInsert = null
        },
        requestInsert(html: string) {
            this.pendingInsert = html
        },
        insertHandled() {
            this.pendingInsert = null
        },
    },
})
