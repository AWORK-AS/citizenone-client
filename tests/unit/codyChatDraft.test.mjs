// A chat message Cody AI drafted, handed to the normal chat in memory and never in a URL.
//   node --test tests/unit/codyChatDraft.test.mjs
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { PREFILL_MAX_AGE_MS, chatPathFor, mergeIntoField, prefillFromCard, prefillTextFor } from '../../composables/codyChatDraft.ts'

const NOW = Date.UTC(2026, 10, 7, 9)
const card = (extra = {}) => ({
    type: 'chat_message', ref: 'employee:u-1', title: 'Anne Kollegasen', recipient: 'colleague',
    draft: '  Jeg er 10 min forsinket.  ', target: { type: 'employee', uuid: 'u-1' }, ...extra,
})

describe('prefillFromCard', () => {
    it('takes the target and the trimmed text from a chat_message card', () => {
        assert.deepEqual(prefillFromCard(card(), NOW), {
            target: { type: 'employee', uuid: 'u-1' }, text: 'Jeg er 10 min forsinket.', createdAt: NOW,
        })
        assert.deepEqual(prefillFromCard(card({ target: { type: 'chat', uuid: 'c-9' } }), NOW).target, { type: 'chat', uuid: 'c-9' })
    })
    it('refuses anything else', () => {
        assert.equal(prefillFromCard({ ...card(), type: 'task' }, NOW), null)
        assert.equal(prefillFromCard(card({ draft: '   ' }), NOW), null)
        assert.equal(prefillFromCard(card({ target: { type: 'citizen', uuid: 'x' } }), NOW), null)
        assert.equal(prefillFromCard(card({ target: { type: 'chat', uuid: '' } }), NOW), null)
        assert.equal(prefillFromCard(null, NOW), null)
    })
})

describe('chatPathFor', () => {
    it('opens the conversation, or the chat page for a new one, and never carries the text', () => {
        assert.equal(chatPathFor({ type: 'chat', uuid: 'c-9' }), '/messages/c-9')
        assert.equal(chatPathFor({ type: 'employee', uuid: 'u-1' }), '/messages')
        const prefill = prefillFromCard(card({ target: { type: 'chat', uuid: 'c-9' } }), NOW)
        assert.ok(!chatPathFor(prefill.target).includes('forsinket'))
        assert.ok(!chatPathFor(prefill.target).includes('?'))
    })
    it('encodes a uuid it is handed', () => {
        assert.equal(chatPathFor({ type: 'chat', uuid: 'a/b?c' }), '/messages/a%2Fb%3Fc')
    })
})

describe('prefillTextFor', () => {
    const pending = prefillFromCard(card(), NOW)
    it('hands the text to the matching target only', () => {
        assert.equal(prefillTextFor(pending, { type: 'employee', uuid: 'u-1' }, NOW + 1000), 'Jeg er 10 min forsinket.')
        assert.equal(prefillTextFor(pending, { type: 'employee', uuid: 'u-2' }, NOW), null)
        assert.equal(prefillTextFor(pending, { type: 'chat', uuid: 'u-1' }, NOW), null)
        assert.equal(prefillTextFor(null, { type: 'employee', uuid: 'u-1' }, NOW), null)
    })
    it('drops an old draft rather than surprising someone with it later', () => {
        assert.equal(prefillTextFor(pending, { type: 'employee', uuid: 'u-1' }, NOW + PREFILL_MAX_AGE_MS + 1), null)
    })
})

describe('mergeIntoField', () => {
    it('keeps what was already typed', () => {
        assert.equal(mergeIntoField('', 'Hej'), 'Hej')
        assert.equal(mergeIntoField('   ', 'Hej'), 'Hej')
        assert.equal(mergeIntoField('Godmorgen', 'Hej'), 'Godmorgen\nHej')
    })
})

describe('lang', () => {
    it('has the card strings in every language', () => {
        for (const l of ['dk', 'en', 'sv', 'no']) {
            const d = JSON.parse(readFileSync(new URL(`../../lang/${l}.json`, import.meta.url), 'utf8')).assistants.chatDraft
            for (const key of ['to', 'toGroup', 'colleague', 'groupChat', 'open', 'copy', 'copied', 'copyFailed', 'notSent']) assert.ok(d?.[key], `${l}.${key}`)
        }
    })
})
