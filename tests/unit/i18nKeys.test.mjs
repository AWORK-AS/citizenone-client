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

// ---------------------------------------------------------------------------------------------
// paymentDunning.*: payment method, dunning worklist, suspended state. Used from pages,
// components and layouts as `$t('paymentDunning.…')`, including keys built from a variable
// (`paymentDunning.problems.action.${action}`), so a plain literal scan is not enough.
// ---------------------------------------------------------------------------------------------

function sourceFiles(dir) {
    const out = []
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) out.push(...sourceFiles(full))
        else if (/\.(vue|ts)$/.test(entry.name)) out.push(full)
    }
    return out
}

const flatKeys = (o, prefix = '') => Object.entries(o).flatMap(([k, v]) =>
    v && typeof v === 'object' ? flatKeys(v, `${prefix}${k}.`) : [`${prefix}${k}`])

test('paymentDunning has the same keys in every language', () => {
    const reference = flatKeys(langs.en.paymentDunning).sort()
    assert.ok(reference.length > 50)

    for (const lang of ['dk', 'no', 'sv']) {
        assert.deepEqual(flatKeys(langs[lang].paymentDunning).sort(), reference, `${lang} differs from en`)
    }
})

test('every paymentDunning key the app uses resolves in every language', () => {
    const used = new Set()
    const pattern = /paymentDunning\.[A-Za-z0-9_.${}]*[A-Za-z0-9_}]/g

    for (const dir of ['pages', 'components', 'layouts', 'composables']) {
        for (const file of sourceFiles(path.join(root, dir))) {
            for (const [key] of fs.readFileSync(file, 'utf8').matchAll(pattern)) used.add(key)
        }
    }

    assert.ok(used.size > 30)
    const missing = []

    for (const key of used) {
        // A variable segment: the parent must exist and be an object in every language.
        const dynamic = key.includes('${')
        const lookup = dynamic ? key.slice(0, key.indexOf('${')).replace(/\.$/, '') : key

        for (const lang of Object.keys(langs)) {
            const value = get(langs[lang], lookup)
            const ok = dynamic ? value && typeof value === 'object' : typeof value === 'string'
            if (!ok) missing.push(`${lang}: ${key}`)
        }
    }

    assert.deepEqual(missing, [])
})
