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
    persist: { paths: ['isOpen', 'isCollapsed'] },
    state: () => ({
        isOpen: false,
        // Rolled down to its header, keeping the conversation. Persisted with
        // isOpen: someone who parked Cody at the bottom of the screen meant it
        // to stay parked, not to spring open on the next page.
        isCollapsed: false,
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
            this.isCollapsed = false
        },
        close() {
            this.isOpen = false
        },
        toggle() {
            // Open but rolled down counts as closed to anyone pressing the
            // button: they want to see it, so unroll it rather than hide it.
            if (this.isOpen && this.isCollapsed) {
                this.isCollapsed = false

                return
            }

            this.isOpen = !this.isOpen
        },
        toggleCollapsed() {
            this.isCollapsed = !this.isCollapsed
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
            this.isCollapsed = false
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
