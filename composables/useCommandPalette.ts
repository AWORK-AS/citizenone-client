import { ref } from 'vue'

// Shared (module-level) state for the global command palette + shortcuts help,
// both mounted once in the layout. Pages can contribute context commands and
// page-specific keyboard shortcuts.
const pageCommands = ref<any[]>([])
const pageShortcuts = ref<{ keys: string; label: string }[]>([])
const isOpen = ref(false)
const isHelpOpen = ref(false)

export function useCommandPalette() {
    function setPageCommands(commands: any[]) {
        pageCommands.value = commands || []
    }
    function clearPageCommands() {
        pageCommands.value = []
    }
    function setPageShortcuts(shortcuts: { keys: string; label: string }[]) {
        pageShortcuts.value = shortcuts || []
    }
    function clearPageShortcuts() {
        pageShortcuts.value = []
    }
    function open() { isOpen.value = true }
    function close() { isOpen.value = false }
    function toggle() { isOpen.value = !isOpen.value }
    function openHelp() { isHelpOpen.value = true }
    function closeHelp() { isHelpOpen.value = false }
    function toggleHelp() { isHelpOpen.value = !isHelpOpen.value }

    return {
        pageCommands, pageShortcuts, isOpen, isHelpOpen,
        setPageCommands, clearPageCommands, setPageShortcuts, clearPageShortcuts,
        open, close, toggle, openHelp, closeHelp, toggleHelp,
    }
}
