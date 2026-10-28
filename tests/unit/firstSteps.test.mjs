/**
 * Unit tests for composables/firstSteps.ts - the first-steps guide a new
 * colleague meets on My day and a new admin meets on Discover.
 *
 *   node --test tests/unit/firstSteps.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { firstSteps, startIndex, stepDone, FIRST_STEP_KEYS } from '../../composables/firstSteps.ts'
import { welcomeTourMode } from '../../composables/welcomeTour.ts'

const done = (...keys) => keys.map(key => ({ key, done: true }))

describe('firstSteps', () => {
    test('staff get their citizens, a first note and where the day is, in that order', () => {
        assert.deepEqual(firstSteps('staff').map(s => s.key), ['citizens', 'note', 'day'])
    })

    test('an admin sets up modules, a first citizen, a first note and colleagues', () => {
        assert.deepEqual(firstSteps('admin').map(s => s.key), ['modules', 'firstCitizen', 'note', 'colleagues'])
    })

    test('a step is done by any of its checklist keys, and only when the checklist says so', () => {
        const citizen = firstSteps('admin').find(s => s.key === 'firstCitizen')
        assert.equal(stepDone(citizen, done('clients_added')), true)
        assert.equal(stepDone(citizen, done('citizens_added')), true)
        assert.equal(stepDone(citizen, [{ key: 'citizens_added', done: false }]), false)
        assert.equal(stepDone(citizen, null), false)
        // Orientation steps have no checklist key and never count as done.
        assert.equal(stepDone(firstSteps('staff')[0], done('journal_note_written')), false)
    })
})

describe('startIndex', () => {
    test('a new colleague starts at the beginning', () => {
        assert.equal(startIndex(firstSteps('staff'), []), 0)
        assert.equal(startIndex(firstSteps('staff'), null), 0)
    })

    test('the guide skips nothing a new admin has not done, and opens at the last step when all is done', () => {
        const admin = firstSteps('admin')
        assert.equal(startIndex(admin, done('clients_added')), 0)
        const allDone = { ...admin[0], doneBy: ['x'] }
        assert.equal(startIndex([allDone], done('x')), 0)
    })
})

describe('when the guide shows', () => {
    test('only while the welcome marker is unset and the backend knows a route', () => {
        assert.equal(welcomeTourMode({ tours_seen: { welcome_web: null }, tour_route: 'staff' }), 'tour')
        assert.equal(welcomeTourMode({ tours_seen: { welcome_web: '2026-10-28' }, tour_route: 'staff' }), 'none')
        assert.equal(welcomeTourMode({ tours_seen: { welcome_web: null }, tour_route: null }), 'none')
    })
})

test('every step has a title and description, and every step with an action a button, in all four languages', () => {
    const root = path.resolve(import.meta.dirname, '../..')
    const withAction = { staff: ['note', 'day'], admin: ['modules', 'firstCitizen', 'note', 'colleagues'] }
    const missing = []
    for (const lang of ['dk', 'en', 'no', 'sv']) {
        const fsJson = JSON.parse(fs.readFileSync(path.join(root, 'lang', `${lang}.json`), 'utf8')).firstSteps
        for (const key of ['label', 'skip', 'progress', 'noCitizens', 'done', 'later', 'next', 'finish', 'back']) {
            if (!fsJson?.[key]) missing.push(`${lang}: firstSteps.${key}`)
        }
        for (const role of ['staff', 'admin']) {
            for (const key of FIRST_STEP_KEYS[role]) {
                for (const field of ['title', 'desc', ...(withAction[role].includes(key) ? ['cta'] : [])]) {
                    if (!fsJson?.[role]?.[key]?.[field]) missing.push(`${lang}: firstSteps.${role}.${key}.${field}`)
                }
            }
        }
    }
    assert.deepEqual(missing, [])
})
