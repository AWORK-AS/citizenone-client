/**
 * Unit tests for utils/journalFilters.ts - the journal list's filter params and
 * when Reset is offered.
 *
 *   node --test tests/unit/journalFilters.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
const { journalListFilterParams, hasActiveJournalFilters } = await import('../../utils/journalFilters.ts')

describe('the multi-select filters as params', () => {
    test('sends chosen tags and authors as JSON arrays', () => {
        assert.deepEqual(journalListFilterParams(['t1', 't2'], ['u1']), {
            tags_uuid: '["t1","t2"]',
            created_by: '["u1"]',
        })
    })

    test('sends nothing for an empty selection', () => {
        assert.deepEqual(journalListFilterParams([], []), {})
        assert.deepEqual(journalListFilterParams([], ['u1']), { created_by: '["u1"]' })
    })
})

describe('when Reset is offered', () => {
    const idle = { sortOrder: 'descend', search: '', dateRange: [], tags: [], createdBy: [] }

    test('not on the default list', () => {
        assert.equal(hasActiveJournalFilters(idle), false)
    })

    test('whitespace in the search box is not a filter', () => {
        assert.equal(hasActiveJournalFilters({ ...idle, search: '   ' }), false)
    })

    for (const [label, change] of [
        ['oldest first', { sortOrder: 'ascend' }],
        ['locked only', { lock: true }],
        ['favourites only', { favorite: true }],
        ['a search', { search: 'fall' }],
        ['a date range', { dateRange: ['2026-01-01', '2026-01-31'] }],
        ['a tag', { tags: ['t1'] }],
        ['an author', { createdBy: ['u1'] }],
    ]) {
        test(`as soon as there is ${label}`, () => {
            assert.equal(hasActiveJournalFilters({ ...idle, ...change }), true)
        })
    }
})
