/**
 * The trial fine print ends its sentence after "{amount} per {period}", so a period word that
 * already ends in a full stop ("md.") printed "pr. md.." on the app page.
 *
 *   node --test tests/unit/appTrialCopy.test.mjs
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '../..')

test('the trial fine print never ends a period word with a second full stop', () => {
    for (const lang of ['dk', 'en', 'no', 'sv']) {
        const t = JSON.parse(fs.readFileSync(path.join(root, 'lang', `${lang}.json`), 'utf8')).appTrial
        for (const key of ['perMonth', 'perYear']) {
            const rendered = t.finePrint.replace('{period}', t[key])
            assert.ok(!rendered.includes('..'), `${lang}: ${rendered}`)
        }
    }
})
