/**
 * CitizenOne Online Meetings: every text the meeting pages use exists in all
 * four languages, and the placeholders match, so no screen falls back to a
 * raw key or loses a name in one language.
 *
 *   node --test tests/unit/meetingsLang.test.mjs
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const locales = ['dk', 'en', 'no', 'sv']
const load = (locale) => JSON.parse(readFileSync(new URL(`../../lang/${locale}.json`, import.meta.url), 'utf8'))

function flatten(object, prefix = '') {
    return Object.entries(object).flatMap(([key, value]) => typeof value === 'object' && value !== null
        ? flatten(value, `${prefix}${key}.`)
        : [[`${prefix}${key}`, String(value)]])
}

const placeholders = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',')

test('meetings keys and placeholders match across languages', () => {
    const reference = new Map(flatten(load('dk').meetings))

    for (const locale of locales) {
        const strings = new Map(flatten(load(locale).meetings))
        assert.deepEqual([...strings.keys()].sort(), [...reference.keys()].sort(), `${locale}: keys differ`)

        for (const [key, text] of strings) {
            assert.ok(text.trim().length > 0, `${locale}: ${key} is empty`)
            assert.equal(placeholders(text), placeholders(reference.get(key)), `${locale}: ${key} placeholders differ`)
        }
    }
})

test('the sidebar entry has a name in every language', () => {
    for (const locale of locales) {
        assert.ok(load(locale).companyModules['Online meetings'], `${locale}: companyModules`)
    }
})

test('the pages only use meetings keys that exist', () => {
    const files = [
        'pages/meetings/index.vue',
        'pages/meetings/create.vue',
        'pages/meetings/[uuid].vue',
        'pages/meet/[token].vue',
        'components/modules/shared/meeting/room.vue',
        'components/modules/user/meetings/form.vue',
    ]
    const known = new Set(flatten(load('dk').meetings).map(([key]) => `meetings.${key}`))

    for (const file of files) {
        const source = readFileSync(new URL(`../../${file}`, import.meta.url), 'utf8')
        for (const [, key] of source.matchAll(/t\('(meetings\.[\w.]+)'/g)) {
            assert.ok(known.has(key), `${file}: ${key} is not translated`)
        }
    }
})
