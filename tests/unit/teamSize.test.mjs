/**
 * Unit tests for composables/teamSize.ts - "How many are you?" on /discover.
 *
 *   node --test tests/unit/teamSize.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { TEAM_SIZES, isTeamSize, journeyForTeam, recommendedPlan } from '../../composables/teamSize.ts'
import { journeyFor } from '../../composables/useDiscoverJourney.ts'

const keys = groups => groups.map(g => g.key)

describe('team size', () => {
    test('one person stays free; 2-4 fits Basis; 5 or more needs Pro', () => {
        assert.equal(recommendedPlan('solo'), null)
        assert.equal(recommendedPlan('2-4'), 'basis')
        assert.equal(recommendedPlan('5-10'), 'pro')
        assert.equal(recommendedPlan('11+'), 'pro')
        assert.equal(recommendedPlan(null), null)
    })

    test('only the four answers count', () => {
        assert.ok(isTeamSize('11+'))
        assert.equal(isTeamSize('200'), false)
        assert.equal(isTeamSize(undefined), false)
    })

    test('someone alone is not asked to invite colleagues or roster shifts', () => {
        for (const industry of ['therapy', 'health', 'dental', 'social_welfare', null]) {
            const solo = keys(journeyForTeam(journeyFor(industry), 'solo'))
            assert.ok(!solo.includes('komIGang'), String(industry))
            assert.ok(!solo.includes('vagtplan'), String(industry))
            assert.ok(solo.includes('migration'), String(industry))
        }
    })

    test('a bigger team meets the team set-up right after people and import', () => {
        const big = keys(journeyForTeam(journeyFor('therapy'), '11+'))
        assert.deepEqual(big.slice(0, 3), ['people', 'migration', 'komIGang'])
        assert.equal(big.length, journeyFor('therapy').length)
    })

    test('a small team and no answer keep the journey as it is', () => {
        assert.deepEqual(journeyForTeam(journeyFor('dental'), '2-4'), journeyFor('dental'))
        assert.deepEqual(journeyForTeam(journeyFor('dental'), null), journeyFor('dental'))
    })

    test('every text exists in all four languages', () => {
        const root = path.resolve(import.meta.dirname, '../..')
        for (const lang of ['dk', 'en', 'no', 'sv']) {
            const t = JSON.parse(fs.readFileSync(path.join(root, 'lang', `${lang}.json`), 'utf8')).teamSize
            for (const size of TEAM_SIZES) assert.ok(t.options[size], `${lang} ${size}`)
            for (const plan of ['basis', 'pro']) assert.ok(t.plan[plan].title && t.plan[plan].desc.includes('{size}'), `${lang} ${plan}`)
            for (const key of ['title', 'desc', 'skip', 'thanks']) assert.ok(t[key], `${lang} ${key}`)
        }
    })
})
