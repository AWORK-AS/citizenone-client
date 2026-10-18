/**
 * Unit tests for composables/citizenoneAttribution.ts - the "provided by
 * CitizenOne" line in the portals - and its copy.
 *
 * The tracking has to match App\Support\CitizenOneAttribution on the backend,
 * which counts utm_source=citizenone_product as the "product" signup channel.
 *
 *   node --test tests/unit/citizenoneAttribution.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import {
    ATTRIBUTION_UTM_SOURCE,
    citizenoneAttributionShown,
    citizenoneAttributionUrl,
} from '../../composables/citizenoneAttribution.ts'

describe('citizenoneAttributionUrl', () => {
    test('points at citizenone.dk with the tracking the backend counts as "product"', () => {
        const url = new URL(citizenoneAttributionUrl('portal'))
        assert.equal(url.origin, 'https://citizenone.dk')
        assert.equal(url.searchParams.get('utm_source'), 'citizenone_product')
        assert.equal(url.searchParams.get('utm_medium'), 'portal')
        assert.equal(url.searchParams.get('utm_campaign'), 'attribution')
        assert.equal(ATTRIBUTION_UTM_SOURCE, 'citizenone_product')
    })
})

describe('citizenoneAttributionShown', () => {
    test('on by default and for an older payload without the field', () => {
        assert.equal(citizenoneAttributionShown({ hide_citizenone_attribution: false }), true)
        assert.equal(citizenoneAttributionShown({ name: 'Bostedet' }), true)
        assert.equal(citizenoneAttributionShown(null), true)
        assert.equal(citizenoneAttributionShown(undefined), true)
    })
    test('off only when the company switched it off', () => {
        assert.equal(citizenoneAttributionShown({ hide_citizenone_attribution: true }), false)
    })
})

describe('copy', () => {
    const root = path.resolve(import.meta.dirname, '../..')
    const langs = Object.fromEntries(['dk', 'en', 'no', 'sv'].map(l =>
        [l, JSON.parse(fs.readFileSync(path.join(root, 'lang', `${l}.json`), 'utf8'))]))

    test('the portal line, the setting and the superadmin channel exist in all four languages', () => {
        for (const [lang, t] of Object.entries(langs)) {
            for (const key of ['portal', 'setting', 'settingHint']) {
                assert.ok(t.citizenoneAttribution?.[key], `${lang}: citizenoneAttribution.${key}`)
            }
            assert.ok(t.superadmin?.companies?.source?.product, `${lang}: superadmin.companies.source.product`)
        }
    })
    test('no em dash and no sales talk in the portal line', () => {
        for (const [lang, t] of Object.entries(langs)) {
            const line = t.citizenoneAttribution.portal
            assert.ok(!line.includes('—'), `${lang}: em dash`)
            assert.ok(!/gratis|free|prøv|try|!/i.test(line), `${lang}: reads like an ad: ${line}`)
        }
    })
})

describe('wiring', () => {
    const root = path.resolve(import.meta.dirname, '../..')
    test('every portal layout renders the line', () => {
        for (const layout of ['relative', 'patient', 'third-party', 'citizen']) {
            const source = fs.readFileSync(path.join(root, 'layouts', `${layout}.vue`), 'utf8')
            assert.ok(source.includes('<ModulesPortalAttribution />'), layout)
        }
    })
    test('no hard-coded tracking link outside the composable', () => {
        for (const file of ['components/modules/portal/attribution.vue', 'pages/secured-mail.vue']) {
            const source = fs.readFileSync(path.join(root, file), 'utf8')
            assert.ok(!source.includes('utm_source='), file)
            assert.ok(source.includes('citizenoneAttributionUrl('), file)
        }
    })
})
