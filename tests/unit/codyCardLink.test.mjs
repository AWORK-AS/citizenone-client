/**
 * Unit tests for composables/codyCardLink.ts and the card that uses it.
 *
 * AW-2026-10792: Cody AI saved a journal draft and said "open it", but its
 * card led to the citizen's journal list. On that list already, pressing it
 * did nothing. The card now opens the note itself through ?open_journal=.
 *
 *   node --test tests/unit/codyCardLink.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { codyCardLink } from '../../composables/codyCardLink.ts'

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')

const citizen = '0a1b2c3d-4e5f-4a6b-9c7d-8e9f0a1b2c3d'
const journal = '7f3c2a10-1b2c-4d5e-8f90-123456789abc'

// The card exactly as backend app/Ai/Cards/CardResolver.php journalNote() builds it.
const journalCard = {
    type: 'journal_note', ref: journal, title: 'Observation', subtitle: 'Anders Jensen',
    facts: [{ label: 'date', value: '2026-11-20' }], badges: ['draft', 'ai'],
    link: `/citizens/${citizen}/journals`,
}

describe('codyCardLink - a journal note opens the note itself', () => {
    test('the server link gets the note to open', () => {
        assert.equal(codyCardLink(journalCard), `/citizens/${citizen}/journals?open_journal=${journal}`)
    })

    test('a note that is not a draft opens the same way', () => {
        assert.equal(codyCardLink({ ...journalCard, badges: [] }), `/citizens/${citizen}/journals?open_journal=${journal}`)
    })

    test('a ref that is not a plain uuid is not put in the link', () => {
        for (const ref of ['', 'x', `${journal}&evil=1`, null, undefined, 42]) {
            assert.equal(codyCardLink({ ...journalCard, ref }), `/citizens/${citizen}/journals`, String(ref))
        }
    })

    test('a link that is not the journal list is left as the server sent it', () => {
        for (const link of [`/citizens/${citizen}/journals?x=1`, `/citizens/${citizen}`, '/journals', 'https://example.com/citizens/a/journals']) {
            assert.equal(codyCardLink({ ...journalCard, link }), link)
        }
    })
})

describe('codyCardLink - every other card is unchanged', () => {
    test('task, shift and chat cards keep their link', () => {
        assert.equal(codyCardLink({ type: 'task', ref: journal, link: '/tasks' }), '/tasks')
        assert.equal(codyCardLink({ type: 'shift_day', ref: journal, link: '/schedules' }), '/schedules')
        assert.equal(codyCardLink({ type: 'chat_draft', ref: journal, link: `/messages/${journal}` }), `/messages/${journal}`)
    })

    test('no link stays no link', () => {
        for (const link of [null, undefined, '']) {
            assert.equal(codyCardLink({ type: 'journal_note', ref: journal, link }), undefined, String(link))
        }
    })
})

describe('the answer card uses it', () => {
    test('answer-card.vue links through codyCardLink', () => {
        const src = read('components/modules/user/assistant/answer-card.vue')
        assert.match(src, /:to="codyCardLink\(card\)"/)
        assert.doesNotMatch(src, /:to="card\.link/)
    })

    test('the journal page still opens a note from ?open_journal=', () => {
        const src = read('pages/citizens/[uuid]/journals.vue')
        assert.match(src, /query\.open_journal/)
        assert.match(src, /watch\(\(\) => router\.currentRoute\.value\.query\.open_journal/)
    })
})
