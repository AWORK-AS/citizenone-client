/**
 * What the support chat (Milo) is told about whether the company has Cody.
 *
 *   node --test tests/unit/obiyenChatAttributes.test.mjs
 */
import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { attributesKnownFromUser, obiyenChatAttributes } from '../../composables/obiyenChatAttributes.ts'

const root = path.resolve(import.meta.dirname, '../..')
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')

describe('has_cody', () => {
    test('a user with their own Cody access has it, without asking the server', () => {
        assert.deepEqual(obiyenChatAttributes({ has_ai_access: true }, null), { has_cody: true })
        assert.equal(attributesKnownFromUser({ has_ai_access: true }), true)
    })

    test('a user without a seat in a company that has Cody has it too', () => {
        assert.equal(attributesKnownFromUser({ has_ai_access: false }), false)
        assert.deepEqual(obiyenChatAttributes({ has_ai_access: false }, { company_has_cody: true, has_access: false }), { has_cody: true })
    })

    test('a company without Cody, or no answer at all, is false and never missing', () => {
        assert.deepEqual(obiyenChatAttributes({ has_ai_access: false }, { company_has_cody: false, has_access: false }), { has_cody: false })
        assert.deepEqual(obiyenChatAttributes(null, null), { has_cody: false })
        assert.deepEqual(obiyenChatAttributes({}, undefined), { has_cody: false })
    })
})

describe('the claim handed to the widget', () => {
    const source = read('composables/useObiyenChat.ts')

    test('carries the attributes next to the signed identity', () => {
        assert.match(source, /attributes: await chatAttributes\(\),/)
        assert.match(source, /return obiyenChatAttributes\(user, await codyStatusPromise\)/)
    })

    test('looks the company up once per page load and forgets it on logout', () => {
        assert.match(source, /if \(!codyStatusPromise\) \{/)
        assert.match(source, /codyAdoptionService\.getStatus\(\)\.catch\(\(\) => null\)/)
        assert.match(source, /identityPromise = null\n\s+codyStatusPromise = null/)
    })
})
