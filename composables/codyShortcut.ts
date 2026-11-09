// What the Cody AI keys do. Pure, for node --test.
//
// Cmd/Ctrl+J, not K: K is the global search (navbar/global-search.vue), and
// taking it would leave search with no key at all.

export type ShortcutAction = 'open' | 'focus' | 'close'

/**
 * Cmd/Ctrl+J. Closed or rolled down: open it. Open, but the cursor is
 * somewhere else on the page: bring the cursor to Cody rather than hide the
 * panel the user just reached for. Open with the cursor already in it: close.
 */
export function shortcutAction(opts: { isOpen: boolean, isCollapsed: boolean, focusInPanel: boolean }): ShortcutAction {
    if (!opts.isOpen || opts.isCollapsed) return 'open'

    return opts.focusInPanel ? 'close' : 'focus'
}

/**
 * Escape closes the panel - unless something else has already used it, or it
 * was pressed inside another dialog (a modal over the page), where it belongs
 * to that dialog. Cody's own mention picker and redaction preview say so
 * through `panelBusy`.
 */
export function escapeClosesPanel(opts: {
    isOpen: boolean
    defaultPrevented: boolean
    inOtherDialog: boolean
    panelBusy: boolean
}): boolean {
    return opts.isOpen && !opts.defaultPrevented && !opts.inOtherDialog && !opts.panelBusy
}
