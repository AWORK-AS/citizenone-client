/**
 * Unit tests for composables/useDiscoverJourney.ts and
 * composables/onboardingProgress.ts - the getting-started journey a new
 * company meets, and the count shown in the topbar.
 *
 *   node --test tests/unit/discoverJourney.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { journeyFor } from '../../composables/useDiscoverJourney.ts'
import { onboardingProgress, showProgressPill } from '../../composables/onboardingProgress.ts'

const INDUSTRIES = ['social_welfare', 'dental', 'employment_services', null, 'an_industry_without_a_journey']

const steps = journey => journey.flatMap(g => g.steps)

describe('journeyFor', () => {
    test('every journey starts with importing from the old system', () => {
        for (const industry of INDUSTRIES) {
            const [first] = journeyFor(industry)
            assert.equal(first.key, 'migration', String(industry))
            assert.deepEqual(first.steps.map(s => s.key), ['import'])
        }
    })

    test('the import step is done once the company has people of its own', () => {
        for (const industry of INDUSTRIES) {
            const importStep = steps(journeyFor(industry)).find(s => s.key === 'import')
            assert.equal(importStep.doneKey, 'citizens', String(industry))
        }
    })

    test('every journey asks for a first journal note, once, after its people', () => {
        for (const industry of INDUSTRIES) {
            const all = steps(journeyFor(industry))
            const firstNotes = all.filter(s => s.key === 'firstNote')
            assert.equal(firstNotes.length, 1, String(industry))
            assert.equal(firstNotes[0].route, '/overview?action=new-note')

            const peopleIndex = all.findIndex(s => s.key === 'citizens' || s.key === 'patients')
            assert.ok(all.indexOf(firstNotes[0]) > peopleIndex, `${industry}: note before people`)
        }
    })

    test('an unknown or missing industry gets the neutral journey', () => {
        assert.equal(journeyFor(null), journeyFor('an_industry_without_a_journey'))
        assert.notEqual(journeyFor('dental'), journeyFor(null))
    })

    test('every step has a title, description and button in all four languages', () => {
        const root = path.resolve(import.meta.dirname, '../..')
        const missing = []
        for (const lang of ['dk', 'en', 'no', 'sv']) {
            const discover = JSON.parse(fs.readFileSync(path.join(root, 'lang', `${lang}.json`), 'utf8')).discover
            for (const industry of INDUSTRIES) {
                for (const step of steps(journeyFor(industry))) {
                    for (const field of ['title', 'desc', 'cta']) {
                        if (!discover.steps?.[step.key]?.[field]) missing.push(`${lang}: discover.steps.${step.key}.${field}`)
                    }
                }
            }
            if (!discover.pill?.includes('{done}') || !discover.pill?.includes('{total}')) missing.push(`${lang}: discover.pill`)
        }
        assert.deepEqual([...new Set(missing)], [])
    })
})

describe('onboardingProgress', () => {
    test('counts done steps out of all steps', () => {
        assert.deepEqual(onboardingProgress([{ key: 'a', done: true }, { key: 'b', done: false }]), { done: 1, total: 2 })
    })
    test('no checklist counts as nothing', () => {
        assert.deepEqual(onboardingProgress(null), { done: 0, total: 0 })
        assert.deepEqual(onboardingProgress(undefined), { done: 0, total: 0 })
        assert.deepEqual(onboardingProgress({}), { done: 0, total: 0 })
    })
    test('only a literal true counts as done', () => {
        assert.equal(onboardingProgress([{ key: 'a', done: 'yes' }, { key: 'b', done: 1 }]).done, 0)
    })
})

describe('showProgressPill', () => {
    const open = [{ key: 'citizens_added', done: false }, { key: 'journal_note_written', done: true }]
    const base = { isAdmin: true, discoverCompleted: false, steps: open, path: '/overview' }

    test('an admin with steps left sees it', () => {
        assert.equal(showProgressPill(base), true)
    })
    test('staff below admin never see it', () => {
        assert.equal(showProgressPill({ ...base, isAdmin: false }), false)
    })
    test('it leaves once every step is done', () => {
        assert.equal(showProgressPill({ ...base, steps: open.map(s => ({ ...s, done: true })) }), false)
    })
    test('it leaves once the Discover journey is completed', () => {
        assert.equal(showProgressPill({ ...base, discoverCompleted: true }), false)
    })
    test('it is not shown on /discover, which has its own progress', () => {
        assert.equal(showProgressPill({ ...base, path: '/discover' }), false)
    })
    test('an older backend without a checklist shows nothing', () => {
        assert.equal(showProgressPill({ ...base, steps: [] }), false)
        assert.equal(showProgressPill({ ...base, steps: null }), false)
    })
})
