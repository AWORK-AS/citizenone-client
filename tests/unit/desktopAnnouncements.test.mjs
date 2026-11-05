/**
 * The desktop app shows no "Nyt fra CitizenOne" button that sells, and no popup built
 * around one (App Review guideline 3.1.1). The web keeps them.
 *
 *   node --test tests/unit/desktopAnnouncements.test.mjs
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { ctaFor, ctaText, isSalesCta } from '../../composables/announcements.ts'

const root = path.resolve(import.meta.dirname, '../..')
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')
const cta = (action, extra = {}) => ({ action, url: '/apps/meetings', label: null, trial_days: null, ...extra })

test('a trial, a purchase and asking an admin to buy are sales buttons', () => {
    assert.equal(isSalesCta(cta('trial', { trial_days: 14 })), true)
    assert.equal(isSalesCta(cta('buy')), true)
    assert.equal(isSalesCta(cta('ask')), true)
})

test('opening a page is not a sales button, and no button is none', () => {
    assert.equal(isSalesCta(cta('open')), false)
    assert.equal(isSalesCta(null), false)
    assert.equal(isSalesCta(undefined), false)
})

test('the desktop app gets no sales button, the web keeps it unchanged', () => {
    const trial = cta('trial', { trial_days: 14 })
    assert.equal(ctaFor(trial, true), null)
    assert.equal(ctaText(ctaFor(trial, true)), null)
    assert.deepEqual(ctaFor(trial, false), trial)
    assert.deepEqual(ctaText(ctaFor(trial, false)), { key: 'announcements.cta.trialDays', values: { days: 14 } })
})

test('the desktop app keeps a button that only opens a page', () => {
    const open = cta('open', { label: 'Se hvordan' })
    assert.deepEqual(ctaFor(open, true), open)
    assert.equal(ctaFor(null, true), null)
})

test('the popup drops a sales message in the desktop app before it is shown or marked seen', () => {
    const popup = read('components/modules/user/announcements/AnnouncementPopup.vue')
    assert.match(popup, /item\.value = next && useIsDesktopApp\(\) && isSalesCta\(next\.cta\) \? null : next/)
})

test('the release notes list uses the desktop-aware button', () => {
    const list = read('components/modules/user/new-updates/modal-release-notes.vue')
    assert.doesNotMatch(list, /ctaText\(item\.cta\)/)
    assert.match(list, /ctaText\(ctaFor\(item\.cta, isDesktopApp\)\)/)
})
