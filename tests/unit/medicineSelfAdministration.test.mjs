/**
 * Unit tests for composables/medicineSelfAdministration.ts (task #115): a
 * self-administered medicine only needs handing out, so its doses default to
 * "delivered" (Udleveret) unless the company has switched that status off.
 *
 *   node --test tests/unit/medicineSelfAdministration.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { medicineSelfAdministration } from '../../composables/medicineSelfAdministration.ts'

const { defaultDoseType, isDeliveredAllowed } = medicineSelfAdministration()

describe('defaultDoseType', () => {
    test('a self-administered medicine is handed out', () => {
        assert.equal(defaultDoseType({ is_self_administered: true }, null), 'delivered')
        assert.equal(defaultDoseType({ is_self_administered: 1 }, { given: true, delivered: true }), 'delivered')
    })

    test('any other medicine is given', () => {
        assert.equal(defaultDoseType({ is_self_administered: false }, null), 'given')
        assert.equal(defaultDoseType(null, null), 'given')
    })

    test('falls back to given when the company has switched "delivered" off', () => {
        assert.equal(defaultDoseType({ is_self_administered: true }, { given: true, delivered: false }), 'given')
    })
})

describe('isDeliveredAllowed', () => {
    test('allowed unless explicitly switched off', () => {
        assert.equal(isDeliveredAllowed(undefined), true)
        assert.equal(isDeliveredAllowed({}), true)
        assert.equal(isDeliveredAllowed({ delivered: false }), false)
    })
})
