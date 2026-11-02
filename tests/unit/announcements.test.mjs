/**
 * "Nyt fra CitizenOne": try the new app, news and tips as one popup channel.
 *
 * What this suite pins down:
 * - the button text follows the backend's choice (trial with days, ask my admin, own text);
 * - a button only ever goes to a page in the app or an https link;
 * - the popup takes its turn in the shared prompt slot, after the ⌘K tip, and waits for a
 *   missed-medicine alert or the Cody panel;
 * - the megaphone lists the messages, and every label exists in all four languages.
 *
 *   node --test tests/unit/announcements.test.mjs
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { ctaTarget, ctaText, eyebrowKey, queueLabel, showsImage } from '../../composables/announcements.ts'
import { PROMPT_PRIORITY, arbitrate, initialPromptState } from '../../composables/promptQueue.ts'

const root = path.resolve(import.meta.dirname, '../..')
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')

test('the button says what the backend chose', () => {
    assert.deepEqual(ctaText({ action: 'trial', url: '/apps/x', label: null, trial_days: 14 }), { key: 'announcements.cta.trialDays', values: { days: 14 } })
    assert.deepEqual(ctaText({ action: 'trial', url: '/apps/x', label: null, trial_days: null }), { key: 'announcements.cta.trial' })
    assert.deepEqual(ctaText({ action: 'ask', url: '/apps/x', label: null, trial_days: null }), { key: 'announcements.cta.ask' })
    assert.deepEqual(ctaText({ action: 'buy', url: '/apps/x', label: null, trial_days: null }), { key: 'announcements.cta.buy' })
    assert.equal(ctaText({ action: 'open', url: '/citizens', label: 'Se borgere', trial_days: null }).literal, 'Se borgere')
    assert.deepEqual(ctaText({ action: 'open', url: '/citizens', label: null, trial_days: null }), { key: 'announcements.cta.open' })
    assert.equal(ctaText(null), null)
})

test('a button goes to a page in the app or an https link, nothing else', () => {
    assert.deepEqual(ctaTarget('/apps/meetings'), { kind: 'internal', url: '/apps/meetings' })
    assert.deepEqual(ctaTarget('https://citizenone.dk'), { kind: 'external', url: 'https://citizenone.dk' })
    assert.equal(ctaTarget('//evil.example'), null)
    assert.equal(ctaTarget('javascript:alert(1)'), null)
    assert.equal(ctaTarget('http://example.com'), null)
    assert.equal(ctaTarget(''), null)
})

test('labels, queue and image', () => {
    assert.equal(eyebrowKey('tip'), 'announcements.eyebrow.tip')
    assert.equal(eyebrowKey('feature'), 'announcements.eyebrow.feature')
    assert.equal(eyebrowKey('news'), 'announcements.eyebrow.news')
    assert.equal(queueLabel(0), null)
    assert.deepEqual(queueLabel(2), { position: 1, total: 3 })
    assert.equal(showsImage({ kind: 'tip', image_url: 'x.png' }), false)
    assert.equal(showsImage({ kind: 'feature', image_url: 'x.png' }), true)
    assert.equal(showsImage({ kind: 'news', image_url: null }), false)
})

test('the popup waits behind the ⌘K tip and never shows beside another prompt', () => {
    assert.ok(PROMPT_PRIORITY.announcement > PROMPT_PRIORITY.cmdkTip)
    assert.ok(PROMPT_PRIORITY.announcement < PROMPT_PRIORITY.codyBanner)

    let state = arbitrate(initialPromptState(), ['announcement', 'cmdkTip'], 1000, 0)
    assert.equal(state.active, 'cmdkTip')
    state = arbitrate(state, ['announcement', 'cmdkTip'], 2000, 0)
    assert.equal(state.active, 'cmdkTip')
})

test('the layout mounts the popup in the prompt slot and holds it back for alerts', () => {
    const layout = read('layouts/user.vue')
    assert.match(layout, /<AnnouncementPopup :leftOffsetClass="announcementOffsetClass" :heldBack="medicineToastVisible \|\| codyPanelShown" \/>/)
    const popup = read('components/modules/user/announcements/AnnouncementPopup.vue')
    assert.match(popup, /usePromptSlot\('announcement', wants\)/)
    assert.match(popup, /announcementService\.markSeen/)
    assert.match(popup, /class="fixed bottom-5 left-4/)
})

test('the megaphone lists the messages', () => {
    const modal = read('components/modules/user/new-updates/modal-release-notes.vue')
    assert.match(modal, /announcementService\.getRecent\(\)/)
})

test('every label exists in all four languages', () => {
    const keys = [
        'announcements.cta.trialDays', 'announcements.cta.ask', 'announcements.cta.buy', 'announcements.cta.open', 'announcements.cta.trial',
        'announcements.eyebrow.feature', 'announcements.eyebrow.news', 'announcements.eyebrow.tip',
        'announcements.later', 'announcements.gotIt', 'announcements.queue', 'announcements.listTitle',
        'superadmin.announcements.title', 'superadmin.announcements.form.preview', 'superadmin.announcements.kind.tip',
        'superadmin.announcements.audience.buyers', 'superadmin.announcements.stats.trialClicks', 'superadmin.sidebar.announcements',
    ]
    for (const lang of ['dk', 'en', 'no', 'sv']) {
        const messages = JSON.parse(read(`lang/${lang}.json`))
        for (const key of keys) {
            const value = key.split('.').reduce((o, k) => o?.[k], messages)
            assert.equal(typeof value, 'string', `${lang}: ${key}`)
        }
        assert.match(messages.announcements.cta.trialDays, /\{days\}/, `${lang}: trialDays needs {days}`)
    }
})
