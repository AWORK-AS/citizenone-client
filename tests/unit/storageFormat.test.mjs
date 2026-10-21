/**
 *   node --test tests/unit/storageFormat.test.mjs
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatStorage, formatStorageUsed, formatQuotaGb, storageLocale } from '../../composables/storageFormat.ts'

const MB = 1024 ** 2
const GB = 1024 ** 3

test('zero and bad input show 0 MB', () => {
    assert.equal(formatStorage(0), '0 MB')
    assert.equal(formatStorage(null), '0 MB')
    assert.equal(formatStorage(undefined), '0 MB')
    assert.equal(formatStorage(-5), '0 MB')
})

test('under 1 MB is "<1 MB"', () => {
    assert.equal(formatStorage(500 * 1024), '<1 MB')
})

test('below 1 GB is whole megabytes', () => {
    assert.equal(formatStorage(16 * MB), '16 MB')
    assert.equal(formatStorage(16.4 * MB), '16 MB')
    assert.equal(formatStorage(999 * MB), '999 MB')
})

test('from 1 GB it is gigabytes with up to two decimals, Danish comma', () => {
    assert.equal(formatStorage(GB), '1 GB')
    assert.equal(formatStorage(2.5 * GB), '2,5 GB')
    assert.equal(formatStorage(2.5 * GB, 'en-GB'), '2.5 GB')
    assert.equal(formatStorage(1.234 * GB), '1,23 GB')
})

test('a small account moves visibly between 10 MB steps', () => {
    assert.notEqual(formatStorage(20 * MB), formatStorage(23 * MB))
})

test('formatStorageUsed prefers bytes and falls back to GB', () => {
    assert.equal(formatStorageUsed(16 * MB, 0.02), '16 MB')
    assert.equal(formatStorageUsed(undefined, 0.02), '0,02 GB')
    assert.equal(formatStorageUsed(null, 1.5), '1,5 GB')
    assert.equal(formatStorageUsed(0, 0), '0 MB')
})

test('quota stays in GB and locale codes map to tags', () => {
    assert.equal(formatQuotaGb(5), '5 GB')
    assert.equal(storageLocale('dk'), 'da-DK')
    assert.equal(storageLocale('en'), 'en-GB')
})
