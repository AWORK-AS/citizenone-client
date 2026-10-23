/**
 * Unit tests for composables/spokenLanguageNames.ts -- how a spoken language is
 * named and ordered on screen. A Danish user sees "Arabisk", "Tysk" among the
 * T's and Æ, Ø, Å after Z; everyone else sees the English name, in English
 * order (there are no Norwegian or Swedish names yet).
 *
 *   node --test tests/unit/spokenLanguageNames.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

const { spokenLanguageName, lookupOptionLabel, sortByLabel, spokenLanguageSummaryLine } = await import('../../composables/spokenLanguageNames.ts')

// In the order the server sends them: by the English name.
const register = [
    { uuid: 'ar', name: 'Arabic', name_dk: 'Arabisk' },
    { uuid: 'da', name: 'Danish', name_dk: 'Dansk' },
    { uuid: 'en', name: 'English', name_dk: 'Engelsk' },
    { uuid: 'fo', name: 'Faroese', name_dk: 'Færøsk' },
    { uuid: 'fr', name: 'French', name_dk: 'Fransk' },
    { uuid: 'de', name: 'German', name_dk: 'Tysk' },
    { uuid: 'so', name: 'Somali', name_dk: 'Somali' },
    { uuid: 'sv', name: 'Swedish', name_dk: 'Svensk' },
]

const labels = (items, locale) => sortByLabel(items.map((item) => ({ value: item.uuid, label: spokenLanguageName(item, locale) })), locale).map((option) => option.label)

describe('spokenLanguageName', () => {
    test('a Danish user sees the Danish name', () => {
        assert.equal(spokenLanguageName(register[0], 'dk'), 'Arabisk')
        assert.equal(spokenLanguageName(register[5], 'dk'), 'Tysk')
    })

    test('English, Norwegian and Swedish users see the English name', () => {
        for (const locale of ['en', 'no', 'sv']) {
            assert.equal(spokenLanguageName(register[5], locale), 'German')
        }
    })

    test('a missing Danish name falls back to the English one', () => {
        assert.equal(spokenLanguageName({ name: 'Kumyk', name_dk: '' }, 'dk'), 'Kumyk')
        assert.equal(spokenLanguageName({ name: 'Kumyk', name_dk: null }, 'dk'), 'Kumyk')
        assert.equal(spokenLanguageName({ name: 'Kumyk' }, 'dk'), 'Kumyk')
    })

    test('nothing reads as an empty name', () => {
        assert.equal(spokenLanguageName(null, 'dk'), '')
        assert.equal(spokenLanguageName(undefined, 'en'), '')
        assert.equal(spokenLanguageName({}, 'dk'), '')
    })
})

describe('lookupOptionLabel', () => {
    test('a spoken-language lookup option reads by its Danish name for a Danish user', () => {
        const option = { uuid: 'ar', label: 'Arabic', name_dk: 'Arabisk', is_special: true }

        assert.equal(lookupOptionLabel(option, 'dk'), 'Arabisk')
        assert.equal(lookupOptionLabel(option, 'en'), 'Arabic')
        assert.equal(lookupOptionLabel(option, 'sv'), 'Arabic')
    })

    test('an option from any other register keeps its label', () => {
        const option = { uuid: 'k', label: 'Aarhus Kommune', region_uuid: 'r' }

        assert.equal(lookupOptionLabel(option, 'dk'), 'Aarhus Kommune')
        assert.equal(lookupOptionLabel(option, 'en'), 'Aarhus Kommune')
        assert.equal(lookupOptionLabel(null, 'dk'), '')
    })
})

describe('sortByLabel', () => {
    test('a Danish list is in Danish order, not in the English order it arrived in', () => {
        assert.deepEqual(labels(register, 'dk'), ['Arabisk', 'Dansk', 'Engelsk', 'Fransk', 'Færøsk', 'Somali', 'Svensk', 'Tysk'])
    })

    test('an English list is in English order', () => {
        assert.deepEqual(labels(register, 'en'), ['Arabic', 'Danish', 'English', 'Faroese', 'French', 'German', 'Somali', 'Swedish'])
    })

    test('Danish puts Æ, Ø and Å after Z; English reads them as plain letters', () => {
        const options = [{ label: 'Østrigsk' }, { label: 'Zulu' }, { label: 'Ålandsk' }, { label: 'Arabisk' }, { label: 'Æblesprog' }]

        assert.deepEqual(sortByLabel(options, 'dk').map((o) => o.label), ['Arabisk', 'Zulu', 'Æblesprog', 'Østrigsk', 'Ålandsk'])
        assert.deepEqual(sortByLabel(options, 'en').map((o) => o.label), ['Æblesprog', 'Ålandsk', 'Arabisk', 'Østrigsk', 'Zulu'])
    })

    test('case does not decide the order', () => {
        assert.deepEqual(sortByLabel([{ label: 'tysk' }, { label: 'Arabisk' }], 'dk').map((o) => o.label), ['Arabisk', 'tysk'])
    })

    test('the list passed in is left as it was', () => {
        const options = [{ label: 'Tysk' }, { label: 'Arabisk' }]
        sortByLabel(options, 'dk')

        assert.deepEqual(options.map((o) => o.label), ['Tysk', 'Arabisk'])
    })
})

describe('spokenLanguageSummaryLine', () => {
    // As a citizen's relation arrives: ordered by the English name.
    const spoken = [
        { name: 'English', name_dk: 'Engelsk' },
        { name: 'German', name_dk: 'Tysk' },
        { name: 'Somali', name_dk: 'Somali', is_primary: true },
        { name: 'Arabic', name_dk: 'Arabisk' },
    ]

    test('the mother tongue comes first, then the rest by the name shown', () => {
        assert.equal(spokenLanguageSummaryLine(spoken, 'dk', 'modersmål'), 'Somali (modersmål), Arabisk, Engelsk, Tysk')
        assert.equal(spokenLanguageSummaryLine(spoken, 'en', 'mother tongue'), 'Somali (mother tongue), Arabic, English, German')
    })

    test('without a mother tongue it is just the names in order', () => {
        assert.equal(spokenLanguageSummaryLine(spoken.map(({ is_primary, ...rest }) => rest), 'dk', 'modersmål'), 'Arabisk, Engelsk, Somali, Tysk')
    })

    test('no languages reads as nothing', () => {
        assert.equal(spokenLanguageSummaryLine([], 'dk', 'modersmål'), '')
        assert.equal(spokenLanguageSummaryLine(null, 'dk', 'modersmål'), '')
    })
})
