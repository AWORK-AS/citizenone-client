/**
 * Unit tests for composables/csvExport.ts - CSV that Danish Excel opens right.
 *
 *   node --test tests/unit/csvExport.test.mjs
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
    buildCsv,
    collectPages,
    csvCell,
    csvDate,
    csvDateTime,
    csvFilename,
    csvNumber,
    formatCsvValue,
    CSV_BOM,
} from '../../composables/csvExport.ts'

test('a plain field is left as it is', () => {
    assert.equal(csvCell('Acme ApS'), 'Acme ApS')
    assert.equal(csvCell(''), '')
})

test('semicolons, quotes and line breaks are quoted, quotes doubled', () => {
    assert.equal(csvCell('a;b'), '"a;b"')
    assert.equal(csvCell('say "hi"'), '"say ""hi"""')
    assert.equal(csvCell('line 1\nline 2'), '"line 1\nline 2"')
    assert.equal(csvCell('line 1\r\nline 2'), '"line 1\r\nline 2"')
    assert.equal(csvCell('a,b'), 'a,b', 'a comma is not the separator')
})

test('a text that looks like a formula stays text', () => {
    assert.equal(csvCell('=HYPERLINK("x")'), '"\'=HYPERLINK(""x"")"')
    assert.equal(csvCell('+4512345678'), "'+4512345678")
    assert.equal(csvCell('@sum'), "'@sum")
    assert.equal(csvCell('-'), '-', 'a lone dash is a placeholder, not a formula')
    assert.equal(csvCell('-12,50', 'amount'), '-12,50', 'numbers are not touched')
})

test('numbers get a decimal comma and no thousands separator', () => {
    assert.equal(csvNumber(1234.5), '1234.5'.replace('.', ','))
    assert.equal(csvNumber(1234.5, 2), '1234,50')
    assert.equal(csvNumber('99.9', 2), '99,90')
    assert.equal(csvNumber(-3, 2), '-3,00')
    assert.equal(csvNumber(0), '0')
    assert.equal(csvNumber(null), '')
    assert.equal(csvNumber(''), '')
    assert.equal(csvNumber('n/a'), 'n/a')
})

test('dates are dd-mm-yyyy, a bare day never moves a day', () => {
    assert.equal(csvDate('2026-01-05'), '05-01-2026')
    assert.equal(csvDate(new Date(2026, 10, 8, 23, 59)), '08-11-2026')
    assert.equal(csvDate(null), '')
    assert.equal(csvDate('not a date'), 'not a date')
})

test('date-times are dd-mm-yyyy hh:mm in local time', () => {
    assert.equal(csvDateTime(new Date(2026, 0, 5, 9, 7)), '05-01-2026 09:07')
    assert.equal(csvDateTime('2026-01-05T09:07:00'), '05-01-2026 09:07')
})

test('formatting by column type', () => {
    assert.equal(formatCsvValue(1500, 'amount'), '1500,00')
    assert.equal(formatCsvValue(7, 'number'), '7')
    assert.equal(formatCsvValue('2026-03-01', 'date'), '01-03-2026')
    assert.equal(formatCsvValue(['a', 'b']), 'a, b')
    assert.equal(formatCsvValue(undefined, 'amount'), '')
    assert.equal(formatCsvValue(0), '0')
})

test('the file starts with a BOM, uses semicolons and CRLF', () => {
    const csv = buildCsv([
        { label: 'Navn', value: row => row.name },
        { label: 'Beløb', value: row => row.amount, type: 'amount' },
        { label: 'Dato', value: row => row.date, type: 'date' },
    ], [
        { name: 'Ærø; "Bornholm"', amount: 1234.5, date: '2026-11-08' },
        { name: 'Multi\nline', amount: null, date: null },
    ])
    assert.ok(csv.startsWith(CSV_BOM))
    assert.equal(csv.slice(1), [
        'Navn;Beløb;Dato',
        '"Ærø; ""Bornholm""";1234,50;08-11-2026',
        '"Multi\nline";;',
        '',
    ].join('\r\n'))
})

test('a column that throws gives an empty cell, not a broken file', () => {
    const csv = buildCsv([{ label: 'X', value: row => row.a.b }], [{}], { bom: false })
    assert.equal(csv, 'X\r\n\r\n')
})

test('the file name is a slug with the date', () => {
    assert.equal(csvFilename('Virksomheder', new Date(2026, 10, 8)), 'virksomheder-2026-11-08.csv')
    assert.equal(csvFilename('Salgshenvendelser / Åben', new Date(2026, 0, 2)), 'salgshenvendelser-aaben-2026-01-02.csv')
    assert.equal(csvFilename('', new Date(2026, 0, 2)), 'export-2026-01-02.csv')
})

function fakePages(total, perPage) {
    const calls = []
    const lastPage = Math.max(1, Math.ceil(total / perPage))
    const fetchPage = async (page) => {
        calls.push(page)
        const start = (page - 1) * perPage
        const rows = Array.from({ length: Math.max(0, Math.min(perPage, total - start)) }, (_, i) => ({ id: start + i + 1 }))
        return { rows, lastPage, total }
    }
    return { calls, fetchPage }
}

test('every page is fetched in order with the progress reported', async () => {
    const { calls, fetchPage } = fakePages(23, 10)
    const progress = []
    const result = await collectPages(fetchPage, { onProgress: (done, total) => progress.push([done, total]) })
    assert.deepEqual(calls, [1, 2, 3])
    assert.equal(result.rows.length, 23)
    assert.equal(result.rows[22].id, 23)
    assert.equal(result.truncated, false)
    assert.deepEqual(progress, [[10, 23], [20, 23], [23, 23]])
})

test('the export stops at the cap and says so', async () => {
    const { calls, fetchPage } = fakePages(95, 10)
    const result = await collectPages(fetchPage, { maxRows: 25 })
    assert.deepEqual(calls, [1, 2, 3])
    assert.equal(result.rows.length, 25)
    assert.equal(result.total, 95)
    assert.equal(result.truncated, true)
})

test('an empty page or an abort ends the loop', async () => {
    const empty = await collectPages(async () => ({ rows: [], lastPage: 9, total: 0 }))
    assert.deepEqual(empty, { rows: [], total: 0, truncated: false })

    const { calls, fetchPage } = fakePages(50, 10)
    let stop = false
    const result = await collectPages(fetchPage, { onProgress: () => { stop = true }, aborted: () => stop })
    assert.deepEqual(calls, [1])
    assert.equal(result.rows.length, 10)
})

test('a failing page fails the export', async () => {
    await assert.rejects(collectPages(async () => { throw new Error('500') }), /500/)
})
