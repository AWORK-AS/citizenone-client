/**
 * Unit tests for utils/meetings.ts (CitizenOne Online Meetings).
 *
 *   node --test tests/unit/meetingsUtils.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

const { formatFileSize, sharedFileName, initials } = await import('../../utils/meetings.ts')

describe('formatFileSize', () => {
    test('uses bytes, kilobytes and megabytes', () => {
        assert.equal(formatFileSize(12), '12 B')
        assert.equal(formatFileSize(1024), '1 KB')
        assert.equal(formatFileSize(840 * 1024), '840 KB')
        assert.equal(formatFileSize(1.5 * 1024 * 1024), '1.5 MB')
    })

    test('is empty for nonsense', () => {
        assert.equal(formatFileSize(-1), '')
        assert.equal(formatFileSize(Number.NaN), '')
    })
})

describe('sharedFileName', () => {
    test('adds the stored extension to a name without one', () => {
        assert.equal(sharedFileName('Handleplan', 'https://files.test/abc/handleplan-123.pdf?sig=x'), 'Handleplan.pdf')
    })

    test('keeps a name that already has an extension', () => {
        assert.equal(sharedFileName('Referat.docx', 'https://files.test/x.pdf'), 'Referat.docx')
    })

    test('does not invent an extension from a URL without one', () => {
        assert.equal(sharedFileName('Notat', 'https://files.test/download/42'), 'Notat')
        assert.equal(sharedFileName('Notat', null), 'Notat')
    })

    test('falls back to a name when there is none', () => {
        assert.equal(sharedFileName('', 'https://files.test/a.png'), 'file.png')
        assert.equal(sharedFileName(undefined, undefined), 'file')
    })
})

describe('initials', () => {
    test('takes the first letters of the first two names', () => {
        assert.equal(initials('Birte Borger Hansen'), 'BB')
        assert.equal(initials('kim'), 'K')
    })

    test('shows a question mark for no name', () => {
        assert.equal(initials(''), '?')
        assert.equal(initials(null), '?')
    })
})
