/**
 * Unit tests for composables/emailLoginCode.ts -- the pure rules behind signing
 * in with a 6-digit code sent by email.
 *
 *   node --test tests/unit/emailLoginCode.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

const { sanitizeEmailCode, shouldSubmitEmailCode, isPlausibleEmail, EMAIL_CODE_LENGTH } =
    await import('../../composables/emailLoginCode.ts')

describe('sanitizeEmailCode', () => {
    test('keeps digits only', () => {
        assert.equal(sanitizeEmailCode('12a3-4 5'), '12345')
    })

    test('a pasted code with a space in the middle becomes 6 digits', () => {
        assert.equal(sanitizeEmailCode('123 456'), '123456')
    })

    test('never longer than 6 digits', () => {
        assert.equal(sanitizeEmailCode('1234567890'), '123456')
    })

    test('null and undefined are empty', () => {
        assert.equal(sanitizeEmailCode(null), '')
        assert.equal(sanitizeEmailCode(undefined), '')
    })
})

describe('shouldSubmitEmailCode', () => {
    test('waits for the sixth digit', () => {
        assert.equal(EMAIL_CODE_LENGTH, 6)
        assert.equal(shouldSubmitEmailCode('12345', null), false)
    })

    test('submits a complete code', () => {
        assert.equal(shouldSubmitEmailCode('123456', null), true)
    })

    test('never submits the same digits twice', () => {
        assert.equal(shouldSubmitEmailCode('123456', '123456'), false)
    })

    test('submits again once the digits differ', () => {
        assert.equal(shouldSubmitEmailCode('654321', '123456'), true)
    })
})

describe('isPlausibleEmail', () => {
    test('accepts an address, with surrounding spaces', () => {
        assert.equal(isPlausibleEmail(' a@b.dk '), true)
    })

    test('rejects the rest', () => {
        for (const v of ['', 'a', 'a@b', '@b.dk', 'a b@c.dk', null, undefined]) {
            assert.equal(isPlausibleEmail(v), false)
        }
    }) 
})
