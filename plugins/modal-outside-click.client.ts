// Pop-ups must never close because the user clicked next to them: whatever
// they had typed would be lost. Only the close cross, an explicit cancel
// button or Escape may close a dialog.
//
// Every Headless UI <Dialog> in the app (the shared <Modal>, slide-overs and
// the hand-rolled dialogs) closes on an outside click through the same hook,
// which ignores events whose default has already been prevented. A capture
// listener on window runs before that hook (it listens on document), so
// preventing the default for clicks that land on a dialog's backdrop switches
// the behaviour off centrally without touching any dialog.
const DIALOG_SELECTOR = '[role="dialog"][id^="headlessui-dialog-"]'
const PANEL_SELECTOR = '[id^="headlessui-dialog-panel-"]'
const INTERACTIVE_SELECTOR = 'a, button, input, label, select, textarea, [contenteditable="true"]'

function isBackdropHit(target: EventTarget | null): boolean {
    if (!(target instanceof Element)) return false
    const dialog = target.closest(DIALOG_SELECTOR)
    if (!dialog || !dialog.querySelector(PANEL_SELECTOR)) return false
    if (target.closest(PANEL_SELECTOR)) return false
    // Never cancel the default action of a real control, even outside a panel.
    return !target.closest(INTERACTIVE_SELECTOR)
}

export default defineNuxtPlugin(() => {
    const guard = (event: Event) => {
        if (isBackdropHit(event.target)) event.preventDefault()
    }
    window.addEventListener('click', guard, true)
    window.addEventListener('touchend', guard, true)
})
