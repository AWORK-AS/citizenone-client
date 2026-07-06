import DOMPurify from 'isomorphic-dompurify'

let hookRegistered = false

/**
 * Sanitize untrusted email HTML before rendering it with v-html.
 * Strips <script>, event handlers (on*), iframes, and other XSS vectors while
 * keeping normal email formatting (text, links, images, tables, lists).
 */
export function useSanitizeHtml() {
    if (!hookRegistered && typeof (DOMPurify as any).addHook === 'function') {
        ; (DOMPurify as any).addHook('afterSanitizeAttributes', (node: any) => {
            // Open any surviving links safely in a new tab.
            if (node.tagName === 'A' && node.getAttribute('href')) {
                node.setAttribute('target', '_blank')
                node.setAttribute('rel', 'noopener noreferrer nofollow')
            }
        })
        hookRegistered = true
    }

    const sanitizeEmailHtml = (html: string | null | undefined): string => {
        if (!html) return ''
        return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })
    }

    return { sanitizeEmailHtml }
}
