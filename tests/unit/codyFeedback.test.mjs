/**
 * Unit tests for composables/codyFeedback.ts - what a thumbs press on a Cody
 * answer does to its rating.
 *
 * The cases that would quietly go wrong: picking a reason after a thumbs down
 * must not be read as pressing thumbs down again (which would clear it), and a
 * reason must never travel with a thumbs up - the backend drops it, so the
 * screen and the stored rating would disagree.
 *
 * No server, no browser, no build step: Node 22+ strips the composable's type
 * annotations at import time. Run with:
 *
 *   node --test tests/unit/codyFeedback.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { nextFeedback, ANSWER_FEEDBACK_REASONS } from '../../composables/codyFeedback.ts'

describe('nextFeedback - a thumbs press', () => {
    test('a first thumbs up is saved', () => {
        assert.deepEqual(nextFeedback(null, 'up'), { feedback: 'up', feedbackReason: null, feedbackGiven: true })
    })

    test('a first thumbs down is saved without a reason', () => {
        assert.deepEqual(nextFeedback(undefined, 'down'), { feedback: 'down', feedbackReason: null, feedbackGiven: true })
    })

    test('pressing the same thumbs again takes the rating back', () => {
        assert.deepEqual(nextFeedback('up', 'up'), { feedback: null, feedbackReason: null, feedbackGiven: false })
        assert.deepEqual(nextFeedback('down', 'down'), { feedback: null, feedbackReason: null, feedbackGiven: false })
    })

    test('switching thumbs replaces the rating', () => {
        assert.equal(nextFeedback('up', 'down').feedback, 'down')
        assert.equal(nextFeedback('down', 'up').feedback, 'up')
    })

    test('a reason after a thumbs down keeps the thumbs down', () => {
        assert.deepEqual(nextFeedback('down', 'down', 'wrong'), { feedback: 'down', feedbackReason: 'wrong', feedbackGiven: true })
    })

    test('a reason never travels with a thumbs up', () => {
        assert.equal(nextFeedback(null, 'up', 'wrong').feedbackReason, null)
        assert.equal(nextFeedback('down', 'up', 'incomplete').feedbackReason, null)
    })

    test('an explicit clear always clears', () => {
        assert.deepEqual(nextFeedback('down', null, 'other'), { feedback: null, feedbackReason: null, feedbackGiven: false })
    })
})

describe('reasons - the fixed list the backend accepts', () => {
    test('matches RateAiMessageRequest exactly', () => {
        assert.deepEqual([...ANSWER_FEEDBACK_REASONS], ['wrong', 'incomplete', 'not_helpful', 'other'])
    })
})
