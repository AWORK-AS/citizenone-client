// Who sees what when someone presses a Cody entry point. Pure, for node --test.
//
// None of this is access control. The backend decides who may start a trial, send a
// suggestion or ask Cody a question; this only picks which screen reflects that.

// 'assign' and 'askSeat' are for a company that already has Cody: nobody there is asked to buy
// it. Whoever assigns seats is sent to do that; everyone else asks their administrator for one.
// 'pending' is the moment before the status says whether the company has Cody.
export type PreviewAudience = 'chat' | 'buyer' | 'staff' | 'assign' | 'askSeat' | 'pending' | 'hidden'

export function previewAudience(opts: {
    moduleEnabled: boolean
    hasAccess: boolean
    canBuy: boolean
    /** From the adoption status; null while it is loading. Left out: treated as false. */
    companyHasCody?: boolean | null
}): PreviewAudience {
    // The company's "AI assistant" module off: there is no Cody to show.
    if (!opts.moduleEnabled) return 'hidden'
    if (opts.hasAccess) return 'chat'
    if (opts.companyHasCody === null) return 'pending'
    if (opts.companyHasCody) return opts.canBuy ? 'assign' : 'askSeat'
    return opts.canBuy ? 'buyer' : 'staff'
}

// Whether a keydown is the Cmd/Ctrl+J shortcut the top bar advertises.
export function isCodyShortcut(event: { metaKey?: boolean, ctrlKey?: boolean, key?: string }): boolean {
    return !!(event.metaKey || event.ctrlKey) && (event.key ?? '').toLowerCase() === 'j'
}
