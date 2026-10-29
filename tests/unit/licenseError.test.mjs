/**
 * Unit tests for utils/licenseError.ts.
 *
 *   node --test tests/unit/licenseError.test.mjs
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isNoUserLicense } from '../../utils/licenseError.ts'

test('recognised by code, and by any language of the old text', () => {
    assert.equal(isNoUserLicense({ code: 'no_user_license', message: 'whatever' }), true)
    assert.equal(isNoUserLicense({ message: 'Du har ingen tilgængelig brugerlisens.' }), true)
    assert.equal(isNoUserLicense({ message: 'You have no available user license.' }), true)
})

test('anything else is not a license error', () => {
    assert.equal(isNoUserLicense({ message: 'Validation failed.' }), false)
    assert.equal(isNoUserLicense(null), false)
})
