/**
 * Unit tests for composables/codyShortcut.ts - what Cmd/Ctrl+J and Escape do
 * to Cody AI's panel.
 *
 *   node --test tests/unit/codyShortcut.test.mjs
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { shortcutAction, escapeClosesPanel } from '../../composables/codyShortcut.ts'

describe('shortcutAction', () => {
    it('opens a closed or rolled-down panel', () => {
        assert.equal(shortcutAction({ isOpen: false, isCollapsed: false, focusInPanel: false }), 'open')
        assert.equal(shortcutAction({ isOpen: true, isCollapsed: true, focusInPanel: false }), 'open')
    })
    it('brings the cursor to an open panel that does not have it', () => {
        assert.equal(shortcutAction({ isOpen: true, isCollapsed: false, focusInPanel: false }), 'focus')
    })
    it('closes the panel when the cursor is already in it', () => {
        assert.equal(shortcutAction({ isOpen: true, isCollapsed: false, focusInPanel: true }), 'close')
    })
})

describe('escapeClosesPanel', () => {
    const base = { isOpen: true, defaultPrevented: false, inOtherDialog: false, panelBusy: false }

    it('closes an open panel', () => {
        assert.equal(escapeClosesPanel(base), true)
    })
    it('does nothing when the panel is closed', () => {
        assert.equal(escapeClosesPanel({ ...base, isOpen: false }), false)
    })
    it('leaves Escape to whatever already used it', () => {
        assert.equal(escapeClosesPanel({ ...base, defaultPrevented: true }), false)
        assert.equal(escapeClosesPanel({ ...base, inOtherDialog: true }), false)
        assert.equal(escapeClosesPanel({ ...base, panelBusy: true }), false)
    })
})

describe('keys', () => {
    it('leaves Cmd/Ctrl+K to the global search', () => {
        const panel = readFileSync(new URL('../../components/modules/user/assistant/panel.vue', import.meta.url), 'utf8')
        assert.doesNotMatch(panel, /key(\.toLowerCase\(\))? === 'k'/)
    })
})
