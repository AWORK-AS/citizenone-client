/**
 * Markdown fallback for AI answers.
 *
 * The backend prompt asks the model for HTML, and HTML is passed straight
 * through. But models drift - when the answer comes back as markdown instead,
 * the chat used to print the raw string, so users saw literal `**`, `-` and `|`
 * where headings, lists and tables were meant. That case is rendered here.
 * The subset covered is what the model actually emits when it does drift:
 * headings, emphasis, code, lists, links, blockquotes, rules and pipe tables.
 *
 * Everything is HTML-escaped before any markup is produced, so text from the
 * model can never introduce tags of its own. The result is still rendered
 * through `v-safe-html`, which runs it through DOMPurify - this function is the
 * formatter, not the security boundary.
 */

// Extracted code is parked behind control characters the model never emits, so
// the markers can't collide with ordinary numbers or punctuation in the answer.
const INLINE_MARK = '\u0000'
const BLOCK_MARK = '\u0001'
const INLINE_PATTERN = new RegExp(`${INLINE_MARK}(\\d+)${INLINE_MARK}`, 'g')
const BLOCK_PATTERN = new RegExp(`^${BLOCK_MARK}(\\d+)${BLOCK_MARK}$`)

const ESCAPES: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
}

function escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (character) => ESCAPES[character])
}

// Only http(s) and mailto links survive; anything else renders as plain text so
// a `javascript:` href never reaches the DOM.
function safeHref(url: string): string | null {
    const trimmed = url.trim()
    return /^(https?:\/\/|mailto:)/i.test(trimmed) ? trimmed : null
}

function renderInline(text: string): string {
    const codeSpans: string[] = []
    let result = text.replace(/`([^`\n]+)`/g, (_match, code: string) => {
        codeSpans.push(`<code>${code}</code>`)
        return `${INLINE_MARK}${codeSpans.length - 1}${INLINE_MARK}`
    })

    result = result.replace(/\[([^\]\n]+)\]\(([^)\s]+)\)/g, (match, label: string, url: string) => {
        const href = safeHref(url)
        return href ? `<a href="${href}">${label}</a>` : match
    })
    result = result.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
    result = result.replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1<em>$2</em>')
    result = result.replace(/(^|[\s(])_([^_\n]+)_/g, '$1<em>$2</em>')

    return result.replace(INLINE_PATTERN, (_match, index: string) => codeSpans[Number(index)])
}

function isTableDivider(line: string): boolean {
    return /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(line) && line.includes('-')
}

function splitTableRow(line: string): string[] {
    return line.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map((cell) => cell.trim())
}

// The assistant is instructed to answer in HTML, so anything that already
// carries markup is left alone rather than escaped into visible tags.
const LOOKS_LIKE_HTML = /<(strong|em|b|i|u|br|p|div|span|ul|ol|li|table|thead|tbody|tr|td|th|hr|h[1-6]|a|code|pre|blockquote)\b[^>]*>/i

export function renderMarkdown(source: string): string {
    if (!source) return ''
    if (LOOKS_LIKE_HTML.test(source)) return source

    // Fenced code blocks are pulled out first so their contents are never
    // treated as markdown.
    const codeBlocks: string[] = []
    const withoutFences = source.replace(/\r\n/g, '\n').replace(/```[^\n]*\n([\s\S]*?)```/g, (_match, code: string) => {
        codeBlocks.push(`<pre><code>${escapeHtml(code.replace(/\n$/, ''))}</code></pre>`)
        return `\n${BLOCK_MARK}${codeBlocks.length - 1}${BLOCK_MARK}\n`
    })

    const lines = escapeHtml(withoutFences).split('\n')
    const html: string[] = []
    let paragraph: string[] = []
    let listTag: 'ul' | 'ol' | null = null

    const flushParagraph = () => {
        if (!paragraph.length) return
        html.push(`<p>${renderInline(paragraph.join(' '))}</p>`)
        paragraph = []
    }
    const closeList = () => {
        if (!listTag) return
        html.push(`</${listTag}>`)
        listTag = null
    }
    const openList = (tag: 'ul' | 'ol') => {
        if (listTag === tag) return
        closeList()
        html.push(`<${tag}>`)
        listTag = tag
    }

    for (let index = 0; index < lines.length; index++) {
        const line = lines[index]

        const placeholder = line.match(BLOCK_PATTERN)
        if (placeholder) {
            flushParagraph()
            closeList()
            html.push(codeBlocks[Number(placeholder[1])])
            continue
        }

        if (!line.trim()) {
            flushParagraph()
            closeList()
            continue
        }

        const heading = line.match(/^(#{1,4})\s+(.*)$/)
        if (heading) {
            flushParagraph()
            closeList()
            const level = Math.min(heading[1].length + 2, 6)
            html.push(`<h${level}>${renderInline(heading[2].trim())}</h${level}>`)
            continue
        }

        if (/^\s*([-*_])\1{2,}\s*$/.test(line)) {
            flushParagraph()
            closeList()
            html.push('<hr />')
            continue
        }

        const quote = line.match(/^\s*&gt;\s?(.*)$/)
        if (quote) {
            flushParagraph()
            closeList()
            html.push(`<blockquote>${renderInline(quote[1])}</blockquote>`)
            continue
        }

        // A pipe table needs its divider row on the next line, otherwise the
        // pipes are just characters in a sentence.
        if (line.includes('|') && isTableDivider(lines[index + 1] ?? '')) {
            flushParagraph()
            closeList()
            const headerCells = splitTableRow(line)
            const body: string[] = []
            let cursor = index + 2
            while (cursor < lines.length && lines[cursor].includes('|') && lines[cursor].trim()) {
                body.push(`<tr>${splitTableRow(lines[cursor]).map((cell) => `<td>${renderInline(cell)}</td>`).join('')}</tr>`)
                cursor++
            }
            html.push(
                '<table><thead><tr>'
                + headerCells.map((cell) => `<th>${renderInline(cell)}</th>`).join('')
                + `</tr></thead><tbody>${body.join('')}</tbody></table>`,
            )
            index = cursor - 1
            continue
        }

        const ordered = line.match(/^\s*\d+[.)]\s+(.*)$/)
        if (ordered) {
            flushParagraph()
            openList('ol')
            html.push(`<li>${renderInline(ordered[1])}</li>`)
            continue
        }

        const unordered = line.match(/^\s*[-*+]\s+(.*)$/)
        if (unordered) {
            flushParagraph()
            openList('ul')
            html.push(`<li>${renderInline(unordered[1])}</li>`)
            continue
        }

        closeList()
        paragraph.push(line.trim())
    }

    flushParagraph()
    closeList()

    return html.join('')
}
