/**
 * node --test tests/unit/secureMailSendOutcome.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

const { secureMailSendOutcome } = await import('../../composables/secureMailSendOutcome.ts')

describe('secureMailSendOutcome', () => {
    test('normal success', () => {
        assert.deepEqual(secureMailSendOutcome({ message: 'Success.' }), { kind: 'sent' })
        assert.deepEqual(secureMailSendOutcome({ message: 'Succes.' }), { kind: 'sent' })
    })

    test('saved but not delivered carries the server message', () => {
        const error = Object.assign(new Error('Saved but not delivered to 1 of 2'), { saved: true, status: 400 })
        assert.deepEqual(secureMailSendOutcome(undefined, error), {
            kind: 'saved_not_delivered',
            message: 'Saved but not delivered to 1 of 2',
        })
    })

    test('real errors are failures', () => {
        assert.deepEqual(secureMailSendOutcome(undefined, new Error('x')), { kind: 'failed' })
        assert.deepEqual(secureMailSendOutcome(undefined, { saved: false, message: 'x' }), { kind: 'failed' })
        assert.deepEqual(secureMailSendOutcome(undefined, { saved: 'true' }), { kind: 'failed' })
    })

    test('unexpected response body is not a success', () => {
        assert.deepEqual(secureMailSendOutcome({ message: 'nope' }), { kind: 'failed' })
        assert.deepEqual(secureMailSendOutcome(undefined), { kind: 'failed' })
    })
})
