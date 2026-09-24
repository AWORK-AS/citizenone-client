/**
 * Unit tests for utils/avatar.ts -- the initials avatar that replaced the
 * calls to ui-avatars.com, which sent every name on screen to a third party.
 *
 *   node --test tests/unit/avatar.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const { avatarInitials, avatarUrl } = await import('../../utils/avatar.ts')

describe('avatarInitials', () => {
    test('first and last name', () => {
        assert.equal(avatarInitials('Louise Jensen'), 'LJ')
    })

    test('middle names are skipped', () => {
        assert.equal(avatarInitials('Anne Marie Holm Nielsen'), 'AN')
    })

    test('Danish letters survive', () => {
        assert.equal(avatarInitials('øjvind ærø'), 'ØÆ')
    })

    test('one word gives one letter', () => {
        assert.equal(avatarInitials('Madsen'), 'M')
    })

    test('a name concatenated from missing fields is no name', () => {
        assert.equal(avatarInitials('undefined undefined'), '?')
        assert.equal(avatarInitials('Louise undefined'), 'L')
        assert.equal(avatarInitials(null), '?')
        assert.equal(avatarInitials(''), '?')
    })

    test('the old URL separators split words', () => {
        assert.equal(avatarInitials('Louise+Jensen'), 'LJ')
    })

    test('an email address uses the mailbox part', () => {
        assert.equal(avatarInitials('jens.jensen@example.dk'), 'JJ')
        assert.equal(avatarInitials('mail@example.dk'), 'M')
    })
})

describe('avatarUrl', () => {
    test('is a local data URI, never a network request', () => {
        const url = avatarUrl('Louise Jensen')
        assert.match(url, /^data:image\/svg\+xml;charset=utf-8,/)
        assert.ok(!url.includes('Louise'), 'the full name must not be in the image')
    })

    test('markup in a name is escaped', () => {
        const svg = decodeURIComponent(avatarUrl('<b> &x').split(',')[1])
        assert.ok(!svg.includes('<b>'))
    })
})

describe('no third-party avatar service', () => {
    test('ui-avatars.com is not called anywhere in the app', () => {
        const hits = []
        const walk = (dir) => {
            for (const entry of readdirSync(dir)) {
                const path = join(dir, entry)
                if (statSync(path).isDirectory()) walk(path)
                else if (/\.(vue|ts|js)$/.test(entry) && readFileSync(path, 'utf8').includes('ui-avatars.com')) hits.push(path)
            }
        }
        for (const dir of ['pages', 'components', 'layouts', 'composables', 'store']) walk(dir)
        assert.deepEqual(hits, [])
    })
})
