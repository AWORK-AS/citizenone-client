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
    // Only whether the panel is open survives a reload. The insert target
    // belongs to a form that is open right now, and a stored one would offer to
    // insert into something that is not there any more.
    persist: { paths: ['isOpen'] },
    state: () => ({
        isOpen: false,
        // A form that can receive an answer registers itself here while it is
        // open, which is what turns the "insert" action on in the panel. The
        // panel has no reference to the editor and does not need one.
        insertTargetLabel: null as string | null,
        pendingInsert: null as string | null,
        // A question handed to the panel from somewhere else on the page. The
        // panel picks it up, asks it and clears it. Not persisted: a question
        // that survives a reload would fire without anyone asking for it.
        pendingQuestion: null as string | null,
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
        /**
         * Open the panel with a question already asked.
         *
         * The point is that the rest of the product can hand Cody something it
         * is already showing. A page that lists "two doses are unregistered"
         * should be able to ask about them without the reader typing the
         * sentence out again.
         */
        askAbout(question: string) {
            this.pendingQuestion = question
            this.isOpen = true
        },
        questionHandled() {
            this.pendingQuestion = null
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
