// The product is "Cody AI" in every sentence the user reads, never bare "Cody".
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

// Paths of strings where a bare "Cody" is genuinely intended. Empty on purpose.
const ALLOW = new Set([])

function* strings(node, path = '') {
    if (typeof node === 'string') yield [path, node]
    else if (node && typeof node === 'object') for (const [k, v] of Object.entries(node)) yield* strings(v, path ? `${path}.${k}` : k)
}

for (const l of ['dk', 'en', 'sv', 'no']) {
    describe(`lang/${l}.json`, () => {
        const data = JSON.parse(readFileSync(new URL(`../../lang/${l}.json`, import.meta.url), 'utf8'))
        it('has no bare "Cody" in user-facing strings', () => {
            const bad = [...strings(data)].filter(([p, v]) => !ALLOW.has(p) && /\bCody\b(?! AI)/.test(v)).map(([p]) => p)
            assert.deepEqual(bad, [])
        })
        it('has no "Cody AI AI"', () => {
            assert.deepEqual([...strings(data)].filter(([, v]) => /Cody AI AI/.test(v)).map(([p]) => p), [])
        })
    })
}
