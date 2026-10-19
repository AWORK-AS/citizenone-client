/**
 * Unit tests for composables/multiDateSave.ts. Run with:
 *   node --test tests/unit/multiDateSave.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { saveDatesSettled, remainingDates } from '../../composables/multiDateSave.ts'

describe('saveDatesSettled', () => {
    test('all succeed: nothing remains', async () => {
        const dates = ['2026-10-01', '2026-10-02']
        const out = await saveDatesSettled(dates, async () => {})
        assert.deepEqual(out.succeeded, dates)
        assert.equal(out.failed.length, 0)
        assert.deepEqual(remainingDates(dates, out), [])
    })

    test('partial failure: succeeded dates leave the selection, failed stay', async () => {
        const dates = ['2026-10-01', '2026-10-02', '2026-10-03']
        const boom = new Error('boom')
        const out = await saveDatesSettled(dates, async (d) => {
            if (d === '2026-10-02') throw boom
        })
        assert.deepEqual(out.succeeded, ['2026-10-01', '2026-10-03'])
        assert.deepEqual(out.failed, [{ date: '2026-10-02', error: boom }])
        assert.deepEqual(remainingDates(dates, out), ['2026-10-02'])
    })

    test('retry after partial failure never re-sends a succeeded date', async () => {
        const sent = []
        let fail = true
        const save = async (d) => {
            if (d === 'b' && fail) throw new Error('x')
            sent.push(d)
        }
        let selected = ['a', 'b', 'c']
        let out = await saveDatesSettled(selected, save)
        selected = remainingDates(selected, out)
        fail = false
        out = await saveDatesSettled(selected, save)
        selected = remainingDates(selected, out)
        assert.deepEqual(selected, [])
        assert.deepEqual(sent.sort(), ['a', 'b', 'c'])
    })

    test('all fail: selection unchanged', async () => {
        const dates = ['a', 'b']
        const out = await saveDatesSettled(dates, async () => {
            throw new Error('x')
        })
        assert.deepEqual(remainingDates(dates, out), dates)
    })
})
