import { useSearchHighlightStore } from '@/store/searchHighlight'

const CSS = `
@keyframes search-highlight-flash {
    0%   { box-shadow: 0 0 0 0 rgba(65,173,216,0); background-color: transparent; }
    15%  { box-shadow: 0 0 0 4px rgba(65,173,216,0.7); background-color: rgba(65,173,216,0.15); }
    70%  { box-shadow: 0 0 0 4px rgba(65,173,216,0.4); background-color: rgba(65,173,216,0.1); }
    100% { box-shadow: 0 0 0 0 rgba(65,173,216,0); background-color: transparent; }
}
.search-highlight-active {
    animation: search-highlight-flash 2s ease forwards !important;
    border-radius: 6px !important;
    position: relative;
    z-index: 1;
}
`

function injectStyles() {
    if (document.getElementById('search-highlight-styles')) return
    const style = document.createElement('style')
    style.id = 'search-highlight-styles'
    style.textContent = CSS
    document.head.appendChild(style)
}

function findElementByUuid(uuid: string): Element | null {
    return document.querySelector(`[data-uuid="${uuid}"]`)
}

function findElementByText(term: string): Element | null {
    const root = document.querySelector('main') ?? document.getElementById('__nuxt') ?? document.body
    const lower = term.toLowerCase()

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            if (!node.textContent?.toLowerCase().includes(lower)) return NodeFilter.FILTER_REJECT
            const parent = node.parentElement
            if (!parent) return NodeFilter.FILTER_REJECT
            const tag = parent.tagName.toLowerCase()
            if (['script', 'style', 'noscript', 'meta'].includes(tag)) return NodeFilter.FILTER_REJECT
            // Skip content inside excluded zones (e.g. citizen details header)
            let ancestor: Element | null = parent
            while (ancestor && ancestor !== root) {
                if (ancestor.hasAttribute('data-search-exclude')) return NodeFilter.FILTER_REJECT
                ancestor = ancestor.parentElement
            }
            return NodeFilter.FILTER_ACCEPT
        },
    })

    const node = walker.nextNode()
    if (!node) return null

    // Walk up to a row-level block element that isn't the full-width container
    let el: Element | null = (node as Text).parentElement
    let depth = 0
    while (el && depth < 8) {
        const display = getComputedStyle(el).display
        const rect = el.getBoundingClientRect()
        if (['block', 'flex', 'grid', 'table-row', 'list-item'].includes(display)) {
            // Avoid selecting the full-width layout containers
            if (rect.width < window.innerWidth * 0.9 && rect.height > 0) return el
        }
        el = el.parentElement
        depth++
    }
    return (node as Text).parentElement
}

function applyHighlight(el: Element) {
    el.classList.remove('search-highlight-active')
    void (el as HTMLElement).offsetWidth
    el.classList.add('search-highlight-active')
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.addEventListener('animationend', () => el.classList.remove('search-highlight-active'), { once: true })
}

function tryFind(uuid: string | null, term: string): Element | null {
    if (uuid) return findElementByUuid(uuid)
    return findElementByText(term)
}

function watchAndHighlight(uuid: string | null, term: string) {
    // Try immediately in case the page is already rendered (same-page navigation)
    const immediate = tryFind(uuid, term)
    if (immediate) { applyHighlight(immediate); return }

    const root = document.querySelector('main') ?? document.body
    const deadline = Date.now() + 8000

    const observer = new MutationObserver(() => {
        if (Date.now() > deadline) { observer.disconnect(); return }
        const el = tryFind(uuid, term)
        if (el) { observer.disconnect(); applyHighlight(el) }
    })

    observer.observe(root, { childList: true, subtree: true })

    // Hard stop — disconnect after 8 s regardless
    setTimeout(() => observer.disconnect(), 8000)
}

export default defineNuxtPlugin(() => {
    injectStyles()

    const router = useRouter()
    const highlightStore = useSearchHighlightStore()

    router.afterEach(() => {
        const { uuid, term } = highlightStore
        if (!term) return

        highlightStore.clear()

        // Small delay so Vue has flushed the new route's initial DOM before we start watching
        setTimeout(() => watchAndHighlight(uuid, term), 150)
    })
})
