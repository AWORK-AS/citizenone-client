/**
 * Unit tests for composables/blockKey.ts - the builder's key for a block.
 *
 * Keyed by position, a block moved into a group left the pickers of the
 * blocks around it showing the wrong choice (agent run G2, 22 Oct).
 *
 *   node --test tests/unit/blockKey.test.mjs
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { blockKey } from '../../composables/blockKey.ts'

test('the same block always gets the same key, wherever it moves', () => {
    const fields = [{ type: 'textfield' }, { type: 'group', groupId: 'g1' }, { type: 'textarea' }]
    const before = fields.map(blockKey)

    const [moved] = fields.splice(0, 1)
    fields.splice(2, 0, moved)

    assert.equal(blockKey(moved), before[0])
    assert.deepEqual(fields.map(blockKey), [before[1], before[2], before[0]])
})

test('two blocks get two keys, a duplicate included', () => {
    const block = { type: 'textfield', value: 'Question' }
    const copy = JSON.parse(JSON.stringify(block))

    assert.notEqual(blockKey(block), blockKey(copy))
    assert.notEqual(blockKey({}), blockKey({}))
})

test('the block itself is left as it was', () => {
    const block = { type: 'textfield', value: 'Question' }
    const json = JSON.stringify(block)

    blockKey(block)

    assert.equal(JSON.stringify(block), json)
    assert.deepEqual(Object.keys(block), ['type', 'value'])
})
