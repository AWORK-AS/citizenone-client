/**
 * Unit tests for composables/signupSegments.ts - the "What do you do?" question
 * that opens /register.
 *
 *   node --test tests/unit/signupSegments.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { BUCKETS, industriesIn, isBucket, matchesSearch, profileOf } from '../../composables/signupSegments.ts'

const option = (en_name, dk_name, profile, system_name = null) =>
    ({ value: en_name, label: dk_name, en_name, dk_name, profile, system_name })

const OPTIONS = [
    option('Acupuncturist', 'Akupunktør', 'therapy'),
    option('Coach', 'Coach', 'therapy'),
    option('Psychologist', 'Psykolog', 'therapy'),
    option('Physiotherapist', 'Fysioterapeut', 'therapy'),
    option('Doctors', 'Læger', 'health'),
    option('Midwife', 'Jordemoder', 'health'),
    option('Dentists and dental hygienists', 'Tandlæger og tandplejere', 'dental', 'dental'),
    option('Nail technician', 'Negletekniker', 'default'),
]

describe('signup buckets', () => {
    test('five buckets, the clinics first', () => {
        assert.deepEqual(BUCKETS.map(b => b.key), ['dental', 'health', 'therapy', 'social_welfare', 'employment_services'])
    })

    test('a bucket lists its common professions before the alphabet', () => {
        assert.deepEqual(industriesIn('therapy', OPTIONS).map(o => o.en_name),
            ['Psychologist', 'Physiotherapist', 'Coach', 'Acupuncturist'])
        assert.deepEqual(industriesIn('health', OPTIONS).map(o => o.en_name), ['Doctors', 'Midwife'])
    })

    test('a dental clinic is one industry, so the click on the bucket is the answer', () => {
        assert.equal(industriesIn('dental', OPTIONS).length, 1)
    })

    test('beauty and unknown industries are not a bucket and are found by search', () => {
        assert.equal(isBucket(profileOf(OPTIONS.at(-1))), false)
        assert.equal(profileOf(undefined), 'default')
    })

    test('an older API without profile falls back on the system name', () => {
        assert.equal(profileOf({ value: 'x', label: 'x', system_name: 'dental' }), 'dental')
    })

    test('search ignores case and accents and matches both names', () => {
        assert.ok(matchesSearch(OPTIONS[0], 'akupunk'))
        assert.ok(matchesSearch(OPTIONS[0], 'ACUPUNCT'))
        assert.ok(matchesSearch(option('x', 'Kiropraktør', 'health'), 'kiropraktor'))
        assert.equal(matchesSearch(OPTIONS[1], 'tand'), false)
    })

    test('every bucket and panel has its text in all four languages', () => {
        const root = path.resolve(import.meta.dirname, '../..')
        for (const lang of ['dk', 'en', 'no', 'sv']) {
            const register = JSON.parse(fs.readFileSync(path.join(root, 'lang', `${lang}.json`), 'utf8')).register
            for (const { key } of BUCKETS) {
                assert.ok(register.segment.buckets[key].label, `${lang} ${key}`)
                assert.ok(register.about.placeholder[key], `${lang} ${key}`)
                assert.equal(register.panel[key].points.length, 3, `${lang} ${key}`)
            }
            assert.equal(register.panel.default.points.length, 3, lang)
            assert.ok(register.segment.otherTile.label && register.segment.otherTile.desc, lang)
            for (const field of ['title', 'subtitle', 'which', 'showAll', 'search', 'noMatch', 'notListed', 'change']) {
                assert.ok(register.segment[field] ?? register.about[field], `${lang} ${field}`)
            }
        }
    })
})
