// Who sees what when someone presses a Cody entry point. Pure, for node --test.
//
// None of this is access control. The backend decides who may start a trial, send a
// suggestion or ask Cody a question; this only picks which screen reflects that.

export type PreviewAudience = 'chat' | 'buyer' | 'staff' | 'hidden'

export function previewAudience(opts: {
    moduleEnabled: boolean
    hasAccess: boolean
    canBuy: boolean
}): PreviewAudience {
    // The company's "AI assistant" module off: there is no Cody to show.
    if (!opts.moduleEnabled) return 'hidden'
    if (opts.hasAccess) return 'chat'
    return opts.canBuy ? 'buyer' : 'staff'
}

// Whether a keydown is the Cmd/Ctrl+J shortcut the top bar advertises.
export function isCodyShortcut(event: { metaKey?: boolean, ctrlKey?: boolean, key?: string }): boolean {
    return !!(event.metaKey || event.ctrlKey) && (event.key ?? '').toLowerCase() === 'j'
}
