/**
 * Unit tests for composables/surveyCompletion.ts - which survey assignments
 * still need sending after a journal note was saved.
 *
 *   node --test tests/unit/surveyCompletion.test.mjs
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { completeSurveyEntries } from '../../composables/surveyCompletion.ts'

const e = (id) => ({ assignment_uuid: id, answers: { q: id } })

test('nothing pending means nothing failed', async () => {
    assert.deepEqual(await completeSurveyEntries(null, async () => {}), [])
    assert.deepEqual(await completeSurveyEntries([], async () => {}), [])
})

test('returns only the failed entries and still sends the rest', async () => {
    const sent = []
    const failed = await completeSurveyEntries([e('a'), e('b'), e('c')], async (x) => {
        sent.push(x.assignment_uuid)
        if (x.assignment_uuid === 'b') throw new Error('500')
    })
    assert.deepEqual(sent, ['a', 'b', 'c'])
    assert.deepEqual(failed.map((x) => x.assignment_uuid), ['b'])
})

test('a retry re-sends only what failed and can succeed', async () => {
    let calls = 0
    const flaky = async () => { if (calls++ === 0) throw new Error('timeout') }
    const first = await completeSurveyEntries([e('a')], flaky)
    assert.equal(first.length, 1)
    const second = await completeSurveyEntries(first, flaky)
    assert.deepEqual(second, [])
    assert.equal(calls, 2)
})
