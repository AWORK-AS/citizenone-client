// How an answer appears: a few words at a time instead of all at once, or in
// the uneven lumps the stream happens to deliver. Pure, for node --test.
//
// One rule covers both cases. What is shown chases what has arrived: at least
// one word every PER_WORD_MS, faster the further behind it is, and never more
// than CAP_MS behind the last text to arrive. An answer that arrives whole
// is just a target that is all there at once, so it rolls out in well under a
// second; a stream is a target that keeps moving, and the chase evens out the
// lumps. Only the text waits - the cards, receipts and buttons are drawn as
// they arrive.

/** The slowest a word is shown: one every few milliseconds. */
export const PER_WORD_MS = 6

/** How quickly a backlog is worked off: about two thirds of it goes every this long. */
export const CATCH_UP_MS = 120

/** This long after the latest text arrived, all of it is shown. */
export const CAP_MS = 1000

/**
 * The text cut into words, each keeping the whitespace after it, so joining a
 * prefix gives back exactly the start of the original - line breaks and the
 * markdown built on them included.
 */
export function splitWords(text: string): string[] {
    return (text ?? '').match(/\s+|\S+\s*/g) ?? []
}

/**
 * How many words to show after `elapsedMs` more milliseconds, given `shown`
 * now, `total` arrived so far, and `sinceArrivalMs` since the latest text arrived.
 * Fractional, so a frame shorter than PER_WORD_MS still makes progress.
 */
export function nextShown(shown: number, total: number, elapsedMs: number, sinceArrivalMs: number): number {
    if (total <= 0) return 0
    if (shown >= total || sinceArrivalMs >= CAP_MS) return total

    const step = Math.max(elapsedMs / PER_WORD_MS, (total - shown) * Math.min(1, elapsedMs / CATCH_UP_MS))

    return Math.min(total, shown + step)
}

/** The start of `text` up to `shown` words. */
export function revealedText(words: string[], shown: number): string {
    return words.slice(0, Math.floor(shown)).join('')
}
