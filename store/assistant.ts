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
    },
})
