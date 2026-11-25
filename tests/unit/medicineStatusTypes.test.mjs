/**
 * Unit tests for composables/medicineStatusTypes.ts (Roadmap #317): every web
 * dose dialog offers only the status types the company has switched on, and an
 * existing entry keeps its own type.
 *
 *   node --test tests/unit/medicineStatusTypes.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { medicineStatusTypes } from '../../composables/medicineStatusTypes.ts'

const { isStatusTypeEnabled, offeredStatusTypes } = medicineStatusTypes()

describe('offeredStatusTypes', () => {
    test('everything is offered while the settings are unknown', () => {
        assert.deepEqual(offeredStatusTypes(null), ['given', 'delivered', 'deviated'])
        assert.deepEqual(offeredStatusTypes(undefined), ['given', 'delivered', 'deviated'])
        assert.deepEqual(offeredStatusTypes({}), ['given', 'delivered', 'deviated'])
    })

    test('a switched-off type is not offered for a new dose', () => {
        assert.deepEqual(offeredStatusTypes({ given: true, delivered: true, deviated: false }), ['given', 'delivered'])
        assert.deepEqual(offeredStatusTypes({ given: true, delivered: false, deviated: false }), ['given'])
    })

    test('given is always offered', () => {
        assert.deepEqual(offeredStatusTypes({ given: false, delivered: false, deviated: false }), ['given'])
    })

    test("an existing entry keeps its own switched-off type", () => {
        assert.deepEqual(offeredStatusTypes({ deviated: false }, 'deviated'), ['given', 'delivered', 'deviated'])
        assert.deepEqual(offeredStatusTypes({ delivered: false, deviated: false }, 'deviated'), ['given', 'deviated'])
    })

    test('several own types (a day of slots) and blanks', () => {
        assert.deepEqual(offeredStatusTypes({ delivered: false, deviated: false }, ['deviated', null, '']), ['given', 'deviated'])
        assert.deepEqual(offeredStatusTypes({ deviated: false }, ''), ['given', 'delivered'])
    })

    test('an unknown own type adds nothing', () => {
        assert.deepEqual(offeredStatusTypes({ deviated: false }, 'planned_delivery'), ['given', 'delivered'])
    })
})

describe('isStatusTypeEnabled', () => {
    test('on unless switched off; given always on', () => {
        assert.equal(isStatusTypeEnabled(null, 'deviated'), true)
        assert.equal(isStatusTypeEnabled({ deviated: false }, 'deviated'), false)
        assert.equal(isStatusTypeEnabled({ given: false }, 'given'), true)
    })
})
