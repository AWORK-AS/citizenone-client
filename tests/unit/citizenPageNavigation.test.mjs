/**
 * Unit tests for the citizen page navigation helpers: which section tabs stay
 * inline (utils/sectionNavLayout.ts), the breadcrumb's citizen name
 * (utils/citizenName.ts) and the row "More actions" menu (utils/rowActions.ts).
 *
 *   node --test tests/unit/citizenPageNavigation.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
const { pickVisibleTabs } = await import('../../utils/sectionNavLayout.ts')
const { citizenNameFor } = await import('../../utils/citizenName.ts')
const { splitRowActions } = await import('../../utils/rowActions.ts')

const layout = (overrides) => pickVisibleTabs({
    widths: [100, 100, 100, 100],
    available: 1000,
    moreWidth: 80,
    activeIndex: 0,
    gap: 8,
    max: 7,
    ...overrides,
})

describe('which section tabs stay inline', () => {
    test('all tabs show when they fit and are within the cap', () => {
        assert.deepEqual(layout({}), [0, 1, 2, 3])
    })

    test('a wide screen still shows no more than the cap', () => {
        const widths = Array(12).fill(100)
        const visible = layout({ widths, available: 5000 })
        assert.equal(visible.length, 7)
        assert.deepEqual(visible, [0, 1, 2, 3, 4, 5, 6])
    })

    test('the active tab stays inline even when it sorts last', () => {
        const widths = Array(12).fill(100)
        const visible = layout({ widths, available: 5000, activeIndex: 11 })
        assert.equal(visible.length, 7)
        assert.ok(visible.includes(11))
        assert.deepEqual(visible, [0, 1, 2, 3, 4, 5, 11])
    })

    test('a narrow row leaves room for More', () => {
        // 80 (More) + 3 * (100 + 8) = 404 fits in 420; a fourth tab would not.
        assert.deepEqual(layout({ available: 420 }), [0, 1, 2])
    })

    test('at least one tab shows when nothing fits', () => {
        assert.deepEqual(layout({ available: 10, activeIndex: -1 }), [0])
    })

    test('no tabs means nothing to show', () => {
        assert.deepEqual(layout({ widths: [], activeIndex: -1 }), [])
    })
})

describe('the citizen name in the breadcrumb', () => {
    const citizen = { uuid: 'a1', firstname: 'Birgitte', lastname: 'Borger' }

    test('names the citizen on their own page', () => {
        assert.equal(citizenNameFor(citizen, 'a1'), 'Birgitte Borger')
    })

    test('shows nothing while the store still holds another citizen', () => {
        assert.equal(citizenNameFor(citizen, 'b2'), '')
    })

    test('copes with a missing last name and an empty store', () => {
        assert.equal(citizenNameFor({ uuid: 'a1', firstname: 'Birgitte', lastname: null }, 'a1'), 'Birgitte')
        assert.equal(citizenNameFor(null, 'a1'), '')
        assert.equal(citizenNameFor({}, ''), '')
    })
})

describe('the row More actions menu', () => {
    const run = () => {}

    test('drops actions the user may not take', () => {
        const { regular } = splitRowActions([
            { key: 'edit', label: 'Edit', icon: 'x', run },
            false,
            null,
            undefined,
        ])
        assert.deepEqual(regular.map((action) => action.key), ['edit'])
    })

    test('keeps destructive actions apart and last', () => {
        const { regular, danger } = splitRowActions([
            { key: 'delete', label: 'Delete', icon: 'x', run, danger: true },
            { key: 'edit', label: 'Edit', icon: 'x', run },
            { key: 'move', label: 'Move', icon: 'x', run },
        ])
        assert.deepEqual(regular.map((action) => action.key), ['edit', 'move'])
        assert.deepEqual(danger.map((action) => action.key), ['delete'])
    })

    test('an empty list gives two empty groups', () => {
        assert.deepEqual(splitRowActions([]), { regular: [], danger: [] })
    })
})
