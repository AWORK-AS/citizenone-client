/**
 * Unit tests for composables/codyReveal.ts - how an answer is rolled out word
 * by word in Cody AI's thread.
 *
 *   node --test tests/unit/codyReveal.test.mjs
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { splitWords, nextShown, revealedText, PER_WORD_MS, CAP_MS } from '../../composables/codyReveal.ts'

// Plays a reveal at 60 fps until everything is shown; returns the time it took.
function play(total, frameMs = 16) {
    let shown = 0
    let t = 0
    while (shown < total) {
        t += frameMs
        shown = nextShown(shown, total, frameMs, t)
        assert.ok(t < 10_000, 'never finishes')
    }

    return t
}

describe('splitWords', () => {
    it('joins back to exactly the original text', () => {
        const text = '## Overblik\n\n- **To** doser mangler\n- Et mål  udløber\n'
        assert.equal(splitWords(text).join(''), text)
    })
    it('keeps the whitespace with the word before it', () => {
        assert.deepEqual(splitWords('Hej med dig'), ['Hej ', 'med ', 'dig'])
        assert.deepEqual(splitWords('  indrykket'), ['  ', 'indrykket'])
    })
    it('handles empty and missing text', () => {
        assert.deepEqual(splitWords(''), [])
        assert.deepEqual(splitWords(undefined), [])
    })
})

describe('revealedText', () => {
    it('is a prefix of the original, whole words only', () => {
        const words = splitWords('en to tre fire')
        assert.equal(revealedText(words, 0), '')
        assert.equal(revealedText(words, 2.7), 'en to ')
        assert.equal(revealedText(words, 99), 'en to tre fire')
    })
})

describe('nextShown', () => {
    it('never goes past what has arrived', () => {
        assert.equal(nextShown(0, 3, 500, 0), 3)
        assert.equal(nextShown(0, 0, 16, 0), 0)
    })
    it('moves at least one word per PER_WORD_MS', () => {
        assert.ok(nextShown(0, 1000, PER_WORD_MS, 0) >= 1)
    })
    it('shows everything once CAP_MS has passed since the last text arrived', () => {
        assert.equal(nextShown(3, 5000, 16, CAP_MS), 5000)
    })
    it('rolls a short answer out fast', () => {
        assert.ok(play(20) <= 150, `20 words took ${play(20)}ms`)
    })
    it('never takes much more than CAP_MS, however long the answer', () => {
        for (const words of [50, 300, 1000, 20_000]) {
            assert.ok(play(words) <= CAP_MS + 16, `${words} words took ${play(words)}ms`)
        }
    })
    it('keeps up with a stream: it trails by less than one lump, and does not drift', () => {
        // 40 words arrive every 96 ms (six frames).
        let shown = 0
        let total = 0
        for (let frame = 0; frame < 60; frame++) {
            if (frame % 6 === 0) {
                assert.ok(total - shown < 40, `behind by ${total - shown} words`)
                total += 40
            }
            shown = nextShown(shown, total, 16, (frame % 6) * 16)
        }
    })
})
