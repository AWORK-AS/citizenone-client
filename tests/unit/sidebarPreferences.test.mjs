/**
 * Unit tests for utils/sidebarPreferences.ts - pinning menu items and saving the
 * show/hide settings without losing pins.
 *
 *   node --test tests/unit/sidebarPreferences.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
const { pinnedNames, withPin, withVisibility } = await import('../../utils/sidebarPreferences.ts')

describe('pinned items', () => {
    test('reads the pinned names in order', () => {
        assert.deepEqual(pinnedNames([
            { name: 'Calendar', visible: true, pinned: true },
            { name: 'Mail', visible: false },
            { name: 'Duty schedules', visible: true, pinned: true },
        ]), ['Calendar', 'Duty schedules'])
    })

    test('copes with no or malformed preferences', () => {
        assert.deepEqual(pinnedNames(null), [])
        assert.deepEqual(pinnedNames([null, { visible: true }, 'x']), [])
    })
})

describe('pinning', () => {
    test('adds an item the user had no preference for, as visible', () => {
        assert.deepEqual(withPin([], 'Calendar', true), [{ name: 'Calendar', visible: true, pinned: true }])
    })

    test('keeps other preferences and puts the new pin last', () => {
        const result = withPin([
            { name: 'Calendar', visible: true, pinned: true },
            { name: 'Mail', visible: false },
        ], 'Chat', true)
        assert.deepEqual(result.map((p) => p.name), ['Calendar', 'Mail', 'Chat'])
        assert.deepEqual(pinnedNames(result), ['Calendar', 'Chat'])
        assert.equal(result.find((p) => p.name === 'Mail').visible, false)
    })

    test('unpinning removes only the pin and keeps the order', () => {
        const result = withPin([
            { name: 'Calendar', visible: true, pinned: true },
            { name: 'Chat', visible: true, pinned: true },
        ], 'Calendar', false)
        assert.deepEqual(result, [{ name: 'Calendar', visible: true }, { name: 'Chat', visible: true, pinned: true }])
    })
})

describe('saving the show/hide settings', () => {
    test('keeps pins on items that stay visible', () => {
        const result = withVisibility([{ name: 'Calendar', visible: true, pinned: true }], { Calendar: true, Mail: false })
        assert.deepEqual(result, [{ name: 'Calendar', visible: true, pinned: true }, { name: 'Mail', visible: false }])
    })

    test('hiding an item also unpins it', () => {
        const result = withVisibility([{ name: 'Calendar', visible: true, pinned: true }], { Calendar: false })
        assert.deepEqual(result, [{ name: 'Calendar', visible: false }])
    })

    test('keeps preferences for items not on the settings page', () => {
        const result = withVisibility([{ name: 'Old item', visible: false }], { Calendar: true })
        assert.deepEqual(result.map((p) => p.name), ['Calendar', 'Old item'])
    })
})
