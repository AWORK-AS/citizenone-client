/**
 * Unit tests for composables/listQuery.ts - superadmin list state in the URL.
 *
 *   node --test tests/unit/listQuery.test.mjs
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
    apiSearchParam,
    apiSortParams,
    defaultListQuery,
    hasListFilters,
    listQueryKeys,
    mergeListQuery,
    nextSort,
    parseListQuery,
    parseSortParam,
    sameListQuery,
    serializeListQuery,
} from '../../composables/listQuery.ts'

const options = { filters: { status: '', source: '' }, defaultSort: 'id', defaultOrder: 'desc' }

test('an empty query is the list at its defaults', () => {
    assert.deepEqual(parseListQuery({}, options), {
        search: '', page: 1, sort: 'id', order: 'desc', filters: { status: '', source: '' },
    })
    assert.deepEqual(serializeListQuery(defaultListQuery(options), options), {})
})

test('search, page, sort and filters are read from the query', () => {
    const state = parseListQuery({ q: 'acme aps', page: '3', sort: '-name', status: 'paid', other: 'x' }, options)
    assert.equal(state.search, 'acme aps')
    assert.equal(state.page, 3)
    assert.equal(state.sort, 'name')
    assert.equal(state.order, 'desc')
    assert.deepEqual(state.filters, { status: 'paid', source: '' })
})

test('a bad page or sort falls back instead of breaking the list', () => {
    assert.equal(parseListQuery({ page: '0' }).page, 1)
    assert.equal(parseListQuery({ page: '-2' }).page, 1)
    assert.equal(parseListQuery({ page: 'abc' }).page, 1)
    assert.equal(parseListQuery({ sort: 'name;drop' }, options).sort, 'id')
    assert.deepEqual(parseSortParam('-'), { sort: null, order: null })
    assert.deepEqual(parseSortParam('total_amount'), { sort: 'total_amount', order: 'asc' })
})

test('a repeated key takes the first value', () => {
    assert.equal(parseListQuery({ q: ['one', 'two'] }).search, 'one')
    assert.equal(parseListQuery({ q: [null] }).search, '')
})

test('serialising leaves defaults out and round-trips', () => {
    const state = { search: ' acme ', page: 2, sort: 'name', order: 'asc', filters: { status: 'failed', source: '' } }
    const query = serializeListQuery(state, options)
    assert.deepEqual(query, { q: 'acme', page: '2', sort: 'name', status: 'failed' })
    const back = parseListQuery(query, options)
    assert.ok(sameListQuery(back, state, options))
})

test('no sort when the default has one is written as "-", and read back as no sort', () => {
    const state = { ...defaultListQuery(options), sort: null, order: null }
    const query = serializeListQuery(state, options)
    assert.deepEqual(query, { sort: '-' })
    const back = parseListQuery(query, options)
    assert.equal(back.sort, 'id', 'an unparseable sort is the default again')
})

test('a filter with a default is only written when it differs from it', () => {
    const withDefault = { filters: { status: 'open' } }
    assert.deepEqual(serializeListQuery(parseListQuery({}, withDefault), withDefault), {})
    assert.deepEqual(serializeListQuery({ ...parseListQuery({}, withDefault), filters: { status: 'all' } }, withDefault), { status: 'all' })
    assert.equal(parseListQuery({ status: 'won' }, withDefault).filters.status, 'won')
})

test('merging keeps every key that is not this list\'s', () => {
    const current = { inquiry: 'abc', q: 'old', page: '4', lo_page: '2' }
    const merged = mergeListQuery(current, { ...defaultListQuery(options), search: 'new' }, options)
    assert.deepEqual(merged, { inquiry: 'abc', lo_page: '2', q: 'new' })
})

test('a prefix keeps two lists on one page apart', () => {
    const prefixed = { prefix: 'lo_', filters: { status: '' } }
    assert.deepEqual(listQueryKeys(prefixed), ['lo_q', 'lo_page', 'lo_sort', 'lo_status'])
    const state = parseListQuery({ page: '5', lo_page: '2', lo_status: 'error' }, prefixed)
    assert.equal(state.page, 2)
    assert.equal(state.filters.status, 'error')
    const merged = mergeListQuery({ page: '5', lo_page: '2' }, { ...state, page: 3 }, prefixed)
    assert.deepEqual(merged, { page: '5', lo_page: '3', lo_status: 'error' })
})

test('a header click sorts ascending, then descending, then back to the default', () => {
    let state = defaultListQuery(options)
    let next = nextSort(state, 'name', options)
    assert.deepEqual(next, { sort: 'name', order: 'asc' })
    state = { ...state, ...next }
    next = nextSort(state, 'name', options)
    assert.deepEqual(next, { sort: 'name', order: 'desc' })
    state = { ...state, ...next }
    assert.deepEqual(nextSort(state, 'name', options), { sort: 'id', order: 'desc' })
})

test('the default column itself flips between its two orders', () => {
    const state = defaultListQuery(options)
    assert.deepEqual(nextSort(state, 'id', options), { sort: 'id', order: 'asc' })
    assert.deepEqual(nextSort({ ...state, order: 'asc' }, 'id', options), { sort: 'id', order: 'desc' })
})

test('the API gets sortField and ascend/descend', () => {
    assert.deepEqual(apiSortParams({ sort: 'name', order: 'asc' }), { sortField: 'name', sortOrder: 'ascend' })
    assert.deepEqual(apiSortParams({ sort: 'id', order: 'desc' }), { sortField: 'id', sortOrder: 'descend' })
    assert.deepEqual(apiSortParams({ sort: null, order: null }), {})
})

test('the search goes to the API as a JSON array of words, as it always has', () => {
    assert.equal(apiSearchParam('  acme   aps '), '["acme","aps"]')
    assert.equal(apiSearchParam('   '), undefined)
    assert.equal(apiSearchParam(''), undefined)
})

test('a list is filtered when it is searched or a filter is off its default', () => {
    assert.equal(hasListFilters(defaultListQuery(options), options), false)
    assert.equal(hasListFilters({ ...defaultListQuery(options), search: 'x' }, options), true)
    assert.equal(hasListFilters({ ...defaultListQuery(options), filters: { status: 'paid', source: '' } }, options), true)
    const open = { filters: { status: 'open' } }
    assert.equal(hasListFilters(parseListQuery({}, open), open), false)
})
