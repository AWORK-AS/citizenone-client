/**
 * Unit tests for composables/codyPreview.ts and staffAskState in composables/managerSuggestion.ts.
 *
 *   node --test tests/unit/codyPreview.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { previewAudience, isCodyShortcut } from '../../composables/codyPreview.ts'
import { staffAskState } from '../../composables/managerSuggestion.ts'

describe('previewAudience', () => {
    test('module off: nothing to show', () => {
        assert.equal(previewAudience({ moduleEnabled: false, hasAccess: false, canBuy: true }), 'hidden')
    })
    test('a seat opens the chat, whoever the person is', () => {
        assert.equal(previewAudience({ moduleEnabled: true, hasAccess: true, canBuy: false }), 'chat')
        assert.equal(previewAudience({ moduleEnabled: true, hasAccess: true, canBuy: true }), 'chat')
    })
    test('no seat: purchasers start the trial, staff ask their manager', () => {
        assert.equal(previewAudience({ moduleEnabled: true, hasAccess: false, canBuy: true }), 'buyer')
        assert.equal(previewAudience({ moduleEnabled: true, hasAccess: false, canBuy: false }), 'staff')
    })
})

describe('isCodyShortcut', () => {
    test('Cmd/Ctrl+J only', () => {
        assert.equal(isCodyShortcut({ metaKey: true, key: 'j' }), true)
        assert.equal(isCodyShortcut({ ctrlKey: true, key: 'J' }), true)
        assert.equal(isCodyShortcut({ key: 'j' }), false)
        assert.equal(isCodyShortcut({ ctrlKey: true, key: 'k' }), false)
    })
})

describe('staffAskState', () => {
    const base = { can_suggest: false, reason: null, remaining: 3, recipients: [] }
    test('send when the backend allows and there is someone to ask', () => {
        assert.equal(staffAskState({ ...base, can_suggest: true, recipients: [{ uuid: 'a', name: 'A' }] }), 'send')
    })
    test('the backend reasons map to states', () => {
        assert.equal(staffAskState({ ...base, reason: 'already_suggested' }), 'already')
        assert.equal(staffAskState({ ...base, reason: 'no_recipient' }), 'no_recipient')
        assert.equal(staffAskState({ ...base, reason: 'already_bought' }), 'company_has')
    })
    test('a missing answer, a limit or no company stays quiet', () => {
        assert.equal(staffAskState(null), 'none')
        assert.equal(staffAskState({ ...base, reason: 'limit_reached' }), 'none')
        assert.equal(staffAskState({ ...base, reason: 'no_company' }), 'none')
    })
})
