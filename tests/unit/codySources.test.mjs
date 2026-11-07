/**
 * Unit tests for composables/codySources.ts - the "Kilde" links under an
 * answer, and the comment the model uses to name them.
 *
 * The server builds every link; these pin that the client still only follows
 * a path inside the app, never shows the comment while the answer streams,
 * and has the copy in every language.
 *
 *   node --test tests/unit/codySources.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { sourceLinksFrom, withoutSourcesComment, SOURCE_KINDS, SOURCE_ICONS } from '../../composables/codySources.ts'

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')

const journal = { type: 'journal', label: 'Observation 2026-11-01', link: '/citizens/c-1/journals?open_journal=j-1' }

describe('sourceLinksFrom', () => {
    test('keeps the links the server built', () => {
        assert.deepEqual(sourceLinksFrom([journal, { type: 'task', label: ' Ring ', link: '/tasks' }]), [
            journal, { type: 'task', label: 'Ring', link: '/tasks' },
        ])
    })

    test('never follows anything but a path in this app', () => {
        for (const link of ['https://evil.test', '//evil.test/x', '/\\evil.test', 'javascript:alert(1)', '/javascript:alert(1)', 'tasks', '', null, '/a b']) {
            assert.deepEqual(sourceLinksFrom([{ ...journal, link }]), [], String(link))
        }
    })

    test('drops unknown kinds, empty labels and anything that is not a list', () => {
        assert.deepEqual(sourceLinksFrom([{ ...journal, type: 'citizen' }, { ...journal, label: '  ' }, null]), [])
        assert.deepEqual(sourceLinksFrom(undefined), [])
        assert.deepEqual(sourceLinksFrom({ 0: journal }), [])
    })

    test('stays compact: at most three', () => {
        assert.equal(sourceLinksFrom(Array.from({ length: 6 }, (_, i) => ({ ...journal, link: `/tasks?i=${i}`, type: 'task' }))).length, 3)
    })
})

describe('withoutSourcesComment - what streams on screen', () => {
    test('a whole comment is taken out', () => {
        assert.equal(withoutSourcesComment('<p>Svar</p>\n<!--sources: journal#1, task#2-->'), '<p>Svar</p>\n')
    })

    test('a comment still arriving is taken out', () => {
        assert.equal(withoutSourcesComment('<p>Svar</p><!--sources: jour'), '<p>Svar</p>')
        assert.equal(withoutSourcesComment('<p>Svar</p><!-'), '<p>Svar</p>')
        assert.equal(withoutSourcesComment('<p>Svar</p><'), '<p>Svar</p>')
    })

    test('the answer itself is left alone', () => {
        assert.equal(withoutSourcesComment('<p>a &lt; b, 3 > 2</p>'), '<p>a &lt; b, 3 > 2</p>')
        assert.equal(withoutSourcesComment(''), '')
    })
})

describe('wiring', () => {
    test('the answer keeps its links and the stream hides the comment', () => {
        const chat = read('composables/useCodyChat.ts')
        assert.match(chat, /sourceLinks: sourceLinksFrom\(response\?\.source_links\)/)
        assert.match(chat, /\.text = withoutSourcesComment\(streamed\.text\)/)
    })

    test('the thread draws them as links under the answer', () => {
        const thread = read('components/modules/user/assistant/thread.vue')
        assert.match(thread, /v-for="source in message\.sourceLinks"/)
        assert.match(thread, /:to="source\.link"/)
    })

    test('every kind has an icon and every language has the copy', () => {
        for (const kind of SOURCE_KINDS) assert.ok(SOURCE_ICONS[kind], kind)
        for (const lang of ['dk', 'en', 'no', 'sv']) {
            const copy = JSON.parse(read(`lang/${lang}.json`)).assistants.sourceLinks
            assert.ok(copy?.label, `${lang}: label`)
            for (const kind of SOURCE_KINDS) assert.ok(copy?.kinds?.[kind], `${lang}: kinds.${kind}`)
        }
        assert.equal(JSON.parse(read('lang/dk.json')).assistants.sourceLinks.label, 'Kilde')
    })
})
