/**
 * Unit tests for utils/scheduleEmailPreference.ts - the duty schedule's
 * "Send email on changes" switch (AW-2026-10212).
 *
 *   node --test tests/unit/scheduleEmailPreference.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { emailOnChangesKey, readEmailOnChanges, writeEmailOnChanges } from '../../utils/scheduleEmailPreference.ts'

function memoryStorage() {
    const data = new Map()
    return {
        getItem: (key) => (data.has(key) ? data.get(key) : null),
        setItem: (key, value) => { data.set(key, String(value)) },
        data,
    }
}

const blocked = {
    getItem: () => { throw new Error('SecurityError') },
    setItem: () => { throw new Error('QuotaExceededError') },
}

describe('schedule email preference', () => {
    test('is on by default, as before the switch existed', () => {
        assert.equal(readEmailOnChanges(memoryStorage(), 'user-a'), true)
        assert.equal(readEmailOnChanges(null, 'user-a'), true)
        assert.equal(readEmailOnChanges(undefined, 'user-a'), true)
    })

    test('remembers off, and on again', () => {
        const storage = memoryStorage()
        writeEmailOnChanges(storage, 'user-a', false)
        assert.equal(readEmailOnChanges(storage, 'user-a'), false)
        writeEmailOnChanges(storage, 'user-a', true)
        assert.equal(readEmailOnChanges(storage, 'user-a'), true)
    })

    test('blocked storage counts as on and never throws', () => {
        assert.equal(readEmailOnChanges(blocked, 'user-a'), true)
        assert.doesNotThrow(() => writeEmailOnChanges(blocked, 'user-a', false))
    })

    test('each user has their own choice', () => {
        const storage = memoryStorage()
        writeEmailOnChanges(storage, 'user-a', false)
        assert.equal(readEmailOnChanges(storage, 'user-a'), false)
        assert.equal(readEmailOnChanges(storage, 'user-b'), true)
        assert.equal(emailOnChangesKey('user-a'), 'schedule_email_on_changes:user-a')
        assert.deepEqual([...storage.data.keys()], ['schedule_email_on_changes:user-a'])
    })

    test('an unexpected stored value counts as on', () => {
        const storage = memoryStorage()
        storage.setItem(emailOnChangesKey('user-a'), 'false')
        assert.equal(readEmailOnChanges(storage, 'user-a'), true)
    })
})
