/**
 * Unit tests for composables/scaleHistoryChart.ts - which dates under the
 * earlier-measurements chart get a label.
 *
 * Spread by rounding, two of the eight labels could land on neighbouring dates
 * and touch ("15/03/2615/04/26", agent note B1, point 25). The widths are the
 * fill-in chart's (scale-field.vue: 520 wide, 24 left, 78 right, font size 9).
 *
 *   node --test tests/unit/scaleHistoryChart.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { chartLabelGap, chartLabelIndices } from '../../composables/scaleHistoryChart.ts'

const innerWidth = 520 - 24 - 78

describe('chartLabelIndices', () => {
    test('no dates, one date, two dates', () => {
        assert.deepEqual(chartLabelIndices(0, innerWidth, 50), [])
        assert.deepEqual(chartLabelIndices(1, innerWidth, 50), [0])
        assert.deepEqual(chartLabelIndices(2, innerWidth, 50), [0, 1])
    })

    test('a dozen dated labels no longer sit on neighbouring dates', () => {
        const indices = chartLabelIndices(12, innerWidth, chartLabelGap(8, 9))
        const spacing = innerWidth / 11

        for (let i = 1; i < indices.length; i++) {
            assert.ok((indices[i] - indices[i - 1]) * spacing >= chartLabelGap(8, 9), `${indices}`)
        }
    })

    test('every count: at most eight, first and last labelled, never closer than the gap', () => {
        for (const chars of [5, 8]) {
            const gap = chartLabelGap(chars, 9)

            for (let count = 2; count <= 60; count++) {
                const indices = chartLabelIndices(count, innerWidth, gap)
                const spacing = innerWidth / (count - 1)

                assert.ok(indices.length <= 8, `${count} dates: ${indices}`)
                assert.equal(indices[0], 0)
                assert.equal(indices[indices.length - 1], count - 1)

                for (let i = 1; i < indices.length; i++) {
                    assert.ok((indices[i] - indices[i - 1]) * spacing >= gap, `${count} dates, ${chars} chars: ${indices}`)
                }
            }
        }
    })

    test('a few dates within a year are all labelled', () => {
        assert.deepEqual(chartLabelIndices(5, innerWidth, chartLabelGap(5, 9)), [0, 1, 2, 3, 4])
    })
})
