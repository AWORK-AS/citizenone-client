/**
 * Unit tests for composables/dataTable.ts - paging and in-browser lists for the
 * superadmin data table.
 *
 *   node --test tests/unit/dataTable.test.mjs
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
    clientPage,
    filterAndSortRows,
    normalizePageMeta,
    pageWindow,
    responseRows,
} from '../../composables/dataTable.ts'

test('paging is read from a resource collection\'s meta', () => {
    assert.deepEqual(normalizePageMeta({ data: [], meta: { current_page: 2, last_page: 5, from: 11, to: 20, total: 47 } }),
        { page: 2, lastPage: 5, from: 11, to: 20, total: 47 })
})

test('paging is read from a bare paginator', () => {
    assert.deepEqual(normalizePageMeta({ data: [], current_page: '1', last_page: '1', from: 1, to: 3, total: '3' }),
        { page: 1, lastPage: 1, from: 1, to: 3, total: 3 })
})

test('an empty page says 0 to 0 of 0, and no paging at all is null', () => {
    assert.deepEqual(normalizePageMeta({ meta: { current_page: 1, last_page: 1, from: null, to: null, total: 0 } }),
        { page: 1, lastPage: 1, from: 0, to: 0, total: 0 })
    assert.equal(normalizePageMeta({ data: [] }), null)
    assert.equal(normalizePageMeta(null), null)
})

test('rows are found however the response wraps them', () => {
    assert.deepEqual(responseRows([1]), [1])
    assert.deepEqual(responseRows({ data: [2] }), [2])
    assert.deepEqual(responseRows({ data: { data: [3] } }), [3])
    assert.deepEqual(responseRows({}), [])
})

test('a short list shows every page number', () => {
    assert.deepEqual(pageWindow(1, 1), [1])
    assert.deepEqual(pageWindow(2, 5), [1, 2, 3, 4, 5])
})

test('a long list shows first, last and a window with gaps', () => {
    assert.deepEqual(pageWindow(1, 20), [1, 2, 3, 4, null, 20])
    assert.deepEqual(pageWindow(10, 20), [1, null, 9, 10, 11, null, 20])
    assert.deepEqual(pageWindow(20, 20), [1, null, 17, 18, 19, 20])
})

const rows = [
    { name: 'Æblegården', amount: 300, created_at: '2026-01-02' },
    { name: 'acme', amount: 20, created_at: '2026-03-01' },
    { name: 'Bølle ApS', amount: null, created_at: '2025-12-31' },
    { name: 'Café Øst', amount: 1000, created_at: '2026-02-01' },
]

test('search matches every word, ignoring case and accents', () => {
    assert.deepEqual(filterAndSortRows(rows, { search: 'CAFE' }).map(r => r.name), ['Café Øst'])
    assert.deepEqual(filterAndSortRows(rows, { search: 'bølle aps' }).map(r => r.name), ['Bølle ApS'])
    assert.deepEqual(filterAndSortRows(rows, { search: 'acme nope' }), [])
    assert.equal(filterAndSortRows(rows, { search: '  ' }).length, 4)
})

test('search can look in a chosen text', () => {
    const found = filterAndSortRows(rows, { search: '1000', searchText: row => row.name })
    assert.deepEqual(found, [])
})

test('sorting is Danish, numeric, and puts empty values last both ways', () => {
    assert.deepEqual(filterAndSortRows(rows, { sort: 'name', order: 'asc' }).map(r => r.name),
        ['acme', 'Bølle ApS', 'Café Øst', 'Æblegården'])
    assert.deepEqual(filterAndSortRows(rows, { sort: 'amount', order: 'asc' }).map(r => r.amount), [20, 300, 1000, null])
    assert.deepEqual(filterAndSortRows(rows, { sort: 'amount', order: 'desc' }).map(r => r.amount), [1000, 300, 20, null])
    assert.deepEqual(filterAndSortRows(rows, { sort: 'created_at', order: 'desc' }).map(r => r.created_at)[0], '2026-03-01')
})

test('a custom sort value reads nested fields', () => {
    const nested = [{ c: { name: 'b' } }, { c: { name: 'a' } }]
    assert.deepEqual(filterAndSortRows(nested, { sort: 'company', sortValue: row => row.c.name }).map(r => r.c.name), ['a', 'b'])
})

test('the client page slices and reports the range', () => {
    const many = Array.from({ length: 23 }, (_, i) => ({ id: i + 1 }))
    const second = clientPage(many, { page: 2, perPage: 10 })
    assert.deepEqual(second.rows.map(r => r.id), [11, 12, 13, 14, 15, 16, 17, 18, 19, 20])
    assert.deepEqual(second.meta, { page: 2, lastPage: 3, from: 11, to: 20, total: 23 })
    assert.equal(second.all.length, 23)

    const beyond = clientPage(many, { page: 9, perPage: 10 })
    assert.equal(beyond.meta.page, 3, 'a page past the end is the last page')
    assert.deepEqual(clientPage([], {}).meta, { page: 1, lastPage: 1, from: 0, to: 0, total: 0 })
})

test('a column sorts by its key or by the field it names', async () => {
    const { columnSortField } = await import('../../composables/dataTable.ts')
    assert.equal(columnSortField({ key: 'name' }), null)
    assert.equal(columnSortField({ key: 'name', sortable: true }), 'name')
    assert.equal(columnSortField({ key: 'date', sortable: 'created_at' }), 'created_at')
})

test('CSV columns are the labelled table columns, unless opted out or overridden', async () => {
    const { csvColumnsFor } = await import('../../composables/dataTable.ts')
    const columns = csvColumnsFor([
        { key: 'name', label: 'Navn' },
        { key: 'actions' },
        { key: 'logo', label: 'Logo', csv: false },
        { key: 'total', label: 'Beløb', csv: { type: 'amount', value: row => row.cents / 100 } },
        { key: 'x', csv: { label: 'Kun i CSV' } },
    ])
    assert.deepEqual(columns.map(c => [c.label, c.type]), [['Navn', undefined], ['Beløb', 'amount'], ['Kun i CSV', undefined]])
    assert.equal(columns[0].value({ name: 'Acme' }), 'Acme')
    assert.equal(columns[1].value({ cents: 1250 }), 12.5)
})
