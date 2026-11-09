/**
 * The company's monthly Cody spend cap (429, limit "monthly_cap").
 * It lifts on the 1st, so it must not read as a one-minute burst limit or
 * offer a purchase / "ask your administrator" that cannot lift it.
 *
 *   node --test tests/unit/codyMonthlyCap.test.mjs
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '../..')
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')
const chat = read('composables/useCodyChat.ts')

test('monthly_cap is handled before the burst-limit fallback', () => {
    const cap = chat.indexOf("error?.limit === 'monthly_cap'")
    const burst = chat.indexOf('const seconds = Number(error.retryAfter)')
    assert.ok(cap > 0, 'monthly_cap branch missing')
    assert.ok(cap < burst, 'monthly_cap must be checked before retryAfter')
})

test('monthly_cap shows no buy button or admin hint', () => {
    const branch = chat.slice(chat.indexOf("error?.limit === 'monthly_cap'"), chat.indexOf('const seconds = Number(error.retryAfter)'))
    assert.doesNotMatch(branch, /isDaily|canBuy/)
})

test('fallback texts exist in every language and use the product name', () => {
    for (const lang of ['dk', 'en', 'sv', 'no']) {
        const keys = JSON.parse(read(`lang/${lang}.json`)).assistants
        assert.ok(keys.monthlyCap, `${lang} monthlyCap`)
        assert.match(keys.monthlyCapUntil, /\{date\}/, `${lang} monthlyCapUntil`)
        assert.match(keys.monthlyCap, /Cody AI/)
    }
})
