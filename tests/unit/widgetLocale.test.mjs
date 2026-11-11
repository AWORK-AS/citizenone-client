/**
 * Unit tests for composables/widgetLocale.ts (website booking widget language).
 *
 *   node --test tests/unit/widgetLocale.test.mjs
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { normalizeWidgetLocale, resolveWidgetLocale } from '../../composables/widgetLocale.ts'

test('normalizes our own codes and browser BCP 47 tags', () => {
    assert.equal(normalizeWidgetLocale('dk'), 'dk')
    assert.equal(normalizeWidgetLocale('da'), 'dk')
    assert.equal(normalizeWidgetLocale('da-DK'), 'dk')
    assert.equal(normalizeWidgetLocale('en-GB'), 'en')
    assert.equal(normalizeWidgetLocale('EN_us'), 'en')
    assert.equal(normalizeWidgetLocale('nb-NO'), 'no')
    assert.equal(normalizeWidgetLocale('nn'), 'no')
    assert.equal(normalizeWidgetLocale('sv-SE'), 'sv')
})

test('returns null for languages we have no translation for', () => {
    assert.equal(normalizeWidgetLocale('de-DE'), null)
    assert.equal(normalizeWidgetLocale(''), null)
    assert.equal(normalizeWidgetLocale(undefined), null)
    assert.equal(normalizeWidgetLocale(42), null)
})

test('uses the browser language when nothing else is set', () => {
    assert.equal(resolveWidgetLocale({ browserLanguages: ['da-DK', 'en'] }), 'dk')
    assert.equal(resolveWidgetLocale({ browserLanguages: ['en-US'] }), 'en')
})

test('skips unsupported browser languages and takes the next one', () => {
    assert.equal(resolveWidgetLocale({ browserLanguages: ['de-DE', 'sv-SE', 'en'] }), 'sv')
})

test('falls back to English', () => {
    assert.equal(resolveWidgetLocale({}), 'en')
    assert.equal(resolveWidgetLocale({ browserLanguages: ['de', 'fr'] }), 'en')
    assert.equal(resolveWidgetLocale({ explicit: 'xx', browserLanguages: [] }), 'en')
})

test("the clinic's chosen language beats the browser", () => {
    assert.equal(resolveWidgetLocale({ explicit: 'dk', browserLanguages: ['en-US'] }), 'dk')
    assert.equal(resolveWidgetLocale({ explicit: 'da', browserLanguages: ['en-US'] }), 'dk')
})

test("the visitor's own pick beats everything", () => {
    assert.equal(resolveWidgetLocale({ stored: 'en', explicit: 'dk', browserLanguages: ['da-DK'] }), 'en')
})

test('an invalid stored value is ignored', () => {
    assert.equal(resolveWidgetLocale({ stored: 'garbage', browserLanguages: ['da'] }), 'dk')
})
