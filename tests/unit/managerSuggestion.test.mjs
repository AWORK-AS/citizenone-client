/**
 * Unit tests for composables/managerSuggestion.ts - the pure rules behind "Suggest to my manager".
 *
 *   node --test tests/unit/managerSuggestion.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
    SUGGESTION_MESSAGE_MAX, initialSelection, looksLikePersonalNumber, messageProblem,
    shouldOfferSuggestion, suggestionOutcome, toggleRecipient,
} from '../../composables/managerSuggestion.ts'

const status = (over = {}) => ({ can_suggest: true, reason: null, remaining: 3, recipients: [{ uuid: 'a', name: 'A' }], ...over })

describe('shouldOfferSuggestion', () => {
    test('offered to a non-buyer when the backend says so', () => {
        assert.equal(shouldOfferSuggestion({ isBuyer: false, appActivated: false, status: status() }), true)
    })
    test('never to a buyer, whatever the status says', () => {
        assert.equal(shouldOfferSuggestion({ isBuyer: true, appActivated: false, status: status() }), false)
    })
    test('not when the company already has the app', () => {
        assert.equal(shouldOfferSuggestion({ isBuyer: false, appActivated: true, status: status() }), false)
    })
    test('not without an answer, a refusal or nobody to send to', () => {
        assert.equal(shouldOfferSuggestion({ isBuyer: false, appActivated: false, status: null }), false)
        assert.equal(shouldOfferSuggestion({ isBuyer: false, appActivated: false, status: status({ can_suggest: false }) }), false)
        assert.equal(shouldOfferSuggestion({ isBuyer: false, appActivated: false, status: status({ recipients: [] }) }), false)
    })
})

describe('recipients', () => {
    test('a single recipient is preselected, several are not', () => {
        assert.deepEqual(initialSelection([{ uuid: 'a' }]), ['a'])
        assert.deepEqual(initialSelection([{ uuid: 'a' }, { uuid: 'b' }]), [])
        assert.deepEqual(initialSelection([]), [])
    })
    test('toggle adds and removes without mutating', () => {
        const start = ['a']
        assert.deepEqual(toggleRecipient(start, 'b'), ['a', 'b'])
        assert.deepEqual(toggleRecipient(start, 'a'), [])
        assert.deepEqual(start, ['a'])
    })
})

describe('message', () => {
    test('personal identity numbers are caught in both common shapes', () => {
        assert.equal(looksLikePersonalNumber('see 010190-1234'), true)
        assert.equal(looksLikePersonalNumber('0101901234'), true)
        assert.equal(looksLikePersonalNumber('call 12 34 56 78'), false)
        assert.equal(looksLikePersonalNumber('We save 2.37 hours a day'), false)
    })
    test('problems', () => {
        assert.equal(messageProblem('Fine'), null)
        assert.equal(messageProblem('x'.repeat(SUGGESTION_MESSAGE_MAX + 1)), 'too_long')
        assert.equal(messageProblem('010190-1234'), 'personal_number')
    })
})

describe('suggestionOutcome', () => {
    test('maps the backend answer', () => {
        assert.equal(suggestionOutcome({ sent: true }), 'sent')
        assert.equal(suggestionOutcome({ sent: false, reason: 'already_suggested' }), 'already')
        assert.equal(suggestionOutcome({ sent: false, reason: 'limit_reached' }), 'limit')
        assert.equal(suggestionOutcome({ sent: false, reason: 'can_manage' }), 'none')
        assert.equal(suggestionOutcome(null), 'none')
    })
})
