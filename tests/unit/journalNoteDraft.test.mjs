/**
 * A new journal note is kept as a tab-local draft while it is written, so an accidental close or
 * a session that runs out mid-note does not throw it away.
 *
 *   node --test tests/unit/journalNoteDraft.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { DRAFT_TTL_MS, clearAllDrafts, clearDraft, draftKey, hasWriting, loadDraft, plainText, saveDraft } from '../../composables/journalNoteDraft.ts'

function memoryStorage() {
    const data = new Map()
    return {
        getItem: k => (data.has(k) ? data.get(k) : null),
        setItem: (k, v) => data.set(k, String(v)),
        removeItem: k => data.delete(k),
        key: i => [...data.keys()][i] ?? null,
        get length() { return data.size },
        data,
    }
}

describe('the key', () => {
    test('is per user and citizen, and absent without both', () => {
        assert.equal(draftKey('u1', 'c1'), 'journal-note-draft:u1:c1')
        assert.notEqual(draftKey('u1', 'c1'), draftKey('u2', 'c1'))
        assert.equal(draftKey('u1', ''), null)
        assert.equal(draftKey(null, 'c1'), null)
    })
})

describe('writing', () => {
    test("the editor's empty markup is not writing", () => {
        assert.equal(plainText('<p>&nbsp;</p>'), '')
        assert.equal(hasWriting({ title: '', content: '<p></p>', note: '' }), false)
        assert.equal(hasWriting({ title: '', content: '<p>Sov godt</p>', note: '' }), true)
    })
})

describe('save and load', () => {
    test('a note in progress comes back', () => {
        const s = memoryStorage()
        const key = draftKey('u1', 'c1')
        saveDraft(s, key, { title: 'Nat', content: '<p>Urolig</p>', note: '' }, 1000)
        const draft = loadDraft(s, key, 2000)
        assert.equal(draft.title, 'Nat')
        assert.equal(draft.content, '<p>Urolig</p>')
        assert.equal(draft.savedAt, 1000)
    })
    test('emptying the form removes the draft', () => {
        const s = memoryStorage()
        const key = draftKey('u1', 'c1')
        saveDraft(s, key, { title: 'Nat', content: '', note: '' })
        saveDraft(s, key, { title: '', content: '<p></p>', note: '' })
        assert.equal(s.length, 0)
    })
    test('an old draft is not offered and is cleaned up', () => {
        const s = memoryStorage()
        const key = draftKey('u1', 'c1')
        saveDraft(s, key, { title: 'Nat', content: 'x', note: '' }, 0)
        assert.equal(loadDraft(s, key, DRAFT_TTL_MS + 1), null)
        assert.equal(s.length, 0)
    })
    test("another user's draft is never offered", () => {
        const s = memoryStorage()
        saveDraft(s, draftKey('u1', 'c1'), { title: 'Nat', content: 'x', note: '' })
        assert.equal(loadDraft(s, draftKey('u2', 'c1')), null)
    })
    test('clear removes one, log out removes all and nothing else', () => {
        const s = memoryStorage()
        saveDraft(s, draftKey('u1', 'c1'), { title: 'a', content: '', note: '' })
        saveDraft(s, draftKey('u1', 'c2'), { title: 'b', content: '', note: '' })
        s.setItem('discover_landing_done', '1')
        clearDraft(s, draftKey('u1', 'c1'))
        assert.equal(s.length, 2)
        clearAllDrafts(s)
        assert.deepEqual([...s.data.keys()], ['discover_landing_done'])
    })
})

describe('wiring', () => {
    const root = path.resolve(import.meta.dirname, '../..')
    const read = f => fs.readFileSync(path.join(root, f), 'utf8')

    test('drafts live in sessionStorage, never localStorage', () => {
        for (const f of ['components/modules/user/citizen/journal/form.vue', 'components/modules/user/citizen/journal/modal-new.vue', 'components/modules/user/journal-notes/modal-new.vue', 'layouts/user.vue']) {
            const src = read(f)
            assert.ok(!/(saveDraft|loadDraft|clearDraft|clearAllDrafts)\(localStorage/.test(src), f)
        }
    })
    test('both new-note dialogs ask before closing with writing, and clear the draft after a save', () => {
        for (const f of ['components/modules/user/citizen/journal/modal-new.vue', 'components/modules/user/journal-notes/modal-new.vue']) {
            const src = read(f)
            assert.ok(src.includes("window.confirm(t('journalDraft.confirmClose'))"), f)
            assert.ok(src.includes('closeAfterSave()'), f)
            assert.ok(src.includes(':draftCitizenUuid='), f)
            assert.ok(src.includes('@dirtyChange='), f)
        }
    })
    test('log out clears every draft', () => {
        assert.ok(read('layouts/user.vue').includes('clearAllDrafts(sessionStorage)'))
    })
    test('copy in four languages', () => {
        for (const lang of ['dk', 'en', 'no', 'sv']) {
            const t = JSON.parse(read(`lang/${lang}.json`)).journalDraft
            for (const k of ['offer', 'restore', 'discard', 'confirmClose']) assert.ok(t[k], `${lang}.${k}`)
            assert.ok(t.offer.includes('{time}'), lang)
            assert.ok(!JSON.stringify(t).includes('—'), lang)
        }
    })
})
