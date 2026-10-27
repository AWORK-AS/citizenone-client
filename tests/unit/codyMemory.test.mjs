/**
 * Unit tests for composables/codyMemory.ts - what the Cody AI panel and the
 * profile page show about what Cody remembers.
 *
 * Cody AI asks before it remembers anything. The cases that would quietly go
 * wrong: a proposal without a token being offered (a "Ja" that could only
 * fail), a confirm failure that loses the question, a storage-full note on
 * every answer, and an upgrade link from the server leaving the app.
 *
 *   node --test tests/unit/codyMemory.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
    memoryNoteFor,
    noteAfterConfirm,
    safeUpgradeUrl,
    sortMemories,
    withoutMemory,
    CODY_MEMORY_PAGE,
    CODY_MEMORY_ANCHOR,
} from '../../composables/codyMemory.ts'

const TOKEN = 'a'.repeat(48)

const payload = (overrides = {}) => ({
    proposal: null,
    storage_full: false,
    storage_message: null,
    upgrade_url: null,
    ...overrides,
})

describe('memoryNoteFor - the note under an answer', () => {
    test('an answer that touched no memory shows nothing', () => {
        assert.equal(memoryNoteFor(null, { storageFullShown: false }), null)
        assert.equal(memoryNoteFor(payload(), { storageFullShown: false }), null)
    })

    test('a proposal becomes the question, with the server token', () => {
        assert.deepEqual(
            memoryNoteFor(payload({ proposal: { token: TOKEN, content: 'Foretrækker korte svar' } }), { storageFullShown: false }),
            { kind: 'proposal', token: TOKEN, content: 'Foretrækker korte svar' },
        )
    })

    test('a proposal without a token or text is not offered', () => {
        assert.equal(memoryNoteFor(payload({ proposal: { token: '', content: 'x' } }), { storageFullShown: false }), null)
        assert.equal(memoryNoteFor(payload({ proposal: { token: TOKEN, content: '  ' } }), { storageFullShown: false }), null)
    })

    test('a full storage quota says so, with the server message and the upgrade path', () => {
        assert.deepEqual(
            memoryNoteFor(payload({ storage_full: true, storage_message: 'Ikke nok plads', upgrade_url: '/storage/upgrade' }), { storageFullShown: false }),
            { kind: 'storage_full', message: 'Ikke nok plads', upgradeUrl: '/storage/upgrade' },
        )
    })

    test('storage full is shown once per session', () => {
        assert.equal(memoryNoteFor(payload({ storage_full: true }), { storageFullShown: true }), null)
    })
})

describe('noteAfterConfirm - what "Ja" leads to', () => {
    const proposal = { token: TOKEN, content: 'Foretrækker korte svar' }

    test('the first memory ever carries the one-time note', () => {
        assert.deepEqual(
            noteAfterConfirm(proposal, { ok: true, body: { data: { content: 'Foretrækker korte svar' }, first_saved: true } }),
            { kind: 'saved', content: 'Foretrækker korte svar', firstSaved: true },
        )
    })

    test('a later memory is simply saved', () => {
        assert.equal(noteAfterConfirm(proposal, { ok: true, body: { data: {}, first_saved: false } }).firstSaved, false)
    })

    test('something already remembered says so', () => {
        assert.equal(noteAfterConfirm(proposal, { ok: true, body: { already_known: true } }).kind, 'already_known')
    })

    test('a full quota on confirm becomes the upgrade note', () => {
        assert.deepEqual(
            noteAfterConfirm(proposal, { ok: false, error: { code: 'storage_quota_exceeded', message: 'Fuld', upgrade_url: '/storage/upgrade' } }),
            { kind: 'storage_full', message: 'Fuld', upgradeUrl: '/storage/upgrade' },
        )
    })

    test('a refusal on confirm and an expired token are said plainly', () => {
        assert.equal(noteAfterConfirm(proposal, { ok: false, error: { code: 'cody_memory_refused' } }).kind, 'refused')
        assert.equal(noteAfterConfirm(proposal, { ok: false, error: { code: 'cody_memory_proposal_expired', status: 404 } }).kind, 'expired')
    })

    test('a confirm already running for this person keeps the question to try again', () => {
        assert.deepEqual(
            noteAfterConfirm(proposal, { ok: false, error: { code: 'cody_memory_busy', status: 409 } }),
            { kind: 'proposal', token: TOKEN, content: 'Foretrækker korte svar', failed: true },
        )
    })

    test('an unexplained failure keeps the question so it can be tried again', () => {
        assert.deepEqual(
            noteAfterConfirm(proposal, { ok: false, error: new Error('offline') }),
            { kind: 'proposal', token: TOKEN, content: 'Foretrækker korte svar', failed: true },
        )
    })
})

describe('safeUpgradeUrl', () => {
    test('an in-app path is kept', () => {
        assert.equal(safeUpgradeUrl('/storage/upgrade'), '/storage/upgrade')
    })

    test('anything that could leave the app is dropped', () => {
        for (const url of ['https://evil.example', '//evil.example', 'javascript:alert(1)', '/\\evil.example', '', 42, null]) {
            assert.equal(safeUpgradeUrl(url), null, String(url))
        }
    })
})

describe('the memory list', () => {
    const list = [
        { uuid: 'a', content: 'Older', learned_at: '2026-10-01T10:00:00+02:00', last_used_at: null },
        { uuid: 'b', content: 'Newer', learned_at: '2026-10-20T10:00:00+02:00', last_used_at: null },
        { uuid: 'c', content: 'Unknown date', learned_at: null, last_used_at: null },
    ]

    test('newest learned first, an unknown date last, without changing the input', () => {
        assert.deepEqual(sortMemories(list).map((m) => m.uuid), ['b', 'a', 'c'])
        assert.deepEqual(list.map((m) => m.uuid), ['a', 'b', 'c'])
    })

    test('forgetting one removes exactly that one', () => {
        assert.deepEqual(withoutMemory(list, 'a').map((m) => m.uuid), ['b', 'c'])
    })

    test('the link in the note lands on the section it names', () => {
        assert.ok(CODY_MEMORY_PAGE.endsWith(`#${CODY_MEMORY_ANCHOR}`))
    })
})
