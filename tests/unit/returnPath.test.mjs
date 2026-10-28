/**
 * Unit tests for utils/returnPath.ts - where the form builder may send someone
 * back to after saving.
 *
 *   node --test tests/unit/returnPath.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
const { safeReturnPath } = await import('../../utils/returnPath.ts')

describe('a safe return path', () => {
    test('accepts an in-app path', () => {
        assert.equal(safeReturnPath('/citizens/abc/patient-forms'), '/citizens/abc/patient-forms')
    })

    for (const [label, value] of [
        ['another origin', 'https://evil.example/x'],
        ['a protocol-relative URL', '//evil.example/x'],
        ['a backslash trick', '/\\evil.example'],
        ['a relative path', 'citizens/abc'],
        ['a control character', '/citizens/\nabc'],
        ['an empty string', ''],
        ['an array from a repeated query key', ['/a', '/b']],
        ['nothing', undefined],
    ]) {
        test(`rejects ${label}`, () => {
            assert.equal(safeReturnPath(value), null)
        })
    }
})
