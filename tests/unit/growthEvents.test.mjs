/**
 * Unit tests for composables/growthEvents.ts -- exposure of the growth loops.
 *
 *   node --test tests/unit/growthEvents.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

const { shouldSendGrowthEvent } = await import('../../composables/growthEvents.ts')

describe('shouldSendGrowthEvent', () => {
    test('an impression goes once per loop per page load', () => {
        const sent = new Set()
        assert.equal(shouldSendGrowthEvent(sent, 'share', 'impression'), true)
        assert.equal(shouldSendGrowthEvent(sent, 'share', 'impression'), false)
        assert.equal(shouldSendGrowthEvent(sent, 'suggestion', 'impression'), true)
    })
    test('an open always goes; the backend claims it for a minute', () => {
        const sent = new Set()
        assert.equal(shouldSendGrowthEvent(sent, 'share', 'open'), true)
        assert.equal(shouldSendGrowthEvent(sent, 'share', 'open'), true)
        assert.equal(sent.size, 0)
    })
})
