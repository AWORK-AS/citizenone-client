/**
 * The "Kilde" links under an answer - the pure parts, so they can be tested
 * without a browser.
 *
 * The server decides which records an answer may link to and builds every
 * link itself (AnswerSources): the model only names references, in an HTML
 * comment at the end of its answer. The client still takes only what looks
 * like one of its own pages, and keeps that comment off the screen while the
 * answer streams in.
 *
 * Kept dependency-free so tests/unit/*.test.mjs can import it under `node --test`.
 */

export type SourceKind = 'journal' | 'plan' | 'goal' | 'task' | 'shift' | 'chat'

export interface SourceLink {
    type: SourceKind
    label: string
    link: string
}

export const SOURCE_KINDS: SourceKind[] = ['journal', 'plan', 'goal', 'task', 'shift', 'chat']

export const SOURCE_ICONS: Record<SourceKind, string> = {
    journal: 'ph:notebook',
    plan: 'ph:flag-banner',
    goal: 'ph:target',
    task: 'ph:check-square-offset',
    shift: 'ph:calendar-blank',
    chat: 'ph:chat-circle',
}

const MAX_LINKS = 3

/** A path inside this app: one leading slash, never a protocol or another host. */
function isAppPath(link: unknown): link is string {
    return typeof link === 'string' && /^\/(?![/\\])[^\s]*$/.test(link) && !/^\/[a-z]+:/i.test(link)
}

/** The links from the server's `source_links`, or none. */
export function sourceLinksFrom(raw: unknown): SourceLink[] {
    if (!Array.isArray(raw)) return []

    return raw
        .filter((item: any) => item && SOURCE_KINDS.includes(item.type) && typeof item.label === 'string'
            && item.label.trim() !== '' && isAppPath(item.link))
        .slice(0, MAX_LINKS)
        .map((item: any) => ({ type: item.type, label: item.label.trim(), link: item.link }))
}

/**
 * The streamed text without the sources comment, whole or still arriving.
 * The finished answer comes from the server with it already removed.
 */
export function withoutSourcesComment(text: string): string {
    if (!text) return text

    return text
        .replace(/<!--\s*sources?\b[\s\S]*?(?:-->|$)/gi, '')
        .replace(/<!?-?-?$/, '')
}
