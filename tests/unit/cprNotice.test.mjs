/**
 * Unit tests for composables/cprNotice.ts.
 *
 *   node --test tests/unit/cprNotice.test.mjs   (Node 22: it imports the .ts directly)
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'

const { containsCpr } = await import('../../composables/cprNotice.ts')

test('a CPR number with a dash, a space or nothing between the parts is found', () => {
    assert.equal(containsCpr('Hvordan har 010190-1234 det?'), true)
    assert.equal(containsCpr('cpr 010190 1234'), true)
    assert.equal(containsCpr('0101901234'), true)
})

test('a birth date alone, a phone number or a longer number is not a CPR number', () => {
    assert.equal(containsCpr('Født 010190'), false)
    assert.equal(containsCpr('Ring 22 33 44 55'), false)
    assert.equal(containsCpr('Ordre 123456789012'), false)
    assert.equal(containsCpr(''), false)
    assert.equal(containsCpr(null), false)
})
