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
        assert.deepEqual(modes.dk, {
            overview: 'send', journal: 'fill', files: 'fill', shifts: 'send',
            citizenWeek: 'send', citizenGoals: 'send', citizenNote: 'fill',
            nextShift: 'send', myTasks: 'send', newTask: 'fill', unread: 'send',
        })
    })
})

describe('startersFor', async () => {
    const { startersFor, starterGroup, STARTER_KEYS, MAX_STARTERS } = await import('../../composables/codyStarters.ts')
    const all = { hasModule: () => true, tasksEnabled: true }
    const keys = (group, access = all) => startersFor(group, access).map((s) => s.key)

    it('groups pages by what is open', () => {
        assert.equal(starterGroup('citizen_profile', 'citizens-uuid'), 'citizen')
        assert.equal(starterGroup('citizen_journals', 'citizens-uuid-journals'), 'citizen')
        assert.equal(starterGroup('citizen_list', 'citizens'), null)
        assert.equal(starterGroup('duty_schedule', 'schedules'), 'schedule')
        assert.equal(starterGroup('employee_schedule', 'employees-employee_uuid-duty-schedule'), 'schedule')
        assert.equal(starterGroup(null, 'tasks'), 'tasks')
        assert.equal(starterGroup('messages', 'messages'), 'messages')
        assert.equal(starterGroup('my_day', 'my-day'), null)
        assert.equal(starterGroup(null, ''), null)
    })
    it('offers the page its own starters first', () => {
        assert.deepEqual(keys('citizen').slice(0, 2), ['citizenWeek', 'citizenGoals'])
        assert.equal(keys('schedule')[0], 'nextShift')
        assert.deepEqual(keys('tasks').slice(0, 2), ['myTasks', 'newTask'])
        assert.equal(keys('messages')[0], 'unread')
        assert.deepEqual(keys(null), ['overview', 'journal', 'files', 'shifts'])
    })
    it('never offers more than four, or one twice', () => {
        for (const group of [null, 'citizen', 'schedule', 'tasks', 'messages', 'unknown']) {
            const k = keys(group)
            assert.ok(k.length <= MAX_STARTERS && k.length > 0)
            assert.equal(new Set(k).size, k.length)
        }
    })
    it('leaves out starters the company has no module or app for', () => {
        const noTasksApp = { hasModule: () => true, tasksEnabled: false }
        assert.ok(!keys('tasks', noTasksApp).some((k) => k === 'myTasks' || k === 'newTask'))
        const noTasksModule = { hasModule: (m) => m !== 'Tasks', tasksEnabled: true }
        assert.ok(!keys('tasks', noTasksModule).includes('myTasks'))
        const noGoals = { hasModule: (m) => m !== 'Plans and goals', tasksEnabled: true }
        assert.ok(!keys('citizen', noGoals).includes('citizenGoals'))
        const nothing = { hasModule: () => false, tasksEnabled: false }
        assert.deepEqual(keys('citizen', nothing), ['overview'])
    })
    it('has a label and a prompt for every starter in every language', () => {
        for (const l of ['dk', 'en', 'sv', 'no']) {
            const a = JSON.parse(readFileSync(new URL(`../../lang/${l}.json`, import.meta.url))).assistants
            for (const key of STARTER_KEYS) {
                assert.ok(a.quick[key], `${l}: assistants.quick.${key}`)
                assert.ok(a.quickPrompts[key], `${l}: assistants.quickPrompts.${key}`)
            }
        }
    })
})
