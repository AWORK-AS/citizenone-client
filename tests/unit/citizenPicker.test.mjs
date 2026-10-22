/**
 * Unit tests for composables/citizenPicker.ts, the debounce/merge logic behind
 * the search-as-you-type citizen pickers.
 *
 *   node --test tests/unit/citizenPicker.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
    createCitizenSearch,
    matchesAllWords,
    nameParam,
    toCitizenOption,
    withSelected,
} from '../../composables/citizenPicker.ts'

const c = (uuid, firstname, lastname) => ({ uuid, firstname, lastname })

function harness(pages, getSelected) {
    const calls = []
    const timers = []
    const out = { options: null, errors: [] }
    const search = createCitizenSearch({
        fetchPage: async (p) => {
            calls.push(p)
            return typeof pages === 'function' ? pages(p) : pages
        },
        onOptions: (o) => { out.options = o },
        onError: (e) => out.errors.push(e),
        getSelected,
        setTimer: (fn, ms) => { timers.push({ fn, ms, live: true }); return timers.length - 1 },
        clearTimer: (t) => { timers[t].live = false },
    })
    const fire = () => timers.filter((t) => t.live).forEach((t) => { t.live = false; t.fn() })
    return { search, calls, timers, out, fire }
}
const tick = () => new Promise((r) => setImmediate(r))

describe('helpers', () => {
    test('toCitizenOption builds a trimmed label', () => {
        assert.deepEqual(toCitizenOption(c('1', 'Anna', '')), { value: '1', label: 'Anna' })
    })
    test('nameParam sends the first word only', () => {
        assert.equal(nameParam('  anna  hansen '), 'anna')
        assert.equal(nameParam(''), '')
    })
    test('matchesAllWords narrows multi-word queries', () => {
        const o = [{ value: '1', label: 'Anna Hansen' }, { value: '2', label: 'Anna Berg' }]
        assert.deepEqual(matchesAllWords(o, 'anna han').map((x) => x.value), ['1'])
        assert.equal(matchesAllWords(o, 'anna').length, 2)
    })
    test('withSelected keeps a selection that is outside the page', () => {
        const known = new Map([['9', { value: '9', label: 'Zed' }]])
        const page = [{ value: '1', label: 'A' }]
        assert.deepEqual(withSelected(page, '9', known).map((x) => x.value), ['9', '1'])
        assert.equal(withSelected(page, '1', known), page)
        assert.equal(withSelected(page, null, known), page)
    })
})

describe('createCitizenSearch', () => {
    test('load fetches the first page without a name', async () => {
        const h = harness([c('1', 'Anna', 'Hansen')])
        await h.search.load()
        assert.deepEqual(h.calls, [{ page_length: 50 }])
        assert.equal(h.out.options.length, 1)
    })
    test('typing is debounced into one request', async () => {
        const h = harness([c('1', 'Anna', 'Hansen')])
        h.search.search('a'); h.search.search('an'); h.search.search('ann')
        assert.ok(h.timers.every((t) => t.ms === 300))
        h.fire(); await tick()
        assert.deepEqual(h.calls, [{ page_length: 50, name: 'ann' }])
    })
    test('the selected citizen stays when a search does not return them', async () => {
        const h = harness((p) => p.name ? [c('2', 'Bo', 'Berg')] : [c('1', 'Anna', 'Hansen')], () => '1')
        await h.search.load()
        h.search.search('bo'); h.fire(); await tick()
        assert.deepEqual(h.out.options.map((o) => o.value), ['1', '2'])
    })
    test('a stale response does not overwrite a newer one', async () => {
        let release
        const gate = new Promise((r) => { release = r })
        const h = harness(async (p) => { if (p.name === 'a') await gate; return [c(p.name ?? 'x', p.name ?? 'x', '')] })
        h.search.search('a'); h.fire()
        h.search.search('b'); h.fire(); await tick()
        release(); await tick()
        assert.deepEqual(h.out.options.map((o) => o.value), ['b'])
    })
    test('fetch errors go to onError', async () => {
        const h = harness(() => { throw new Error('boom') })
        await h.search.load()
        assert.equal(h.out.errors.length, 1)
    })
})
