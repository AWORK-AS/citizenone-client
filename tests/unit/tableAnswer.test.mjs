/**
 * Unit tests for composables/tableAnswer.ts - what a table holds and what a
 * fill-in sends for it.
 *
 * A reopened report put the stored JSON string back on the table, and a table
 * nobody touched sent that string encoded once more on every save, so a filled
 * table showed the template's rows from then on (hub, 22 Oct). The inputs are
 * the shapes the details endpoint returned: plain JSON from "create", wrapped
 * once and twice by the edit-saves, and the empty "" an untouched new table
 * stores.
 *
 *   node --test tests/unit/tableAnswer.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { tableAnswerOf, tableAnswerPayload } from '../../composables/tableAnswer.ts'

const rows = [['Mål', 'Status'], ['Bolig', 'I gang']]
const plain = JSON.stringify(rows)
const once = JSON.stringify(plain)
const twice = JSON.stringify(once)

describe('tableAnswerOf', () => {
    test('rows the table emitted are kept', () => {
        assert.deepEqual(tableAnswerOf(rows), rows)
    })

    test('the stored JSON string is read', () => {
        assert.deepEqual(tableAnswerOf(plain), rows)
    })

    test('an answer wrapped once or twice by earlier saves is read', () => {
        assert.deepEqual(tableAnswerOf(once), rows)
        assert.deepEqual(tableAnswerOf(twice), rows)
    })

    test('nothing, an empty string, the stored "" and "" wrapped hold no rows', () => {
        for (const value of [undefined, null, '', '""', JSON.stringify('""'), JSON.stringify(JSON.stringify('""'))]) {
            assert.equal(tableAnswerOf(value), null, JSON.stringify(value))
        }
    })

    test('an empty list is an empty table', () => {
        assert.deepEqual(tableAnswerOf([]), [])
        assert.deepEqual(tableAnswerOf('[]'), [])
    })

    test('text that is not JSON, an object and a number hold no rows', () => {
        for (const value of ['not json', '{"a":1}', { a: 1 }, 5, '5']) {
            assert.equal(tableAnswerOf(value), null, JSON.stringify(value))
        }
    })

    test('a wrapping deeper than the bound is not followed for ever', () => {
        let value = plain
        for (let i = 0; i < 20; i++) value = JSON.stringify(value)
        assert.equal(tableAnswerOf(value), null)
    })
})

describe('tableAnswerPayload', () => {
    test('rows, stored string and wrapped strings all send the same plain JSON', () => {
        for (const value of [rows, plain, once, twice]) {
            assert.equal(tableAnswerPayload(value), plain)
        }
    })

    test('what is sent reads back as rows after a single parse', () => {
        assert.ok(Array.isArray(JSON.parse(tableAnswerPayload(twice))))
    })

    test('an untouched new table sends what create always sent', () => {
        // Before: JSON.stringify(formField.responses ?? []) with responses ''.
        assert.equal(tableAnswerPayload(''), JSON.stringify(''))
        assert.equal(tableAnswerPayload(undefined), JSON.stringify(undefined ?? []))
        assert.equal(tableAnswerPayload(null), JSON.stringify(null ?? []))
        assert.equal(tableAnswerPayload([]), JSON.stringify([]))
    })

    test('an empty table stored "" and wrapped by earlier saves sends "" again', () => {
        for (const value of ['""', JSON.stringify('""'), JSON.stringify(JSON.stringify('""'))]) {
            assert.equal(tableAnswerPayload(value), '""', value)
        }
    })

    test('a reopen, untouched, saved again and again stays the same', () => {
        for (const start of [plain, '""']) {
            let stored = start
            for (let save = 0; save < 5; save++) stored = tableAnswerPayload(tableAnswerOf(stored) ?? '')
            assert.equal(stored, start)
        }
    })
})
