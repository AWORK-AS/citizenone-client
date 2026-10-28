/**
 * Unit tests for utils/citizenPicker.ts - the searchable citizen picker in "Ny note".
 *
 *   node --test tests/unit/citizenPicker.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { initials, matches, pickerSections, pickerDepartments, rememberRecent } from '../../utils/citizenPicker.ts'

const o = (value, label, pinned = false) => ({ value, label, pinned })
const people = [o('a', 'Anna Lindberg (demo)'), o('b', 'Peter Holm', true), o('c', 'Søren Ørsted'), o('d', 'Ida-Marie Kjær')]

describe('initials', () => {
    test('first and last name, ignoring a bracketed note', () => {
        assert.equal(initials('Anna Lindberg (demo)'), 'AL')
        assert.equal(initials('Peter'), 'P')
        assert.equal(initials('anna maria  lindberg'), 'AL')
        assert.equal(initials(''), '?')
    })
})

describe('matches', () => {
    test('every typed word starts a word of the name, case and accents ignored', () => {
        assert.equal(matches(people[0], 'an lin'), true)
        assert.equal(matches(people[0], 'lind'), true)
        assert.equal(matches(people[0], 'berg'), false)
        assert.equal(matches(people[2], 'soren'), true)
        assert.equal(matches(people[3], 'marie'), true)
    })
})

describe('pickerSections', () => {
    test('no query: pinned, recent, then the rest, each person once', () => {
        const sections = pickerSections(people, '', ['c', 'b'])
        assert.deepEqual(sections.map(s => [s.key, s.options.map(x => x.value)]), [
            ['pinned', ['b']], ['recent', ['c']], ['all', ['a', 'd']],
        ])
    })

    test('a query gives one list of matches with pinned first', () => {
        const sections = pickerSections([...people, o('e', 'Anders Petersen', true)], 'a', [])
        assert.deepEqual(sections.map(s => [s.key, s.options.map(x => x.value)]), [['matches', ['e', 'a']]])
    })

    test('selected people and empty sections are left out', () => {
        const sections = pickerSections(people, '', [], ['b'])
        assert.deepEqual(sections.map(s => s.key), ['all'])
        assert.deepEqual(pickerSections(people, 'zzz', []), [{ key: 'matches', options: [] }])
    })
})

describe('departments', () => {
    const nord = { uuid: 'n', name: 'Nord' }, syd = { uuid: 's', name: 'Syd' }
    const staff = [
        { value: 'a', label: 'Anna Lindberg', departments: [nord] },
        { value: 'b', label: 'Peter Holm', departments: [syd] },
        { value: 'c', label: 'Ida Holm', departments: [nord, syd] },
        { value: 'd', label: 'Ole Uden' },
    ]

    test('lists each department once, by name', () => {
        assert.deepEqual(pickerDepartments(staff), [nord, syd])
        assert.deepEqual(pickerDepartments([{ value: 'x', label: 'X' }]), [])
    })

    test('browsing keeps to the chosen department, a search looks through everyone', () => {
        assert.deepEqual(pickerSections(staff, '', [], [], 's').flatMap(s => s.options.map(o => o.value)), ['b', 'c'])
        assert.deepEqual(pickerSections(staff, 'anna', [], [], 's')[0].options.map(o => o.value), ['a'])
        assert.deepEqual(pickerSections(staff, '', [], [], null).flatMap(s => s.options.map(o => o.value)), ['a', 'b', 'c', 'd'])
    })
})

test('rememberRecent keeps the newest first, without duplicates, capped', () => {
    assert.deepEqual(rememberRecent(['a', 'b'], 'b'), ['b', 'a'])
    assert.deepEqual(rememberRecent(['a', 'b', 'c', 'd', 'e'], 'f'), ['f', 'a', 'b', 'c', 'd'])
})

test('the picker is translated in all four languages', async () => {
    const fs = await import('node:fs'); const path = await import('node:path')
    const root = path.resolve(import.meta.dirname, '../..')
    const missing = []
    for (const lang of ['dk', 'en', 'no', 'sv']) {
        const p = JSON.parse(fs.readFileSync(path.join(root, 'lang', `${lang}.json`), 'utf8')).citizenPicker
        for (const key of ['search', 'addMore', 'remove', 'noResults', 'allDepartments', 'searchesAll']) if (!p?.[key]) missing.push(`${lang}: ${key}`)
        for (const key of ['pinned', 'recent', 'all']) if (!p?.sections?.[key]) missing.push(`${lang}: sections.${key}`)
    }
    assert.deepEqual(missing, [])
})
