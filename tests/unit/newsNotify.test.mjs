/**
 * Roadmap #201: "Send notifikation" on a bulletin board post tells employees and citizens; an inactive post is
 * told about when it is switched on, so the box stays on the edit form until the post has been sent.
 *
 *   node --test tests/unit/newsNotify.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL('../../' + path, import.meta.url), 'utf8')

describe('news notify box', () => {
    const form = read('components/modules/user/news/form.vue')
    const edit = read('pages/news/[uuid]/edit.vue')

    test('shows on a new post and on an edit until the post has been sent', () => {
        assert.match(form, /v-if="props\.formType === 'create' \|\| !props\.selectedNews\?\.notified_at"/)
    })

    test('an edit starts from what was saved, a new post stays ticked', () => {
        assert.match(form, /notify: newValue\.notify \?\? newValue\.notify_on_publish \?\? true/)
        assert.match(edit, /notify: response\?\.data\?\.notify_on_publish \?\? false/)
    })

    test('an inactive post says it is sent when made active', () => {
        assert.match(form, /v-if="state\.formNews\.notify && !state\.formNews\.is_active"/)
    })

    test('the edit page sends the tick only while the post has not been sent', () => {
        assert.match(edit, /if \(!state\.formNews\.notified_at\) \{\s*params\.append\('notify'/)
    })

    for (const code of ['dk', 'en', 'no', 'sv']) {
        test(`texts in ${code}`, () => {
            const f = JSON.parse(read(`lang/${code}.json`)).news.form
            assert.ok(f.notifyHint && f.notifyInactiveHint, code)
        })
    }

    test('the hint names citizens too', () => {
        assert.match(JSON.parse(read('lang/dk.json')).news.form.notifyHint, /borgere/)
        assert.match(JSON.parse(read('lang/en.json')).news.form.notifyHint, /citizens/)
    })
})
