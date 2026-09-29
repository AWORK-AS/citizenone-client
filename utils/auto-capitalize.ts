// Automatic capitalization for journal notes: the first letter of the text and
// the first letter after a full stop (or ! / ?) is turned into a capital as it
// is typed, the way a word processor or a phone keyboard does it.
//
// The rule lives here, free of CKEditor, so both the CKEditor plugin
// (utils/editor-auto-capitalize.ts, rich text journal fields) and FormTextArea
// (plain text journal fields) share it without every textarea pulling in the
// editor bundle.

// Opening quotes/brackets that may sit between a sentence break and its first
// letter, and closing ones that may follow the full stop.
const OPENERS = `"'«„“‘(\\[`
const CLOSERS = `"'»”’)\\]`

const SENTENCE_START = new RegExp(`^[\\s${OPENERS}]*\\p{Ll}$`, 'u')
const AFTER_TERMINATOR = new RegExp(`(?:^|\\s)(\\S*?)([.!?])[${CLOSERS}]*\\s+[${OPENERS}]*\\p{Ll}$`, 'u')
const LEADING_OPENERS = new RegExp(`^[${OPENERS}]+`, 'u')

// Abbreviations that end with a full stop mid-sentence in the four supported
// languages (dk, en, no, sv), plus the dosage/time units common in care notes.
// Lowercased, without the final full stop.
const ABBREVIATIONS = new Set([
    // Danish / Norwegian
    'f.eks', 'bl.a', 'osv', 'ca', 'dvs', 'mht', 'evt', 'kl', 'nr', 'pga', 'mv', 'm.m', 'm.fl', 'mfl',
    'inkl', 'ekskl', 'jf', 'jfr', 'vedr', 'hhv', 'ift', 'iht', 'ifm', 'iflg', 'vha', 'ang', 'tlf', 'st',
    'stk', 'tbl', 'min', 'sek', 'mdr', 'md', 'gl', 'ml', 'dgl',
    // Swedish
    't.ex', 's.k', 'fr.o.m', 't.o.m', 'm.a.o', 'o.s.v', 'resp', 'enl', 'tex',
    // English
    'e.g', 'i.e', 'etc', 'vs', 'approx', 'dr', 'mr', 'mrs', 'ms', 'incl', 'excl', 'cf', 'vol',
])

/**
 * Whether the last character of `text` - the text in the current line up to
 * the caret, ending in the letter just typed - should become a capital.
 *
 * True at the very start of the text, and right after a sentence ending in
 * ". ", "! " or "? ". Not after abbreviations ("f.eks. ", "ca. "), ordinal
 * numbers ("1. januar"), single-letter initials ("J. ") or an ellipsis
 * ("... "), where a lowercase letter usually continues the sentence.
 */
export function shouldCapitalizeLastLetter(text: string): boolean {
    if (SENTENCE_START.test(text)) {
        return true
    }

    const match = AFTER_TERMINATOR.exec(text)

    if (!match) {
        return false
    }

    const [, word, terminator] = match

    if (terminator !== '.') {
        return true
    }

    const token = word.replace(LEADING_OPENERS, '')

    // An ellipsis, an ordinal number, a single-letter initial or a known
    // abbreviation does not end the sentence.
    return !token.endsWith('.')
        && !/^\d+$/.test(token)
        && !/^\p{L}$/u.test(token)
        && !ABBREVIATIONS.has(token.toLowerCase())
}
