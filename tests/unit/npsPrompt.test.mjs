/**
 * Unit tests for composables/npsPrompt.ts and the "would you recommend CitizenOne?" card.
 *
 * The rule that matters most is not in a function: everyone who answers is offered the same
 * Trustpilot invitation. Offering it only to promoters is review gating, which Trustpilot
 * forbids, so the last describe reads the component and fails if the link ever depends on the
 * score.
 *
 *   node --test tests/unit/npsPrompt.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { NPS_SCALE, mayShowNpsPrompt, npsBand, npsScore } from '../../composables/npsPrompt.ts'

const root = path.resolve(import.meta.dirname, '../..')

describe('npsBand', () => {
    test('0-6 detractor, 7-8 passive, 9-10 promoter', () => {
        assert.deepEqual(NPS_SCALE.map(npsBand), [
            'detractor', 'detractor', 'detractor', 'detractor', 'detractor', 'detractor', 'detractor',
            'passive', 'passive', 'promoter', 'promoter',
        ])
    })
})

describe('npsScore', () => {
    test('promoters minus detractors, as the backend computes it', () => {
        assert.equal(npsScore([10, 9, 8, 3]), 25)
        assert.equal(npsScore([10, 10]), 100)
        assert.equal(npsScore([0, 6]), -100)
        assert.equal(npsScore([7, 8]), 0)
    })
    test('no answers is no score, not zero', () => {
        assert.equal(npsScore([]), null)
    })
})

describe('mayShowNpsPrompt', () => {
    const base = { show: true, impersonating: false, path: '/overview' }

    test('shows when the backend says so', () => {
        assert.equal(mayShowNpsPrompt(base), true)
    })
    test('never while one of our own is impersonating the customer', () => {
        assert.equal(mayShowNpsPrompt({ ...base, impersonating: true }), false)
    })
    test('never on a screen where the person is in the middle of setting up', () => {
        assert.equal(mayShowNpsPrompt({ ...base, path: '/discover' }), false)
        assert.equal(mayShowNpsPrompt({ ...base, path: '/setup-password' }), false)
        assert.equal(mayShowNpsPrompt({ ...base, path: '/discovery-notes' }), true)
    })
    test('anything but a literal true from the backend hides it', () => {
        assert.equal(mayShowNpsPrompt({ ...base, show: false }), false)
        assert.equal(mayShowNpsPrompt({ ...base, show: undefined }), false)
    })
})

describe('copy', () => {
    const langs = Object.fromEntries(['dk', 'en', 'no', 'sv'].map(l =>
        [l, JSON.parse(fs.readFileSync(path.join(root, 'lang', `${l}.json`), 'utf8'))]))
    const component = fs.readFileSync(path.join(root, 'components/modules/user/nps/prompt.vue'), 'utf8')
    const page = fs.readFileSync(path.join(root, 'pages/superadmin/nps/index.vue'), 'utf8')
    const keysIn = (source, prefix) => [...source.matchAll(new RegExp(`\\$t\\('(${prefix}[A-Za-z.]+)'`, 'g'))].map(m => m[1])

    test('every key the card and the page use exists in all four languages', () => {
        const keys = [...keysIn(component, 'nps\\.'), ...keysIn(page, 'superadmin\\.nps\\.'), 'superadmin.sidebar.nps',
            'superadmin.nps.band.promoter', 'superadmin.nps.band.passive', 'superadmin.nps.band.detractor']
        const get = (o, k) => k.split('.').reduce((a, p) => a?.[p], o)
        for (const [lang, t] of Object.entries(langs)) {
            for (const key of keys) {
                assert.ok(get(t, key), `${lang}: ${key}`)
            }
            assert.ok(!JSON.stringify(t.nps).includes('—'), `${lang}: em dash`)
        }
    })
})

describe('no review gating', () => {
    const component = fs.readFileSync(path.join(root, 'components/modules/user/nps/prompt.vue'), 'utf8')

    test('the Trustpilot link sits in the thanks step for everyone, not behind the score', () => {
        const link = component.indexOf("$t('nps.reviewCta')")
        assert.ok(link > 0)
        const thanksStep = component.lastIndexOf('<template v-else>', link)
        assert.ok(thanksStep > 0, 'the link is in the last step')
        const between = component.slice(thanksStep, link)
        assert.ok(!/v-if="[^"]*(band|score|promoter)/.test(between.replace(/<p v-if="band === 'detractor'"[^>]*>[^<]*<\/p>/, '')),
            'nothing between the step and the link may depend on the score')
    })
})
