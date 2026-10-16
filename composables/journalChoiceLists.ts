/**
 * Choice lists in a predefined journal text, the way Sundhedsplatformen does
 * them: one saved text covers several cases, and the person writing the note
 * picks the case when inserting it.
 *
 *   Patienten starter på {finasterid 1 mg tablet | finasterid 5% serum}.
 *
 * A list is the text between braces that holds at least one `|`; braces
 * without one are left alone, so "{se bilag}" stays ordinary text. Same
 * syntax as the backend (`App\Support\JournalChoiceLists`), which refuses a
 * list with an empty option, and as the app.
 *
 * The choice is resolved before it reaches the note, so a journal note never
 * stores a list - only the predefined text does.
 */

export type ChoiceSegment =
    | { type: 'text'; html: string }
    | { type: 'choice'; index: number; options: string[] }

const PATTERN = /\{([^{}]*\|[^{}]*)\}/g

/** The text split into plain parts and lists, in order. */
export function parseChoiceLists(content: string | null | undefined): ChoiceSegment[] {
    const text = content ?? ''
    const segments: ChoiceSegment[] = []
    let last = 0
    let index = 0

    for (const match of text.matchAll(PATTERN)) {
        const at = match.index ?? 0
        if (at > last) segments.push({ type: 'text', html: text.slice(last, at) })
        segments.push({ type: 'choice', index: index++, options: match[1].split('|').map((option) => option.trim()) })
        last = at + match[0].length
    }
    if (last < text.length) segments.push({ type: 'text', html: text.slice(last) })

    return segments
}

export function countChoiceLists(content: string | null | undefined): number {
    return parseChoiceLists(content).filter((segment) => segment.type === 'choice').length
}

/**
 * The text with each list replaced by the option chosen for it. A list with
 * no choice yet keeps its first option, so the result is always finished text.
 */
export function resolveChoiceLists(content: string | null | undefined, choices: Array<number | null | undefined>): string {
    return parseChoiceLists(content).map((segment) => {
        if (segment.type === 'text') return segment.html
        const chosen = choices[segment.index]
        return segment.options[typeof chosen === 'number' && segment.options[chosen] !== undefined ? chosen : 0]
    }).join('')
}

/** An option as a reader sees it, for a dropdown: no markup, no &nbsp;. */
export function choiceOptionLabel(option: string): string {
    return option
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim()
}

/** The list syntax for the given options, as an admin would type it. */
export function choiceListToken(options: string[]): string {
    const filled = options.map((option) => option.replace(/[{}|]/g, '').trim()).filter(Boolean)
    return filled.length >= 2 ? `{${filled.join(' | ')}}` : ''
}
