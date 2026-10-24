/**
 * Unit tests for composables/careHourFilters.ts: the filters on Indsatstimer.
 *
 *   node --test tests/unit/careHourFilters.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
    activeCareHourFilterCount, careHourFilterParams, careHourTypeLabel, emptyCareHourFilters,
    hourTypeFilterOptions, hoursByTypeLabel, NO_HOUR_TYPE,
} from '../../composables/careHourFilters.ts'

describe('careHourFilterParams', () => {
    test('nothing for empty filters', () => {
        assert.deepEqual(careHourFilterParams(emptyCareHourFilters()), {})
    })
    test('lists as name[] and the kind as is', () => {
        assert.deepEqual(careHourFilterParams({ types: ['t-1', NO_HOUR_TYPE], kind: 'work', users: ['u-1'] }), {
            'hour_type_uuids[]': ['t-1', 'none'],
            kind: 'work',
            'user_uuids[]': ['u-1'],
        })
    })
})

describe('activeCareHourFilterCount', () => {
    test('counts each filter that is set once', () => {
        assert.equal(activeCareHourFilterCount(emptyCareHourFilters()), 0)
        assert.equal(activeCareHourFilterCount({ types: ['a', 'b'], kind: 'transport', users: [] }), 2)
    })
})

describe('hourTypeFilterOptions', () => {
    test('the types, then without a type', () => {
        assert.deepEqual(hourTypeFilterOptions([{ uuid: 'c-1', name: 'Kontakttimer (ATA)' }], 'Uden timetype'), [
            { value: 'c-1', label: 'Kontakttimer (ATA)' },
            { value: 'none', label: 'Uden timetype' },
        ])
    })
})

describe('labels', () => {
    test('the hour type when there is one', () => {
        assert.equal(careHourTypeLabel({ contract_hour_type: { name: 'Sparring' } }, 'Arbejdstid', 'Transport'), 'Sparring')
    })
    test('work or transport otherwise', () => {
        assert.equal(careHourTypeLabel({ is_transportation: true }, 'Arbejdstid', 'Transport'), 'Transport')
        assert.equal(careHourTypeLabel({}, 'Arbejdstid', 'Transport'), 'Arbejdstid')
        assert.equal(hoursByTypeLabel({ name: null, is_transportation: false }, 'Arbejdstid', 'Transport'), 'Arbejdstid')
        assert.equal(hoursByTypeLabel({ name: 'Kontakttimer (ATA)', is_transportation: false }, 'Arbejdstid', 'Transport'), 'Kontakttimer (ATA)')
    })
})
