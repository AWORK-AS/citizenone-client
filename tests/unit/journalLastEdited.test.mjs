/**
 * AW-2026-10676: the "Sidst redigeret af ... den ..." line under a journal note.
 *
 *   node --test tests/unit/journalLastEdited.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { showLastEdited, LAST_EDITED_MIN_MINUTES } from '../../composables/journalLastEdited.ts'

const note = (createdAt, editedAt, by = 'Mette Holm') => ({ created_at: createdAt, edited_at: editedAt, updated_by: by })

describe('showLastEdited', () => {
    test('a note edited 10 minutes after it was written shows the line', () => {
        assert.equal(showLastEdited(note('2026-11-18T09:00:00.000000Z', '2026-11-18T09:10:00.000000Z')), true)
    })

    test('a quick typo fix within 5 minutes adds no line', () => {
        assert.equal(LAST_EDITED_MIN_MINUTES, 5)
        assert.equal(showLastEdited(note('2026-11-18T09:00:00.000000Z', '2026-11-18T09:04:59.000000Z')), false)
        assert.equal(showLastEdited(note('2026-11-18T09:00:00.000000Z', '2026-11-18T09:05:00.000000Z')), false)
        assert.equal(showLastEdited(note('2026-11-18T09:00:00.000000Z', '2026-11-18T09:05:01.000000Z')), true)
    })

    test('a note that was never edited, or has no editor name, shows nothing', () => {
        assert.equal(showLastEdited(note('2026-11-18T09:00:00Z', null)), false)
        assert.equal(showLastEdited(note('2026-11-18T09:00:00Z', '2026-11-19T09:00:00Z', null)), false)
        assert.equal(showLastEdited(null), false)
        assert.equal(showLastEdited({}), false)
    })

    test('days later, and with the plain "Y-m-d H:i:s" format, still works', () => {
        assert.equal(showLastEdited(note('2026-11-18 09:00:00', '2026-11-20 14:30:00')), true)
    })

    test('unreadable dates show nothing rather than a wrong line', () => {
        assert.equal(showLastEdited(note('not a date', '2026-11-20T14:30:00Z')), false)
    })
})

const read = (path) => readFileSync(new URL('../../' + path, import.meta.url), 'utf8')

describe('where the line shows', () => {
    const STAFF = [
        'components/modules/user/citizen/journal/card.vue',
        'pages/dentist/citizens/[uuid]/journals.vue',
        'pages/journal-notes/index.vue',
        'pages/citizens/[uuid]/children/[child_uuid]/journals.vue',
    ]
    for (const path of STAFF) {
        test(`staff page: ${path}`, () => {
            const page = read(path)
            assert.match(page, /v-if="showLastEdited\(journal\)"/)
            assert.match(page, /\$t\('citizens\.citizenJournals\.lastEditedBy', \{ name: journal\.updated_by, date: formatDateTimeToReadable\(journal\.edited_at\) \}\)/)
            // The created line still reads created_at.
            assert.match(page, /formatDateTimeToReadable\(journal\.created_at\)/)
        })
    }

    for (const path of ['pages/relative/citizens/[uuid]/journals.vue', 'pages/guest/citizen-journals/[journal_uuid].vue']) {
        test(`not on ${path}`, () => {
            assert.doesNotMatch(read(path), /lastEditedBy|showLastEdited/)
        })
    }

    for (const code of ['dk', 'en', 'no', 'sv']) {
        test(`text exists in ${code}`, () => {
            const text = JSON.parse(read(`lang/${code}.json`)).citizens.citizenJournals.lastEditedBy
            assert.equal(typeof text, 'string')
            assert.match(text, /\{name\}/)
            assert.match(text, /\{date\}/)
        })
    }
})
