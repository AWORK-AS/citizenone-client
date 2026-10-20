/**
 * Unit tests for composables/timelinePaging.ts -- merging pages of the
 * citizen timeline as older entries are loaded.
 *
 *   node --test tests/unit/timelinePaging.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

import { mergeTimelinePage, timelineHasMore, timelineEntryKey } from '../../composables/timelinePaging.ts'

const entry = (source, uuid, date) => ({ source, uuid, date, title: `${source} ${uuid}` })
const keys = (entries) => entries.map(timelineEntryKey)

describe('mergeTimelinePage', () => {
    test('appends an older page after the entries already shown', () => {
        const first = [entry('event', 'a', '2026-10-03T10:00:00+02:00'), entry('activity', '9', '2026-10-02T10:00:00+02:00')]
        const second = [entry('activity', '8', '2026-10-01T10:00:00+02:00')]

        assert.deepEqual(keys(mergeTimelinePage(first, second)), ['event:a', 'activity:9', 'activity:8'])
    })

    test('keeps an entry once when a new entry shifted the pages by one', () => {
        const first = [entry('activity', '9', '2026-10-02T10:00:00+02:00'), entry('activity', '8', '2026-10-01T10:00:00+02:00')]
        const second = [entry('activity', '8', '2026-10-01T10:00:00+02:00'), entry('activity', '7', '2026-09-30T10:00:00+02:00')]

        assert.deepEqual(keys(mergeTimelinePage(first, second)), ['activity:9', 'activity:8', 'activity:7'])
    })

    test('the same uuid from two sources is two entries', () => {
        const merged = mergeTimelinePage(
            [entry('activity', '1', '2026-10-02T10:00:00+02:00')],
            [entry('event', '1', '2026-10-01T00:00:00+02:00')],
        )

        assert.equal(merged.length, 2)
    })

    test('orders newest first across time zone offsets', () => {
        const merged = mergeTimelinePage(
            [entry('activity', 'summer', '2026-10-25T02:30:00+02:00')],
            [entry('activity', 'winter', '2026-10-25T02:10:00+01:00')],
        )

        assert.deepEqual(keys(merged), ['activity:winter', 'activity:summer'])
    })

    test('equal dates keep the server order', () => {
        const merged = mergeTimelinePage(
            [entry('event', 'x', '2026-10-01T00:00:00+02:00')],
            [entry('activity', 'y', '2026-10-01T00:00:00+02:00')],
        )

        assert.deepEqual(keys(merged), ['event:x', 'activity:y'])
    })

    test('an empty or missing page changes nothing', () => {
        const first = [entry('event', 'a', '2026-10-03T10:00:00+02:00')]

        assert.deepEqual(keys(mergeTimelinePage(first, [])), ['event:a'])
        assert.deepEqual(keys(mergeTimelinePage(first, undefined)), ['event:a'])
    })
})

describe('timelineHasMore', () => {
    test('follows meta.has_more', () => {
        assert.equal(timelineHasMore({ has_more: true }), true)
        assert.equal(timelineHasMore({ has_more: false }), false)
    })

    test('a response without meta has nothing older to fetch', () => {
        assert.equal(timelineHasMore(undefined), false)
        assert.equal(timelineHasMore(null), false)
        assert.equal(timelineHasMore({}), false)
    })
})
