/**
 * Unit tests for composables/journalChoiceLists.ts - choice lists in a
 * predefined journal text, "Patienten starter på {tablet | serum}", resolved
 * to finished text when the text is inserted in a note.
 *
 *   node --test tests/unit/journalChoiceLists.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
    choiceListToken,
    choiceOptionLabel,
    countChoiceLists,
    parseChoiceLists,
    resolveChoiceLists,
} from '../../composables/journalChoiceLists.ts'

const finasterid = '<p>Patienten starter på {finasterid 1 mg tablet | finasterid 5% serum}, dosis {1 gang dagligt | 2 gange dagligt}.</p>'

describe('reading the lists in a text', () => {
    test('finds each list in order, with its options trimmed', () => {
        const segments = parseChoiceLists(finasterid)
        const lists = segments.filter((segment) => segment.type === 'choice')

        assert.equal(lists.length, 2)
        assert.deepEqual(lists[0].options, ['finasterid 1 mg tablet', 'finasterid 5% serum'])
        assert.deepEqual(lists[1].options, ['1 gang dagligt', '2 gange dagligt'])
        assert.equal(countChoiceLists(finasterid), 2)
    })

    test('leaves braces without a bar alone', () => {
        assert.equal(countChoiceLists('<p>Se {bilag 2}.</p>'), 0)
        assert.deepEqual(parseChoiceLists('<p>Se {bilag 2}.</p>'), [{ type: 'text', html: '<p>Se {bilag 2}.</p>' }])
    })

    test('copes with no text at all', () => {
        assert.deepEqual(parseChoiceLists(null), [])
        assert.equal(countChoiceLists(undefined), 0)
    })
})

describe('turning it into finished text', () => {
    test('puts the chosen option in place of each list', () => {
        assert.equal(
            resolveChoiceLists(finasterid, [1, 0]),
            '<p>Patienten starter på finasterid 5% serum, dosis 1 gang dagligt.</p>',
        )
    })

    test('uses the first option for a list nobody chose, so no braces are left', () => {
        const text = resolveChoiceLists(finasterid, [])

        assert.equal(text, '<p>Patienten starter på finasterid 1 mg tablet, dosis 1 gang dagligt.</p>')
        assert.ok(!text.includes('{') && !text.includes('|'))
    })

    test('keeps markup inside an option', () => {
        assert.equal(resolveChoiceLists('{a | <strong>b</strong>}', [1]), '<strong>b</strong>')
        assert.equal(choiceOptionLabel('<strong>b&nbsp;&amp; c</strong>'), 'b & c')
    })
})

describe('writing a list', () => {
    test('joins the options, dropping empty ones and the characters that would break the list', () => {
        assert.equal(choiceListToken(['tablet', ' serum ', '']), '{tablet | serum}')
        assert.equal(choiceListToken(['a|b', '{c}']), '{ab | c}')
    })

    test('needs two options to be a choice', () => {
        assert.equal(choiceListToken(['tablet']), '')
    })
})
