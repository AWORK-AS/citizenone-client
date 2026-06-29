// A small global undo snackbar. Survives navigation because the state lives at
// module scope and the snackbar is rendered once in the user layout.
const visible = ref(false)
const message = ref('')
let undoFn: (() => void | Promise<void>) | null = null
let timer: ReturnType<typeof setTimeout> | null = null

export function useUndo() {
    function show(opts: { message: string; onUndo: () => void | Promise<void>; duration?: number }) {
        message.value = opts.message
        undoFn = opts.onUndo
        visible.value = true
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
            visible.value = false
            undoFn = null
        }, opts.duration ?? 6000)
    }

    async function undo() {
        if (timer) clearTimeout(timer)
        const fn = undoFn
        visible.value = false
        undoFn = null
        if (fn) await fn()
    }

    function dismiss() {
        if (timer) clearTimeout(timer)
        visible.value = false
        undoFn = null
    }

    return { visible, message, show, undo, dismiss }
}
