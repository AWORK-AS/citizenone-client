/**
 * isAtLeast('Superadmin') used to be true for every user: ROLE_LEVELS had no
 * Superadmin key and the lookup fell back to 0. Same bug the backend fixed in
 * App\Models\User, regression-tested in tests/Unit/UserIsAtLeastTest.php.
 *
 *   node --test tests/unit/roleLevels.test.mjs
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { roleThreshold, ROLE_LEVELS } from '../../composables/roleLevels.ts'

const atLeast = (level, role) => level >= roleThreshold(role)

test('Superadmin needs level 100', () => {
    assert.equal(roleThreshold('Superadmin'), 100)
    assert.equal(atLeast(80, 'Superadmin'), false)
    assert.equal(atLeast(0, 'Superadmin'), false)
    assert.equal(atLeast(100, 'Superadmin'), true)
})

test('known thresholds match the backend', () => {
    assert.deepEqual(ROLE_LEVELS, { Superadmin: 100, Admin: 80, Manager: 50, User: 20 })
})

test('an unknown role name denies instead of granting', () => {
    assert.equal(atLeast(100, 'Nonsense'), false)
})
