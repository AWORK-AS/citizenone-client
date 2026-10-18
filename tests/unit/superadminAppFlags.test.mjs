/**
 * The superadmin app forms send their flags as FormData, and FormData turns a boolean into the
 * text "true"/"false", which the backend's `boolean` rule refuses (ApplicationStoreRequest /
 * ApplicationUpdateRequest). One raw boolean and the whole save fails with a 422. Every flag
 * therefore has to go as '1'/'0'.
 *
 *   node --test tests/unit/superadminAppFlags.test.mjs
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '../..')

test('the superadmin app forms never append a flag as a raw boolean', () => {
    for (const file of ['pages/superadmin/apps/[appUuid]/edit.vue', 'pages/superadmin/apps/new.vue']) {
        const source = fs.readFileSync(path.join(root, file), 'utf8')
        const raw = [...source.matchAll(/params\.append\('((?:is|has)_[a-z_]+|[a-z_]+_enabled)',\s*appDetails\.\1\)/g)].map(m => m[1])
        assert.deepEqual(raw, [], `${file} sends ${raw.join(', ')} as true/false`)
        assert.ok(source.includes("appDetails.is_free ? '1' : '0'"), `${file}: is_free as 1/0`)
    }
})
