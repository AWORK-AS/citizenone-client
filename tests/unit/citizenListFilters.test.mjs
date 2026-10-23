/**
 * Unit tests for utils/citizenListFilters.ts - the one list of filters the
 * citizen list offers, and what is sent and saved from it.
 *
 *   node --test tests/unit/citizenListFilters.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
const { CITIZEN_LIST_FILTERS, activeCitizenListFilters, availableCitizenListFilters } = await import('../../utils/citizenListFilters.ts')

describe('the offered filters', () => {
    test('each key appears once', () => {
        const keys = CITIZEN_LIST_FILTERS.map((filter) => filter.key)
        assert.equal(new Set(keys).size, keys.length)
    })

    test('a filter on a card field the person may not see is left out', () => {
        const all = availableCitizenListFilters(() => true).map((filter) => filter.key)
        const limited = availableCitizenListFilters((field) => field !== 'Address').map((filter) => filter.key)
        assert.ok(all.includes('region_uuid'))
        assert.ok(!limited.includes('region_uuid'))
        assert.equal(limited.length, all.length - 1)
    })
})

describe('the active filter', () => {
    test('keeps offered keys with a value and drops the rest', () => {
        const active = activeCitizenListFilters({
            phase: 'active',
            section_uuid: '',
            coordinator: null,
            requires_interpreter: false,
            has_case_number: 'false',
            not_offered: 'x',
        })
        assert.deepEqual(active, { phase: 'active', has_case_number: 'false' })
    })

    test('drops a saved key that is no longer offered to this person', () => {
        const offered = availableCitizenListFilters((field) => field !== 'Address')
        assert.deepEqual(activeCitizenListFilters({ region_uuid: 'r1', phase: 'ended' }, offered), { phase: 'ended' })
    })

    test('reads an empty saved filter, which the server returns as a list', () => {
        assert.deepEqual(activeCitizenListFilters([]), {})
        assert.deepEqual(activeCitizenListFilters(null), {})
    })
})
