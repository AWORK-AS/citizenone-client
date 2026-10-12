/**
 * Unit tests for composables/calendarEventPresentation.ts - the tag colour on
 * a calendar event and what "Duplicate" copies into a new one.
 *
 *   node --test tests/unit/calendarEventPresentation.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { eventTagColor, tintColor, duplicateFields } from '../../composables/calendarEventPresentation.ts'

describe('eventTagColor', () => {
    test('the first tag colour', () => {
        assert.equal(eventTagColor({ calendar_tags: [{ color: '#0F4C75' }, { color: '#ff0000' }] }), '#0F4C75')
        assert.equal(eventTagColor({ calendar_tags: [{ color: ' #abc ' }] }), '#abc')
    })

    test('no tag, no colour, or not a hex colour', () => {
        assert.equal(eventTagColor({}), null)
        assert.equal(eventTagColor({ calendar_tags: [] }), null)
        assert.equal(eventTagColor({ calendar_tags: [{ color: '' }] }), null)
        assert.equal(eventTagColor({ calendar_tags: [{ color: 'red; background:url(x)' }] }), null)
        assert.equal(eventTagColor(null), null)
    })
})

describe('tintColor', () => {
    test('six and three digit hex', () => {
        assert.equal(tintColor('#0F4C75'), 'rgba(15, 76, 117, 0.12)')
        assert.equal(tintColor('#abc', 0.5), 'rgba(170, 187, 204, 0.5)')
    })
})

describe('duplicateFields', () => {
    const event = {
        type: 'employees',
        title: 'Lægebesøg',
        description: 'Husk medicinliste',
        unit: { uuid: 'unit-1' },
        is_private: false,
        is_online_meeting: true,
        meeting_url: 'https://teams.example/x',
        date_time_start: '2026-10-08 09:00:00',
        date_time_end: '2026-10-08 10:30:00',
        calendar_tags: [{ uuid: 'tag-1' }, { uuid: 'tag-2' }],
        calendar_owners: [
            { owner_type: 'App\\Models\\User', owner: { uuid: 'user-a' } },
            { owner_type: 'App\\Models\\Citizen', owner: { uuid: 'citizen-a' } },
        ],
        calendar_users: [
            { user_type: 'App\\Models\\Citizen', user: { uuid: 'citizen-b' } },
            { user_type: 'App\\Models\\User', user: { uuid: 'user-b' } },
            { user_type: 'App\\Models\\User', user: null },
        ],
        journal_id: 9,
        recurring_parent_uuid: 'series',
    }

    test('copies content, people and tags, not the date, series or journal', () => {
        const fields = duplicateFields(event)
        assert.deepEqual(fields, {
            type: 'employees',
            title: 'Lægebesøg',
            description: 'Husk medicinliste',
            unit_uuid: 'unit-1',
            is_private: false,
            is_online_meeting: true,
            meeting_url: 'https://teams.example/x',
            calendar_tag_uuid: ['tag-1', 'tag-2'],
            ownerCitizens: ['citizen-a'],
            ownerUsers: ['user-a'],
            inviteeCitizens: ['citizen-b'],
            inviteeUsers: ['user-b'],
            durationMinutes: 90,
        })
    })

    test('an unknown type duplicates as my own, and a bad time span as an hour', () => {
        const fields = duplicateFields({ type: null, date_time_start: 'x', date_time_end: '' })
        assert.equal(fields.type, 'my_self')
        assert.equal(fields.durationMinutes, 60)
        assert.deepEqual(fields.calendar_tag_uuid, [])
    })
})
