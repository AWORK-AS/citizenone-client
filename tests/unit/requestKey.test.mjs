/**
 * BaseAPIService merges identical requests in flight at the same time. An upload must never be
 * merged: two FormData bodies both stringify to "{}", so the second upload used to be dropped.
 *
 *   node --test tests/unit/requestKey.test.mjs
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { requestKey } from '../../composables/requestKey.ts'

test('identical JSON bodies share a key, different ones do not', () => {
    assert.equal(requestKey('POST', '/a', { x: 1 }), requestKey('POST', '/a', { x: 1 }))
    assert.notEqual(requestKey('POST', '/a', { x: 1 }), requestKey('POST', '/a', { x: 2 }))
})

test('two different uploads to the same endpoint are never given a shared key', () => {
    const first = new FormData()
    first.append('image', new Blob(['first']), 'first.png')
    const second = new FormData()
    second.append('image', new Blob(['second']), 'second.png')

    assert.equal(JSON.stringify(first), JSON.stringify(second), 'the trap: both stringify to the same thing')
    assert.equal(requestKey('POST', '/upload', first), null)
    assert.equal(requestKey('POST', '/upload', second), null)
    assert.equal(requestKey('POST', '/upload', new Blob(['x'])), null)
})

test('BaseAPIService sends a body without a key on its own', () => {
    const source = fs.readFileSync(path.resolve(import.meta.dirname, '../../components/api/BaseAPIService.ts'), 'utf8')
    assert.ok(source.includes('requestKey(method, url, params)'))
    assert.ok(!source.includes('const key = `${method}:${url}:${JSON.stringify(params)}`'))
    assert.ok(source.includes('if (sharedKey === null) {'))
})
