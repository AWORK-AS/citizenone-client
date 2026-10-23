/**
 * Unit tests for composables/surveyFollowUps.ts - which follow-up questions a
 * respondent sees for a given set of answers.
 *
 *   node --test tests/unit/surveyFollowUps.test.mjs
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { visibleSurveyQuestions, surveyQuestionDepth } from '../../composables/surveyFollowUps.ts'

const q = (uuid, question) => ({ uuid, question })
const survey = [
    q('smoke', { type: 'choice', options: ['Ja', 'Nej'] }),
    q('howMuch', { type: 'checkbox', options: ['Cigaretter', 'Snus'], show_if: { question: 'smoke', options: [0] } }),
    q('snus', { type: 'textfield', show_if: { question: 'howMuch', options: [1] } }),
    q('other', { type: 'textarea' }),
]
const uuids = answers => visibleSurveyQuestions(survey, answers).map(x => x.uuid)

test('follow-ups are hidden until the parent is answered', () => {
    assert.deepEqual(uuids({}), ['smoke', 'other'])
})

test('a matching choice shows the follow-up', () => {
    assert.deepEqual(uuids({ smoke: 0 }), ['smoke', 'howMuch', 'other'])
    assert.deepEqual(uuids({ smoke: 1 }), ['smoke', 'other'])
})

test('a checkbox follow-up shows when any picked option matches', () => {
    assert.deepEqual(uuids({ smoke: 0, howMuch: [0, 1] }), ['smoke', 'howMuch', 'snus', 'other'])
})

test('a follow-up of a hidden follow-up stays hidden', () => {
    assert.deepEqual(uuids({ smoke: 1, howMuch: [1] }), ['smoke', 'other'])
})

test('a JSON string definition is understood', () => {
    const s = [q('a', JSON.stringify({ type: 'choice', options: ['Ja'] })), q('b', JSON.stringify({ type: 'textfield', show_if: { question: 'a', options: [0] } }))]
    assert.deepEqual(visibleSurveyQuestions(s, { a: 0 }).map(x => x.uuid), ['a', 'b'])
})

test('a missing parent means no condition', () => {
    assert.deepEqual(visibleSurveyQuestions([q('x', { type: 'textfield', show_if: { question: 'gone', options: [0] } })], {}).map(x => x.uuid), ['x'])
})

test('depth counts the parents above a question', () => {
    assert.equal(surveyQuestionDepth(survey[0], survey), 0)
    assert.equal(surveyQuestionDepth(survey[2], survey), 2)
})
