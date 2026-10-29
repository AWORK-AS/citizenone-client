/**
 * Unit tests for composables/discoverNextStep.ts - the one step Discover asks a
 * new company to take next.
 *
 *   node --test tests/unit/discoverNextStep.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { nextStep, NEXT_STEP_KEYS } from '../../composables/discoverNextStep.ts'

const clinic = (done = {}) => ['services_created', 'online_booking_enabled', 'clients_added', 'journal_note_written', 'colleagues_invited']
    .map(key => ({ key, done: !!done[key] }))

describe('nextStep', () => {
    test('a new clinic starts with its first client, not with booking setup', () => {
        assert.deepEqual(nextStep(clinic()), { key: 'clients_added', route: '/citizens/new' })
    })

    test('the first note comes right after the first client', () => {
        assert.deepEqual(nextStep(clinic({ clients_added: true })), { key: 'journal_note_written', route: '/overview?action=new-note' })
    })

    test('then the rest in the order the backend lists them', () => {
        assert.equal(nextStep(clinic({ clients_added: true, journal_note_written: true })).key, 'services_created')
    })

    test('a care home starts with its first citizen', () => {
        const steps = [{ key: 'citizens_added', done: false }, { key: 'colleagues_invited', done: false }]
        assert.equal(nextStep(steps).key, 'citizens_added')
    })

    test('nothing when everything is done, nothing is known or there is no checklist', () => {
        assert.equal(nextStep(clinic(Object.fromEntries(clinic().map(s => [s.key, true])))), null)
        assert.equal(nextStep([{ key: 'a_future_step', done: false }]), null)
        assert.equal(nextStep(null), null)
        assert.equal(nextStep(undefined), null)
    })

    test('every step it can show has a label, title, description and button in all four languages', () => {
        const root = path.resolve(import.meta.dirname, '../..')
        const missing = []
        for (const lang of ['dk', 'en', 'no', 'sv']) {
            const next = JSON.parse(fs.readFileSync(path.join(root, 'lang', `${lang}.json`), 'utf8')).discover?.next
            if (!next?.label) missing.push(`${lang}: discover.next.label`)
            for (const key of NEXT_STEP_KEYS) {
                for (const field of ['title', 'desc', 'cta']) {
                    if (!next?.[key]?.[field]) missing.push(`${lang}: discover.next.${key}.${field}`)
                }
            }
        }
        assert.deepEqual(missing, [])
    })
})
