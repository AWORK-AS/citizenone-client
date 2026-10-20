/**
 * Unit tests for composables/promptQueue.ts (one unsolicited prompt at a time) and
 * composables/purchaseAccess.ts (who is shown an upsell).
 *
 *   node --test tests/unit/promptQueue.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import {
    arbitrate, release, initialPromptState, PROMPT_COOLDOWN_MS, PROMPT_MIN_AGE_MS,
} from '../../composables/promptQueue.ts'
import { canPurchase } from '../../composables/purchaseAccess.ts'

const root = path.resolve(import.meta.dirname, '../..')
const T0 = 1_000_000

describe('arbitrate', () => {
    test('shows security first, then the tour, then the rest', () => {
        const s = arbitrate(initialPromptState(), ['nps', 'cmdkTip', 'tour', 'security2fa', 'codyBanner'], T0, T0)
        assert.equal(s.active, 'security2fa')
    })

    test('only one prompt is active at a time', () => {
        let s = arbitrate(initialPromptState(), ['cmdkTip', 'codyBanner'], T0, T0)
        assert.equal(s.active, 'cmdkTip')
        s = arbitrate(s, ['cmdkTip', 'codyBanner'], T0 + 1000, T0)
        assert.equal(s.active, 'cmdkTip')
    })

    test('a lower-priority holder is not displaced by a later low-priority request', () => {
        let s = arbitrate(initialPromptState(), ['codyBanner'], T0, T0)
        s = arbitrate(s, ['codyBanner', 'cmdkTip'], T0 + 1, T0)
        assert.equal(s.active, 'codyBanner')
    })

    test('a higher-priority prompt preempts, and the preempted one returns later', () => {
        let s = arbitrate(initialPromptState(), ['cmdkTip'], T0, T0)
        s = arbitrate(s, ['cmdkTip', 'tour'], T0 + 1, T0)
        assert.equal(s.active, 'tour')
        s = release(s, 'tour', T0 + 2)
        // tour is exempt from the pause, cmdkTip is not
        assert.equal(arbitrate(s, ['cmdkTip'], T0 + 3, T0).active, null)
        assert.equal(arbitrate(s, ['cmdkTip'], T0 + 2 + PROMPT_COOLDOWN_MS, T0).active, 'cmdkTip')
    })

    test('waits out the pause after a dismissal', () => {
        let s = arbitrate(initialPromptState(), ['cmdkTip'], T0, T0)
        s = release(s, 'cmdkTip', T0 + 10)
        assert.equal(arbitrate(s, ['codyBanner'], T0 + 20, T0).active, null)
        assert.equal(arbitrate(s, ['codyBanner'], T0 + 10 + PROMPT_COOLDOWN_MS, T0).active, 'codyBanner')
    })

    test('security and the tour ignore the pause', () => {
        let s = arbitrate(initialPromptState(), ['cmdkTip'], T0, T0)
        s = release(s, 'cmdkTip', T0 + 10)
        assert.equal(arbitrate(s, ['security2fa'], T0 + 11, T0).active, 'security2fa')
    })

    test('a prompt is shown once per page load', () => {
        let s = arbitrate(initialPromptState(), ['codyBanner'], T0, T0)
        s = release(s, 'codyBanner', T0 + 1)
        assert.equal(arbitrate(s, ['codyBanner'], T0 + 10 * PROMPT_COOLDOWN_MS, T0).active, null)
    })

    test('the holder keeps the slot while its component is briefly gone between pages', () => {
        let s = arbitrate(initialPromptState(), ['tour'], T0, T0)
        s = arbitrate(s, ['cmdkTip'], T0 + 5, T0)
        assert.equal(s.active, 'tour')
        s = arbitrate(s, ['tour', 'cmdkTip'], T0 + 6, T0)
        assert.equal(s.active, 'tour')
    })

    test('the survey never appears in the first minutes', () => {
        assert.ok(PROMPT_MIN_AGE_MS.nps >= 5 * 60 * 1000)
        assert.equal(arbitrate(initialPromptState(), ['nps'], T0 + 60_000, T0).active, null)
        assert.equal(arbitrate(initialPromptState(), ['nps'], T0 + PROMPT_MIN_AGE_MS.nps, T0).active, 'nps')
    })

    test('releasing someone who is not the holder changes nothing', () => {
        const s = arbitrate(initialPromptState(), ['tour'], T0, T0)
        assert.equal(release(s, 'nps', T0 + 1), s)
    })
})

describe('canPurchase', () => {
    test('backend can_manage, licence permission or Admin role', () => {
        assert.equal(canPurchase({ canManage: true }), true)
        assert.equal(canPurchase({ hasLicensePermission: true }), true)
        assert.equal(canPurchase({ roles: [{ name: 'Admin' }] }), true)
    })

    test('staff and unknown state cannot', () => {
        assert.equal(canPurchase({ roles: [{ name: 'User' }, { name: 'Manager' }] }), false)
        assert.equal(canPurchase({}), false)
        assert.equal(canPurchase({ canManage: null, roles: null }), false)
    })
})

describe('wiring', () => {
    const layout = fs.readFileSync(path.join(root, 'layouts/user.vue'), 'utf8')
    test('the layout gates the upsell and shows only one command-search tip', () => {
        assert.match(layout, /showUpgrade/)
        assert.doesNotMatch(layout, /showCmdkHint/)
    })
})
