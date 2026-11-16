/**
 * Unit tests for composables/surveyQuestionOrder.ts - moving questions up and
 * down in the survey builder without separating follow-ups from their parent.
 *
 *   node --test tests/unit/surveyQuestionOrder.test.mjs
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { adjacentSiblingIndex, insertSurveyQuestionAfter, moveSurveyQuestion } from '../../composables/surveyQuestionOrder.ts'

const q = (key, parent) => (parent ? { key, show_if: { question: parent, options: [0] } } : { key })
// 1 mood, 2 smoke (2.1 howMuch (2.1.1 snus), 2.2 since), 3 other
const survey = () => [
    q('mood'),
    q('smoke'),
    q('howMuch', 'smoke'),
    q('snus', 'howMuch'),
    q('since', 'smoke'),
    q('other'),
]
const keys = questions => questions.map(x => x.key)
const moved = (key, direction) => {
    const questions = survey()
    moveSurveyQuestion(questions, keys(questions).indexOf(key), direction)
    return keys(questions)
}

test('a question moves past its neighbour', () => {
    assert.deepEqual(moved('mood', 1), ['smoke', 'howMuch', 'snus', 'since', 'mood', 'other'])
    assert.deepEqual(moved('other', -1), ['mood', 'other', 'smoke', 'howMuch', 'snus', 'since'])
})

test('a question takes its follow-ups along', () => {
    assert.deepEqual(moved('smoke', -1), ['smoke', 'howMuch', 'snus', 'since', 'mood', 'other'])
    assert.deepEqual(moved('smoke', 1), ['mood', 'other', 'smoke', 'howMuch', 'snus', 'since'])
})

test('a follow-up only moves among the follow-ups of the same question', () => {
    assert.deepEqual(moved('since', -1), ['mood', 'smoke', 'since', 'howMuch', 'snus', 'other'])
    assert.deepEqual(moved('howMuch', 1), ['mood', 'smoke', 'since', 'howMuch', 'snus', 'other'])
})

test('nothing moves past the first or last place, or out from under the parent', () => {
    const questions = survey()
    const at = key => keys(questions).indexOf(key)
    assert.equal(adjacentSiblingIndex(questions, at('mood'), -1), undefined)
    assert.equal(adjacentSiblingIndex(questions, at('other'), 1), undefined)
    assert.equal(adjacentSiblingIndex(questions, at('howMuch'), -1), undefined)
    assert.equal(adjacentSiblingIndex(questions, at('since'), 1), undefined)
    assert.equal(adjacentSiblingIndex(questions, at('snus'), -1), undefined)
    assert.equal(adjacentSiblingIndex(questions, at('snus'), 1), undefined)

    moveSurveyQuestion(questions, at('mood'), -1)
    moveSurveyQuestion(questions, at('snus'), 1)
    assert.deepEqual(keys(questions), keys(survey()))
})

test('a follow-up whose parent is gone counts as a top-level question', () => {
    const questions = [q('a'), q('orphan', 'deleted'), q('b')]
    moveSurveyQuestion(questions, 1, -1)
    assert.deepEqual(keys(questions), ['orphan', 'a', 'b'])
})

const inserted = (key) => {
    const questions = survey()
    const added = { key: 'new' }
    insertSurveyQuestionAfter(questions, keys(questions).indexOf(key), added)
    return { order: keys(questions), added }
}

test('a question added below a top-level question lands right after it', () => {
    const { order, added } = inserted('mood')
    assert.deepEqual(order, ['mood', 'new', 'smoke', 'howMuch', 'snus', 'since', 'other'])
    assert.equal(added.show_if, undefined)
})

test('a question added below a question with follow-ups lands after the follow-ups', () => {
    const { order, added } = inserted('smoke')
    assert.deepEqual(order, ['mood', 'smoke', 'howMuch', 'snus', 'since', 'new', 'other'])
    assert.equal(added.show_if, undefined)
})

test('a question added below a follow-up becomes a follow-up of the same parent', () => {
    const questions = survey()
    questions[2].show_if.options = [1, 2]
    const added = { key: 'new' }
    insertSurveyQuestionAfter(questions, 2, added)
    assert.deepEqual(keys(questions), ['mood', 'smoke', 'howMuch', 'snus', 'new', 'since', 'other'])
    assert.deepEqual(added.show_if, { question: 'smoke', options: [1, 2] })
    // its own copy, so changing one condition leaves the other alone
    added.show_if.options.push(0)
    assert.deepEqual(questions[2].show_if.options, [1, 2])
    // and it moves like any other follow-up of that parent
    assert.equal(adjacentSiblingIndex(questions, 4, -1), 2)
    assert.equal(adjacentSiblingIndex(questions, 4, 1), 5)
})

test('a question added below the last question goes at the end', () => {
    assert.deepEqual(inserted('other').order, ['mood', 'smoke', 'howMuch', 'snus', 'since', 'other', 'new'])
})
