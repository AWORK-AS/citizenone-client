/**
 * Unit tests for composables/codyMemory.ts - what the Cody AI panel and the
 * profile page show about what Cody remembers.
 *
 * The cases that would quietly go wrong: the storage-full note repeating on
 * every answer, the first-time note showing for a memory that was never
 * stored, and an upgrade link from the payload leaving the app.
 *
 *   node --test tests/unit/codyMemory.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
    memoryNoteFor,
    safeUpgradeUrl,
    sortMemories,
    withoutMemory,
    CODY_MEMORY_PAGE,
    CODY_MEMORY_ANCHOR,
} from '../../composables/codyMemory.ts'

const payload = (overrides = {}) => ({
    saved: 1,
    first_saved: false,
    storage_full: false,
    storage_message: null,
    upgrade_url: null,
    ...overrides,
})

describe('memoryNoteFor - the note under an answer', () => {
    test('an answer that touched no memory shows nothing', () => {
        assert.equal(memoryNoteFor(null, { storageFullShown: false }), null)
        assert.equal(memoryNoteFor(undefined, { storageFullShown: false }), null)
    })

    test('the first memory ever shows the one-time note', () => {
        assert.deepEqual(memoryNoteFor(payload({ first_saved: true }), { storageFullShown: false }), { kind: 'first_saved' })
    })

    test('a later memory shows nothing', () => {
        assert.equal(memoryNoteFor(payload(), { storageFullShown: false }), null)
    })

    test('a full storage quota says so, with the server message and the upgrade path', () => {
        const note = memoryNoteFor(
            payload({ saved: 0, storage_full: true, storage_message: 'Ikke nok plads', upgrade_url: '/storage/upgrade' }),
            { storageFullShown: false },
        )
        assert.deepEqual(note, { kind: 'storage_full', message: 'Ikke nok plads', upgradeUrl: '/storage/upgrade' })
    })

    test('storage full is shown once per session', () => {
        assert.equal(memoryNoteFor(payload({ storage_full: true }), { storageFullShown: true }), null)
    })

    test('storage full wins over the first-time note, since nothing was stored', () => {
        assert.equal(
            memoryNoteFor(payload({ storage_full: true, first_saved: true }), { storageFullShown: false }).kind,
            'storage_full',
        )
    })

    test('someone who may not buy gets no upgrade path', () => {
        const note = memoryNoteFor(payload({ storage_full: true, upgrade_url: null }), { storageFullShown: false })
        assert.equal(note.upgradeUrl, null)
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

    test('newest learned first, an unknown date last', () => {
        assert.deepEqual(sortMemories(list).map((m) => m.uuid), ['b', 'a', 'c'])
    })

    test('sorting does not change the list it was given', () => {
        sortMemories(list)
        assert.deepEqual(list.map((m) => m.uuid), ['a', 'b', 'c'])
    })

    test('forgetting one removes exactly that one', () => {
        assert.deepEqual(withoutMemory(list, 'a').map((m) => m.uuid), ['b', 'c'])
    })

    test('the link in the note lands on the section it names', () => {
        assert.ok(CODY_MEMORY_PAGE.endsWith(`#${CODY_MEMORY_ANCHOR}`))
    })
})
