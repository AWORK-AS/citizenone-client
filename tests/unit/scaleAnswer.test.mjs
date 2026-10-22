/**
 * Unit tests for composables/scaleAnswer.ts - what a ruler holds and what a
 * fill-in sends for it.
 *
 * A reopened report put the stored JSON string back on the ruler, and a ruler
 * nobody touched sent that string encoded once more on every save (agent case
 * C3/C4, 22 Oct). The inputs are the shapes the details endpoint returned:
 * plain JSON from "create", wrapped once and twice by the edit-saves.
 *
 *   node --test tests/unit/scaleAnswer.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { scaleAnswerOf, scaleAnswerPayload } from '../../composables/scaleAnswer.ts'

const answer = { measured_at: '2026-10-22', scores: [{ rater_key: 'staff', rater_label: 'Staff', score: 4.5 }] }
const plain = JSON.stringify(answer)
const once = JSON.stringify(plain)
const twice = JSON.stringify(once)

describe('scaleAnswerOf', () => {
    test('an object the ruler emitted is kept', () => {
        assert.deepEqual(scaleAnswerOf(answer), answer)
    })

    test('the stored JSON string is read', () => {
        assert.deepEqual(scaleAnswerOf(plain), answer)
    })

    test('an answer wrapped once or twice by earlier saves is read', () => {
        assert.deepEqual(scaleAnswerOf(once), answer)
        assert.deepEqual(scaleAnswerOf(twice), answer)
    })

    test('nothing, an empty string and the stored empty "" hold no answer', () => {
        for (const value of [undefined, null, '', '""']) {
            assert.equal(scaleAnswerOf(value), null, JSON.stringify(value))
        }
    })

    test('text that is not JSON, a list and a number hold no answer', () => {
        for (const value of ['not json', '[1,2]', [1, 2], 5, '5']) {
            assert.equal(scaleAnswerOf(value), null, JSON.stringify(value))
        }
    })

    test('an answer without scores gets an empty list', () => {
        assert.deepEqual(scaleAnswerOf('{"measured_at":"2026-10-22"}'), { measured_at: '2026-10-22', scores: [] })
    })

    test('a wrapping deeper than the bound is not followed for ever', () => {
        let value = plain
        for (let i = 0; i < 20; i++) value = JSON.stringify(value)
        assert.equal(scaleAnswerOf(value), null)
    })
})

describe('scaleAnswerPayload', () => {
    test('object, stored string and wrapped strings all send the same plain JSON', () => {
        for (const value of [answer, plain, once, twice]) {
            assert.equal(scaleAnswerPayload(value), plain)
        }
    })

    test('what is sent reads back as an object after a single parse', () => {
        assert.equal(typeof JSON.parse(scaleAnswerPayload(twice)), 'object')
    })

    test('an untouched empty ruler sends an empty list of scores', () => {
        for (const value of [undefined, null, '', '""']) {
            assert.equal(scaleAnswerPayload(value), '{"scores":[]}', JSON.stringify(value))
        }
    })

    test('a reopen, untouched, saved again and again stays the same', () => {
        let stored = plain
        for (let save = 0; save < 5; save++) stored = scaleAnswerPayload(scaleAnswerOf(stored))
        assert.equal(stored, plain)
    })
})
