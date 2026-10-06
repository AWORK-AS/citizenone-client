/**
 * Every i18n key that is written as a plain string literal in a composable
 * (for example the settings catalogue's `settings.tabs.x`, which is passed
 * around as data and translated later) must exist in all four language files.
 * A `$t('...')` scan misses these, which is how three sidebar entries once
 * showed their raw keys.
 *
 *   node --test tests/unit/i18nKeys.test.mjs
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '../..')
const langs = Object.fromEntries(['dk', 'en', 'no', 'sv'].map(l =>
    [l, JSON.parse(fs.readFileSync(path.join(root, 'lang', `${l}.json`), 'utf8'))]))
const get = (o, k) => k.split('.').reduce((a, p) => a?.[p], o)

// 'settings.tabs.x' style: a top-level language key, then at least two more parts.
const topLevel = new Set(Object.keys(langs.en))
const literal = /(['"])([a-z][A-Za-z0-9]*(?:\.[A-Za-z0-9_]+){2,})\1/g

test('dotted key literals in composables resolve in every language', () => {
    const dir = path.join(root, 'composables')
    const missing = []

    for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.ts'))) {
        const source = fs.readFileSync(path.join(dir, file), 'utf8')

        for (const [, , key] of source.matchAll(literal)) {
            // The superadmin console is only translated to dk and en.
            if (!topLevel.has(key.split('.')[0]) || key.startsWith('superadmin.')) continue

            for (const lang of Object.keys(langs)) {
                if (get(langs[lang], key) === undefined) missing.push(`${lang}: ${key} (composables/${file})`)
            }
        }
    }

    assert.deepEqual(missing, [])
})

test('the settings catalogue entries for the contract catalogues exist', () => {
    for (const lang of Object.keys(langs)) {
        for (const key of ['contractHourTypes', 'paymentTerms', 'contractFields', 'customerDepartments']) {
            assert.ok(get(langs[lang], `settings.tabs.${key}`), `${lang} settings.tabs.${key}`)
        }
    }
})
