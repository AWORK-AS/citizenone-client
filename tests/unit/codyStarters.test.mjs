import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { starterMode } from '../../composables/codyStarters.ts'

describe('starterMode', () => {
    it('sends complete prompts at once', () => {
        assert.equal(starterMode('Giv mig et overblik over min dag'), 'send')
        assert.equal(starterMode('What shifts do I have in the next seven days?'), 'send')
    })
    it('fills prompts that stop mid-sentence', () => {
        assert.equal(starterMode('Skriv et journalnotat for '), 'fill')
        assert.equal(starterMode('Find the attached files about '), 'fill')
    })
    it('classifies the real starters the same way in every language', () => {
        const modes = {}
        for (const l of ['dk', 'en', 'sv', 'no']) {
            const q = JSON.parse(readFileSync(new URL(`../../lang/${l}.json`, import.meta.url))).assistants.quickPrompts
            modes[l] = Object.fromEntries(Object.entries(q).map(([k, v]) => [k, starterMode(v)]))
        }
        for (const l of ['en', 'sv', 'no']) assert.deepEqual(modes[l], modes.dk)
        assert.deepEqual(modes.dk, { overview: 'send', journal: 'fill', files: 'fill', shifts: 'send' })
    })
})
