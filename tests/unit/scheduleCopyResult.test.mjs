/**
 * Unit tests for utils/scheduleCopyResult.ts -- the message the vagtplan shows
 * after a paste of shifts (TKT-000138: a paste of shifts the employee already
 * had added nothing and said nothing).
 *
 *   node --test tests/unit/scheduleCopyResult.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const {
    emptyCopyTotals, addCopyResult, addCopyError, copyResultMessage, COPY_RESULT_KEYS,
} = await import('../../utils/scheduleCopyResult.ts')

const P = 'dutySchedules.copyPaste.'
const meta = (source_count, created, skipped_duplicates) => ({ data: [], meta: { source_count, created, skipped_duplicates } })
const totalsOf = (...responses) => responses.reduce((t, r) => addCopyResult(t, r), emptyCopyTotals())

describe('one response', () => {
    test('shifts added', () => {
        const m = copyResultMessage(totalsOf(meta(2, 2, 0)), 'day')
        assert.equal(m.type, 'success')
        assert.equal(m.titleKey, P + 'resultTitle')
        assert.deepEqual(m.lines, [{ key: P + 'created', count: 2 }])
    })

    test('shifts added and some skipped', () => {
        const m = copyResultMessage(totalsOf(meta(3, 1, 2)), 'week')
        assert.deepEqual(m.lines, [{ key: P + 'created', count: 1 }, { key: P + 'skipped', count: 2 }])
    })

    test('everything already there: says so per scope', () => {
        assert.deepEqual(copyResultMessage(totalsOf(meta(2, 0, 2)), 'day').lines, [{ key: P + 'dayAllSkipped' }])
        assert.deepEqual(copyResultMessage(totalsOf(meta(2, 0, 2)), 'week').lines, [{ key: P + 'allSkipped' }])
        const m = copyResultMessage(totalsOf(meta(2, 0, 2)), 'day')
        assert.equal(m.type, 'warning')
        assert.equal(m.titleKey, P + 'noneCreatedTitle')
    })

    test('nothing on the copied day or week', () => {
        assert.deepEqual(copyResultMessage(totalsOf(meta(0, 0, 0)), 'day').lines, [{ key: P + 'daySourceEmpty' }])
        assert.deepEqual(copyResultMessage(totalsOf(meta(0, 0, 0)), 'week').lines, [{ key: P + 'sourceEmpty' }])
    })

    test('an older backend without meta: counts from data, no reason given', () => {
        assert.equal(copyResultMessage(totalsOf({ data: [{}, {}] }), 'day').lines[0].count, 2)
        const m = copyResultMessage(totalsOf({ data: [] }), 'day')
        assert.equal(m.type, 'warning')
        assert.deepEqual(m.lines, [])
    })
})

describe('a paste over many employees', () => {
    test('sums every response into one message', () => {
        const t = totalsOf(meta(2, 2, 0), meta(3, 1, 2), meta(1, 0, 1))
        assert.equal(t.created, 3)
        assert.equal(t.skipped, 3)
        assert.equal(t.sourceCount, 6)
        assert.deepEqual(copyResultMessage(t, 'month', true).lines,
            [{ key: P + 'created', count: 3 }, { key: P + 'skippedMany', count: 3 }])
    })

    test('all already there: "Medarbejderne har allerede…" per scope', () => {
        const t = totalsOf(meta(2, 0, 2), meta(1, 0, 1))
        assert.deepEqual(copyResultMessage(t, 'day', true).lines, [{ key: P + 'manyAllSkippedDay' }])
        assert.deepEqual(copyResultMessage(t, 'week', true).lines, [{ key: P + 'manyAllSkippedWeek' }])
        assert.deepEqual(copyResultMessage(t, 'month', true).lines, [{ key: P + 'manyAllSkippedMonth' }])
    })

    test('no employee had shifts, so nothing was sent: the copied period was empty', () => {
        assert.deepEqual(copyResultMessage(emptyCopyTotals(), 'month', true).lines, [{ key: P + 'monthSourceEmpty' }])
    })

    test('one answer without meta makes the reason unknown', () => {
        const t = totalsOf(meta(2, 0, 2), { data: [] })
        assert.equal(t.sourceCount, null)
        assert.deepEqual(copyResultMessage(t, 'week', true).lines, [{ key: P + 'manyAllSkippedWeek' }])
        assert.deepEqual(copyResultMessage(totalsOf({ data: [] }, meta(0, 0, 0)), 'week', true).lines, [])
    })
})

describe('errors', () => {
    test('only errors: no "nothing added" next to the error', () => {
        const t = addCopyError(emptyCopyTotals(), { message: 'Låst periode' })
        assert.equal(copyResultMessage(t, 'week', true).type, 'none')
        assert.equal(t.firstError.message, 'Låst periode')
    })

    test('partly added: still says how many, and keeps the first error', () => {
        const t = totalsOf(meta(2, 2, 0))
        addCopyError(t, { message: 'first' })
        addCopyError(t, { message: 'second' })
        assert.equal(t.failed, 2)
        assert.equal(t.firstError.message, 'first')
        assert.equal(copyResultMessage(t, 'week', true).type, 'success')
    })
})

describe('texts', () => {
    for (const lang of ['dk', 'en', 'no', 'sv']) {
        test(`${lang}.json has every text the messages use`, () => {
            const json = JSON.parse(readFileSync(new URL(`../../lang/${lang}.json`, import.meta.url), 'utf8'))
            for (const key of COPY_RESULT_KEYS) {
                const value = key.split('.').reduce((o, k) => o?.[k], json)
                assert.equal(typeof value, 'string', `${lang}: ${key}`)
            }
        })
    }
})
