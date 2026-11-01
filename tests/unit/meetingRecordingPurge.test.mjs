/**
 * Unit tests for composables/meetingRecordingPurge.ts - the deletion date on
 * the Recordings tab.
 *
 *   node --test tests/unit/meetingRecordingPurge.test.mjs
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { daysUntilPurge, warnBeforePurge } from '../../composables/meetingRecordingPurge.ts'

const now = new Date('2026-11-02T12:00:00Z')

test('days are rounded up, and never negative', () => {
    assert.equal(daysUntilPurge('2026-11-12T12:00:00Z', now), 10)
    assert.equal(daysUntilPurge('2026-11-02T13:00:00Z', now), 1)
    assert.equal(daysUntilPurge('2026-10-30T12:00:00Z', now), 0)
    assert.equal(daysUntilPurge(null, now), null)
})

test('warns within a week when no summary was kept', () => {
    assert.equal(warnBeforePurge({ purge_at: '2026-11-06T12:00:00Z', summary_status: null }, now), true)
    assert.equal(warnBeforePurge({ purge_at: '2026-11-06T12:00:00Z', summary_status: 'ready' }, now), false)
    assert.equal(warnBeforePurge({ purge_at: '2026-11-20T12:00:00Z', summary_status: null }, now), false)
    assert.equal(warnBeforePurge({}, now), false)
})
